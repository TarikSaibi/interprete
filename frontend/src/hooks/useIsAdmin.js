import { useEffect, useState } from 'react';
import { fetchIsAdmin } from '@/lib/missionsApi';

// true / false, ou undefined pendant la vérification
export function useIsAdmin(session) {
  const [isAdmin, setIsAdmin] = useState(undefined);
  const sessionLoaded = session !== undefined;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!sessionLoaded) return undefined;
    if (!userId) {
      setIsAdmin(false);
      return undefined;
    }
    let cancelled = false;
    setIsAdmin(undefined);
    fetchIsAdmin().then((v) => !cancelled && setIsAdmin(v));
    return () => {
      cancelled = true;
    };
  }, [sessionLoaded, userId]);

  return isAdmin;
}
