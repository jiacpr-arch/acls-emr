// Active pre-test source — switches between course packages based on VITE_COURSE_MODE.
//
// ACLS pre-test lives in Supabase (acls_assessment_* tables) and is loaded via
// services/assessmentService.js. BLS and the airway/defib/iv skill courses use
// hardcoded JS sets (same pattern as their post-tests). `loadActivePreTestExam()`
// gives the page a single shape regardless of mode.
import { IS_BLS, IS_AIRWAY, IS_DEFIB, IS_IV } from '../config/courseMode';
import * as bls from '../courses/bls-hcp/preTest';
import * as airway from '../courses/airway/preTest';
import * as defib from '../courses/defib/preTest';
import * as iv from '../courses/iv/preTest';
import {
  PRE_TEST_BANK_ID as ACLS_PRE_TEST_BANK_ID,
  PRE_TEST_LESSON_ID as ACLS_PRE_TEST_LESSON_ID,
  PRE_TEST_PASS_PERCENT as ACLS_PRE_TEST_PASS_PERCENT,
  PRE_TEST_QUESTION_COUNT as ACLS_PRE_TEST_QUESTION_COUNT,
} from './assessment';
import { loadExamForBank } from '../services/assessmentService';

// Local (non-Supabase) course, or null when the active course uses Supabase (ACLS).
const localCourse = IS_BLS ? bls
  : IS_AIRWAY ? airway
  : IS_DEFIB ? defib
  : IS_IV ? iv
  : null;

export const PRE_TEST_LESSON_ID = localCourse ? localCourse.PRE_TEST_LESSON_ID : ACLS_PRE_TEST_LESSON_ID;
export const PRE_TEST_BANK_ID = localCourse ? localCourse.PRE_TEST_BANK_ID : ACLS_PRE_TEST_BANK_ID;
export const PRE_TEST_PASS_PERCENT = localCourse ? localCourse.PRE_TEST_PASS_PERCENT : ACLS_PRE_TEST_PASS_PERCENT;
export const PRE_TEST_QUESTION_COUNT = localCourse ? localCourse.PRE_TEST_QUESTION_COUNT : ACLS_PRE_TEST_QUESTION_COUNT;

// Unified loader. Returns { bank, set, questions } where:
//   bank.pass_percent / bank.question_count match the active course
//   set:  { id, title }
//   questions: [{ id, question, choices, correctId, explanation, topic? }]
export async function loadActivePreTestExam() {
  if (localCourse) {
    const set = localCourse.pickRandomPreTestSet();
    return {
      bank: {
        pass_percent: localCourse.PRE_TEST_PASS_PERCENT,
        question_count: localCourse.PRE_TEST_QUESTION_COUNT,
        shuffle_questions: false,
      },
      set: { id: set.id, title: set.title },
      questions: set.questions,
    };
  }
  return loadExamForBank(ACLS_PRE_TEST_BANK_ID);
}
