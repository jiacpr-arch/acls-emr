import { supabase } from './supabase';
import { IS_BLS } from '../config/courseMode';

const COURSE_FILTER = IS_BLS ? ['bls', 'both'] : ['acls', 'both'];

export async function fetchNews({ limit = 5 } = {}) {
  const { data, error } = await supabase
    .from('news')
    .select('id, title, summary, source_url, source_name, language, course, topics, published_at')
    .eq('is_active', true)
    .in('course', COURSE_FILTER)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('news fetch failed', error.message);
    return [];
  }
  return data || [];
}
