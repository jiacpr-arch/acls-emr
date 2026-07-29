// Student check-in QR payload — compact versioned string with NO PII:
//   MRQR1|<class_id uuid>|<student_pk uuid>
// The student's name/id come back from the checkin_student RPC, so the QR
// itself never leaks personal data if photographed/shared. The embedded
// classId lets the scanner reject a student from another class instantly on
// the client (the server independently re-validates). Strict shape/uuid
// validation means foreign QRs — including our own class-join URL QR — are
// rejected cleanly instead of producing a garbage RPC call.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const STUDENT_QR_PREFIX = 'MRQR1';

export function buildStudentQrPayload({ classId, studentPk }) {
  return `${STUDENT_QR_PREFIX}|${classId}|${studentPk}`;
}

export function parseStudentQrPayload(text) {
  if (typeof text !== 'string') return null;
  const parts = text.trim().split('|');
  if (parts.length !== 3 || parts[0] !== STUDENT_QR_PREFIX) return null;
  const [, classId, studentPk] = parts;
  if (!UUID_RE.test(classId) || !UUID_RE.test(studentPk)) return null;
  return { classId: classId.toLowerCase(), studentPk: studentPk.toLowerCase() };
}
