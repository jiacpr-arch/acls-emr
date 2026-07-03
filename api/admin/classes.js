import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 10 };

// Admin-only: every cohort class with both codes and its student count.
// This is the recovery path when an instructor loses their codes, and the
// place to archive finished classes (archiving disables both codes).
export default async function handler(req, res) {
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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('cohort_classes')
      .select('id, code, instructor_code, name, course_mode, created_at, archived_at, cohort_students(count)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const classes = (data || []).map(({ cohort_students, ...c }) => ({
      ...c,
      student_count: cohort_students?.[0]?.count ?? 0,
    }));
    return res.status(200).json({ classes });
  }

  if (req.method === 'POST') {
    const { classId, archived } = req.body || {};
    if (!classId || typeof archived !== 'boolean') {
      return res.status(400).json({ error: 'classId and archived (boolean) required' });
    }
    const { error } = await supabase
      .from('cohort_classes')
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq('id', classId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
