import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';

// Vitals Panel — shared across all pathways
// Records: BP (sys/dia + MAP auto), HR, SpO2, RR, Temp, AVPU, GCS, Pain
export default function VitalsPanel({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(16);
  const [temp, setTemp] = useState(37.0);
  const [avpu, setAvpu] = useState('A');
  const [gcs, setGcs] = useState(15);
  const [pain, setPain] = useState(0);
  const [showGCS, setShowGCS] = useState(false);
  const [gcsE, setGcsE] = useState(4);
  const [gcsV, setGcsV] = useState(5);
  const [gcsM, setGcsM] = useState(6);

  const map = Math.round((bpSys + 2 * bpDia) / 3);
  const shockIndex = hr > 0 && bpSys > 0 ? (hr / bpSys).toFixed(1) : '—';
  const mapDanger = map < 65;
  const siDanger = parseFloat(shockIndex) > 1;

  const saveVitals = () => {
    const vitals = { bpSys, bpDia, map, hr, spo2, rr, temp, avpu, gcs, pain, shockIndex: parseFloat(shockIndex) };
    addEvent({
      elapsed,
      category: 'other',
      type: `📊 Vitals: BP ${bpSys}/${bpDia} (MAP ${map}) HR ${hr} SpO₂ ${spo2}% RR ${rr} T ${temp}°C ${avpu}`,
      details: vitals,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">📊 Vitals</span>
        <div className="flex gap-2">
          <button onClick={saveVitals} className="btn-action btn-info px-4 py-1.5 text-xs !min-h-0">Save</button>
          <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* BP + MAP */}
        <div className="glass-card !p-3 space-y-2">
          <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys}
            min={40} max={250} step={1} unit="mmHg" alertLow={90} />
          <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia}
            min={20} max={150} step={1} unit="mmHg" />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">MAP (auto)</span>
            <span className={`text-lg font-mono font-black ${mapDanger ? 'text-danger' : 'text-success'}`}>
              {map} <span className="text-xs font-normal">mmHg</span>
              {mapDanger && <span className="text-xs ml-1">⚠️ &lt;65</span>}
            </span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">Shock Index (HR/SBP)</span>
            <span className={`text-sm font-mono font-bold ${siDanger ? 'text-danger' : 'text-text-primary'}`}>
              {shockIndex} {siDanger && '⚠️ >1'}
            </span>
          </div>
        </div>

        {/* HR + SpO2 */}
        <div className="glass-card !p-3 space-y-2">
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr}
            min={20} max={250} step={5} unit="bpm" alertLow={50} alertHigh={150}
            targetLow={60} targetHigh={100} />
          <ScrollPicker label="SpO₂" value={spo2} onChange={setSpo2}
            min={50} max={100} step={1} unit="%" alertLow={94}
            targetLow={94} targetHigh={100} color="accent-info" />
        </div>

        {/* RR + Temp */}
        <div className="glass-card !p-3 space-y-2">
          <ScrollPicker label="Respiratory Rate" value={rr} onChange={setRr}
            min={4} max={40} step={1} unit="/min"
            targetLow={12} targetHigh={20} />
          <ScrollPicker label="Temperature" value={temp} onChange={v => setTemp(Math.round(v * 10) / 10)}
            min={32} max={42} step={0.1} unit="°C"
            targetLow={36} targetHigh={37.5} alertLow={35} alertHigh={38.5} />
        </div>

        {/* AVPU */}
        <div className="glass-card !p-3">
          <AVPUSelect value={avpu} onChange={setAvpu} />
        </div>

        {/* GCS (expandable) */}
        <div className="glass-card !p-3">
          <button onClick={() => setShowGCS(!showGCS)}
            className="flex items-center justify-between w-full">
            <span className="text-xs text-text-muted font-medium">GCS (detailed)</span>
            <span className="text-lg font-mono font-black text-text-primary">{gcsE + gcsV + gcsM}/15</span>
          </button>
          {showGCS && (
            <div className="mt-3 space-y-2">
              <ScrollPicker label="Eye (E)" value={gcsE} onChange={v => { setGcsE(v); setGcs(v + gcsV + gcsM); }}
                min={1} max={4} step={1} />
              <ScrollPicker label="Verbal (V)" value={gcsV} onChange={v => { setGcsV(v); setGcs(gcsE + v + gcsM); }}
                min={1} max={5} step={1} />
              <ScrollPicker label="Motor (M)" value={gcsM} onChange={v => { setGcsM(v); setGcs(gcsE + gcsV + v); }}
                min={1} max={6} step={1} />
            </div>
          )}
        </div>

        {/* Pain Score */}
        <div className="glass-card !p-3">
          <ScrollPicker label="Pain Score" value={pain} onChange={setPain}
            min={0} max={10} step={1} alertHigh={7} />
        </div>
      </div>
    </div>
  );
}
