import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';
import PanelWrapper from './PanelWrapper';
import { Activity, AlertTriangle, Wind, Syringe } from 'lucide-react';

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
    <PanelWrapper title="Vitals" icon={<Activity size={18} strokeWidth={2.2} />} onClose={onClose} onSave={saveVitals}>
      <div className="space-y-4">
        {/* BP + MAP */}
        <div className="dash-card !p-3 space-y-2">
          <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys}
            min={40} max={250} step={1} unit="mmHg" alertLow={90} />
          <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia}
            min={20} max={150} step={1} unit="mmHg" />
          <div className="flex items-center justify-between px-1">
            <span className="text-caption text-text-muted">MAP (auto)</span>
            <span className={`text-numeric text-lg ${mapDanger ? 'text-danger' : 'text-success'} inline-flex items-center gap-1`}>
              {map} <span className="text-caption font-normal">mmHg</span>
              {mapDanger && <AlertTriangle size={12} strokeWidth={2.4} />}
            </span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-caption text-text-muted">Shock Index (HR/SBP)</span>
            <span className={`text-caption font-mono font-bold inline-flex items-center gap-1 ${siDanger ? 'text-danger' : 'text-text-primary'}`}>
              {shockIndex} {siDanger && <AlertTriangle size={11} strokeWidth={2.4} />}
            </span>
          </div>
        </div>

        {mapDanger && (
          <div className="bg-danger/10 border border-danger/30 px-3 py-2 space-y-2"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="text-caption text-danger font-bold inline-flex items-center gap-1.5">
              <AlertTriangle size={13} strokeWidth={2.4} /> MAP &lt;65 — Hemodynamic support needed
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addEvent({ elapsed, category: 'drug', type: '💉 IV Fluid Bolus (NSS 500ml)', details: {} })}
                className="btn btn-info btn-sm btn-block">
                <Syringe size={13} strokeWidth={2.2} /> IV Fluid 500ml
              </button>
              <button onClick={() => addEvent({ elapsed, category: 'drug', type: '💉 Norepinephrine started', details: {} })}
                className="btn btn-purple btn-sm btn-block">
                <Syringe size={13} strokeWidth={2.2} /> Vasopressor
              </button>
            </div>
          </div>
        )}

        {/* HR + SpO2 */}
        <div className="dash-card !p-3 space-y-2">
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr}
            min={20} max={250} step={5} unit="bpm" alertLow={50} alertHigh={150}
            targetLow={60} targetHigh={100} />
          {hr < 50 && (
            <Alert tone="warning"><AlertTriangle size={11} strokeWidth={2.4} /> HR &lt;50 → Consider Atropine 1mg IV</Alert>
          )}
          {hr > 150 && (
            <Alert tone="danger"><AlertTriangle size={11} strokeWidth={2.4} /> HR &gt;150 → Assess stable/unstable → Cardioversion?</Alert>
          )}

          <ScrollPicker label="SpO₂" value={spo2} onChange={setSpo2}
            min={50} max={100} step={1} unit="%" alertLow={94}
            targetLow={94} targetHigh={100} color="accent-info" />
          {spo2 < 94 && (
            <div className="bg-danger/10 border border-danger/30 px-3 py-2 space-y-1.5"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-caption text-danger font-bold inline-flex items-center gap-1.5">
                <AlertTriangle size={13} strokeWidth={2.4} /> SpO₂ {spo2}% — Give O₂ NOW
              </div>
              <div className="grid grid-cols-4 gap-1">
                <O2Btn label="Cannula" type="🌬️ O₂: Nasal Cannula 3L/min" addEvent={addEvent} elapsed={elapsed} />
                <O2Btn label="Mask" type="🌬️ O₂: Simple Mask 8L/min" addEvent={addEvent} elapsed={elapsed} />
                <O2Btn label="NRB" type="🌬️ O₂: NRB 15L/min" addEvent={addEvent} elapsed={elapsed} />
                <O2Btn label="BVM" type="🌬️ O₂: BVM 15L/min" addEvent={addEvent} elapsed={elapsed} variant="info" />
              </div>
            </div>
          )}
        </div>

        {/* RR + Temp */}
        <div className="dash-card !p-3 space-y-2">
          <ScrollPicker label="Respiratory Rate" value={rr} onChange={setRr}
            min={4} max={40} step={1} unit="/min"
            targetLow={12} targetHigh={20} />
          {rr < 8 && (
            <Alert tone="danger"><AlertTriangle size={11} strokeWidth={2.4} /> RR &lt;8 — May need assisted ventilation (BVM)</Alert>
          )}
          <ScrollPicker label="Temperature" value={temp} onChange={v => setTemp(Math.round(v * 10) / 10)}
            min={32} max={42} step={0.1} unit="°C"
            targetLow={36} targetHigh={37.5} alertLow={35} alertHigh={38.5} />
          {temp > 38.5 && (
            <Alert tone="danger"><AlertTriangle size={11} strokeWidth={2.4} /> Fever — Consider active cooling / antipyretics</Alert>
          )}
          {temp < 35 && (
            <Alert tone="danger"><AlertTriangle size={11} strokeWidth={2.4} /> Hypothermia — Warm IV fluid + warm blanket</Alert>
          )}
        </div>

        {/* AVPU */}
        <div className="dash-card !p-3">
          <AVPUSelect value={avpu} onChange={setAvpu} />
        </div>

        {/* GCS */}
        <div className="dash-card !p-3">
          <button onClick={() => setShowGCS(!showGCS)}
            className="flex items-center justify-between w-full">
            <span className="text-caption text-text-muted font-medium">GCS (detailed)</span>
            <span className="text-numeric text-lg text-text-primary">{gcsE + gcsV + gcsM}/15</span>
          </button>
          {showGCS && (
            <div className="mt-3 space-y-2">
              <ScrollPicker label="Eye (E)" value={gcsE} onChange={v => { setGcsE(v); setGcs(v + gcsV + gcsM); }} min={1} max={4} step={1} />
              <ScrollPicker label="Verbal (V)" value={gcsV} onChange={v => { setGcsV(v); setGcs(gcsE + v + gcsM); }} min={1} max={5} step={1} />
              <ScrollPicker label="Motor (M)" value={gcsM} onChange={v => { setGcsM(v); setGcs(gcsE + gcsV + v); }} min={1} max={6} step={1} />
            </div>
          )}
        </div>

        {/* Pain */}
        <div className="dash-card !p-3">
          <ScrollPicker label="Pain Score" value={pain} onChange={setPain} min={0} max={10} step={1} alertHigh={7} />
        </div>
      </div>
    </PanelWrapper>
  );
}

function Alert({ tone, children }) {
  const tones = {
    danger: 'bg-danger/10 border-danger/30 text-danger',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  };
  return (
    <div className={`text-[11px] font-bold border px-2 py-1.5 inline-flex items-center gap-1.5 ${tones[tone]}`}
      style={{ borderRadius: 'var(--radius-sm)' }}>
      {children}
    </div>
  );
}

function O2Btn({ label, type, addEvent, elapsed, variant }) {
  return (
    <button onClick={() => addEvent({ elapsed, category: 'airway', type, details: {} })}
      className={`btn btn-sm btn-block !min-h-[28px] !text-[10px] ${variant === 'info' ? 'btn-info' : 'btn-ghost'}`}>
      <Wind size={10} strokeWidth={2.2} /> {label}
    </button>
  );
}
