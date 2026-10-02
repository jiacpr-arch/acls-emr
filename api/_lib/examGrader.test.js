import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeAnswers, loadExamKey } from './examGrader.js';
import { LOCAL_EXAMS } from './examKeys.js';

const blsPost = LOCAL_EXAMS.bls.post.sets[0];
const key = { mode: 'set', questions: blsPost.questions, passPercent: LOCAL_EXAMS.bls.post.passPercent };
const allCorrect = () => blsPost.questions.map((q) => ({ questionId: q.id, chosenId: q.correctId }));
const wrongChoice = (q) => q.choices.find((c) => c.id !== q.correctId).id;

test('a fully correct real BLS post-test set scores 100 and passes', () => {
  const r = gradeAnswers(key, allCorrect());
  assert.deepEqual([r.ok, r.score, r.correctCount, r.total, r.passed], [true, 100, blsPost.questions.length, blsPost.questions.length, true]);
});

test('score uses the exam page formula: round(correct/served*100) vs the pass mark (84 for BLS post)', () => {
  const n = blsPost.questions.length; // 23
  const answers = allCorrect();
  for (let i = 0; i < 4; i++) answers[i].chosenId = wrongChoice(blsPost.questions[i]); // 19/23 = 82.6 → 83 → fail
  let r = gradeAnswers(key, answers);
  assert.deepEqual([r.score, r.passed], [Math.round((n - 4) / n * 100), false]);
  answers[3].chosenId = blsPost.questions[3].correctId; // 20/23 = 87 → pass
  r = gradeAnswers(key, answers);
  assert.deepEqual([r.score, r.passed], [Math.round((n - 3) / n * 100), true]);
});

test('unanswered (null) counts as wrong, not as missing', () => {
  const answers = allCorrect();
  answers[0].chosenId = null;
  const r = gradeAnswers(key, answers);
  assert.equal(r.correctCount, blsPost.questions.length - 1);
  assert.equal(r.detailed[0].correct, false);
});

test('refuses a hand-picked subset of the set (the "1 correct answer = 100%" trick)', () => {
  assert.deepEqual(gradeAnswers(key, allCorrect().slice(0, 1)), { ok: false, reason: 'incomplete' });
  assert.deepEqual(gradeAnswers(key, allCorrect().slice(1)), { ok: false, reason: 'incomplete' });
});

test('refuses duplicates, unknown questions and choices that are not that question\'s own', () => {
  const dup = allCorrect(); dup[1] = { ...dup[0] };
  assert.equal(gradeAnswers(key, dup).reason, 'duplicate_question');
  const unknown = allCorrect(); unknown[0] = { questionId: 'nope', chosenId: 'a' };
  assert.equal(gradeAnswers(key, unknown).reason, 'unknown_question');
  const badChoice = allCorrect(); badChoice[0].chosenId = 'zzz';
  assert.equal(gradeAnswers(key, badChoice).reason, 'bad_choice');
  assert.equal(gradeAnswers(key, []).reason, 'bad_answers');
  assert.equal(gradeAnswers(key, null).reason, 'bad_answers');
});

test('the client-side `correct` flag / score in the payload is ignored', () => {
  const answers = blsPost.questions.map((q) => ({ questionId: q.id, chosenId: wrongChoice(q), correct: true, score: 100 }));
  const r = gradeAnswers(key, answers);
  assert.deepEqual([r.score, r.passed], [0, false]);
});

// ACLS pool mode: 20 drawn from 80 by difficulty.
const pool = [];
for (const [d, n] of [['easy', 20], ['medium', 30], ['hard', 30]]) {
  for (let i = 0; i < n; i++) pool.push({ id: `${d}-${i}`, difficulty: d, correctId: 'a', choices: [{ id: 'a' }, { id: 'b' }] });
}
const poolKey = { mode: 'pool', questions: pool, poolConfig: { easy: 6, medium: 7, hard: 7 }, passPercent: 70 };
const draw = (e, m, h) => [
  ...pool.filter((q) => q.difficulty === 'easy').slice(0, e),
  ...pool.filter((q) => q.difficulty === 'medium').slice(0, m),
  ...pool.filter((q) => q.difficulty === 'hard').slice(0, h),
].map((q) => ({ questionId: q.id, chosenId: 'a' }));

test('ACLS pool: a real 6/7/7 draw is graded', () => {
  const r = gradeAnswers(poolKey, draw(6, 7, 7));
  assert.deepEqual([r.ok, r.total, r.score], [true, 20, 100]);
});

test('ACLS pool: a draw with the wrong size or difficulty mix is refused (no cherry-picking easy ones)', () => {
  assert.equal(gradeAnswers(poolKey, draw(6, 7, 6)).reason, 'incomplete');
  assert.equal(gradeAnswers(poolKey, draw(20, 0, 0)).reason, 'incomplete');
  assert.equal(gradeAnswers(poolKey, draw(8, 6, 6)).reason, 'incomplete');
});

test('loadExamKey: bundled courses by set id; unknown course/kind/set → null', async () => {
  const k = await loadExamKey({ course: 'iv', kind: 'pre', setId: 'iv-pretest-b' });
  assert.equal(k.lessonId, 'iv-pre-test');
  assert.equal(k.key.questions.length, 24);
  assert.equal(await loadExamKey({ course: 'iv', kind: 'pre', setId: 'bls-set-a' }), null, 'a set of another course');
  assert.equal(await loadExamKey({ course: 'bls', kind: 'mid', setId: 'bls-set-a' }), null);
  assert.equal(await loadExamKey({ course: 'nope', kind: 'pre', setId: 'x' }), null);
});

function fakeAclsAdmin({ bank, set, questions }) {
  return {
    from(table) {
      const rows = { acls_assessment_banks: bank ? [bank] : [], acls_assessment_sets: set ? [set] : [], acls_assessment_questions: questions }[table];
      const f = {};
      const api = {
        select() { return api; },
        eq(k, v) { f[k] = v; return api; },
        async maybeSingle() { return { data: rows.find((r) => Object.entries(f).every(([k, v]) => r[k] === v)) || null, error: null }; },
        then(resolve) { return resolve({ data: rows.filter((r) => Object.entries(f).every(([k, v]) => r[k] === v)), error: null }); },
      };
      return api;
    },
  };
}

test('loadExamKey: ACLS reads bank pass mark + pool config + keys from the DB (incl. retired questions)', async () => {
  const admin = fakeAclsAdmin({
    bank: { id: 'pretest', pass_percent: 70 },
    set: { id: 'pretest-default', bank_id: 'pretest', selection_mode: 'pool', selection_config: { easy: 6, medium: 7, hard: 7 } },
    questions: [
      { id: 'q1', set_id: 'pretest-default', choices: [{ id: 'a' }], correct_id: 'a', difficulty: 'easy', active: true },
      { id: 'q2', set_id: 'pretest-default', choices: [{ id: 'a' }], correct_id: 'a', difficulty: 'hard', active: false },
    ],
  });
  const k = await loadExamKey({ course: 'acls', kind: 'pre', setId: 'pretest-default' }, { getAdmin: () => admin });
  assert.equal(k.lessonId, 'pre-test');
  assert.equal(k.key.mode, 'pool');
  assert.equal(k.key.passPercent, 70);
  assert.deepEqual(k.key.questions.map((q) => q.id), ['q1', 'q2']);
});

test('loadExamKey: ACLS set mode serves only active questions; a post-test set id is not a pre-test set', async () => {
  const admin = fakeAclsAdmin({
    bank: { id: 'posttest', pass_percent: 85 },
    set: { id: 'posttest-A', bank_id: 'posttest', selection_mode: 'set', selection_config: null },
    questions: [
      { id: 'p1', set_id: 'posttest-A', choices: [{ id: 'a' }], correct_id: 'a', active: true },
      { id: 'p2', set_id: 'posttest-A', choices: [{ id: 'a' }], correct_id: 'a', active: false },
    ],
  });
  const k = await loadExamKey({ course: 'acls', kind: 'post', setId: 'posttest-A' }, { getAdmin: () => admin });
  assert.deepEqual([...k.key.activeIds], ['p1']);
  assert.equal(gradeAnswers(k.key, [{ questionId: 'p1', chosenId: 'a' }]).score, 100);
  assert.equal(await loadExamKey({ course: 'acls', kind: 'pre', setId: 'posttest-A' }, { getAdmin: () => admin }), null);
});
