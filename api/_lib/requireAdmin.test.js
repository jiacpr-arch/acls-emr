import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin, getAdminEmails } from './requireAdmin.js';

const okUser = (email) => async () => ({ data: { user: { email } }, error: null });
const badToken = async () => ({ data: { user: null }, error: new Error('bad token') });

function reqWith(auth) {
  return { headers: auth ? { authorization: auth } : {} };
}

async function expectStatus(promise, status) {
  await assert.rejects(promise, (err) => {
    assert.equal(err.status, status);
    return true;
  });
}

test('rejects missing Authorization header with 401', async () => {
  await expectStatus(requireAdmin(reqWith(null), { getUser: okUser('admin@acls-emr.local') }), 401);
});

test('rejects non-Bearer Authorization header with 401', async () => {
  await expectStatus(requireAdmin(reqWith('Basic abc'), { getUser: okUser('admin@acls-emr.local') }), 401);
});

test('rejects invalid/expired token with 401', async () => {
  await expectStatus(requireAdmin(reqWith('Bearer nope'), { getUser: badToken }), 401);
});

test('rejects a valid session that is not on the admin allowlist with 403', async () => {
  await expectStatus(requireAdmin(reqWith('Bearer tok'), { getUser: okUser('student@example.com') }), 403);
});

test('rejects a valid session with no email with 403', async () => {
  await expectStatus(requireAdmin(reqWith('Bearer tok'), { getUser: okUser(undefined) }), 403);
});

test('accepts the default admin email (case-insensitive)', async () => {
  const user = await requireAdmin(reqWith('Bearer tok'), { getUser: okUser('Admin@ACLS-EMR.local') });
  assert.equal(user.email, 'Admin@ACLS-EMR.local');
});

test('ADMIN_EMAILS env overrides the allowlist', async (t) => {
  const prev = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = 'boss@example.com, second@example.com';
  t.after(() => {
    if (prev === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = prev;
  });

  assert.deepEqual(getAdminEmails(), ['boss@example.com', 'second@example.com']);
  const user = await requireAdmin(reqWith('Bearer tok'), { getUser: okUser('second@example.com') });
  assert.equal(user.email, 'second@example.com');
  // The default admin is no longer allowed once overridden.
  await expectStatus(requireAdmin(reqWith('Bearer tok'), { getUser: okUser('admin@acls-emr.local') }), 403);
});
