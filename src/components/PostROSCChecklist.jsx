import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { exportCasePDF } from '../utils/exportPDF';
import { calculateScore } from '../utils/scoring';
import ScrollPicker from './ScrollPicker';

// Post-ROSC needs actual value entry, not just checkboxes

// Post-ROSC Care Checklist — AHA Guideline
// Must complete ALL items before case can end
export default function PostROSCChecklist({ onDone, isTraining, onBrady, onTachy, onMI, onArrest }) {
  const { currentCase, events, patient, team, etco2Readings, shockCount } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);
  const addEvent = useCaseStore(s => s.addEvent);
  const [checklist, setChecklist] = useState({});
  const [tab, setTab] = useState('airway');
  const [showScore, setShowScore] = useState(false);

  // Actual values
  const [bpSys, setBpSys] = useState(110);
  const [bpDia, setBpDia] = useState(70);
  const [hr, setHr] = useState(90);
  const [spo2, setSpo2] = useState(96);
  const [rr, setRr] = useState(14);
  const [etco2, setEtco2] = useState(38);
  const [temp, setTemp] = useState(37.0);
  const [fio2, setFio2] = useState(100);
  const [followCommand, setFollowCommand] = useState(null);
  const map = Math.round((bpSys + 2 * bpDia) / 3);

  const toggleCheck = (key, label) => {
    setChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (!prev[key]) addEvent({ elapsed, category: 'other', type: `✅ Post-ROSC: ${label}`, details: { step: key } });
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

  const totalItems = 15;
  const doneItems = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((doneItems / totalItems) * 100);

  const handleExport = () => {
    const timer = useTimerStore.getState();
    const caseData = {
      id: currentCase?.id, mode: currentCase?.mode,
      startTime: currentCase?.startTime, endTime: new Date(),
      outcome: 'ROSC', events, patient, team, etco2Readings,
      ccf: timer.getCCF(), totalCPRTime: Math.round(timer.totalCPRTime),
      totalPauseTime: Math.round(timer.totalPauseTime),
      cycleNumber: timer.cycleNumber, shockCount, elapsed: Math.round(timer.elapsed),
    };
    exportCasePDF(caseData);
  };

  const tabs = [
    { key: 'airway', label: '🫁 Airway', count: ['airway_secure', 'etco2_confirm', 'o2_titrate'].filter(k => checklist[k]).length, total: 3 },
    { key: 'hemo', label: '💉 Hemo', count: ['vitals_check', 'map_65', 'fluid_vaso'].filter(k => checklist[k]).length, total: 3 },
    { key: 'ecg', label: '📈 ECG', count: ['ecg_12lead', 'stemi_check'].filter(k => checklist[k]).length, total: 2 },
    { key: 'ttm', label: '🌡️ TTM', count: ['ttm_assess', 'ttm_start'].filter(k => checklist[k]).length, total: 2 },
    { key: 'labs', label: '🔬 Labs', count: ['labs_order', 'glucose_ctrl'].filter(k => checklist[k]).length, total: 2 },
    { key: 'neuro', label: '🧠 Neuro', count: ['neuro_gcs', 'seizure_check'].filter(k => checklist[k]).length, total: 2 },
    { key: 'consult', label: '📞 Disp', count: ['consult_done'].filter(k => checklist[k]).length, total: 1 },
  ];

  return (
    <div className="text-center space-y-3 animate-slide-up px-2">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">Post-ROSC Care</div>
      <h1 className="text-xl font-black text-text-primary">💚 ROSC — Complete Checklist</h1>

      {/* Progress bar */}
      <div className="glass-card !p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">{doneItems}/{totalItems} completed</span>
          <span className={`text-xs font-bold ${progress === 100 ? 'text-success' : 'text-warning'}`}>{progress}%</span>
        </div>
        <div className="progress-track !h-2">
          <div className={`progress-fill ${progress === 100 ? 'bg-success' : 'bg-info'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              tab === t.key ? 'bg-info text-white' : t.count === t.total ? 'bg-success/10 text-success' : 'bg-bg-primary text-text-muted'
            }`}>
            {t.label} {t.count}/{t.total}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card !p-3 text-left max-h-[45vh] overflow-y-auto">
        {tab === 'airway' && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted mb-1">Airway & Oxygenation</div>
            <Check id="airway_secure" label="Secure airway — confirm ETT position" sub="EtCO₂ waveform + auscultation + CXR" />
            <ScrollPicker label="SpO₂" value={spo2} onChange={setSpo2} min={50} max={100} step={1} unit="%" targetLow={92} targetHigh={98} alertLow={92} />
            <ScrollPicker label="FiO₂" value={fio2} onChange={setFio2} min={21} max={100} step={1} unit="%" />
            <Check id="o2_titrate" label={`SpO₂ ${spo2}% — ${spo2 > 98 ? '⚠️ Reduce FiO₂' : spo2 < 92 ? '⚠️ Increase FiO₂' : '✅ Target range'}`} />
            <ScrollPicker label="EtCO₂" value={etco2} onChange={setEtco2} min={0} max={80} step={1} unit="mmHg" targetLow={35} targetHigh={45} alertLow={35} />
            <Check id="etco2_confirm" label={`EtCO₂ ${etco2} mmHg — ${etco2 < 35 ? '⚠️ Hypoventilation risk' : etco2 > 45 ? '⚠️ Hyperventilation' : '✅ Target range'}`} />
          </div>
        )}

        {tab === 'hemo' && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted mb-1">Hemodynamics</div>
            <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys} min={40} max={250} step={1} unit="mmHg" alertLow={90} />
            <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia} min={20} max={150} step={1} unit="mmHg" />
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-xs text-text-muted">MAP</span>
              <span className={`text-lg font-mono font-black ${map < 65 ? 'text-danger' : 'text-success'}`}>{map} <span className="text-xs font-normal">mmHg</span></span>
            </div>
            <ScrollPicker label="Heart Rate" value={hr} onChange={setHr} min={20} max={250} step={5} unit="bpm" />
            <ScrollPicker label="RR" value={rr} onChange={setRr} min={4} max={40} step={1} unit="/min" />
            <ScrollPicker label="Temperature" value={temp} onChange={v => setTemp(Math.round(v * 10) / 10)} min={32} max={42} step={0.1} unit="°C" alertHigh={37.5} />
            <Check id="vitals_check" label={`Vitals recorded: BP ${bpSys}/${bpDia} MAP ${map} HR ${hr}`} />
            <Check id="map_65" label={map >= 65 ? '✅ MAP ≥ 65' : '⚠️ MAP < 65 — need vasopressor'} />
            <Check id="fluid_vaso" label="IV fluid / Vasopressor if needed" sub="NSS 250-500ml → Norepinephrine 0.1-0.5 mcg/kg/min" />
          </div>
        )}

        {tab === 'ecg' && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted mb-1">12-Lead ECG — What rhythm?</div>
            <Check id="ecg_12lead" label="📈 12-Lead ECG done" sub="📸 Take photo for record" />

            <div className="text-xs font-semibold text-text-muted mt-2 mb-1">Rhythm Result → May need further treatment:</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => { toggleCheck('rhythm_nsr', 'Rhythm: NSR'); }}
                className={`py-2 rounded-lg text-[10px] font-bold ${checklist.rhythm_nsr ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                ✅ Normal Sinus
              </button>
              {onBrady && (
                <button onClick={() => { addEvent({ elapsed, category: 'rhythm', type: '🐢 Post-ROSC: Bradycardia', details: {} }); onBrady(); }}
                  className="py-2 rounded-lg text-[10px] font-bold bg-warning/10 border border-warning/30 text-warning">
                  🐢 Bradycardia → Treat
                </button>
              )}
              {onTachy && (
                <button onClick={() => { addEvent({ elapsed, category: 'rhythm', type: '🐇 Post-ROSC: Tachycardia', details: {} }); onTachy(); }}
                  className="py-2 rounded-lg text-[10px] font-bold bg-danger/10 border border-danger/30 text-danger">
                  🐇 Tachycardia → Treat
                </button>
              )}
              {onMI && (
                <button onClick={() => { addEvent({ elapsed, category: 'rhythm', type: '🫀 Post-ROSC: STEMI', details: {} }); onMI(); }}
                  className="py-2 rounded-lg text-[10px] font-bold bg-danger/10 border border-danger/30 text-danger">
                  🫀 STEMI → Cath Lab
                </button>
              )}
            </div>
            {onArrest && (
              <button onClick={() => { addEvent({ elapsed, category: 'other', type: '🔴 Re-arrest!', details: {} }); onArrest(); }}
                className="w-full py-2 rounded-lg text-[10px] font-bold bg-danger text-white mt-1">
                🔴 Re-arrest → CPR
              </button>
            )}
          </div>
        )}

        {tab === 'ttm' && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">TTM (Targeted Temperature Management)</div>
            <Check id="ttm_assess" label="Assess: follows commands?" sub="If NO command → start TTM 32-36°C x ≥24hr" />
            <Check id="ttm_start" label="TTM initiated / not indicated" sub="Surface cooling / intravascular / Cold NSS 4°C" />
          </div>
        )}

        {tab === 'labs' && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">Labs & Glucose</div>
            <Check id="labs_order" label="Labs: CBC, BMP, Mg, Ca, Troponin, Lactate, ABG, Coag" />
            <Check id="glucose_ctrl" label="Glucose 140-180 mg/dL" sub="⚠️ <140 avoid hypoglycemia | >180 insulin" />
          </div>
        )}

        {tab === 'neuro' && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted mb-1">Neurological</div>
            <Check id="neuro_gcs" label="GCS + Pupil assessment" sub="Bilateral fixed dilated = poor prognosis" />

            <div className="text-xs text-text-muted font-semibold mt-2 mb-1">Follow Command?</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setFollowCommand(true); toggleCheck('follow_cmd', 'Follow Command: YES'); }}
                className={`py-2.5 rounded-lg text-xs font-bold ${followCommand === true ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                ✅ Yes — follows command
              </button>
              <button onClick={() => { setFollowCommand(false); toggleCheck('follow_cmd', 'Follow Command: NO → TTM'); }}
                className={`py-2.5 rounded-lg text-xs font-bold ${followCommand === false ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                ❌ No — consider TTM
              </button>
            </div>
            {followCommand === false && (
              <div className="text-xs text-warning font-bold mt-1">⚠️ No command → Start TTM 32-36°C ≥24hr</div>
            )}

            <Check id="seizure_check" label="Seizure assessment" sub="If seizure → Levetiracetam 20mg/kg IV" />
          </div>
        )}

        {tab === 'consult' && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">Consult & Disposition</div>
            <Check id="consult_done" label="Consult + Disposition planned" sub="Cardiology / Neurology / ICU / CCU / Cath lab" />
          </div>
        )}
      </div>

      {/* Training scorecard */}
      {isTraining && (
        <button onClick={() => setShowScore(!showScore)}
          className="w-full text-[10px] text-info underline">
          {showScore ? 'Hide scorecard' : 'Show performance scorecard'}
        </button>
      )}

      {isTraining && showScore && (
        <TrainingScorecard events={events} />
      )}

      {/* Actions */}
      <button onClick={handleExport} className="w-full btn-action btn-info py-3.5 text-sm font-bold">
        📄 Export PDF Report
      </button>

      <button onClick={onDone} disabled={progress < 100}
        className={`w-full btn-action py-3.5 text-sm font-bold ${
          progress === 100 ? 'btn-success' : 'btn-ghost'
        } disabled:opacity-40`}>
        {progress === 100 ? '✅ Checklist Complete → Done' : `Complete checklist first (${doneItems}/${totalItems})`}
      </button>

      {/* Allow skip in real emergencies */}
      <button onClick={onDone} className="text-text-muted text-[10px] underline">
        Skip checklist → Dashboard
      </button>
    </div>
  );
}

// Simple training scorecard inline
function TrainingScorecard({ events }) {
  const timerData = {
    ccf: useTimerStore.getState().getCCF(),
    totalPauseTime: useTimerStore.getState().totalPauseTime,
    elapsed: useTimerStore.getState().elapsed,
  };
  const scores = calculateScore(events, timerData);
  const ratingColors = { good: 'text-success', fair: 'text-warning', poor: 'text-danger' };
  const ratingBg = { good: 'bg-success/10', fair: 'bg-warning/10', poor: 'bg-danger/10' };
  const gradeColor = { A: 'text-success', B: 'text-info', C: 'text-warning', D: 'text-danger', F: 'text-danger' };

  const metrics = [
    scores.timeToFirstShock && { name: 'Time to 1st Shock', ...scores.timeToFirstShock },
    scores.epiCompliance && { name: 'Epi Timing', ...scores.epiCompliance },
    scores.ccf && { name: 'CCF', ...scores.ccf },
    scores.handsOffTime && { name: 'Hands-off Time', ...scores.handsOffTime },
  ].filter(Boolean);

  return (
    <div className="glass-card !p-3 space-y-2 text-left">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-info">Performance</div>
        <div className={`text-2xl font-black ${gradeColor[scores.grade] || 'text-text-primary'}`}>{scores.grade}</div>
      </div>
      {metrics.map((m, i) => (
        <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${ratingBg[m.rating]}`}>
          <div>
            <div className="text-[10px] font-semibold text-text-primary">{m.name}</div>
            <div className="text-[9px] text-text-muted">Target: {m.target}</div>
          </div>
          <div className={`font-mono font-bold text-xs ${ratingColors[m.rating]}`}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}
