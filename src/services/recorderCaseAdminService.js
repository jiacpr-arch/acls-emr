import { supabase } from './supabase';
import { authedPost } from './adminApi';
import { invalidateRecorderCasesCache } from './recorderCaseService';

// ==========================================
// Recorder Hero — CRUD เคสสำหรับหน้าแอดมิน + AI ร่าง + เปลี่ยนสถานะ
// เขียนผ่าน client ที่ล็อกอินแอดมินแล้ว (RLS คุมสิทธิ์) — รูปแบบเดียวกับ videoLessonAdminService
// ==========================================

export function mapAdminRow(row) {
  return {
    id: row.id,
    titleTh: row.title_th || '',
    category: row.category || 'cardiac_arrest',
    difficulty: row.difficulty || 'basic',
    status: row.status || 'draft',
    source: row.source || 'manual',
    payload: row.payload && typeof row.payload === 'object' ? row.payload : {},
    adminNotes: row.admin_notes || '',
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// list ทั้งหมด (ทุกสถานะ) — แอดมินเห็น draft ด้วย
export async function listRecorderCases() {
  const { data, error } = await supabase
    .from('recorder_cases')
    .select('*')
    .order('status', { ascending: true })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAdminRow);
}

// payload = Case object; แยก field ที่ต้อง index ออกมาเป็นคอลัมน์
function toRow({ titleTh, category, difficulty, status, source, payload, adminNotes }) {
  const row = {
    title_th: (titleTh || payload?.title_th || 'เคสใหม่').trim(),
    category: category || payload?.category || 'cardiac_arrest',
    difficulty: difficulty || payload?.difficulty || 'basic',
    payload: payload || {},
  };
  if (status != null) row.status = status;
  if (source != null) row.source = source;
  if (adminNotes !== undefined) row.admin_notes = adminNotes;
  return row;
}

export async function createRecorderCase(input) {
  // เคสใหม่เป็น draft เสมอ — กันเผยแพร่โดยไม่ได้ตรวจ
  const { data, error } = await supabase
    .from('recorder_cases')
    .insert({ ...toRow(input), status: 'draft' })
    .select()
    .single();
  if (error) throw error;
  invalidateRecorderCasesCache();
  return mapAdminRow(data);
}

export async function updateRecorderCase(id, input) {
  const { error } = await supabase
    .from('recorder_cases')
    .update(toRow(input))
    .eq('id', id);
  if (error) throw error;
  invalidateRecorderCasesCache();
}

export async function setRecorderCaseStatus(id, status) {
  const { error } = await supabase
    .from('recorder_cases')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  invalidateRecorderCasesCache();
}

export async function deleteRecorderCase(id) {
  const { error } = await supabase.from('recorder_cases').delete().eq('id', id);
  if (error) throw error;
  invalidateRecorderCasesCache();
}

// ให้ AI (Claude ผ่าน /api/recorder-cases/generate-case) ร่างเคส — ไม่เขียน DB เอง
// คืน { case, warnings } ให้แอดมินตรวจ/แก้ก่อนบันทึกเป็น draft
export async function generateCaseWithAI({ category, difficulty, brief }) {
  return authedPost('/api/recorder-cases/generate-case', { category, difficulty, brief });
}
