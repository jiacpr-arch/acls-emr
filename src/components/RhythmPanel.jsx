import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { getRhythmsByCategory } from '../data/rhythms';
import { Zap, X, Activity, ArrowRight } from 'lucide-react';

const categories = [
  { id: 'cardiac_arrest', label: 'Cardiac Arrest', tone: 'danger' },
  { id: 'bradycardia', label: 'Bradycardia', tone: 'warning' },
  { id: 'tachycardia', label: 'Tachycardia', tone: 'shock' },
  { id: 'post_arrest', label: 'Post-ROSC', tone: 'success' },
];

const toneClass = {
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-white',
  shock: 'bg-shock text-white',
  success: 'bg-success text-white',
};

export default function RhythmPanel() {
  const { currentRhythm, setRhythm, addEvent } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);

  const handleSelect = (rhythm) => {
    setRhythm(rhythm);
    addEvent({
      elapsed,
      category: 'rhythm',
      type: 'Rhythm Change',
      details: { rhythmId: rhythm.id, rhythmName: rhythm.name, shockable: rhythm.shockable }
    });
  };

  return (
    <div className="dash-card !p-3">
      {/* Current rhythm display */}
      {currentRhythm && (
        <div className={`mb-3 p-3 border-2 ${
          currentRhythm.shockable ? 'border-danger bg-danger/10' : 'border-warning bg-warning/10'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-headline font-bold inline-flex items-center gap-2">
              <Activity size={16} strokeWidth={2.4} /> {currentRhythm.abbreviation}
            </span>
            <span className={`badge ${
              currentRhythm.shockable ? 'bg-danger text-white' : 'bg-warning text-white'
            }`}>
              {currentRhythm.shockable ? <><Zap size={11} strokeWidth={2.4} /> SHOCKABLE</> : <><X size={11} strokeWidth={2.4} /> NON-SHOCKABLE</>}
            </span>
          </div>
          <p className="text-caption text-text-secondary">{currentRhythm.ecgDescription}</p>
          <div className="mt-2 space-y-1">
            {currentRhythm.actions.map((action, i) => (
              <div key={i} className="text-caption text-text-primary flex items-start gap-1.5">
                <ArrowRight size={12} strokeWidth={2.4} className="text-info shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rhythm selection */}
      <div className="text-overline mb-2">Select Rhythm</div>
      <div className="space-y-2">
        {categories.map(cat => {
          const catRhythms = getRhythmsByCategory(cat.id);
          return (
            <div key={cat.id}>
              <div className="text-[11px] text-text-muted mb-1 font-medium">{cat.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {catRhythms.map(r => {
                  const active = currentRhythm?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className={`px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
                        active
                          ? toneClass[cat.tone]
                          : 'bg-bg-tertiary text-text-secondary hover:bg-border-strong hover:text-text-primary'
                      }`}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      {r.abbreviation}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
