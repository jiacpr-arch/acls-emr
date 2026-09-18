import { setA } from './setA';
import { setB } from './setB';
import { pickRandomSet, getSetById } from '../../shared/testSets';

export const PRE_TEST_LESSON_ID = 'iv-pre-test';
export const PRE_TEST_BANK_ID = 'iv-pretest';
export const PRE_TEST_PASS_PERCENT = 70;
export const PRE_TEST_QUESTION_COUNT = 15;

export const preTestSets = [setA, setB];

export function getPreTestSetById(setId) {
  return getSetById(preTestSets, setId);
}

export function pickRandomPreTestSet(excludeId = null) {
  return pickRandomSet(preTestSets, excludeId);
}
