import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';
import { COURSE_MODE } from '../../config/courseMode';
import { rpcCreateClass, rpcVerifyClassCode } from '../../services/cohortSync';
import { scheduleFlush } from '../../services/syncEngine';
import { BookOpen, KeyRound, AlertCircle, Check, Copy, Play, ChevronLeft } from 'lucide-react';

// Shown on /pre-course when no class is selected and the user hasn't opted into offline mode.
// Three modes:
//   home   — student-first landing: "start now" (solo) is the primary action,
//            joining a class is a secondary option, creating a class is a small
//            instructor-only link. This split fixes the old equal-weight 3-way
//            choice that made students tap the wrong thing.
//   join   — enter a class code (students with a code from their instructor).
//   create — make a new class (instructors only).
export default function ClassGateModal({ open, onClose }) {
  const setClass = useClassStore(s => s.setClass);
  const disableSync = useClassStore(s => s.disableSync);

  const [mode, setMode] = useState('home');   // 'home' | 'join' | 'create'
  const [code, setCode] = useState('');
  const [className, setClassName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  if (!open) return null;

  const goHome = () => { setMode('home'); setError(''); };

  const submitJoin = async (e) => {
    e?.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 4) {
      setError('กรอกรหัสคลาส 6 หลัก');
      return;
    }
    setBusy(true); setError('');
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
    // Push any rows that were created while offline / before class was set
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
      className: n,
      courseMode: COURSE_MODE,
    });
    scheduleFlush();
    setCreatedCode(data.code);
  };

  const useOffline = () => { disableSync(); onClose?.(); };

  const copyCode = () => {
    if (createdCode) navigator.clipboard?.writeText(createdCode);
  };

  if (createdCode) {
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
              <div className="text-[11px] text-text-muted">แจกรหัสนี้ให้นักเรียนใช้เข้าคลาส</div>
            </div>
          </div>
          <div className="bg-bg-tertiary p-4 text-center"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="text-overline text-text-muted mb-1">รหัสคลาส</div>
            <div className="text-3xl font-mono font-bold tracking-[0.3em] text-text-primary">
              {createdCode}
            </div>
            <button onClick={copyCode}
              className="btn btn-ghost btn-sm mt-2">
              <Copy size={13} strokeWidth={2.2} /> คัดลอก
            </button>
          </div>
          <button onClick={() => { setCreatedCode(null); onClose?.(); }}
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
                <div className="text-[11px] text-text-muted">เริ่มทำข้อสอบได้เลย ไม่ต้องใช้รหัส</div>
              </div>
            </div>

            {/* Primary action — the path almost every student wants */}
            <div>
              <button onClick={useOffline}
                className="btn btn-primary btn-lg btn-block font-bold">
                <Play size={18} strokeWidth={2.4} /> เริ่มเรียนเลย
              </button>
              <p className="text-[11px] text-text-muted text-center mt-1.5">
                เริ่มทำข้อสอบได้ทันที (ข้อมูลเก็บในเครื่องนี้)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-text-muted">หรือ</span>
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
                className="text-[11px] text-text-muted underline underline-offset-2">
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
                <div className="text-headline">เข้าคลาส</div>
                <div className="text-[11px] text-text-muted">กรอกรหัสที่ได้จากอาจารย์</div>
              </div>
            </div>

            <form onSubmit={submitJoin} className="space-y-3">
              <label className="block">
                <span className="text-caption font-semibold text-text-secondary">รหัสคลาส (6 หลัก)</span>
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
                <div className="text-[11px] text-text-muted">สำหรับอาจารย์ — ได้รหัสไว้แจกนักเรียน</div>
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
