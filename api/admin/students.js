import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 10 };

// Admin-only: full student roster (name + phone + class + pass status) across
// all classes. Computed by public.get_student_roster(); called with the
// service-role client (bypasses RLS) after verifying the admin session.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const { data, error } = await supabase.rpc('get_student_roster');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ students: data || [] });
}
