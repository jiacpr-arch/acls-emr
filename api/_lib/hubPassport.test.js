import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyHubPassport, publicPassportProfile, _resetJwksCache } from './hubPassport.js';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const other = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const KID = 'k2026';
const SUB = '11111111-2222-4333-8444-555555555555';
const NOW = Date.UTC(2026, 8, 23, 12, 0, 0);
const NOW_S = Math.floor(NOW / 1000);

function jwkOf(pub, kid = KID) {
  return { ...pub.export({ format: 'jwk' }), kid, use: 'sig', alg: 'ES256' };
}
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function mint(claims = {}, { header = {}, key = privateKey } = {}) {
  const h = b64({ alg: 'ES256', typ: 'jia-passport+jwt', kid: KID, ...header });
  const p = b64({
    iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, name_th: 'สมชาย ใจดี', name_en: 'Somchai Jaidee',
    card_no: 'JIA-000123', verify_level: 'instructor', iat: NOW_S, nbf: NOW_S, exp: NOW_S + 3600, jti: 'j1', ...claims,
  });
  const sig = sign('sha256', Buffer.from(`${h}.${p}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${h}.${p}.${sig.toString('base64url')}`;
}

function jwksFetcher(keys, calls = { n: 0 }) {
  return async () => {
    calls.n += 1;
    return { ok: true, async json() { return { keys }; } };
  };
}

const opts = (extra = {}) => ({ clientId: 'acls', now: NOW, fetcher: jwksFetcher([jwkOf(publicKey)]), ...extra });

async function rejects(token, reason, extra) {
  await assert.rejects(verifyHubPassport(token, opts(extra)), (err) => {
    assert.equal(err.reason, reason);
    return true;
  });
}

beforeEach(() => _resetJwksCache());

test('accepts a genuine passport for this client and returns its claims', async () => {
  const claims = await verifyHubPassport(mint(), opts());
  assert.equal(claims.sub, SUB);
  assert.equal(claims.name_th, 'สมชาย ใจดี');
  assert.deepEqual(publicPassportProfile(claims), {
    sub: SUB, nameTh: 'สมชาย ใจดี', nameEn: 'Somchai Jaidee', cardNo: 'JIA-000123', verifyLevel: 'instructor', exp: NOW_S + 3600,
  });
});

test('rejects a passport issued for another app (aud)', async () => {
  await rejects(mint({ aud: 'bls-hcp-app' }), 'aud');
});

test('rejects a wrong issuer', async () => {
  await rejects(mint({ iss: 'https://evil.example' }), 'iss');
});

test('rejects an expired passport (beyond clock skew) but tolerates small skew', async () => {
  await rejects(mint({ exp: NOW_S - 61 }), 'expired');
  await verifyHubPassport(mint({ exp: NOW_S - 30 }), opts());
});

test('rejects a not-yet-valid passport (nbf)', async () => {
  await rejects(mint({ nbf: NOW_S + 3000, iat: NOW_S }), 'nbf');
});

test('rejects a tampered payload (signature no longer matches)', async () => {
  const [h, , s] = mint().split('.');
  const forged = b64({ iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, name_th: 'คนอื่น', exp: NOW_S + 3600 });
  await rejects(`${h}.${forged}.${s}`, 'signature');
});

test('rejects a passport signed by a key that is not in the JWKS', async () => {
  await rejects(mint({}, { key: other.privateKey }), 'signature');
});

test('rejects alg=none / HS256 (algorithm is pinned, never taken from the token)', async () => {
  const p = b64({ iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, exp: NOW_S + 3600 });
  await rejects(`${b64({ alg: 'none', typ: 'jia-passport+jwt', kid: KID })}.${p}.AA`, 'alg');
  await rejects(mint({}, { header: { alg: 'HS256' } }), 'alg');
});

test('rejects a token of a different type', async () => {
  await rejects(mint({}, { header: { typ: 'JWT' } }), 'typ');
});

test('rejects an unknown kid (after one forced JWKS refresh)', async () => {
  const calls = { n: 0 };
  await rejects(mint({}, { header: { kid: 'nope' } }), 'kid', { fetcher: jwksFetcher([jwkOf(publicKey)], calls) });
  assert.equal(calls.n, 2);
});

test('picks up a rotated key: unknown kid forces a JWKS refresh', async () => {
  let keys = [jwkOf(other.publicKey, 'old')];
  const fetcher = async () => ({ ok: true, async json() { return { keys }; } });
  await assert.rejects(verifyHubPassport(mint({}, { header: { kid: 'old' } }), opts({ fetcher })));
  keys = [jwkOf(other.publicKey, 'old'), jwkOf(publicKey)];
  const claims = await verifyHubPassport(mint(), opts({ fetcher }));
  assert.equal(claims.sub, SUB);
});

test('an empty JWKS (Hub signer not configured yet) rejects everything', async () => {
  await rejects(mint(), 'kid', { fetcher: jwksFetcher([]) });
});

test('caches the JWKS between calls', async () => {
  const calls = { n: 0 };
  const fetcher = jwksFetcher([jwkOf(publicKey)], calls);
  await verifyHubPassport(mint(), opts({ fetcher }));
  await verifyHubPassport(mint(), opts({ fetcher }));
  assert.equal(calls.n, 1);
});

test('rejects malformed tokens and a missing / non-uuid sub', async () => {
  await rejects('not-a-jwt', 'malformed');
  await rejects('a.b', 'malformed');
  await rejects('', 'malformed');
  await rejects(mint({ sub: 'someone' }), 'sub');
  await rejects(mint({ sub: undefined }), 'sub');
});

test('requires a clientId to check the audience against', async () => {
  await assert.rejects(verifyHubPassport(mint(), opts({ clientId: '' })), (err) => err.reason === 'no_client_id');
});
