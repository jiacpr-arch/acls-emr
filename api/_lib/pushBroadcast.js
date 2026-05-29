import webpush from 'web-push';
import { getSupabaseAdmin } from './supabaseAdmin.js';

const DEFAULT_PUBLIC_KEY = 'BH5zjcz8nBNK5ZdfLw4m3-0wTsRLS4I2tjTz-X1waylgkqW5h1iMpkd5wZbaoF6hdR0CWF2WLniS7zwFQA5lWVU';

let configured = false;
function configure() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:jiacpr@gmail.com';
  if (!privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

// item: { title, summary, source_url, course }
// Sends to all active subscriptions matching course (or course='both').
// Returns { sent, failed, disabled }.
export async function broadcastNewsItem(item) {
  if (!configure()) {
    return { sent: 0, failed: 0, disabled: 0, skipped: 'VAPID_PRIVATE_KEY missing' };
  }

  const supabase = getSupabaseAdmin();
  const itemCourse = item.course || 'both';
  const courseFilter = itemCourse === 'both' ? ['acls', 'bls', 'both'] : [itemCourse, 'both'];

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, failure_count')
    .is('disabled_at', null)
    .in('course', courseFilter);

  if (error || !subs?.length) {
    return { sent: 0, failed: 0, disabled: 0 };
  }

  const payload = JSON.stringify({
    title: item.title.slice(0, 100),
    body: item.summary.slice(0, 240),
    url: item.source_url || '/news',
    tag: 'news-' + (item.id || Date.now()),
  });

  const results = await Promise.allSettled(
    subs.map(s =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  let sent = 0, failed = 0, disabled = 0;
  const toDisable = [];
  const toIncrement = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      sent++;
      continue;
    }
    failed++;
    const status = r.reason?.statusCode;
    if (status === 404 || status === 410) {
      // Subscription gone — disable
      toDisable.push(subs[i].id);
      disabled++;
    } else {
      toIncrement.push(subs[i]);
    }
  }

  if (toDisable.length) {
    await supabase
      .from('push_subscriptions')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', toDisable);
  }

  // Touch last_sent_at on successful ones (best-effort, batch)
  if (sent > 0) {
    const successIds = results
      .map((r, i) => (r.status === 'fulfilled' ? subs[i].id : null))
      .filter(Boolean);
    await supabase
      .from('push_subscriptions')
      .update({ last_sent_at: new Date().toISOString(), failure_count: 0 })
      .in('id', successIds);
  }

  return { sent, failed, disabled };
}
