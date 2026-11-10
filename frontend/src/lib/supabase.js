import { createClient } from '@supabase/supabase-js';

// Variables injectées au build (CRA) : voir frontend/.env.example
// La clé "anon" est publique par conception ; la sécurité repose sur les règles RLS (supabase/migrations).
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Lien reçu par email (invitation / mot de passe oublié) : Supabase renvoie vers le site avec
// "#access_token=...&type=invite|recovery". On mémorise le type AVANT que le client ne nettoie l'URL.
export const authLinkType =
  typeof window !== 'undefined' ? /[#&]type=(invite|recovery)\b/.exec(window.location.hash)?.[1] ?? null : null;

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

// Déconnexion puis retour à la page de connexion du calculateur (rechargement complet = état remis à zéro)
export async function signOutAndRedirect() {
  try {
    await supabase?.auth.signOut();
  } finally {
    window.location.assign('/calculateur-ca');
  }
}
