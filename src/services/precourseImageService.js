import { supabase } from './supabase';

// สื่อประกอบบทเรียน pre-course เก็บในตาราง acls_images เดียวกับ ALS โดยผูกกับ read step
// (parent_id = id ของ read step เช่น 'pc01-r0') และแยกชนิดด้วย parent_type:
//   - 'precourse-step'  → รูปภาพ (อัปโหลดไฟล์ → src = public URL)
//   - 'precourse-video' → วิดีโอ (src = ลิงก์ YouTube, caption = label, alt = orientation)
// การเก็บวิดีโอใน acls_images ทำให้ใช้ updateImage/deleteImage เดิมร่วมกันได้ ไม่ต้องสร้างตารางใหม่
export const PRECOURSE_STEP_PARENT_TYPE = 'precourse-step';
export const PRECOURSE_VIDEO_PARENT_TYPE = 'precourse-video';

const CACHE_KEY = 'precourse_media_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000; // 6 ชั่วโมง (เลียนแบบ ALS content cache)

export function invalidatePreCourseMediaCache() {
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

// คืน { imagesByStep, videosByStep } ของสื่อ pre-course ทั้งหมด คีย์ด้วย step id
//   imagesByStep: { [stepId]: [{ id, src, alt, caption }] }
//   videosByStep: { [stepId]: [{ id, url, label, orientation }] }
// force: true เพื่อข้าม cache (ใช้ในหน้าแอดมินหลังเพิ่ม/แก้/ลบ)
export async function fetchPreCourseMedia({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  const { data, error } = await supabase
    .from('acls_images')
    .select('id,parent_type,parent_id,src,alt,caption,sort_order')
    .in('parent_type', [PRECOURSE_STEP_PARENT_TYPE, PRECOURSE_VIDEO_PARENT_TYPE])
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const imagesByStep = {};
  const videosByStep = {};
  for (const row of data || []) {
    if (row.parent_type === PRECOURSE_VIDEO_PARENT_TYPE) {
      (videosByStep[row.parent_id] ||= []).push({
        id: row.id, url: row.src, label: row.caption || 'ดูคลิป', orientation: row.alt || 'portrait',
      });
    } else {
      (imagesByStep[row.parent_id] ||= []).push({
        id: row.id, src: row.src, alt: row.alt, caption: row.caption,
      });
    }
  }
  const result = { imagesByStep, videosByStep };
  writeCache(result);
  return result;
}

// เพิ่มวิดีโอให้ read step หนึ่ง — เก็บลิงก์ YouTube ใน src, label ใน caption, orientation ใน alt
export async function addPreCourseVideo(stepId, url, { orientation = 'portrait', label = 'ดูคลิป' } = {}) {
  const { data: existing, error: countErr } = await supabase
    .from('acls_images')
    .select('sort_order')
    .eq('parent_type', PRECOURSE_VIDEO_PARENT_TYPE)
    .eq('parent_id', stepId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countErr) throw countErr;
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('acls_images')
    .insert({
      parent_type: PRECOURSE_VIDEO_PARENT_TYPE,
      parent_id: stepId,
      src: url,
      alt: orientation,
      caption: label,
      sort_order: nextOrder,
    })
    .select()
    .single();
  if (error) throw error;
  invalidatePreCourseMediaCache();
  return data;
}
