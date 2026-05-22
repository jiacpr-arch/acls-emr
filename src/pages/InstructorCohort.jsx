import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons } from '../data/activeLessons';
import { getCohortSummary, deleteStudent } from '../db/database';
import CohortTable from '../components/precourse/CohortTable';
import { exportCohortCSV, exportCohortPDF } from '../utils/exportPreCourse';
import { ChevronLeft, Users, Download, FileText, Trash } from 'lucide-react';

export default function InstructorCohort() {
  const navigate = useNavigate();
  const [lessonId, setLessonId] = useState(preCourseLessons[0]?.id);
  const [summary, setSummary] = useState([]);   // [{ student, lessons: {lid: {...}} }]
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ids = preCourseLessons.map(l => l.id);
    getCohortSummary(ids).then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, [reloadKey]);

  const refresh = () => setReloadKey(k => k + 1);

  const lesson = preCourseLessons.find(l => l.id === lessonId);
  const rows = summary.map(({ student, lessons }) => {
    const ls = lessons[lessonId] || {};
    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      read: !!ls.read,
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
    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      readCount, passedCount, total,
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
              <th className="px-3 py-2 text-center">อ่าน</th>
              <th className="px-3 py-2 text-center">ผ่าน</th>
            </tr>
          </thead>
          <tbody>
            {overallRows.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-text-muted">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-lesson selector */}
      <div className="space-y-2">
        <div className="text-overline text-text-muted px-1">ดูตามบทเรียน</div>
        <div className="flex flex-wrap gap-1.5">
          {preCourseLessons.map(l => (
            <button key={l.id} onClick={() => setLessonId(l.id)}
              className={`text-[11px] font-bold px-3 py-1.5 border ${
                lessonId === l.id
                  ? 'border-info bg-info text-white'
                  : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
              style={{ borderRadius: 99 }}>
              {l.title}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-text-muted text-caption py-6">กำลังโหลด…</div>
      ) : (
        <CohortTable rows={rows} lesson={lesson} onDeleteStudent={handleDelete} />
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => exportCohortCSV({ rows, lesson })}
          disabled={!rows.length}
          className="btn btn-ghost btn-block disabled:opacity-40">
          <FileText size={14} strokeWidth={2.2} /> Export CSV
        </button>
        <button
          onClick={() => exportCohortPDF({ rows, lesson })}
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
