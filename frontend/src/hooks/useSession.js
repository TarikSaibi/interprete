import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Session Supabase courante (null si déconnecté, undefined pendant le chargement)
export function useSession() {
  const [session, setSession] = useState(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}
