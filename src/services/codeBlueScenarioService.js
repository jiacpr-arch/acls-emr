import { supabase, isSupabaseConfigured } from './supabase';
import { COURSE_MODE } from '../config/courseMode';

// ==========================================
// Code Blue — โหลด "โจทย์ที่เผยแพร่แล้ว" จาก Supabase (public read, status=published)
// + cache 6 ชม. ใน localStorage + fallback เป็น built-in เมื่อ Supabase ล่ม/ตารางยังไม่มี
// ผู้เรียนไม่มีวันเห็นโจทย์ draft (RLS กรองที่ status ด้วย)
// มิเรอร์ recorderCaseService.js
// ==========================================
const CACHE_KEY = 'code_blue_scenarios_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000;

export function invalidateScenarioCache() {
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

// row (snake) → Scenario object (payload คือ Scenario อยู่แล้ว แค่ผูก id/meta กลับเข้าไป)
export function mapScenarioRow(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: `db_${row.id}`,
    title: row.title || payload.title || 'โจทย์',
    subtitle: row.subtitle || payload.subtitle || '',
    level: row.level || payload.level || 'basic',
    course: row.course || payload.course || 'acls',
    source: 'db',
    story: Array.isArray(payload.story) ? payload.story : [],
  };
}

// คืนเฉพาะโจทย์ที่เผยแพร่แล้ว (published) ของโหมดปัจจุบัน — ไม่รวม built-in
export async function fetchPublishedScenarios({ force = false } = {}) {
  if (!isSupabaseConfigured()) return [];
  if (!force) {
    const cached = readCache();
    if (cached) return cached.filter((s) => (s.course || 'acls') === COURSE_MODE);
  }
  try {
    const { data, error } = await supabase
      .from('code_blue_scenarios')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const mapped = (data || []).map(mapScenarioRow).filter((s) => s.story.length > 0);
    writeCache(mapped);
    return mapped.filter((s) => (s.course || 'acls') === COURSE_MODE);
  } catch {
    // Supabase ล่ม/ตารางยังไม่มี → ไม่ทำให้เกมพัง
    return [];
  }
}
