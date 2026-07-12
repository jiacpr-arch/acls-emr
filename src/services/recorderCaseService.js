import { supabase, isSupabaseConfigured } from './supabase';
import { CASES } from '../data/recorderCases';

// ==========================================
// Recorder Hero — โหลด "เคสที่เผยแพร่แล้ว" จาก Supabase (public read, status=published)
// + cache 6 ชม. ใน localStorage + fallback เป็น built-in CASES เมื่อ Supabase ล่ม
// ผู้เรียนไม่มีวันเห็นเคส draft (RLS กรองที่ status ด้วย)
// ==========================================
const CACHE_KEY = 'recorder_cases_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000;

export function invalidateRecorderCasesCache() {
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

// row (snake) → Case object (payload คือ Case อยู่แล้ว แค่ผูก id/หมวด/แหล่งกลับเข้าไป)
export function mapCaseRow(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: `db_${row.id}`,
    title_th: row.title_th || payload.title_th || 'เคส',
    category: row.category || payload.category || 'cardiac_arrest',
    difficulty: row.difficulty || payload.difficulty || 'basic',
    source: 'db',
    events: Array.isArray(payload.events) ? payload.events : [],
  };
}

// คืนเฉพาะเคสที่เผยแพร่แล้ว (published) จาก DB — ไม่รวม built-in
export async function fetchPublishedCases({ force = false } = {}) {
  if (!isSupabaseConfigured()) return [];
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  try {
    const { data, error } = await supabase
      .from('recorder_cases')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const mapped = (data || []).map(mapCaseRow).filter(c => c.events.length > 0);
    writeCache(mapped);
    return mapped;
  } catch {
    // Supabase ล่ม/ตารางยังไม่มี → ไม่ทำให้เกมพัง
    return [];
  }
}

// pool สำหรับเล่นจริง = built-in + published DB (built-in เป็น fallback ที่มีเสมอ)
export async function loadPlayablePool() {
  const published = await fetchPublishedCases();
  return [...CASES, ...published];
}
