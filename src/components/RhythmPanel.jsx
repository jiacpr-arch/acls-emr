import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { rhythms, getRhythmsByCategory } from '../data/rhythms';

const categories = [
  { id: 'cardiac_arrest', label: 'Cardiac Arrest', color: 'bg-danger' },
  { id: 'bradycardia', label: 'Bradycardia', color: 'bg-warning' },
  { id: 'tachycardia', label: 'Tachycardia', color: 'bg-shock' },
  { id: 'post_arrest', label: 'Post-ROSC', color: 'bg-success' },
];

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
    <div className="bg-bg-secondary rounded-xl p-3">
      {/* Current rhythm display */}
      {currentRhythm && (
        <div className={`mb-3 p-3 rounded-lg border-2 ${
          currentRhythm.shockable ? 'border-danger bg-danger/10' : 'border-warning bg-warning/10'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-bold">{currentRhythm.abbreviation}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              currentRhythm.shockable ? 'bg-danger text-white' : 'bg-warning text-black'
            }`}>
              {currentRhythm.shockable ? '⚡ SHOCKABLE' : '✕ NON-SHOCKABLE'}
            </span>
          </div>
          <p className="text-xs text-text-secondary">{currentRhythm.ecgDescription}</p>
          <div className="mt-2 space-y-1">
            {currentRhythm.actions.map((action, i) => (
              <div key={i} className="text-xs text-text-primary flex items-start gap-1">
                <span className="text-info">→</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rhythm selection */}
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Select Rhythm</div>
      <div className="space-y-2">
        {categories.map(cat => {
          const catRhythms = getRhythmsByCategory(cat.id);
          return (
            <div key={cat.id}>
              <div className="text-xs text-text-muted mb-1">{cat.label}</div>
              <div className="flex flex-wrap gap-1">
                {catRhythms.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      currentRhythm?.id === r.id
                        ? `${cat.color} text-white`
                        : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {r.abbreviation}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
