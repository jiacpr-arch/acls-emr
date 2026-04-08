import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';
import PanelWrapper from './PanelWrapper';

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
    <PanelWrapper title="Vitals" icon="📊" onClose={onClose} onSave={saveVitals}>
      <div className="space-y-4">
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

        {/* BP Actions */}
        {mapDanger && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 space-y-1.5">
            <div className="text-xs text-danger font-bold">⚠️ MAP &lt;65 — Hemodynamic support needed</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => { addEvent({ elapsed, category: 'drug', type: '💉 IV Fluid Bolus (NSS 500ml)', details: {} }); }}
                className="btn-action btn-info py-2 text-[10px] !min-h-[32px]">💉 IV Fluid 500ml</button>
              <button onClick={() => { addEvent({ elapsed, category: 'drug', type: '💉 Norepinephrine started', details: {} }); }}
                className="btn-action btn-purple py-2 text-[10px] !min-h-[32px]">💉 Vasopressor</button>
            </div>
          </div>
        )}

        {/* HR + SpO2 */}
        <div className="glass-card !p-3 space-y-2">
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr}
            min={20} max={250} step={5} unit="bpm" alertLow={50} alertHigh={150}
            targetLow={60} targetHigh={100} />
          {hr < 50 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg px-2 py-1.5 text-[10px] text-warning font-bold">
              ⚠️ HR &lt;50 → Consider Atropine 1mg IV
            </div>
          )}
          {hr > 150 && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-2 py-1.5 text-[10px] text-danger font-bold">
              ⚠️ HR &gt;150 → Assess stable/unstable → Cardioversion?
            </div>
          )}

          <ScrollPicker label="SpO₂" value={spo2} onChange={setSpo2}
            min={50} max={100} step={1} unit="%" alertLow={94}
            targetLow={94} targetHigh={100} color="accent-info" />
          {spo2 < 94 && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 space-y-1.5">
              <div className="text-xs text-danger font-bold">⚠️ SpO₂ {spo2}% — Give O₂ NOW</div>
              <div className="grid grid-cols-4 gap-1">
                <button onClick={() => { addEvent({ elapsed, category: 'airway', type: '🌬️ O₂: Nasal Cannula 3L/min', details: {} }); }}
                  className="btn-action btn-ghost py-1.5 text-[9px] !min-h-[28px]">👃 Cannula</button>
                <button onClick={() => { addEvent({ elapsed, category: 'airway', type: '🌬️ O₂: Simple Mask 8L/min', details: {} }); }}
                  className="btn-action btn-ghost py-1.5 text-[9px] !min-h-[28px]">😷 Mask</button>
                <button onClick={() => { addEvent({ elapsed, category: 'airway', type: '🌬️ O₂: NRB 15L/min', details: {} }); }}
                  className="btn-action btn-ghost py-1.5 text-[9px] !min-h-[28px]">🎭 NRB</button>
                <button onClick={() => { addEvent({ elapsed, category: 'airway', type: '🌬️ O₂: BVM 15L/min', details: {} }); }}
                  className="btn-action btn-info py-1.5 text-[9px] !min-h-[28px]">🫁 BVM</button>
              </div>
            </div>
          )}
        </div>

        {/* RR + Temp */}
        <div className="glass-card !p-3 space-y-2">
          <ScrollPicker label="Respiratory Rate" value={rr} onChange={setRr}
            min={4} max={40} step={1} unit="/min"
            targetLow={12} targetHigh={20} />
          {rr < 8 && (
            <div className="text-[10px] text-danger font-bold px-1">⚠️ RR &lt;8 — May need assisted ventilation (BVM)</div>
          )}
          <ScrollPicker label="Temperature" value={temp} onChange={v => setTemp(Math.round(v * 10) / 10)}
            min={32} max={42} step={0.1} unit="°C"
            targetLow={36} targetHigh={37.5} alertLow={35} alertHigh={38.5} />
          {temp > 38.5 && (
            <div className="text-[10px] text-danger font-bold px-1">⚠️ Fever — Consider active cooling / antipyretics</div>
          )}
          {temp < 35 && (
            <div className="text-[10px] text-danger font-bold px-1">⚠️ Hypothermia — Warm IV fluid + warm blanket</div>
          )}
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
    </PanelWrapper>
  );
}
