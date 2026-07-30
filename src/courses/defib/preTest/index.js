import { setA } from './setA';
import { pickRandomSet, getSetById } from '../../shared/testSets';

export const PRE_TEST_LESSON_ID = 'df-pre-test';
export const PRE_TEST_BANK_ID = 'df-pretest';
export const PRE_TEST_PASS_PERCENT = 70;
export const PRE_TEST_QUESTION_COUNT = 15;

export const preTestSets = [setA];

export function getPreTestSetById(setId) {
  return getSetById(preTestSets, setId);
}

export function pickRandomPreTestSet(excludeId = null) {
  return pickRandomSet(preTestSets, excludeId);
}
