import { supabase } from './supabase';

// Fetch aggregate dashboard numbers (admin-only). Sends the Supabase session
// JWT so the serverless endpoint can verify the admin via requireAdmin.
export async function fetchAdminStats() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('ไม่มี session — กรุณา login ใหม่');

  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}
