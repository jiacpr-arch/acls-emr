import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createLegacyLookupHandler, normalizeName, namesMatch } from './legacyCertLookup.js';
import { _resetRateLimitStore } from './rateLimit.js';

const ROW = {
  cert_id: 'JIA-ACLS-MF3K2Q9Z', student_name: 'นางสาว สมหญิง  ใจดี', course_mode: 'acls',
  issued_at: '2026-07-01T03:00:00+00:00', exam_verified: false,
  student_phone: '0812345678', student_email: 'x@example.com',
};

function fakeAdmin(rows = [ROW], { error = null } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const q = { table, eq: {} };
      calls.push(q);
      const api = {
        select(cols) { q.select = cols; return api; },
        eq(k, v) { q.eq[k] = v; return api; },
        async maybeSingle() {
          if (error) return { data: null, error };
          return { data: rows.find((r) => Object.entries(q.eq).every(([k, v]) => r[k] === v)) || null, error: null };
        },
      };
      return api;
    },
  };
}
function fakeRes() {
  const r = { statusCode: 200, headers: {}, body: undefined,
    status(c) { r.statusCode = c; return r; }, json(b) { r.body = b; return r; }, setHeader(k, v) { r.headers[k] = v; } };
  return r;
}
async function call(body, { admin = fakeAdmin(), method = 'POST', ip = '203.0.113.9' } = {}) {
  const res = fakeRes();
  await createLegacyLookupHandler({ getAdmin: () => admin })({ method, headers: { 'x-vercel-forwarded-for': ip }, body }, res);
  return res;
}

beforeEach(() => _resetRateLimitStore());

test('normalizeName ignores titles, spacing, case and dots', () => {
  assert.equal(normalizeName('นางสาว สมหญิง  ใจดี'), 'สมหญิงใจดี');
  assert.equal(normalizeName('น.ส.สมหญิง ใจดี'), 'สมหญิงใจดี');
  assert.equal(normalizeName(' นายสมชาย\u200B ใจดี '), 'สมชายใจดี');
  assert.equal(normalizeName('นพ. สมชาย ใจดี'), 'สมชายใจดี');
  assert.equal(normalizeName('Mr. John  Smith'), 'johnsmith');
  assert.equal(normalizeName('MISS Jane Doe'), 'janedoe');
  assert.equal(normalizeName('Missy Doe'), 'missydoe');
  assert.equal(normalizeName('Drew Barry'), 'drewbarry');
  assert.equal(namesMatch('สมหญิง ใจดี', 'นางสาว สมหญิง  ใจดี'), true);
  assert.equal(namesMatch('สมหญิง', 'นางสาว สมหญิง  ใจดี'), false);
  assert.equal(namesMatch('นาย', 'นาง'), false);
});

test('number + matching name returns only the printed fields', async () => {
  const admin = fakeAdmin();
  const res = await call({ number: ' jia-acls-mf3k2q9z ', name: 'สมหญิง ใจดี' }, { admin });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.deepEqual(res.body, {
    found: true,
    certificate: { number: 'JIA-ACLS-MF3K2Q9Z', course: 'acls', name: 'นางสาว สมหญิง  ใจดี', issuedAt: '2026-07-01T03:00:00+00:00', examVerified: false },
  });
  assert.equal(admin.calls[0].table, 'certificates');
  assert.doesNotMatch(admin.calls[0].select, /phone|email/);
  assert.doesNotMatch(JSON.stringify(res.body), /0812345678|example\.com/);
});

test('a wrong name looks exactly like a missing number', async () => {
  const wrong = await call({ number: 'JIA-ACLS-MF3K2Q9Z', name: 'สมศรี ใจดี' });
  const missing = await call({ number: 'JIA-ACLS-MF3K2Q9Y', name: 'สมหญิง ใจดี' });
  assert.equal(wrong.statusCode, 404);
  assert.deepEqual(wrong.body, { found: false });
  assert.equal(missing.statusCode, 404);
  assert.deepEqual(missing.body, wrong.body);
});

test('server-graded certificates say so', async () => {
  const res = await call({ number: 'JIA-ACLS-MF3K2Q9Z', name: 'สมหญิง ใจดี' }, { admin: fakeAdmin([{ ...ROW, exam_verified: true }]) });
  assert.equal(res.body.certificate.examVerified, true);
});

test('malformed input is rejected before the database', async () => {
  const admin = fakeAdmin();
  for (const body of [
    { number: 'FA-ABCDEFGH', name: 'สมหญิง ใจดี' },
    { number: 'JIA-ACLS-MF3K2Q9Z', name: '' },
    { number: 'JIA-ACLS-MF3K2Q9Z', name: 'นางสาว' },
    { number: 'JIA-ACLS-MF3K2Q9Z', name: 'ก'.repeat(81) },
    { number: "JIA-ACLS-X' or 1=1", name: 'สมหญิง ใจดี' },
    'not json',
  ]) {
    const res = await call(body, { admin });
    assert.equal(res.statusCode, 400, JSON.stringify(body));
  }
  assert.equal(admin.calls.length, 0);
  assert.equal((await call({}, { method: 'GET' })).statusCode, 405);
});

test('database trouble is 503, not a false "not found"', async () => {
  const res = await call({ number: 'JIA-ACLS-MF3K2Q9Z', name: 'สมหญิง ใจดี' }, { admin: fakeAdmin([], { error: { message: 'boom' } }) });
  assert.equal(res.statusCode, 503);
  const res2 = fakeRes();
  await createLegacyLookupHandler({ getAdmin: () => { throw new Error('missing env'); } })({ method: 'POST', headers: {}, body: { number: 'JIA-ACLS-MF3K2Q9Z', name: 'สมหญิง ใจดี' } }, res2);
  assert.equal(res2.statusCode, 503);
});

test('rate limited per client', async () => {
  let last;
  for (let i = 0; i < 21; i += 1) last = await call({ number: 'JIA-ACLS-MF3K2Q9Y', name: 'สมหญิง ใจดี' }, { ip: '198.51.100.7' });
  assert.equal(last.statusCode, 429);
  assert.equal((await call({ number: 'JIA-ACLS-MF3K2Q9Y', name: 'สมหญิง ใจดี' }, { ip: '198.51.100.8' })).statusCode, 404);
});
