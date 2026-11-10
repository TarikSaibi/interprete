// Edge Function Supabase : invitation d'un utilisateur par email, réservée aux admins.
// La clé service_role reste côté serveur (variable fournie automatiquement par Supabase).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1. Identifier l'appelant avec SON jeton, et vérifier qu'il est admin
  const authHeader = req.headers.get('Authorization') ?? '';
  const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: isAdmin, error: adminErr } = await asCaller.rpc('is_admin');
  if (adminErr || isAdmin !== true) return json({ error: 'Accès réservé aux administrateurs' }, 403);

  // 2. Valider l'email
  let email = '';
  try {
    ({ email = '' } = await req.json());
  } catch {
    return json({ error: 'Requête invalide' }, 400);
  }
  email = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email invalide' }, 400);

  // 3. Envoyer l'invitation (le lien ramène sur le site d'origine, qui doit figurer dans les Redirect URLs)
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const origin = req.headers.get('origin') ?? undefined;
  const { error } = await admin.auth.admin.inviteUserByEmail(email, origin ? { redirectTo: origin } : undefined);
  if (error) {
    const already = /already|registered|exists/i.test(error.message);
    return json({ error: already ? 'Ce compte existe déjà.' : error.message }, already ? 409 : 400);
  }

  return json({ ok: true, email });
});
