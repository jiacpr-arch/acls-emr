// Optional "log in with a JIA account" (the Hub, class.jiacpr.com). The passport itself lives in
// an httpOnly cookie set by api/passport/callback — this module only ever sees the public profile
// from /api/passport/me, and stores nothing in localStorage/IndexedDB itself (the student record's
// hubSub field is written by StudentIdentityModal). Everything degrades to "not configured" when
// the API isn't there (vite dev, a deployment without HUB_PASSPORT_* env, offline).

const SIGNED_OUT = { configured: false, loggedIn: false, profile: null };
let state = { loaded: false, ...SIGNED_OUT, returnFlag: null };
let inflight = null;
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

export function getPassportState() {
  return state;
}

export function subscribePassport(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// api/passport/callback returns to the page with ?passport=ok|error|unavailable — read it once and
// strip it so a reload or a shared link doesn't show the message again.
function takeReturnFlag() {
  try {
    const url = new URL(window.location.href);
    const flag = url.searchParams.get('passport');
    if (!flag) return null;
    url.searchParams.delete('passport');
    url.searchParams.delete('reason');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    return ['ok', 'error', 'unavailable'].includes(flag) ? flag : null;
  } catch {
    return null;
  }
}

export function loadPassport({ force = false } = {}) {
  if (inflight && !force) return inflight;
  inflight = (async () => {
    const returnFlag = state.loaded ? state.returnFlag : takeReturnFlag();
    try {
      const res = await fetch('/api/passport/me', { cache: 'no-store', credentials: 'same-origin' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('application/json')) throw new Error('unavailable');
      const body = await res.json();
      setState({
        loaded: true,
        configured: !!body.configured,
        loggedIn: !!body.loggedIn && !!body.profile?.sub,
        profile: body.loggedIn ? body.profile : null,
        returnFlag,
      });
    } catch {
      setState({ loaded: true, ...SIGNED_OUT, returnFlag });
    }
    return state;
  })();
  return inflight;
}

export function clearPassportReturnFlag() {
  if (state.returnFlag) setState({ returnFlag: null });
}

export function startPassportLogin(returnTo) {
  const target = returnTo || `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/api/passport/login?returnTo=${encodeURIComponent(target)}`);
}

export async function logoutPassport() {
  try {
    await fetch('/api/passport/logout', { method: 'POST', credentials: 'same-origin' });
  } catch { /* the cookie also expires on its own */ }
  setState({ loggedIn: false, profile: null, returnFlag: null });
}

// Links the confirmed JIA account to this student's roster row on the server.
// { ok } on success; { ok:false, status, reason } otherwise (reason from the API, or 'network').
export async function bindPassportStudent({ classCode, studentPk, expectedSub }) {
  try {
    const res = await fetch('/api/passport/bind', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, studentPk, expectedSub }),
    });
    const type = res.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await res.json().catch(() => ({})) : {};
    return { ok: res.ok && !!body.ok, status: res.status, reason: body.reason || (res.ok ? null : 'http') };
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

// The logged-in learner's central online certificates at the Hub (api/passport/certificates —
// the server asks the Hub with the httpOnly passport). Never throws.
export async function fetchHubCertificates() {
  try {
    const res = await fetch('/api/passport/certificates', { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return { loggedIn: false, certificates: [] };
    const data = await res.json();
    return { loggedIn: !!data.loggedIn, sub: data.sub || null, certificates: Array.isArray(data.certificates) ? data.certificates : [] };
  } catch {
    return { loggedIn: false, certificates: [] };
  }
}
