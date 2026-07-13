import { supabase, isSupabaseConfigured } from './supabase';

// ==========================================
// Code Blue — โหลดตัวละครที่แอดมินสร้าง (custom) จาก Supabase
// + cache 6 ชม. + fallback เงียบเมื่อ Supabase ล่ม/ตารางยังไม่มี
// map เป็น shape เดียวกับ registry ใน src/game/characters.js
// ==========================================
const CACHE_KEY = 'code_blue_characters_cache_v1';
const TTL_MS = 6 * 60 * 60 * 1000;

export function invalidateCharacterCache() {
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

// row → { key, entry } — entry มี images:{pose:url} ให้ CharacterSprite ใช้ก่อน SVG
export function mapCharacterRow(row) {
  const poses = row.poses && typeof row.poses === 'object' ? row.poses : {};
  return {
    key: row.char_key,
    entry: {
      name: row.name || row.char_key,
      role: row.role || '',
      plate: [row.plate_from || '#405089', row.plate_to || '#232F5E'],
      images: poses,          // { idle: url, talk: url, ... }
      custom: true,
    },
  };
}

// คืน map { char_key: entry } ของตัวละคร custom ทั้งหมด
export async function fetchCustomCharacters({ force = false } = {}) {
  if (!isSupabaseConfigured()) return {};
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }
  try {
    const { data, error } = await supabase
      .from('code_blue_characters')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const map = {};
    for (const row of data || []) {
      const { key, entry } = mapCharacterRow(row);
      if (key) map[key] = entry;
    }
    writeCache(map);
    return map;
  } catch {
    return {};
  }
}
