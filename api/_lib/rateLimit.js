// Best-effort per-IP rate limiting for public endpoints. State is an
// in-memory Map per serverless instance, so limits are approximate under
// horizontal scale — good enough to stop a single IP hammering the paid AI
// endpoints without adding external infra.

const buckets = new Map();
const MAX_BUCKETS = 10_000;

export function getRequestIp(req) {
  // Only trust headers the platform sets. The left-most x-forwarded-for entry
  // is client-supplied and trivially spoofable, which would let an attacker
  // rotate fake IPs past the limit — so prefer Vercel's own header, then
  // x-real-ip, then the right-most (proxy-appended) x-forwarded-for entry.
  const vercelIp = String(req.headers['x-vercel-forwarded-for'] || '').split(',')[0].trim();
  if (vercelIp) return vercelIp;
  const realIp = String(req.headers['x-real-ip'] || '').trim();
  if (realIp) return realIp;
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',');
  return forwarded[forwarded.length - 1].trim() || 'unknown';
}

/**
 * @param {object} req - incoming request (headers used for IP)
 * @param {object} opts
 * @param {string} opts.key - endpoint name, namespaces the counter
 * @param {number} opts.limit - max requests per window
 * @param {number} opts.windowMs - window length in ms
 * @returns {{ ok: boolean, retryAfter: number }} retryAfter in seconds
 */
export function rateLimit(req, { key, limit, windowMs }) {
  const now = Date.now();
  const id = `${key}:${getRequestIp(req)}`;
  let bucket = buckets.get(id);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    if (buckets.size >= MAX_BUCKETS) pruneExpired(now);
    buckets.set(id, bucket);
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Applies the limit and, when exceeded, writes the 429 response. Returns true if allowed. */
export function enforceRateLimit(req, res, opts) {
  const { ok, retryAfter } = rateLimit(req, opts);
  if (!ok) {
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests — please try again later' });
  }
  return ok;
}

function pruneExpired(now) {
  for (const [id, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(id);
  }
  // Still full of live buckets (sustained attack): drop oldest entries.
  if (buckets.size >= MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS + 1;
    let i = 0;
    for (const id of buckets.keys()) {
      if (i++ >= excess) break;
      buckets.delete(id);
    }
  }
}

/** Test hook. */
export function _resetRateLimitStore() {
  buckets.clear();
}
