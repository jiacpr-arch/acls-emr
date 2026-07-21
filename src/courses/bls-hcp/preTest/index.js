import { setA } from './setA';
import { setB } from './setB';
import { setC } from './setC';
import { setD } from './setD';
import { setE } from './setE';

export const PRE_TEST_LESSON_ID = 'bls-pre-test';
export const PRE_TEST_BANK_ID = 'bls-pretest';
// Pre-test เป็นแบบวัดพื้นฐานก่อนเรียน — ใช้เกณฑ์เดียวกับ ACLS (ไม่ใช่เงื่อนไขใบประกาศ)
export const PRE_TEST_PASS_PERCENT = 70;
export const PRE_TEST_QUESTION_COUNT = 20;

export const preTestSets = [setA, setB, setC, setD, setE];

export function getPreTestSetById(setId) {
  return preTestSets.find(s => s.id === setId) || null;
}

export function pickRandomPreTestSet(excludeId = null) {
  const pool = excludeId
    ? preTestSets.filter(s => s.id !== excludeId)
    : preTestSets;
  const choices = pool.length ? pool : preTestSets;
  return choices[Math.floor(Math.random() * choices.length)];
}
