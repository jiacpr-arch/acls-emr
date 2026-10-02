import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  passportConfig, redirectUriFor, createPkce, safeReturnTo, withQuery, parseCookies, serializeCookie,
  pkceCookie, readPkceCookie, passportCookie, statesMatch, hubLoginUrl, exchangeCode, readPassport, sameOrigin,
} from './passportSession.js';

test('passportConfig stays dark until both client id and secret are set', () => {
  assert.equal(passportConfig({}).configured, false);
  assert.equal(passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls' }).configured, false);
  const cfg = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 's' });
  assert.equal(cfg.configured, true);
  assert.equal(cfg.ssoUrl, 'https://class.jiacpr.com/sso');
  assert.equal(cfg.jwksUrl, 'https://class.jiacpr.com/.well-known/jwks.json');
});

test('redirectUriFor derives https://<host>/api/passport/callback, or uses the pinned one', () => {
  const cfg = passportConfig({});
  assert.equal(redirectUriFor({ headers: { host: 'acls.morroo.com' } }, cfg), 'https://acls.morroo.com/api/passport/callback');
  assert.equal(redirectUriFor({ headers: { host: 'evil.com/x?' } }, cfg), '');
  const pinned = passportConfig({ HUB_PASSPORT_REDIRECT_URI: 'https://iv.morroo.com/api/passport/callback' });
  assert.equal(redirectUriFor({ headers: { host: 'other' } }, pinned), 'https://iv.morroo.com/api/passport/callback');
});

test('createPkce: 43-char verifier, S256 challenge in the exact shape the Hub accepts', () => {
  const { verifier, challenge, state } = createPkce();
  assert.match(verifier, /^[A-Za-z0-9._~-]{43,128}$/);
  assert.match(challenge, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(challenge, createHash('sha256').update(verifier).digest('base64url'));
  assert.ok(state.length >= 20);
  assert.notEqual(createPkce().verifier, verifier);
});

test('safeReturnTo only allows same-origin paths', () => {
  assert.equal(safeReturnTo('/pre-course?x=1'), '/pre-course?x=1');
  for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'evil', '', null, '/a\nb', `/${'a'.repeat(600)}`]) {
    assert.equal(safeReturnTo(bad), '/', String(bad));
  }
});

test('withQuery keeps the path and existing params', () => {
  assert.equal(withQuery('/pre-course?step=2#top', { passport: 'ok' }), '/pre-course?step=2&passport=ok#top');
});

test('cookie round trip, first value wins on duplicates', () => {
  assert.deepEqual(parseCookies('a=1; b=x%20y; a=2; junk'), { a: '1', b: 'x y' });
  const s = serializeCookie('jia_passport', 'abc.def', { maxAge: 100 });
  assert.equal(s, 'jia_passport=abc.def; Path=/; SameSite=Lax; Max-Age=100; HttpOnly; Secure');
});

test('pkce cookie is scoped to /api/passport and reads back', () => {
  const c = pkceCookie({ state: 's1', verifier: 'v1', returnTo: '/x', redirectUri: 'https://h/api/passport/callback' });
  assert.match(c, /Path=\/api\/passport;/);
  assert.match(c, /Max-Age=600/);
  const value = c.split(';')[0];
  assert.deepEqual(readPkceCookie({ headers: { cookie: value } }), { state: 's1', verifier: 'v1', returnTo: '/x', redirectUri: 'https://h/api/passport/callback' });
  assert.equal(readPkceCookie({ headers: { cookie: 'jia_passport_pkce=garbage' } }), null);
  assert.equal(readPkceCookie({ headers: {} }), null);
});

test('passport cookie lives exactly until the passport expires', () => {
  assert.match(passportCookie('t', 2000, 1000 * 1000), /Max-Age=1000/);
  assert.match(passportCookie('t', 10, 1000 * 1000), /Max-Age=0/);
});

test('statesMatch', () => {
  assert.equal(statesMatch('abc', 'abc'), true);
  assert.equal(statesMatch('abc', 'abd'), false);
  assert.equal(statesMatch('', ''), false);
  assert.equal(statesMatch(undefined, undefined), false);
});

test('hubLoginUrl carries exactly what the Hub /sso page reads', () => {
  const cfg = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 's' });
  const url = new URL(hubLoginUrl(cfg, { redirectUri: 'https://acls.morroo.com/api/passport/callback', state: 'st', challenge: 'ch' }));
  assert.equal(url.origin + url.pathname, 'https://class.jiacpr.com/sso');
  assert.equal(url.searchParams.get('client_id'), 'acls');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://acls.morroo.com/api/passport/callback');
  assert.equal(url.searchParams.get('state'), 'st');
  assert.equal(url.searchParams.get('code_challenge'), 'ch');
});

test('exchangeCode sends the client secret server-to-server and returns the passport', async () => {
  const cfg = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek' });
  let sent;
  const fetcher = async (url, init) => {
    sent = { url, body: JSON.parse(init.body), headers: init.headers };
    return { ok: true, async json() { return { ok: true, kind: 'passport', passport: 'a.b.c' } } };
  };
  const passport = await exchangeCode(cfg, { code: 'c1', verifier: 'v1', redirectUri: 'https://h/cb' }, { fetcher });
  assert.equal(passport, 'a.b.c');
  assert.equal(sent.url, cfg.ssoAuthUrl);
  assert.deepEqual(sent.body, { code: 'c1', clientId: 'acls', redirectUri: 'https://h/cb', codeVerifier: 'v1', clientSecret: 'sek' });
  assert.equal(sent.headers.apikey, undefined);
});

test('exchangeCode refuses a supabase-kind answer or an error', async () => {
  const cfg = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek' });
  const answer = (status, body) => async () => ({ ok: status === 200, status, async json() { return body; } });
  await assert.rejects(exchangeCode(cfg, { code: 'c', verifier: 'v', redirectUri: 'r' }, { fetcher: answer(200, { ok: true, kind: 'supabase', tokenHash: 'x' }) }));
  await assert.rejects(exchangeCode(cfg, { code: 'c', verifier: 'v', redirectUri: 'r' }, { fetcher: answer(400, { error: 'ยืนยันแอปไม่สำเร็จ' }) }), /ยืนยันแอปไม่สำเร็จ/);
});

test('readPassport is null when unconfigured, cookie missing, or token invalid', async () => {
  const on = passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 's' });
  const fetcher = async () => { throw new Error('should not be needed'); };
  assert.equal(await readPassport({ headers: { cookie: 'jia_passport=x.y.z' } }, passportConfig({}), { fetcher }), null);
  assert.equal(await readPassport({ headers: {} }, on, { fetcher }), null);
  assert.equal(await readPassport({ headers: { cookie: 'jia_passport=garbage' } }, on, { fetcher }), null);
});

test('sameOrigin', () => {
  assert.equal(sameOrigin({ headers: { host: 'acls.morroo.com' } }), true);
  assert.equal(sameOrigin({ headers: { host: 'acls.morroo.com', origin: 'https://acls.morroo.com' } }), true);
  assert.equal(sameOrigin({ headers: { host: 'acls.morroo.com', origin: 'https://evil.com' } }), false);
  assert.equal(sameOrigin({ headers: { host: 'acls.morroo.com', origin: 'null' } }), false);
});
