import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import handler from '../cert/notify.js';
import { _resetJwksCache } from './hubPassport.js';
import { _resetRateLimitStore } from './rateLimit.js';

// /api/cert/notify with the optional JIA passport. Lives in _lib/ (not next to the route) because
// Vercel would deploy any other file under api/ as a function.

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const SUB = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const nowS = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function mint() {
  const h = b64({ alg: 'ES256', typ: 'jia-passport+jwt', kid: 'k' });
  const p = b64({ iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, name_th: 'ชื่อ จากฮับ', iat: nowS, nbf: nowS, exp: nowS + 600 });
  return `${h}.${p}.${sign('sha256', Buffer.from(`${h}.${p}`), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}
const jwks = { keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'k', alg: 'ES256' }] };

const ENV_KEYS = ['HUB_PASSPORT_CLIENT_ID', 'HUB_PASSPORT_CLIENT_SECRET', 'SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'LINE_CHANNEL_ACCESS_TOKEN'];
let savedEnv;
let savedFetch;
let inserts;
let missingColumn;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, {
    HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek',
    SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'svc',
  });
  inserts = [];
  missingColumn = false;
  savedFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.endsWith('/.well-known/jwks.json')) return new Response(JSON.stringify(jwks), { headers: { 'content-type': 'application/json' } });
    if (u.startsWith('https://db.example/rest/v1/certificates')) {
      const row = JSON.parse(init.body);
      inserts.push(row);
      if (missingColumn && 'hub_user_id' in row) {
        return new Response(JSON.stringify({ code: 'PGRST204', message: "Could not find the 'hub_user_id' column" }), { status: 400, headers: { 'content-type': 'application/json' } });
      }
      return new Response(null, { status: 201 });
    }
    throw new Error(`unexpected fetch ${u}`);
  };
  _resetJwksCache();
  _resetRateLimitStore();
});

afterEach(() => {
  globalThis.fetch = savedFetch;
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k];
  }
});

function call(body, cookie) {
  const res = {
    statusCode: 200, body: undefined, headers: {},
    status(c) { res.statusCode = c; return res; },
    json(b) { res.body = b; return res; },
    setHeader(k, v) { res.headers[k] = v; },
  };
  const req = { method: 'POST', headers: { host: 'acls.morroo.com', ...(cookie ? { cookie } : {}) }, body };
  return handler(req, res).then(() => res);
}
const base = { studentName: 'ชื่อที่พิมพ์เอง', certId: 'JIA-ACLS-ABC123XYZ', course: 'acls' };

test('no hubSub (old cached bundle): recorded exactly as before, no passport lookup', async () => {
  const res = await call(base, `jia_passport=${mint()}`);
  assert.equal(res.body.verified, false);
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].student_name, 'ชื่อที่พิมพ์เอง');
  assert.equal('hub_user_id' in inserts[0], false);
});

test('hubSub matching the passport cookie: Hub user id + Hub name are recorded', async () => {
  const res = await call({ ...base, hubSub: SUB }, `jia_passport=${mint()}`);
  assert.equal(res.body.verified, true);
  assert.equal(inserts[0].hub_user_id, SUB);
  assert.equal(inserts[0].student_name, 'ชื่อ จากฮับ');
});

test('hubSub for someone else (shared device) or no cookie: nothing is attributed', async () => {
  let res = await call({ ...base, hubSub: '99999999-8888-4777-8666-555555555555' }, `jia_passport=${mint()}`);
  assert.equal(res.body.verified, false);
  assert.equal('hub_user_id' in inserts[0], false);
  assert.equal(inserts[0].student_name, 'ชื่อที่พิมพ์เอง');
  res = await call({ ...base, hubSub: SUB });
  assert.equal(res.body.verified, false);
});

test('before hub-passport.sql is applied: retries without hub_user_id so the cert is still recorded', async () => {
  missingColumn = true;
  const res = await call({ ...base, hubSub: SUB }, `jia_passport=${mint()}`);
  assert.equal(res.body.recorded, true);
  assert.equal(inserts.length, 2);
  assert.equal(inserts[1].hub_user_id, undefined);
  assert.equal(inserts[1].student_name, 'ชื่อ จากฮับ');
});
