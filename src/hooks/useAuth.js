import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(u => {
      if (cancelled) return;
      setUser(u);
      setLoading(false);
    });
    const unsubscribe = onAuthStateChange(u => {
      if (cancelled) return;
      setUser(u);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { user, loading, isAuthenticated: user !== null };
}
