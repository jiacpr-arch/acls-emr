import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useClassStore } from '../stores/classStore';
import { rpcJoinClass } from '../services/cohortSync';
import { buildStudentQrPayload } from '../utils/qrPayload';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import { ChevronLeft, QrCode, Sun, CloudOff, User, KeyRound } from 'lucide-react';

// บัตร QR ประจำตัวนักเรียน — อาจารย์สแกนหน้าฐานเพื่อเช็คชื่อ/บันทึกผลสอบปฏิบัติ
// payload ใน QR คือ class_id + student_pk (ไม่มีชื่อ/ข้อมูลส่วนตัว)
//
// ก่อน render ต้อง canonicalize student_pk กับ server ผ่าน rpcJoinClass
// (idempotent): ถ้านักเรียนเคยลงทะเบียนจากเครื่องอื่น server จะคืน pk ตัวจริง
// ของแถวใน cohort_students — ใช้ pk นั้นทำ QR ไม่งั้นสแกนแล้ว unknown_student
export default function StudentQrCard() {
  const navigate = useNavigate();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const classId = useClassStore(s => s.classId);
  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);

  const [showIdentity, setShowIdentity] = useState(false);
  const [canonical, setCanonical] = useState(null); // { classId, studentPk } จาก server
  const [offline, setOffline] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (!activeStudent?.id || !classCode) return undefined;
    let cancelled = false;
    const online = typeof navigator === 'undefined' || navigator.onLine !== false;
    if (!online) {
      setOffline(true);
      return undefined;
    }
    rpcJoinClass({
      code: classCode,
      studentUuid: activeStudent.id,
      studentId: activeStudent.studentId,
      name: activeStudent.name,
      phone: activeStudent.phone ?? null,
    }).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data?.studentPk) {
        setOffline(true); // ต่อ server ไม่ได้ — ใช้ pk ในเครื่องไปก่อน พร้อมคำเตือน
      } else {
        setOffline(false);
        setCanonical({ classId: data.classId, studentPk: data.studentPk });
      }
    });
    return () => { cancelled = true; };
  }, [activeStudent?.id, activeStudent?.studentId, activeStudent?.name, activeStudent?.phone, classCode]);

  const effectiveClassId = canonical?.classId || classId;
  const effectivePk = canonical?.studentPk || activeStudent?.id;

  useEffect(() => {
    if (!effectiveClassId || !effectivePk) { setQrDataUrl(null); return undefined; }
    const payload = buildStudentQrPayload({ classId: effectiveClassId, studentPk: effectivePk });
    let cancelled = false;
    import('qrcode')
      .then(QR => QR.toDataURL(payload, { width: 512, margin: 1 }))
      .then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [effectiveClassId, effectivePk]);

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/pre-course')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Pre-course
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <QrCode size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h1 className="text-title text-text-primary">บัตร QR ของฉัน</h1>
          <p className="text-caption text-text-muted">
            ยื่นให้อาจารย์สแกนเพื่อเช็คชื่อเข้าฐาน / บันทึกผลสอบปฏิบัติ
          </p>
        </div>
      </div>

      {!classCode ? (
        <div className="dash-card space-y-3 text-center py-8">
          <KeyRound size={28} strokeWidth={2} className="mx-auto text-text-muted" />
          <div className="text-body-strong text-text-primary">ยังไม่ได้เข้าคลาส</div>
          <p className="text-caption text-text-muted">
            บัตร QR ใช้ได้เมื่อเข้าคลาสแล้วเท่านั้น — กลับไปหน้า Pre-course
            แล้วกด "เชื่อมต่อคลาส" ด้วยรหัสที่ได้จากอาจารย์
          </p>
          <button onClick={() => navigate('/pre-course')} className="btn btn-primary btn-sm">
            ไปหน้า Pre-course
          </button>
        </div>
      ) : !activeStudent ? (
        <div className="dash-card space-y-3 text-center py-8">
          <User size={28} strokeWidth={2} className="mx-auto text-text-muted" />
          <div className="text-body-strong text-text-primary">ยังไม่ได้ลงชื่อนักเรียน</div>
          <p className="text-caption text-text-muted">
            กรอกชื่อและรหัสนักเรียนก่อน แล้วบัตร QR จะแสดงที่นี่
          </p>
          <button onClick={() => setShowIdentity(true)} className="btn btn-primary btn-sm">
            ลงชื่อนักเรียน
          </button>
        </div>
      ) : (
        <div className="dash-card space-y-4 text-center">
          <div className="space-y-0.5">
            <div className="text-body-strong text-text-primary">{activeStudent.name}</div>
            <div className="text-lg font-mono font-bold tracking-[0.25em] text-text-primary">
              {activeStudent.studentId || '—'}
            </div>
            <div className="text-2xs text-text-muted">คลาส: {className || classCode}</div>
          </div>

          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR ประจำตัวนักเรียน"
              className="w-64 h-64 max-w-full mx-auto bg-white p-3"
              style={{ borderRadius: 'var(--radius-md)' }} />
          ) : (
            <div className="w-64 h-64 mx-auto inline-flex items-center justify-center bg-bg-tertiary text-text-muted text-caption"
              style={{ borderRadius: 'var(--radius-md)' }}>
              กำลังสร้าง QR…
            </div>
          )}

          {offline && (
            <div className="bg-warning/8 border border-warning/25 p-3 text-caption text-text-secondary inline-flex items-start gap-2 text-left"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <CloudOff size={14} strokeWidth={2.2} className="shrink-0 mt-0.5 text-warning" />
              ยังยืนยันกับ server ไม่ได้ (offline) — QR นี้อาจสแกนไม่ติดถ้าเพิ่งย้ายเครื่อง
              ลองเปิดหน้านี้อีกครั้งตอนมีเน็ต
            </div>
          )}

          <div className="text-2xs text-text-muted inline-flex items-center gap-1.5">
            <Sun size={12} strokeWidth={2.2} />
            เร่งความสว่างหน้าจอให้สุด จะช่วยให้สแกนติดเร็วขึ้น
          </div>
        </div>
      )}

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
