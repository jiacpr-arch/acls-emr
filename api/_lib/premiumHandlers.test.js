import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, createHmac } from 'node:crypto';
import { createStatusHandler, createCheckoutHandler, createWebhookProcessor } from './premiumHandlers.js';
import { stripeConfig, verifyStripeEvent } from './stripeCheckout.js';
import { passportConfig } from './passportSession.js';
import { _resetJwksCache } from './hubPassport.js';
import { _resetRateLimitStore } from './rateLimit.js';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const KID = 'k1';
const NOW = Date.UTC(2026, 9, 1, 12, 0, 0);
const NOW_S = Math.floor(NOW / 1000);
const SUB = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const WHSEC = 'whsec_test';
const cfgOn = () => passportConfig({ HUB_PASSPORT_CLIENT_ID: 'acls', HUB_PASSPORT_CLIENT_SECRET: 'sek' });
const stripeOn = () => stripeConfig({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: WHSEC });
const stripeOff = () => stripeConfig({});
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

function mint() {
  const h = b64({ alg: 'ES256', typ: 'jia-passport+jwt', kid: KID });
  const p = b64({ iss: 'https://class.jiacpr.com', aud: 'acls', sub: SUB, name_th: 'ทดสอบ', iat: NOW_S, nbf: NOW_S, exp: NOW_S + 7200, jti: 'j' });
  return `${h}.${p}.${sign('sha256', Buffer.from(`${h}.${p}`), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'ES256', use: 'sig' };

function fetcherWith({ stripeOk = true } = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/jwks.json')) return { ok: true, async json() { return { keys: [jwk] }; } };
    if (String(url).startsWith('https://api.stripe.com/')) {
      return stripeOk
        ? { ok: true, status: 200, async json() { return { id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }; } }
        : { ok: false, status: 400, async json() { return { error: { message: 'promptpay not enabled' } }; } };
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return { fetcher, calls };
}

function fakeRes() {
  const r = {
    statusCode: 200, headers: {}, body: undefined,
    status(c) { r.statusCode = c; return r; },
    json(b) { r.body = b; return r; },
    setHeader(k, v) { r.headers[k.toLowerCase()] = v; },
  };
  return r;
}
const req = (o = {}) => ({ method: 'GET', query: {}, ...o, headers: { host: 'acls.morroo.com', ...(o.headers || {}) } });
const loggedIn = { cookie: `jia_passport=${mint()}` };

function fakeAdmin({ row = null, rpcResult = '2026-10-31T12:00:00.000Z', rpcError = null } = {}) {
  const seen = { filters: [], rpc: [] };
  return {
    seen,
    from(table) {
      seen.table = table;
      const api = {
        select() { return api; },
        eq(k, v) { seen.filters.push(['eq', k, v]); return api; },
        gt(k, v) { seen.filters.push(['gt', k, v]); return api; },
        order() { return api; },
        limit() { return api; },
        async maybeSingle() { return { data: row, error: null }; },
      };
      return api;
    },
    async rpc(name, args) {
      seen.rpc.push({ name, args });
      return rpcError ? { data: null, error: { message: rpcError } } : { data: rpcResult, error: null };
    },
  };
}

beforeEach(() => { _resetJwksCache(); _resetRateLimitStore(); });

test('status: configured:false until Stripe keys are set (web app keeps everything free)', async () => {
  const res = fakeRes();
  await createStatusHandler({ config: cfgOn, stripe: stripeOff })(req(), res);
  assert.deepEqual(res.body, { configured: false, loggedIn: false, pass: null });
});

test('status: not logged in → configured but no pass', async () => {
  const res = fakeRes();
  const { fetcher } = fetcherWith();
  await createStatusHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW })(req(), res);
  assert.deepEqual(res.body, { configured: true, loggedIn: false, pass: null });
});

test('status: returns the active pass for the passport sub', async () => {
  const res = fakeRes();
  const { fetcher } = fetcherWith();
  const admin = fakeAdmin({ row: { plan: 'pass30', expires_at: '2026-10-31T12:00:00+00:00' } });
  await createStatusHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW, getAdmin: () => admin })(
    req({ headers: loggedIn }), res,
  );
  assert.deepEqual(res.body, { configured: true, loggedIn: true, pass: { plan: 'pass30', expiresAt: '2026-10-31T12:00:00+00:00' } });
  assert.equal(admin.seen.table, 'premium_passes');
  assert.deepEqual(admin.seen.filters[0], ['eq', 'hub_sub', SUB]);
  assert.deepEqual(admin.seen.filters[1], ['gt', 'expires_at', new Date(NOW).toISOString()]);
});

test('status: DB down → unavailable flag (client keeps its cached pass)', async () => {
  const res = fakeRes();
  const { fetcher } = fetcherWith();
  await createStatusHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW, getAdmin: () => { throw new Error('no key'); } })(
    req({ headers: loggedIn }), res,
  );
  assert.equal(res.body.unavailable, true);
  assert.equal(res.body.pass, null);
});

test('checkout: needs a JIA login', async () => {
  const res = fakeRes();
  const { fetcher } = fetcherWith();
  await createCheckoutHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW })(
    req({ method: 'POST', body: { plan: 'pass30' } }), res,
  );
  assert.equal(res.statusCode, 401);
});

test('checkout: rejects an unknown plan and a cross-site origin', async () => {
  const { fetcher } = fetcherWith();
  const h = createCheckoutHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW });
  const bad = fakeRes();
  await h(req({ method: 'POST', headers: loggedIn, body: { plan: 'free-forever' } }), bad);
  assert.equal(bad.statusCode, 400);
  const xsite = fakeRes();
  await h(req({ method: 'POST', headers: { ...loggedIn, origin: 'https://evil.example' }, body: { plan: 'pass30' } }), xsite);
  assert.equal(xsite.statusCode, 403);
});

test('checkout: price comes from the server plan, sub goes into metadata, returns to the same site', async () => {
  const res = fakeRes();
  const { fetcher, calls } = fetcherWith();
  await createCheckoutHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW })(
    req({ method: 'POST', headers: loggedIn, body: JSON.stringify({ plan: 'pass365', returnTo: '/sim', amountThb: 1 }) }), res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.url, 'https://checkout.stripe.com/c/pay/cs_1');
  const call = calls.find((c) => c.url.startsWith('https://api.stripe.com/'));
  assert.equal(call.init.headers.Authorization, 'Bearer sk_test_x');
  const form = new URLSearchParams(call.init.body);
  assert.equal(form.get('line_items[0][price_data][unit_amount]'), '59000');
  assert.equal(form.get('line_items[0][price_data][currency]'), 'thb');
  assert.equal(form.get('metadata[hub_sub]'), SUB);
  assert.equal(form.get('metadata[plan]'), 'pass365');
  assert.equal(form.get('payment_method_types[0]'), 'card');
  assert.equal(form.get('payment_method_types[1]'), 'promptpay');
  assert.equal(form.get('success_url'), 'https://acls.morroo.com/sim?premium=success');
  assert.equal(form.get('cancel_url'), 'https://acls.morroo.com/sim?premium=cancel');
});

test('checkout: an off-site returnTo falls back to /', async () => {
  const res = fakeRes();
  const { fetcher, calls } = fetcherWith();
  await createCheckoutHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW })(
    req({ method: 'POST', headers: loggedIn, body: { plan: 'pass30', returnTo: '//evil.example/x' } }), res,
  );
  const form = new URLSearchParams(calls.find((c) => c.url.startsWith('https://api.stripe.com/')).init.body);
  assert.equal(form.get('success_url'), 'https://acls.morroo.com/?premium=success');
});

test('checkout: Stripe error → 502', async () => {
  const res = fakeRes();
  const { fetcher } = fetcherWith({ stripeOk: false });
  await createCheckoutHandler({ config: cfgOn, stripe: stripeOn, fetcher, now: () => NOW })(
    req({ method: 'POST', headers: loggedIn, body: { plan: 'pass30' } }), res,
  );
  assert.equal(res.statusCode, 502);
});

function signed(event, { secret = WHSEC, t = NOW_S } = {}) {
  const raw = Buffer.from(JSON.stringify(event));
  const sig = createHmac('sha256', secret).update(`${t}.${raw.toString('utf8')}`).digest('hex');
  return { raw, header: `t=${t},v1=${sig}` };
}
const paidEvent = (over = {}) => ({
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_1', payment_status: 'paid', amount_total: 24900, metadata: { hub_sub: SUB, plan: 'pass30' }, ...over } },
});

test('stripe signature: accepts a valid one, rejects forged / stale / missing', () => {
  const { raw, header } = signed({ ok: 1 });
  assert.deepEqual(verifyStripeEvent(raw, header, WHSEC, { now: NOW }), { ok: 1 });
  assert.throws(() => verifyStripeEvent(raw, signed({ ok: 1 }, { secret: 'other' }).header, WHSEC, { now: NOW }));
  assert.throws(() => verifyStripeEvent(raw, header, WHSEC, { now: NOW + 10 * 60_000 }));
  assert.throws(() => verifyStripeEvent(raw, '', WHSEC, { now: NOW }));
  assert.throws(() => verifyStripeEvent(Buffer.from('{"ok":2}'), header, WHSEC, { now: NOW }));
});

test('webhook: a paid session grants the plan once via the RPC', async () => {
  const admin = fakeAdmin();
  const { raw, header } = signed(paidEvent());
  const out = await createWebhookProcessor({ stripe: stripeOn, now: () => NOW, getAdmin: () => admin })(raw, header);
  assert.equal(out.status, 200);
  assert.deepEqual(admin.seen.rpc, [{
    name: 'grant_premium_pass',
    args: { p_sub: SUB, p_plan: 'pass30', p_days: 30, p_amount_thb: 249, p_session: 'cs_1' },
  }]);
});

test('webhook: unpaid (PromptPay pending), other events and bad signatures grant nothing', async () => {
  const admin = fakeAdmin();
  const proc = createWebhookProcessor({ stripe: stripeOn, now: () => NOW, getAdmin: () => admin });
  const pending = signed(paidEvent({ payment_status: 'unpaid' }));
  assert.equal((await proc(pending.raw, pending.header)).body.pending, true);
  const other = signed({ type: 'payment_intent.created', data: { object: {} } });
  assert.equal((await proc(other.raw, other.header)).status, 200);
  const forged = signed(paidEvent(), { secret: 'nope' });
  assert.equal((await proc(forged.raw, forged.header)).status, 400);
  assert.equal(admin.seen.rpc.length, 0);
});

test('webhook: async_payment_succeeded grants; DB failure answers 500 so Stripe retries', async () => {
  const ok = fakeAdmin();
  const ev = signed({ ...paidEvent(), type: 'checkout.session.async_payment_succeeded' });
  assert.equal((await createWebhookProcessor({ stripe: stripeOn, now: () => NOW, getAdmin: () => ok })(ev.raw, ev.header)).status, 200);
  assert.equal(ok.seen.rpc.length, 1);
  const broken = fakeAdmin({ rpcError: 'boom' });
  assert.equal((await createWebhookProcessor({ stripe: stripeOn, now: () => NOW, getAdmin: () => broken })(ev.raw, ev.header)).status, 500);
});

test('webhook: dark until configured', async () => {
  const { raw, header } = signed(paidEvent());
  assert.equal((await createWebhookProcessor({ stripe: stripeOff })(raw, header)).status, 503);
});
