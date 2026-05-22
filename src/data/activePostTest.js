// Active post-test source — switches between ACLS and BLS-HCP based on VITE_COURSE_MODE.
import { IS_BLS } from '../config/courseMode';
import * as acls from './postTest';
import * as bls from '../courses/bls-hcp/postTest';

const src = IS_BLS ? bls : acls;

export const POST_TEST_LESSON_ID = src.POST_TEST_LESSON_ID;
export const POST_TEST_PASS_PERCENT = src.POST_TEST_PASS_PERCENT;
export const POST_TEST_QUESTION_COUNT = src.POST_TEST_QUESTION_COUNT;
export const postTestSets = src.postTestSets;
export const getPostTestSetById = src.getPostTestSetById;
export const pickRandomPostTestSet = src.pickRandomPostTestSet;
