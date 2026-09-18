import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export const db = new Dexie('ACLS_EMR');

db.version(1).stores({
  cases: 'id, mode, startTime, outcome',
  events: '++autoId, caseId, timestamp, category, type',
  cprCycles: '++autoId, caseId, cycleNumber',
  etco2Readings: '++autoId, caseId, elapsed',
});

db.version(2).stores({
  cases: 'id, mode, startTime, outcome',
  events: '++autoId, caseId, timestamp, category, type',
  cprCycles: '++autoId, caseId, cycleNumber',
  etco2Readings: '++autoId, caseId, elapsed',
  students: 'id, studentId, name, createdAt',
  lessonProgress: '++autoId, [studentId+lessonId], readAt',
  quizAttempts: '++autoId, studentId, lessonId, finishedAt, score, passed',
});

// v3: add sync tracking fields (nullable — existing rows are treated as unsynced).
// quizAttempts also gets a stable `uuid` so cloud inserts are idempotent across re-flushes.
db.version(3).stores({
  cases: 'id, mode, startTime, outcome',
  events: '++autoId, caseId, timestamp, category, type',
  cprCycles: '++autoId, caseId, cycleNumber',
  etco2Readings: '++autoId, caseId, elapsed',
  students: 'id, studentId, name, createdAt, syncedAt',
  lessonProgress: '++autoId, [studentId+lessonId], readAt, syncedAt',
  quizAttempts: '++autoId, uuid, studentId, lessonId, finishedAt, score, passed, syncedAt',
  syncFailures: '++autoId, table, refId, attempts, lastError, nextRetryAt',
}).upgrade(async (tx) => {
  // Backfill uuid on existing quiz attempts so they can be flushed idempotently
  await tx.table('quizAttempts').toCollection().modify(row => {
    if (!row.uuid) row.uuid = uuidv4();
  });
});

// v4: durable queue for game results (Code Blue Sim + Recorder Hero).
// These used to be fired straight at the RPC with `.catch(() => {})`, so a
// result finished offline, on flaky hospital wifi, or while the student row
// hadn't synced yet was dropped silently — the student saw their medal
// locally and the instructor's board never showed it. Now they queue like
// lesson progress / quiz attempts and flush with the same retry+backoff.
// `uuid` is the attempt id the RPC dedupes on, so re-flushing is idempotent.
db.version(4).stores({
  cases: 'id, mode, startTime, outcome',
  events: '++autoId, caseId, timestamp, category, type',
  cprCycles: '++autoId, caseId, cycleNumber',
  etco2Readings: '++autoId, caseId, elapsed',
  students: 'id, studentId, name, createdAt, syncedAt',
  lessonProgress: '++autoId, [studentId+lessonId], readAt, syncedAt',
  quizAttempts: '++autoId, uuid, studentId, lessonId, finishedAt, score, passed, syncedAt',
  syncFailures: '++autoId, table, refId, attempts, lastError, nextRetryAt',
  gameResults: '++autoId, uuid, kind, studentId, syncedAt',
});

// Generate case ID: YYYY-MMDD-NNN
export async function generateCaseId() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const todayCases = await db.cases
    .where('id')
    .startsWith(dateStr)
    .count();
  const seq = String(todayCases + 1).padStart(3, '0');
  return `${dateStr}-${seq}`;
}

// Save full case
export async function saveCase(caseData) {
  await db.cases.put(caseData);
}

// Add event to case
export async function addEvent(event) {
  const id = await db.events.add(event);
  return id;
}

// Get all events for a case
export async function getCaseEvents(caseId) {
  return db.events.where('caseId').equals(caseId).sortBy('timestamp');
}

// Save CPR cycle quality data
export async function saveCPRCycle(cycle) {
  return db.cprCycles.add(cycle);
}

// Save EtCO2 reading
export async function saveEtCO2(reading) {
  return db.etco2Readings.add(reading);
}

// Get all cases
export async function getAllCases() {
  return db.cases.orderBy('startTime').reverse().toArray();
}

// Get a single case with all related data
export async function getFullCase(caseId) {
  const [caseData, events, cycles, etco2] = await Promise.all([
    db.cases.get(caseId),
    db.events.where('caseId').equals(caseId).sortBy('timestamp'),
    db.cprCycles.where('caseId').equals(caseId).sortBy('cycleNumber'),
    db.etco2Readings.where('caseId').equals(caseId).sortBy('elapsed'),
  ]);
  return { ...caseData, events, cprCycles: cycles, etco2Readings: etco2 };
}

// Delete a case and all related data
export async function deleteCase(caseId) {
  await Promise.all([
    db.cases.delete(caseId),
    db.events.where('caseId').equals(caseId).delete(),
    db.cprCycles.where('caseId').equals(caseId).delete(),
    db.etco2Readings.where('caseId').equals(caseId).delete(),
  ]);
}

// ===== Pre-course: students =====
export async function upsertStudent(student) {
  // student = { id, studentId, name, phone, createdAt }
  await db.students.put(student);
  return student;
}

export async function findStudentByStudentId(studentId) {
  return db.students.where('studentId').equals(studentId).first();
}

export async function getAllStudents() {
  return db.students.orderBy('createdAt').reverse().toArray();
}

export async function deleteStudent(id) {
  await Promise.all([
    db.students.delete(id),
    db.lessonProgress.where('studentId').equals(id).delete(),
    db.quizAttempts.where('studentId').equals(id).delete(),
  ]);
}

// ===== Pre-course: lesson read progress =====
export async function markLessonRead(studentId, lessonId) {
  const existing = await db.lessonProgress
    .where('[studentId+lessonId]').equals([studentId, lessonId]).first();
  if (existing) return existing.autoId;
  return db.lessonProgress.add({ studentId, lessonId, readAt: new Date().toISOString() });
}

export async function getLessonProgress(studentId) {
  if (!studentId) return [];
  return db.lessonProgress.where('studentId').equals(studentId).toArray();
}

export async function hasReadLesson(studentId, lessonId) {
  if (!studentId) return false;
  const row = await db.lessonProgress
    .where('[studentId+lessonId]').equals([studentId, lessonId]).first();
  return !!row;
}

// ===== Pre-course: quiz attempts =====
export async function saveQuizAttempt(attempt) {
  // attempt = { studentId, lessonId, score, totalQuestions, correctCount,
  //   answers, startedAt, finishedAt, passed, attemptNumber }
  const withUuid = { uuid: uuidv4(), ...attempt };
  return db.quizAttempts.add(withUuid);
}

export async function getAttemptsForStudent(studentId) {
  if (!studentId) return [];
  return db.quizAttempts.where('studentId').equals(studentId).toArray();
}

export async function getAttemptById(autoId) {
  return db.quizAttempts.get(Number(autoId));
}

export async function getBestAttempt(studentId, lessonId) {
  if (!studentId) return null;
  const rows = await db.quizAttempts.where('studentId').equals(studentId).toArray();
  const forLesson = rows.filter(r => r.lessonId === lessonId);
  if (!forLesson.length) return null;
  return forLesson.reduce((best, r) => (r.score > (best?.score ?? -1) ? r : best), null);
}

export async function getAttemptCount(studentId, lessonId) {
  if (!studentId) return 0;
  const rows = await db.quizAttempts.where('studentId').equals(studentId).toArray();
  return rows.filter(r => r.lessonId === lessonId).length;
}

// ===== Game results: offline queue =====
// kind = 'codeblue' | 'recorder'; refId = scenarioId / levelId (the RPCs take
// them under different names, so the flusher maps it). Callers fire and forget
// — the row is durable, so a failed or offline submit is retried later instead
// of vanishing. Never throws: a full/unavailable IndexedDB must not break the
// debrief screen the player is looking at.
export async function enqueueGameResult({ kind, studentId, refId, payload }) {
  try {
    return await db.gameResults.add({
      uuid: uuidv4(),
      kind,
      studentId,
      refId,
      payload,
      createdAt: new Date().toISOString(),
      syncedAt: null,
    });
  } catch {
    return null;
  }
}

// ===== Pre-course: cloud restore =====
// Hydrates local IndexedDB from a get_student_progress RPC response — used
// both when a student registers on a device with no local record for them
// (new browser, cleared storage, different phone) and on every background
// pull (services/progressPull.js) so a second device catches up on work done
// elsewhere. Merge-only: rows already present are skipped (lesson rows keyed
// on [studentId+lessonId], attempts on the uuid they were pushed with), so
// this never overwrites local work. New rows are marked already-synced so the
// sync engine doesn't try to re-push them.
// Returns the number of rows actually added — callers use it to avoid
// re-rendering when the pull brought nothing new.
export async function hydrateStudentProgress(studentId, { lessonProgress = [], quizAttempts = [] } = {}) {
  const now = new Date().toISOString();
  let added = 0;
  for (const row of lessonProgress) {
    const dup = await db.lessonProgress
      .where('[studentId+lessonId]').equals([studentId, row.lessonId]).first();
    if (dup) continue;
    await db.lessonProgress.add({ studentId, lessonId: row.lessonId, readAt: row.readAt, syncedAt: now });
    added++;
  }
  for (const row of quizAttempts) {
    if (!row.uuid) continue;
    const dup = await db.quizAttempts.where('uuid').equals(row.uuid).first();
    if (dup) continue;
    await db.quizAttempts.add({
      uuid: row.uuid,
      studentId,
      lessonId: row.lessonId,
      score: row.score,
      totalQuestions: row.totalQuestions,
      correctCount: row.correctCount,
      answers: row.answers,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      passed: row.passed,
      attemptNumber: row.attemptNumber,
      syncedAt: now,
    });
    added++;
  }
  return added;
}

// Combined cohort view: every student + their best score & read status per lesson
export async function getCohortSummary(lessonIds) {
  const [students, allProgress, allAttempts] = await Promise.all([
    db.students.orderBy('createdAt').toArray(),
    db.lessonProgress.toArray(),
    db.quizAttempts.toArray(),
  ]);
  return students.map(s => {
    const { id, studentId, name, phone, createdAt } = s;
    const lessons = {};
    for (const lid of lessonIds) {
      const read = allProgress.some(p => p.studentId === s.id && p.lessonId === lid);
      const attempts = allAttempts.filter(a => a.studentId === s.id && a.lessonId === lid);
      const best = attempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
      lessons[lid] = {
        read,
        attemptCount: attempts.length,
        bestScore: best?.score ?? null,
        passed: best?.passed ?? false,
        lastAttemptAt: attempts.length
          ? attempts.reduce((m, a) => (a.finishedAt > m ? a.finishedAt : m), '')
          : null,
      };
    }
    return { student: { id, studentId, name, phone, createdAt }, lessons };
  });
}
