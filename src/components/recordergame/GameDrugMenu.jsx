import { QUICK_DRUGS } from '../../data/arrestDrugs';
import { Syringe, X } from 'lucide-react';

// ==========================================
// Recorder Hero — โคลน DrugStep (เมนูให้ยา) — onSelect(drugId)
// Epi ปุ่มม่วงใหญ่ + Amiodarone 300 + QUICK_DRUGS grid (ข้อมูลจริง)
// ==========================================
export default function GameDrugMenu({ onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-md bg-bg-secondary p-4 space-y-3 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ borderTopLeftRadius: 'var(--radius-3xl)', borderTopRightRadius: 'var(--radius-3xl)' }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary inline-flex items-center gap-2">
            <Syringe size={16} strokeWidth={2.4} /> เลือกยาที่ให้
          </span>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm"><X size={16} /></button>
        </div>

        <button onClick={() => onSelect('epinephrine_arrest')}
          className="w-full btn-action btn-purple py-3.5 text-sm text-left px-4">
          <div className="font-bold">💉 Epinephrine 1mg IV</div>
          <div className="text-3xs font-normal opacity-80">1:10,000 → push fast → flush 20ml → q3-5 min</div>
        </button>

        <button onClick={() => onSelect('amiodarone_first')}
          className="w-full btn-action btn-info py-3.5 text-sm text-left px-4">
          <div className="font-bold">💊 Amiodarone 300mg IV</div>
          <div className="text-3xs font-normal opacity-80">+D5W 4ml → push 1-3min → flush NSS 20ml</div>
        </button>

        <div className="grid grid-cols-3 gap-2">
          {QUICK_DRUGS.map(d => (
            <button key={d.id} onClick={() => onSelect(d.id)}
              className="btn-action btn-ghost py-2.5 text-3xs">
              <div className="font-bold">{d.label}</div>
              <div className="opacity-70 leading-tight mt-0.5">{d.detail}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
