import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { exportCasePDF } from '../utils/exportPDF';
import { calculateScore } from '../utils/scoring';
import ScrollPicker from './ScrollPicker';

// Post-ROSC Care Checklist — AHA Guideline
// Must complete ALL items before case can end
export default function PostROSCChecklist({ onDone, isTraining }) {
  const { currentCase, events, patient, team, etco2Readings, shockCount } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);
  const addEvent = useCaseStore(s => s.addEvent);
  const [checklist, setChecklist] = useState({});
  const [tab, setTab] = useState('airway'); // airway, hemo, ecg, ttm, labs, neuro, consult
  const [showScore, setShowScore] = useState(false);

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
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">Airway & Oxygenation</div>
            <Check id="airway_secure" label="Secure airway — confirm ETT position" sub="EtCO₂ waveform + auscultation + CXR" />
            <Check id="etco2_confirm" label="EtCO₂ 35-45 mmHg" sub="Avoid hyperventilation (<35=bad). Adjust RR." />
            <Check id="o2_titrate" label="SpO₂ 92-98% — titrate FiO₂" sub="Avoid hyperoxia (>98% harmful)" />
          </div>
        )}

        {tab === 'hemo' && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">Hemodynamics</div>
            <Check id="vitals_check" label="Vitals: BP, HR, SpO₂, RR, Temp" />
            <Check id="map_65" label="MAP ≥ 65 mmHg" sub="⚠️ If MAP<65: IV fluid → Vasopressor (Norepi/Epi/Dopamine)" />
            <Check id="fluid_vaso" label="IV fluid / Vasopressor if needed" sub="NSS bolus 250-500ml → Norepinephrine 0.1-0.5 mcg/kg/min" />
          </div>
        )}

        {tab === 'ecg' && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">12-Lead ECG</div>
            <Check id="ecg_12lead" label="📈 12-Lead ECG done" sub="📸 Take photo for record" />
            <Check id="stemi_check" label="STEMI check" sub="⚠️ If STEMI → Cath lab immediately (even if unconscious)" />
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
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text-muted mb-2">Neurological</div>
            <Check id="neuro_gcs" label="GCS + Pupil assessment" sub="Bilateral fixed dilated = poor prognosis" />
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
