// LINE Official Account push notification — alerts the admin when a student
// earns a certificate. Uses the LINE Messaging API push endpoint:
//   POST https://api.line.me/v2/bot/message/push
//
// Config via env (set in Vercel, NOT exposed to the client — no VITE_ prefix):
//   LINE_CHANNEL_ACCESS_TOKEN — long-lived channel access token for the OA
//   LINE_ADMIN_USER_ID        — userId (or groupId / roomId) to push to
//                               (LINE_ADMIN_TARGET_ID also accepted as alias)

const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';
const MAX_NAME_LEN = 80;
const MAX_ID_LEN = 60;

// Build the admin alert text. Pure function (no I/O) so it's unit-testable.
// payload: { studentName, studentPhone, course, courseTitle, certId, completedAt,
//            preTestScore, postTestScore, ekgPassed }
export function buildCertMessage(payload = {}) {
  const name = String(payload.studentName || '').trim().slice(0, MAX_NAME_LEN) || '(ไม่ระบุชื่อ)';
  const phone = String(payload.studentPhone || '').trim().slice(0, 20);
  const isBls = payload.course === 'bls';
  const title = String(payload.courseTitle || (isBls ? 'BLS' : 'ACLS')).trim();
  const certId = String(payload.certId || '').trim().slice(0, MAX_ID_LEN) || '—';
  const date = formatThaiDate(payload.completedAt);

  const scoreParts = [];
  if (!isBls && payload.preTestScore != null) scoreParts.push(`Pre-test ${payload.preTestScore}%`);
  if (payload.postTestScore != null) scoreParts.push(`Post-test ${payload.postTestScore}%`);
  if (!isBls) scoreParts.push(`EKG ${payload.ekgPassed ? 'ผ่าน' : '—'}`);

  const lines = [
    '🎓 มีนักเรียนได้รับใบรับรองใหม่',
    `คอร์ส: ${title}`,
    `ชื่อ: ${name}`,
  ];
  if (phone) lines.push(`เบอร์โทร: ${phone}`);
  if (scoreParts.length) lines.push(scoreParts.join(' · '));
  lines.push(`รหัสใบ: ${certId}`);
  lines.push(`วันที่: ${date}`);
  return lines.join('\n');
}

function formatThaiDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Push the cert alert to the configured admin target. Returns
// { ok, skipped?, error?, status? } and never throws, so callers stay
// best-effort — a failed alert must not break cert issuance.
export async function sendCertNotification(payload, deps = {}) {
  const fetchImpl = deps.fetch || globalThis.fetch;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const target = process.env.LINE_ADMIN_USER_ID || process.env.LINE_ADMIN_TARGET_ID;
  if (!token || !target) {
    return { ok: false, skipped: 'LINE not configured' };
  }

  const text = buildCertMessage(payload);

  try {
    const res = await fetchImpl(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: target,
        messages: [{ type: 'text', text }],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: detail.slice(0, 300) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}
