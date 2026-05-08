import { useState } from 'react';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import { HeartPulse } from 'lucide-react';

function CheckItem({ label, sub, checked, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1.5 text-left transition-colors ${
        checked ? 'bg-success/10 border border-success/30' : 'bg-bg-primary border border-bg-tertiary'
      }`}>
      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 ${
        checked ? 'bg-success text-white' : 'bg-bg-tertiary text-text-muted'
      }`}>{checked ? '✓' : ''}</span>
      <div>
        <div className="text-xs font-semibold text-text-primary">{label}</div>
        {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
      </div>
    </button>
  );
}

// MI/ACS Pathway — AHA Guideline
// Flow: Symptoms → MONA → 12-Lead ECG → STEMI vs NSTEMI → PCI/Fibrinolytic/Medical
export default function MIACSPathway({ onLog, onMonitor, onArrest, onRecheckPulse, isTraining }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const [phase, setPhase] = useState('initial');
  const [checklist, setChecklist] = useState({});
  const [painScore, setPainScore] = useState(7);
  const [, setEcgResult] = useState(null);
  const [timiScore, setTimiScore] = useState({});
  const [d2bStart, setD2bStart] = useState(null);
  const [d2nStart, setD2nStart] = useState(null);

  const toggleCheck = (key) => {
    setChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (!prev[key]) onLog('other', `☐→✅ ${key}`);
      return updated;
    });
  };

  // ===== INITIAL ASSESSMENT =====
  if (phase === 'initial') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">Acute Coronary Syndrome</div>
        <div className="pathway-icon-tile bg-danger/12 text-danger"><HeartPulse size={32} strokeWidth={2.2} /></div>
        <h1 className="text-xl font-black text-text-primary">ACS Assessment</h1>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            12-Lead ECG within 10 min. MONA: Morphine, O₂, NTG, Aspirin. Aspirin first!
          </div>
        )}

        {/* Symptoms checklist */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Presenting Symptoms</div>
          <CheckItem id="chest_pain" label="Chest pain / tightness" sub="Substernal, pressure, squeezing" checked={!!checklist['chest_pain']} onToggle={() => toggleCheck('chest_pain')} />
          <CheckItem id="radiating" label="Radiating to arm / jaw / back" checked={!!checklist['radiating']} onToggle={() => toggleCheck('radiating')} />
          <CheckItem id="diaphoresis" label="Diaphoresis (sweating)" checked={!!checklist['diaphoresis']} onToggle={() => toggleCheck('diaphoresis')} />
          <CheckItem id="nausea" label="Nausea / vomiting" checked={!!checklist['nausea']} onToggle={() => toggleCheck('nausea')} />
          <CheckItem id="dyspnea" label="Dyspnea (shortness of breath)" checked={!!checklist['dyspnea']} onToggle={() => toggleCheck('dyspnea')} />
        </div>

        {/* Pain score */}
        <div className="glass-card !p-3">
          <ScrollPicker label="Pain Score" value={painScore} onChange={setPainScore}
            min={0} max={10} step={1} alertHigh={7} />
        </div>

        <button onClick={() => {
          onLog('other', `🫀 ACS Assessment — Pain ${painScore}/10`);
          setPhase('mona');
        }} className="w-full btn-action btn-danger py-4 text-sm font-bold">
          Start MONA Protocol →
        </button>

        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-assess</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== MONA + 12-LEAD =====
  if (phase === 'mona') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">ACS — Immediate Treatment</div>
        <h1 className="text-xl font-black text-text-primary">MONA Protocol + 12-Lead</h1>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs text-text-muted font-semibold mb-2">Do these NOW (tick as done)</div>

          <CheckItem id="ecg_12lead" label="📈 12-Lead ECG (within 10 min)"
            sub="📸 Take photo for record" checked={!!checklist['ecg_12lead']} onToggle={() => toggleCheck('ecg_12lead')} />

          <CheckItem id="iv_access" label="💉 IV Access" checked={!!checklist['iv_access']} onToggle={() => toggleCheck('iv_access')} />

          <CheckItem id="aspirin" label="💊 Aspirin 325mg — CHEW & swallow"
            sub="Non-enteric coated. Give to ALL ACS unless true allergy." checked={!!checklist['aspirin']} onToggle={() => toggleCheck('aspirin')} />

          <CheckItem id="ntg" label="💊 NTG 0.4mg Sublingual"
            sub="⚠️ CI: SBP<90, RV infarct, PDE5 inhibitor 24-48hr. Repeat q5min x3." checked={!!checklist['ntg']} onToggle={() => toggleCheck('ntg')} />

          <CheckItem id="morphine" label="💉 Morphine 2-4mg IV (if pain persists)"
            sub="IV push slow 1-2min. Only after NTG x3 failed. Watch BP." checked={!!checklist['morphine']} onToggle={() => toggleCheck('morphine')} />

          <CheckItem id="o2" label="🫁 O₂ if SpO₂ < 94%"
            sub="Titrate to SpO₂ 94-98%. Avoid hyperoxia." checked={!!checklist['o2']} onToggle={() => toggleCheck('o2')} />
        </div>

        {checklist.ntg && (
          <div className="glass-card !p-3">
            <div className="text-xs text-text-muted mb-1">Pain after NTG?</div>
            <ScrollPicker label="Pain Score now" value={painScore} onChange={setPainScore}
              min={0} max={10} step={1} alertHigh={5} />
          </div>
        )}

        <button onClick={() => {
          onLog('other', '📈 Proceeding to 12-Lead ECG interpretation');
          setPhase('ecg_result');
        }} className="w-full btn-action btn-info py-4 text-sm font-bold">
          📈 Interpret 12-Lead ECG →
        </button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== ECG RESULT =====
  if (phase === 'ecg_result') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">12-Lead ECG Result</div>
        <h1 className="text-xl font-black text-text-primary">What does ECG show?</h1>

        <div className="grid grid-cols-1 gap-2.5">
          <button onClick={() => {
            setEcgResult('stemi');
            onLog('rhythm', '📈 STEMI identified on 12-Lead');
            setPhase('stemi');
          }} className="btn-action btn-danger py-4 text-sm font-bold text-left px-4">
            <div>🔴 STEMI</div>
            <div className="text-[10px] font-normal opacity-80">ST elevation ≥1mm in ≥2 contiguous leads</div>
          </button>

          <button onClick={() => {
            setEcgResult('nstemi');
            onLog('rhythm', '📈 NSTEMI / UA identified');
            setPhase('nstemi');
          }} className="btn-action btn-warning py-4 text-sm font-bold text-left px-4">
            <div>🟡 NSTEMI / Unstable Angina</div>
            <div className="text-[10px] font-normal opacity-80">ST depression, T inversion, or dynamic changes + Troponin</div>
          </button>

          <button onClick={() => {
            setEcgResult('normal');
            onLog('rhythm', '📈 ECG non-diagnostic — monitor');
            onMonitor();
          }} className="btn-action btn-success py-4 text-sm font-bold text-left px-4">
            <div>🟢 Normal / Non-diagnostic</div>
            <div className="text-[10px] font-normal opacity-80">No acute changes — serial ECG + Troponin</div>
          </button>
        </div>

        <div className="text-[10px] text-text-muted">Not sure? Take photo → consult cardiology</div>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== STEMI =====
  if (phase === 'stemi') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">STEMI — Time Critical!</div>
        <h1 className="text-xl font-black text-text-primary">STEMI Management</h1>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            PCI preferred if available within 120 min. Otherwise fibrinolytic within 30 min (D2N).
          </div>
        )}

        {/* Door to Balloon timer */}
        {d2bStart && (
          <div className="glass-card !p-2 text-center">
            <div className="text-[10px] text-text-muted">Door-to-Balloon</div>
            <div className={`text-xl font-mono font-black ${
              (elapsed - d2bStart) > 5400 ? 'text-danger' : 'text-info'
            }`}>
              {Math.floor((elapsed - d2bStart) / 60)}:{String((elapsed - d2bStart) % 60).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-text-muted">Target: &lt;90 min</div>
          </div>
        )}

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs text-text-muted font-semibold mb-2">STEMI Checklist</div>

          <CheckItem id="activate_cath" label="📞 Activate Cath Lab / Call Cardio"
            sub="Start Door-to-Balloon timer" checked={!!checklist['activate_cath']} onToggle={() => toggleCheck('activate_cath')} />

          <CheckItem id="antiplatelet" label="💊 Antiplatelet Loading" sub="Clopidogrel 600mg OR Ticagrelor 180mg" checked={!!checklist['antiplatelet']} onToggle={() => toggleCheck('antiplatelet')} />

          <CheckItem id="heparin_bolus" label="💉 Heparin 60u/kg IV bolus (max 4000u)"
            sub="Weight-based — flush after" checked={!!checklist['heparin_bolus']} onToggle={() => toggleCheck('heparin_bolus')} />

          <CheckItem id="heparin_drip" label="💉 Heparin 12u/kg/hr drip (max 1000u/hr)"
            sub="Target aPTT 50-70 sec" checked={!!checklist['heparin_drip']} onToggle={() => toggleCheck('heparin_drip')} />

          <CheckItem id="beta_blocker" label="💊 Beta-blocker (if no CI)"
            sub="Metoprolol 5mg IV q5min x3. CI: HR<60, SBP<100, HF, Asthma" checked={!!checklist['beta_blocker']} onToggle={() => toggleCheck('beta_blocker')} />

          <CheckItem id="statin" label="💊 Atorvastatin 80mg PO" checked={!!checklist['statin']} onToggle={() => toggleCheck('statin')} />
        </div>

        {!d2bStart && (
          <button onClick={() => {
            setD2bStart(elapsed);
            onLog('other', '⏱️ Door-to-Balloon timer started');
          }} className="w-full btn-action btn-info py-3 text-sm font-bold">
            ⏱️ Start D2B Timer
          </button>
        )}

        {/* No PCI available → Fibrinolytic */}
        <button onClick={() => {
          onLog('other', '❌ PCI not available → Fibrinolytic pathway');
          setPhase('fibrinolytic');
        }} className="w-full btn-action btn-warning py-3 text-sm">
          ❌ No PCI available → Fibrinolytic
        </button>

        <button onClick={() => {
          onLog('other', '✅ STEMI management complete → Monitor');
          onMonitor();
        }} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Done → Monitor</button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== FIBRINOLYTIC =====
  if (phase === 'fibrinolytic') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-warning">Fibrinolytic Therapy</div>
        <h1 className="text-xl font-black text-text-primary">tPA / Tenecteplase Criteria</h1>

        {/* D2N timer */}
        {d2nStart && (
          <div className="glass-card !p-2 text-center">
            <div className="text-[10px] text-text-muted">Door-to-Needle</div>
            <div className={`text-xl font-mono font-black ${
              (elapsed - d2nStart) > 1800 ? 'text-danger' : 'text-success'
            }`}>
              {Math.floor((elapsed - d2nStart) / 60)}:{String((elapsed - d2nStart) % 60).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-text-muted">Target: &lt;30 min</div>
          </div>
        )}

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs font-semibold text-success mb-2">✅ Inclusion (must meet ALL)</div>
          <CheckItem id="fib_st" label="ST elevation ≥1mm in ≥2 leads" checked={!!checklist['fib_st']} onToggle={() => toggleCheck('fib_st')} />
          <CheckItem id="fib_onset" label="Onset < 12 hours" checked={!!checklist['fib_onset']} onToggle={() => toggleCheck('fib_onset')} />
          <CheckItem id="fib_no_pci" label="Cannot PCI within 120 min" checked={!!checklist['fib_no_pci']} onToggle={() => toggleCheck('fib_no_pci')} />
        </div>

        <div className="glass-card !p-3 text-left space-y-0.5">
          <div className="text-xs font-semibold text-danger mb-2">❌ Contraindications (must have NONE)</div>
          <CheckItem id="fib_no_bleed" label="No active bleeding" checked={!!checklist['fib_no_bleed']} onToggle={() => toggleCheck('fib_no_bleed')} />
          <CheckItem id="fib_no_ich" label="No prior ICH" checked={!!checklist['fib_no_ich']} onToggle={() => toggleCheck('fib_no_ich')} />
          <CheckItem id="fib_no_stroke" label="No ischemic stroke <3 months" checked={!!checklist['fib_no_stroke']} onToggle={() => toggleCheck('fib_no_stroke')} />
          <CheckItem id="fib_no_tumor" label="No brain tumor / AVM" checked={!!checklist['fib_no_tumor']} onToggle={() => toggleCheck('fib_no_tumor')} />
          <CheckItem id="fib_no_surgery" label="No major surgery <3 weeks" checked={!!checklist['fib_no_surgery']} onToggle={() => toggleCheck('fib_no_surgery')} />
          <CheckItem id="fib_bp_ok" label="BP < 185/110" checked={!!checklist['fib_bp_ok']} onToggle={() => toggleCheck('fib_bp_ok')} />
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
          onLog('drug', '💉 Tenecteplase IV bolus (weight-based)');
          toggleCheck('fibrinolytic_given');
        }} className="w-full btn-action btn-purple py-3.5 text-sm font-bold">
          💉 Give Fibrinolytic (Tenecteplase)
        </button>

        <div className="glass-card !p-2 text-left text-[10px] text-text-secondary">
          <div className="font-bold text-text-primary mb-1">Tenecteplase dosing:</div>
          <div>&lt;60kg=30mg | 60-69=35mg | 70-79=40mg | 80-89=45mg | ≥90=50mg</div>
          <div className="mt-1">Single IV bolus over 5 sec</div>
        </div>

        <button onClick={() => { setPhase('stemi'); }} className="text-text-muted text-xs underline">← Back to STEMI</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== NSTEMI =====
  if (phase === 'nstemi') {
    const timiTotal = Object.values(timiScore).filter(Boolean).length;
    const timiRisk = timiTotal >= 5 ? 'High' : timiTotal >= 3 ? 'Intermediate' : 'Low';
    const timiColor = timiTotal >= 5 ? 'text-danger' : timiTotal >= 3 ? 'text-warning' : 'text-success';

    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-warning">NSTEMI / Unstable Angina</div>
        <h1 className="text-xl font-black text-text-primary">Risk Stratification</h1>

        {/* TIMI Score */}
        <div className="glass-card !p-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted">TIMI Risk Score</span>
            <span className={`text-lg font-mono font-black ${timiColor}`}>{timiTotal}/7 ({timiRisk})</span>
          </div>
          {[
            { key: 'age65', label: 'Age ≥ 65' },
            { key: 'cad_risk', label: '≥ 3 CAD risk factors' },
            { key: 'known_cad', label: 'Known CAD (stenosis ≥50%)' },
            { key: 'asa_use', label: 'ASA use in last 7 days' },
            { key: 'angina_2x', label: '≥ 2 angina episodes in 24hr' },
            { key: 'st_dev', label: 'ST deviation ≥ 0.5mm' },
            { key: 'troponin', label: 'Troponin (+)' },
          ].map(t => (
            <button key={t.key} onClick={() => setTimiScore(prev => ({ ...prev, [t.key]: !prev[t.key] }))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-left ${
                timiScore[t.key] ? 'bg-warning/10 border border-warning/30' : 'bg-bg-primary border border-bg-tertiary'
              }`}>
              <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center ${
                timiScore[t.key] ? 'bg-warning text-white' : 'bg-bg-tertiary'
              }`}>{timiScore[t.key] ? '✓' : ''}</span>
              <span className="text-xs text-text-primary">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Treatment based on risk */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs font-semibold text-text-muted mb-2">Treatment Plan</div>
          {timiTotal >= 5 && <div className="text-xs text-danger font-bold mb-1">High Risk → Early invasive (&lt;24hr)</div>}
          {timiTotal >= 3 && timiTotal < 5 && <div className="text-xs text-warning font-bold mb-1">Intermediate → Invasive (&lt;72hr)</div>}
          {timiTotal < 3 && <div className="text-xs text-success font-bold mb-1">Low Risk → Medical management</div>}

          <CheckItem id="nst_antiplatelet" label="💊 Antiplatelet (Clopidogrel/Ticagrelor)" checked={!!checklist['nst_antiplatelet']} onToggle={() => toggleCheck('nst_antiplatelet')} />
          <CheckItem id="nst_anticoag" label="💉 Anticoagulation (Heparin/Enoxaparin)" checked={!!checklist['nst_anticoag']} onToggle={() => toggleCheck('nst_anticoag')} />
          <CheckItem id="nst_beta" label="💊 Beta-blocker" checked={!!checklist['nst_beta']} onToggle={() => toggleCheck('nst_beta')} />
          <CheckItem id="nst_statin" label="💊 High-dose Statin" checked={!!checklist['nst_statin']} onToggle={() => toggleCheck('nst_statin')} />
          <CheckItem id="nst_serial_ecg" label="📈 Serial ECG monitoring" checked={!!checklist['nst_serial_ecg']} onToggle={() => toggleCheck('nst_serial_ecg')} />
          <CheckItem id="nst_serial_trop" label="🔬 Serial Troponin q6hr" checked={!!checklist['nst_serial_trop']} onToggle={() => toggleCheck('nst_serial_trop')} />
          <CheckItem id="nst_cardio" label="📞 Cardiology consult" checked={!!checklist['nst_cardio']} onToggle={() => toggleCheck('nst_cardio')} />
        </div>

        <button onClick={() => {
          onLog('other', `✅ NSTEMI management — TIMI ${timiTotal} (${timiRisk}) → Monitor`);
          onMonitor();
        }} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Done → Monitor</button>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  return null;
}
