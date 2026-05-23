/**
 * Public-facing service: student submits a question and waits for the AI
 * pipeline to finish (~10-30s). The /api/student-question/submit endpoint
 * runs synchronously and returns the final status.
 */
export async function submitStudentQuestion({ question, studentName, studentContact }) {
  const res = await fetch('/api/student-question/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: String(question || '').trim(),
      studentName: String(studentName || '').trim() || null,
      studentContact: String(studentContact || '').trim() || null,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 202) {
    throw new Error(data?.error || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return data;
}
