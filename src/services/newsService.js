import { supabase } from './supabase';
import { IS_BLS } from '../config/courseMode';

const COURSE_FILTER = IS_BLS ? ['bls', 'both'] : ['acls', 'both'];

export async function fetchNews({ limit = 5, course = null, search = null, maxAgeDays = null, freshOnly = false } = {}) {
  let q = supabase
    .from('news')
    .select('id, title, summary, source_url, source_name, language, course, topics, published_at, is_evergreen')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (course && course !== 'all') {
    q = q.eq('course', course);
  } else {
    q = q.in('course', COURSE_FILTER);
  }

  // Exclude evergreen reference (guidelines, landmark research) — used by the
  // homepage card so it always surfaces genuine fresh news, never an old paper.
  if (freshOnly) {
    q = q.eq('is_evergreen', false);
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

// ข่าวสุขภาพ/AED จากฟีดสาธารณะของ jiaaed.com — แยกจากตาราง news ของเราเอง
// ทุก item ต้องลิงก์กลับไปข่าวต้นฉบับ (source_url) เพราะลิขสิทธิ์เป็นของสำนักข่าวเดิม
export async function fetchJiaAedNews(limit = 5) {
  try {
    const res = await fetch(`https://jiaaed.com/api/news/public?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.items)) return [];
    return data.items.map(n => ({
      title: n.source_title,
      summary: n.our_blurb,
      source_url: n.source_url,
      source_name: n.source_name,
      topics: n.topic ? [n.topic] : [],
      published_at: n.published_at,
    }));
  } catch (e) {
    console.warn('jiaaed news fetch failed', e?.message);
    return [];
  }
}
