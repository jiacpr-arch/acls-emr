import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { drugs } from '../data/drugs';

export default function QuickActions() {
  const { addEvent, addShock, currentRhythm, shockCount, addDrugTimer } = useCaseStore();
  const { elapsed, cprActive, startCPR, stopCPR } = useTimerStore();

  const handleCPR = () => {
    if (cprActive) {
      stopCPR('rhythm_check');
      addEvent({ elapsed, category: 'cpr', type: 'CPR Paused', details: { reason: 'rhythm_check' } });
    } else {
      startCPR();
      addEvent({ elapsed, category: 'cpr', type: 'CPR Started', details: {} });
    }
  };

  const handleShock = () => {
    const newCount = shockCount + 1;
    addShock();
    const energy = currentRhythm?.energyBiphasic
      ? (newCount === 1 ? currentRhythm.energyBiphasic.first : currentRhythm.energyBiphasic.subsequent)
      : '200J';
    addEvent({
      elapsed,
      category: 'shock',
      type: `Defibrillation #${newCount}`,
      details: { shockNumber: newCount, energy: `${energy}J`, rhythm: currentRhythm?.abbreviation }
    });
  };

  const handleEpi = () => {
    const epiDrug = drugs.find(d => d.id === 'epinephrine_arrest');
    addEvent({
      elapsed,
      category: 'drug',
      type: 'Epinephrine 1mg IV/IO',
      details: { drugId: 'epinephrine_arrest', dose: '1 mg', route: 'IV/IO' }
    });
    if (epiDrug?.intervalSeconds) {
      addDrugTimer('epinephrine_arrest', 'Epinephrine', epiDrug.intervalSeconds);
    }
  };

  const handleAmiodarone = () => {
    addEvent({
      elapsed,
      category: 'drug',
      type: 'Amiodarone 300mg IV',
      details: { drugId: 'amiodarone_first', dose: '300 mg', route: 'IV/IO' }
    });
  };

  const handleAirway = (type) => {
    addEvent({
      elapsed,
      category: 'airway',
      type,
      details: {}
    });
  };

  const handleAccess = (type) => {
    addEvent({
      elapsed,
      category: 'access',
      type,
      details: {}
    });
  };

  const handleROSC = () => {
    stopCPR('rosc');
    addEvent({ elapsed, category: 'other', type: '🟢 ROSC', details: { outcome: 'ROSC' } });
  };

  return (
    <div className="bg-bg-secondary rounded-xl p-3 space-y-3">
      <div className="text-xs text-text-muted uppercase tracking-wider">Quick Actions</div>

      {/* Row 1: CPR + Shock */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCPR}
          className={`py-4 rounded-xl font-bold text-lg transition-all ${
            cprActive
              ? 'bg-warning text-black animate-pulse'
              : 'bg-success text-white'
          }`}
        >
          {cprActive ? '⏸ PAUSE CPR' : '🫀 START CPR'}
        </button>
        <button
          onClick={handleShock}
          disabled={!currentRhythm?.shockable}
          className={`py-4 rounded-xl font-bold text-lg transition-all ${
            currentRhythm?.shockable
              ? 'bg-shock text-white hover:bg-orange-600'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          }`}
        >
          ⚡ SHOCK #{shockCount + 1}
        </button>
      </div>

      {/* Row 2: Drugs */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={handleEpi}
          className="py-3 bg-purple text-white rounded-xl font-semibold text-sm hover:bg-purple-600">
          💉 Epi 1mg
        </button>
        <button onClick={handleAmiodarone}
          className="py-3 bg-info text-white rounded-xl font-semibold text-sm hover:bg-blue-600">
          💊 Amio 300
        </button>
        <button onClick={() => addEvent({ elapsed, category: 'drug', type: 'Atropine 1mg IV', details: {} })}
          className="py-3 bg-bg-tertiary text-text-primary rounded-xl font-semibold text-sm hover:bg-gray-600">
          💊 Atropine
        </button>
      </div>

      {/* Row 3: Airway & Access */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => handleAirway('BVM')}
          className="py-2 bg-bg-tertiary text-text-primary rounded-lg text-xs font-semibold hover:bg-gray-600">
          🫁 BVM
        </button>
        <button onClick={() => handleAirway('Intubation (ETT)')}
          className="py-2 bg-bg-tertiary text-text-primary rounded-lg text-xs font-semibold hover:bg-gray-600">
          🫁 ETT
        </button>
        <button onClick={() => handleAccess('IV Access')}
          className="py-2 bg-bg-tertiary text-text-primary rounded-lg text-xs font-semibold hover:bg-gray-600">
          💉 IV
        </button>
        <button onClick={() => handleAccess('IO Access')}
          className="py-2 bg-bg-tertiary text-text-primary rounded-lg text-xs font-semibold hover:bg-gray-600">
          🦴 IO
        </button>
      </div>

      {/* Row 4: ROSC / Terminate */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleROSC}
          className="py-3 bg-success/20 border-2 border-success text-success rounded-xl font-bold text-sm hover:bg-success/30">
          🟢 ROSC
        </button>
        <button onClick={() => addEvent({ elapsed, category: 'other', type: '🔴 Terminated', details: {} })}
          className="py-3 bg-danger/20 border-2 border-danger text-danger rounded-xl font-bold text-sm hover:bg-danger/30">
          🔴 Terminate
        </button>
      </div>
    </div>
  );
}
