import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { verifyHubPassport, DEFAULT_ISSUER, DEFAULT_JWKS_URL } from './hubPassport.js';

// Server side of "log in with a JIA account" (optional): PKCE + code exchange with the Hub's
// sso-auth, then the verified passport is kept in an httpOnly cookie — never in localStorage, so
// no new client storage key and nothing a script on the page can read. Everything is dark (routes
// answer configured:false) until HUB_PASSPORT_CLIENT_ID + HUB_PASSPORT_CLIENT_SECRET are set on
// this deployment — see docs/hub-passport.md.

export const PASSPORT_COOKIE = 'jia_passport';
export const PKCE_COOKIE = 'jia_passport_pkce';
const PKCE_COOKIE_PATH = '/api/passport';
const PKCE_TTL_S = 600;
const MAX_RETURN_TO = 500;

export function passportConfig(env = process.env) {
  const clientId = (env.HUB_PASSPORT_CLIENT_ID || '').trim();
  const clientSecret = (env.HUB_PASSPORT_CLIENT_SECRET || '').trim();
  return {
    configured: !!(clientId && clientSecret),
    clientId,
    clientSecret,
    redirectUri: (env.HUB_PASSPORT_REDIRECT_URI || '').trim(),
    ssoUrl: env.HUB_SSO_URL || 'https://class.jiacpr.com/sso',
    ssoAuthUrl: env.HUB_SSO_AUTH_URL || 'https://tpoiyykbgsgnrdwzgzvn.supabase.co/functions/v1/sso-auth',
    jwksUrl: env.HUB_JWKS_URL || DEFAULT_JWKS_URL,
    issuer: env.HUB_PASSPORT_ISSUER || DEFAULT_ISSUER,
    hubAnonKey: (env.HUB_SUPABASE_ANON_KEY || '').trim(),
  };
}

// The Hub only accepts https redirect URIs registered for this client, so each deployment
// (acls/airway/defib/iv/bls domains) can derive its own from the Host it was reached on, unless
// pinned with HUB_PASSPORT_REDIRECT_URI.
export function redirectUriFor(req, cfg) {
  if (cfg.redirectUri) return cfg.redirectUri;
  const host = String(req.headers.host || '').trim();
  if (!/^[A-Za-z0-9.-]+(:\d+)?$/.test(host)) return '';
  return `https://${host}/api/passport/callback`;
}

export function createPkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(18).toString('base64url');
  return { verifier, challenge, state };
}

// Only a same-origin path: "/x", never "//evil" / "/\evil" (browsers treat both as another host).
export function safeReturnTo(value) {
  const v = typeof value === 'string' ? value : '';
  if (!v || v.length > MAX_RETURN_TO) return '/';
  if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\')) return '/';
  if ([...v].some((ch) => ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f)) return '/';
  return v;
}

export function withQuery(path, params) {
  const url = new URL(path, 'http://x');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k || k in out) continue;
    const raw = part.slice(i + 1).trim();
    try { out[k] = decodeURIComponent(raw); } catch { out[k] = raw; }
  }
  return out;
}

export function serializeCookie(name, value, { maxAge, path = '/', httpOnly = true, secure = true, sameSite = 'Lax' } = {}) {
  let s = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (typeof maxAge === 'number') s += `; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
  if (httpOnly) s += '; HttpOnly';
  if (secure) s += '; Secure';
  return s;
}

export function pkceCookie(data) {
  return serializeCookie(PKCE_COOKIE, Buffer.from(JSON.stringify(data)).toString('base64url'), { maxAge: PKCE_TTL_S, path: PKCE_COOKIE_PATH });
}
export function clearPkceCookie() {
  return serializeCookie(PKCE_COOKIE, '', { maxAge: 0, path: PKCE_COOKIE_PATH });
}
export function readPkceCookie(req) {
  const raw = parseCookies(req.headers.cookie)[PKCE_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    return data && typeof data.state === 'string' && typeof data.verifier === 'string' ? data : null;
  } catch {
    return null;
  }
}

export function passportCookie(token, exp, nowMs = Date.now()) {
  return serializeCookie(PASSPORT_COOKIE, token, { maxAge: exp - Math.floor(nowMs / 1000) });
}
export function clearPassportCookie() {
  return serializeCookie(PASSPORT_COOKIE, '', { maxAge: 0 });
}

export function statesMatch(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

export function hubLoginUrl(cfg, { redirectUri, state, challenge }) {
  const url = new URL(cfg.ssoUrl);
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

/** Trades the one-time code for a passport (server-to-server, with this app's client secret). */
export async function exchangeCode(cfg, { code, verifier, redirectUri }, { fetcher = fetch } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (cfg.hubAnonKey) headers.apikey = cfg.hubAnonKey;
  const res = await fetcher(cfg.ssoAuthUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, clientId: cfg.clientId, redirectUri, codeVerifier: verifier, clientSecret: cfg.clientSecret }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) throw new Error(body?.error || `sso-auth ${res.status}`);
  if (body.kind !== 'passport' || typeof body.passport !== 'string') throw new Error('sso-auth returned no passport');
  return body.passport;
}

/** The verified passport claims from the request's cookie, or null (missing/expired/forged). */
export async function readPassport(req, cfg, { fetcher = fetch, now = Date.now() } = {}) {
  if (!cfg.configured) return null;
  const token = parseCookies(req.headers.cookie)[PASSPORT_COOKIE];
  if (!token) return null;
  try {
    return await verifyHubPassport(token, { clientId: cfg.clientId, issuer: cfg.issuer, jwksUrl: cfg.jwksUrl, fetcher, now });
  } catch {
    return null;
  }
}

// A cross-site form/fetch can't carry the SameSite=Lax cookie on POST anyway; this also refuses
// a same-cookie POST whose Origin is some other site, for the state-changing routes.
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = String(req.headers.host || '').trim();
  try { return new URL(origin).host === host; } catch { return false; }
}
