import { Check as CheckIcon } from 'lucide-react';

// Tones for the checked (on) fill. Class names are spelled out in full so
// Tailwind can detect them.
const TONES = {
  success: 'bg-success border-success-dark',
  danger: 'bg-danger border-danger-dark',
  warning: 'bg-warning border-warning-dark',
  info: 'bg-info border-info-dark',
};
const BADGE_TEXT = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

// Shared "tick" control: the whole row is a clearly tappable button that
// changes color when selected. Unchecked is a raised slate tile (kept
// distinctly lighter than the card in dark mode); checked fills solid color.
export default function ChecklistItem({ checked, onClick, label, sub, tone = 'success' }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 mb-2 rounded-xl text-left border-2 shadow-sm transition-all active:scale-[0.97] ${
        checked
          ? `${TONES[tone]} text-white`
          : 'bg-bg-tertiary dark:bg-[#2A3850] border-border-strong text-text-primary'
      }`}>
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-2 ${
        checked ? `bg-white border-white ${BADGE_TEXT[tone]}` : 'bg-bg-secondary border-text-muted text-transparent'
      }`}>
        <CheckIcon size={18} strokeWidth={3} />
      </span>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-bold leading-tight">{label}</div>
        {sub && <div className={`text-[11px] leading-snug mt-0.5 ${checked ? 'text-white/85' : 'text-text-muted'}`}>{sub}</div>}
      </div>
    </button>
  );
}
