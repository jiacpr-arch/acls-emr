import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchHubCertificates, forwardGradesToHub, hubOrigin, hubResultFromGrade, HUB_COURSE_FOR } from './hubResults.js';
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

const TOKEN = '3f2a1b0c-9d8e-4f7a-8b6c-5d4e3f2a1b0c';
const hubCert = { id: 'x', kind: 'online', token: TOKEN, number: 'JIA-ALS-ONL-2026-0123456789', courseId: 'als', courseTitle: 'ACLS',
  name: 'สมหญิง ตั้งใจ', cardNo: 'JIA-000777', score: 90, nameVerified: true, issuedAt: '2026-09-24T05:00:00Z',
  expiresAt: '2028-09-24T05:00:00Z', status: 'issued', verifyPath: `/portal?verify=${TOKEN}` };

test('certificates: asks results-ingest with the passport + client credentials, keeps only display fields', async () => {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify({ ok: true, certificates: [hubCert] }), { status: 200 }); };
  const list = await fetchHubCertificates(cfg, 'jwt.token.sig', { fetcher });
  assert.equal(calls[0].url, cfg.resultsUrl);
  assert.equal(calls[0].init.headers.apikey, 'anon');
  assert.deepEqual(JSON.parse(calls[0].init.body), { clientId: 'acls', clientSecret: 'sek', passport: 'jwt.token.sig', action: 'certificates' });
  assert.deepEqual(list, [{ number: hubCert.number, courseId: 'als', courseTitle: 'ACLS', issuedAt: hubCert.issuedAt, expiresAt: hubCert.expiresAt,
    status: 'issued', nameVerified: true, verifyUrl: `https://class.jiacpr.com/portal?verify=${TOKEN}` }]);
  // the certificate token, card number and score stay at the server
  assert.equal(JSON.stringify(list).includes('JIA-000777'), false);
});

test('certificates: the verification link only ever points at the Hub verify page', async () => {
  const reply = (verifyPath) => async () => new Response(JSON.stringify({ certificates: [{ ...hubCert, verifyPath }] }), { status: 200 });
  for (const bad of [`/?verify=${TOKEN}`, '//evil.example/portal?verify=' + TOKEN, 'https://evil.example/?verify=' + TOKEN, `/portal?verify=${TOKEN}&x=1`, '/admin', null]) {
    assert.equal((await fetchHubCertificates(cfg, 'jwt', { fetcher: reply(bad) }))[0].verifyUrl, null, String(bad));
  }
  assert.equal(hubOrigin(passportConfig({ HUB_SSO_URL: 'http://127.0.0.1:9/sso' })), 'http://127.0.0.1:9');
  assert.equal(hubOrigin({ ssoUrl: 'not a url' }), 'https://class.jiacpr.com');
});

test('certificates: nothing to ask without a client or passport; a Hub error throws', async () => {
  const never = async () => { throw new Error('should not be called'); };
  assert.deepEqual(await fetchHubCertificates(passportConfig({}), 'jwt', { fetcher: never }), []);
  assert.deepEqual(await fetchHubCertificates(cfg, '', { fetcher: never }), []);
  await assert.rejects(fetchHubCertificates(cfg, 'jwt', { fetcher: async () => new Response('{"error":"x"}', { status: 401 }) }));
  await assert.rejects(fetchHubCertificates(cfg, 'jwt', { fetcher: async () => new Response('{"ok":true}', { status: 200 }) }));
  await assert.rejects(fetchHubCertificates(cfg, 'jwt', { fetcher: async () => { throw new Error('fetch failed'); } }));
});
