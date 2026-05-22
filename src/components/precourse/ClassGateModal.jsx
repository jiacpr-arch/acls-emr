import { useState } from 'react';
import { useClassStore } from '../../stores/classStore';
import { COURSE_MODE } from '../../config/courseMode';
import { rpcCreateClass, rpcVerifyClassCode } from '../../services/cohortSync';
import { Cloud, CloudOff, KeyRound, Plus, AlertCircle, Check, Copy } from 'lucide-react';

// Shown on /pre-course when no class is selected and the user hasn't opted into offline mode.
// Two flows: Join existing class (by code) or Create new class (instructor) — both write
// classStore so subsequent writes get synced.
export default function ClassGateModal({ open, onClose }) {
  const setClass = useClassStore(s => s.setClass);
  const disableSync = useClassStore(s => s.disableSync);

  const [tab, setTab] = useState('join');     // 'join' | 'create'
  const [code, setCode] = useState('');
  const [className, setClassName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  if (!open) return null;

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
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Cloud size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-headline">เชื่อมต่อคลาส</div>
            <div className="text-[11px] text-text-muted">เพื่อให้อาจารย์ดูคะแนนได้จากทุกเครื่อง</div>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button onClick={() => { setTab('join'); setError(''); }}
            className={`flex-1 text-caption font-bold px-3 py-2 border ${
              tab === 'join'
                ? 'border-info bg-info text-white'
                : 'border-border bg-bg-tertiary text-text-secondary'
            }`}
            style={{ borderRadius: 'var(--radius-md)' }}>
            <KeyRound size={13} strokeWidth={2.4} className="inline mr-1" />
            เข้าคลาส
          </button>
          <button onClick={() => { setTab('create'); setError(''); }}
            className={`flex-1 text-caption font-bold px-3 py-2 border ${
              tab === 'create'
                ? 'border-info bg-info text-white'
                : 'border-border bg-bg-tertiary text-text-secondary'
            }`}
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Plus size={13} strokeWidth={2.4} className="inline mr-1" />
            สร้างคลาสใหม่
          </button>
        </div>

        {tab === 'join' ? (
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
        ) : (
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
              {busy ? 'กำลังสร้าง…' : 'สร้างคลาส (สำหรับอาจารย์)'}
            </button>
          </form>
        )}

        <div className="border-t border-border pt-3">
          <button onClick={useOffline}
            className="btn btn-ghost btn-sm btn-block text-text-muted">
            <CloudOff size={13} strokeWidth={2.2} /> ใช้แบบ offline เท่านั้น
          </button>
          <p className="text-[11px] text-text-muted text-center mt-1">
            ข้อมูลจะเก็บในเครื่องนี้เท่านั้น ไม่ sync ไป cloud
          </p>
        </div>
      </div>
    </div>
  );
}
