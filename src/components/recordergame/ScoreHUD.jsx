import { Star, Flame, Timer } from 'lucide-react';
import { RATING_META } from '../../utils/recorderGameScore';

// ==========================================
// Recorder Hero — แถบคะแนนบนสุด + popup rating (Mode A)
// ==========================================
export default function ScoreHUD({ score, streak, elapsed, popup, durationSec }) {
  const secs = Math.floor(elapsed || 0);
  const pct = durationSec ? Math.min(100, (secs / durationSec) * 100) : 0;

  return (
    <div className="relative">
      <div className="bg-bg-secondary border-2 border-text-primary p-2 flex items-center gap-2 text-2xs font-bold">
        <span className="text-warning inline-flex items-center gap-1">
          <Star size={12} strokeWidth={2.4} fill="currentColor" /> {score}
        </span>
        <span className="text-purple inline-flex items-center gap-1">
          <Flame size={12} strokeWidth={2.4} /> x{streak}
        </span>
        <span className="font-mono inline-flex items-center gap-1 ml-auto text-text-secondary">
          <Timer size={12} strokeWidth={2.4} /> {secs}s
        </span>
      </div>
      <div className="h-1.5 bg-bg-tertiary border border-text-primary overflow-hidden mt-1">
        <div className="h-full bg-info" style={{ width: `${pct}%`, transition: 'width 0.2s linear' }} />
      </div>

      {/* Rating popup */}
      {popup && (
        <div key={popup.id}
          className="absolute left-1/2 -translate-x-1/2 top-10 z-40 animate-slide-up pointer-events-none">
          <div className={`px-4 py-2 bg-bg-primary border-2 border-text-primary font-black text-sm text-center ${RATING_META[popup.rating]?.color || 'text-text-primary'}`}
            style={{ boxShadow: 'var(--shadow-pop)' }}>
            {popup.text}
          </div>
        </div>
      )}
    </div>
  );
}
