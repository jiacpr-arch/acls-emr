// Active pre-test source — switches between ACLS and BLS-HCP based on VITE_COURSE_MODE.
//
// ACLS pre-test lives in Supabase (acls_assessment_* tables) and is loaded via
// services/assessmentService.js. BLS pre-test is a hardcoded JS set (same pattern
// as the BLS post-test). `loadActivePreTestExam()` gives the page a single shape
// regardless of mode.
import { IS_BLS } from '../config/courseMode';
import * as bls from '../courses/bls-hcp/preTest';
import {
  PRE_TEST_BANK_ID as ACLS_PRE_TEST_BANK_ID,
  PRE_TEST_LESSON_ID as ACLS_PRE_TEST_LESSON_ID,
  PRE_TEST_PASS_PERCENT as ACLS_PRE_TEST_PASS_PERCENT,
  PRE_TEST_QUESTION_COUNT as ACLS_PRE_TEST_QUESTION_COUNT,
} from './assessment';
import { loadExamForBank } from '../services/assessmentService';

export const PRE_TEST_LESSON_ID = IS_BLS ? bls.PRE_TEST_LESSON_ID : ACLS_PRE_TEST_LESSON_ID;
export const PRE_TEST_BANK_ID = IS_BLS ? bls.PRE_TEST_BANK_ID : ACLS_PRE_TEST_BANK_ID;
export const PRE_TEST_PASS_PERCENT = IS_BLS ? bls.PRE_TEST_PASS_PERCENT : ACLS_PRE_TEST_PASS_PERCENT;
export const PRE_TEST_QUESTION_COUNT = IS_BLS ? bls.PRE_TEST_QUESTION_COUNT : ACLS_PRE_TEST_QUESTION_COUNT;

// Unified loader. Returns { bank, set, questions } where:
//   bank.pass_percent / bank.question_count match the active course
//   set:  { id, title }
//   questions: [{ id, question, choices, correctId, explanation, topic? }]
export async function loadActivePreTestExam() {
  if (IS_BLS) {
    const set = bls.pickRandomPreTestSet();
    return {
      bank: {
        pass_percent: bls.PRE_TEST_PASS_PERCENT,
        question_count: bls.PRE_TEST_QUESTION_COUNT,
        shuffle_questions: false,
      },
      set: { id: set.id, title: set.title },
      questions: set.questions,
    };
  }
  return loadExamForBank(ACLS_PRE_TEST_BANK_ID);
}
