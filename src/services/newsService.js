import { supabase } from './supabase';
import { IS_BLS } from '../config/courseMode';

const COURSE_FILTER = IS_BLS ? ['bls', 'both'] : ['acls', 'both'];

export async function fetchNews({ limit = 5, course = null, search = null, maxAgeDays = null } = {}) {
  let q = supabase
    .from('news')
    .select('id, title, summary, source_url, source_name, language, course, topics, published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (course && course !== 'all') {
    q = q.eq('course', course);
  } else {
    q = q.in('course', COURSE_FILTER);
  }

  // Hide stale items — used by the compact NewsCard so the homepage never
  // surfaces months-old news as "ข่าวล่าสุด". The full /news page omits this.
  if (maxAgeDays != null) {
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();
    q = q.gte('published_at', cutoff);
  }

  if (search) {
    q = q.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.warn('news fetch failed', error.message);
    return [];
  }
  return data || [];
}
