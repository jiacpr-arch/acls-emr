import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { processStudentQuestion } from '../_lib/processStudentQuestion.js';

export const config = { maxDuration: 60 };

const MIN_LEN = 5;
const MAX_LEN = 2000;
const MAX_NAME_LEN = 80;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const question = String(body.question || '').trim();
  const studentName = String(body.studentName || '').trim().slice(0, MAX_NAME_LEN) || null;
  const studentContact = String(body.studentContact || '').trim().slice(0, MAX_NAME_LEN) || null;

  if (question.length < MIN_LEN || question.length > MAX_LEN) {
    return res.status(400).json({
      error: `คำถามต้องยาว ${MIN_LEN}-${MAX_LEN} ตัวอักษร`,
    });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const requestIp =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    null;

  // Insert pending row
  const { data: inserted, error: insErr } = await supabase
    .from('acls_student_questions')
    .insert({
      question,
      student_name: studentName,
      student_contact: studentContact,
      status: 'pending',
      request_ip: requestIp,
    })
    .select('id')
    .single();
  if (insErr) {
    return res.status(500).json({ error: `บันทึกคำถามไม่สำเร็จ: ${insErr.message}` });
  }

  const id = inserted.id;

  // Run the full pipeline synchronously. Vercel function maxDuration is 60s above.
  // If processing fails, we mark the row 'failed' and surface a friendly error;
  // the question itself is preserved so an admin can retry/edit later.
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
    return res.status(202).json({
      id,
      status: 'failed',
      message: 'บันทึกคำถามแล้ว แต่ระบบสร้างคำตอบไม่สำเร็จ — admin จะตรวจสอบและตอบกลับให้',
    });
  }

  return res.status(200).json({
    id,
    status: 'draft_ready',
    message: 'ขอบคุณสำหรับคำถาม — ระบบสร้างคำตอบเรียบร้อย รอ admin ตรวจสอบก่อนเผยแพร่',
  });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
