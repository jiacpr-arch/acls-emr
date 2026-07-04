import { getRhythmsByCategory } from '../../data/rhythms';
import { StepCard, TrainingHint } from '../StepUI';
import { Activity } from 'lucide-react';

export default function RhythmSelectStep({ title, subtitle, phase, onSelect, showROSC, showTerminate, onROSC, onTerminate, isTraining }) {
  const arrestRhythms = getRhythmsByCategory('cardiac_arrest');
  return (
    <StepCard phase={phase} phaseColor="text-warning" icon={Activity} title={title} subtitle={subtitle}>
      <TrainingHint show={isTraining}>
        <p>Pause CPR ≤10 seconds. VF/pVT → Shock | PEA/Asystole → CPR + Epi</p>
      </TrainingHint>
      <div className="grid grid-cols-2 gap-3.5">
        {arrestRhythms.map(r => (
          <button key={r.id} onClick={() => onSelect(r)}
            className={`btn-action py-5 text-lg ${r.shockable ? 'btn-danger' : 'btn-warning'}`}>
            {r.abbreviation}
            <div className="text-3xs font-bold mt-1 opacity-80">{r.shockable ? '⚡ Shockable' : '→ CPR continue'}</div>
          </button>
        ))}
      </div>
      {(showROSC || showTerminate) && (
        <div className="grid grid-cols-2 gap-3.5 mt-1">
          {showROSC && <button onClick={onROSC} className="btn-action py-4 text-sm bg-transparent border border-success/40 text-success font-bold">🟢 ROSC</button>}
          {showTerminate && <button onClick={onTerminate} className="btn-action btn-ghost py-4 text-sm text-text-muted">🔴 Terminate</button>}
        </div>
      )}
    </StepCard>
  );
}
