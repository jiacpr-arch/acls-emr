import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  createLoginHandler, createCallbackHandler, createMeHandler, createLogoutHandler, createBindHandler,
} from './passportHandlers.js';
import { passportConfig, parseCookies } from './passportSession.js';
import { _resetJwksCache } from './hubPassport.js';
import { _resetRateLimitStore } from './rateLimit.js';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const KID = 'k1';
const NOW = Date.UTC(2026, 8, 23, 12, 0, 0);
const NOW_S = Math.floor(NOW / 1000);
const SUB = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const OTHER_SUB = '99999999-8888-4777-8666-555555555555';
const CLASS_ID = '00000000-0000-4000-8000-00000000c1a5';
const PK = '12345678-1234-4234-8234-123456789abc';
const cfgOn = () => passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek' });
const cfgOff = () => passportConfig({});
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function mint(claims = {}) {
  const h = b64({ alg: 'ES256', typ: 'jia-passport+jwt', kid: KID });
  const p = b64({ iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, name_th: 'สมหญิง ตั้งใจ', name_en: 'Somying T',
    card_no: 'JIA-000777', verify_level: 'self', iat: NOW_S, nbf: NOW_S, exp: NOW_S + 7200, jti: 'j', ...claims });
  return `${h}.${p}.${sign('sha256', Buffer.from(`${h}.${p}`), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'ES256', use: 'sig' };
function hubFetcher({ passport = mint(), fail = false } = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push({ url, init });
    if (String(url).endsWith('/jwks.json')) return { ok: true, async json() { return { keys: [jwk] }; } };
    if (fail) return { ok: false, status: 400, async json() { return { error: 'รหัสไม่ถูกต้องหรือหมดอายุ' }; } };
    return { ok: true, status: 200, async json() { return { ok: true, kind: 'passport', passport, profile: {} }; } };
  };
  return { fetcher, calls };
}

function fakeRes() {
  const r = {
    statusCode: 200, headers: {}, body: undefined, ended: false,
    status(c) { r.statusCode = c; return r; },
    json(b) { r.body = b; r.ended = true; return r; },
    setHeader(k, v) { r.headers[k.toLowerCase()] = v; },
    end() { r.ended = true; },
  };
  return r;
}
const req = (o = {}) => ({ method: 'GET', query: {}, ...o, headers: { host: 'acls.morroo.com', ...(o.headers || {}) } });
const setCookies = (res) => [].concat(res.headers['set-cookie'] || []);
const cookieValue = (res, name) => {
  const c = setCookies(res).find((s) => s.startsWith(`${name}=`));
  return c ? parseCookies(c.split(';')[0])[name] : undefined;
};

// Minimal PostgREST-ish fake for cohort_classes / cohort_students.
function fakeAdmin({ classes = [{ id: CLASS_ID, code: 'ABC123', archived_at: null }], students = [] } = {}) {
  const tables = { cohort_classes: classes, cohort_students: students };
  const matches = (row, f) => Object.entries(f).every(([k, v]) => (v === null ? row[k] == null : row[k] === v));
  return {
    tables,
    from(table) {
      const q = { filters: {}, patch: null };
      const api = {
        select() { return api; },
        eq(k, v) { q.filters[k] = v; return api; },
        is(k, v) { q.filters[k] = v; return api; },
        update(patch) { q.patch = patch; return api; },
        async maybeSingle() { return { data: tables[table].find((r) => matches(r, q.filters)) || null, error: null }; },
        then(resolve) {
          const hit = tables[table].filter((r) => matches(r, q.filters));
          if (q.patch?.hub_user_id && tables[table].some((r) => r.class_id === hit[0]?.class_id && r.hub_user_id === q.patch.hub_user_id)) {
            return resolve({ data: null, error: { code: '23505', message: 'duplicate key' } });
          }
          hit.forEach((r) => Object.assign(r, q.patch));
          return resolve({ data: hit.map((r) => ({ id: r.id })), error: null });
        },
      };
      return api;
    },
  };
}

beforeEach(() => { _resetJwksCache(); _resetRateLimitStore(); });

test('login: dark until configured — bounces back with passport=unavailable', async () => {
  const res = fakeRes();
  await createLoginHandler({ config: cfgOff })(req({ query: { returnTo: '/pre-course' } }), res);
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, '/pre-course?passport=unavailable');
});

test('login: sets a PKCE cookie and redirects to the Hub /sso page', async () => {
  const res = fakeRes();
  await createLoginHandler({ config: cfgOn })(req({ query: { returnTo: '/pre-course?x=1' } }), res);
  assert.equal(res.statusCode, 302);
  const url = new URL(res.headers.location);
  assert.equal(url.origin + url.pathname, 'https://class.jiacpr.com/sso');
  assert.equal(url.searchParams.get('client_id'), 'acls');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://acls.morroo.com/api/passport/callback');
  assert.match(url.searchParams.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/);
  const pkce = JSON.parse(Buffer.from(cookieValue(res, 'jia_passport_pkce'), 'base64url').toString());
  assert.equal(pkce.state, url.searchParams.get('state'));
  assert.equal(pkce.returnTo, '/pre-course?x=1');
  assert.match(setCookies(res)[0], /HttpOnly; Secure/);
});

test('login: an off-site returnTo is replaced by /', async () => {
  const res = fakeRes();
  await createLoginHandler({ config: cfgOn })(req({ query: { returnTo: '//evil.com/x' } }), res);
  const pkce = JSON.parse(Buffer.from(cookieValue(res, 'jia_passport_pkce'), 'base64url').toString());
  assert.equal(pkce.returnTo, '/');
});

async function startLogin(returnTo = '/pre-course') {
  const res = fakeRes();
  await createLoginHandler({ config: cfgOn })(req({ query: { returnTo } }), res);
  const state = new URL(res.headers.location).searchParams.get('state');
  return { state, cookie: `jia_passport_pkce=${encodeURIComponent(cookieValue(res, 'jia_passport_pkce'))}` };
}

test('callback: exchanges the code with the client secret, stores the verified passport, returns to the page', async () => {
  const { state, cookie } = await startLogin('/pre-course');
  const passport = mint();
  const { fetcher, calls } = hubFetcher({ passport });
  const res = fakeRes();
  await createCallbackHandler({ config: cfgOn, fetcher, now: () => NOW })(req({ query: { code: 'c0de', state }, headers: { cookie } }), res);
  assert.equal(res.statusCode, 302);
  assert.equal(res.headers.location, '/pre-course?passport=ok');
  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.clientSecret, 'sek');
  assert.equal(sent.code, 'c0de');
  assert.equal(sent.redirectUri, 'https://acls.morroo.com/api/passport/callback');
  assert.match(sent.codeVerifier, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(cookieValue(res, 'jia_passport'), passport);
  assert.match(setCookies(res).find((c) => c.startsWith('jia_passport=')), /Max-Age=7200; HttpOnly; Secure/);
  assert.match(setCookies(res).find((c) => c.startsWith('jia_passport_pkce=')), /Max-Age=0/);
});

test('callback: state mismatch / missing PKCE cookie never exchanges the code', async () => {
  const { cookie } = await startLogin();
  const { fetcher, calls } = hubFetcher();
  let res = fakeRes();
  await createCallbackHandler({ config: cfgOn, fetcher })(req({ query: { code: 'c', state: 'forged' }, headers: { cookie } }), res);
  assert.equal(res.headers.location, '/pre-course?passport=error&reason=state');
  res = fakeRes();
  await createCallbackHandler({ config: cfgOn, fetcher })(req({ query: { code: 'c', state: 'x' } }), res);
  assert.equal(res.headers.location, '/?passport=error&reason=expired');
  assert.equal(calls.length, 0);
});

test('callback: a passport minted for another app is refused (no cookie set)', async () => {
  const { state, cookie } = await startLogin();
  const { fetcher } = hubFetcher({ passport: mint({ aud: 'bls-hcp-app' }) });
  const res = fakeRes();
  await createCallbackHandler({ config: cfgOn, fetcher, now: () => NOW })(req({ query: { code: 'c', state }, headers: { cookie } }), res);
  assert.equal(res.headers.location, '/pre-course?passport=error&reason=exchange');
  assert.equal(cookieValue(res, 'jia_passport'), undefined);
});

test('callback: Hub rejects the code → error, no cookie', async () => {
  const { state, cookie } = await startLogin();
  const { fetcher } = hubFetcher({ fail: true });
  const res = fakeRes();
  await createCallbackHandler({ config: cfgOn, fetcher, now: () => NOW })(req({ query: { code: 'c', state }, headers: { cookie } }), res);
  assert.equal(res.headers.location, '/pre-course?passport=error&reason=exchange');
  assert.equal(cookieValue(res, 'jia_passport'), undefined);
});

test('me: reports configured/loggedIn and only the public profile', async () => {
  let res = fakeRes();
  await createMeHandler({ config: cfgOff })(req(), res);
  assert.deepEqual(res.body, { configured: false, loggedIn: false, profile: null });

  res = fakeRes();
  await createMeHandler({ config: cfgOn, fetcher: hubFetcher().fetcher, now: () => NOW })(req(), res);
  assert.deepEqual(res.body, { configured: true, loggedIn: false, profile: null });

  res = fakeRes();
  await createMeHandler({ config: cfgOn, fetcher: hubFetcher().fetcher, now: () => NOW })(req({ headers: { cookie: `jia_passport=${mint()}` } }), res);
  assert.equal(res.body.loggedIn, true);
  assert.deepEqual(res.body.profile, { sub: SUB, nameTh: 'สมหญิง ตั้งใจ', nameEn: 'Somying T', cardNo: 'JIA-000777', verifyLevel: 'self', exp: NOW_S + 7200 });
  assert.equal(res.headers['cache-control'], 'no-store');

  res = fakeRes();
  await createMeHandler({ config: cfgOn, fetcher: hubFetcher().fetcher, now: () => NOW + 3 * 3600 * 1000 })(req({ headers: { cookie: `jia_passport=${mint()}` } }), res);
  assert.equal(res.body.loggedIn, false, 'expired passport');
});

test('logout: clears the cookie; refuses a cross-site POST', async () => {
  let res = fakeRes();
  await createLogoutHandler()(req({ method: 'POST', headers: { origin: 'https://evil.com' } }), res);
  assert.equal(res.statusCode, 403);
  res = fakeRes();
  await createLogoutHandler()(req({ method: 'POST', headers: { origin: 'https://acls.morroo.com' } }), res);
  assert.equal(res.statusCode, 200);
  assert.match(setCookies(res)[0], /^jia_passport=; Path=\/; SameSite=Lax; Max-Age=0/);
});

function bindReq(body, { cookie = `jia_passport=${mint()}`, origin = 'https://acls.morroo.com' } = {}) {
  return req({ method: 'POST', body, headers: { cookie, origin } });
}
const bind = (admin, r) => {
  const res = fakeRes();
  return createBindHandler({ config: cfgOn, fetcher: hubFetcher().fetcher, now: () => NOW, getAdmin: () => admin })(r, res).then(() => res);
};

test('bind: links the JIA account to the synced roster row', async () => {
  const admin = fakeAdmin({ students: [{ id: PK, class_id: CLASS_ID, hub_user_id: null }] });
  const res = await bind(admin, bindReq({ classCode: 'abc123 ', studentPk: PK, expectedSub: SUB }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(admin.tables.cohort_students[0].hub_user_id, SUB);
  assert.equal(admin.tables.cohort_students[0].hub_bound_at, new Date(NOW).toISOString());

  const again = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }));
  assert.deepEqual(again.body, { ok: true, already: true });
});

test('bind: requires a valid passport and the account the student confirmed', async () => {
  const admin = fakeAdmin({ students: [{ id: PK, class_id: CLASS_ID, hub_user_id: null }] });
  let res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }, { cookie: '' }));
  assert.equal(res.statusCode, 401);
  res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: OTHER_SUB }));
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.reason, 'sub_mismatch');
  res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }, { origin: 'https://evil.com' }));
  assert.equal(res.statusCode, 403);
  assert.equal(admin.tables.cohort_students[0].hub_user_id, null);
});

test('bind: validates input, unknown class, not-yet-synced student', async () => {
  const admin = fakeAdmin();
  assert.equal((await bind(admin, bindReq({ classCode: 'ABC123', studentPk: 'nope', expectedSub: SUB }))).statusCode, 400);
  assert.equal((await bind(admin, bindReq({ classCode: "A'; drop", studentPk: PK, expectedSub: SUB }))).statusCode, 400);
  const noClass = await bind(admin, bindReq({ classCode: 'ZZZ999', studentPk: PK, expectedSub: SUB }));
  assert.deepEqual([noClass.statusCode, noClass.body.reason], [404, 'class_not_found']);
  const notSynced = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }));
  assert.deepEqual([notSynced.statusCode, notSynced.body.reason], [404, 'not_synced']);
});

test('bind: an archived class is not found', async () => {
  const admin = fakeAdmin({ classes: [{ id: CLASS_ID, code: 'ABC123', archived_at: '2026-01-01' }], students: [{ id: PK, class_id: CLASS_ID, hub_user_id: null }] });
  const res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }));
  assert.equal(res.statusCode, 404);
});

test('bind: never re-points a row already bound to someone else', async () => {
  const admin = fakeAdmin({ students: [{ id: PK, class_id: CLASS_ID, hub_user_id: OTHER_SUB }] });
  const res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }));
  assert.deepEqual([res.statusCode, res.body.reason], [409, 'bound_to_other']);
  assert.equal(admin.tables.cohort_students[0].hub_user_id, OTHER_SUB);
});

test('bind: one JIA account holds at most one row per class', async () => {
  const OTHER_PK = '22222222-2222-4222-8222-222222222222';
  const admin = fakeAdmin({ students: [
    { id: OTHER_PK, class_id: CLASS_ID, hub_user_id: SUB },
    { id: PK, class_id: CLASS_ID, hub_user_id: null },
  ] });
  const res = await bind(admin, bindReq({ classCode: 'ABC123', studentPk: PK, expectedSub: SUB }));
  assert.deepEqual([res.statusCode, res.body.reason], [409, 'account_in_use']);
  assert.equal(admin.tables.cohort_students[1].hub_user_id, null);
});

test('bind: dark (503) until configured', async () => {
  const res = fakeRes();
  await createBindHandler({ config: cfgOff, getAdmin: () => { throw new Error('unused'); } })(bindReq({}), res);
  assert.equal(res.statusCode, 503);
});
