import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
    const sub = body.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
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

  if (req.method === 'DELETE') {
    const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
    const endpoint = body.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'missing endpoint' });

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
