// Server-side answer keys for the pre/post-tests that ship as JS files (BLS + the airway/defib/iv
// skill courses). Imports each set file directly with an explicit .js path — the courses'
// preTest/index.js files use extensionless imports that only the Vite bundler resolves, so they
// can't be loaded by a Vercel function or `node --test`. passPercent / lessonId must match each
// course's index.js (examKeys.test.js reads those files and fails if they drift).
// ACLS's pre/post-test live in Supabase (acls_assessment_*) and are loaded by examGrader.js.
import { setA as blsPreA } from '../../src/courses/bls-hcp/preTest/setA.js';
import { setB as blsPreB } from '../../src/courses/bls-hcp/preTest/setB.js';
import { setC as blsPreC } from '../../src/courses/bls-hcp/preTest/setC.js';
import { setD as blsPreD } from '../../src/courses/bls-hcp/preTest/setD.js';
import { setE as blsPreE } from '../../src/courses/bls-hcp/preTest/setE.js';
import { setA as blsPostA } from '../../src/courses/bls-hcp/postTest/setA.js';
import { setB as blsPostB } from '../../src/courses/bls-hcp/postTest/setB.js';
import { setA as airwayPreA } from '../../src/courses/airway/preTest/setA.js';
import { setB as airwayPreB } from '../../src/courses/airway/preTest/setB.js';
import { setA as airwayPostA } from '../../src/courses/airway/postTest/setA.js';
import { setB as airwayPostB } from '../../src/courses/airway/postTest/setB.js';
import { setA as defibPreA } from '../../src/courses/defib/preTest/setA.js';
import { setB as defibPreB } from '../../src/courses/defib/preTest/setB.js';
import { setA as defibPostA } from '../../src/courses/defib/postTest/setA.js';
import { setB as defibPostB } from '../../src/courses/defib/postTest/setB.js';
import { setA as ivPreA } from '../../src/courses/iv/preTest/setA.js';
import { setB as ivPreB } from '../../src/courses/iv/preTest/setB.js';
import { setA as ivPostA } from '../../src/courses/iv/postTest/setA.js';
import { setB as ivPostB } from '../../src/courses/iv/postTest/setB.js';

export const LOCAL_EXAMS = {
  bls: {
    dir: 'bls-hcp',
    pre: { lessonId: 'bls-pre-test', bankId: 'bls-pretest', passPercent: 70, sets: [blsPreA, blsPreB, blsPreC, blsPreD, blsPreE] },
    post: { lessonId: 'bls-post-test', bankId: 'bls-posttest', passPercent: 84, sets: [blsPostA, blsPostB] },
  },
  airway: {
    dir: 'airway',
    pre: { lessonId: 'aw-pre-test', bankId: 'aw-pretest', passPercent: 70, sets: [airwayPreA, airwayPreB] },
    post: { lessonId: 'aw-post-test', bankId: 'aw-posttest', passPercent: 80, sets: [airwayPostA, airwayPostB] },
  },
  defib: {
    dir: 'defib',
    pre: { lessonId: 'df-pre-test', bankId: 'df-pretest', passPercent: 70, sets: [defibPreA, defibPreB] },
    post: { lessonId: 'df-post-test', bankId: 'df-posttest', passPercent: 80, sets: [defibPostA, defibPostB] },
  },
  iv: {
    dir: 'iv',
    pre: { lessonId: 'iv-pre-test', bankId: 'iv-pretest', passPercent: 70, sets: [ivPreA, ivPreB] },
    post: { lessonId: 'iv-post-test', bankId: 'iv-posttest', passPercent: 80, sets: [ivPostA, ivPostB] },
  },
};

export const ACLS_EXAMS = {
  pre: { lessonId: 'pre-test', bankId: 'pretest' },
  post: { lessonId: 'post-test', bankId: 'posttest' },
};

export const EXAM_COURSES = ['acls', ...Object.keys(LOCAL_EXAMS)];
