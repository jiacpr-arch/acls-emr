import { useState } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import { useTimerStore } from '../../stores/timerStore';
import { checkDrugInteraction, checkAllergy } from '../../utils/drugInteractions';
import { DRUG_TECHNIQUES, QUICK_DRUGS } from '../../data/arrestDrugs';
import { StepCard, TrainingHint } from '../StepUI';
import { Syringe } from 'lucide-react';

export default function DrugStep({ onDone, isTraining }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const addDrugTimer = useCaseStore(s => s.addDrugTimer);
  const shockCount = useCaseStore(s => s.shockCount);
  const currentRhythm = useCaseStore(s => s.currentRhythm);
  const patient = useCaseStore(s => s.patient);
  const elapsed = useTimerStore(s => s.elapsed);
  const isShockable = currentRhythm?.shockable;
  const [showTech, setShowTech] = useState(null);
  const [drugWarning, setDrugWarning] = useState(null);

  const give = (name, id, hasTimer = false, sec = 180) => {
    // Check interactions + allergies
    const interactions = checkDrugInteraction(id, patient?.medications);
    const allergy = checkAllergy(id, patient?.allergies);
    if (allergy) { setDrugWarning(allergy); return; }
    if (interactions.length > 0 && interactions.some(i => i.severity === 'critical')) { setDrugWarning(interactions[0]); return; }

    addEvent({ elapsed, category: 'drug', type: `💉 ${name}`, details: { drugId: id } });
    if (hasTimer) addDrugTimer(id, name, sec);
    onDone();
  };

  return (
    <StepCard phase="Primary Survey — Circulation" phaseColor="text-purple" icon={Syringe} title="Medication"
      subtitle={isShockable ? `Shockable · Shocks: ${shockCount}` : 'Non-shockable → Epi ASAP'}>
      <TrainingHint show={isTraining}>
        {isShockable ? <p>Shockable: Epi after 2nd shock → Amiodarone 300mg after 3rd shock</p> : <p>Non-shockable: Epi 1mg IV immediately → repeat q3-5 min</p>}
      </TrainingHint>
      {/* Drug interaction/allergy warning */}
      {drugWarning && (
        <div className="glass-card !p-3 border-2 border-danger/50 space-y-2 mb-2">
          <div className={`text-xs font-bold ${drugWarning.severity === 'critical' ? 'text-danger' : 'text-warning'}`}>
            ⚠️ {drugWarning.message}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDrugWarning(null)} className="btn-action btn-ghost py-2 text-xs">Cancel</button>
            <button onClick={() => { setDrugWarning(null); }} className="btn-action btn-danger py-2 text-xs">Override & Give</button>
          </div>
        </div>
      )}

      {showTech && (
        <div className="glass-card !p-3 text-left text-xs text-text-secondary mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-text-primary">Technique</span>
            <button onClick={() => setShowTech(null)} className="btn btn-ghost btn-icon btn-sm">✕</button>
          </div>
          <div>{DRUG_TECHNIQUES[showTech] || 'Standard IV push → flush 20ml'}</div>
        </div>
      )}
      <div className="space-y-2">
        <button onClick={() => give('Epinephrine 1mg IV (1:10,000)', 'epinephrine_arrest', true, 180)}
          className="w-full btn-action btn-purple py-3.5 text-sm text-left px-4">
          <div className="flex items-center justify-between">
            <div><div className="font-bold">💉 Epinephrine 1mg IV</div><div className="text-3xs font-normal opacity-80">1:10,000 → push fast → flush 20ml → q3-5 min</div></div>
            <button onClick={(e) => { e.stopPropagation(); setShowTech('epinephrine_arrest'); }} className="text-[9px] underline opacity-60 shrink-0 ml-2">how?</button>
          </div>
        </button>
        {isShockable && (
          <button onClick={() => give('Amiodarone 300mg IV', 'amiodarone_first')}
            className={`w-full btn-action py-3.5 text-sm text-left px-4 ${shockCount >= 3 ? 'btn-info' : 'btn-ghost'}`}>
            <div className="flex items-center justify-between">
              <div><div className="font-bold">💊 Amiodarone 300mg {shockCount >= 3 && '← recommended'}</div><div className="text-3xs font-normal opacity-80">+D5W 4ml → push 1-3min → flush NSS 20ml</div></div>
              <button onClick={(e) => { e.stopPropagation(); setShowTech('amiodarone_first'); }} className="text-[9px] underline opacity-60 shrink-0 ml-2">how?</button>
            </div>
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_DRUGS.map(d => (
          <button key={d.id} className="btn-action btn-ghost py-2.5 text-3xs relative"
            onClick={() => give(`${d.label} (${d.detail})`, d.id)}>
            <div className="font-semibold">{d.label}</div>
            <div className="text-[9px] text-text-muted">{d.detail}</div>
            <button onClick={(e) => { e.stopPropagation(); setShowTech(d.id); }} className="absolute top-0.5 right-1 text-[9px] text-info">?</button>
          </button>
        ))}
      </div>
      <button onClick={onDone} className="btn btn-ghost btn-sm">← Back to CPR</button>
    </StepCard>
  );
}
