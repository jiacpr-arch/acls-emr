import { supabase } from './supabase';

const TBL_BANK = 'acls_assessment_banks';
const TBL_SET = 'acls_assessment_sets';
const TBL_Q = 'acls_assessment_questions';
const TBL_ATTEMPT = 'acls_assessment_attempts';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function fetchBank(bankId) {
  const { data, error } = await supabase
    .from(TBL_BANK)
    .select('*')
    .eq('id', bankId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchActiveSets(bankId) {
  const { data, error } = await supabase
    .from(TBL_SET)
    .select('*')
    .eq('bank_id', bankId)
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchQuestions(setId) {
  const { data, error } = await supabase
    .from(TBL_Q)
    .select('*')
    .eq('set_id', setId)
    .eq('active', true)
    .order('q_number', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toClientQuestion);
}

function toClientQuestion(row) {
  return {
    id: row.id,
    topic: row.topic,
    difficulty: row.difficulty,
    question: row.question,
    choices: row.choices,
    correctId: row.correct_id,
    explanation: row.explanation,
    reference: row.reference,
  };
}

// Loads a randomly-selected active set for a bank and returns its questions.
// Falls back to the first set if random pick errors.
export async function loadExamForBank(bankId, { excludeSetId = null } = {}) {
  const [bank, sets] = await Promise.all([
    fetchBank(bankId),
    fetchActiveSets(bankId),
  ]);
  if (!sets.length) throw new Error(`No active sets for bank ${bankId}`);
  const candidates = excludeSetId
    ? sets.filter(s => s.id !== excludeSetId)
    : sets;
  const pool = candidates.length ? candidates : sets;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const questions = await fetchQuestions(chosen.id);
  const ordered = bank.shuffle_questions ? shuffle(questions) : questions;
  return { bank, set: chosen, questions: ordered };
}

export async function loadExamForSet(setId) {
  const { data: setRow, error: setErr } = await supabase
    .from(TBL_SET).select('*').eq('id', setId).single();
  if (setErr) throw setErr;
  const bank = await fetchBank(setRow.bank_id);
  const questions = await fetchQuestions(setId);
  return { bank, set: setRow, questions: bank.shuffle_questions ? shuffle(questions) : questions };
}

export async function submitAttempt(payload) {
  // payload: { studentLocalId, studentCode, studentName, bankId, setId,
  //   score, totalQuestions, correctCount, passed, durationSeconds, answers,
  //   startedAt, finishedAt }
  const row = {
    student_local_id: payload.studentLocalId ?? null,
    student_code: payload.studentCode ?? null,
    student_name: payload.studentName ?? null,
    bank_id: payload.bankId,
    set_id: payload.setId ?? null,
    score: payload.score,
    total_questions: payload.totalQuestions,
    correct_count: payload.correctCount,
    passed: payload.passed,
    duration_seconds: payload.durationSeconds ?? null,
    answers: payload.answers,
    started_at: payload.startedAt ?? null,
    finished_at: payload.finishedAt ?? new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TBL_ATTEMPT)
    .insert(row)
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function fetchAttemptsByStudent(studentLocalId, bankId = null) {
  let q = supabase
    .from(TBL_ATTEMPT)
    .select('*')
    .eq('student_local_id', studentLocalId)
    .order('finished_at', { ascending: false });
  if (bankId) q = q.eq('bank_id', bankId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export const ASSESSMENT_BANK = {
  PRETEST: 'pretest',
  POSTTEST: 'posttest',
};
