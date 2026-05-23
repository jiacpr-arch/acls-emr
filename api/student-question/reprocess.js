import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/requireAdmin.js';
import { processStudentQuestion } from '../_lib/processStudentQuestion.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'id required' });

  const supabase = getSupabaseAdmin();

  try {
    await processStudentQuestion(id);
  } catch (err) {
    await supabase
      .from('acls_student_questions')
      .update({
        status: 'failed',
        error_message: String(err?.message || err).slice(0, 1000),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    return res.status(500).json({ error: err.message });
  }

  return res.status(200).json({ ok: true, id });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
