import { createPublicKey, verify as cryptoVerify } from 'node:crypto';

// Verifies a "JIA passport": an ES256 JWT signed by the Hub (class.jiacpr.com, repo
// jia-learning-hub, Edge Function sso-auth) after a student logs in there. This app lives on a
// different Supabase project, so it can't share a Supabase session with the Hub — instead it
// trusts this signature, checked against the Hub's published public keys (JWKS). Nothing here is
// a secret: the private key never leaves the Hub.

export const DEFAULT_ISSUER = 'https://class.jiacpr.com';
export const DEFAULT_JWKS_URL = 'https://class.jiacpr.com/.well-known/jwks.json';
const JWKS_TTL_MS = 5 * 60 * 1000;
// A refetch forced by an unknown kid (key rotation) is rate-limited so a stream of junk tokens
// can't turn every request into a fetch against the Hub.
const JWKS_FORCED_REFRESH_MIN_MS = 30 * 1000;
const CLOCK_SKEW_S = 60;
const MAX_TOKEN_LEN = 4096;

let jwksCache = { url: '', keys: [], fetchedAt: 0, forcedAt: 0 };

export function _resetJwksCache() {
  jwksCache = { url: '', keys: [], fetchedAt: 0, forcedAt: 0 };
}

async function loadJwks(url, fetcher, now, { force = false } = {}) {
  const fresh = jwksCache.url === url && now - jwksCache.fetchedAt < JWKS_TTL_MS;
  if (fresh && !force) return jwksCache.keys;
  if (force && jwksCache.url === url && now - jwksCache.forcedAt < JWKS_FORCED_REFRESH_MIN_MS) {
    return jwksCache.keys;
  }
  const res = await fetcher(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const body = await res.json();
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  jwksCache = { url, keys, fetchedAt: now, forcedAt: force ? now : jwksCache.forcedAt };
  return keys;
}

function b64urlJson(part) {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

function fail(reason) {
  const err = new Error(`invalid passport: ${reason}`);
  err.reason = reason;
  return err;
}

/**
 * Returns the passport's claims if it is a genuine, unexpired passport issued by the Hub for this
 * app (`aud` === clientId); throws (err.reason set) otherwise.
 */
export async function verifyHubPassport(token, {
  clientId,
  issuer = DEFAULT_ISSUER,
  jwksUrl = DEFAULT_JWKS_URL,
  fetcher = fetch,
  now = Date.now(),
} = {}) {
  if (!clientId) throw fail('no_client_id');
  if (typeof token !== 'string' || !token || token.length > MAX_TOKEN_LEN) throw fail('malformed');
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) throw fail('malformed');

  let header;
  let claims;
  try {
    header = b64urlJson(parts[0]);
    claims = b64urlJson(parts[1]);
  } catch {
    throw fail('malformed');
  }
  // Pin the algorithm: never let the token pick it (alg=none / HS256-with-public-key confusion).
  if (header?.alg !== 'ES256') throw fail('alg');
  if (header.typ !== 'jia-passport+jwt') throw fail('typ');
  if (typeof header.kid !== 'string' || !header.kid) throw fail('kid');

  let keys = await loadJwks(jwksUrl, fetcher, now);
  let jwk = keys.find((k) => k?.kid === header.kid);
  if (!jwk) {
    keys = await loadJwks(jwksUrl, fetcher, now, { force: true });
    jwk = keys.find((k) => k?.kid === header.kid);
  }
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || (jwk.alg && jwk.alg !== 'ES256')) throw fail('kid');

  let ok = false;
  try {
    const key = createPublicKey({ key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, format: 'jwk' });
    ok = cryptoVerify('sha256', Buffer.from(`${parts[0]}.${parts[1]}`), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(parts[2], 'base64url'));
  } catch {
    ok = false;
  }
  if (!ok) throw fail('signature');

  if (!claims || typeof claims !== 'object') throw fail('claims');
  if (claims.iss !== issuer) throw fail('iss');
  if (claims.aud !== clientId) throw fail('aud');
  if (typeof claims.sub !== 'string' || !/^[0-9a-f-]{36}$/i.test(claims.sub)) throw fail('sub');
  const nowS = Math.floor(now / 1000);
  if (typeof claims.exp !== 'number' || nowS - CLOCK_SKEW_S >= claims.exp) throw fail('expired');
  if (typeof claims.nbf === 'number' && nowS + CLOCK_SKEW_S < claims.nbf) throw fail('nbf');
  if (typeof claims.iat === 'number' && nowS + CLOCK_SKEW_S < claims.iat) throw fail('iat');
  return claims;
}

/** The subset of claims the app shows/stores — never the raw token. */
export function publicPassportProfile(claims) {
  return {
    sub: claims.sub,
    nameTh: typeof claims.name_th === 'string' ? claims.name_th : '',
    nameEn: typeof claims.name_en === 'string' ? claims.name_en : '',
    cardNo: typeof claims.card_no === 'string' ? claims.card_no : '',
    verifyLevel: typeof claims.verify_level === 'string' ? claims.verify_level : '',
    exp: claims.exp,
  };
}
