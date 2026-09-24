import { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { examKindOf, gradeExamAttempt } from '../../services/examGrade';

const REJECTED_TEXT = {
  not_found: 'ผลสอบนี้มาจากอีกเครื่องและยังไม่เคยถูกตรวจโดยระบบ — กรุณาสอบใหม่เพื่อยืนยันผล',
  incomplete: 'ระบบตรวจรับผลนี้ไม่ได้ (ข้อสอบในเครื่องไม่ครบชุด) — กรุณาสอบใหม่',
  unknown_set: 'ระบบตรวจรับผลนี้ไม่ได้ (ชุดข้อสอบถูกปรับปรุงแล้ว) — กรุณาสอบใหม่',
};

// Where a pre/post-test result stands with the server grader (see services/examGrade.js) —
// only a server-graded pass counts toward the certificate.
export default function ExamGradeStatus({ attempt, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!examKindOf(attempt?.lessonId)) return null;
  const g = attempt.serverGrade;

  if (g?.status === 'graded') {
    return (
      <div className="bg-success/8 border border-success/30 p-3 flex items-start gap-2 text-caption"
        style={{ borderRadius: 'var(--radius-md)' }} data-testid="exam-grade-graded">
        <ShieldCheck size={16} strokeWidth={2.2} className="text-success shrink-0 mt-0.5" />
        <span>
          ระบบตรวจยืนยันแล้ว: <b>{g.score}%</b> ({g.correctCount}/{g.total}) — {g.passed ? 'ผ่าน' : `ยังไม่ผ่าน (เกณฑ์ ${g.passPercent}%)`}
        </span>
      </div>
    );
  }

  if (g?.status === 'rejected') {
    return (
      <div className="bg-warning/10 border border-warning/30 p-3 flex items-start gap-2 text-caption"
        style={{ borderRadius: 'var(--radius-md)' }} data-testid="exam-grade-rejected">
        <AlertTriangle size={16} strokeWidth={2.2} className="text-warning shrink-0 mt-0.5" />
        <span>{REJECTED_TEXT[g.reason] || 'ระบบตรวจรับผลนี้ไม่ได้ — กรุณาสอบใหม่'}</span>
      </div>
    );
  }

  const gradeNow = async () => {
    setBusy(true);
    setFailed(false);
    const result = await gradeExamAttempt(attempt).catch(() => null);
    setBusy(false);
    if (result) onUpdated?.({ ...attempt, serverGrade: result });
    else setFailed(true);
  };

  return (
    <div className="bg-bg-tertiary border border-border p-3 space-y-2 text-caption"
      style={{ borderRadius: 'var(--radius-md)' }} data-testid="exam-grade-pending">
      <div className="flex items-start gap-2">
        <Clock size={16} strokeWidth={2.2} className="text-text-muted shrink-0 mt-0.5" />
        <span>
          รอระบบตรวจยืนยันผล — ตรวจให้อัตโนมัติเมื่อเครื่องออนไลน์ (ต้องยืนยันก่อนออกใบประกาศ)
          {failed && <span className="block text-warning mt-1">ยังเชื่อมต่อระบบไม่ได้ ลองใหม่เมื่อมีอินเทอร์เน็ต</span>}
        </span>
      </div>
      <button type="button" onClick={gradeNow} disabled={busy} className="btn btn-ghost btn-sm">
        <RefreshCw size={14} strokeWidth={2.2} className={busy ? 'animate-spin' : ''} /> ตรวจตอนนี้
      </button>
    </div>
  );
}
