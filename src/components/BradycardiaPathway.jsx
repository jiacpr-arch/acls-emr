import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';
import { TrendingDown, Syringe, Zap, AlertTriangle, AlertCircle, Check, X, Wind } from 'lucide-react';

// Bradycardia Pathway — AHA Guideline
// HR < 50 + Symptomatic assessment
// Flow: Quick Vitals → Assess → Atropine → TCP → Vasopressors
export default function BradycardiaPathway({ onLog, onMonitor, onArrest, onRecheckPulse, isTraining }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const addEvent = useCaseStore(s => s.addEvent);
  const addDrugTimer = useCaseStore(s => s.addDrugTimer);
  const [phase, setPhase] = useState('vitals'); // vitals → assess → ...
  const [atropineCount, setAtropineCount] = useState(0);
  const [rhythmType, setRhythmType] = useState(null);
  const [checklist, setChecklist] = useState({});

  // Quick vitals
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(40);
  const [spo2, setSpo2] = useState(98);
  const [avpu, setAvpu] = useState(null);

  const map = Math.round((bpSys + 2 * bpDia) / 3);
  const autoSymptomatic = bpSys < 90 || map < 65 || (avpu && avpu !== 'A');

  const toggleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  // TCP Step (inline)
  const [tcpPhase, setTcpPhase] = useState('setup');
  const [tcpMode, setTcpMode] = useState('Demand');
  const [tcpRate, setTcpRate] = useState(60);
  const [tcpOutput, setTcpOutput] = useState(0);
  const [tcpCaptured, setTcpCaptured] = useState(false);
  const [tcpThreshold, setTcpThreshold] = useState(null);

  const saveVitals = () => {
    addEvent({ elapsed, category: 'other', type: `📊 Vitals: BP ${bpSys}/${bpDia} (MAP ${map}) HR ${hr} SpO₂ ${spo2}% ${avpu || ''}`, details: { bpSys, bpDia, map, hr, spo2, avpu } });
    if (autoSymptomatic) {
      onLog('other', `⚠️ Symptomatic Bradycardia — BP ${bpSys}/${bpDia} MAP ${map}`);
      setPhase('atropine');
    } else {
      setPhase('assess');
    }
  };

  // ===== QUICK VITALS =====
  if (phase === 'vitals') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">Bradycardia — Quick Vitals</div>
        <div className="pathway-icon-tile bg-info/12 text-info"><TrendingDown size={32} strokeWidth={2.2} /></div>
        <h1 className="text-xl font-black text-text-primary">HR &lt; 50 — Enter Vitals</h1>

        <div className="glass-card !p-3 space-y-3">
          <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys} min={40} max={250} step={1} unit="mmHg" alertLow={90} />
          <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia} min={20} max={150} step={1} unit="mmHg" />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">MAP</span>
            <span className={`text-lg font-mono font-black ${map < 65 ? 'text-danger' : 'text-success'}`}>{map}</span>
          </div>
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr} min={20} max={100} step={1} unit="bpm" alertLow={50} />
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

          <AVPUSelect value={avpu} onChange={setAvpu} compact />
        </div>

        {autoSymptomatic && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-2 text-sm text-danger font-bold animate-pulse">
            ⚠️ Symptomatic! BP {bpSys}/{bpDia} MAP {map} → Atropine immediately
          </div>
        )}

        <button onClick={saveVitals} className={`w-full btn-action py-4 text-sm font-bold ${autoSymptomatic ? 'btn-danger' : 'btn-info'}`}>
          {autoSymptomatic ? '⚠️ Symptomatic → Atropine' : 'Continue → Assessment'}
        </button>

        <button onClick={() => setPhase('assess')} className="text-text-muted text-xs underline">Skip vitals →</button>
        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-check pulse</button>
      </div>
    );
  }

  // ===== ASSESS =====
  if (phase === 'assess') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">Bradycardia Algorithm</div>
        <div className="pathway-icon-tile bg-info/12 text-info"><TrendingDown size={32} strokeWidth={2.2} /></div>
        <h1 className="text-2xl font-black text-text-primary">HR &lt; 50 — Assessment</h1>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            Assess stability first. Atropine 1mg IV for symptomatic. Type II / 3rd degree → TCP directly (Atropine won't work).
          </div>
        )}

        {/* Rhythm selection */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Select Rhythm Type</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'sinus', label: 'Sinus Brady', atropineOk: true },
              { key: '1st_avb', label: '1st AVB', atropineOk: true },
              { key: '2nd_type1', label: '2nd Type I', atropineOk: true },
              { key: '2nd_type2', label: '2nd Type II', atropineOk: false },
              { key: '3rd_avb', label: '3rd AVB', atropineOk: false },
              { key: 'junctional', label: 'Junctional', atropineOk: true },
            ].map(r => (
              <button key={r.key} onClick={() => {
                setRhythmType(r);
                onLog('rhythm', `Bradycardia rhythm: ${r.label}`);
              }} className={`py-2.5 rounded-xl text-xs font-semibold ${
                rhythmType?.key === r.key ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>
                {r.label}
                {!r.atropineOk && <div className="text-[9px] text-danger mt-0.5">⚠️ No Atropine</div>}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-text-muted mt-2">
            Not sure? → Take photo of EKG. Treat based on symptoms regardless.
          </div>
        </div>

        {/* Unstable signs */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Unstable Signs?</div>
          <div className="text-xs text-text-secondary">Hypotension, altered MS, chest pain, acute HF, shock</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => {
            onLog('other', '⚠️ Symptomatic Bradycardia');
            if (rhythmType && !rhythmType.atropineOk) {
              setPhase('pacing');
            } else {
              setPhase('atropine');
            }
          }} className="btn-action btn-danger py-4 text-sm font-bold">
            ⚠️ Symptomatic
          </button>
          <button onClick={() => {
            onLog('other', '✅ Asymptomatic Bradycardia — Monitor');
            onMonitor();
          }} className="btn-action btn-success py-4 text-sm font-bold">
            ✅ Stable → Monitor
          </button>
        </div>

        {rhythmType && !rhythmType.atropineOk && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 text-xs text-danger font-semibold">
            ⚠️ {rhythmType.label} — Atropine ineffective → TCP directly
          </div>
        )}

        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-check pulse</button>
      </div>
    );
  }

  // ===== ATROPINE =====
  if (phase === 'atropine') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">Bradycardia — Atropine</div>
        <div className="pathway-icon-tile bg-purple/12 text-purple"><Syringe size={32} strokeWidth={2.2} /></div>
        <h1 className="text-2xl font-black text-text-primary">Atropine Protocol</h1>
        <div className="text-sm text-text-secondary">Doses: {atropineCount}/3 (max 3mg)</div>

        <button onClick={() => {
          const count = atropineCount + 1;
          setAtropineCount(count);
          onLog('drug', `💉 Atropine 1mg IV (dose ${count}/3)`);
          if (count < 3) addDrugTimer('atropine', 'Atropine next dose', 180);
        }} disabled={atropineCount >= 3}
          className="w-full btn-action btn-purple py-4 text-sm font-bold disabled:opacity-40">
          💉 Atropine 1mg IV Push
          <div className="text-xs font-normal opacity-80 mt-1">
            {atropineCount >= 3 ? 'Max dose reached (3mg)' : `IV push <1min → flush 20ml`}
          </div>
        </button>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            1mg IV push fast (&lt;1min). Do not give slowly — risk of paradoxical bradycardia.
          </div>
        )}

        <div className="text-xs text-text-muted font-semibold">Re-assess after each dose ↓</div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => {
            onLog('other', '✅ HR improved after Atropine');
            onMonitor();
          }} className="btn-action btn-success py-3.5 text-sm font-bold">
            ✅ HR Improved
          </button>
          <button onClick={() => {
            onLog('other', '❌ Atropine ineffective → TCP/Vasopressors');
            setPhase('pacing');
          }} className="btn-action btn-warning py-3.5 text-sm font-bold">
            ❌ No Response → TCP
          </button>
        </div>

        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">
          🔴 No Pulse → CPR
        </button>
      </div>
    );
  }

  // ===== TCP =====
  if (phase === 'pacing') {
    if (tcpPhase === 'setup') {
      return (
        <div className="text-center space-y-4 animate-slide-up px-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-warning">Transcutaneous Pacing</div>
          <div className="pathway-icon-tile bg-warning/12 text-warning"><Zap size={32} strokeWidth={2.2} /></div>
          <h1 className="text-2xl font-black text-text-primary">TCP Setup</h1>

          <div className="glass-card !p-3 text-left">
            <div className="text-[10px] font-semibold text-text-muted uppercase mb-2">Mode</div>
            <div className="flex gap-2">
              {['Demand', 'Fixed'].map(m => (
                <button key={m} onClick={() => setTcpMode(m)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                    tcpMode === m ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          <div className="glass-card !p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase">Rate</span>
              <span className="text-lg font-mono font-black text-text-primary">{tcpRate} bpm</span>
            </div>
            <input type="range" min={40} max={180} step={10} value={tcpRate}
              onChange={e => setTcpRate(parseInt(e.target.value))} className="w-full accent-info" />
          </div>

          <div className="glass-card !p-3 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase">Output</span>
              <span className={`text-lg font-mono font-black ${tcpOutput > 0 ? 'text-warning' : 'text-text-muted'}`}>{tcpOutput} mA</span>
            </div>
            <input type="range" min={0} max={200} step={5} value={tcpOutput}
              onChange={e => setTcpOutput(parseInt(e.target.value))} className="w-full accent-warning" />
          </div>

          <button onClick={() => {
            setTcpCaptured(true);
            setTcpThreshold(tcpOutput);
            const margin = Math.min(tcpOutput + 10, 200);
            setTcpOutput(margin);
            onLog('other', `⚡ TCP Capture at ${tcpOutput}mA → Safety ${margin}mA (${tcpMode}, ${tcpRate}bpm)`);
            setTcpPhase('captured');
          }} disabled={tcpOutput === 0}
            className="w-full btn-action btn-success py-4 text-sm font-bold disabled:opacity-40">
            ✅ Capture! (Threshold = {tcpOutput} mA)
          </button>

          <button onClick={() => { setPhase('vasopressors'); }}
            className="w-full btn-action btn-ghost py-3 text-sm">❌ No Capture → Vasopressors</button>
          <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
        </div>
      );
    }

    // Captured
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">TCP — Captured</div>
        <div className="pathway-icon-tile bg-warning/12 text-warning"><Zap size={32} strokeWidth={2.2} /></div>
        <h1 className="text-2xl font-black text-text-primary">Pacing Active</h1>

        <div className="glass-card !p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Mode', value: tcpMode },
              { label: 'Rate', value: `${tcpRate} bpm` },
              { label: 'Threshold', value: `${tcpThreshold} mA` },
              { label: 'Output', value: `${tcpOutput} mA` },
            ].map((s, i) => (
              <div key={i} className="bg-bg-primary rounded-lg p-2 text-center">
                <div className="text-[9px] text-text-muted uppercase">{s.label}</div>
                <div className="text-sm font-bold text-text-primary">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card !p-3 text-left text-xs text-text-secondary">
          <div className="font-bold text-text-primary mb-1">Check Femoral Pulse</div>
          <div>Confirm mechanical capture — use femoral (not carotid, may confuse with muscle twitch)</div>
        </div>

        <div className="glass-card !p-3 text-left text-xs text-text-secondary">
          <div className="font-bold text-text-primary mb-1">Sedation (if conscious)</div>
          <div>Midazolam 1-2mg IV + Fentanyl 25-50mcg IV</div>
          <button onClick={() => onLog('drug', '💊 Sedation for TCP')}
            className="btn-action btn-purple py-2 text-xs mt-2 w-full">💊 Sedation Given</button>
        </div>

        <button onClick={() => setPhase('vasopressors')}
          className="w-full btn-action btn-ghost py-3 text-sm">💉 Add Vasopressors</button>
        <button onClick={onMonitor} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Stabilized → Monitor</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== VASOPRESSORS =====
  if (phase === 'vasopressors') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">Vasopressor Infusion</div>
        <div className="pathway-icon-tile bg-purple/12 text-purple"><Syringe size={32} strokeWidth={2.2} /></div>

        <div className="glass-card !p-3 text-left">
          <div className="text-sm font-bold text-text-primary mb-1">Dopamine 5-20 mcg/kg/min</div>
          <div className="text-xs text-text-secondary">400mg + NSS 250ml (1,600 mcg/ml)</div>
          <button onClick={() => onLog('drug', '💉 Dopamine infusion started')}
            className="btn-action btn-purple py-2 text-xs mt-2 w-full">💉 Start Dopamine</button>
        </div>

        <div className="glass-card !p-3 text-left">
          <div className="text-sm font-bold text-text-primary mb-1">Epinephrine 2-10 mcg/min</div>
          <div className="text-xs text-text-secondary">1mg (1:1000) + NSS 250ml (4 mcg/ml)</div>
          <button onClick={() => onLog('drug', '💉 Epi infusion started')}
            className="btn-action btn-purple py-2 text-xs mt-2 w-full">💉 Start Epi Infusion</button>
        </div>

        <button onClick={onMonitor} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Stabilized → Monitor</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  return null;
}
