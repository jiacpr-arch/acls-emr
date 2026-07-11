import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { upsertStudent, findStudentByStudentId, hydrateStudentProgress } from '../../db/database';
import { usePreCourseStore } from '../../stores/preCourseStore';
import { useClassStore } from '../../stores/classStore';
import { scheduleFlush } from '../../services/syncEngine';
import { rpcGetStudentProgress } from '../../services/cohortSync';
import { track, identifyStudent } from '../../services/analytics';
import { User, X, Check, AlertCircle } from 'lucide-react';

export default function StudentIdentityModal({ open, onClose, onConfirm }) {
  const setActiveStudent = usePreCourseStore(s => s.setActiveStudent);
  // In a class the server roster keys on student id, so it stays required.
  // Standalone (offline) use never syncs, so the id is optional there.
  const classCode = useClassStore(s => s.classCode);
  const requireStudentId = !!classCode;
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e?.preventDefault();
    const n = name.trim();
    const sid = studentId.trim();
    const tel = phone.trim();
    // Phone is optional now — requiring it before the quiz was the biggest
    // drop-off in the funnel. We still keep it (for follow-up) when given, and
    // only validate the format if the student actually typed something.
    if (!n || (requireStudentId && !sid)) {
      setError(requireStudentId
        ? 'กรุณากรอกชื่อ และรหัสนักเรียน'
        : 'กรุณากรอกชื่อ');
      return;
    }
    if (tel && tel.replace(/\D/g, '').length < 9) {
      setError('เบอร์โทรไม่ถูกต้อง');
      return;
    }
    setBusy(true);
    try {
      let existing = sid ? await findStudentByStudentId(sid) : null;
      let restored = null;

      // No local record on this device — check the cloud in case this
      // student already has progress under this class (different browser,
      // cleared storage, new phone, LINE in-app browser vs. Safari, etc).
      // Restores it into local IndexedDB instead of silently starting over.
      if (!existing && sid && classCode) {
        const { data } = await rpcGetStudentProgress({ code: classCode, studentId: sid });
        if (data?.student) {
          existing = {
            id: data.student.id,
            studentId: data.student.studentId,
            name: data.student.name,
            phone: data.student.phone,
            email: null,
            createdAt: data.student.createdAt,
            syncedAt: new Date().toISOString(),
          };
          restored = { lessonProgress: data.lessonProgress, quizAttempts: data.quizAttempts };
        }
      }

      // Email is no longer collected here — it's gathered later at the
      // certificate step. Preserve any value a returning student already had.
      const unchanged = existing && existing.name === n && existing.phone === (tel || null);
      const record = existing
        ? { ...existing, name: n, phone: tel || null, syncedAt: unchanged ? existing.syncedAt : null }
        : { id: uuidv4(), studentId: sid || null, name: n, phone: tel || null, email: null, createdAt: new Date().toISOString() };
      await upsertStudent(record);
      if (restored) await hydrateStudentProgress(record.id, restored);
      setActiveStudent(record);
      scheduleFlush();
      // ใช้ UUID เป็น distinct id — ไม่ส่งชื่อ/เบอร์โทร (PDPA)
      track('student_registered', {
        meta: 'CompleteRegistration',
        props: { has_student_code: !!sid, is_returning: !!existing, restored: !!restored },
      });
      identifyStudent(record.id, { student_code: sid || null });
      onConfirm?.(record);
    } catch (err) {
      setError(err?.message || 'บันทึกไม่สำเร็จ');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit}
        className="w-full max-w-md bg-bg-secondary animate-slide-up p-5 space-y-4"
        style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <User size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-headline">ระบุตัวผู้เรียน</div>
              <div className="text-2xs text-text-muted">ใช้สำหรับบันทึกผลก่อนเริ่ม Quiz</div>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
              style={{ borderRadius: 'var(--radius-full)' }} aria-label="Close">
              <X size={18} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">ชื่อ–นามสกุล</span>
            <input
              type="text" autoFocus value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น อนันต์ ใจดี"
              className="w-full text-body mt-1" />
          </label>
          {requireStudentId && (
            <label className="block">
              <span className="text-caption font-semibold text-text-secondary">
                รหัสนักเรียน
              </span>
              <input
                type="text" value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="เช่น 65001"
                className="w-full text-body mt-1" />
            </label>
          )}
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">
              เบอร์โทร
              <span className="font-normal text-text-muted"> (ถ้ามี — ไว้ส่งผล/ใบประกาศ)</span>
            </span>
            <input
              type="tel" inputMode="tel" autoComplete="tel" value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="w-full text-body tabular mt-1" />
          </label>
          {error && (
            <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={14} strokeWidth={2.2} /> {error}
            </div>
          )}
        </div>

        <button type="submit" disabled={busy}
          className="btn btn-primary btn-lg btn-block disabled:opacity-50">
          <Check size={16} strokeWidth={2.4} /> ยืนยันและเริ่ม
        </button>
        <p className="text-2xs text-text-muted text-center">
          ระบบจะบันทึกชื่อ–เบอร์ไว้ในเครื่องนี้ (offline)
        </p>
      </form>
    </div>
  );
}
