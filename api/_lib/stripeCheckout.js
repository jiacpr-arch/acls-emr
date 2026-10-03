import { createHmac, timingSafeEqual } from 'node:crypto';

// Stripe for the "Prep Pass" (src/config/premiumPlans.js) — plain fetch against the REST API, no SDK.
// Dark until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set on the deployment (server-side only,
// never VITE_). See docs/premium-pass.md.

const STRIPE_API = 'https://api.stripe.com/v1';
const DEFAULT_PAYMENT_METHODS = 'card,promptpay';
const SIGNATURE_TOLERANCE_S = 300;

export function stripeConfig(env = process.env) {
  const secretKey = (env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = (env.STRIPE_WEBHOOK_SECRET || '').trim();
  const paymentMethods = (env.STRIPE_PAYMENT_METHODS || DEFAULT_PAYMENT_METHODS)
    .split(',').map((s) => s.trim()).filter((s) => /^[a-z_]+$/.test(s));
  return {
    configured: !!(secretKey && webhookSecret),
    secretKey,
    webhookSecret,
    paymentMethods: paymentMethods.length ? paymentMethods : ['card'],
  };
}

// https://<host> of the deployment the browser reached (acls/bls/airway/... domains), or '' if the
// Host header isn't a plain hostname — success/cancel URLs must come back to the same site.
export function originFor(req) {
  const host = String(req.headers.host || '').trim();
  if (!/^[A-Za-z0-9.-]+(:\d+)?$/.test(host)) return '';
  return `https://${host}`;
}

function withPremiumFlag(origin, returnPath, flag) {
  const url = new URL(returnPath, origin);
  url.searchParams.set('premium', flag);
  return url.toString();
}

/** Creates a hosted Checkout Session for one plan; resolves { id, url }. */
export async function createCheckoutSession(cfg, { plan, sub, origin, returnPath }, { fetcher = fetch } = {}) {
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('locale', 'th');
  cfg.paymentMethods.forEach((m, i) => form.set(`payment_method_types[${i}]`, m));
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', 'thb');
  form.set('line_items[0][price_data][unit_amount]', String(plan.amountThb * 100));
  form.set('line_items[0][price_data][product_data][name]', plan.label);
  form.set('client_reference_id', sub);
  form.set('metadata[hub_sub]', sub);
  form.set('metadata[plan]', plan.id);
  form.set('success_url', withPremiumFlag(origin, returnPath, 'success'));
  form.set('cancel_url', withPremiumFlag(origin, returnPath, 'cancel'));

  const res = await fetcher(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
    signal: AbortSignal.timeout(10000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || typeof body?.url !== 'string') {
    throw new Error(body?.error?.message || `stripe ${res.status}`);
  }
  return { id: body.id, url: body.url };
}

/**
 * Checks a `Stripe-Signature` header against the raw request body (HMAC-SHA256 of "<t>.<body>").
 * Throws on a missing/forged/stale signature; returns the parsed event otherwise.
 */
export function verifyStripeEvent(rawBody, header, secret, { now = Date.now(), toleranceS = SIGNATURE_TOLERANCE_S } = {}) {
  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  let t = null;
  const sigs = [];
  for (const part of String(header || '').split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') t = Number(v);
    else if (k === 'v1') sigs.push(v);
  }
  if (!Number.isFinite(t) || !sigs.length) throw new Error('bad signature header');
  if (Math.abs(Math.floor(now / 1000) - t) > toleranceS) throw new Error('stale signature');
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex'));
  const ok = sigs.some((s) => {
    const got = Buffer.from(s);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
  if (!ok) throw new Error('signature mismatch');
  return JSON.parse(payload);
}
