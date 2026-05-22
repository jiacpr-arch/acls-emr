// Assessment constants — question content lives in Supabase
// (tables: acls_assessment_banks / _sets / _questions / _attempts).
//
// Bank ids must match rows in acls_assessment_banks.

export const PRE_TEST_BANK_ID = 'pretest';
export const POST_TEST_BANK_ID = 'posttest';

// Dexie's quizAttempts table key — preserved so existing local records stay readable.
export const PRE_TEST_LESSON_ID = 'pre-test';
export const POST_TEST_LESSON_ID = 'post-test';

// Display defaults (overridden by bank rows when loaded from Supabase).
export const PRE_TEST_PASS_PERCENT = 70;
export const PRE_TEST_QUESTION_COUNT = 20;

export const POST_TEST_PASS_PERCENT = 85;
export const POST_TEST_QUESTION_COUNT = 30;
