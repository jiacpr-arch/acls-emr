import { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons } from '../data/activeLessons';
import { getCohortSummary, deleteStudent } from '../db/database';
import { useClassStore } from '../stores/classStore';
import { rpcGetCohortSummary, rpcDeleteCohortStudent } from '../services/cohortSync';
import { scheduleFlush, getPendingCount, subscribeToSync } from '../services/syncEngine';
import {
  PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT,
} from '../data/activePreTest';
import {
  POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT,
} from '../data/activePostTest';
import { IS_ACLS, IS_SKILL_COURSE } from '../config/courseMode';

// ACLS และ 3 คอร์สทักษะเดี่ยว (airway/defib/iv) มี pre-test — มีแค่ BLS เท่านั้นที่ไม่มี
const HAS_PRE_TEST = IS_ACLS || IS_SKILL_COURSE;
import CohortTable from '../components/precourse/CohortTable';
import CheckinCohortSummary from '../components/precourse/CheckinCohortSummary';
import AwardSummaryCard from '../components/precourse/AwardSummaryCard';
import CodeBlueCohortSummary from '../components/precourse/CodeBlueCohortSummary';
import RecorderCohortSummary from '../components/precourse/RecorderCohortSummary';
import ClassGateModal from '../components/precourse/ClassGateModal';
import QrFullscreenOverlay from '../components/precourse/QrFullscreenOverlay';
import { track } from '../services/analytics';
import {
  exportCohortCSV, exportCohortPDF,
  exportCohortSummaryCSV, exportCohortSummaryPDF,
} from '../utils/exportPreCourse';
import {
  ChevronLeft, ChevronDown, Users, Download, FileText, Trash, Sparkles, Award,
  Cloud, CloudOff, RefreshCw, Copy, Check, Plus, KeyRound,
  Link as LinkIcon, Eye, EyeOff, ShieldCheck, Maximize2,
} from 'lucide-react';

// หน้ายาวมากจนอาจารย์เลื่อนหาไม่ไหวหน้างานจริง — แบ่งเป็นแท็บ โดยเนื้อหาแท็บ
// ที่ไม่เปิดจะไม่ mount (การ์ดผลลัพธ์แต่ละตัว fetch เองตอน mount อยู่แล้ว)
const TABS = [
  { key: 'class', label: 'คลาส/QR' },
  { key: 'overview', label: 'ภาพรวม' },
  { key: 'theory', label: 'ทฤษฎี' },
  { key: 'practical', label: 'ปฏิบัติ' },
  { key: 'games', label: 'เกม' },
];
const TAB_STORAGE_KEY = 'instructorCohortTab';

const readSavedTab = () => {
  try {
    const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
    return TABS.some(t => t.key === saved) ? saved : 'class';
  } catch {
    return 'class';
  }
};

export default function InstructorCohort() {
  const navigate = useNavigate();

  // Virtual "lessons" so the existing CohortTable + per-id selector keep working.
  // Pre-test exists for ACLS + the 3 skill courses; BLS has none. Post-test
  // exists in every mode (different content per mode).
  const assessmentEntries = useMemo(() => {
    const list = [];
    if (HAS_PRE_TEST) {
      list.push({
        id: PRE_TEST_LESSON_ID,
        title: 'Pre-test',
        passingScore: PRE_TEST_PASS_PERCENT,
        kind: 'pretest',
      });
    }
    list.push({
      id: POST_TEST_LESSON_ID,
      title: 'Post-test',
      passingScore: POST_TEST_PASS_PERCENT,
      kind: 'posttest',
    });
    return list;
  }, []);

  const allEntries = useMemo(
    () => [...preCourseLessons, ...assessmentEntries],
    [assessmentEntries],
  );

  const [tab, setTab] = useState(readSavedTab);
  const [selectedId, setSelectedId] = useState(preCourseLessons[0]?.id ?? assessmentEntries[0]?.id);
  const [summary, setSummary] = useState([]);   // [{ student, lessons: {lid: {...}} }]
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [source, setSource] = useState('local');  // 'cloud' | 'local'
  const [pendingCount, setPendingCount] = useState(0);
  // Class setup happens right here on the instructor page — no need to hunt
  // for the tiny "create class" link buried in the student-facing gate modal.
  const [gateMode, setGateMode] = useState(null); // null | 'create' | 'join'
  const [copied, setCopied] = useState(null);     // 'code' | 'link' | 'instructor' | null
  const [showInstructorCode, setShowInstructorCode] = useState(false);
  // New-style class + no instructor code on this device (e.g. a student
  // opened this page, or the instructor is on a fresh browser).
  const [needInstructorCode, setNeedInstructorCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showQrFull, setShowQrFull] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  // แถวนักเรียนที่กางดูรายละเอียดอยู่ในตารางภาพรวม (id เดียวต่อครั้ง)
  const [expandedStudent, setExpandedStudent] = useState(null);
  // ลบทั้งคลาสต้องกด 2 จังหวะ (arm → ยืนยัน) กันนิ้วพลาดตอนถือมือถือหน้างาน
  const [clearArmed, setClearArmed] = useState(false);
  const clearArmTimer = useRef(null);
  useEffect(() => () => clearTimeout(clearArmTimer.current), []);

  const classCode = useClassStore(s => s.classCode);
  const instructorCode = useClassStore(s => s.instructorCode);
  const className = useClassStore(s => s.className);
  const syncDisabled = useClassStore(s => s.syncDisabled);

  // Students join by scanning/opening this link — no typing, no typos.
  // openExternalBrowser=1 — เมื่อนักเรียนสแกน QR / กดลิงก์ในแอป LINE ให้ LINE
  // เด้งไปเปิดในเบราว์เซอร์หลักของเครื่องแทน in-app browser (ไม่งั้นผลการเรียน
  // ไปเก็บใน WebView ของ LINE ซึ่งแยกจาก Safari/Chrome และถูกล้างได้เอง)
  const joinUrl = classCode
    ? `${window.location.origin}/pre-course?join=${classCode}&openExternalBrowser=1`
    : null;

  useEffect(() => {
    const ids = allEntries.map(l => l.id);
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      // Prefer cloud data when class is set + online; fall back to local IndexedDB.
      const online = typeof navigator === 'undefined' || navigator.onLine !== false;
      if (classCode && !syncDisabled && online) {
        const { data, error } = await rpcGetCohortSummary(ids);
        if (!cancelled && !error) {
          setSummary(data);
          setSource('cloud');
          setNeedInstructorCode(false);
          setLoading(false);
          return;
        }
        // New-style class: the student join code no longer unlocks the
        // summary — this device needs the instructor code.
        if (!cancelled && error && !instructorCode
            && (error.message || '').includes('invalid_code')) {
          setNeedInstructorCode(true);
        }
      }
      const local = await getCohortSummary(ids);
      if (!cancelled) {
        setSummary(local);
        setSource('local');
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [reloadKey, allEntries, classCode, instructorCode, syncDisabled]);

  // QR of the join link, generated lazily so `qrcode` stays out of the main chunk.
  useEffect(() => {
    if (!joinUrl) { setQrDataUrl(null); return; }
    let cancelled = false;
    import('qrcode')
      .then(QR => QR.toDataURL(joinUrl, { width: 384, margin: 1 }))
      .then(url => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [joinUrl]);

  const trackedView = useRef(false);
  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    track('instructor_cohort_viewed', { props: { has_class: !!classCode } });
  }, [classCode]);

  useEffect(() => {
    let cancelled = false;
    const refreshPending = () => {
      getPendingCount().then(n => { if (!cancelled) setPendingCount(n); });
    };
    refreshPending();
    const unsubscribe = subscribeToSync(refreshPending);
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const refresh = () => setReloadKey(k => k + 1);

  const handleSyncNow = () => {
    scheduleFlush();
    setTimeout(refresh, 800);
  };

  const switchTab = (key) => {
    setTab(key);
    try { sessionStorage.setItem(TAB_STORAGE_KEY, key); } catch { /* private mode */ }
  };

  const copy = (what, text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(c => (c === what ? null : c)), 1500);
  };

  const selected = allEntries.find(l => l.id === selectedId);
  const isAssessmentView = assessmentEntries.some(e => e.id === selectedId);

  const rows = summary.map(({ student, lessons }) => {
    const ls = lessons[selectedId] || {};
    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      phone: student.phone,
      // "read" is meaningless for assessments — show as true (or hide).
      read: isAssessmentView ? true : !!ls.read,
      attemptCount: ls.attemptCount || 0,
      bestScore: ls.bestScore,
      passed: ls.passed,
      lastAttemptAt: ls.lastAttemptAt,
    };
  });

  const overallRows = summary.map(({ student, lessons }) => {
    const total = preCourseLessons.length;
    const passedCount = preCourseLessons.filter(l => lessons[l.id]?.passed).length;
    const readCount = preCourseLessons.filter(l => lessons[l.id]?.read).length;
    const preTest = lessons[PRE_TEST_LESSON_ID];
    const postTest = lessons[POST_TEST_LESSON_ID];
    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      phone: student.phone,
      readCount, passedCount, total,
      preTestScore: preTest?.bestScore ?? null,
      preTestPassed: preTest?.passed ?? false,
      postTestScore: postTest?.bestScore ?? null,
      postTestPassed: postTest?.passed ?? false,
    };
  });

  // เช็คลิสต์รายคนสำหรับแถวที่กางออกในตารางภาพรวม — ผ่าน / ค้างอยู่ / ยังไม่เริ่ม
  // ต่อทุกบทเรียน + Pre/Post-test คำนวณจาก summary ที่โหลดไว้แล้ว ไม่ fetch เพิ่ม
  const studentChecklist = (studentDbId) => {
    const det = summary.find(s => s.student.id === studentDbId);
    const lessonsMap = det?.lessons || {};
    return allEntries.map(l => {
      const isAssessment = assessmentEntries.some(e => e.id === l.id);
      const ls = lessonsMap[l.id] || {};
      // ชื่อบทเต็มยาวมาก — ใช้แค่ "บทที่ N" พออ่านออกบนชิปเล็ก
      const shortTitle = isAssessment ? l.title : (l.title.split(':')[0] || l.title);
      if (isAssessment) {
        if (ls.bestScore != null) {
          return { id: l.id, shortTitle, status: ls.passed ? 'passed' : 'partial', note: `${ls.bestScore}%` };
        }
        return { id: l.id, shortTitle, status: 'missing', note: 'ยังไม่สอบ' };
      }
      if (ls.passed) {
        return { id: l.id, shortTitle, status: 'passed', note: ls.bestScore != null ? `${ls.bestScore}%` : '' };
      }
      if (ls.read || ls.attemptCount) {
        return { id: l.id, shortTitle, status: 'partial', note: ls.bestScore != null ? `${ls.bestScore}%` : 'อ่านแล้ว' };
      }
      return { id: l.id, shortTitle, status: 'missing', note: '' };
    });
  };

  // ตัวเลขด่วนบนหัวหน้า — อาจารย์เห็นภาพรวมทันทีไม่ว่าจะอยู่แท็บไหน
  const quickStats = useMemo(() => ({
    students: overallRows.length,
    lessonsDone: overallRows.filter(r => r.total > 0 && r.passedCount === r.total).length,
    preTestDone: overallRows.filter(r => r.preTestScore != null).length,
    postTestDone: overallRows.filter(r => r.postTestScore != null).length,
  }), [overallRows]);

  const handleDelete = async (r) => {
    if (!confirm(`ลบนักเรียน ${r.name} (${r.studentId}) และผลทั้งหมด?`)) return;
    await deleteStudent(r.id);
    if (classCode && !syncDisabled) {
      await rpcDeleteCohortStudent(r.id);
    }
    refresh();
  };

  const handleClearAll = async () => {
    if (!clearArmed) {
      setClearArmed(true);
      clearTimeout(clearArmTimer.current);
      clearArmTimer.current = setTimeout(() => setClearArmed(false), 4000);
      return;
    }
    clearTimeout(clearArmTimer.current);
    setClearArmed(false);
    if (!confirm('ลบนักเรียนและผล Pre-course ทั้งหมดในเครื่องนี้?')) return;
    for (const { student } of summary) {
      await deleteStudent(student.id);
      if (classCode && !syncDisabled) {
        await rpcDeleteCohortStudent(student.id);
      }
    }
    refresh();
  };

  // ยังไม่มีคลาสและไม่มีข้อมูล local → โชว์เฉพาะ onboarding ไม่ต้องเห็นแท็บ/ตารางเปล่า
  const showTabs = !!classCode || summary.length > 0;

  const noClassCard = (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 inline-flex items-center justify-center bg-warning/12 text-warning shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <CloudOff size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">ยังไม่ได้เชื่อมต่อคลาส</div>
          <div className="text-2xs text-text-muted">
            สร้างคลาสก่อน ผลของนักเรียนถึงจะรวมมาแสดงหน้านี้
          </div>
        </div>
      </div>
      <ol className="text-caption text-text-secondary space-y-1 list-none">
        {[
          'สร้างคลาส → ได้รหัสเข้าคลาส (แจกนักเรียน) + รหัสอาจารย์ (เก็บส่วนตัว)',
          'แจกรหัส/QR ให้นักเรียนใช้ "เข้าคลาส" บนเครื่องของตัวเอง',
          'ผลเรียน/คะแนนสอบของทุกคนจะขึ้นหน้านี้อัตโนมัติ',
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-[18px] h-[18px] shrink-0 bg-info text-white text-2xs font-extrabold mt-px"
              style={{ borderRadius: '50%' }}>{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <button onClick={() => setGateMode('create')}
        className="btn btn-primary btn-block font-bold">
        <Plus size={16} strokeWidth={2.4} /> สร้างคลาสใหม่ (สำหรับอาจารย์)
      </button>
      <button onClick={() => setGateMode('join')}
        className="w-full text-caption font-bold px-3 py-2.5 border border-border bg-bg-tertiary text-text-secondary inline-flex items-center justify-center gap-1.5"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <KeyRound size={14} strokeWidth={2.4} /> มีรหัสอาจารย์อยู่แล้ว? เชื่อมต่อด้วยรหัส
      </button>
    </div>
  );

  const guideLinks = (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={`${import.meta.env.BASE_URL}instructor-cohort-guide.pdf`}
        target="_blank" rel="noopener noreferrer" download
        className="btn btn-ghost btn-sm">
        <FileText size={14} strokeWidth={2.2} /> คู่มืออาจารย์ (PDF)
      </a>
      {IS_ACLS && (
        <a
          href={`${import.meta.env.BASE_URL}student-precourse-guide.pdf`}
          target="_blank" rel="noopener noreferrer" download
          className="btn btn-ghost btn-sm">
          <FileText size={14} strokeWidth={2.2} /> คู่มือนักเรียน (PDF)
        </a>
      )}
    </div>
  );

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course')}
        className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Pre-course
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Users size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h1 className="text-title text-text-primary">หน้าอาจารย์ — รวมผล Pre-course</h1>
          <p className="text-caption text-text-muted">
            {source === 'cloud'
              ? `คลาส: ${className || '—'} (${classCode}) · ${summary.length} นักเรียน`
              : `จากเครื่องนี้ · ${summary.length} นักเรียน`}
          </p>
        </div>
      </div>

      {!showTabs ? (
        <>
          {noClassCard}
          {guideLinks}
        </>
      ) : (
        <>
          {/* สรุปตัวเลขด่วน + สถานะ sync — เห็นตลอดทุกแท็บ */}
          <div className="dash-card !p-3 space-y-2">
            <div className={`grid ${HAS_PRE_TEST ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
              {[
                { label: 'นักเรียน', value: quickStats.students },
                { label: 'ผ่านบทเรียนครบ', value: quickStats.lessonsDone },
                ...(HAS_PRE_TEST
                  ? [{ label: 'Pre-test แล้ว', value: quickStats.preTestDone }]
                  : []),
                { label: 'Post-test แล้ว', value: quickStats.postTestDone },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-extrabold text-text-primary leading-tight">
                    {loading ? '–' : s.value}
                  </div>
                  <div className="text-2xs text-text-muted leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {source === 'cloud' ? (
                <span className="inline-flex items-center gap-1 text-2xs text-info">
                  <Cloud size={12} strokeWidth={2.2} /> ข้อมูลจาก cloud
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
                  <CloudOff size={12} strokeWidth={2.2} />
                  {classCode ? 'ข้อมูล cached (offline)' : 'โหมด offline เท่านั้น'}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-2xs text-warning">· ยังไม่ sync {pendingCount}</span>
              )}
              <div className="flex-1" />
              {classCode && !syncDisabled && (
                <button onClick={handleSyncNow} className="btn btn-ghost btn-sm">
                  <RefreshCw size={13} strokeWidth={2.2} /> Sync
                </button>
              )}
            </div>
          </div>

          {/* แถบแท็บ — sticky ให้สลับส่วนได้ตลอดแม้เลื่อนตารางยาว */}
          <div className="sticky top-0 z-20 bg-bg-primary py-1.5">
            <div className="tab-group">
              {TABS.map(t => (
                <button key={t.key} onClick={() => switchTab(t.key)}
                  className={`tab-item !px-1 ${tab === t.key ? 'active' : ''}`}>
                  {t.label}
                  {t.key === 'class' && needInstructorCode && (
                    <span className="inline-block w-1.5 h-1.5 bg-warning ml-1 align-middle"
                      style={{ borderRadius: '50%' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ===== แท็บ คลาส/QR ===== */}
          {tab === 'class' && (
            <div className="space-y-4">
              {classCode ? (
                <div className="dash-card space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
                      style={{ borderRadius: 'var(--radius-md)' }}>
                      <Cloud size={18} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-strong text-text-primary truncate">
                        คลาส: {className || '—'}
                      </div>
                      <div className="text-2xs text-text-muted">
                        นักเรียนเข้าคลาสได้ 2 ทาง: สแกน QR หรือกรอกรหัส
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-tertiary p-3 flex items-center gap-3"
                    style={{ borderRadius: 'var(--radius-md)' }}>
                    {qrDataUrl && (
                      <button onClick={() => setShowQrFull(true)} aria-label="ขยาย QR เต็มจอ"
                        className="shrink-0">
                        <img src={qrDataUrl} alt={`QR เข้าคลาส ${classCode}`}
                          className="w-24 h-24 bg-white p-1"
                          style={{ borderRadius: 'var(--radius-sm)' }} />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-overline text-text-muted">รหัสเข้าคลาส (แจกนักเรียน)</div>
                      <div className="text-2xl font-mono font-bold tracking-[0.25em] text-text-primary">
                        {classCode}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <button onClick={() => setShowQrFull(true)} className="btn btn-ghost btn-sm">
                          <Maximize2 size={13} strokeWidth={2.2} /> QR เต็มจอ
                        </button>
                        <button onClick={() => copy('code', classCode)} className="btn btn-ghost btn-sm">
                          {copied === 'code'
                            ? <><Check size={13} strokeWidth={2.4} /> คัดลอกแล้ว</>
                            : <><Copy size={13} strokeWidth={2.2} /> รหัส</>}
                        </button>
                        <button onClick={() => copy('link', joinUrl)} className="btn btn-ghost btn-sm">
                          {copied === 'link'
                            ? <><Check size={13} strokeWidth={2.4} /> คัดลอกแล้ว</>
                            : <><LinkIcon size={13} strokeWidth={2.2} /> ลิงก์เข้าคลาส</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {instructorCode && (
                    <div className="bg-warning/8 border border-warning/25 p-3 flex items-center justify-between gap-3"
                      style={{ borderRadius: 'var(--radius-md)' }}>
                      <div className="min-w-0">
                        <div className="text-overline text-warning inline-flex items-center gap-1">
                          <ShieldCheck size={12} strokeWidth={2.4} /> รหัสอาจารย์ (เก็บเป็นความลับ)
                        </div>
                        <div className="text-lg font-mono font-bold tracking-[0.25em] text-text-primary">
                          {showInstructorCode ? instructorCode : '••••••'}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setShowInstructorCode(s => !s)}
                          className="btn btn-ghost btn-sm" aria-label="แสดง/ซ่อนรหัสอาจารย์">
                          {showInstructorCode
                            ? <EyeOff size={13} strokeWidth={2.2} />
                            : <Eye size={13} strokeWidth={2.2} />}
                        </button>
                        <button onClick={() => copy('instructor', instructorCode)} className="btn btn-ghost btn-sm">
                          {copied === 'instructor'
                            ? <Check size={13} strokeWidth={2.4} />
                            : <Copy size={13} strokeWidth={2.2} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {needInstructorCode && (
                    <div className="bg-warning/8 border border-warning/30 p-3 space-y-2"
                      style={{ borderRadius: 'var(--radius-md)' }}>
                      <div className="text-caption text-text-secondary">
                        คลาสนี้ต้องยืนยันด้วย <b>รหัสอาจารย์</b> จึงจะดูผลรวมจาก cloud ได้
                        (รหัสเข้าคลาสของนักเรียนใช้ดูไม่ได้)
                      </div>
                      <button onClick={() => setGateMode('join')} className="btn btn-primary btn-sm btn-block">
                        <KeyRound size={13} strokeWidth={2.2} /> ใส่รหัสอาจารย์
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGateMode('create')} className="btn btn-ghost btn-sm">
                      <Plus size={13} strokeWidth={2.4} /> สร้างคลาสใหม่
                    </button>
                    <button onClick={() => setGateMode('join')} className="btn btn-ghost btn-sm">
                      <KeyRound size={13} strokeWidth={2.2} /> เชื่อมต่อคลาสอื่น
                    </button>
                  </div>
                  <p className="text-2xs text-text-muted text-center">
                    สลับคลาสได้โดยข้อมูลคลาสเดิมไม่หาย — กลับมาเชื่อมต่อด้วยรหัสเดิมได้ตลอด
                  </p>
                </div>
              ) : noClassCard}

              {guideLinks}

              {/* โซนอันตราย — พับเก็บ + กด 2 จังหวะ กันนิ้วพลาดลบทั้งคลาส */}
              {summary.length > 0 && (
                <div className="dash-card !p-0 overflow-hidden">
                  <button onClick={() => setDangerOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-caption font-bold text-danger">
                      <Trash size={13} strokeWidth={2.2} /> โซนอันตราย
                    </span>
                    <ChevronDown size={14} strokeWidth={2.2}
                      className={`text-text-muted transition-transform ${dangerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dangerOpen && (
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-2xs text-text-muted">
                        ลบนักเรียนและผล Pre-course ทั้งหมด {summary.length} คนออกจากเครื่องนี้
                        {classCode && !syncDisabled ? ' และจาก cloud' : ''} — กู้คืนไม่ได้
                      </p>
                      <button onClick={handleClearAll}
                        className={`btn btn-sm btn-block ${
                          clearArmed
                            ? 'bg-danger !text-white font-bold'
                            : 'btn-ghost text-danger'
                        }`}>
                        <Trash size={13} strokeWidth={2.2} />
                        {clearArmed
                          ? `กดอีกครั้งเพื่อยืนยันลบ ${summary.length} คน`
                          : 'ล้างข้อมูลทั้งหมด'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== แท็บ ภาพรวม ===== */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="text-2xs text-text-muted px-1">
                แตะชื่อนักเรียนเพื่อดูรายคนว่าผ่านอะไรแล้ว ยังขาดอะไร —
                <span className="text-success font-bold"> เขียว</span> ผ่าน ·
                <span className="text-warning font-bold"> เหลือง</span> ค้างอยู่/ยังไม่ผ่าน ·
                <span className="font-bold"> เทา</span> ยังไม่เริ่ม
              </div>
              <div className="dash-card !p-0 overflow-x-auto">
                <table className="w-full text-caption">
                  <thead className="bg-bg-tertiary text-text-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left">รหัส</th>
                      <th className="px-3 py-2 text-left">ชื่อ</th>
                      <th className="px-3 py-2 text-left">เบอร์โทร</th>
                      <th className="px-3 py-2 text-center">บทเรียน อ่าน</th>
                      <th className="px-3 py-2 text-center">บทเรียน ผ่าน</th>
                      {HAS_PRE_TEST && <th className="px-3 py-2 text-center">Pre-test</th>}
                      <th className="px-3 py-2 text-center">Post-test</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={HAS_PRE_TEST ? 7 : 6} className="px-3 py-6 text-center text-text-muted">
                        กำลังโหลด…
                      </td></tr>
                    ) : overallRows.length === 0 ? (
                      <tr><td colSpan={HAS_PRE_TEST ? 7 : 6} className="px-3 py-6 text-center text-text-muted">
                        ยังไม่มีนักเรียน
                      </td></tr>
                    ) : overallRows.map((r) => {
                      const expanded = expandedStudent === r.id;
                      return (
                        <Fragment key={r.id}>
                          <tr
                            onClick={() => setExpandedStudent(expanded ? null : r.id)}
                            className={`border-t border-border cursor-pointer ${expanded ? 'bg-bg-tertiary/60' : ''}`}>
                            <td className="px-3 py-2 font-mono text-text-secondary">{r.studentId}</td>
                            <td className="px-3 py-2 text-text-primary">
                              <span className="inline-flex items-center gap-1">
                                {r.name}
                                <ChevronDown size={12} strokeWidth={2.2}
                                  className={`text-text-muted shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-text-secondary">{r.phone || '-'}</td>
                            <td className="px-3 py-2 text-center text-text-secondary">{r.readCount}/{r.total}</td>
                            <td className={`px-3 py-2 text-center font-bold ${
                              r.passedCount === r.total ? 'text-success' : 'text-warning'
                            }`}>{r.passedCount}/{r.total}</td>
                            {HAS_PRE_TEST && (
                              <td className={`px-3 py-2 text-center font-bold ${
                                r.preTestScore == null ? 'text-text-muted'
                                  : r.preTestPassed ? 'text-success' : 'text-warning'
                              }`}>
                                {r.preTestScore != null ? `${r.preTestScore}%` : '-'}
                              </td>
                            )}
                            <td className={`px-3 py-2 text-center font-bold ${
                              r.postTestScore == null ? 'text-text-muted'
                                : r.postTestPassed ? 'text-success' : 'text-warning'
                            }`}>
                              {r.postTestScore != null ? `${r.postTestScore}%` : '-'}
                            </td>
                          </tr>
                          {expanded && (() => {
                            const items = studentChecklist(r.id);
                            const missing = items.filter(i => i.status !== 'passed');
                            return (
                              <tr className="bg-bg-tertiary/40">
                                <td colSpan={HAS_PRE_TEST ? 7 : 6} className="px-3 py-3">
                                  {/* ตารางกว้างกว่าจอ (scroll แนวนอน) — sticky left + จำกัดกว้าง
                                      ให้เนื้อหาที่กางออกอยู่ในพื้นที่มองเห็นเสมอ ชิปได้ wrap จริง */}
                                  <div className="sticky left-0"
                                    style={{ maxWidth: 'min(656px, calc(100vw - 48px))' }}>
                                  <div className="flex flex-wrap gap-1.5">
                                    {items.map(i => (
                                      <span key={i.id}
                                        className={`inline-flex items-center gap-1 px-2 py-1 text-2xs font-bold ${
                                          i.status === 'passed' ? 'bg-success/12 text-success'
                                            : i.status === 'partial' ? 'bg-warning/12 text-warning'
                                            : 'bg-bg-secondary text-text-muted border border-border'
                                        }`}
                                        style={{ borderRadius: 'var(--radius-full)' }}>
                                        {i.status === 'passed' && <Check size={11} strokeWidth={2.6} />}
                                        {i.shortTitle}{i.note ? ` · ${i.note}` : ''}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-2xs">
                                    {missing.length === 0 ? (
                                      <span className="text-success font-bold">ผ่านครบทุกรายการ 🎉</span>
                                    ) : (
                                      <span className="text-text-secondary">
                                        <b className="text-warning">ยังขาด {missing.length} รายการ:</b>{' '}
                                        {missing.map(i => i.shortTitle).join(' · ')}
                                      </span>
                                    )}
                                  </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Overall summary export — the one-file report an instructor submits to a committee */}
              {overallRows.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-overline text-text-muted px-1">ดาวน์โหลดสรุปผลรวม (สำหรับส่งคณะกรรมการ)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => exportCohortSummaryCSV({ rows: overallRows, isAcls: HAS_PRE_TEST })}
                      className="btn btn-ghost btn-block">
                      <FileText size={14} strokeWidth={2.2} /> สรุปรวม CSV
                    </button>
                    <button
                      onClick={() => exportCohortSummaryPDF({ rows: overallRows, className, classCode, isAcls: HAS_PRE_TEST })}
                      className="btn btn-primary btn-block">
                      <Download size={14} strokeWidth={2.2} /> สรุปรวม PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== แท็บ ทฤษฎี (รายบทเรียน + Pre/Post-test) ===== */}
          {tab === 'theory' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-overline text-text-muted px-1">ดูตามรายการ</div>
                <div className="flex flex-wrap gap-1.5">
                  {allEntries.map(l => {
                    const isAssessment = assessmentEntries.some(e => e.id === l.id);
                    const Icon = l.kind === 'pretest' ? Sparkles
                      : l.kind === 'posttest' ? Award
                      : null;
                    const active = selectedId === l.id;
                    return (
                      <button key={l.id} onClick={() => setSelectedId(l.id)}
                        className={`cohort-chip ${
                          active ? (isAssessment ? 'is-active-warning' : 'is-active-info') : ''
                        }`}>
                        {Icon && <Icon size={11} strokeWidth={2.4} />}
                        {l.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="text-center text-text-muted text-caption py-6">กำลังโหลด…</div>
              ) : (
                <CohortTable rows={rows} lesson={selected} onDeleteStudent={handleDelete} />
              )}

              <div className="space-y-1.5">
                <div className="text-overline text-text-muted px-1">ดาวน์โหลดเฉพาะรายการที่เลือก ({selected?.title || '—'})</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportCohortCSV({ rows, lesson: selected })}
                    disabled={!rows.length}
                    className="btn btn-ghost btn-block disabled:opacity-40">
                    <FileText size={14} strokeWidth={2.2} /> รายการนี้ CSV
                  </button>
                  <button
                    onClick={() => exportCohortPDF({ rows, lesson: selected })}
                    disabled={!rows.length}
                    className="btn btn-primary btn-block disabled:opacity-40">
                    <Download size={14} strokeWidth={2.2} /> รายการนี้ PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== แท็บ ปฏิบัติ (เช็คชื่อเข้าฐาน + ผลสอบปฏิบัติ + รางวัล) =====
              การ์ดพวกนี้ self-contained: ดึงข้อมูลผ่าน RPC ของตัวเองตอน mount
              → mount เฉพาะตอนเปิดแท็บ = ไม่ fetch ฟรีตอนอาจารย์ไม่ได้ดู */}
          {tab === 'practical' && (
            <div className="space-y-4">
              <CheckinCohortSummary classCode={classCode} />
              <AwardSummaryCard summary={summary} classCode={classCode} />
            </div>
          )}

          {/* ===== แท็บ เกม (Code Blue Sim + Recorder Hero) ===== */}
          {tab === 'games' && (
            <div className="space-y-4">
              <CodeBlueCohortSummary classCode={classCode} />
              {/* Recorder Hero — ACLS เท่านั้น (route กันไว้ด้วย IS_ACLS ใน App.jsx แล้ว) */}
              {IS_ACLS && <RecorderCohortSummary classCode={classCode} />}
            </div>
          )}
        </>
      )}

      <ClassGateModal
        open={gateMode !== null}
        initialMode={gateMode || 'home'}
        instructor
        onClose={() => setGateMode(null)}
      />

      {showQrFull && joinUrl && (
        <QrFullscreenOverlay
          joinUrl={joinUrl}
          classCode={classCode}
          classTitle={className}
          onClose={() => setShowQrFull(false)}
        />
      )}
    </div>
  );
}
