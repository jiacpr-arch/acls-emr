import { useState } from 'react';
import { Download } from 'lucide-react';
import EvalItemRow from './EvalItemRow';
import { evaluateChecklist, getAllItems } from '../../data/megacodeChecklists';
import { exportMegacodeChecklistPDF } from '../../utils/exportPDF';

// Instructor/evaluator mode — recreates the paper Megacode evaluation form
// digitally: header fields, per-step pass/fail ticks, live PASS/FAIL result,
// notes, and PDF export (no persistence — fill in, export, done).
export default function MegacodeChecklistForm({ checklist }) {
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attempt, setAttempt] = useState('first');
  const [retakeNumber, setRetakeNumber] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [notes, setNotes] = useState('');

  const setStatus = (itemId, value) => {
    setStatusMap(prev => ({ ...prev, [itemId]: value }));
  };

  const result = evaluateChecklist(checklist, statusMap);

  const handleExport = () => {
    exportMegacodeChecklistPDF(checklist, {
      studentName, department, evaluatorName, date, attempt, retakeNumber, notes, statusMap, result,
    });
  };

  const itemIndex = new Map(getAllItems(checklist).map((item, i) => [item.id, i + 1]));

  return (
    <div className="space-y-4">
      <div className="dash-card space-y-3">
        <div className="section-header">ข้อมูลการประเมิน</div>
        <label className="block">
          <span className="text-caption font-semibold text-text-secondary">ชื่อผู้เข้ารับการประเมิน (Team Leader)</span>
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
            placeholder="เช่น อนันต์ ใจดี" className="w-full text-body mt-1" />
        </label>
        <label className="block">
          <span className="text-caption font-semibold text-text-secondary">หน่วยงาน</span>
          <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
            className="w-full text-body mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">วันที่ประเมิน</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full text-body mt-1" />
          </label>
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">ผู้ประเมิน</span>
            <input type="text" value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)}
              className="w-full text-body mt-1" />
          </label>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
            <input type="radio" checked={attempt === 'first'} onChange={() => setAttempt('first')} /> ครั้งแรก
          </label>
          <label className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
            <input type="radio" checked={attempt === 'retake'} onChange={() => setAttempt('retake')} /> สอบซ่อมครั้งที่
          </label>
          {attempt === 'retake' && (
            <input type="text" value={retakeNumber} onChange={e => setRetakeNumber(e.target.value)}
              className="text-body w-16" placeholder="#" />
          )}
        </div>
      </div>

      <div className="glass-card !p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">{result.passedCount}/{result.totalItems} ปฏิบัติได้</span>
          <span className={`text-xs font-bold ${result.passed ? 'text-success' : 'text-warning'}`}>{result.percent}%</span>
        </div>
        <div className="progress-track !h-2">
          <div className={`progress-fill ${result.passed ? 'bg-success' : 'bg-info'}`} style={{ width: `${result.percent}%` }} />
        </div>
      </div>

      {checklist.sections.map(section => (
        <div key={section.title} className="dash-card !p-3 text-left space-y-1">
          <div className="section-header">{section.title}</div>
          {section.items.map(item => (
            <EvalItemRow key={item.id} index={itemIndex.get(item.id)} text={item.text} critical={item.critical}
              status={statusMap[item.id]} onChange={(v) => setStatus(item.id, v)} />
          ))}
        </div>
      ))}

      <div className={`dash-card !p-4 text-center space-y-1 border-2 ${result.passed ? 'border-success/40' : 'border-danger/40'}`}>
        <div className="text-2xs text-text-muted uppercase tracking-wide">ผลการประเมิน</div>
        <div className={`text-2xl font-black ${result.passed ? 'text-success' : 'text-danger'}`}>
          {result.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
        </div>
        <div className="text-caption text-text-muted">
          ปฏิบัติได้ {result.passedCount}/{result.totalItems} ข้อ (ต้อง ≥ {result.minPassed}) · ข้อวิกฤต: {result.criticalPassed ? 'ผ่านครบ ✓' : `ขาด ${result.missedCritical.length} ข้อ`}
        </div>
      </div>

      <div className="dash-card !p-3 space-y-2">
        <div className="section-header">ข้อเสนอแนะของผู้ประเมิน</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className="w-full text-body" placeholder="ข้อเสนอแนะ..." />
      </div>

      <button onClick={handleExport} className="w-full btn-action btn-info py-3.5 text-sm font-bold flex items-center justify-center gap-2">
        <Download size={16} strokeWidth={2.4} /> Export PDF
      </button>
    </div>
  );
}
