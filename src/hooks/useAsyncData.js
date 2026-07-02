import { useEffect, useState, useCallback } from 'react';

// Small async-fetch helper (same shape as useVideoLessons):
//   const { data, loading, error, reload } = useAsyncData(fetcher, deps)
// fetcher runs on mount and whenever deps change; reload() re-runs it.
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.resolve()
      .then(fetcher)
      .then(result => { if (alive) { setData(result); setError(null); } })
      .catch(err => { if (alive) setError(err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey(k => k + 1), []);

  return { data, loading, error, reload };
}
