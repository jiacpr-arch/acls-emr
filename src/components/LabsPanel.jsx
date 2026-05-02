import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import PanelWrapper from './PanelWrapper';
import { FlaskConical, AlertTriangle } from 'lucide-react';

function LabAlert({ children }) {
  return (
    <div className="text-caption text-danger font-bold px-1 inline-flex items-center gap-1.5">
      <AlertTriangle size={12} strokeWidth={2.4} className="shrink-0" /> {children}
    </div>
  );
}

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
    <PanelWrapper title="Labs" icon={<FlaskConical size={18} strokeWidth={2.2} />} onClose={onClose} onSave={saveLabs}>
      <div className="space-y-3">
        <div className="dash-card !p-3 space-y-3">
          <ScrollPicker label="DTX (Blood Glucose)" value={dtx} onChange={setDtx}
            min={10} max={500} step={5} unit="mg/dL"
            alertLow={60} alertHigh={250} targetLow={140} targetHigh={180} />
          {dtx < 60 && <LabAlert>Hypoglycemia! Give 50% Glucose 50ml IV — may mimic stroke!</LabAlert>}
        </div>

        <div className="dash-card !p-3 space-y-3">
          <ScrollPicker label="Hemoglobin" value={hb} onChange={v => setHb(Math.round(v * 10) / 10)}
            min={3} max={20} step={0.5} unit="g/dL"
            alertLow={7} targetLow={10} targetHigh={16} />
          <ScrollPicker label="Hematocrit" value={hct} onChange={setHct}
            min={10} max={60} step={1} unit="%"
            alertLow={21} targetLow={30} targetHigh={45} />
        </div>

        <div className="dash-card !p-3 space-y-3">
          <ScrollPicker label="Potassium (K+)" value={k} onChange={v => setK(Math.round(v * 10) / 10)}
            min={2} max={8} step={0.1} unit="mEq/L"
            alertLow={3.5} alertHigh={5.5} targetLow={3.5} targetHigh={5.0} />
          {k > 5.5 && <LabAlert>Hyperkalemia! → Ca Gluconate + NaHCO₃ + Glucose+RI</LabAlert>}
          {k < 3.5 && <LabAlert>Hypokalemia! → K replacement — risk of arrhythmia</LabAlert>}
        </div>

        <div className="dash-card !p-3">
          <ScrollPicker label="Lactate" value={lactate} onChange={v => setLactate(Math.round(v * 10) / 10)}
            min={0} max={20} step={0.5} unit="mmol/L"
            alertHigh={4} targetLow={0} targetHigh={2} />
          {lactate > 4 && <LabAlert>Lactate &gt;4 — tissue hypoperfusion / poor prognosis</LabAlert>}
        </div>
      </div>
    </PanelWrapper>
  );
}
