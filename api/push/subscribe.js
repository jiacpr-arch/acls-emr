import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { enforceRateLimit } from '../_lib/rateLimit.js';

export const config = { maxDuration: 10 };

// Push subscription fields have well-known shapes: an https endpoint URL and
// two base64url-encoded keys. Anything larger is junk (or an abuse attempt)
// and would bloat the table via the service-role client.
const MAX_ENDPOINT_LEN = 1000;
const MAX_KEY_LEN = 300;

function validSubscription(sub) {
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return false;
  const { endpoint } = sub;
  const { p256dh, auth } = sub.keys;
  if (typeof endpoint !== 'string' || typeof p256dh !== 'string' || typeof auth !== 'string') return false;
  if (endpoint.length > MAX_ENDPOINT_LEN || !endpoint.startsWith('https://')) return false;
  if (p256dh.length > MAX_KEY_LEN || auth.length > MAX_KEY_LEN) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!enforceRateLimit(req, res, { key: 'push-subscribe', limit: 10, windowMs: 60_000 })) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('push/subscribe: supabase admin unavailable:', err.message);
    return res.status(500).json({ error: 'Server not configured' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  if (req.method === 'POST') {
    const sub = body.subscription;
    if (!validSubscription(sub)) {
      return res.status(400).json({ error: 'invalid subscription' });
    }
    const course = ['acls', 'bls', 'both'].includes(body.course) ? body.course : 'both';

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        course,
        user_agent: String(body.userAgent || '').slice(0, 200) || null,
        failure_count: 0,
        disabled_at: null,
      }, { onConflict: 'endpoint' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // DELETE
  const endpoint = body.endpoint;
  if (!endpoint || typeof endpoint !== 'string' || endpoint.length > MAX_ENDPOINT_LEN) {
    return res.status(400).json({ error: 'missing endpoint' });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
