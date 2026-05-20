import { Check, X, Trash } from 'lucide-react';

export default function CohortTable({ rows, lesson, onDeleteStudent }) {
  if (!rows.length) {
    return (
      <div className="dash-card text-center !p-6 text-caption text-text-muted">
        ยังไม่มีนักเรียนทำ pre-course ในเครื่องนี้
      </div>
    );
  }
  return (
    <div className="dash-card !p-0 overflow-x-auto">
      <table className="w-full text-caption">
        <thead className="bg-bg-tertiary text-text-secondary">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">รหัส</th>
            <th className="px-3 py-2 text-left">ชื่อ</th>
            <th className="px-3 py-2 text-center">อ่าน</th>
            <th className="px-3 py-2 text-center">ครั้งที่ทำ</th>
            <th className="px-3 py-2 text-center">คะแนนสูงสุด</th>
            <th className="px-3 py-2 text-center">ผลลัพธ์</th>
            <th className="px-3 py-2 text-left">ครั้งล่าสุด</th>
            {onDeleteStudent && <th className="px-3 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-3 py-2 text-text-muted">{i + 1}</td>
              <td className="px-3 py-2 font-mono text-text-secondary">{r.studentId}</td>
              <td className="px-3 py-2 text-text-primary">{r.name}</td>
              <td className="px-3 py-2 text-center">
                {r.read
                  ? <Check size={14} strokeWidth={2.4} className="inline text-success" />
                  : <X size={14} strokeWidth={2.4} className="inline text-text-muted" />}
              </td>
              <td className="px-3 py-2 text-center text-text-secondary">{r.attemptCount}</td>
              <td className={`px-3 py-2 text-center font-bold ${
                r.bestScore == null ? 'text-text-muted'
                  : r.passed ? 'text-success' : 'text-warning'
              }`}>
                {r.bestScore != null ? `${r.bestScore}%` : '-'}
              </td>
              <td className="px-3 py-2 text-center">
                {r.bestScore == null ? (
                  <span className="text-text-muted">-</span>
                ) : r.passed ? (
                  <span className="text-[10px] font-bold bg-success/15 text-success px-2 py-0.5"
                    style={{ borderRadius: 99 }}>PASS</span>
                ) : (
                  <span className="text-[10px] font-bold bg-warning/15 text-warning px-2 py-0.5"
                    style={{ borderRadius: 99 }}>FAIL</span>
                )}
              </td>
              <td className="px-3 py-2 text-[11px] text-text-muted">
                {r.lastAttemptAt
                  ? new Date(r.lastAttemptAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '-'}
              </td>
              {onDeleteStudent && (
                <td className="px-2 py-2 text-right">
                  <button
                    onClick={() => onDeleteStudent(r)}
                    className="w-7 h-7 inline-flex items-center justify-center text-danger hover:bg-danger/10"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    title="ลบนักเรียน">
                    <Trash size={13} strokeWidth={2.2} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] text-text-muted border-t border-border">
        {lesson?.title || ''} · เกณฑ์ผ่าน {lesson?.passingScore ?? 70}%
      </div>
    </div>
  );
}
