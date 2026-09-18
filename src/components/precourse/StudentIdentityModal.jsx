import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { upsertStudent, findStudentByStudentId, hydrateStudentProgress } from '../../db/database';
import { usePreCourseStore } from '../../stores/preCourseStore';
import { useClassStore } from '../../stores/classStore';
import { isOpenLeague, genPlayerCode } from '../../config/openLeague';
import { scheduleFlush } from '../../services/syncEngine';
import { rpcGetStudentProgress } from '../../services/cohortSync';
import { restoreCodeBlueProgress } from '../../game/progressSync';
import { track, identifyStudent } from '../../services/analytics';
import { User, X, Check, AlertCircle } from 'lucide-react';

export default function StudentIdentityModal({ open, onClose, onConfirm }) {
  const setActiveStudent = usePreCourseStore(s => s.setActiveStudent);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  // In a class the server roster keys on student id, so it stays required.
  // Standalone (offline) use never syncs, so the id is optional there.
  // Open league (self-learners): the "id" is an auto-generated player code —
  // never typed by hand, only re-entered when continuing on another device.
  const classCode = useClassStore(s => s.classCode);
  const openLeague = isOpenLeague(classCode);
  const requireStudentId = !!classCode && !openLeague;
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // เปิด modal ครั้งใหม่: เติมค่าจากคนที่ลงทะเบียนไว้แล้ว (ปุ่ม "เปลี่ยน") —
  // ไม่งั้นฟอร์มว่างแล้วผู้ใช้กดยืนยันจะกลายเป็นสร้างคนใหม่ซ้อนคนเดิม
  // (adjust-state-during-render ตามแพทเทิร์นเดียวกับ ClassGateModal)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(activeStudent?.name || '');
      setStudentId(activeStudent?.studentId || '');
      setPhone(activeStudent?.phone || '');
      setError('');
    }
  }

  if (!open) return null;

  const submit = async (e) => {
    e?.preventDefault();
    const n = name.trim();
    // ลีกออนไลน์: ใช้รหัสผู้เล่นเดิมที่กรอกมา (เล่นต่อจากเครื่องอื่น)
    // หรือสุ่มรหัสใหม่ให้เลย — ไม่มีการกรอกรหัสนักเรียนเอง
    const enteredSid = studentId.trim().toUpperCase();
    const sid = openLeague ? (enteredSid || genPlayerCode()) : studentId.trim();
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
    // A common mix-up: typing the class join code (the one handed out to
    // everyone) into the student-id field instead of one's own student id.
    // The server also rejects this (join_class), but catching it here gives
    // an immediate, specific message instead of a silent background sync failure.
    if (sid && classCode && sid.toUpperCase() === classCode.toUpperCase()) {
      setError('รหัสนี้เป็นรหัสเข้าคลาส ไม่ใช่รหัสนักเรียน — กรุณากรอกรหัสนักเรียนของคุณเอง');
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

      // Always check the cloud, not just when this device has no local record.
      // The old `!existing` gate meant a device that had registered once could
      // never see work done elsewhere: study on the phone, open the iPad, and
      // the iPad kept showing its own stale progress forever. hydrateStudentProgress
      // merges (dupes skipped on [studentId+lessonId] / attempt uuid), so pulling
      // on top of an existing local record is safe — nothing local is overwritten.
      if (sid && classCode) {
        const { data } = await rpcGetStudentProgress({ code: classCode, studentId: sid });
        if (data?.student) {
          // Keep the local row's id when there is one — local lessonProgress /
          // quizAttempts rows point at it, and flushStudents() already remaps
          // to the server pk on the next sync.
          existing = existing || {
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
      // นับเฉพาะแถวที่ "เพิ่มเข้ามาจริง" — เดิม !!restored หมายถึงเครื่องนี้ไม่มี
      // record มาก่อน แต่ตอนนี้ดึงทุกครั้งแล้ว ต้องแยกว่าได้ของใหม่มาหรือเปล่า
      const restoredCount = restored ? await hydrateStudentProgress(record.id, restored) : 0;
      // กู้ความคืบหน้าเกม Code Blue ด้วย (เคสที่ผ่าน/เกรด/hi-score) — best-effort:
      // นักเรียนใหม่ที่ยัง sync ไม่เสร็จ server ตอบ unknown_student ก็แค่ข้าม
      if (classCode) {
        try { await restoreCodeBlueProgress(record.id); } catch { /* ไม่กระทบการลงทะเบียน */ }
      }
      setActiveStudent(record);
      scheduleFlush();
      // ใช้ UUID เป็น distinct id — ไม่ส่งชื่อ/เบอร์โทร (PDPA)
      track('student_registered', {
        meta: 'CompleteRegistration',
        props: { has_student_code: !!sid, is_returning: !!existing, restored: restoredCount > 0 },
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
              <div className="text-headline">{openLeague ? 'ระบุตัวผู้เล่น' : 'ระบุตัวผู้เรียน'}</div>
              <div className="text-2xs text-text-muted">
                {openLeague
                  ? 'ระบบจะออก "รหัสผู้เล่น" ให้ — ใช้บันทึกผลและเล่นต่อบนเครื่องอื่น'
                  : 'ใช้สำหรับบันทึกผลก่อนเริ่ม Quiz'}
              </div>
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
          {openLeague && (
            <label className="block">
              <span className="text-caption font-semibold text-text-secondary">
                รหัสผู้เล่นเดิม
                <span className="font-normal text-text-muted"> (เฉพาะคนที่เคยเล่นแล้วย้ายเครื่องมา — ไม่มีให้เว้นว่าง)</span>
              </span>
              <input
                type="text" value={studentId}
                onChange={e => setStudentId(e.target.value.toUpperCase())}
                placeholder="เช่น P-7K2M9QXW"
                className="w-full text-body font-mono mt-1" />
            </label>
          )}
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">
              เบอร์โทร
              <span className="font-normal text-text-muted">
                {openLeague
                  ? ' (ไว้ให้ทีมงานติดต่อตอนได้รางวัล — ไม่กรอกถือว่าสละสิทธิ์รับรางวัล)'
                  : ' (ถ้ามี — ไว้ส่งผล/ใบประกาศ)'}
              </span>
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
