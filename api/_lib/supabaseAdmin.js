import { createClient } from '@supabase/supabase-js';

let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // ระบุให้ชัดว่าตัวไหนหาย — ข้อความรวม "(SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
  // แบบเดิมอ่านจาก log แล้วยังต้องเดาต่อว่าต้องไปเติมตัวไหนที่ deployment
  const missing = [];
  if (!url) missing.push('SUPABASE_URL (หรือ VITE_SUPABASE_URL)');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    throw new Error(`Supabase admin not configured — missing env: ${missing.join(', ')}`);
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
