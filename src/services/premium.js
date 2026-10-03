// "Prep Pass" (เนื้อหาเสียเงิน) ฝั่ง client — สถานะมาจาก /api/premium/status (pass ผูกกับบัญชี JIA)
// เก็บ cache ล่าสุดใน localStorage ไว้ใช้ตอนออฟไลน์ / ตอน cookie บัญชี JIA (≤12 ชม.) หมดอายุ —
// เป็น paywall แบบนุ่ม (เนื้อหาเกมอยู่ใน bundle อยู่แล้ว) จึงเปิดให้เล่นเมื่อไม่แน่ใจ:
// deployment ที่ยังไม่ตั้ง Stripe (configured:false) หรือยังไม่เคยโหลดสถานะได้ = ฟรีทั้งหมดเหมือนเดิม

const CACHE_KEY = 'acls-premium';

function readCache() {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

function writeCache(v) {
  try {
    if (v) localStorage.setItem(CACHE_KEY, JSON.stringify(v));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* private mode etc. */ }
}

const cached = readCache();
let state = {
  loaded: false,
  configured: !!cached?.configured,
  loggedIn: false,
  pass: cached?.pass || null, // { plan, expiresAt } | null
  returnFlag: null, // 'success' | 'cancel' จาก Stripe (อ่านครั้งเดียว)
};
let inflight = null;
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

export function getPremiumState() {
  return state;
}

export function subscribePremium(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isPassActive(pass, now = Date.now()) {
  const t = Date.parse(pass?.expiresAt || '');
  return Number.isFinite(t) && t > now;
}

// Stripe ส่งกลับมาที่หน้าเดิมพร้อม ?premium=success|cancel — อ่านครั้งเดียวแล้วลบออกจาก URL
function takeReturnFlag() {
  try {
    const url = new URL(window.location.href);
    const flag = url.searchParams.get('premium');
    if (!flag) return null;
    url.searchParams.delete('premium');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    return ['success', 'cancel'].includes(flag) ? flag : null;
  } catch {
    return null;
  }
}

async function fetchStatus() {
  const res = await fetch('/api/premium/status', { cache: 'no-store', credentials: 'same-origin' });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('application/json')) throw new Error('unavailable');
  return res.json();
}

function applyStatus(body) {
  const configured = !!body.configured;
  let pass = body.pass && isPassActive(body.pass) ? body.pass : null;
  // ไม่ได้ login (cookie หมดอายุ) หรือฐานข้อมูลตอบไม่ได้ → ใช้ pass ที่เคยเห็นในเครื่องนี้ต่อจนหมดอายุ
  if (!pass && (!body.loggedIn || body.unavailable) && isPassActive(state.pass)) pass = state.pass;
  writeCache(configured ? { configured, pass } : null);
  setState({ loaded: true, configured, loggedIn: !!body.loggedIn, pass });
}

export function loadPremium({ force = false } = {}) {
  if (inflight && !force) return inflight;
  inflight = (async () => {
    if (!state.loaded) {
      const flag = takeReturnFlag();
      if (flag) setState({ returnFlag: flag });
    }
    try {
      applyStatus(await fetchStatus());
      // จ่ายเสร็จแต่ webhook ยังมาไม่ถึง — ถามซ้ำสักพัก (PromptPay อาจช้ากว่าบัตรเล็กน้อย)
      if (state.returnFlag === 'success' && !isPassActive(state.pass)) {
        for (let i = 0; i < 8 && !isPassActive(state.pass); i += 1) {
          await new Promise((r) => setTimeout(r, 2500));
          try { applyStatus(await fetchStatus()); } catch { /* try again */ }
        }
      }
    } catch {
      setState({ loaded: true });
    }
    return state;
  })();
  return inflight;
}

export function clearPremiumReturnFlag() {
  if (state.returnFlag) setState({ returnFlag: null });
}

// ไปหน้าชำระเงินของ Stripe — { ok:false, reason } ถ้าเปิดไม่ได้ (reason 'not_logged_in' = ต้อง login ก่อน)
export async function startPremiumCheckout(planId, returnTo) {
  try {
    const res = await fetch('/api/premium/checkout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: planId,
        returnTo: returnTo || `${window.location.pathname}${window.location.search}`,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && typeof body.url === 'string') {
      window.location.assign(body.url);
      return { ok: true };
    }
    return { ok: false, reason: body.reason || 'http' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
