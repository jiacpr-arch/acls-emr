import { IS_BLS } from '../config/courseMode';

// Best-effort: tell the backend a certificate was issued so it can push a LINE
// alert to the admin OA. Never throws — a failed alert must not break the
// student's "Generate Certificate" flow.
export async function notifyCertIssued({
  studentName, courseTitle, certId, completedAt,
  preTestScore, postTestScore, ekgPassed,
}) {
  try {
    await fetch('/api/cert/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        course: IS_BLS ? 'bls' : 'acls',
        courseTitle,
        certId,
        completedAt,
        preTestScore: preTestScore ?? null,
        postTestScore: postTestScore ?? null,
        ekgPassed: !!ekgPassed,
      }),
    });
  } catch {
    /* best-effort — ignore network errors */
  }
}
