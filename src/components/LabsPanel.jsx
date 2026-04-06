import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';

// Labs Panel — quick lab value entry
// DTX (blood glucose), Hematocrit, Hemoglobin, Potassium, Lactate
export default function LabsPanel({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  const [dtx, setDtx] = useState(120);
  const [hb, setHb] = useState(12);
  const [hct, setHct] = useState(36);
  const [k, setK] = useState(4.0);
  const [lactate, setLactate] = useState(1.0);

  const saveLabs = () => {
    const labs = { dtx, hb, hct, k, lactate };
    addEvent({
      elapsed,
      category: 'other',
      type: `🔬 Labs: DTX ${dtx} Hb ${hb} Hct ${hct} K+ ${k} Lactate ${lactate}`,
      details: labs,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">🔬 Labs</span>
        <div className="flex gap-2">
          <button onClick={saveLabs} className="btn-action btn-info px-4 py-1.5 text-xs !min-h-0">Save</button>
          <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="glass-card !p-3 space-y-3">
          <ScrollPicker label="DTX (Blood Glucose)" value={dtx} onChange={setDtx}
            min={10} max={500} step={5} unit="mg/dL"
            alertLow={60} alertHigh={250} targetLow={140} targetHigh={180} />
          {dtx < 60 && (
            <div className="text-xs text-danger font-semibold px-1">
              ⚠️ Hypoglycemia! Give 50% Glucose 50ml IV — may mimic stroke!
            </div>
          )}
        </div>

        <div className="glass-card !p-3 space-y-3">
          <ScrollPicker label="Hemoglobin" value={hb} onChange={v => setHb(Math.round(v * 10) / 10)}
            min={3} max={20} step={0.5} unit="g/dL"
            alertLow={7} targetLow={10} targetHigh={16} />
          <ScrollPicker label="Hematocrit" value={hct} onChange={setHct}
            min={10} max={60} step={1} unit="%"
            alertLow={21} targetLow={30} targetHigh={45} />
        </div>

        <div className="glass-card !p-3 space-y-3">
          <ScrollPicker label="Potassium (K+)" value={k} onChange={v => setK(Math.round(v * 10) / 10)}
            min={2} max={8} step={0.1} unit="mEq/L"
            alertLow={3.5} alertHigh={5.5} targetLow={3.5} targetHigh={5.0} />
          {k > 5.5 && (
            <div className="text-xs text-danger font-semibold px-1">
              ⚠️ Hyperkalemia! → Ca Gluconate + NaHCO₃ + Glucose+RI
            </div>
          )}
          {k < 3.5 && (
            <div className="text-xs text-danger font-semibold px-1">
              ⚠️ Hypokalemia! → K replacement — risk of arrhythmia
            </div>
          )}
        </div>

        <div className="glass-card !p-3">
          <ScrollPicker label="Lactate" value={lactate} onChange={v => setLactate(Math.round(v * 10) / 10)}
            min={0} max={20} step={0.5} unit="mmol/L"
            alertHigh={4} targetLow={0} targetHigh={2} />
          {lactate > 4 && (
            <div className="text-xs text-danger font-semibold px-1">
              ⚠️ Lactate &gt;4 — tissue hypoperfusion / poor prognosis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
