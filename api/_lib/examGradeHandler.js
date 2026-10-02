import { getSupabaseAdmin } from './supabaseAdmin.js';
import { enforceRateLimit } from './rateLimit.js';
import { passportConfig, readPassport, readPassportToken, sameOrigin } from './passportSession.js';
import { forwardGradesToHub } from './hubResults.js';
import { gradeAnswers, loadExamKey } from './examGrader.js';
import { EXAM_COURSES } from './examKeys.js';

// POST /api/exam/grade — the only place a pre/post-test result becomes trustworthy.
//   { attemptUuid }                      → the grade already stored for that attempt (or 404)
//   { attemptUuid, course, kind, setId, answers, studentLocalId, classCode?, studentPk?,
//     startedAt?, finishedAt?, source?, hubSub? }  → grade it (once) and store it
// The client-side score is never read. A uuid that was already graded returns the stored row
// unchanged, so retries, the sync queue and a second device all agree. A new grade made with the
// learner's own passport also goes to the Hub's central exam record (api/_lib/hubResults.js).
const HUB_FORWARD_TIMEOUT_MS = 2500; // the app waits ≤6s for this response; the Hub is a bonus here

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CLASS_CODE_RE = /^[A-Z0-9-]{3,40}$/;

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

function isoOrNull(v) {
  if (typeof v !== 'string' || v.length > 40) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function publicGrade(row) {
  return {
    attemptUuid: row.attempt_uuid,
    lessonId: row.lesson_id,
    setId: row.set_id,
    score: Number(row.score),
    correctCount: row.correct_count,
    total: row.total_questions,
    passPercent: Number(row.pass_percent),
    passed: row.passed,
    gradedAt: row.graded_at,
  };
}

const GRADE_COLUMNS = 'attempt_uuid, lesson_id, set_id, score, correct_count, total_questions, pass_percent, passed, graded_at';

export function createExamGradeHandler({
  getAdmin = getSupabaseAdmin, config = () => passportConfig(), fetcher = fetch, now = () => Date.now(),
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });
    if (!enforceRateLimit(req, res, { key: 'exam-grade', limit: 120, windowMs: 60_000 })) return;
    res.setHeader('Cache-Control', 'no-store');

    const body = parseBody(req);
    const attemptUuid = String(body.attemptUuid || '').trim();
    if (!UUID_RE.test(attemptUuid)) return res.status(400).json({ ok: false, reason: 'bad_request' });

    let admin;
    try { admin = getAdmin(); } catch (err) {
      console.error('exam grade:', err.message);
      return res.status(503).json({ ok: false, reason: 'unavailable' });
    }

    const stored = async () => {
      const { data, error } = await admin.from('exam_grades').select(GRADE_COLUMNS).eq('attempt_uuid', attemptUuid).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    };

    try {
      const existing = await stored();
      if (existing) return res.status(200).json({ ok: true, grade: publicGrade(existing) });
      if (body.answers === undefined) return res.status(404).json({ ok: false, reason: 'not_found' });

      const course = String(body.course || '');
      const kind = String(body.kind || '');
      if (!EXAM_COURSES.includes(course) || !['pre', 'post'].includes(kind)) {
        return res.status(400).json({ ok: false, reason: 'bad_request' });
      }
      const loaded = await loadExamKey({ course, kind, setId: body.setId }, { getAdmin: () => admin });
      if (!loaded) return res.status(422).json({ ok: false, reason: 'unknown_set' });
      const answers = Array.isArray(body.answers)
        ? body.answers.map((a) => ({ questionId: a?.questionId, chosenId: a?.chosenId ?? null }))
        : null;
      const result = gradeAnswers(loaded.key, answers);
      if (!result.ok) return res.status(422).json({ ok: false, reason: result.reason });

      // Optional links — never a reason to refuse grading.
      let classId = null;
      let studentPk = null;
      const classCode = String(body.classCode || '').trim().toUpperCase();
      const pk = String(body.studentPk || '').trim();
      if (CLASS_CODE_RE.test(classCode) && UUID_RE.test(pk)) {
        const { data: cls } = await admin.from('cohort_classes').select('id').eq('code', classCode).is('archived_at', null).maybeSingle();
        if (cls) {
          const { data: st } = await admin.from('cohort_students').select('id').eq('id', pk).eq('class_id', cls.id).maybeSingle();
          if (st) { classId = cls.id; studentPk = st.id; }
        }
      }
      let hubUserId = null;
      if (typeof body.hubSub === 'string' && body.hubSub) {
        const claims = await readPassport(req, config(), { fetcher, now: now() });
        if (claims && claims.sub === body.hubSub) hubUserId = claims.sub;
      }

      const row = {
        attempt_uuid: attemptUuid,
        course_mode: course,
        exam_kind: kind,
        lesson_id: loaded.lessonId,
        bank_id: loaded.bankId,
        set_id: body.setId,
        student_local_id: typeof body.studentLocalId === 'string' ? body.studentLocalId.slice(0, 64) : null,
        class_id: classId,
        student_pk: studentPk,
        hub_user_id: hubUserId,
        score: result.score,
        correct_count: result.correctCount,
        total_questions: result.total,
        pass_percent: result.passPercent,
        passed: result.passed,
        answers: result.detailed,
        started_at: isoOrNull(body.startedAt),
        finished_at: isoOrNull(body.finishedAt),
        source: body.source === 'sync' ? 'sync' : 'online',
      };
      const { error: insErr } = await admin.from('exam_grades').upsert(row, { onConflict: 'attempt_uuid', ignoreDuplicates: true });
      if (insErr) throw new Error(insErr.message);
      // Re-read: a concurrent retry of the same uuid may have won — its row is the answer.
      const saved = await stored();
      if (hubUserId) {
        await forwardGradesToHub(config(), readPassportToken(req), [{
          ...row, correct_count: saved?.correct_count ?? row.correct_count, total_questions: saved?.total_questions ?? row.total_questions,
        }], { fetcher, timeoutMs: HUB_FORWARD_TIMEOUT_MS });
      }
      return res.status(200).json({ ok: true, grade: publicGrade(saved || { ...row, graded_at: new Date(now()).toISOString() }) });
    } catch (err) {
      console.error('exam grade failed:', err.message);
      return res.status(500).json({ ok: false, reason: 'db' });
    }
  };
}
