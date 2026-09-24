import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createExamGradeHandler } from './examGradeHandler.js';
import { LOCAL_EXAMS } from './examKeys.js';
import { passportConfig } from './passportSession.js';
import { _resetRateLimitStore } from './rateLimit.js';

const UUID = '0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9';
const CLASS_ID = '00000000-0000-4000-8000-00000000c1a5';
const PK = '12345678-1234-4234-8234-123456789abc';
const set = LOCAL_EXAMS.bls.pre.sets[2];
const answersFor = (pick) => set.questions.map((q, i) => ({ questionId: q.id, chosenId: pick(q, i), correct: true }));
const allRight = () => answersFor((q) => q.correctId);

function fakeAdmin({ classes = [{ id: CLASS_ID, code: 'ABC123', archived_at: null }], students = [{ id: PK, class_id: CLASS_ID }] } = {}) {
  const tables = { exam_grades: [], cohort_classes: classes, cohort_students: students };
  const matches = (row, f) => Object.entries(f).every(([k, v]) => (v === null ? row[k] == null : row[k] === v));
  let inserts = 0;
  return {
    tables,
    get inserts() { return inserts; },
    from(table) {
      const f = {};
      const api = {
        select() { return api; },
        eq(k, v) { f[k] = v; return api; },
        is(k, v) { f[k] = v; return api; },
        async maybeSingle() { return { data: tables[table].find((r) => matches(r, f)) || null, error: null }; },
        async upsert(row) {
          inserts += 1;
          if (!tables[table].some((r) => r.attempt_uuid === row.attempt_uuid)) tables[table].push({ ...row, graded_at: '2026-09-24T05:00:00.000Z' });
          return { error: null };
        },
      };
      return api;
    },
  };
}

function fakeRes() {
  const r = { statusCode: 200, headers: {}, body: undefined,
    status(c) { r.statusCode = c; return r; }, json(b) { r.body = b; return r; }, setHeader(k, v) { r.headers[k] = v; } };
  return r;
}
async function call(admin, body, headers = {}) {
  const res = fakeRes();
  await createExamGradeHandler({ getAdmin: () => admin, config: () => passportConfig({}) })(
    { method: 'POST', headers: { host: 'bls.morroo.com', ...headers }, body }, res);
  return res;
}
const base = (extra = {}) => ({ attemptUuid: UUID, course: 'bls', kind: 'pre', setId: set.id, answers: allRight(), studentLocalId: 'local-1', ...extra });

beforeEach(() => _resetRateLimitStore());

test('grades a real attempt server-side and stores exactly one row', async () => {
  const admin = fakeAdmin();
  const res = await call(admin, base({ score: 5, passed: false }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.grade, {
    attemptUuid: UUID, lessonId: 'bls-pre-test', setId: set.id, score: 100, correctCount: set.questions.length,
    total: set.questions.length, passPercent: 70, passed: true, gradedAt: '2026-09-24T05:00:00.000Z',
  });
  const row = admin.tables.exam_grades[0];
  assert.equal(row.course_mode, 'bls');
  assert.equal(row.student_local_id, 'local-1');
  assert.equal(row.answers[0].correct, true);
  assert.equal(row.source, 'online');
});

test('client-sent score/passed/correct flags are ignored', async () => {
  const admin = fakeAdmin();
  const res = await call(admin, base({ answers: answersFor((q) => q.choices.find((c) => c.id !== q.correctId).id), score: 100, passed: true }));
  assert.deepEqual([res.body.grade.score, res.body.grade.passed], [0, false]);
});

test('same uuid again → the stored grade, never re-graded (retry / second device / sync)', async () => {
  const admin = fakeAdmin();
  await call(admin, base());
  const again = await call(admin, base({ answers: answersFor((q) => q.choices.find((c) => c.id !== q.correctId).id) }));
  assert.equal(again.body.grade.score, 100);
  assert.equal(admin.inserts, 1);
  const lookup = await call(admin, { attemptUuid: UUID });
  assert.equal(lookup.body.grade.passed, true);
});

test('lookup of an ungraded uuid → 404 not_found', async () => {
  const res = await call(fakeAdmin(), { attemptUuid: UUID });
  assert.deepEqual([res.statusCode, res.body.reason], [404, 'not_found']);
});

test('incomplete set / unknown set / wrong course → 422 or 400, nothing stored', async () => {
  const admin = fakeAdmin();
  assert.deepEqual([(await call(admin, base({ answers: allRight().slice(0, 3) }))).body.reason], ['incomplete']);
  assert.deepEqual([(await call(admin, base({ setId: 'bls-set-a' }))).body.reason], ['unknown_set'], 'a post-test set sent as pre');
  assert.equal((await call(admin, base({ course: 'nope' }))).statusCode, 400);
  assert.equal((await call(admin, base({ kind: 'final' }))).statusCode, 400);
  assert.equal((await call(admin, base({ attemptUuid: 'x' }))).statusCode, 400);
  assert.equal(admin.tables.exam_grades.length, 0);
});

test('links class + student only when the student really is in that class', async () => {
  let admin = fakeAdmin();
  await call(admin, base({ classCode: 'abc123', studentPk: PK }));
  assert.deepEqual([admin.tables.exam_grades[0].class_id, admin.tables.exam_grades[0].student_pk], [CLASS_ID, PK]);
  admin = fakeAdmin();
  await call(admin, base({ classCode: 'ABC123', studentPk: '22222222-2222-4222-8222-222222222222' }));
  assert.deepEqual([admin.tables.exam_grades[0].class_id, admin.tables.exam_grades[0].student_pk], [null, null]);
  assert.equal(admin.tables.exam_grades[0].passed, true, 'still graded');
});

test('cross-site POST refused; 503 when Supabase is not configured', async () => {
  assert.equal((await call(fakeAdmin(), base(), { origin: 'https://evil.com' })).statusCode, 403);
  const res = fakeRes();
  await createExamGradeHandler({ getAdmin: () => { throw new Error('no env'); } })({ method: 'POST', headers: {}, body: base() }, res);
  assert.equal(res.statusCode, 503);
});
