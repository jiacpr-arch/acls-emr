import { supabase } from './supabase';
import { invalidateQaDeepCache } from './qaDeepService';

/** List all student-submitted questions, newest first. */
export async function listStudentQuestions({ status } = {}) {
  let q = supabase
    .from('acls_student_questions')
    .select(
      'id, question, student_name, student_contact, status, deepseek_answer, ' +
      'suggested_chapter_id, classification_reason, generated_image_url, image_prompt, ' +
      'admin_notes, error_message, published_item_id, created_at, processed_at, published_at, updated_at',
    )
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function countStudentQuestionsByStatus() {
  const { data, error } = await supabase
    .from('acls_student_questions')
    .select('status');
  if (error) throw error;
  const counts = {};
  for (const r of data ?? []) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  return counts;
}

export async function updateStudentQuestionDraft(id, patch) {
  const allowed = {};
  for (const k of [
    'question', 'deepseek_answer', 'suggested_chapter_id',
    'generated_image_url', 'admin_notes',
  ]) {
    if (patch[k] !== undefined) allowed[k] = patch[k];
  }
  const { error } = await supabase
    .from('acls_student_questions')
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function rejectStudentQuestion(id, adminNotes) {
  const { error } = await supabase
    .from('acls_student_questions')
    .update({
      status: 'rejected',
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteStudentQuestion(id) {
  const { error } = await supabase
    .from('acls_student_questions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

async function authedFetch(url, body) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('ไม่มี session — กรุณา login ใหม่');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

export async function reprocessStudentQuestion(id) {
  return authedFetch('/api/student-question/reprocess', { id });
}

export async function publishStudentQuestion(id, overrides = {}) {
  const result = await authedFetch('/api/student-question/publish', {
    id,
    ...overrides,
  });
  invalidateQaDeepCache();
  return result;
}
