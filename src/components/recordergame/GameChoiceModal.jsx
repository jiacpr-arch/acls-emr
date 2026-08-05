import { Pill, X } from 'lucide-react';

// ==========================================
// Recorder Hero — ตัวเลือกยา/หัตถการทั่วไป (non-arrest)
// options: [{ id, label, detail }] — onSelect(id)
// ==========================================
export default function GameChoiceModal({ title_th = 'เลือกยา / หัตถการ', options = [], onSelect, onClose }) {
  // z-[70]: ต้องสูงกว่า .cbs-app (z-index:60) ไม่งั้น sheet นี้จะโดนฉากเกมบังจนกดไม่ได้
  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-md bg-bg-secondary p-4 space-y-2 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ borderTopLeftRadius: 'var(--radius-3xl)', borderTopRightRadius: 'var(--radius-3xl)' }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary inline-flex items-center gap-2">
            <Pill size={16} strokeWidth={2.4} /> {title_th}
          </span>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="space-y-2">
          {options.map(o => (
            <button key={o.id} onClick={() => onSelect(o.id)}
              className="w-full btn-action btn-ghost py-3 text-sm text-left px-4">
              <div className="font-bold">{o.label}</div>
              {o.detail && <div className="text-3xs font-normal opacity-70 mt-0.5">{o.detail}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
