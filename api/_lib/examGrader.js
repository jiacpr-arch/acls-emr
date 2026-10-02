import { LOCAL_EXAMS, ACLS_EXAMS } from './examKeys.js';

// Re-scores a submitted pre/post-test against the server's own copy of the answer key, using the
// same formula as the exam pages (PreTestExam.jsx / PostTestExam.jsx): score =
// round(correct / served * 100), passed = score >= passPercent. What makes a result trustworthy
// is not the arithmetic but the checks: every question of the served set must be answered (no
// scoring a hand-picked subset), every chosenId must be one of that question's own choices, and
// the set must be a real set of that course/exam.

const MAX_ANSWERS = 200;

/**
 * key: { mode: 'set' | 'pool', questions: [{ id, choices: [{id}], correctId, difficulty? }],
 *        activeIds?: Set (set mode: the ids a served exam contains), poolConfig?: {easy: n, ...},
 *        passPercent }
 * answers: [{ questionId, chosenId }]
 * → { ok: true, score, correctCount, total, passed, passPercent, detailed } | { ok: false, reason }
 */
export function gradeAnswers(key, answers) {
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS) {
    return { ok: false, reason: 'bad_answers' };
  }
  const byId = new Map(key.questions.map((q) => [q.id, q]));
  const seen = new Set();
  for (const a of answers) {
    if (!a || typeof a.questionId !== 'string' || !byId.has(a.questionId)) return { ok: false, reason: 'unknown_question' };
    if (seen.has(a.questionId)) return { ok: false, reason: 'duplicate_question' };
    seen.add(a.questionId);
    const q = byId.get(a.questionId);
    if (a.chosenId != null && !(q.choices || []).some((c) => c.id === a.chosenId)) return { ok: false, reason: 'bad_choice' };
  }

  if (key.mode === 'pool') {
    const want = Object.entries(key.poolConfig || {}).filter(([, n]) => (n | 0) > 0);
    const total = want.reduce((sum, [, n]) => sum + (n | 0), 0);
    if (answers.length !== total) return { ok: false, reason: 'incomplete' };
    const got = {};
    for (const a of answers) {
      const d = byId.get(a.questionId).difficulty || 'medium';
      got[d] = (got[d] || 0) + 1;
    }
    for (const [d, n] of want) if ((got[d] || 0) !== (n | 0)) return { ok: false, reason: 'incomplete' };
  } else {
    const served = key.activeIds || new Set(key.questions.map((q) => q.id));
    if (answers.length !== served.size || answers.some((a) => !served.has(a.questionId))) {
      return { ok: false, reason: 'incomplete' };
    }
  }

  const detailed = answers.map((a) => ({
    questionId: a.questionId,
    chosenId: a.chosenId ?? null,
    correct: a.chosenId != null && a.chosenId === byId.get(a.questionId).correctId,
  }));
  const correctCount = detailed.filter((d) => d.correct).length;
  const total = detailed.length;
  const score = Math.round((correctCount / total) * 100);
  return { ok: true, score, correctCount, total, passed: score >= key.passPercent, passPercent: key.passPercent, detailed };
}

/**
 * The answer key for one set of one course's pre/post-test, or null if there is no such set.
 * Bundled courses come from examKeys.js; ACLS from Supabase (service role — the only reader
 * that needs correct_id). → { lessonId, bankId, key }
 */
export async function loadExamKey({ course, kind, setId }, { getAdmin } = {}) {
  if (typeof setId !== 'string' || !setId || setId.length > 80) return null;
  const local = LOCAL_EXAMS[course]?.[kind];
  if (local) {
    const set = local.sets.find((s) => s.id === setId);
    if (!set) return null;
    return {
      lessonId: local.lessonId,
      bankId: local.bankId,
      key: { mode: 'set', questions: set.questions, passPercent: local.passPercent },
    };
  }
  const acls = course === 'acls' ? ACLS_EXAMS[kind] : null;
  if (!acls) return null;
  const admin = getAdmin();
  const [{ data: bank, error: bankErr }, { data: set, error: setErr }] = await Promise.all([
    admin.from('acls_assessment_banks').select('id, pass_percent').eq('id', acls.bankId).maybeSingle(),
    admin.from('acls_assessment_sets').select('id, bank_id, selection_mode, selection_config').eq('id', setId).maybeSingle(),
  ]);
  if (bankErr || setErr) throw new Error('exam key lookup failed');
  if (!bank || !set || set.bank_id !== acls.bankId) return null;
  // All of the set's questions, active or not: an attempt taken before a question was retired
  // still refers to it. What a served exam must contain is judged from the active ones.
  const { data: rows, error: qErr } = await admin
    .from('acls_assessment_questions').select('id, choices, correct_id, difficulty, active').eq('set_id', setId);
  if (qErr) throw new Error('exam key lookup failed');
  const questions = (rows || []).map((r) => ({ id: r.id, choices: r.choices, correctId: r.correct_id, difficulty: r.difficulty }));
  if (!questions.length) return null;
  const pool = set.selection_mode === 'pool' && set.selection_config;
  return {
    lessonId: acls.lessonId,
    bankId: acls.bankId,
    key: pool
      ? { mode: 'pool', questions, poolConfig: set.selection_config, passPercent: Number(bank.pass_percent) }
      : { mode: 'set', questions, activeIds: new Set((rows || []).filter((r) => r.active).map((r) => r.id)), passPercent: Number(bank.pass_percent) },
  };
}
