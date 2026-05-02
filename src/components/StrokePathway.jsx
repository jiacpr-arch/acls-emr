import { useState } from 'react';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import { Brain } from 'lucide-react';

// Stroke Pathway — AHA/ASA Guideline
// Flow: FAST → Vitals + DTX → NIHSS → CT → tPA criteria → Treatment
export default function StrokePathway({ onLog, onMonitor, onArrest, onRecheckPulse, isTraining }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const [phase, setPhase] = useState('fast');
  const [checklist, setChecklist] = useState({});
  const [fast, setFast] = useState({});
  const [onsetHour, setOnsetHour] = useState(0);
  const [onsetMin, setOnsetMin] = useState(0);
  const [nihss, setNihss] = useState({});
  const [ctResult, setCtResult] = useState(null);
  const [d2nStart, setD2nStart] = useState(null);
  const [dtx, setDtx] = useState(120);

  const toggleCheck = (key) => {
    setChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (!prev[key]) onLog('other', `☐→✅ ${key}`);
      return updated;
    });
  };

  const Check = ({ id, label, sub }) => (
    <button onClick={() => toggleCheck(id)}
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

  // ===== FAST ASSESSMENT =====
  if (phase === 'fast') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">Stroke Assessment</div>
        <div className="pathway-icon-tile bg-purple/12 text-purple"><Brain size={32} strokeWidth={2.2} /></div>
        <h1 className="text-xl font-black text-text-primary">FAST Assessment</h1>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            Check DTX first! Hypoglycemia can mimic stroke. Time of onset is critical for tPA window.
          </div>
        )}

        <div className="glass-card !p-3 text-left space-y-2">
          {/* Face */}
          <div>
            <div className="text-xs font-semibold text-text-primary">F — Face</div>
            <div className="flex gap-2 mt-1">
              {['Normal', 'Abnormal'].map(v => (
                <button key={v} onClick={() => setFast(p => ({ ...p, face: v }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                    fast.face === v ? (v === 'Abnormal' ? 'bg-danger text-white' : 'bg-success text-white') : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v === 'Abnormal' ? '❌ Facial droop' : '✅ Normal'}</button>
              ))}
            </div>
          </div>

          {/* Arms */}
          <div>
            <div className="text-xs font-semibold text-text-primary">A — Arms</div>
            <div className="flex gap-2 mt-1">
              {['Normal', 'Left drift', 'Right drift', 'Both'].map(v => (
                <button key={v} onClick={() => setFast(p => ({ ...p, arms: v }))}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-semibold ${
                    fast.arms === v ? (v === 'Normal' ? 'bg-success text-white' : 'bg-danger text-white') : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v}</button>
              ))}
            </div>
          </div>

          {/* Speech */}
          <div>
            <div className="text-xs font-semibold text-text-primary">S — Speech</div>
            <div className="flex gap-2 mt-1">
              {['Normal', 'Slurred', 'Unable'].map(v => (
                <button key={v} onClick={() => setFast(p => ({ ...p, speech: v }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                    fast.speech === v ? (v === 'Normal' ? 'bg-success text-white' : 'bg-danger text-white') : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v}</button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <div className="text-xs font-semibold text-text-primary mb-1">T — Time of Onset</div>
            <div className="flex gap-2 items-center">
              <ScrollPicker label="Hours ago" value={onsetHour} onChange={setOnsetHour} min={0} max={24} step={1} />
              <ScrollPicker label="Minutes" value={onsetMin} onChange={setOnsetMin} min={0} max={59} step={5} />
            </div>
            <button onClick={() => setFast(p => ({ ...p, wakeup: true }))}
              className={`mt-2 w-full py-2 rounded-lg text-xs font-semibold ${
                fast.wakeup ? 'bg-warning text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>Wake-up stroke (unknown onset)</button>

            {onsetHour * 60 + onsetMin <= 180 && !fast.wakeup && (
              <div className="text-xs text-success font-bold mt-1">🟢 Within 3hr tPA window</div>
            )}
            {onsetHour * 60 + onsetMin > 180 && onsetHour * 60 + onsetMin <= 270 && (
              <div className="text-xs text-warning font-bold mt-1">🟡 3-4.5hr — extended tPA window</div>
            )}
            {onsetHour * 60 + onsetMin > 270 && !fast.wakeup && (
              <div className="text-xs text-danger font-bold mt-1">🔴 &gt;4.5hr — tPA window closed</div>
            )}
          </div>
        </div>

        <button onClick={() => {
          onLog('other', `🧠 FAST: F=${fast.face} A=${fast.arms} S=${fast.speech} T=${onsetHour}h${onsetMin}m`);
          setPhase('initial_tx');
        }} className="w-full btn-action btn-purple py-4 text-sm font-bold">
          Continue → Initial Treatment
        </button>

        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-assess</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== INITIAL TREATMENT =====
  if (phase === 'initial_tx') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">Stroke — Immediate Care</div>
        <h1 className="text-xl font-black text-text-primary">Initial Treatment</h1>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <Check id="str_abc" label="ABCs — Airway/Breathing/Circulation" />
          <Check id="str_o2" label="🫁 O₂ if SpO₂ < 94%" />
          <Check id="str_iv" label="💉 IV Access" />
          <Check id="str_vitals" label="📊 Vitals: BP, HR, SpO₂, RR, Temp" />
          <Check id="str_avpu" label="🧠 AVPU / GCS" />
          <Check id="str_ecg" label="📈 12-Lead ECG (look for AF)" />
        </div>

        {/* DTX — critical! */}
        <div className="glass-card !p-3">
          <ScrollPicker label="🔬 DTX (Blood Glucose)" value={dtx} onChange={setDtx}
            min={10} max={500} step={5} unit="mg/dL" alertLow={60} />
          {dtx < 60 && (
            <div className="text-xs text-danger font-bold mt-1">
              ⚠️ Hypoglycemia! Give glucose — MAY NOT BE STROKE!
            </div>
          )}
        </div>

        <button onClick={() => {
          onLog('other', `🧠 Initial stroke workup done. DTX=${dtx}`);
          setPhase('nihss');
        }} className="w-full btn-action btn-purple py-4 text-sm font-bold">
          Continue → NIHSS Score
        </button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== NIHSS =====
  if (phase === 'nihss') {
    const nihssItems = [
      { key: '1a', label: '1a. LOC', max: 3 },
      { key: '1b', label: '1b. LOC Questions', max: 2 },
      { key: '1c', label: '1c. LOC Commands', max: 2 },
      { key: '2', label: '2. Best Gaze', max: 2 },
      { key: '3', label: '3. Visual Fields', max: 3 },
      { key: '4', label: '4. Facial Palsy', max: 3 },
      { key: '5a', label: '5a. Motor L Arm', max: 4 },
      { key: '5b', label: '5b. Motor R Arm', max: 4 },
      { key: '6a', label: '6a. Motor L Leg', max: 4 },
      { key: '6b', label: '6b. Motor R Leg', max: 4 },
      { key: '7', label: '7. Limb Ataxia', max: 2 },
      { key: '8', label: '8. Sensory', max: 2 },
      { key: '9', label: '9. Language', max: 3 },
      { key: '10', label: '10. Dysarthria', max: 2 },
      { key: '11', label: '11. Extinction', max: 2 },
    ];

    const total = Object.values(nihss).reduce((a, b) => a + b, 0);
    const severity = total <= 4 ? 'Minor' : total <= 15 ? 'Moderate' : total <= 20 ? 'Mod-Severe' : 'Severe';
    const sevColor = total <= 4 ? 'text-success' : total <= 15 ? 'text-warning' : 'text-danger';

    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">NIHSS Score</div>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-xl font-black text-text-primary">NIHSS</h1>
          <span className={`text-3xl font-mono font-black ${sevColor}`}>{total}/42</span>
          <span className={`text-xs font-bold ${sevColor}`}>{severity}</span>
        </div>

        <div className="glass-card !p-3 text-left max-h-[50vh] overflow-y-auto space-y-2">
          {nihssItems.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-xs text-text-primary font-medium">{item.label}</span>
              <div className="flex gap-1">
                {Array.from({ length: item.max + 1 }, (_, i) => (
                  <button key={i} onClick={() => setNihss(prev => ({ ...prev, [item.key]: i }))}
                    className={`w-7 h-7 rounded text-xs font-bold ${
                      (nihss[item.key] || 0) === i
                        ? (i === 0 ? 'bg-success text-white' : 'bg-danger text-white')
                        : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                    }`}>{i}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total >= 6 && (
          <div className="text-xs text-warning font-bold">
            ⚠️ NIHSS ≥6 — Consider thrombectomy if LVO confirmed
          </div>
        )}

        <button onClick={() => {
          onLog('other', `🧠 NIHSS = ${total}/42 (${severity})`);
          setPhase('ct');
        }} className="w-full btn-action btn-purple py-4 text-sm font-bold">
          Continue → CT Brain
        </button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== CT RESULT =====
  if (phase === 'ct') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">CT Brain Result</div>
        <h1 className="text-xl font-black text-text-primary">CT Result</h1>

        <div className="grid grid-cols-1 gap-2.5">
          <button onClick={() => {
            setCtResult('ischemic');
            onLog('other', '🧠 CT: No hemorrhage → Ischemic stroke');
            setPhase('tpa_criteria');
          }} className="btn-action btn-info py-4 text-sm font-bold text-left px-4">
            <div>⚪ Normal / Ischemic</div>
            <div className="text-[10px] font-normal opacity-80">No hemorrhage → Consider tPA</div>
          </button>

          <button onClick={() => {
            setCtResult('hemorrhagic');
            onLog('other', '🧠 CT: Hemorrhagic stroke');
            setPhase('hemorrhagic');
          }} className="btn-action btn-danger py-4 text-sm font-bold text-left px-4">
            <div>🔴 Hemorrhagic</div>
            <div className="text-[10px] font-normal opacity-80">Bleeding → Neurosurgery consult</div>
          </button>
        </div>

        <div className="text-[10px] text-text-muted">📸 Take photo of CT for record</div>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== tPA CRITERIA =====
  if (phase === 'tpa_criteria') {
    const timeMinutes = onsetHour * 60 + onsetMin;
    const withinWindow = timeMinutes <= 270 || fast.wakeup;

    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">tPA (Alteplase) Criteria</div>
        <h1 className="text-xl font-black text-text-primary">tPA Eligibility</h1>

        {/* D2N timer */}
        {d2nStart && (
          <div className="glass-card !p-2 text-center">
            <div className="text-[10px] text-text-muted">Door-to-Needle</div>
            <div className={`text-xl font-mono font-black ${
              (elapsed - d2nStart) > 3600 ? 'text-danger' : 'text-success'
            }`}>
              {Math.floor((elapsed - d2nStart) / 60)}:{String((elapsed - d2nStart) % 60).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-text-muted">Target: &lt;60 min</div>
          </div>
        )}

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs font-semibold text-success mb-2">✅ Inclusion</div>
          <Check id="tpa_dx" label="Clinical dx: ischemic stroke" />
          <Check id="tpa_deficit" label="Measurable neurologic deficit" />
          <Check id="tpa_time" label={`Onset < 4.5hr (current: ${timeMinutes}min)`} />
          <Check id="tpa_age" label="Age ≥ 18" />
          <Check id="tpa_ct" label="CT: no hemorrhage" />
        </div>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs font-semibold text-danger mb-2">❌ Contraindications (must have NONE)</div>
          <Check id="tpa_no_bleed" label="No active internal bleeding" />
          <Check id="tpa_no_surgery" label="No intracranial surgery <3mo" />
          <Check id="tpa_no_ich" label="No prior ICH" />
          <Check id="tpa_no_avm" label="No intracranial neoplasm/AVM" />
          <Check id="tpa_plt" label="Platelet > 100,000" />
          <Check id="tpa_inr" label="INR < 1.7" />
          <Check id="tpa_bp" label="BP controlled < 185/110" />
        </div>

        {!d2nStart && (
          <button onClick={() => {
            setD2nStart(elapsed);
            onLog('other', '⏱️ Door-to-Needle timer started');
          }} className="w-full btn-action btn-info py-3 text-sm font-bold">
            ⏱️ Start D2N Timer
          </button>
        )}

        <button onClick={() => {
          onLog('drug', '💉 tPA (Alteplase) 0.9mg/kg — 10% bolus 1min + 90% drip 60min');
          setPhase('tpa_admin');
        }} className="w-full btn-action btn-purple py-3.5 text-sm font-bold">
          ✅ Eligible → Give tPA
        </button>

        <button onClick={() => {
          onLog('other', '❌ tPA not eligible — medical management');
          onMonitor();
        }} className="w-full btn-action btn-ghost py-3 text-sm">
          ❌ Not Eligible → Medical Rx
        </button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== tPA ADMINISTRATION =====
  if (phase === 'tpa_admin') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">tPA Administration</div>
        <h1 className="text-xl font-black text-text-primary">Alteplase 0.9 mg/kg</h1>

        <div className="glass-card !p-3 text-left text-xs text-text-secondary">
          <div className="font-bold text-text-primary mb-1">Dosing (max 90mg):</div>
          <div>10% = bolus IV over 1 min</div>
          <div>90% = infusion over 60 min</div>
          <div className="mt-1 text-[10px]">Do NOT shake vial</div>
        </div>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <Check id="tpa_bp_pre" label="BP < 185/110 confirmed" />
          <Check id="tpa_consent" label="Consent signed" />
          <Check id="tpa_bolus" label="10% bolus given" />
          <Check id="tpa_infusion_start" label="90% infusion started" />
          <Check id="tpa_infusion_end" label="90% infusion completed (60min)" />
        </div>

        <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 text-left text-xs text-danger">
          <div className="font-bold mb-1">⚠️ During tPA:</div>
          <div>• Monitor BP q15min x 2hr</div>
          <div>• No NG tube, Foley, arterial line for 24hr</div>
          <div>• No antiplatelet/anticoagulant for 24hr</div>
          <div>• Watch for hemorrhage signs (headache, neuro worsening)</div>
        </div>

        <button onClick={() => {
          onLog('other', '✅ tPA administration complete → Monitor');
          onMonitor();
        }} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Done → Monitor</button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== HEMORRHAGIC STROKE =====
  if (phase === 'hemorrhagic') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">Hemorrhagic Stroke</div>
        <h1 className="text-xl font-black text-text-primary">ICH Management</h1>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <Check id="hem_reverse" label="Reverse anticoagulation (if on any)" sub="Warfarin→VitK+PCC | DOAC→specific reversal | Heparin→Protamine" />
          <Check id="hem_bp" label="BP control: target SBP 140" sub="Nicardipine 5mg/hr IV or Labetalol 10-20mg IV" />
          <Check id="hem_neuro" label="📞 Neurosurgery consult" />
          <Check id="hem_head" label="Head elevation 30°" />
          <Check id="hem_seizure" label="Seizure prophylaxis" />
          <Check id="hem_repeat_ct" label="Repeat CT in 6-24hr" />
          <Check id="hem_labs" label="🔬 Labs: PT/INR, aPTT, Platelet" />
        </div>

        <button onClick={() => {
          onLog('other', '✅ Hemorrhagic stroke management → Monitor');
          onMonitor();
        }} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Done → Monitor</button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  return null;
}
