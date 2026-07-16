import { useState } from 'react';
import { Check, X, Star, RefreshCw, Trophy, AlertTriangle, Download, ChevronLeft } from 'lucide-react';
import { getAllItems, evaluateChecklist } from '../../data/megacodeChecklists';
import { exportMegacodeChecklistPDF } from '../../utils/exportPDF';

// Student self-check mode — a sim-code-style step-through game. One item at
// a time, instant feedback (critical steps get a highlighted callout),
// progress bar, and a scored PASS/FAIL result screen at the end. Purely
// local state — nothing is submitted or saved, matching the "just fill in /
// print" requirement.
export default function MegacodeChecklistGame({ checklist, onExit }) {
  const allItems = getAllItems(checklist);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [statusMap, setStatusMap] = useState({});
  const [finished, setFinished] = useState(false);

  const currentItem = allItems[currentIdx];
  const currentSection = checklist.sections.find(s => s.items.some(i => i.id === currentItem?.id));
  const answered = currentItem ? statusMap[currentItem.id] !== undefined : false;

  const mark = (value) => {
    if (!currentItem) return;
    setStatusMap(prev => ({ ...prev, [currentItem.id]: value }));
  };

  const next = () => {
    if (currentIdx < allItems.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setStatusMap({});
    setCurrentIdx(0);
    setFinished(false);
  };

  if (finished) {
    return <ResultScreen checklist={checklist} statusMap={statusMap} onRetry={restart} onExit={onExit} />;
  }

  if (!currentItem) return null;

  return (
    <div className="space-y-4">
      {/* Progress dots */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-2xs font-semibold text-text-muted uppercase tracking-wide">{currentSection?.title}</span>
          <span className="text-2xs font-mono font-bold text-text-muted">{currentIdx + 1}/{allItems.length}</span>
        </div>
        <div className="flex gap-1">
          {allItems.map((item, i) => (
            <div key={item.id} className={`h-1.5 flex-1 rounded-full ${
              i < currentIdx ? (statusMap[item.id] === true ? 'bg-success' : 'bg-danger')
                : i === currentIdx ? 'bg-info animate-pulse'
                : 'bg-bg-tertiary'
            }`} />
          ))}
        </div>
      </div>

      {/* Step card */}
      <div className="dash-card !p-4 space-y-3 text-center">
        {currentItem.critical && (
          <div className="inline-flex items-center gap-1 text-warning text-2xs font-bold bg-warning/10 px-2 py-1 rounded-full mx-auto">
            <Star size={12} strokeWidth={2.6} fill="currentColor" /> ขั้นตอนวิกฤต (Critical Step)
          </div>
        )}
        <div className="text-body-strong text-text-primary leading-snug">{currentItem.text}</div>

        {!answered ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => mark(true)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-success/40 bg-success/10 text-success font-bold active:scale-[0.97] transition-transform">
              <Check size={20} strokeWidth={2.6} /> ทำแล้ว
            </button>
            <button onClick={() => mark(false)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-danger/40 bg-danger/10 text-danger font-bold active:scale-[0.97] transition-transform">
              <X size={20} strokeWidth={2.6} /> ยังไม่ได้ทำ
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className={`px-3 py-2 rounded-lg text-caption font-semibold ${
              statusMap[currentItem.id]
                ? 'bg-success/10 text-success'
                : currentItem.critical
                  ? 'bg-danger/10 text-danger'
                  : 'bg-warning/10 text-warning'
            }`}>
              {statusMap[currentItem.id]
                ? '✔ บันทึกว่าทำแล้ว'
                : currentItem.critical
                  ? '✖ ขั้นตอนวิกฤตนี้ยังไม่ได้ทำ — จะทำให้ไม่ผ่านการประเมิน'
                  : '✖ บันทึกว่ายังไม่ได้ทำ'}
            </div>
            <button onClick={next} className="btn btn-info btn-lg btn-block">
              {currentIdx < allItems.length - 1 ? 'ขั้นตอนถัดไป' : 'ดูผลสรุป'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ checklist, statusMap, onRetry, onExit }) {
  const result = evaluateChecklist(checklist, statusMap);
  const [studentName, setStudentName] = useState('');

  const handleExport = () => {
    exportMegacodeChecklistPDF(checklist, {
      studentName, department: '', evaluatorName: '', date: new Date().toISOString().slice(0, 10),
      attempt: 'first', retakeNumber: '', notes: '', statusMap, result,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in text-center">
      <div
        className="w-16 h-16 mx-auto inline-flex items-center justify-center"
        style={{
          background: result.passed
            ? 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%)'
            : 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: result.passed ? '0 8px 20px rgba(5, 150, 105, 0.32)' : '0 8px 20px rgba(220, 38, 38, 0.32)',
        }}
      >
        {result.passed ? <Trophy size={28} strokeWidth={2.4} className="text-white" />
                       : <AlertTriangle size={28} strokeWidth={2.4} className="text-white" />}
      </div>
      <div>
        <h2 className="text-title text-text-primary">เช็คลิสต์เสร็จสมบูรณ์!</h2>
        <p className="text-caption text-text-secondary mt-0.5">{checklist.title}</p>
      </div>

      <div className="dash-card !p-5">
        <div className={`text-numeric text-4xl ${result.passed ? 'text-success' : 'text-danger'}`}>
          {result.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
        </div>
        <div className="text-caption text-text-muted mt-1">
          ปฏิบัติได้ {result.passedCount}/{result.totalItems} ข้อ ({result.percent}%) · ต้อง ≥ {result.minPassed}
        </div>
      </div>

      {result.missedCritical.length > 0 && (
        <div className="dash-card !p-3 text-left space-y-1.5">
          <div className="section-header text-danger">ขั้นตอนวิกฤตที่พลาด</div>
          {result.missedCritical.map(item => (
            <div key={item.id} className="flex items-start gap-1.5 text-2xs text-text-secondary">
              <Star size={11} strokeWidth={2.4} fill="currentColor" className="text-warning shrink-0 mt-0.5" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="dash-card !p-3 space-y-2 text-left">
        <label className="block">
          <span className="text-caption font-semibold text-text-secondary">ชื่อ (ถ้าต้องการพิมพ์ผลลัพธ์)</span>
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
            className="w-full text-body mt-1" placeholder="เช่น อนันต์ ใจดี" />
        </label>
      </div>

      <div className="space-y-2">
        <button onClick={onRetry} className="btn btn-info btn-lg btn-block">
          <RefreshCw size={16} strokeWidth={2.2} /> ลองใหม่
        </button>
        <button onClick={handleExport} className="btn btn-success btn-lg btn-block">
          <Download size={16} strokeWidth={2.2} /> ส่งออกเป็น PDF
        </button>
        {onExit && (
          <button onClick={onExit} className="btn btn-ghost btn-block">
            <ChevronLeft size={14} strokeWidth={2.2} /> กลับเมนู
          </button>
        )}
      </div>
    </div>
  );
}
