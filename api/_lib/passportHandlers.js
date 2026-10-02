import { getSupabaseAdmin } from './supabaseAdmin.js';
import { enforceRateLimit } from './rateLimit.js';
import { verifyHubPassport, publicPassportProfile } from './hubPassport.js';
import {
  passportConfig, redirectUriFor, createPkce, safeReturnTo, withQuery, pkceCookie, clearPkceCookie,
  readPkceCookie, passportCookie, clearPassportCookie, statesMatch, hubLoginUrl, exchangeCode,
  readPassport, readPassportToken, sameOrigin, hubLogoutUrl,
} from './passportSession.js';
import { fetchHubCertificates } from './hubResults.js';

// Route handlers for /api/passport/* (optional "log in with a JIA account"). Factories so tests
// can inject config/fetch/Supabase; the files under api/passport/ just export the defaults.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CLASS_CODE_RE = /^[A-Z0-9-]{3,40}$/;

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

export function createLoginHandler({ config = () => passportConfig() } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!enforceRateLimit(req, res, { key: 'passport-login', limit: 20, windowMs: 60_000 })) return;
    const cfg = config();
    const returnTo = safeReturnTo(req.query?.returnTo);
    const redirectUri = cfg.configured ? redirectUriFor(req, cfg) : '';
    if (!redirectUri) return redirect(res, withQuery(returnTo, { passport: 'unavailable' }));
    const { verifier, challenge, state } = createPkce();
    res.setHeader('Set-Cookie', pkceCookie({ state, verifier, returnTo, redirectUri }));
    return redirect(res, hubLoginUrl(cfg, { redirectUri, state, challenge }));
  };
}

export function createCallbackHandler({ config = () => passportConfig(), fetcher = fetch, now = () => Date.now() } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!enforceRateLimit(req, res, { key: 'passport-callback', limit: 20, windowMs: 60_000 })) return;
    const cfg = config();
    const saved = readPkceCookie(req);
    const returnTo = safeReturnTo(saved?.returnTo);
    const cookies = [clearPkceCookie()];
    const done = (passport, reason) => {
      res.setHeader('Set-Cookie', cookies);
      return redirect(res, withQuery(returnTo, reason ? { passport, reason } : { passport }));
    };
    if (!cfg.configured) return done('unavailable');
    // No PKCE cookie: expired (>10 min on the Hub), another browser, or a replayed link.
    if (!saved?.redirectUri) return done('error', 'expired');
    const code = typeof req.query?.code === 'string' ? req.query.code : '';
    if (!code || code.length > 500) return done('error', 'no_code');
    if (!statesMatch(req.query?.state, saved.state)) return done('error', 'state');
    try {
      const token = await exchangeCode(cfg, { code, verifier: saved.verifier, redirectUri: saved.redirectUri }, { fetcher });
      const nowMs = now();
      const claims = await verifyHubPassport(token, { clientId: cfg.clientId, issuer: cfg.issuer, jwksUrl: cfg.jwksUrl, fetcher, now: nowMs });
      cookies.push(passportCookie(token, claims.exp, nowMs));
      return done('ok');
    } catch (err) {
      console.error('passport callback failed:', err?.reason || err?.message);
      return done('error', 'exchange');
    }
  };
}

export function createMeHandler({ config = () => passportConfig(), fetcher = fetch, now = () => Date.now() } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    res.setHeader('Cache-Control', 'no-store');
    const cfg = config();
    if (!cfg.configured) return res.status(200).json({ configured: false, loggedIn: false, profile: null });
    const claims = await readPassport(req, cfg, { fetcher, now: now() });
    if (!claims) return res.status(200).json({ configured: true, loggedIn: false, profile: null });
    return res.status(200).json({ configured: true, loggedIn: true, profile: publicPassportProfile(claims) });
  };
}

// GET /api/passport/certificates — the logged-in learner's central online certificates at the Hub
// (number, expiry, verification link), shown next to this app's own certificate. Never an error
// page: no passport, not configured, or the Hub unreachable all answer with an empty list.
export function createCertificatesHandler({ config = () => passportConfig(), fetcher = fetch, now = () => Date.now() } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    res.setHeader('Cache-Control', 'no-store');
    const cfg = config();
    if (!cfg.configured) return res.status(200).json({ configured: false, loggedIn: false, certificates: [] });
    const claims = await readPassport(req, cfg, { fetcher, now: now() });
    if (!claims) return res.status(200).json({ configured: true, loggedIn: false, certificates: [] });
    try {
      const certificates = await fetchHubCertificates(cfg, readPassportToken(req), { fetcher });
      return res.status(200).json({ configured: true, loggedIn: true, sub: claims.sub, certificates });
    } catch (err) {
      console.warn('hub certificates unavailable (non-fatal):', err?.message || err);
      return res.status(200).json({ configured: true, loggedIn: true, sub: claims.sub, certificates: [], unavailable: true });
    }
  };
}

// POST { everywhere?, returnTo? } — always drops this app's passport cookie. With `everywhere`, also
// answers the Hub's logout URL (app/sso/logout there) for the browser to visit next, so the JIA
// session ends too and the next person on a shared device is asked to log in again.
export function createLogoutHandler({ config = () => passportConfig() } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });
    res.setHeader('Set-Cookie', clearPassportCookie());
    res.setHeader('Cache-Control', 'no-store');
    const body = parseBody(req);
    const cfg = config();
    const redirectUri = body.everywhere === true && cfg.configured ? redirectUriFor(req, cfg) : '';
    if (!redirectUri) return res.status(200).json({ ok: true });
    return res.status(200).json({ ok: true, hubLogoutUrl: hubLogoutUrl(cfg, { redirectUri, returnPath: body.returnTo }) });
  };
}

// Links the logged-in JIA account to this device's roster row (cohort_students) so instructors
// and later result/certificate steps know which real person it is. Only this route (service
// role, after checking the passport) writes hub_user_id — never the class-code RPCs anyone can
// call. `expectedSub` is the account the student confirmed on this device: a different passport
// sitting in the cookie (shared device, someone else logged in since) must never be bound instead.
export function createBindHandler({
  config = () => passportConfig(), fetcher = fetch, now = () => Date.now(), getAdmin = getSupabaseAdmin,
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });
    if (!enforceRateLimit(req, res, { key: 'passport-bind', limit: 20, windowMs: 60_000 })) return;
    res.setHeader('Cache-Control', 'no-store');
    const cfg = config();
    if (!cfg.configured) return res.status(503).json({ ok: false, reason: 'unavailable' });
    const claims = await readPassport(req, cfg, { fetcher, now: now() });
    if (!claims) return res.status(401).json({ ok: false, reason: 'not_logged_in' });

    const body = parseBody(req);
    const classCode = String(body.classCode || '').trim().toUpperCase();
    const studentPk = String(body.studentPk || '').trim();
    if (!CLASS_CODE_RE.test(classCode) || !UUID_RE.test(studentPk)) {
      return res.status(400).json({ ok: false, reason: 'bad_request' });
    }
    if (body.expectedSub !== claims.sub) return res.status(409).json({ ok: false, reason: 'sub_mismatch' });

    let admin;
    try { admin = getAdmin(); } catch (err) {
      console.error('passport bind:', err.message);
      return res.status(503).json({ ok: false, reason: 'unavailable' });
    }

    const { data: cls, error: clsErr } = await admin
      .from('cohort_classes').select('id').eq('code', classCode).is('archived_at', null).maybeSingle();
    if (clsErr) return res.status(500).json({ ok: false, reason: 'db' });
    if (!cls) return res.status(404).json({ ok: false, reason: 'class_not_found' });

    const { data: row, error: rowErr } = await admin
      .from('cohort_students').select('id, hub_user_id').eq('id', studentPk).eq('class_id', cls.id).maybeSingle();
    if (rowErr) return res.status(500).json({ ok: false, reason: 'db' });
    // Not on the server yet — the device's sync hasn't pushed this student; the client retries.
    if (!row) return res.status(404).json({ ok: false, reason: 'not_synced' });
    if (row.hub_user_id === claims.sub) return res.status(200).json({ ok: true, already: true });
    if (row.hub_user_id) return res.status(409).json({ ok: false, reason: 'bound_to_other' });

    const { data: updated, error: updErr } = await admin
      .from('cohort_students')
      .update({ hub_user_id: claims.sub, hub_bound_at: new Date(now()).toISOString() })
      .eq('id', studentPk).eq('class_id', cls.id).is('hub_user_id', null)
      .select('id');
    if (updErr) {
      // unique (class_id, hub_user_id): this JIA account already holds another row in the class.
      if (updErr.code === '23505') return res.status(409).json({ ok: false, reason: 'account_in_use' });
      return res.status(500).json({ ok: false, reason: 'db' });
    }
    if (!updated?.length) {
      // Lost a race: bound between the read above and this update — by this same account (a
      // concurrent retry) is fine, anyone else is a conflict.
      const { data: again } = await admin.from('cohort_students').select('hub_user_id').eq('id', studentPk).maybeSingle();
      if (again?.hub_user_id === claims.sub) return res.status(200).json({ ok: true, already: true });
      return res.status(409).json({ ok: false, reason: 'bound_to_other' });
    }
    return res.status(200).json({ ok: true });
  };
}
