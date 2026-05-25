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
  const { data, error } = await supabase.rpc('create_class', {
    p_name: name,
    p_course_mode: courseMode,
  });
  if (error) return { error };
  const row = Array.isArray(data) ? data[0] : data;
  return { data: { classId: row.class_id, code: row.code } };
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

export async function rpcGetCohortSummary(lessonIds) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { data, error } = await supabase.rpc('get_cohort_summary', {
    p_code: classCode,
    p_lesson_ids: lessonIds,
  });
  return error ? { error } : { data: data || [] };
}

export async function rpcDeleteCohortStudent(studentPk) {
  const { classCode } = getClassContext();
  if (!classCode) return { error: new Error('no_class') };
  const { error } = await supabase.rpc('delete_cohort_student', {
    p_code: classCode,
    p_student_pk: studentPk,
  });
  return error ? { error } : { data: true };
}
