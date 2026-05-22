// Active post-test source — switches between ACLS and BLS-HCP based on VITE_COURSE_MODE.
//
// ACLS post-test now lives in Supabase (acls_assessment_* tables) and is loaded via
// services/assessmentService.js. BLS post-test stays as hardcoded JS sets.
// `loadActivePostTestExam()` gives the page a single shape regardless of mode.
import { IS_BLS } from '../config/courseMode';
import * as bls from '../courses/bls-hcp/postTest';
import {
  POST_TEST_BANK_ID,
  POST_TEST_LESSON_ID as ACLS_POST_TEST_LESSON_ID,
  POST_TEST_PASS_PERCENT as ACLS_POST_TEST_PASS_PERCENT,
  POST_TEST_QUESTION_COUNT as ACLS_POST_TEST_QUESTION_COUNT,
} from './assessment';
import { loadExamForBank } from '../services/assessmentService';

export const POST_TEST_LESSON_ID = IS_BLS ? bls.POST_TEST_LESSON_ID : ACLS_POST_TEST_LESSON_ID;
export const POST_TEST_PASS_PERCENT = IS_BLS ? bls.POST_TEST_PASS_PERCENT : ACLS_POST_TEST_PASS_PERCENT;
export const POST_TEST_QUESTION_COUNT = IS_BLS ? bls.POST_TEST_QUESTION_COUNT : ACLS_POST_TEST_QUESTION_COUNT;

// BLS-only helpers — ACLS reads sets/questions from Supabase via assessmentService.
export const postTestSets = IS_BLS ? bls.postTestSets : [];
export const getPostTestSetById = IS_BLS ? bls.getPostTestSetById : (() => null);
export const pickRandomPostTestSet = IS_BLS ? bls.pickRandomPostTestSet : (() => null);

// Unified loader. Returns { bank, set, questions } where:
//   bank.pass_percent / bank.shuffle_questions match the active course
//   set:  { id, title }
//   questions: [{ id, question, choices, correctId, explanation, topic? }]
export async function loadActivePostTestExam({ excludeSetId = null } = {}) {
  if (IS_BLS) {
    const set = bls.pickRandomPostTestSet(excludeSetId);
    return {
      bank: {
        pass_percent: bls.POST_TEST_PASS_PERCENT,
        question_count: bls.POST_TEST_QUESTION_COUNT,
        shuffle_questions: false,
      },
      set: { id: set.id, title: set.title },
      questions: set.questions,
    };
  }
  return loadExamForBank(POST_TEST_BANK_ID, { excludeSetId });
}
