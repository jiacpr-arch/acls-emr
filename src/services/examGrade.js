// Server grading of pre/post-tests (api/exam/grade.js). The exam is still taken — and can be
// finished offline — in the browser, but only the server's grade counts toward the certificate:
// each attempt carries `serverGrade` once graded:
//   { status: 'graded', score, passed, correctCount, total, passPercent, gradedAt }
//   { status: 'rejected', reason }   (the server refused it: incomplete/unknown set — retake)
//   undefined                        (not graded yet: offline, or the server couldn't be reached)
// Only answers + the local student id are sent (plus the class link / JIA account when the
// student has one) — never name/phone.
import { db } from '../db/database';
import { COURSE_MODE } from '../config/courseMode';
import { PRE_TEST_LESSON_ID } from '../data/activePreTest';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { getClassContext } from '../stores/classStore';

export function examKindOf(lessonId) {
  if (lessonId === PRE_TEST_LESSON_ID) return 'pre';
  if (lessonId === POST_TEST_LESSON_ID) return 'post';
  return null;
}

export const serverPassed = (attempt) => attempt?.serverGrade?.status === 'graded' && !!attempt.serverGrade.passed;
export const gradePending = (attempt) => !!examKindOf(attempt?.lessonId) && !attempt?.serverGrade;

const PERMANENT = new Set([400, 404, 422]);

/**
 * Grades one saved attempt on the server and records the outcome on the Dexie row.
 * Returns the new serverGrade, or null when it couldn't be graded right now (retry later).
 */
export async function gradeExamAttempt(attempt, { source = 'online', timeoutMs = 10000 } = {}) {
  const kind = examKindOf(attempt?.lessonId);
  if (!kind || !attempt.uuid) return null;
  if (attempt.serverGrade) return attempt.serverGrade;

  const student = attempt.studentId ? await db.students.get(attempt.studentId) : null;
  const { classCode } = getClassContext();
  const canGrade = attempt.setId && Array.isArray(attempt.answers);
  // Restored from another device (hydrateStudentProgress drops setId): all we can do is ask
  // whether the server already graded this uuid there.
  const body = canGrade
    ? {
        attemptUuid: attempt.uuid,
        course: COURSE_MODE,
        kind,
        setId: attempt.setId,
        answers: attempt.answers.map(a => ({ questionId: a.questionId, chosenId: a.chosenId ?? null })),
        studentLocalId: attempt.studentId,
        classCode: classCode || undefined,
        studentPk: student?.syncedAt ? student.id : undefined,
        hubSub: student?.hubSub || undefined,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
        source,
      }
    : { attemptUuid: attempt.uuid };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  let data = {};
  try {
    res = await fetch('/api/exam/grade', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if ((res.headers.get('content-type') || '').includes('application/json')) data = await res.json().catch(() => ({}));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }

  let serverGrade = null;
  if (res.ok && data.ok && data.grade) {
    const g = data.grade;
    serverGrade = {
      status: 'graded', score: g.score, passed: !!g.passed, correctCount: g.correctCount,
      total: g.total, passPercent: g.passPercent, gradedAt: g.gradedAt,
    };
  } else if (PERMANENT.has(res.status) && data.reason) {
    // 404 on a lookup-only request just means "not graded anywhere" — without setId there is no
    // way to grade it here, so it's as final as a refusal.
    serverGrade = { status: 'rejected', reason: data.reason };
  }
  if (serverGrade && attempt.autoId != null) await db.quizAttempts.update(attempt.autoId, { serverGrade });
  return serverGrade;
}

/** Grades every pre/post-test attempt on this device that has no server grade yet. */
export async function flushExamGrades({ source = 'sync' } = {}) {
  const pending = await db.quizAttempts.filter(a => gradePending(a)).toArray();
  for (const attempt of pending) {
    const g = await gradeExamAttempt(attempt, { source });
    if (!g) break; // offline / server down — the rest would fail the same way; retry on the next flush
  }
}
