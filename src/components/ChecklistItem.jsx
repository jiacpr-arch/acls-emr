import { Check as CheckIcon } from 'lucide-react';

// Shared checklist item rendered as a clearly tappable button.
// Unchecked: raised tile against the card; checked: solid green fill.
export default function ChecklistItem({ checked, onClick, label, sub }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 mb-2 rounded-xl text-left border shadow-sm transition-all active:scale-[0.98] ${
        checked
          ? 'bg-success border-success-dark text-white'
          : 'bg-bg-tertiary border-border-strong text-text-primary'
      }`}>
      <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border-2 ${
        checked ? 'bg-white border-white text-success' : 'bg-transparent border-text-muted text-transparent'
      }`}>
        <CheckIcon size={15} strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-bold">{label}</div>
        {sub && <div className={`text-[11px] ${checked ? 'text-white/85' : 'text-text-muted'}`}>{sub}</div>}
      </div>
    </button>
  );
}
