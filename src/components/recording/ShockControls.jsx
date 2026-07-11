import { useCaseStore } from '../../stores/caseStore';
import { useTimerStore } from '../../stores/timerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { playShockSound } from '../../utils/sound';
import { getShockEnergy } from '../../data/recordingSteps';
import { StepCard, BigButton, TrainingHint } from '../StepUI';
import { Zap } from 'lucide-react';

// Shared shock-delivery logic for the wizard step and the quick-access modal.
function useDeliverShock() {
  const shockCount = useCaseStore(s => s.shockCount);
  const currentRhythm = useCaseStore(s => s.currentRhythm);
  const addShock = useCaseStore(s => s.addShock);
  const addEvent = useCaseStore(s => s.addEvent);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const elapsed = useTimerStore(s => s.elapsed);
  const energy = getShockEnergy(currentRhythm, shockCount);

  const deliver = () => {
    if (soundEnabled) playShockSound();
    addShock();
    addEvent({ elapsed, category: 'shock', type: `⚡ Shock #${shockCount + 1}`, details: { energy: `${energy}J` } });
    useTimerStore.getState().resetCycle();
  };

  return { shockCount, currentRhythm, energy, deliver };
}

export function ShockStep({ onShocked, onSkip, isTraining }) {
  const { shockCount, currentRhythm, energy, deliver } = useDeliverShock();

  return (
    <StepCard phase="Primary Survey — Defibrillation" phaseColor="text-shock" icon={Zap} title="DEFIBRILLATION"
      subtitle={`${currentRhythm?.abbreviation} → Shock #${shockCount + 1}`}
      instructions={[`Energy: ${energy}J Biphasic`, 'Charge during CPR — minimize pause', 'Clear patient before shock', 'Resume CPR immediately after shock']}>
      <TrainingHint show={isTraining}><p>Charge during CPR → pause &lt;5s → Clear → Shock → Resume CPR immediately</p></TrainingHint>
      <BigButton color="bg-shock text-white animate-pulse" size="huge" onClick={() => {
        deliver();
        onShocked();
      }}>⚡ SHOCK DELIVERED</BigButton>
      <button onClick={onSkip} className="btn btn-ghost btn-sm">Skip → Resume CPR</button>
    </StepCard>
  );
}

export function ShockModal({ onClose, isTraining }) {
  const { shockCount, currentRhythm, energy, deliver } = useDeliverShock();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary p-4 space-y-3"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary">⚡ Shock #{shockCount + 1}</span>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">✕</button>
      </div>
      <div className="text-sm text-text-secondary">{currentRhythm?.abbreviation} → {energy}J Biphasic</div>
      {isTraining && <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">Charge during CPR → pause &lt;5s → Clear → Shock → Resume CPR</div>}
      <button onClick={() => {
        deliver();
        onClose();
      }} className="w-full btn-action btn-shock py-5 text-xl font-black animate-pulse">⚡ SHOCK {energy}J</button>
    </div>
  );
}
