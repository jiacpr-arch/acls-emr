import { supabase } from './supabase';

// รูปประกอบบทเรียน pre-course เก็บในตาราง acls_images เดียวกับ ALS
// แต่ใช้ parent_type = 'precourse-step' และ parent_id = id ของ read step (เช่น 'pc01-r0')
export const PRECOURSE_IMAGE_PARENT_TYPE = 'precourse-step';

const CACHE_KEY = 'precourse_images_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000; // 6 ชั่วโมง (เลียนแบบ ALS content cache)

export function invalidatePreCourseImageCache() {
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

// คืน map { [stepId]: [{ id, src, alt, caption }] } ของรูป pre-course ทั้งหมด
// force: true เพื่อข้าม cache (ใช้ในหน้าแอดมินหลังอัปโหลด/แก้/ลบ)
export async function fetchPreCourseImages({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from('acls_images')
    .select('id,parent_id,src,alt,caption,sort_order')
    .eq('parent_type', PRECOURSE_IMAGE_PARENT_TYPE)
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const map = {};
  for (const row of data || []) {
    (map[row.parent_id] ||= []).push({
      id: row.id, src: row.src, alt: row.alt, caption: row.caption,
    });
  }
  writeCache(map);
  return map;
}
