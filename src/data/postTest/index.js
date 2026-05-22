import { setA } from './setA';
import { setB } from './setB';
import { setC } from './setC';

export const POST_TEST_LESSON_ID = 'post-test';
export const POST_TEST_PASS_PERCENT = 85;
export const POST_TEST_QUESTION_COUNT = 50;

export const postTestSets = [setA, setB, setC];

export function getPostTestSetById(setId) {
  return postTestSets.find(s => s.id === setId) || null;
}

export function pickRandomPostTestSet(excludeId = null) {
  const pool = excludeId
    ? postTestSets.filter(s => s.id !== excludeId)
    : postTestSets;
  const choices = pool.length ? pool : postTestSets;
  return choices[Math.floor(Math.random() * choices.length)];
}
