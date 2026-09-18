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

test('accepts the owner email included in the default allowlist', async () => {
  const user = await requireAdmin(reqWith('Bearer tok'), { getUser: okUser('jiacpr@gmail.com') });
  assert.equal(user.email, 'jiacpr@gmail.com');
});

// A deploy with no service role key must not look like an auth failure —
// otherwise the admin UI tells the user their login expired (see #390).
test('reports a deployment missing the service role key as 503, not 401', async (t) => {
  const keys = ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const prev = keys.map((k) => [k, process.env[k]]);
  keys.forEach((k) => delete process.env[k]);
  t.mock.method(console, 'error', () => {});
  t.after(() => {
    for (const [k, v] of prev) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  // No getUser injected → the real getSupabaseAdmin path runs and fails on env.
  await assert.rejects(requireAdmin(reqWith('Bearer tok')), (err) => {
    assert.equal(err.status, 503);
    assert.doesNotMatch(err.message, /SERVICE_ROLE_KEY/, 'internal env detail should stay server-side');
    return true;
  });
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
