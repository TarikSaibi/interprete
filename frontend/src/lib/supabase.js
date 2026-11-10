import { createClient } from '@supabase/supabase-js';

// Variables injectées au build (CRA) : voir frontend/.env.example
// La clé "anon" est publique par conception ; la sécurité repose sur les règles RLS (supabase/migrations).
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
