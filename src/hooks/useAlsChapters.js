import { useEffect, useState } from 'react';
import { loadAlsChapters } from '../services/alsContentService';
import { alsChapters as staticChapters } from '../data/alsContent';

export function useAlsChapters() {
  const [chapters, setChapters] = useState(staticChapters);
  const [source, setSource] = useState('static');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadAlsChapters().then(result => {
      if (cancelled) return;
      setChapters(result.chapters);
      setSource(result.source);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { chapters, source, loading };
}
