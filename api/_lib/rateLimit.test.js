import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, enforceRateLimit, getRequestIp, _resetRateLimitStore } from './rateLimit.js';

const req = (ip = '1.2.3.4') => ({ headers: { 'x-forwarded-for': ip } });

beforeEach(() => _resetRateLimitStore());

test('allows requests under the limit', () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit(req(), { key: 'k', limit: 3, windowMs: 60_000 }).ok, true);
  }
});

test('blocks requests over the limit with a retryAfter', () => {
  const opts = { key: 'k', limit: 2, windowMs: 60_000 };
  rateLimit(req(), opts);
  rateLimit(req(), opts);
  const r = rateLimit(req(), opts);
  assert.equal(r.ok, false);
  assert.ok(r.retryAfter >= 1 && r.retryAfter <= 60);
});

test('tracks IPs independently', () => {
  const opts = { key: 'k', limit: 1, windowMs: 60_000 };
  assert.equal(rateLimit(req('1.1.1.1'), opts).ok, true);
  assert.equal(rateLimit(req('2.2.2.2'), opts).ok, true);
  assert.equal(rateLimit(req('1.1.1.1'), opts).ok, false);
});

test('tracks keys independently for the same IP', () => {
  assert.equal(rateLimit(req(), { key: 'a', limit: 1, windowMs: 60_000 }).ok, true);
  assert.equal(rateLimit(req(), { key: 'b', limit: 1, windowMs: 60_000 }).ok, true);
});

test('window reset allows requests again', async () => {
  const opts = { key: 'k', limit: 1, windowMs: 20 };
  assert.equal(rateLimit(req(), opts).ok, true);
  assert.equal(rateLimit(req(), opts).ok, false);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(rateLimit(req(), opts).ok, true);
});

test('getRequestIp prefers platform headers over x-forwarded-for', () => {
  assert.equal(
    getRequestIp({ headers: { 'x-vercel-forwarded-for': '7.7.7.7', 'x-forwarded-for': '9.9.9.9' } }),
    '7.7.7.7'
  );
  assert.equal(
    getRequestIp({ headers: { 'x-real-ip': '8.8.8.8', 'x-forwarded-for': '9.9.9.9' } }),
    '8.8.8.8'
  );
  assert.equal(getRequestIp({ headers: {} }), 'unknown');
});

test('getRequestIp ignores spoofed left-most x-forwarded-for entries', () => {
  // Client sends its own XFF; the platform appends the real IP on the right.
  assert.equal(
    getRequestIp({ headers: { 'x-forwarded-for': 'spoofed1, spoofed2, 10.0.0.1' } }),
    '10.0.0.1'
  );
  assert.equal(getRequestIp({ headers: { 'x-forwarded-for': '9.9.9.9' } }), '9.9.9.9');
});

test('rate limit cannot be reset by rotating the client-controlled XFF prefix', () => {
  const opts = { key: 'k', limit: 1, windowMs: 60_000 };
  const spoof = (prefix) => ({ headers: { 'x-forwarded-for': `${prefix}, 10.0.0.1` } });
  assert.equal(rateLimit(spoof('1.1.1.1'), opts).ok, true);
  assert.equal(rateLimit(spoof('2.2.2.2'), opts).ok, false);
});

test('enforceRateLimit writes a 429 response when blocked', () => {
  const opts = { key: 'k', limit: 1, windowMs: 60_000 };
  const res = {
    statusCode: null,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  assert.equal(enforceRateLimit(req(), res, opts), true);
  assert.equal(res.statusCode, null);
  assert.equal(enforceRateLimit(req(), res, opts), false);
  assert.equal(res.statusCode, 429);
  assert.ok(res.headers['Retry-After']);
  assert.ok(res.body.error);
});
