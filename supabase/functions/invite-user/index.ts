// Edge Function Supabase : invitation d'un utilisateur par email, réservée aux admins.
// La clé service_role reste côté serveur (variable fournie automatiquement par Supabase).
import { createClient } from 'npm:@supabase/supabase-js@2';

// F1 : CORS limité au site (et au serveur de développement local)
const ALLOWED_ORIGINS = ['https://kenzaalim-interprete.fr', 'http://localhost:3000'];

// F2 : destination du lien d'invitation fixée côté serveur (jamais dérivée de l'en-tête Origin).
// Racine du site : sur GitHub Pages, /definir-mot-de-passe passerait par 404.html ; l'application
// redirige elle-même vers /definir-mot-de-passe quand l'URL contient "type=invite".
// Doit figurer dans Authentication > URL Configuration > Redirect URLs.
const REDIRECT_TO = Deno.env.get('INVITE_REDIRECT_URL') ?? 'https://kenzaalim-interprete.fr/';

const MAX_EMAIL_LENGTH = 254;

const corsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
};

Deno.serve(async (req) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1. Identifier l'appelant avec SON jeton, et vérifier qu'il est admin
  const authHeader = req.headers.get('Authorization') ?? '';
  const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: isAdmin, error: adminErr } = await asCaller.rpc('is_admin');
  if (adminErr || isAdmin !== true) return json({ error: 'Accès réservé aux administrateurs' }, 403);

  // 2. Valider l'email (F4)
  const body = await req.json().catch(() => null);
  const raw = body && typeof body === 'object' ? (body as { email?: unknown }).email : undefined;
  if (typeof raw !== 'string' || raw.length > MAX_EMAIL_LENGTH) return json({ error: 'Email invalide' }, 400);
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email invalide' }, 400);

  // 3. Envoyer l'invitation
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: REDIRECT_TO });
  if (error) {
    const already = /already|registered|exists/i.test(error.message);
    if (already) return json({ error: 'Ce compte existe déjà.' }, 409);
    // F3 : détail technique uniquement dans les logs serveur
    console.error('invite-user: échec de inviteUserByEmail', error);
    return json({ error: "L'invitation n'a pas pu être envoyée. Réessaie plus tard." }, 500);
  }

  return json({ ok: true, email });
});
