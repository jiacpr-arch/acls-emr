import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../stores/classStore';
import {
  rpcGetCheckinBoard, rpcCheckinStudent, rpcSetExamResult,
} from '../services/cohortSync';
import { parseStudentQrPayload } from '../utils/qrPayload';
import QrScannerView from '../components/checkin/QrScannerView';
import ScanResultCard from '../components/checkin/ScanResultCard';
import StationManager from '../components/checkin/StationManager';
import ManualCheckinList from '../components/checkin/ManualCheckinList';
import ClassGateModal from '../components/precourse/ClassGateModal';
import { track } from '../services/analytics';
import {
  ChevronLeft, ScanLine, Settings2, KeyRound, Award,
  ClipboardCheck, Camera, List, Check, AlertTriangle,
} from 'lucide-react';

const timeStr = (iso) => (iso ? new Date(iso).toLocaleTimeString('th-TH', {
  hour: '2-digit', minute: '2-digit',
}) : '');

// หน้าเช็คชื่อเข้าฐานของอาจารย์ — เลือกฐาน → สแกน QR นักเรียน (หรือเช็คจาก
// รายชื่อ) → เช็คชื่อ + บันทึกผลสอบปฏิบัติ ต้องมีรหัสอาจารย์ (instructor code)
// เหมือนหน้ารวมผล /pre-course/cohort
export default function InstructorCheckin() {
  const navigate = useNavigate();
  const classId = useClassStore(s => s.classId);
  const classCode = useClassStore(s => s.classCode);
  const instructorCode = useClassStore(s => s.instructorCode);
  const className = useClassStore(s => s.className);
  const courseMode = useClassStore(s => s.courseMode);

  const [board, setBoard] = useState(null);   // { stations, rows }
  const [loading, setLoading] = useState(() => !!classCode);
  const [reloadKey, setReloadKey] = useState(0);
  const [needInstructorCode, setNeedInstructorCode] = useState(false);
  const [gateMode, setGateMode] = useState(null); // null | 'create' | 'join'
  const [stationId, setStationId] = useState(null);
  const [tab, setTab] = useState('scan');     // 'scan' | 'list'
  const [showManager, setShowManager] = useState(false);
  const [result, setResult] = useState(null); // {status:'ok'|'duplicate'|'error', data?, message?}
  const [recent, setRecent] = useState([]);   // [{name, studentId, at, duplicate}]
  const [busy, setBusy] = useState(false);
  const [examBusy, setExamBusy] = useState(false);

  const trackedView = useRef(false);
  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    track('instructor_checkin_viewed', { props: { has_class: !!classCode } });
  }, [classCode]);

  const refreshBoard = () => setReloadKey(k => k + 1);

  useEffect(() => {
    if (!classCode) return undefined;
    let cancelled = false;
    const load = async () => {
      const { data, error } = await rpcGetCheckinBoard();
      if (cancelled) return;
      if (error) {
        if (!instructorCode && (error.message || '').includes('invalid_code')) {
          setNeedInstructorCode(true);
        }
        setBoard(null);
      } else {
        setNeedInstructorCode(false);
        setBoard(data);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [classCode, instructorCode, reloadKey]);

  const stations = useMemo(() => board?.stations || [], [board]);
  // ฐานที่ใช้งานจริง — derived ไม่ใช่ effect: ถ้ายังไม่เลือก (หรือฐานที่เลือก
  // ถูกลบไป) จะตกไปที่ฐานแรกโดยอัตโนมัติ
  const activeStationId = stations.some(s => s.id === stationId)
    ? stationId
    : (stations[0]?.id ?? null);
  const station = stations.find(s => s.id === activeStationId) || null;

  const doCheckin = async (studentPk) => {
    if (!activeStationId || busy) return;
    setBusy(true);
    const { data, error } = await rpcCheckinStudent({ studentPk, stationId: activeStationId });
    setBusy(false);
    if (error) {
      const msg = error.message || '';
      if (msg.includes('unknown_student')) {
        setResult({ status: 'error', message: 'นักเรียนคนนี้ไม่อยู่ในคลาสนี้ — ตรวจว่าเปิดบัตร QR ของคลาสที่ถูกต้อง' });
      } else if (msg.includes('invalid_code')) {
        setNeedInstructorCode(true);
        setResult({ status: 'error', message: 'ต้องยืนยันรหัสอาจารย์ก่อนจึงจะเช็คชื่อได้' });
      } else if (msg.includes('unknown_station')) {
        setResult({ status: 'error', message: 'ฐานนี้ถูกลบไปแล้ว — เลือกฐานใหม่' });
        refreshBoard();
      } else {
        setResult({ status: 'error', message: 'เช็คชื่อไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วสแกนใหม่' });
      }
      navigator.vibrate?.([60, 60, 60]);
      return;
    }
    setResult({ status: data.duplicate ? 'duplicate' : 'ok', data });
    setRecent(r => [{
      name: data.student.name,
      studentId: data.student.studentId,
      at: data.checkedInAt,
      duplicate: data.duplicate,
    }, ...r].slice(0, 8));
    navigator.vibrate?.(data.duplicate ? [40, 40, 40] : 80);
    refreshBoard();
  };

  const handleDecode = (text) => {
    const parsed = parseStudentQrPayload(text);
    if (!parsed) {
      setResult({ status: 'error', message: 'QR นี้ไม่ใช่บัตรนักเรียนของระบบ — ให้นักเรียนเปิดหน้า "บัตร QR ของฉัน"' });
      return;
    }
    if (classId && parsed.classId !== classId) {
      setResult({ status: 'error', message: 'นักเรียนคนนี้อยู่คนละคลาสกับคลาสที่เชื่อมต่ออยู่' });
      navigator.vibrate?.([60, 60, 60]);
      return;
    }
    doCheckin(parsed.studentPk);
  };

  const handleSetExam = async (passed, score) => {
    if (!result?.data || !activeStationId) return;
    setExamBusy(true);
    const { error } = await rpcSetExamResult({
      studentPk: result.data.student.id,
      stationId: activeStationId,
      passed,
      score,
    });
    setExamBusy(false);
    if (error) {
      setResult({ status: 'error', message: 'บันทึกผลสอบไม่สำเร็จ — ลองใหม่อีกครั้ง' });
      return;
    }
    setResult(r => (r?.data ? {
      ...r,
      data: { ...r.data, examPassed: passed, examScore: score },
    } : r));
    refreshBoard();
  };

  const presentCount = station
    ? (board?.rows || []).filter(r => r.checkins?.[station.id]).length
    : 0;
  const totalCount = board?.rows?.length || 0;

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/pre-course/cohort')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับหน้ารวมผล
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <ScanLine size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-title text-text-primary">เช็คชื่อเข้าฐาน</h1>
          <p className="text-caption text-text-muted truncate">
            {classCode ? `คลาส: ${className || classCode}` : 'ยังไม่ได้เชื่อมต่อคลาส'}
            {station && ` · ${station.name}: มาแล้ว ${presentCount}/${totalCount}`}
          </p>
        </div>
      </div>

      {!classCode ? (
        <div className="dash-card space-y-3 text-center py-8">
          <KeyRound size={28} strokeWidth={2} className="mx-auto text-text-muted" />
          <div className="text-body-strong text-text-primary">ยังไม่ได้เชื่อมต่อคลาส</div>
          <p className="text-caption text-text-muted">
            สร้างคลาสหรือเชื่อมต่อด้วยรหัสอาจารย์ก่อน จึงจะเช็คชื่อนักเรียนได้
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setGateMode('create')} className="btn btn-primary btn-sm">
              สร้างคลาสใหม่
            </button>
            <button onClick={() => setGateMode('join')} className="btn btn-ghost btn-sm">
              <KeyRound size={13} strokeWidth={2.2} /> ใส่รหัสอาจารย์
            </button>
          </div>
        </div>
      ) : needInstructorCode ? (
        <div className="dash-card space-y-2">
          <div className="text-caption text-text-secondary">
            หน้านี้ต้องยืนยันด้วย <b>รหัสอาจารย์</b> (รหัสเข้าคลาสของนักเรียนใช้ไม่ได้) —
            การเช็คชื่อ/ให้ผลสอบทำได้จากเครื่องอาจารย์เท่านั้น
          </div>
          <button onClick={() => setGateMode('join')} className="btn btn-primary btn-sm btn-block">
            <KeyRound size={13} strokeWidth={2.2} /> ใส่รหัสอาจารย์
          </button>
        </div>
      ) : (
        <>
          {/* แถบเลือกฐาน */}
          <div className="space-y-2">
            <div className="text-overline text-text-muted px-1">เลือกฐาน</div>
            <div className="flex flex-wrap gap-1.5">
              {stations.map(s => (
                <button key={s.id}
                  onClick={() => { setStationId(s.id); setResult(null); }}
                  className={`cohort-chip ${
                    activeStationId === s.id
                      ? (s.kind === 'exam' ? 'is-active-warning' : 'is-active-info')
                      : ''
                  }`}>
                  {s.kind === 'exam'
                    ? <Award size={11} strokeWidth={2.4} />
                    : <ClipboardCheck size={11} strokeWidth={2.4} />}
                  {s.name}
                </button>
              ))}
              <button onClick={() => setShowManager(m => !m)} className="cohort-chip">
                <Settings2 size={11} strokeWidth={2.4} /> จัดการฐาน
              </button>
            </div>
          </div>

          {(showManager || (!loading && stations.length === 0)) && (
            <StationManager
              stations={stations}
              courseMode={courseMode || 'acls'}
              onChanged={refreshBoard}
            />
          )}

          {stations.length > 0 && (
            <>
              {/* สลับ กล้อง / รายชื่อ */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTab('scan')}
                  className={`btn btn-sm ${tab === 'scan' ? 'btn-primary' : 'btn-ghost'}`}>
                  <Camera size={13} strokeWidth={2.2} /> สแกน QR
                </button>
                <button onClick={() => setTab('list')}
                  className={`btn btn-sm ${tab === 'list' ? 'btn-primary' : 'btn-ghost'}`}>
                  <List size={13} strokeWidth={2.2} /> รายชื่อ
                </button>
              </div>

              {tab === 'scan' && (
                <QrScannerView enabled={!!activeStationId} onDecode={handleDecode} />
              )}

              {tab === 'list' && (
                <ManualCheckinList
                  board={board}
                  stationId={activeStationId}
                  onCheckin={doCheckin}
                  busy={busy}
                />
              )}

              <ScanResultCard result={result} onSetExam={handleSetExam} examBusy={examBusy} />

              {recent.length > 0 && (
                <div className="dash-card space-y-1.5">
                  <div className="text-overline text-text-muted">สแกนล่าสุด</div>
                  {recent.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-caption">
                      {r.duplicate
                        ? <AlertTriangle size={12} strokeWidth={2.4} className="text-warning shrink-0" />
                        : <Check size={12} strokeWidth={2.6} className="text-success shrink-0" />}
                      <span className="text-text-primary flex-1 min-w-0 truncate">
                        {r.name} <span className="font-mono text-text-muted">({r.studentId})</span>
                      </span>
                      <span className="text-text-muted">{timeStr(r.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <ClassGateModal
        open={gateMode !== null}
        initialMode={gateMode || 'home'}
        instructor
        onClose={() => { setGateMode(null); refreshBoard(); }}
      />
    </div>
  );
}
