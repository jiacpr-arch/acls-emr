// Active post-test source — switches between course packages based on VITE_COURSE_MODE.
//
// ACLS post-test lives in Supabase (acls_assessment_* tables) and is loaded via
// services/assessmentService.js. BLS and the airway/defib/iv skill courses use
// hardcoded JS sets. `loadActivePostTestExam()` gives the page a single shape
// regardless of mode.
import { IS_BLS, IS_AIRWAY, IS_DEFIB, IS_IV } from '../config/courseMode';
import * as bls from '../courses/bls-hcp/postTest';
import * as airway from '../courses/airway/postTest';
import * as defib from '../courses/defib/postTest';
import * as iv from '../courses/iv/postTest';
import {
  POST_TEST_BANK_ID,
  POST_TEST_LESSON_ID as ACLS_POST_TEST_LESSON_ID,
  POST_TEST_PASS_PERCENT as ACLS_POST_TEST_PASS_PERCENT,
  POST_TEST_QUESTION_COUNT as ACLS_POST_TEST_QUESTION_COUNT,
} from './assessment';
import { loadExamForBank } from '../services/assessmentService';

// Local (non-Supabase) course, or null when the active course uses Supabase (ACLS).
const localCourse = IS_BLS ? bls
  : IS_AIRWAY ? airway
  : IS_DEFIB ? defib
  : IS_IV ? iv
  : null;

export const POST_TEST_LESSON_ID = localCourse ? localCourse.POST_TEST_LESSON_ID : ACLS_POST_TEST_LESSON_ID;
export const POST_TEST_PASS_PERCENT = localCourse ? localCourse.POST_TEST_PASS_PERCENT : ACLS_POST_TEST_PASS_PERCENT;
export const POST_TEST_QUESTION_COUNT = localCourse ? localCourse.POST_TEST_QUESTION_COUNT : ACLS_POST_TEST_QUESTION_COUNT;

// Local-course-only helpers — ACLS reads sets/questions from Supabase via assessmentService.
export const postTestSets = localCourse ? localCourse.postTestSets : [];
export const getPostTestSetById = localCourse ? localCourse.getPostTestSetById : (() => null);
export const pickRandomPostTestSet = localCourse ? localCourse.pickRandomPostTestSet : (() => null);

// Unified loader. Returns { bank, set, questions } where:
//   bank.pass_percent / bank.shuffle_questions match the active course
//   set:  { id, title }
//   questions: [{ id, question, choices, correctId, explanation, topic? }]
export async function loadActivePostTestExam({ excludeSetId = null } = {}) {
  if (localCourse) {
    const set = localCourse.pickRandomPostTestSet(excludeSetId);
    return {
      bank: {
        pass_percent: localCourse.POST_TEST_PASS_PERCENT,
        question_count: localCourse.POST_TEST_QUESTION_COUNT,
        shuffle_questions: false,
      },
      set: { id: set.id, title: set.title },
      questions: set.questions,
    };
  }
  return loadExamForBank(POST_TEST_BANK_ID, { excludeSetId });
}
