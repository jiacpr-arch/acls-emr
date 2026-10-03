import { getSupabaseAdmin } from './supabaseAdmin.js';
import { enforceRateLimit } from './rateLimit.js';
import { passportConfig, readPassport, safeReturnTo, sameOrigin } from './passportSession.js';
import { stripeConfig, originFor, createCheckoutSession, verifyStripeEvent } from './stripeCheckout.js';
import { findPremiumPlan } from '../../src/config/premiumPlans.js';

// Route handlers for /api/premium/* — the paid "Prep Pass". A pass belongs to a JIA account (the
// Hub passport's `sub`), so it follows the learner across devices and the acls/bls/... deployments
// that share this Supabase project. Everything answers configured:false (and the web app keeps all
// content free) until both Stripe and the JIA passport are set up on the deployment.

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

function premiumEnabled(pcfg, scfg) {
  return pcfg.configured && scfg.configured;
}

// GET → { configured, loggedIn, pass: { plan, expiresAt } | null, unavailable? }
export function createStatusHandler({
  config = () => passportConfig(), stripe = () => stripeConfig(), fetcher = fetch, now = () => Date.now(),
  getAdmin = getSupabaseAdmin,
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    res.setHeader('Cache-Control', 'no-store');
    const pcfg = config();
    if (!premiumEnabled(pcfg, stripe())) return res.status(200).json({ configured: false, loggedIn: false, pass: null });
    const nowMs = now();
    const claims = await readPassport(req, pcfg, { fetcher, now: nowMs });
    if (!claims) return res.status(200).json({ configured: true, loggedIn: false, pass: null });
    try {
      const { data, error } = await getAdmin()
        .from('premium_passes')
        .select('plan, expires_at')
        .eq('hub_sub', claims.sub)
        .gt('expires_at', new Date(nowMs).toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const pass = data ? { plan: data.plan, expiresAt: data.expires_at } : null;
      return res.status(200).json({ configured: true, loggedIn: true, pass });
    } catch (err) {
      console.error('premium status:', err?.message || err);
      return res.status(200).json({ configured: true, loggedIn: true, pass: null, unavailable: true });
    }
  };
}

// POST { plan, returnTo? } → { url } of a Stripe Checkout page. Needs a JIA login (401 otherwise).
export function createCheckoutHandler({
  config = () => passportConfig(), stripe = () => stripeConfig(), fetcher = fetch, now = () => Date.now(),
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });
    if (!enforceRateLimit(req, res, { key: 'premium-checkout', limit: 10, windowMs: 60_000 })) return;
    res.setHeader('Cache-Control', 'no-store');
    const pcfg = config();
    const scfg = stripe();
    if (!premiumEnabled(pcfg, scfg)) return res.status(503).json({ ok: false, reason: 'unavailable' });
    const claims = await readPassport(req, pcfg, { fetcher, now: now() });
    if (!claims) return res.status(401).json({ ok: false, reason: 'not_logged_in' });

    const body = parseBody(req);
    const plan = findPremiumPlan(body.plan);
    if (!plan) return res.status(400).json({ ok: false, reason: 'bad_plan' });
    const origin = originFor(req);
    if (!origin) return res.status(400).json({ ok: false, reason: 'bad_host' });

    try {
      const session = await createCheckoutSession(scfg, {
        plan, sub: claims.sub, origin, returnPath: safeReturnTo(body.returnTo),
      }, { fetcher });
      return res.status(200).json({ ok: true, url: session.url });
    } catch (err) {
      console.error('premium checkout:', err?.message || err);
      return res.status(502).json({ ok: false, reason: 'stripe' });
    }
  };
}

const PAID_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

// A signed delivery from Stripe → { status, body }. Grants the pass once per Checkout Session — the
// grant_premium_pass RPC (supabase-cleanup/premium-passes.sql) is idempotent on the session id and
// extends an active pass instead of overlapping it. 5xx on a DB failure so Stripe retries.
// Takes the raw bytes because the signature covers them exactly (api/premium/webhook.js reads them
// with the Web Request API, never a parsed req.body).
export function createWebhookProcessor({
  stripe = () => stripeConfig(), now = () => Date.now(), getAdmin = getSupabaseAdmin,
} = {}) {
  return async function processWebhook(rawBody, signatureHeader) {
    const scfg = stripe();
    if (!scfg.configured) return { status: 503, body: { error: 'unavailable' } };

    let event;
    try {
      event = verifyStripeEvent(rawBody, signatureHeader, scfg.webhookSecret, { now: now() });
    } catch (err) {
      console.warn('premium webhook rejected:', err?.message || err);
      return { status: 400, body: { error: 'invalid signature' } };
    }

    if (!PAID_EVENTS.has(event?.type)) return { status: 200, body: { received: true } };
    const session = event.data?.object || {};
    // PromptPay/async methods can complete with payment_status "unpaid" first, then send
    // async_payment_succeeded — only a paid session grants anything.
    if (session.payment_status !== 'paid') return { status: 200, body: { received: true, pending: true } };

    const sub = session.metadata?.hub_sub || session.client_reference_id;
    const plan = findPremiumPlan(session.metadata?.plan);
    if (!sub || !plan || typeof session.id !== 'string') {
      console.error('premium webhook: session without plan/sub', session.id);
      return { status: 200, body: { received: true, ignored: true } };
    }

    try {
      const { data, error } = await getAdmin().rpc('grant_premium_pass', {
        p_sub: sub,
        p_plan: plan.id,
        p_days: plan.days,
        p_amount_thb: Math.round(Number(session.amount_total || 0) / 100),
        p_session: session.id,
      });
      if (error) throw new Error(error.message);
      return { status: 200, body: { received: true, expiresAt: data } };
    } catch (err) {
      console.error('premium webhook grant failed:', err?.message || err);
      return { status: 500, body: { error: 'grant failed' } };
    }
  };
}
