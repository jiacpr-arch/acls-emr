import { COURSE_MODE } from '../config/courseMode';

// Best-effort: tell the backend a certificate was issued so it can push a LINE
// alert to the admin OA. Never throws — a failed alert must not break the
// student's "Generate Certificate" flow.
export async function notifyCertIssued({
  studentName, studentPhone, studentEmail, courseTitle, certId, completedAt,
  preTestScore, postTestScore, ekgPassed, hubSub, examGradeUuids,
}) {
  try {
    await fetch('/api/cert/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        studentPhone: studentPhone || null,
        studentEmail: studentEmail || null,
        course: COURSE_MODE,
        courseTitle,
        certId,
        completedAt,
        preTestScore: preTestScore ?? null,
        postTestScore: postTestScore ?? null,
        ekgPassed: !!ekgPassed,
        // The JIA account this student confirmed; the server only trusts it when the passport
        // cookie sent with this request is that same account.
        hubSub: hubSub || null,
        // Server-graded pre/post passes behind this certificate (api/exam/grade.js) — the server
        // re-checks them and records exam_verified + its own scores.
        examGradeUuids: Array.isArray(examGradeUuids) ? examGradeUuids : [],
      }),
    });
  } catch {
    /* best-effort — ignore network errors */
  }
}
