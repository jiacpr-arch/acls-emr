import { useEffect } from 'react';
import { db } from '../db/database';
import { getClassContext } from '../stores/classStore';
import {
  rpcJoinClass,
  rpcUpsertLessonProgress,
  rpcSubmitQuizAttempt,
} from './cohortSync';

// In-memory flush state — single global engine.
let flushing = false;
let pending = false;
let listenersBound = false;
let intervalId = null;
const subscribers = new Set();

function notify() {
  subscribers.forEach(fn => {
    try { fn(); } catch { /* ignore */ }
  });
}

export function subscribeToSync(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export async function getPendingCount() {
  const [s, l, q] = await Promise.all([
    db.students.filter(r => !r.syncedAt).count(),
    db.lessonProgress.filter(r => !r.syncedAt).count(),
    db.quizAttempts.filter(r => !r.syncedAt).count(),
  ]);
  return s + l + q;
}

export function scheduleFlush() {
  if (flushing) { pending = true; return; }
  flush();
}

async function flush() {
  const ctx = getClassContext();
  if (!ctx.classCode || ctx.syncDisabled) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  flushing = true;
  try {
    await flushStudents(ctx);
    await flushLessonProgress();
    await flushQuizAttempts();
  } finally {
    flushing = false;
    notify();
    if (pending) {
      pending = false;
      // Yield then retry the work that arrived during this flush
      setTimeout(scheduleFlush, 0);
    }
  }
}

async function flushStudents(ctx) {
  const rows = await db.students.filter(r => !r.syncedAt).toArray();
  for (const row of rows) {
    const { data, error } = await rpcJoinClass({
      code: ctx.classCode,
      studentUuid: row.id,
      studentId: row.studentId,
      name: row.name,
    });
    if (error) {
      await recordFailure('students', row.id, error);
      continue;
    }
    // Server returns the canonical student_pk. If it differs from local id,
    // remap dependent rows so subsequent flushes use the correct PK.
    if (data?.studentPk && data.studentPk !== row.id) {
      await db.transaction('rw', db.students, db.lessonProgress, db.quizAttempts, async () => {
        await db.students.delete(row.id);
        await db.students.put({ ...row, id: data.studentPk, syncedAt: new Date().toISOString() });
        await db.lessonProgress.where('studentId').equals(row.id).modify({ studentId: data.studentPk });
        await db.quizAttempts.where('studentId').equals(row.id).modify({ studentId: data.studentPk });
      });
    } else {
      await db.students.update(row.id, { syncedAt: new Date().toISOString() });
    }
  }
}

async function flushLessonProgress() {
  const rows = await db.lessonProgress.filter(r => !r.syncedAt).toArray();
  for (const row of rows) {
    // Skip if the student hasn't been synced yet — will retry next flush
    const student = await db.students.get(row.studentId);
    if (!student?.syncedAt) continue;

    const { error } = await rpcUpsertLessonProgress({
      studentPk: row.studentId,
      lessonId: row.lessonId,
      readAt: row.readAt,
    });
    if (error) {
      await recordFailure('lessonProgress', row.autoId, error);
      continue;
    }
    await db.lessonProgress.update(row.autoId, { syncedAt: new Date().toISOString() });
  }
}

async function flushQuizAttempts() {
  const rows = await db.quizAttempts.filter(r => !r.syncedAt).toArray();
  for (const row of rows) {
    const student = await db.students.get(row.studentId);
    if (!student?.syncedAt) continue;
    if (!row.uuid) {
      // Old row without uuid — should have been backfilled in v3 upgrade
      continue;
    }
    const payload = {
      score: row.score,
      totalQuestions: row.totalQuestions,
      correctCount: row.correctCount,
      answers: row.answers ?? [],
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      passed: row.passed,
      attemptNumber: row.attemptNumber ?? 1,
    };
    const { error } = await rpcSubmitQuizAttempt({
      attemptUuid: row.uuid,
      studentPk: row.studentId,
      lessonId: row.lessonId,
      payload,
    });
    if (error) {
      await recordFailure('quizAttempts', row.autoId, error);
      continue;
    }
    await db.quizAttempts.update(row.autoId, { syncedAt: new Date().toISOString() });
  }
}

async function recordFailure(table, refId, error) {
  const message = error?.message || String(error);
  const existing = await db.syncFailures
    .where('table').equals(table)
    .and(r => String(r.refId) === String(refId))
    .first();
  const attempts = (existing?.attempts ?? 0) + 1;
  const backoffMs = Math.min(60_000, 2_000 * Math.pow(2, attempts));
  const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
  if (existing) {
    await db.syncFailures.update(existing.autoId, {
      attempts, lastError: message, nextRetryAt,
    });
  } else {
    await db.syncFailures.add({
      table, refId, attempts, lastError: message, nextRetryAt,
    });
  }
}

// React mount hook: bind online/visibility listeners + periodic poll while mounted.
export function useSyncEngine() {
  useEffect(() => {
    if (listenersBound) return;
    listenersBound = true;

    const onOnline = () => scheduleFlush();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') scheduleFlush();
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    intervalId = setInterval(scheduleFlush, 30_000);

    scheduleFlush();

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalId) clearInterval(intervalId);
      listenersBound = false;
    };
  }, []);
}
