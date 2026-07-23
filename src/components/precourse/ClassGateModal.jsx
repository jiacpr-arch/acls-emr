import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';
import { COURSE_MODE } from '../../config/courseMode';
import { OPEN_LEAGUE_CODE } from '../../config/openLeague';
import {
  rpcCreateClass, rpcVerifyClassCode, rpcVerifyInstructorCode,
} from '../../services/cohortSync';
import { scheduleFlush } from '../../services/syncEngine';
import { track } from '../../services/analytics';
import { BookOpen, KeyRound, AlertCircle, Check, Copy, Play, ChevronLeft, ShieldCheck } from 'lucide-react';

// Shown on /pre-course when no class is selected and the user hasn't opted into offline mode.
// Three modes:
//   home   — student-first landing: "start now" (solo) is the primary action,
//            joining a class is a secondary option, creating a class is a small
//            instructor-only link. This split fixes the old equal-weight 3-way
//            choice that made students tap the wrong thing.
//   join   — enter a class code (students with a code from their instructor).
//   create — make a new class (instructors only).
// initialMode lets instructor-facing pages open straight into 'create' or
// 'join', skipping the student-first home screen entirely.
// instructor=true switches join mode to instructor-code verification (the
// code that unlocks the cohort summary; legacy class codes still work).
// initialCode prefills the join input — used by /pre-course?join=CODE links.
// openLeague=true adds a "no code? join the online league" path in join mode:
// self-learners join the well-known open class (OPEN_LEAGUE_CODE) in one tap —
// same sync/leaderboard pipeline as a normal class, no instructor needed.
export default function ClassGateModal({
  open, onClose, initialMode = 'home', instructor = false, initialCode = '',
  openLeague = false,
}) {
  const setClass = useClassStore(s => s.setClass);
  const disableSync = useClassStore(s => s.disableSync);

  const [mode, setMode] = useState(initialMode);   // 'home' | 'join' | 'create'
  const [code, setCode] = useState(initialCode);
  const [className, setClassName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);    // { code, instructorCode }

  // Re-sync to initialMode each time the modal (re)opens, adjusting state
  // during render (https://react.dev/learn/you-might-not-need-an-effect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setMode(initialMode); setError(''); setCode(initialCode); }
  }

  if (!open) return null;

  // Opened directly into a sub-mode (instructor page): back = close, since
  // the student-first home screen would only confuse an instructor.
  const goHome = () => {
    if (initialMode !== 'home') { onClose?.(); return; }
    setMode('home'); setError('');
  };

  const submitJoin = async (e) => {
    e?.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 4) {
      setError('กรอกรหัสคลาส 6 หลัก');
      return;
    }
    setBusy(true); setError('');

    if (instructor) {
      // Instructor reconnect: verify the instructor code (legacy class codes
      // also pass). Returns the student join code so both get stored.
      const { data, error: rpcErr } = await rpcVerifyInstructorCode(normalized);
      if (rpcErr) {
        setBusy(false);
        const msg = rpcErr.message || '';
        if (msg.includes('invalid_code')) {
          // Common slip: typing the student join code of a new-style class.
          const { data: studentClass } = await rpcVerifyClassCode(normalized);
          if (studentClass) {
            setError('นี่คือรหัสสำหรับนักเรียนเข้าคลาส — การดูผลรวมต้องใช้ "รหัสอาจารย์" ที่ได้ตอนสร้างคลาส');
          } else {
            setError('ไม่พบคลาสนี้ ตรวจสอบรหัสอีกครั้ง');
          }
        } else {
          setError('เชื่อมต่อไม่สำเร็จ: ' + msg);
        }
        return;
      }
      setBusy(false);
      if (data.courseMode !== COURSE_MODE) {
        setError(`คลาสนี้เป็นของหลักสูตร ${data.courseMode.toUpperCase()} — เปิดผิดเว็บ`);
        return;
      }
      setClass({
        classId: data.classId,
        classCode: data.classCode,
        instructorCode: data.instructorCode,
        className: data.className,
        courseMode: data.courseMode,
      });
      track('instructor_class_connected');
      scheduleFlush();
      onClose?.();
      return;
    }

    const { data, error: rpcErr } = await rpcVerifyClassCode(normalized);
    setBusy(false);
    if (rpcErr) {
      const msg = rpcErr.message || '';
      if (msg.includes('invalid_code')) setError('ไม่พบคลาสนี้ ตรวจสอบรหัสอีกครั้ง');
      else setError('เชื่อมต่อไม่สำเร็จ: ' + msg);
      return;
    }
    if (data.courseMode !== COURSE_MODE) {
      setError(`คลาสนี้เป็นของหลักสูตร ${data.courseMode.toUpperCase()} — เปิดผิดเว็บ`);
      return;
    }
    setClass({
      classId: data.classId,
      classCode: normalized,
      className: data.className,
      courseMode: data.courseMode,
    });
    track('class_joined', {
      props: { via: initialCode && normalized === initialCode.toUpperCase() ? 'link' : 'manual' },
    });
    // Push any rows that were created while offline / before class was set
    scheduleFlush();
    onClose?.();
  };

  // เข้าลีกออนไลน์ (คลาสกลางของเว็บ) — ผ่าน verify เดิมเพื่อให้ได้ classId/ชื่อจริง
  // จาก server (และกันเคสคลาสถูกลบ/ผิดโหมด) แทนการ hardcode ฝั่ง client ทั้งก้อน
  const joinOpenLeague = async () => {
    if (busy) return;
    setBusy(true); setError('');
    const { data, error: rpcErr } = await rpcVerifyClassCode(OPEN_LEAGUE_CODE);
    setBusy(false);
    if (rpcErr) {
      setError('เชื่อมต่อไม่สำเร็จ: ' + (rpcErr.message || ''));
      return;
    }
    if (data.courseMode !== COURSE_MODE) {
      setError('ลีกออนไลน์ยังไม่พร้อมใช้งาน — ลองใหม่ภายหลัง');
      return;
    }
    setClass({
      classId: data.classId,
      classCode: OPEN_LEAGUE_CODE,
      className: data.className,
      courseMode: data.courseMode,
    });
    track('class_joined', { props: { via: 'open_league' } });
    scheduleFlush();
    onClose?.();
  };

  const submitCreate = async (e) => {
    e?.preventDefault();
    const n = className.trim();
    if (!n) { setError('ใส่ชื่อคลาส'); return; }
    setBusy(true); setError('');
    const { data, error: rpcErr } = await rpcCreateClass({
      name: n, courseMode: COURSE_MODE,
    });
    setBusy(false);
    if (rpcErr) { setError('สร้างไม่สำเร็จ: ' + (rpcErr.message || '')); return; }
    setClass({
      classId: data.classId,
      classCode: data.code,
      instructorCode: data.instructorCode,
      className: n,
      courseMode: COURSE_MODE,
    });
    track('class_created');
    scheduleFlush();
    setCreated({ code: data.code, instructorCode: data.instructorCode });
  };

  const useOffline = () => { disableSync(); onClose?.(); };

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
        <div className="w-full max-w-md bg-bg-secondary animate-slide-up p-5 space-y-4"
          style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 inline-flex items-center justify-center bg-success/15 text-success"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <Check size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-headline">สร้างคลาสสำเร็จ</div>
              <div className="text-2xs text-text-muted">ได้รหัส 2 ชุด — ใช้คนละหน้าที่</div>
            </div>
          </div>

          <div className="bg-bg-tertiary p-4 text-center"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="text-overline text-text-muted mb-1">รหัสเข้าคลาส (แจกนักเรียน)</div>
            <div className="text-3xl font-mono font-bold tracking-[0.3em] text-text-primary">
              {created.code}
            </div>
            <button onClick={() => navigator.clipboard?.writeText(created.code)}
              className="btn btn-ghost btn-sm mt-2">
              <Copy size={13} strokeWidth={2.2} /> คัดลอก
            </button>
          </div>

          <div className="bg-warning/8 border border-warning/30 p-4 text-center"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="text-overline text-warning mb-1 inline-flex items-center gap-1">
              <ShieldCheck size={12} strokeWidth={2.4} /> รหัสอาจารย์ (เก็บเป็นความลับ)
            </div>
            <div className="text-2xl font-mono font-bold tracking-[0.3em] text-text-primary">
              {created.instructorCode}
            </div>
            <button onClick={() => navigator.clipboard?.writeText(created.instructorCode)}
              className="btn btn-ghost btn-sm mt-2">
              <Copy size={13} strokeWidth={2.2} /> คัดลอก
            </button>
            <p className="text-2xs text-text-muted mt-1">
              ใช้ดูผลรวมทั้งคลาส และเชื่อมต่อคลาสนี้บนเครื่องอื่น —
              จดเก็บไว้ให้ดี อย่าแจกให้นักเรียน
            </p>
          </div>

          <button onClick={() => { setCreated(null); onClose?.(); }}
            className="btn btn-primary btn-block">
            เรียบร้อย
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md bg-bg-secondary animate-slide-up p-5 space-y-4"
        style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>

        {mode === 'home' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info"
                style={{ borderRadius: 'var(--radius-md)' }}>
                <BookOpen size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-headline">พร้อมเริ่มเรียนแล้ว</div>
                <div className="text-2xs text-text-muted">เริ่มทำข้อสอบได้เลย ไม่ต้องใช้รหัส</div>
              </div>
            </div>

            {/* Primary action — the path almost every student wants */}
            <div>
              <button onClick={useOffline}
                className="btn btn-primary btn-lg btn-block font-bold">
                <Play size={18} strokeWidth={2.4} /> เริ่มเรียนเลย
              </button>
              <p className="text-2xs text-text-muted text-center mt-1.5">
                เริ่มทำข้อสอบได้ทันที (ข้อมูลเก็บในเครื่องนี้)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-2xs text-text-muted">หรือ</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Secondary — only for students who got a code from their instructor */}
            <button onClick={() => { setMode('join'); setError(''); }}
              className="w-full text-caption font-bold px-3 py-2.5 border border-border bg-bg-tertiary text-text-secondary inline-flex items-center justify-center gap-1.5"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <KeyRound size={14} strokeWidth={2.4} />
              มีรหัสคลาสจากอาจารย์? เข้าคลาส
            </button>

            {/* Instructor-only, de-emphasized so students don't tap it by mistake */}
            <div className="border-t border-border pt-3 text-center">
              <button onClick={() => { setMode('create'); setError(''); }}
                className="text-2xs text-text-muted underline underline-offset-2">
                เป็นอาจารย์? สร้างคลาสใหม่
              </button>
            </div>
          </>
        )}

        {mode === 'join' && (
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={goHome}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 'var(--radius-full)' }} aria-label="ย้อนกลับ">
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <div>
                <div className="text-headline">{instructor ? 'เชื่อมต่อคลาส (อาจารย์)' : 'เข้าคลาส'}</div>
                <div className="text-2xs text-text-muted">
                  {instructor
                    ? 'ใช้รหัสอาจารย์ที่ได้ตอนสร้างคลาส (คลาสรุ่นเก่าใช้รหัสคลาสได้)'
                    : 'กรอกรหัสที่ได้จากอาจารย์'}
                </div>
              </div>
            </div>

            <form onSubmit={submitJoin} className="space-y-3">
              <label className="block">
                <span className="text-caption font-semibold text-text-secondary">
                  {instructor ? 'รหัสอาจารย์ (6 หลัก)' : 'รหัสคลาส (6 หลัก)'}
                </span>
                <input
                  type="text" autoFocus value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="เช่น K7M2QX" maxLength={6}
                  className="w-full text-2xl font-mono tracking-[0.3em] text-center mt-1" />
              </label>
              {error && (
                <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
                  style={{ borderRadius: 'var(--radius-md)' }}>
                  <AlertCircle size={14} strokeWidth={2.2} /> {error}
                </div>
              )}
              <button type="submit" disabled={busy}
                className="btn btn-primary btn-block disabled:opacity-50">
                {busy ? 'กำลังเชื่อมต่อ…' : 'เข้าคลาส'}
              </button>
            </form>

            {openLeague && !instructor && (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-2xs text-text-muted">ไม่มีรหัส?</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div>
                  <button type="button" onClick={joinOpenLeague} disabled={busy}
                    className="w-full text-caption font-bold px-3 py-2.5 border border-border bg-bg-tertiary text-text-secondary inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ borderRadius: 'var(--radius-md)' }}>
                    🌐 เข้าลีกออนไลน์ (บุคคลทั่วไป)
                  </button>
                  <p className="text-2xs text-text-muted text-center mt-1.5">
                    สำหรับผู้เรียนด้วยตนเอง — ระบบจะออก "รหัสผู้เล่น" ให้
                    ใช้บันทึกผล ขึ้นอันดับเหรียญ และเล่นต่อบนเครื่องอื่นได้
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {mode === 'create' && (
          <>
            <div className="flex items-center gap-2">
              <button type="button" onClick={goHome}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 'var(--radius-full)' }} aria-label="ย้อนกลับ">
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <div>
                <div className="text-headline">สร้างคลาสใหม่</div>
                <div className="text-2xs text-text-muted">สำหรับอาจารย์ — ได้รหัสไว้แจกนักเรียน</div>
              </div>
            </div>

            <form onSubmit={submitCreate} className="space-y-3">
              <label className="block">
                <span className="text-caption font-semibold text-text-secondary">ชื่อคลาส</span>
                <input
                  type="text" autoFocus value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="เช่น BLS รุ่นที่ 12 / 2025"
                  className="w-full text-body mt-1" />
              </label>
              {error && (
                <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
                  style={{ borderRadius: 'var(--radius-md)' }}>
                  <AlertCircle size={14} strokeWidth={2.2} /> {error}
                </div>
              )}
              <button type="submit" disabled={busy}
                className="btn btn-primary btn-block disabled:opacity-50">
                {busy ? 'กำลังสร้าง…' : 'สร้างคลาส'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
