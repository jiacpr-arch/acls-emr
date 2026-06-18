import { sendCertNotification } from '../_lib/lineNotify.js';

export const config = { maxDuration: 10 };

const MAX_NAME_LEN = 80;

// Public endpoint: the student's browser calls this right after generating a
// certificate so the admin LINE OA gets an alert. The cert itself is created
// client-side, so this is purely a notification side-channel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  const studentName = String(body.studentName || '').trim().slice(0, MAX_NAME_LEN);
  const certId = String(body.certId || '').trim().slice(0, 60);
  const course = body.course === 'bls' ? 'bls' : 'acls';

  if (!studentName || !certId) {
    return res.status(400).json({ error: 'missing studentName or certId' });
  }

  const result = await sendCertNotification({
    studentName,
    certId,
    course,
    courseTitle: String(body.courseTitle || '').trim().slice(0, 120) || null,
    completedAt: body.completedAt || null,
    preTestScore: numOrNull(body.preTestScore),
    postTestScore: numOrNull(body.postTestScore),
    ekgPassed: !!body.ekgPassed,
  });

  // Best-effort: even if LINE isn't configured or the push fails, the cert was
  // still issued client-side — don't surface a hard error to the student.
  return res.status(200).json(result);
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
