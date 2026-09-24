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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A certificate is exam-verified when the uuids the browser names are server-graded passes
// (exam_grades, written only by api/exam/grade.js) of this course: one pre-test and one post-test.
// Then the certificate row gets the server's scores instead of the client's.
export async function verifyExamGrades(supabase, course, uuids) {
  const ids = Array.isArray(uuids) ? [...new Set(uuids.filter((u) => typeof u === 'string' && UUID_RE.test(u)))].slice(0, 4) : [];
  if (!ids.length) return { verified: false };
  const { data, error } = await supabase
    .from('exam_grades')
    .select('attempt_uuid, course_mode, exam_kind, score, passed')
    .in('attempt_uuid', ids);
  if (error || !Array.isArray(data)) return { verified: false };
  const ok = data.filter((r) => r.passed && r.course_mode === course);
  const pre = ok.find((r) => r.exam_kind === 'pre');
  const post = ok.find((r) => r.exam_kind === 'post');
  if (!pre || !post) return { verified: false };
  return { verified: true, preScore: Number(pre.score), postScore: Number(post.score), uuids: [pre.attempt_uuid, post.attempt_uuid] };
}

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
  let preTestScore = numOrNull(body.preTestScore);
  let postTestScore = numOrNull(body.postTestScore);
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
  let examVerified = false;
  try {
    const supabase = getSupabaseAdmin();
    const exams = await verifyExamGrades(supabase, course, body.examGradeUuids);
    if (exams.verified) {
      examVerified = true;
      preTestScore = exams.preScore;
      postTestScore = exams.postScore;
    }
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
    // exam_verified / exam_grade_uuids / hub_user_id arrive with supabase-cleanup/exam-grades.sql
    // and hub-passport.sql — only sent when set, and dropped on a missing-column error below.
    const extra = {
      ...(hubUserId ? { hub_user_id: hubUserId } : {}),
      ...(examVerified ? { exam_verified: true, exam_grade_uuids: exams.uuids } : {}),
    };
    const insert = (r) => supabase.from('certificates').upsert(r, { onConflict: 'cert_id', ignoreDuplicates: true });
    let { error } = await insert({ ...row, ...extra });
    if (error && Object.keys(extra).length && (error.code === '42703' || error.code === 'PGRST204')) {
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
  return res.status(200).json({ ...result, recorded, verified: !!hubUserId, examVerified });
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
