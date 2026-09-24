// Sends server-graded pre/post-test results (exam_grades rows) to the Hub's central exam record:
// the results-ingest Edge Function on the Hub's project, which checks this learner's passport and
// this deployment's client secret, then learning_hub.exam_results in jia-learning-hub
// (20261016100000_exam_results.sql). The Hub recomputes score/pass from correct/total against its
// own course pass mark and keys the row on (this client, attempt uuid), so re-sending is harmless.
//
// Only with the learner's own passport (it proves who the result belongs to), and never a reason
// to fail grading or a certificate: every failure is logged and counted, nothing is thrown.

// Hub course ids are the course modes, except ACLS, which is `als` at the Hub.
export const HUB_COURSE_FOR = Object.freeze({ acls: 'als', bls: 'bls', airway: 'airway', defib: 'defib', iv: 'iv' });

export function hubResultFromGrade(g) {
  const courseId = HUB_COURSE_FOR[g?.course_mode];
  if (!courseId || (g.exam_kind !== 'pre' && g.exam_kind !== 'post') || typeof g.attempt_uuid !== 'string') return null;
  const correct = Number(g.correct_count);
  const total = Number(g.total_questions);
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || correct < 0 || correct > total) return null;
  return { courseId, kind: g.exam_kind, correct, total, attemptRef: g.attempt_uuid, finishedAt: g.finished_at || null };
}

export async function forwardGradesToHub(cfg, passport, grades, { fetcher = fetch, timeoutMs = 3000 } = {}) {
  const out = { sent: 0, failed: 0, skipped: 0 };
  const list = Array.isArray(grades) ? grades : [];
  if (!cfg?.configured || !cfg.resultsUrl || !passport) { out.skipped = list.length; return out; }
  for (const g of list) {
    const result = hubResultFromGrade(g);
    if (!result) { out.skipped += 1; continue; }
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cfg.hubAnonKey) headers.apikey = cfg.hubAnonKey;
      const res = await fetcher(cfg.resultsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ clientId: cfg.clientId, clientSecret: cfg.clientSecret, passport, result }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`${res.status} ${body?.error || ''}`.trim());
      }
      out.sent += 1;
    } catch (err) {
      out.failed += 1;
      console.warn('hub exam result not recorded (non-fatal):', err?.message || err);
    }
  }
  return out;
}
