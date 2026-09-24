import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forwardGradesToHub, hubResultFromGrade, HUB_COURSE_FOR } from './hubResults.js';
import { passportConfig } from './passportSession.js';

const grade = { attempt_uuid: '0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9', course_mode: 'acls', exam_kind: 'post', correct_count: 45, total_questions: 50, score: 90, passed: true, finished_at: '2026-09-24T05:00:00.000Z' };
const cfg = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek', HUB_SUPABASE_ANON_KEY: 'anon' });

test('Hub course ids: ACLS is als, the rest are their course mode', () => {
  assert.deepEqual(HUB_COURSE_FOR, { acls: 'als', bls: 'bls', airway: 'airway', defib: 'defib', iv: 'iv' });
  assert.deepEqual(hubResultFromGrade(grade), { courseId: 'als', kind: 'post', correct: 45, total: 50, attemptRef: grade.attempt_uuid, finishedAt: grade.finished_at });
  assert.equal(hubResultFromGrade({ ...grade, course_mode: 'nope' }), null);
  assert.equal(hubResultFromGrade({ ...grade, exam_kind: 'quiz' }), null);
  assert.equal(hubResultFromGrade({ ...grade, correct_count: 51 }), null);
  assert.equal(hubResultFromGrade({ ...grade, total_questions: 0 }), null);
});

test('results URL defaults next to sso-auth and follows an overridden sso-auth URL', () => {
  assert.equal(passportConfig({}).resultsUrl, 'https://tpoiyykbgsgnrdwzgzvn.supabase.co/functions/v1/results-ingest');
  assert.equal(passportConfig({ HUB_SSO_AUTH_URL: 'http://127.0.0.1:9/functions/v1/sso-auth' }).resultsUrl, 'http://127.0.0.1:9/functions/v1/results-ingest');
  assert.equal(passportConfig({ HUB_RESULTS_URL: 'https://x.test/ri' }).resultsUrl, 'https://x.test/ri');
});

test('posts the passport, client credentials and raw counts — never a score or pass flag', async () => {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return new Response('{"ok":true}', { status: 200 }); };
  const out = await forwardGradesToHub(cfg, 'jwt.token.sig', [grade, { ...grade, exam_kind: 'pre', correct_count: 14, total_questions: 20 }], { fetcher });
  assert.deepEqual(out, { sent: 2, failed: 0, skipped: 0 });
  assert.equal(calls[0].url, cfg.resultsUrl);
  assert.equal(calls[0].init.headers.apikey, 'anon');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body, { clientId: 'acls', clientSecret: 'sek', passport: 'jwt.token.sig', result: hubResultFromGrade(grade) });
  assert.equal('score' in body.result || 'passed' in body.result, false);
});

test('skips without a configured client or a passport; never throws on Hub errors', async () => {
  const never = async () => { throw new Error('should not be called'); };
  assert.deepEqual(await forwardGradesToHub(passportConfig({}), 'jwt', [grade], { fetcher: never }), { sent: 0, failed: 0, skipped: 1 });
  assert.deepEqual(await forwardGradesToHub(cfg, '', [grade], { fetcher: never }), { sent: 0, failed: 0, skipped: 1 });
  assert.deepEqual(await forwardGradesToHub(cfg, 'jwt', [{ ...grade, course_mode: 'x' }], { fetcher: never }), { sent: 0, failed: 0, skipped: 1 });
  const refusing = async () => new Response(JSON.stringify({ error: 'บัตรผ่านไม่ถูกต้องหรือหมดอายุ' }), { status: 401 });
  assert.deepEqual(await forwardGradesToHub(cfg, 'jwt', [grade], { fetcher: refusing }), { sent: 0, failed: 1, skipped: 0 });
  const down = async () => { throw new Error('fetch failed'); };
  assert.deepEqual(await forwardGradesToHub(cfg, 'jwt', [grade, grade], { fetcher: down }), { sent: 0, failed: 2, skipped: 0 });
});
