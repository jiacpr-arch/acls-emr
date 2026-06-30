import { supabase } from './supabase';

// อ่าน "วิดีโอบทเรียน" จาก Supabase (public read) + cache 6 ชม. เลียนแบบ precourseImageService
const CACHE_KEY = 'video_lessons_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000;

export function invalidateVideoLessonsCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null;
    return data;
  } catch { return null; }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
}

// map row (snake_case) → object (camelCase) ที่ฝั่ง UI ใช้
export function mapVideoLessonRow(row) {
  return {
    id: row.id,
    topic: row.topic,
    title: row.title,
    youtubeId: row.youtube_id,
    orientation: row.orientation || 'portrait',
    startSec: row.start_sec ?? null,
    endSec: row.end_sec ?? null,
    required: row.required !== false,
    keyPoints: row.key_points || '',
    chapters: Array.isArray(row.chapters) ? row.chapters : [],
    quiz: Array.isArray(row.quiz) ? row.quiz : [],
    relatedPath: row.related_path || '',
    relatedLabel: row.related_label || '',
    sortOrder: row.sort_order ?? 0,
  };
}

// คืน array ของวิดีโอทั้งหมด เรียงตาม topic + sort_order
// force: true ข้าม cache (ใช้ในแอดมินหลังแก้)
export async function fetchVideoLessons({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from('video_lessons')
    .select('*')
    .order('topic', { ascending: true })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  const mapped = (data || []).map(mapVideoLessonRow);
  writeCache(mapped);
  return mapped;
}

// จัดกลุ่มตาม topic → { [topicId]: VideoLesson[] }
export function groupByTopic(lessons) {
  const map = {};
  for (const l of lessons) (map[l.topic] ||= []).push(l);
  return map;
}
