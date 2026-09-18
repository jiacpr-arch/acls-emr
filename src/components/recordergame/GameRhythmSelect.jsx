import { getRhythmsByCategory } from '../../data/rhythms';
import { Activity, X } from 'lucide-react';

// ==========================================
// Recorder Hero — โคลน RhythmSelectStep (เลือกจังหวะหัวใจ)
// reuse getRhythmsByCategory('cardiac_arrest') จริง — onSelect(rhythmId)
// ==========================================
export default function GameRhythmSelect({ onSelect, onClose }) {
  const arrestRhythms = getRhythmsByCategory('cardiac_arrest');
  // z-[70]: ต้องสูงกว่า .cbs-app (position:fixed, z-index:60 — root ของ RecorderStageAA)
  // ไม่งั้น sheet นี้จะ render ทับใต้ฉากเกม มองไม่เห็นและกดไม่ได้เลย
  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-md bg-bg-secondary p-4 space-y-3 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ borderTopLeftRadius: 'var(--radius-3xl)', borderTopRightRadius: 'var(--radius-3xl)' }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary inline-flex items-center gap-2">
            <Activity size={16} strokeWidth={2.4} /> เลือกจังหวะที่เห็นบน monitor
          </span>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {arrestRhythms.map(r => (
            <button key={r.id} onClick={() => onSelect(r.id)}
              className={`btn-action py-5 text-lg ${r.shockable ? 'btn-danger' : 'btn-warning'}`}>
              {r.abbreviation}
              <div className="text-3xs font-bold mt-1 opacity-80">{r.shockable ? '⚡ Shockable' : '→ CPR continue'}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
