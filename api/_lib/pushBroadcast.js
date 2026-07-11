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

// A subscription whose pushes keep failing transiently (not a hard 404/410)
// is likely dead too — disable it once its failure streak reaches this count.
export const FAILURE_DISABLE_THRESHOLD = 5;

// Pure: partition Promise.allSettled push results into successes, gone
// subscriptions (404/410 → disable immediately), and transient failures
// (increment failure_count; disable once the streak reaches the threshold).
export function tallyPushResults(results, subs, threshold = FAILURE_DISABLE_THRESHOLD) {
  const successIds = [];
  const toDisable = [];
  const toIncrement = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      successIds.push(subs[i].id);
      continue;
    }
    const status = r.reason?.statusCode;
    if (status === 404 || status === 410) {
      toDisable.push(subs[i].id);
      continue;
    }
    const failureCount = (subs[i].failure_count || 0) + 1;
    if (failureCount >= threshold) toDisable.push(subs[i].id);
    else toIncrement.push({ id: subs[i].id, failure_count: failureCount });
  }
  return { successIds, toDisable, toIncrement };
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

  const { successIds, toDisable, toIncrement } = tallyPushResults(results, subs);
  const sent = successIds.length;
  const failed = results.length - sent;
  const disabled = toDisable.length;

  if (toDisable.length) {
    await supabase
      .from('push_subscriptions')
      .update({ disabled_at: new Date().toISOString() })
      .in('id', toDisable);
  }

  // Persist transient-failure streaks so a subscription that keeps failing
  // eventually crosses the threshold and gets disabled on a later broadcast.
  for (const { id, failure_count } of toIncrement) {
    await supabase
      .from('push_subscriptions')
      .update({ failure_count })
      .eq('id', id);
  }

  // Touch last_sent_at on successful ones (best-effort, batch)
  if (sent > 0) {
    await supabase
      .from('push_subscriptions')
      .update({ last_sent_at: new Date().toISOString(), failure_count: 0 })
      .in('id', successIds);
  }

  return { sent, failed, disabled };
}
