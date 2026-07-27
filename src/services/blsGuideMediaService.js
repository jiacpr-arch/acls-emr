import { supabase } from './supabase';

// สื่อประกอบ 3 หน้า Guide ของ BLS (AED / Algorithm / Choking) เก็บในตาราง acls_images เดียวกับ pre-course
// โดยผูกกับ "slot" สังเคราะห์ parent_id = '<page>:<key>' เช่น 'aed:1', 'algorithm:adult', 'choking:unconscious'
// และแยกชนิดด้วย parent_type:
//   - 'bls-guide-step'  → รูปภาพ (อัปโหลดไฟล์ → src = public URL)
//   - 'bls-guide-video' → วิดีโอ (src = ลิงก์ YouTube, caption = label, alt = orientation)
export const BLS_GUIDE_STEP_PARENT_TYPE = 'bls-guide-step';
export const BLS_GUIDE_VIDEO_PARENT_TYPE = 'bls-guide-video';

export function guideMediaKey(page, key) {
  return `${page}:${key}`;
}

const CACHE_KEY = 'bls_guide_media_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000; // 6 ชั่วโมง (เลียนแบบ precourseImageService)

export function invalidateBlsGuideMediaCache() {
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

// คืน { imagesByKey, videosByKey } ของสื่อ guide ทั้งหมด คีย์ด้วย parent_id (page:key)
//   imagesByKey: { [key]: [{ id, src, alt, caption }] }
//   videosByKey: { [key]: [{ id, url, label, orientation }] }
export async function fetchBlsGuideMedia({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from('acls_images')
    .select('id,parent_type,parent_id,src,alt,caption,sort_order')
    .in('parent_type', [BLS_GUIDE_STEP_PARENT_TYPE, BLS_GUIDE_VIDEO_PARENT_TYPE])
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const imagesByKey = {};
  const videosByKey = {};
  for (const row of data || []) {
    if (row.parent_type === BLS_GUIDE_VIDEO_PARENT_TYPE) {
      (videosByKey[row.parent_id] ||= []).push({
        id: row.id, url: row.src, label: row.caption || 'ดูคลิป', orientation: row.alt || 'portrait',
      });
    } else {
      (imagesByKey[row.parent_id] ||= []).push({
        id: row.id, src: row.src, alt: row.alt, caption: row.caption,
      });
    }
  }
  const result = { imagesByKey, videosByKey };
  writeCache(result);
  return result;
}

// เพิ่มวิดีโอให้ slot หนึ่ง — เก็บลิงก์ YouTube ใน src, label ใน caption, orientation ใน alt
export async function addBlsGuideVideo(key, url, { orientation = 'portrait', label = 'ดูคลิป' } = {}) {
  const { data: existing, error: countErr } = await supabase
    .from('acls_images')
    .select('sort_order')
    .eq('parent_type', BLS_GUIDE_VIDEO_PARENT_TYPE)
    .eq('parent_id', key)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('acls_images')
    .insert({
      parent_type: BLS_GUIDE_VIDEO_PARENT_TYPE,
      parent_id: key,
      src: url,
      alt: orientation,
      caption: label,
      sort_order: nextOrder,
    })
    .select()
    .single();
  if (error) throw error;
  invalidateBlsGuideMediaCache();
  return data;
}
