import { supabase } from './supabase';
import { getClassContext } from '../stores/classStore';

// Thin wrappers around the Postgres RPCs. All return { data, error } —
// callers handle errors so the sync engine can retry / record failures.

export async function rpcVerifyClassCode(code) {
  const { data, error } = await supabase.rpc('verify_class_code', {
    p_code: code,
  });
  if (error) return { error };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    data: {
      classId: row.class_id,
      className: row.class_name,
      courseMode: row.course_mode,
    },
  };
}

export async function rpcCreateClass({ name, courseMode }) {
  const { data, error } = await supabase.rpc('create_class_v2', {
    p_name: name,
    p_course_mode: courseMode,
  });
  if (error) return { error };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    data: {
      classId: row.class_id,
      code: row.code,
      instructorCode: row.instructor_code,
    },
  };
}

// Verify an instructor code (or a legacy class code). Returns the student
// join code too, so an instructor can reconnect — and recover a lost join
// code — from just the instructor code.
export async function rpcVerifyInstructorCode(code) {
  const { data, error } = await supabase.rpc('verify_instructor_code', {
    p_code: code,
  });
  if (error) return { error };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    data: {
      classId: row.class_id,
      className: row.class_name,
      courseMode: row.course_mode,
      classCode: row.class_code,
      instructorCode: row.instructor_code,
    },
  };
}

export async function rpcJoinClass({ code, studentUuid, studentId, name, phone }) {
  const { data, error } = await supabase.rpc('join_class', {
    p_code: code,
    p_student_uuid: studentUuid,
    p_student_id: studentId,
    p_name: name,
    p_phone: phone ?? null,
  });
  if (error) return { error };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    data: {
      classId: row.class_id,
      studentPk: row.student_pk,
      className: row.class_name,
      courseMode: row.course_mode,
    },
  };
}

// Read-only restore: pulls a student's lesson progress + quiz attempts back
// from the cloud so a device with no local record (new browser, cleared
// storage, different phone) can catch up instead of starting over. Same
// bearer model as join_class — the class join code + the student's own id.
export async function rpcGetStudentProgress({ code, studentId }) {
  const { data, error } = await supabase.rpc('get_student_progress', {
    p_code: code,
    p_student_id: studentId,
  });
  if (error) return { error };
  return { data: data || { student: null } };
}

export async function rpcUpsertLessonProgress({ studentPk, lessonId, readAt }) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('upsert_lesson_progress', {
    p_code: classCode,
    p_student_pk: studentPk,
    p_lesson_id: lessonId,
    p_read_at: readAt,
  });
  return error ? { error } : { data: true };
}

export async function rpcSubmitQuizAttempt({ attemptUuid, studentPk, lessonId, payload }) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('submit_quiz_attempt', {
    p_code: classCode,
    p_attempt_uuid: attemptUuid,
    p_student_pk: studentPk,
    p_lesson_id: lessonId,
    p_payload: payload,
  });
  return error ? { error } : { data: true };
}

// Instructor-level RPCs use the instructor code when the class has one;
// legacy classes fall back to the shared class code (old bearer behaviour).
function instructorAccessCode() {
  const { classCode, instructorCode } = getClassContext();
  return instructorCode || classCode;
}

export async function rpcGetCohortSummary(lessonIds) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_cohort_summary', {
    p_code: code,
    p_lesson_ids: lessonIds,
  });
  return error ? { error } : { data: data || [] };
}

// สถานะภาคปฏิบัติ "ของตัวเอง" ฝั่งนักเรียน (รหัสเข้าคลาส ไม่ใช่รหัสอาจารย์) —
// ใช้ในหน้าใบประกาศนียบัตรเพื่ออัปเกรดใบทฤษฎีเป็นฉบับสมบูรณ์เมื่อเข้าครบทุกฐาน
// + สอบปฏิบัติผ่านครบ server คืนเฉพาะแถวของนักเรียนคนนี้เท่านั้น
export async function rpcGetMyPracticalStatus({ studentPk }) {
  const { classCode } = getClassContext();
  if (!classCode || !studentPk) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_my_practical_status', {
    p_code: classCode,
    p_student_pk: studentPk,
  });
  return error ? { error } : { data };
}

// Code Blue Simulator results — same shape as quiz attempts, but best-effort:
// a failed submit is just dropped (no offline queue) since a game result
// never gates certification, unlike lesson progress / quiz attempts.
export async function rpcSubmitCodeBlueResult({ attemptUuid, studentPk, scenarioId, payload }) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('submit_codeblue_result', {
    p_code: classCode,
    p_attempt_uuid: attemptUuid,
    p_student_pk: studentPk,
    p_scenario_id: scenarioId,
    p_payload: payload,
  });
  return error ? { error } : { data: true };
}

// ความคืบหน้าเกม Code Blue "ของตัวเอง" — server สรุปจากผลที่เคยส่งขึ้นไป:
// เคสที่เคยผ่าน, เกรดดีสุดต่อเคส, hi-score ต่อระดับความยาก ใช้ hydrate กลับลง
// localStorage ตอนลงทะเบียนบนเครื่องใหม่ (bearer เดิม: รหัสคลาส + student_pk)
export async function rpcGetMyCodeBlueProgress({ studentPk }) {
  const { classCode } = getClassContext();
  if (!classCode || !studentPk) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_my_codeblue_progress', {
    p_code: classCode,
    p_student_pk: studentPk,
  });
  return error ? { error } : { data };
}

// Leaderboard เหรียญ Code Blue ของทั้งคลาส — เปิดให้นักเรียนดูด้วยรหัสคลาส
// (ไม่ต้องใช้รหัส instructor) server สรุปเหรียญจากผลที่ดีที่สุดต่อเคสให้แล้ว
export async function rpcGetCodeBlueLeaderboard() {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_codeblue_leaderboard', {
    p_code: classCode,
  });
  return error ? { error } : { data: data || [] };
}

export async function rpcGetCohortCodeblueSummary() {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_cohort_codeblue_summary', {
    p_code: code,
  });
  return error ? { error } : { data: data || [] };
}

// Recorder Hero results — same architecture/trade-offs as rpcSubmitCodeBlueResult:
// best-effort, no offline queue (a game result never gates certification).
// levelId is a campaign level id, a case-pack id, or "endless:<category>".
export async function rpcSubmitRecorderResult({ attemptUuid, studentPk, levelId, payload }) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('submit_recorder_result', {
    p_code: classCode,
    p_attempt_uuid: attemptUuid,
    p_student_pk: studentPk,
    p_level_id: levelId,
    p_payload: payload,
  });
  return error ? { error } : { data: true };
}

export async function rpcGetCohortRecorderSummary() {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_cohort_recorder_summary', {
    p_code: code,
  });
  return error ? { error } : { data: data || [] };
}

// ===== Practical check-in (เช็คชื่อฐาน + สอบปฏิบัติ) =====
// Instructor-level เท่านั้น — การเช็คชื่อ/ให้ผลสอบต้องมาจากเครื่องอาจารย์
// (นักเรียนถือแค่รหัสเข้าคลาส เรียกไม่ผ่าน) Online-only: เช็คชื่อเกิดสดหน้าฐาน
// พลาดก็สแกนซ้ำได้ทันที จึงไม่ต้องมี offline queue

export async function rpcUpsertStation({ stationId = null, name, kind, sortOrder = 0 }) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('upsert_station', {
    p_code: code,
    p_station_id: stationId,
    p_name: name,
    p_kind: kind,
    p_sort_order: sortOrder,
  });
  return error ? { error } : { data };
}

export async function rpcDeleteStation(stationId) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('delete_station', {
    p_code: code,
    p_station_id: stationId,
  });
  return error ? { error } : { data: true };
}

export async function rpcCheckinStudent({ studentPk, stationId, note = null }) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('checkin_student', {
    p_code: code,
    p_student_pk: studentPk,
    p_station_id: stationId,
    p_note: note,
  });
  return error ? { error } : { data };
}

export async function rpcUndoCheckin({ studentPk, stationId }) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('undo_checkin', {
    p_code: code,
    p_student_pk: studentPk,
    p_station_id: stationId,
  });
  return error ? { error } : { data: true };
}

export async function rpcSetExamResult({
  studentPk, stationId, passed, score = null, note = null,
  checklistId = null, checklistItems = null,
}) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('set_exam_result', {
    p_code: code,
    p_student_pk: studentPk,
    p_station_id: stationId,
    p_passed: passed,
    p_score: score,
    p_note: note,
    p_checklist_id: checklistId,
    p_checklist_items: checklistItems,
  });
  return error ? { error } : { data: true };
}

// ล็อกเคสสอบ Megacode กับนักเรียนที่ฐานสอบแบบสุ่มข้อสอบ — server ใช้กติกา
// "เคสแรกชนะ" (atomic): ถ้านักเรียนถูกล็อกเคสไว้แล้วและไม่ force จะคืนเคสเดิม
// force=true ใช้กับปุ่ม "สุ่มใหม่" เพื่อทับเคสเดิม คืนค่า data = case id ที่ติดจริง
export async function rpcAssignExamCase({ studentPk, stationId, caseId, force = false }) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('assign_exam_case', {
    p_code: code,
    p_student_pk: studentPk,
    p_station_id: stationId,
    p_case_id: caseId,
    p_force: force,
  });
  return error ? { error } : { data };
}

export async function rpcGetCheckinBoard() {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_checkin_board', {
    p_code: code,
  });
  return error ? { error } : { data: data || { stations: [], rows: [] } };
}

export async function rpcDeleteCohortStudent(studentPk) {
  const code = instructorAccessCode();
  if (!code) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('delete_cohort_student', {
    p_code: code,
    p_student_pk: studentPk,
  });
  return error ? { error } : { data: true };
}
