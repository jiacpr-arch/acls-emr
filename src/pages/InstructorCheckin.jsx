import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../stores/classStore';
import {
  rpcGetCheckinBoard, rpcCheckinStudent, rpcSetExamResult,
} from '../services/cohortSync';
import { parseStudentQrPayload } from '../utils/qrPayload';
import { resolveChecklistForStation } from '../data/checkinStations';
import QrScannerView from '../components/checkin/QrScannerView';
import ScanResultCard from '../components/checkin/ScanResultCard';
import StationManager from '../components/checkin/StationManager';
import ManualCheckinList from '../components/checkin/ManualCheckinList';
import ChecklistGrader from '../components/checkin/ChecklistGrader';
import StationPickerSheet from '../components/checkin/StationPickerSheet';
import ClassGateModal from '../components/precourse/ClassGateModal';
import { track } from '../services/analytics';
import {
  ChevronLeft, ScanLine, Settings2, KeyRound, Award,
  ClipboardCheck, Camera, List, Check, AlertTriangle, FileText,
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
  const [showChecklist, setShowChecklist] = useState(false);
  // scan-first: สแกนแล้วเปิด sheet ให้เลือกฐานก่อนเช็คชื่อ
  const [pendingScan, setPendingScan] = useState(null); // { studentPk, name, studentId } | null
  // โหมดสแกน: 'ask' = ถามฐานทุกสแกน (default) / 'express' = ครูประจำฐาน —
  // ล็อกฐานไว้ สแกนปุ๊บเช็คชื่อ + บันทึก "ผ่าน" ทันที ไม่มีหน้าคั่น
  // จำข้ามรีเฟรชด้วย localStorage (ใช้ทั้งวันงานไม่ต้องตั้งใหม่)
  const [scanMode, setScanModeState] = useState(() => {
    try { return localStorage.getItem('acls-checkin-scan-mode') === 'express' ? 'express' : 'ask'; }
    catch { return 'ask'; }
  });
  const setScanMode = (m) => {
    setScanModeState(m);
    try { localStorage.setItem('acls-checkin-scan-mode', m); } catch { /* private mode */ }
  };
  // ป๊อปอัพยืนยันกลางจอหลังสแกนในโหมด express — เด้งใหญ่ให้เห็นชัดว่าสแกนติด
  // แล้ว (การ์ดผลอยู่ใต้กล้อง มักหลุดจอมือถือ) หายเองในไม่กี่วินาที
  const [flash, setFlash] = useState(null); // {name, studentId, station, duplicate?, warn?}
  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), flash.warn ? 5000 : 2500);
    return () => clearTimeout(t);
  }, [flash]);

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

  // มีเช็คลิสต์ผูกกับฐานนี้จริงไหม (resolve คืน object เสมอถ้าชื่อฐานตรง default
  // — ต้องเช็คว่ามี field ใด field หนึ่งไม่ว่างด้วย เช่นฐาน BLS ไม่มีเช็คลิสต์)
  const stationHasChecklist = (st) => {
    const sug = st ? resolveChecklistForStation(st.name) : null;
    return !!(sug && (sug.checklistId || sug.checklistOptions?.length || sug.checklistPool));
  };

  // stationIdArg มาจาก StationPickerSheet (scan-first), activeStationId
  // (แท็บรายชื่อ) หรือฐานที่ล็อกไว้ในโหมด express
  // autoPass (โหมด express): เช็คชื่อเสร็จบันทึก "ผ่าน" ต่อทันที ไม่เปิดใบประเมิน
  const doCheckin = async (studentPk, stationIdArg = activeStationId, { autoPass = false } = {}) => {
    const target = stations.find(s => s.id === stationIdArg) || null;
    if (!target || busy) return;
    setBusy(true);
    const { data, error } = await rpcCheckinStudent({ studentPk, stationId: target.id });
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
    setRecent(r => [{
      name: data.student.name,
      studentId: data.student.studentId,
      at: data.checkedInAt,
      duplicate: data.duplicate,
    }, ...r].slice(0, 8));
    // จำฐานที่เพิ่งใช้เป็นฐาน active (ตัวนับ/แท็บรายชื่อ/ป้าย "ล่าสุด" ใน picker ตาม)
    setStationId(target.id);
    if (autoPass) {
      // โหมด express: บันทึก "ผ่าน" ต่อทันที (สแกนซ้ำก็ upsert ผ่านซ้ำได้ —
      // idempotent ตรงเจตนา "มาถึงก็ผ่าน") และไม่เปิดใบประเมิน
      const { error: passErr } = await rpcSetExamResult({
        studentPk: data.student.id, stationId: target.id, passed: true,
      });
      if (passErr) {
        setResult({
          status: data.duplicate ? 'duplicate' : 'ok',
          data,
          message: 'เช็คชื่อแล้ว แต่บันทึก "ผ่าน" ไม่สำเร็จ — กดปุ่ม ผ่าน ในการ์ดนี้ซ้ำอีกครั้ง',
        });
        setFlash({
          name: data.student.name,
          studentId: data.student.studentId,
          station: target.name,
          warn: 'เช็คชื่อแล้ว แต่บันทึก "ผ่าน" ไม่สำเร็จ — เลื่อนลงไปกดปุ่ม ผ่าน ในการ์ดผลซ้ำ',
        });
      } else {
        setResult({
          status: data.duplicate ? 'duplicate' : 'ok',
          data: { ...data, examPassed: true },
        });
        setFlash({
          name: data.student.name,
          studentId: data.student.studentId,
          station: target.name,
          duplicate: data.duplicate,
        });
      }
      navigator.vibrate?.(80);
      refreshBoard();
      return;
    }
    setResult({ status: data.duplicate ? 'duplicate' : 'ok', data });
    navigator.vibrate?.(data.duplicate ? [40, 40, 40] : 80);
    // เช็คชื่อเสร็จเด้งใบประเมินต่อทันที — ทุกฐานที่มีเช็คลิสต์ผูก ไม่ต้องกดหา
    if (stationHasChecklist(target)) setShowChecklist(true);
    refreshBoard();
  };

  // scan-first: สแกนเสร็จไม่เช็คชื่อทันที — เปิด sheet ถามก่อนว่าเข้าฐานไหน
  // ชื่อนักเรียนหาได้จาก board ที่โหลดไว้แล้ว (ไม่ต้องยิง RPC เพิ่ม)
  const handleDecode = (text) => {
    if (pendingScan || showChecklist) return; // มี sheet เปิดอยู่ — ไม่รับสแกนซ้อน
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
    // โหมด express (ครูประจำฐาน): ข้ามหน้าถามฐาน — เช็คชื่อ + บันทึกผ่านที่ฐาน
    // ที่ล็อกไว้ทันที
    if (scanMode === 'express' && activeStationId) {
      navigator.vibrate?.(40);
      setResult(null);
      doCheckin(parsed.studentPk, activeStationId, { autoPass: true });
      return;
    }
    const row = (board?.rows || []).find(r => r.student.id === parsed.studentPk);
    if (!row) refreshBoard(); // นักเรียนเพิ่งเข้าคลาสหลังโหลดหน้า — รีเฟรชเบื้องหลัง
    navigator.vibrate?.(40);
    setResult(null);
    setPendingScan({
      studentPk: parsed.studentPk,
      name: row?.student?.name ?? 'นักเรียน',
      studentId: row?.student?.studentId ?? '',
    });
  };

  const handlePickStation = (st) => {
    const scan = pendingScan;
    setPendingScan(null);
    if (scan) doCheckin(scan.studentPk, st.id);
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

  const handleSaveChecklist = async ({ passed, score, note, checklistId, checklistItems }) => {
    if (!result?.data || !activeStationId) return;
    setExamBusy(true);
    const { error } = await rpcSetExamResult({
      studentPk: result.data.student.id,
      stationId: activeStationId,
      passed, score, note, checklistId, checklistItems,
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
    setShowChecklist(false);
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
        <a
          href={`${import.meta.env.BASE_URL}checkin-guide.pdf`}
          target="_blank" rel="noopener noreferrer" download
          className="btn btn-ghost btn-sm shrink-0">
          <FileText size={14} strokeWidth={2.2} /> คู่มือ (PDF)
        </a>
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
            <div className="text-overline text-text-muted px-1">
              {scanMode === 'express'
                ? 'ฐานที่ล็อกไว้ (โหมดประจำฐาน — สแกนแล้วผ่านที่ฐานนี้เลย)'
                : 'ฐานที่ใช้งาน (สแกนไม่ต้องเลือกก่อน — แท็บรายชื่อ/ตัวนับใช้ฐานนี้)'}
            </div>
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
                <>
                  {/* โหมดสแกน: ถามฐานทุกสแกน (default) หรือครูประจำฐานสแกนแล้วผ่านเลย */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setScanMode('ask')}
                      className={`cl-row ${scanMode === 'ask' ? 'is-checked' : ''}`}>
                      <span className="cl-box">
                        {scanMode === 'ask' && <Check size={17} strokeWidth={3.2} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-bold">🙋 ถามฐานทุกสแกน</span>
                        <span className="block text-caption text-text-secondary">
                          สแกนแล้วเลือกฐาน + เปิดใบประเมิน — เหมาะกับอาจารย์ที่ดูหลายฐาน
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanMode('express')}
                      className={`cl-row ${scanMode === 'express' ? 'is-checked' : ''}`}>
                      <span className="cl-box">
                        {scanMode === 'express' && <Check size={17} strokeWidth={3.2} />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-bold">⚡ ประจำฐาน: สแกนแล้วผ่านเลย</span>
                        <span className="block text-caption text-text-secondary">
                          ล็อกฐานไว้ นักเรียนมาสแกนปุ๊บ = เช็คชื่อ + บันทึก "ผ่าน" ทันที
                        </span>
                      </span>
                    </button>
                    {scanMode === 'express' && station && (
                      <div className="bg-warning/12 border border-warning/40 px-3 py-2 flex items-start gap-2"
                        style={{ borderRadius: 'var(--radius-md)' }}>
                        <AlertTriangle size={14} strokeWidth={2.4} className="text-warning shrink-0 mt-0.5" />
                        <div className="text-caption text-text-primary">
                          สแกนปุ๊บ = เช็คชื่อ + บันทึก <b className="text-success">ผ่าน</b> ทันที
                          ที่ <b>{station.name}</b> — เปลี่ยนฐานได้จากตัวเลือกฐานด้านบน
                        </div>
                      </div>
                    )}
                  </div>
                  <QrScannerView
                    enabled={!pendingScan && !showChecklist}
                    onDecode={handleDecode}
                  />
                  <p className="text-2xs text-text-muted text-center">
                    {scanMode === 'express'
                      ? 'สแกนบัตร QR นักเรียน — เช็คชื่อ + ผ่านทันทีที่ฐานที่ล็อกไว้ ไม่มีหน้าคั่น'
                      : 'สแกนบัตร QR นักเรียน — ระบบจะถามต่อว่าเข้าฐานไหน ไม่ต้องเลือกฐานก่อน'}
                  </p>
                </>
              )}

              {tab === 'list' && (
                <ManualCheckinList
                  board={board}
                  stationId={activeStationId}
                  onCheckin={doCheckin}
                  busy={busy}
                />
              )}

              <ScanResultCard
                result={result}
                onSetExam={handleSetExam}
                examBusy={examBusy}
                onOpenChecklist={result?.data ? () => setShowChecklist(true) : null}
              />

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

      {/* ป๊อปอัพยืนยันโหมด express — แตะเพื่อปิด หรือหายเอง (สแกนคนต่อไปทับได้เลย) */}
      {flash && (
        <button
          type="button"
          onClick={() => setFlash(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          aria-label="ปิดป๊อปอัพ">
          <div
            className="bg-bg-secondary px-6 py-7 text-center space-y-2.5 mx-8 w-full max-w-xs animate-slide-up"
            style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
            <div className={`w-16 h-16 mx-auto inline-flex items-center justify-center ${
              flash.warn ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
            }`} style={{ borderRadius: 'var(--radius-full)' }}>
              {flash.warn
                ? <AlertTriangle size={32} strokeWidth={2.4} />
                : <Check size={36} strokeWidth={3} />}
            </div>
            <div>
              <div className="text-title text-text-primary">{flash.name}</div>
              {flash.studentId && (
                <div className="font-mono text-caption text-text-secondary">({flash.studentId})</div>
              )}
            </div>
            {flash.warn ? (
              <div className="text-caption text-warning font-bold">{flash.warn}</div>
            ) : (
              <div className="text-body-strong text-success">
                เช็คชื่อ + ผ่านแล้ว ✓{flash.duplicate ? ' (สแกนซ้ำ)' : ''}
              </div>
            )}
            <div className="text-caption text-text-muted">{flash.station}</div>
            <div className="text-2xs text-text-muted">หายเองอัตโนมัติ — สแกนคนต่อไปได้เลย</div>
          </div>
        </button>
      )}

      <StationPickerSheet
        open={!!pendingScan}
        student={pendingScan}
        stations={stations}
        checkins={pendingScan
          ? ((board?.rows || []).find(r => r.student.id === pendingScan.studentPk)?.checkins || {})
          : {}}
        lastStationId={activeStationId}
        onPick={handlePickStation}
        onClose={() => setPendingScan(null)}
        busy={busy}
      />

      <ChecklistGrader
        open={showChecklist}
        station={station}
        student={result?.data?.student ?? null}
        onSave={handleSaveChecklist}
        onClose={() => setShowChecklist(false)}
        saving={examBusy}
      />

      <ClassGateModal
        open={gateMode !== null}
        initialMode={gateMode || 'home'}
        instructor
        onClose={() => { setGateMode(null); refreshBoard(); }}
      />
    </div>
  );
}
