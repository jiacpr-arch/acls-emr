import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons } from '../data/activeLessons';
import { getCohortSummary, deleteStudent } from '../db/database';
import {
  PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT,
} from '../data/assessment';
import {
  POST_TEST_LESSON_ID, POST_TEST_PASS_PERCENT,
} from '../data/activePostTest';
import { IS_ACLS } from '../config/courseMode';
import CohortTable from '../components/precourse/CohortTable';
import { exportCohortCSV, exportCohortPDF } from '../utils/exportPreCourse';
import { ChevronLeft, Users, Download, FileText, Trash, Sparkles, Award } from 'lucide-react';

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

  useEffect(() => {
    const ids = allEntries.map(l => l.id);
    getCohortSummary(ids).then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, [reloadKey, allEntries]);

  const refresh = () => setReloadKey(k => k + 1);

  const selected = allEntries.find(l => l.id === selectedId);
  const isAssessmentView = assessmentEntries.some(e => e.id === selectedId);

  const rows = summary.map(({ student, lessons }) => {
    const ls = lessons[selectedId] || {};
    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
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
    refresh();
  };

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course')}
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary">
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
            รวบรวมจากเครื่องนี้ · {summary.length} นักเรียน
          </p>
        </div>
      </div>

      {/* Overall summary */}
      <div className="dash-card !p-0 overflow-x-auto">
        <table className="w-full text-caption">
          <thead className="bg-bg-tertiary text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">รหัส</th>
              <th className="px-3 py-2 text-left">ชื่อ</th>
              <th className="px-3 py-2 text-center">บทเรียน อ่าน</th>
              <th className="px-3 py-2 text-center">บทเรียน ผ่าน</th>
              {IS_ACLS && <th className="px-3 py-2 text-center">Pre-test</th>}
              <th className="px-3 py-2 text-center">Post-test</th>
            </tr>
          </thead>
          <tbody>
            {overallRows.length === 0 ? (
              <tr><td colSpan={IS_ACLS ? 6 : 5} className="px-3 py-6 text-center text-text-muted">
                ยังไม่มีนักเรียน
              </td></tr>
            ) : overallRows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-text-secondary">{r.studentId}</td>
                <td className="px-3 py-2 text-text-primary">{r.name}</td>
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
                className={`text-[11px] font-bold px-3 py-1.5 border inline-flex items-center gap-1 ${
                  active
                    ? isAssessment ? 'border-warning bg-warning text-white' : 'border-info bg-info text-white'
                    : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
                style={{ borderRadius: 99 }}>
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

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => exportCohortCSV({ rows, lesson: selected })}
          disabled={!rows.length}
          className="btn btn-ghost btn-block disabled:opacity-40">
          <FileText size={14} strokeWidth={2.2} /> Export CSV
        </button>
        <button
          onClick={() => exportCohortPDF({ rows, lesson: selected })}
          disabled={!rows.length}
          className="btn btn-primary btn-block disabled:opacity-40">
          <Download size={14} strokeWidth={2.2} /> Export PDF
        </button>
      </div>

      {summary.length > 0 && (
        <button
          onClick={async () => {
            if (!confirm('ลบนักเรียนและผล Pre-course ทั้งหมดในเครื่องนี้?')) return;
            for (const { student } of summary) await deleteStudent(student.id);
            refresh();
          }}
          className="btn btn-ghost btn-sm btn-block text-danger">
          <Trash size={13} strokeWidth={2.2} /> ล้างข้อมูลทั้งหมด
        </button>
      )}
    </div>
  );
}
