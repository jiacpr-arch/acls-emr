import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';

// Stable Monitor — used after treatment when patient is stable
// Re-assess vitals + EKG → stable? → disposition
// Used by: post-cardioversion, post-atropine, post-drug, PULSE_NORMAL
export default function StableMonitor({ onRecheckPulse, onArrest, onDone, isTraining }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [phase, setPhase] = useState('reassess'); // reassess → disposition
  const [checklist, setChecklist] = useState({});

  // Vitals
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [rr, setRr] = useState(16);
  const [avpu, setAvpu] = useState('A');

  const map = Math.round((bpSys + 2 * bpDia) / 3);
  const isStable = bpSys >= 90 && map >= 65 && avpu === 'A';

  const toggleCheck = (key, label) => {
    setChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (!prev[key]) addEvent({ elapsed, category: 'other', type: `✅ ${label}`, details: { step: key } });
      return updated;
    });
  };

  const Check = ({ id, label, sub }) => (
    <button onClick={() => toggleCheck(id, label)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1.5 text-left transition-colors ${
        checklist[id] ? 'bg-success/10 border border-success/30' : 'bg-bg-primary border border-bg-tertiary'
      }`}>
      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 ${
        checklist[id] ? 'bg-success text-white' : 'bg-bg-tertiary text-text-muted'
      }`}>{checklist[id] ? '✓' : ''}</span>
      <div>
        <div className="text-xs font-semibold text-text-primary">{label}</div>
        {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
      </div>
    </button>
  );

  const saveVitals = () => {
    addEvent({ elapsed, category: 'other', type: `📊 Re-assess: BP ${bpSys}/${bpDia} (MAP ${map}) HR ${hr} SpO₂ ${spo2}% RR ${rr} ${avpu}`, details: { bpSys, bpDia, map, hr, spo2, rr, avpu } });
  };

  // ===== RE-ASSESSMENT =====
  if (phase === 'reassess') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">Re-Assessment</div>
        <div className="text-5xl">📊</div>
        <h1 className="text-xl font-black text-text-primary">Re-assess Patient</h1>

        {/* Quick vitals */}
        <div className="glass-card !p-3 space-y-2">
          <div className="text-xs text-text-muted font-semibold mb-1">Vitals</div>
          <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys} min={40} max={250} step={1} unit="mmHg" alertLow={90} />
          <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia} min={20} max={150} step={1} unit="mmHg" />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">MAP</span>
            <span className={`text-lg font-mono font-black ${map < 65 ? 'text-danger' : 'text-success'}`}>{map}</span>
          </div>
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr} min={20} max={250} step={5} unit="bpm" />
          <ScrollPicker label="SpO₂" value={spo2} onChange={setSpo2} min={50} max={100} step={1} unit="%" alertLow={94} />
          {spo2 < 94 && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-2 py-1.5 space-y-1">
              <div className="text-[10px] text-danger font-bold">⚠️ SpO₂ {spo2}% — Give O₂</div>
              <div className="grid grid-cols-3 gap-1">
                {[{l:'👃 Cannula',v:'Nasal Cannula 3L'},{l:'😷 Mask',v:'Simple Mask 8L'},{l:'🎭 NRB',v:'NRB 15L'}].map(o=>(
                  <button key={o.l} onClick={()=>addEvent({elapsed,category:'airway',type:`🌬️ O₂: ${o.v}`,details:{}})}
                    className="btn-action btn-ghost py-1 text-[8px] !min-h-[24px]">{o.l}</button>
                ))}
              </div>
            </div>
          )}
          <ScrollPicker label="RR" value={rr} onChange={setRr} min={4} max={40} step={1} unit="/min" />

          <AVPUSelect value={avpu} onChange={setAvpu} compact />
        </div>

        {/* Status */}
        <div className={`rounded-xl px-4 py-2 text-sm font-bold ${isStable ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {isStable ? '✅ Stable — proceed to monitoring' : '⚠️ Still unstable — consider further treatment'}
        </div>

        {/* Checklist */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Monitoring Checklist</div>
          <Check id="ecg_recheck" label="📈 12-Lead ECG (re-check)" sub="What rhythm now? Any changes?" />
          <Check id="iv_access" label="💉 IV Access confirmed" />
          <Check id="o2_check" label="🫁 O₂ if SpO₂ < 94%" />
          <Check id="labs_sent" label="🔬 Labs sent (CBC, BMP, Troponin)" />
          <Check id="monitor_continuous" label="🖥️ Continuous monitoring" />
        </div>

        <button onClick={() => {
          saveVitals();
          if (isStable) setPhase('disposition');
        }} className={`w-full btn-action py-3.5 text-sm font-bold ${isStable ? 'btn-success' : 'btn-warning'}`}>
          {isStable ? '✅ Stable → Disposition' : '⚠️ Save & Continue Monitoring'}
        </button>

        <button onClick={() => {
          saveVitals();
          onRecheckPulse();
        }} className="w-full btn-action btn-info py-3 text-sm">
          🔄 Re-assess — Rhythm/Rate Changed?
        </button>

        {/* If not stable, option to go back to treatment */}
        {!isStable && (
          <button onClick={onRecheckPulse} className="w-full btn-action btn-warning py-3 text-sm">
            ← Back to Treatment
          </button>
        )}

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== DISPOSITION =====
  if (phase === 'disposition') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">Stable — Disposition</div>
        <div className="text-5xl">✅</div>
        <h1 className="text-xl font-black text-text-primary">Patient Stable</h1>
        <p className="text-sm text-text-secondary">BP {bpSys}/{bpDia} MAP {map} HR {hr} SpO₂ {spo2}%</p>

        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Disposition</div>
          <Check id="handover" label="📋 SBAR Handover" sub="Situation, Background, Assessment, Recommendation" />
          <Check id="consult" label="📞 Consult (Cardiology / Neurology / ICU)" />
          <Check id="family" label="👥 Family informed" />
          <Check id="documentation" label="📝 Documentation complete" />
        </div>

        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Transfer to</div>
          <div className="grid grid-cols-2 gap-2">
            {['ICU', 'CCU', 'Ward', 'Cath Lab', 'OR', 'Other'].map(d => (
              <button key={d} onClick={() => {
                addEvent({ elapsed, category: 'other', type: `🏥 Disposition: ${d}`, details: { disposition: d } });
                toggleCheck('disposition_set', `Disposition: ${d}`);
              }} className={`py-2.5 rounded-lg text-xs font-semibold ${
                checklist.disposition_set ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>{d}</button>
            ))}
          </div>
        </div>

        <button onClick={() => {
          addEvent({ elapsed, category: 'other', type: '✅ Case completed — patient transferred', details: {} });
          onDone();
        }} className="w-full btn-action btn-success py-4 text-sm font-bold">
          ✅ Case Complete → Dashboard
        </button>

        {/* Still can deteriorate */}
        <button onClick={() => setPhase('reassess')} className="text-text-muted text-xs underline">← Re-assess (deteriorating?)</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  return null;
}
