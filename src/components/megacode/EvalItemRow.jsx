import { Check, X, Star } from 'lucide-react';

// Single evaluation row: step text + explicit pass/fail buttons (tri-state —
// unset until the evaluator/student taps one). Mirrors the paper form's two
// checkbox columns ("ปฏิบัติได้" / "ไม่ได้ปฏิบัติ") rather than ChecklistItem's
// single on/off tick, since a fail must be recorded explicitly, not just
// "not yet checked".
export default function EvalItemRow({ index, text, critical, status, onChange }) {
  return (
    <div className={`rounded-xl border-2 px-3 py-2.5 mb-2 transition-colors ${
      status === true ? 'bg-success/10 border-success/40'
        : status === false ? 'bg-danger/10 border-danger/40'
        : 'bg-bg-tertiary dark:bg-[#2A3850] border-border-strong'
    }`}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xs font-mono font-bold text-text-muted shrink-0 mt-0.5">{index}.</span>
        <div className="flex-1 text-sm text-text-primary leading-snug">
          {text}
          {critical && (
            <Star size={12} strokeWidth={2.4} fill="currentColor" className="inline-block ml-1.5 mb-0.5 text-warning" />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onChange(true)}
          className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold border-2 transition-colors active:scale-[0.97] ${
            status === true ? 'bg-success border-success-dark text-white' : 'bg-bg-secondary border-border text-text-secondary'
          }`}>
          <Check size={14} strokeWidth={2.6} /> ปฏิบัติได้
        </button>
        <button onClick={() => onChange(false)}
          className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold border-2 transition-colors active:scale-[0.97] ${
            status === false ? 'bg-danger border-danger-dark text-white' : 'bg-bg-secondary border-border text-text-secondary'
          }`}>
          <X size={14} strokeWidth={2.6} /> ไม่ได้ปฏิบัติ
        </button>
      </div>
    </div>
  );
}
