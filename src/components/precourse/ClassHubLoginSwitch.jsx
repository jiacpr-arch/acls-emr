import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { rpcGetClassExamPolicy, rpcSetClassRequireHubLogin } from '../../services/cohortSync';
import { useClassStore } from '../../stores/classStore';
import { usePassport } from '../../hooks/usePassport';

// Instructor switch for the class rule "log in with the JIA account before the exam"
// (supabase-cleanup/class-hub-login.sql; learners get it through hooks/useHubLoginGate.js).
export default function ClassHubLoginSwitch() {
  const classCode = useClassStore(s => s.classCode);
  const instructorCode = useClassStore(s => s.instructorCode);
  const setRequireHubLogin = useClassStore(s => s.setRequireHubLogin);
  const passport = usePassport();
  const [value, setValue] = useState(null); // null = not loaded
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    rpcGetClassExamPolicy(instructorCode || classCode)
      .then(({ data }) => {
        if (cancelled) return;
        setValue(data ? data.requireHubLogin : null);
        setError(data ? '' : 'โหลดการตั้งค่าไม่สำเร็จ — ตรวจการเชื่อมต่อแล้วเปิดหน้านี้ใหม่');
      })
      .catch(() => { if (!cancelled) setError('โหลดการตั้งค่าไม่สำเร็จ — ตรวจการเชื่อมต่อแล้วเปิดหน้านี้ใหม่'); });
    return () => { cancelled = true; };
  }, [classCode, instructorCode]);

  const toggle = async () => {
    if (busy || value === null) return;
    setBusy(true);
    setError('');
    const { data, error: err } = await rpcSetClassRequireHubLogin(!value).catch((e) => ({ error: e }));
    setBusy(false);
    if (data) {
      setValue(data.requireHubLogin);
      setRequireHubLogin(data.requireHubLogin);
      return;
    }
    setError((err?.message || '').includes('invalid_code')
      ? 'ต้องใส่รหัสอาจารย์ก่อนจึงจะเปลี่ยนได้'
      : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
  };

  return (
    <div className="bg-bg-tertiary p-3 space-y-1.5" style={{ borderRadius: 'var(--radius-md)' }}
      data-testid="class-hub-login">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="min-w-0">
          <span className="text-caption font-bold text-text-primary inline-flex items-center gap-1">
            <ShieldCheck size={13} strokeWidth={2.4} /> ต้องเข้าสู่ระบบบัญชี JIA ก่อนสอบ
          </span>
          <span className="block text-2xs text-text-muted">
            นักเรียนในคลาสนี้ต้อง login บัญชี JIA (ชื่อจริงที่ยืนยันแล้ว) ก่อนทำ pre-test, post-test
            และรับใบประกาศ — ผลสอบเข้าระบบกลางของ JIA
          </span>
        </span>
        <input type="checkbox" role="switch" aria-label="ต้องเข้าสู่ระบบบัญชี JIA ก่อนสอบ"
          checked={!!value} disabled={value === null || busy} onChange={toggle}
          className="shrink-0 w-5 h-5" />
      </label>
      {passport.loaded && !passport.configured && (
        <p className="text-2xs text-warning">
          เว็บนี้ยังไม่ได้เปิดระบบบัญชี JIA — เปิดไว้ก็ยังไม่บังคับ นักเรียนสอบได้ตามปกติจนกว่าจะตั้งค่า
        </p>
      )}
      {error && <p className="text-2xs text-danger">{error}</p>}
    </div>
  );
}
