import { supabase } from './supabase';

// Shared authed GET for admin-only endpoints. Attaches the Supabase session
// JWT so the serverless side can verify the admin via requireAdmin.
export async function authedGet(path) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('ไม่มี session — กรุณา login ใหม่');

  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}
