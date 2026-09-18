import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSupabaseAdmin } from './supabaseAdmin.js';

const KEYS = ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

// เคลียร์ env ทั้งชุดแล้วตั้งเฉพาะที่ระบุ — คืนค่าเดิมให้หลังจบ test
function withEnv(t, vars) {
  const prev = KEYS.map((k) => [k, process.env[k]]);
  t.after(() => {
    for (const [k, v] of prev) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  KEYS.forEach((k) => delete process.env[k]);
  Object.assign(process.env, vars);
}

// ข้อความนี้ลง server log อย่างเดียว (requireAdmin ไม่ส่งต่อไป client) จึงบอกชื่อ
// ตัวแปรได้ — และต้องบอกให้ตรงตัว ไม่ใช่ยกมาทั้งคู่ให้ไปเดาเองว่าตัวไหนหาย
test('names only the service role key when the URL is present', (t) => {
  withEnv(t, { SUPABASE_URL: 'https://example.supabase.co' });
  assert.throws(getSupabaseAdmin, (err) => {
    assert.match(err.message, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.doesNotMatch(err.message, /SUPABASE_URL/);
    return true;
  });
});

test('accepts VITE_SUPABASE_URL as the URL fallback', (t) => {
  withEnv(t, { VITE_SUPABASE_URL: 'https://example.supabase.co' });
  assert.throws(getSupabaseAdmin, (err) => {
    assert.doesNotMatch(err.message, /SUPABASE_URL/);
    return true;
  });
});

test('names both variables when neither is set', (t) => {
  withEnv(t, {});
  assert.throws(getSupabaseAdmin, (err) => {
    assert.match(err.message, /SUPABASE_URL/);
    assert.match(err.message, /SUPABASE_SERVICE_ROLE_KEY/);
    return true;
  });
});
