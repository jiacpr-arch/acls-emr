import { supabase } from './supabase';
import { authedPost } from './adminApi';
import { invalidateScenarioCache } from './codeBlueScenarioService';

// ==========================================
// Code Blue — CRUD โจทย์สำหรับหน้าแอดมิน + AI ร่าง + เปลี่ยนสถานะ
// เขียนผ่าน client ที่ล็อกอินแอดมินแล้ว (RLS คุมสิทธิ์) — มิเรอร์ recorderCaseAdminService
// ==========================================

export function mapAdminRow(row) {
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    level: row.level || 'basic',
    course: row.course || 'acls',
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
export async function listScenarios() {
  const { data, error } = await supabase
    .from('code_blue_scenarios')
    .select('*')
    .order('status', { ascending: true })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAdminRow);
}

// payload = Scenario object; แยก field ที่ต้อง index ออกมาเป็นคอลัมน์
function toRow({ title, subtitle, level, course, status, source, payload, adminNotes }) {
  const row = {
    title: (title || payload?.title || 'โจทย์ใหม่').trim(),
    subtitle: (subtitle ?? payload?.subtitle ?? '').trim(),
    level: level || payload?.level || 'basic',
    course: course || payload?.course || 'acls',
    payload: payload || {},
  };
  if (status != null) row.status = status;
  if (source != null) row.source = source;
  if (adminNotes !== undefined) row.admin_notes = adminNotes;
  return row;
}

export async function createScenario(input) {
  // โจทย์ใหม่เป็น draft เสมอ — กันเผยแพร่โดยไม่ได้ตรวจ
  const { data, error } = await supabase
    .from('code_blue_scenarios')
    .insert({ ...toRow(input), status: 'draft' })
    .select()
    .single();
  if (error) throw error;
  invalidateScenarioCache();
  return mapAdminRow(data);
}

export async function updateScenario(id, input) {
  const { error } = await supabase
    .from('code_blue_scenarios')
    .update(toRow(input))
    .eq('id', id);
  if (error) throw error;
  invalidateScenarioCache();
}

export async function setScenarioStatus(id, status) {
  const { error } = await supabase
    .from('code_blue_scenarios')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  invalidateScenarioCache();
}

export async function deleteScenario(id) {
  const { error } = await supabase.from('code_blue_scenarios').delete().eq('id', id);
  if (error) throw error;
  invalidateScenarioCache();
}

// ให้ AI (Claude ผ่าน /api/code-blue/generate-scenario) ร่างโจทย์ — ไม่เขียน DB เอง
// คืน { scenario, warnings } ให้แอดมินตรวจ/แก้ก่อนบันทึกเป็น draft
export async function generateScenarioWithAI({ course, level, brief, characters }) {
  return authedPost('/api/code-blue/generate-scenario', { course, level, brief, characters });
}
