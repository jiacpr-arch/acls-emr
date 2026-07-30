import { setA } from './setA';
import { pickRandomSet, getSetById } from '../../shared/testSets';

export const POST_TEST_LESSON_ID = 'iv-post-test';
export const POST_TEST_PASS_PERCENT = 80;
export const POST_TEST_QUESTION_COUNT = 20;

export const postTestSets = [setA];

export function getPostTestSetById(setId) {
  return getSetById(postTestSets, setId);
}

export function pickRandomPostTestSet(excludeId = null) {
  return pickRandomSet(postTestSets, excludeId);
}
