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
    .select('id, bank_id, title, sort_order, active, selection_mode, selection_config')
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

// Pool sampling: given all questions in a set and a config like
// {easy: 6, medium: 7, hard: 7}, pick that many from each difficulty bucket.
// Within each bucket, prefers questions on topics not yet picked, so a single
// exam covers as many topics as possible. Returns shuffled selection.
function samplePoolByDifficulty(questions, config) {
  const buckets = {};
  for (const q of questions) {
    const d = q.difficulty || 'medium';
    (buckets[d] ||= []).push(q);
  }
  const picked = [];
  const usedTopics = new Set();
  // Sort difficulty keys for deterministic processing order
  const difficulties = Object.keys(config).sort();
  for (const diff of difficulties) {
    const want = config[diff] | 0;
    if (want <= 0) continue;
    const bucket = shuffle(buckets[diff] ?? []);
    if (bucket.length < want) {
      throw new Error(
        `Pool too small for difficulty "${diff}": have ${bucket.length}, need ${want}`,
      );
    }
    // Two-pass pick: first pass takes questions on fresh topics, second pass fills the rest.
    const fresh = [];
    const rest = [];
    for (const q of bucket) {
      (usedTopics.has(q.topic) ? rest : fresh).push(q);
    }
    const ordered = [...fresh, ...rest];
    for (let i = 0; i < want; i++) {
      const q = ordered[i];
      picked.push(q);
      usedTopics.add(q.topic);
    }
  }
  return shuffle(picked);
}

function orderQuestionsForBank(bank, set, questions) {
  if (set?.selection_mode === 'pool' && set.selection_config) {
    return samplePoolByDifficulty(questions, set.selection_config);
  }
  return bank.shuffle_questions ? shuffle(questions) : questions;
}

// Loads an active set for a bank and returns its questions.
// - For "set" mode (default): randomly picks one active set, returns its questions in order/shuffled.
// - For "pool" mode: samples N questions per difficulty from the set's full question pool.
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
  const ordered = orderQuestionsForBank(bank, chosen, questions);
  return { bank, set: chosen, questions: ordered };
}

export async function loadExamForSet(setId) {
  const { data: setRow, error: setErr } = await supabase
    .from(TBL_SET)
    .select('id, bank_id, title, sort_order, active, selection_mode, selection_config')
    .eq('id', setId)
    .single();
  if (setErr) throw setErr;
  const bank = await fetchBank(setRow.bank_id);
  const questions = await fetchQuestions(setId);
  const ordered = orderQuestionsForBank(bank, setRow, questions);
  return { bank, set: setRow, questions: ordered };
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
