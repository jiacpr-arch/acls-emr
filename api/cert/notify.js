import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { sendCertNotification } from '../_lib/lineNotify.js';
import { enforceRateLimit } from '../_lib/rateLimit.js';
import { passportConfig, readPassport } from '../_lib/passportSession.js';

export const config = { maxDuration: 10 };

const MAX_NAME_LEN = 80;
const COURSE_MODES = ['acls', 'bls', 'airway', 'defib', 'iv'];
// Client generates cert ids as `${certConfig.certIdPrefix}-${Date.now().toString(36).toUpperCase()}`
// (src/pages/Certification.jsx, prefixes from src/config/courseMode.js +
// src/courses/*/cert.js) — reject anything else so this public endpoint
// can't be used to stuff arbitrary ids into the certificates table.
const CERT_ID_RE = /^JIA-(ACLS|BLS|AW|DF|IV)-[0-9A-Z]{6,16}$/;

// Public endpoint: the student's browser calls this right after generating a
// certificate so the admin LINE OA gets an alert. The cert itself is created
// client-side, so this is purely a notification side-channel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!enforceRateLimit(req, res, { key: 'cert-notify', limit: 5, windowMs: 60_000 })) return;

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});

  // Optional JIA account (Hub passport cookie, see api/_lib/passportSession.js): tie the record to
  // the real person and use the Hub's name — but only when the browser says this cert belongs to
  // that same account (hubSub), so a passport left logged in on a shared device never lands on
  // someone else's certificate. Never required: old cached bundles send no hubSub and work as before.
  const claims = typeof body.hubSub === 'string' && body.hubSub
    ? await readPassport(req, passportConfig())
    : null;
  const hubUserId = claims && claims.sub === body.hubSub ? claims.sub : null;
  const verifiedName = hubUserId ? String(claims.name_th || '').trim().slice(0, MAX_NAME_LEN) : '';

  const studentName = verifiedName || String(body.studentName || '').trim().slice(0, MAX_NAME_LEN);
  const studentPhone = String(body.studentPhone || '').trim().slice(0, 20);
  const studentEmail = String(body.studentEmail || '').trim().slice(0, 120);
  const certId = String(body.certId || '').trim().slice(0, 60);
  const course = COURSE_MODES.includes(body.course) ? body.course : 'acls';
  const preTestScore = numOrNull(body.preTestScore);
  const postTestScore = numOrNull(body.postTestScore);
  const ekgPassed = !!body.ekgPassed;

  if (!studentName || !certId) {
    return res.status(400).json({ error: 'missing studentName or certId' });
  }
  if (!CERT_ID_RE.test(certId)) {
    return res.status(400).json({ error: 'invalid certId' });
  }

  // Best-effort: persist the issuance so the admin stats page can count it.
  // Wrapped so a missing Supabase config or an insert error never blocks the
  // LINE alert or the student's response. ignoreDuplicates makes this
  // insert-only: retries stay idempotent, but an existing record can never be
  // overwritten by a later (possibly forged) request with the same cert_id.
  let recorded = false;
  try {
    const supabase = getSupabaseAdmin();
    const row = {
      cert_id: certId,
      student_name: studentName,
      student_phone: studentPhone || null,
      student_email: studentEmail || null,
      course_mode: course,
      pre_test_score: preTestScore,
      post_test_score: postTestScore,
      ekg_passed: ekgPassed,
    };
    const insert = (r) => supabase.from('certificates').upsert(r, { onConflict: 'cert_id', ignoreDuplicates: true });
    let { error } = await insert(hubUserId ? { ...row, hub_user_id: hubUserId } : row);
    // hub_user_id arrives with supabase-cleanup/hub-passport.sql — until that is applied, still
    // record the certificate itself rather than dropping it.
    if (error && hubUserId && (error.code === '42703' || error.code === 'PGRST204')) {
      ({ error } = await insert(row));
    }
    recorded = !error;
  } catch { /* Supabase not configured — skip silently */ }

  const result = await sendCertNotification({
    studentName,
    studentPhone,
    certId,
    course,
    courseTitle: String(body.courseTitle || '').trim().slice(0, 120) || null,
    completedAt: body.completedAt || null,
    preTestScore,
    postTestScore,
    ekgPassed,
  });

  // Best-effort: even if LINE/Supabase isn't configured or fails, the cert was
  // still issued client-side — don't surface a hard error to the student.
  return res.status(200).json({ ...result, recorded, verified: !!hubUserId });
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
