import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons } from '../data/activeLessons';
import { getCohortSummary, deleteStudent } from '../db/database';
import { useClassStore } from '../stores/classStore';
import { rpcGetCohortSummary, rpcDeleteCohortStudent } from '../services/cohortSync';
import { scheduleFlush, getPendingCount, subscribeToSync } from '../services/syncEngine';
import {
  PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT,
} from '../data/assessment';
import {
  POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT,
} from '../data/activePostTest';
import { IS_ACLS } from '../config/courseMode';
import CohortTable from '../components/precourse/CohortTable';
import ClassGateModal from '../components/precourse/ClassGateModal';
import {
  exportCohortCSV, exportCohortPDF,
  exportCohortSummaryCSV, exportCohortSummaryPDF,
} from '../utils/exportPreCourse';
import {
  ChevronLeft, Users, Download, FileText, Trash, Sparkles, Award,
  Cloud, CloudOff, RefreshCw, Copy, Check, Plus, KeyRound,
} from 'lucide-react';

export default function InstructorCohort() {
  const navigate = useNavigate();

  // Virtual "lessons" so the existing CohortTable + per-id selector keep working.
  // Pre-test is ACLS-only; Post-test exists in both modes (different content per mode).
  const assessmentEntries = useMemo(() => {
    const list = [];
    if (IS_ACLS) {
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

  const [selectedId, setSelectedId] = useState(preCourseLessons[0]?.id ?? assessmentEntries[0]?.id);
  const [summary, setSummary] = useState([]);   // [{ student, lessons: {lid: {...}} }]
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [source, setSource] = useState('local');  // 'cloud' | 'local'
  const [pendingCount, setPendingCount] = useState(0);
  // Class setup happens right here on the instructor page — no need to hunt
  // for the tiny "create class" link buried in the student-facing gate modal.
  const [gateMode, setGateMode] = useState(null); // null | 'create' | 'join'
  const [copiedCode, setCopiedCode] = useState(false);

  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);
  const syncDisabled = useClassStore(s => s.syncDisabled);

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
          setLoading(false);
          return;
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
  }, [reloadKey, allEntries, classCode, syncDisabled]);

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

  const copyClassCode = () => {
    if (!classCode) return;
    navigator.clipboard?.writeText(classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
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

  const handleDelete = async (r) => {
    if (!confirm(`ลบนักเรียน ${r.name} (${r.studentId}) และผลทั้งหมด?`)) return;
    await deleteStudent(r.id);
    if (classCode && !syncDisabled) {
      await rpcDeleteCohortStudent(r.id);
    }
    refresh();
  };

  return (
    <div className="page-container space-y-5">
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
        <a
          href={`${import.meta.env.BASE_URL}instructor-cohort-guide.pdf`}
          target="_blank" rel="noopener noreferrer" download
          className="btn btn-ghost btn-sm shrink-0">
          <FileText size={14} strokeWidth={2.2} /> คู่มือ (PDF)
        </a>
      </div>

      {/* Class card — create / join / share the class code without leaving
          this page. Previously instructors had to find a tiny link inside the
          student-facing modal on /pre-course, which nobody could locate. */}
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
              <div className="text-[11px] text-text-muted">
                แจกรหัสด้านล่างให้นักเรียนใช้เข้าคลาส
              </div>
            </div>
          </div>
          <div className="bg-bg-tertiary p-3 flex items-center justify-between gap-3"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="min-w-0">
              <div className="text-overline text-text-muted">รหัสคลาส</div>
              <div className="text-2xl font-mono font-bold tracking-[0.25em] text-text-primary">
                {classCode}
              </div>
            </div>
            <button onClick={copyClassCode} className="btn btn-ghost btn-sm shrink-0">
              {copiedCode
                ? <><Check size={13} strokeWidth={2.4} /> คัดลอกแล้ว</>
                : <><Copy size={13} strokeWidth={2.2} /> คัดลอก</>}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setGateMode('create')} className="btn btn-ghost btn-sm">
              <Plus size={13} strokeWidth={2.4} /> สร้างคลาสใหม่
            </button>
            <button onClick={() => setGateMode('join')} className="btn btn-ghost btn-sm">
              <KeyRound size={13} strokeWidth={2.2} /> ใส่รหัสคลาสอื่น
            </button>
          </div>
        </div>
      ) : (
        <div className="dash-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 inline-flex items-center justify-center bg-warning/12 text-warning shrink-0"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <CloudOff size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary">ยังไม่ได้เชื่อมต่อคลาส</div>
              <div className="text-[11px] text-text-muted">
                สร้างคลาสก่อน ผลของนักเรียนถึงจะรวมมาแสดงหน้านี้
              </div>
            </div>
          </div>
          <ol className="text-caption text-text-secondary space-y-1 list-none">
            {[
              'สร้างคลาส → ได้รหัสคลาส 6 หลัก',
              'แจกรหัสให้นักเรียนใช้ "เข้าคลาส" บนเครื่องของตัวเอง',
              'ผลเรียน/คะแนนสอบของทุกคนจะขึ้นหน้านี้อัตโนมัติ',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] shrink-0 bg-info text-white text-[10px] font-extrabold mt-px"
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
            <KeyRound size={14} strokeWidth={2.4} /> มีรหัสคลาสอยู่แล้ว? เชื่อมต่อด้วยรหัส
          </button>
        </div>
      )}

      {/* Sync status bar */}
      <div className="dash-card flex items-center gap-3 !py-2">
        {source === 'cloud' ? (
          <div className="inline-flex items-center gap-1.5 text-caption text-info">
            <Cloud size={14} strokeWidth={2.2} /> ข้อมูลจาก cloud
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-caption text-text-muted">
            <CloudOff size={14} strokeWidth={2.2} />
            {classCode ? 'แสดงข้อมูล cached (offline)' : 'โหมด offline เท่านั้น'}
          </div>
        )}
        {pendingCount > 0 && (
          <div className="text-caption text-warning">
            · ยังไม่ sync {pendingCount} รายการ
          </div>
        )}
        <div className="flex-1" />
        {classCode && !syncDisabled && (
          <button onClick={handleSyncNow}
            className="btn btn-ghost btn-sm">
            <RefreshCw size={13} strokeWidth={2.2} /> Sync ตอนนี้
          </button>
        )}
      </div>

      {/* Overall summary */}
      <div className="dash-card !p-0 overflow-x-auto">
        <table className="w-full text-caption">
          <thead className="bg-bg-tertiary text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">รหัส</th>
              <th className="px-3 py-2 text-left">ชื่อ</th>
              <th className="px-3 py-2 text-left">เบอร์โทร</th>
              <th className="px-3 py-2 text-center">บทเรียน อ่าน</th>
              <th className="px-3 py-2 text-center">บทเรียน ผ่าน</th>
              {IS_ACLS && <th className="px-3 py-2 text-center">Pre-test</th>}
              <th className="px-3 py-2 text-center">Post-test</th>
            </tr>
          </thead>
          <tbody>
            {overallRows.length === 0 ? (
              <tr><td colSpan={IS_ACLS ? 7 : 6} className="px-3 py-6 text-center text-text-muted">
                ยังไม่มีนักเรียน
              </td></tr>
            ) : overallRows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-text-secondary">{r.studentId}</td>
                <td className="px-3 py-2 text-text-primary">{r.name}</td>
                <td className="px-3 py-2 font-mono text-text-secondary">{r.phone || '-'}</td>
                <td className="px-3 py-2 text-center text-text-secondary">{r.readCount}/{r.total}</td>
                <td className={`px-3 py-2 text-center font-bold ${
                  r.passedCount === r.total ? 'text-success' : 'text-warning'
                }`}>{r.passedCount}/{r.total}</td>
                {IS_ACLS && (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Overall summary export — the one-file report an instructor submits to a committee */}
      {overallRows.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-overline text-text-muted px-1">ดาวน์โหลดสรุปผลรวม (สำหรับส่งคณะกรรมการ)</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => exportCohortSummaryCSV({ rows: overallRows, isAcls: IS_ACLS })}
              className="btn btn-ghost btn-block">
              <FileText size={14} strokeWidth={2.2} /> สรุปรวม CSV
            </button>
            <button
              onClick={() => exportCohortSummaryPDF({ rows: overallRows, className, classCode, isAcls: IS_ACLS })}
              className="btn btn-primary btn-block">
              <Download size={14} strokeWidth={2.2} /> สรุปรวม PDF
            </button>
          </div>
        </div>
      )}

      {/* Per-entry selector */}
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

      {summary.length > 0 && (
        <button
          onClick={async () => {
            if (!confirm('ลบนักเรียนและผล Pre-course ทั้งหมดในเครื่องนี้?')) return;
            for (const { student } of summary) {
              await deleteStudent(student.id);
              if (classCode && !syncDisabled) {
                await rpcDeleteCohortStudent(student.id);
              }
            }
            refresh();
          }}
          className="btn btn-ghost btn-sm btn-block text-danger">
          <Trash size={13} strokeWidth={2.2} /> ล้างข้อมูลทั้งหมด
        </button>
      )}

      <ClassGateModal
        open={gateMode !== null}
        initialMode={gateMode || 'home'}
        onClose={() => setGateMode(null)}
      />
    </div>
  );
}
