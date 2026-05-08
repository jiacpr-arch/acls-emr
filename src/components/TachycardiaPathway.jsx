import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';
import { TrendingUp, Zap, Activity } from 'lucide-react';

// Tachycardia Pathway — AHA 2024 Guideline
// HR > 150 + Stable/Unstable auto-detect
// Flow: Unstable assessment → Rhythm type → Treatment
export default function TachycardiaPathway({ onLog, onMonitor, onArrest, onRecheckPulse, isTraining }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const addEvent = useCaseStore(s => s.addEvent);
  const [phase, setPhase] = useState('vitals'); // vitals → unstable_check → ...
  const [unstableSigns, setUnstableSigns] = useState({});
  const [, setRhythmType] = useState(null);
  const [cardioversionEnergy, setCardioversionEnergy] = useState(100);
  const [, setAdenosineCount] = useState(0);

  // Quick vitals
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(160);
  const [spo2, setSpo2] = useState(98);
  const [avpu, setAvpu] = useState(null);

  const map = Math.round((bpSys + 2 * bpDia) / 3);
  const autoUnstable = bpSys < 90 || map < 65;

  const toggleUnstable = (key) => setUnstableSigns(prev => ({ ...prev, [key]: !prev[key] }));
  const hasUnstable = Object.values(unstableSigns).some(v => v);

  const saveVitals = () => {
    addEvent({ elapsed, category: 'other', type: `📊 Vitals: BP ${bpSys}/${bpDia} (MAP ${map}) HR ${hr} SpO₂ ${spo2}% ${avpu || ''}`, details: { bpSys, bpDia, map, hr, spo2, avpu } });
    // Auto-detect unstable from vitals
    const auto = {};
    if (bpSys < 90 || map < 65) auto.hypotension = true;
    if (avpu && avpu !== 'A') auto.altered_ms = true;
    if (spo2 < 94) auto.resp_distress = true;
    setUnstableSigns(auto);

    if (bpSys < 90 || map < 65) {
      onLog('other', `⚠️ UNSTABLE Tachycardia — BP ${bpSys}/${bpDia} MAP ${map}`);
      setPhase('cardioversion');
    } else {
      setPhase('unstable_check');
    }
  };

  // ===== QUICK VITALS =====
  if (phase === 'vitals') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">Tachycardia — Quick Vitals</div>
        <div className="pathway-icon-tile bg-danger/12 text-danger"><TrendingUp size={32} strokeWidth={2.2} /></div>
        <h1 className="text-xl font-black text-text-primary">HR &gt; 150 — Enter Vitals</h1>

        <div className="glass-card !p-3 space-y-3">
          <ScrollPicker label="BP Systolic" value={bpSys} onChange={setBpSys} min={40} max={250} step={1} unit="mmHg" alertLow={90} />
          <ScrollPicker label="BP Diastolic" value={bpDia} onChange={setBpDia} min={20} max={150} step={1} unit="mmHg" />
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-text-muted">MAP</span>
            <span className={`text-lg font-mono font-black ${map < 65 ? 'text-danger' : 'text-success'}`}>{map} <span className="text-xs font-normal">mmHg</span></span>
          </div>
          <ScrollPicker label="Heart Rate" value={hr} onChange={setHr} min={20} max={250} step={5} unit="bpm" alertHigh={150} />
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

        {autoUnstable && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-2 text-sm text-danger font-bold animate-pulse">
            ⚠️ BP {bpSys}/{bpDia} MAP {map} — UNSTABLE → Cardioversion
          </div>
        )}

        <button onClick={saveVitals} className={`w-full btn-action py-4 text-sm font-bold ${autoUnstable ? 'btn-danger animate-pulse' : 'btn-info'}`}>
          {autoUnstable ? '⚡ UNSTABLE → Cardioversion' : 'Continue → Assessment'}
        </button>

        <button onClick={() => { setPhase('unstable_check'); }} className="text-text-muted text-xs underline">Skip vitals →</button>
        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-check pulse</button>
      </div>
    );
  }

  // ===== UNSTABLE CHECK =====
  if (phase === 'unstable_check') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">Tachycardia Algorithm</div>
        <div className="pathway-icon-tile bg-danger/12 text-danger"><TrendingUp size={32} strokeWidth={2.2} /></div>
        <h1 className="text-2xl font-black text-text-primary">Stable or Unstable?</h1>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            If ANY unstable sign → Synchronized Cardioversion immediately.
          </div>
        )}

        {/* Unstable signs checklist */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Unstable Signs (auto-detected from vitals + check manually)</div>
          {[
            { key: 'hypotension', label: `Hypotension / Shock (SBP < 90)${bpSys < 90 ? ' ← detected' : ''}`, icon: '📉' },
            { key: 'altered_ms', label: `Altered Mental Status${avpu && avpu !== 'A' ? ` ← AVPU=${avpu}` : ''}`, icon: '😵' },
            { key: 'chest_pain', label: 'Chest Pain / ACS Signs', icon: '💔' },
            { key: 'resp_distress', label: `Respiratory Distress${spo2 < 94 ? ` ← SpO₂=${spo2}%` : ''}`, icon: '🫁' },
          ].map(s => (
            <button key={s.key} onClick={() => toggleUnstable(s.key)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1.5 transition-colors ${
                unstableSigns[s.key] ? 'bg-danger/10 border border-danger/30' : 'bg-bg-primary border border-bg-tertiary'
              }`}>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                unstableSigns[s.key] ? 'bg-danger text-white' : 'bg-bg-tertiary text-text-muted'
              }`}>{unstableSigns[s.key] ? '✓' : ''}</span>
              <span className="text-xs text-text-primary">{s.icon} {s.label}</span>
            </button>
          ))}
        </div>

        {hasUnstable && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger font-bold">
            ⚠️ UNSTABLE — Synchronized Cardioversion NOW
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => {
            onLog('other', `⚠️ Unstable Tachycardia: ${Object.keys(unstableSigns).filter(k => unstableSigns[k]).join(', ')}`);
            setPhase('cardioversion');
          }} className={`btn-action py-4 text-sm font-bold ${hasUnstable ? 'btn-danger animate-pulse' : 'btn-danger'}`}>
            ⚡ UNSTABLE → Cardiovert
          </button>
          <button onClick={() => {
            onLog('other', '✅ Stable Tachycardia');
            setPhase('rhythm_select');
          }} className="btn-action btn-success py-4 text-sm font-bold">
            ✅ STABLE → ID Rhythm
          </button>
        </div>

        <button onClick={onRecheckPulse} className="text-text-muted text-xs underline">← Re-check pulse</button>
      </div>
    );
  }

  // ===== CARDIOVERSION =====
  if (phase === 'cardioversion') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-shock">Synchronized Cardioversion</div>
        <div className="pathway-icon-tile bg-shock/12 text-shock"><Zap size={32} strokeWidth={2.2} /></div>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            Sedate if conscious (Midazolam 1-2mg). Ensure SYNC mode on defibrillator.
          </div>
        )}

        <div className="glass-card !p-3 text-left">
          <div className="text-xs text-text-muted font-semibold mb-2">Energy (Biphasic)</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Narrow (SVT)', energy: 100 },
              { label: 'AF / Aflutter', energy: 200 },
              { label: 'VT (mono)', energy: 100 },
              { label: 'VT (poly) → Defib', energy: 200 },
            ].map(e => (
              <button key={e.label} onClick={() => setCardioversionEnergy(e.energy)}
                className={`py-2.5 rounded-xl text-xs font-semibold ${
                  cardioversionEnergy === e.energy ? 'bg-shock text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                }`}>
                {e.label}<br/><span className="font-bold">{e.energy}J</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onLog('drug', '💊 Midazolam 1-2mg IV (sedation)')}
            className="btn-action btn-purple py-3 text-xs font-semibold">💊 Sedate</button>
          <button onClick={() => {
            onLog('shock', `⚡ Synchronized Cardioversion ${cardioversionEnergy}J`);
          }} className="btn-action btn-shock py-3 text-xs font-semibold">⚡ Cardiovert {cardioversionEnergy}J</button>
        </div>

        <div className="text-xs text-text-muted font-semibold">Re-assess after cardioversion ↓</div>

        <button onClick={() => {
          onLog('other', '✅ Cardioversion successful — converted');
          onMonitor();
        }} className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Converted → Monitor</button>

        <button onClick={() => setPhase('rhythm_select')}
          className="w-full btn-action btn-ghost py-3 text-sm">Still tachycardic → ID Rhythm</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
      </div>
    );
  }

  // ===== RHYTHM SELECT (4 types) =====
  if (phase === 'rhythm_select') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">Stable Tachycardia — ID Rhythm</div>
        <div className="pathway-icon-tile bg-info/12 text-info"><Activity size={32} strokeWidth={2.2} /></div>
        <h1 className="text-xl font-black text-text-primary">Select Rhythm Pattern</h1>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'narrow_regular', label: 'Narrow Regular', sub: 'SVT → Adenosine', color: 'btn-info' },
            { key: 'narrow_irregular', label: 'Narrow Irregular', sub: 'AF/Flutter → Rate control', color: 'btn-info' },
            { key: 'wide_regular', label: 'Wide Regular', sub: 'VT → Amiodarone', color: 'btn-warning' },
            { key: 'wide_irregular', label: 'Wide Irregular', sub: 'AF+WPW / pVT → Caution!', color: 'btn-danger' },
          ].map(r => (
            <button key={r.key} onClick={() => {
              setRhythmType(r.key);
              onLog('rhythm', `Tachycardia rhythm: ${r.label}`);
              setPhase(r.key);
            }} className={`btn-action py-4 text-sm font-semibold ${r.color}`}>
              {r.label}
              <div className="text-[10px] font-normal opacity-80 mt-1">{r.sub}</div>
            </button>
          ))}
        </div>

        <div className="text-[10px] text-text-muted">Not sure? → Take EKG photo. Treat based on stability.</div>
        <button onClick={() => setPhase('unstable_check')} className="text-text-muted text-xs underline">← Back to assessment</button>
      </div>
    );
  }

  // ===== NARROW REGULAR (SVT) =====
  if (phase === 'narrow_regular') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">SVT — Narrow Regular</div>
        <h1 className="text-xl font-black text-text-primary">SVT Treatment</h1>

        <div className="space-y-2">
          <button onClick={() => { onLog('other', '🫁 Vagal maneuver (Modified Valsalva)'); }}
            className="w-full btn-action btn-ghost py-3 text-sm font-semibold text-left px-4">
            <div>1. 🫁 Vagal Maneuver</div>
            <div className="text-[10px] text-text-muted font-normal">Modified Valsalva: blow syringe 15s → lie flat + legs up 15s</div>
          </button>

          <button onClick={() => {
            setAdenosineCount(1);
            onLog('drug', '💉 Adenosine 6mg rapid IV push');
          }} className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>2. 💉 Adenosine 6mg</div>
            <div className="text-[10px] text-text-muted font-normal">Rapid push + flush 20ml simultaneously (3-way stopcock)</div>
          </button>

          <button onClick={() => {
            setAdenosineCount(prev => prev + 1);
            onLog('drug', '💉 Adenosine 12mg rapid IV push');
          }} className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>3. 💉 Adenosine 12mg (repeat)</div>
            <div className="text-[10px] text-text-muted font-normal">Same technique. May repeat once.</div>
          </button>

          <button onClick={() => onLog('drug', '💉 Diltiazem 15-20mg IV over 2min')}
            className="w-full btn-action btn-ghost py-3 text-sm font-semibold text-left px-4">
            <div>4. 💉 Diltiazem / Beta-blocker</div>
            <div className="text-[10px] text-text-muted font-normal">If Adenosine fails</div>
          </button>
        </div>

        <div className="text-xs text-text-muted font-semibold">Re-assess rhythm after each treatment ↓</div>

        <button onClick={() => { onLog('other', '✅ SVT converted'); onMonitor(); }}
          className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Converted → Monitor</button>
        <button onClick={() => setPhase('cardioversion')}
          className="w-full btn-action btn-ghost py-3 text-sm">⚡ Not responding → Cardioversion 100J</button>
        <button onClick={() => setPhase('rhythm_select')} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  // ===== NARROW IRREGULAR (AF/Flutter) =====
  if (phase === 'narrow_irregular') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-info">AF/Flutter — Rate Control</div>
        <h1 className="text-xl font-black text-text-primary">AF/Flutter Treatment</h1>

        <div className="space-y-2">
          <button onClick={() => onLog('drug', '💉 Diltiazem 15-20mg IV over 2min')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Diltiazem 15-20mg IV</div>
            <div className="text-[10px] text-text-muted font-normal">Over 2 min. Repeat 20-25mg after 15 min if needed.</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Metoprolol 5mg IV q5min (max 15mg)')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Metoprolol 5mg IV</div>
            <div className="text-[10px] text-text-muted font-normal">q5min, max 15mg</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg IV over 10min')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg IV</div>
            <div className="text-[10px] text-text-muted font-normal">150mg + D5W 100ml → drip 10 min</div>
          </button>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-xl px-3 py-2 text-xs text-warning">
          ⚠️ AF &gt;48hr or unknown duration → Anticoagulate before cardioversion
        </div>

        <button onClick={() => { onLog('other', '✅ Rate controlled'); onMonitor(); }}
          className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Rate Controlled → Monitor</button>
        <button onClick={() => setPhase('cardioversion')}
          className="w-full btn-action btn-ghost py-3 text-sm">⚡ Cardioversion 200J</button>
        <button onClick={() => setPhase('rhythm_select')} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  // ===== WIDE REGULAR (VT with pulse) =====
  if (phase === 'wide_regular') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-warning">Stable VT — Wide Regular</div>
        <h1 className="text-xl font-black text-text-primary">VT Treatment</h1>

        <div className="space-y-2">
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg + D5W 100ml drip 10min')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg IV over 10min</div>
            <div className="text-[10px] text-text-muted font-normal">150mg + D5W 100ml → drip 10 min. ⚠️ Do NOT rapid push (has pulse!)</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg repeat')}
            className="w-full btn-action btn-ghost py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg (repeat)</div>
            <div className="text-[10px] text-text-muted font-normal">Maintenance: 1mg/min x 6hr → 0.5mg/min x 18hr</div>
          </button>
        </div>

        <div className="text-xs text-text-muted font-semibold">Re-assess after treatment. Expert consult recommended.</div>

        <button onClick={() => { onLog('other', '✅ VT resolved'); onMonitor(); }}
          className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Resolved → Monitor</button>
        <button onClick={() => { setPhase('cardioversion'); setCardioversionEnergy(100); }}
          className="w-full btn-action btn-shock py-3 text-sm">⚡ Deteriorating → Cardioversion 100J</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
        <button onClick={() => setPhase('rhythm_select')} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  // ===== WIDE IRREGULAR =====
  if (phase === 'wide_irregular') {
    return (
      <div className="text-center space-y-3 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-danger">Wide Irregular — Caution!</div>
        <h1 className="text-xl font-black text-text-primary">Wide Irregular Tachycardia</h1>

        <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 text-xs text-danger font-semibold">
          ⚠️ If AF + WPW → Do NOT give AV nodal blockers (Adenosine, Diltiazem, Digoxin)
        </div>

        <div className="space-y-2">
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg IV over 10min (wide irregular)')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg</div>
            <div className="text-[10px] text-text-muted font-normal">Safe in WPW</div>
          </button>
          <button onClick={() => onLog('drug', '💉 MgSO₄ 2g IV (Torsades)')}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 MgSO₄ 2g IV (if Torsades)</div>
            <div className="text-[10px] text-text-muted font-normal">IV push over 1-2 min. Look for QT prolongation cause.</div>
          </button>
        </div>

        <button onClick={() => { onLog('other', '✅ Rhythm stabilized'); onMonitor(); }}
          className="w-full btn-action btn-success py-3.5 text-sm font-bold">✅ Stabilized → Monitor</button>
        <button onClick={() => {
          onLog('shock', '⚡ Defibrillation (Polymorphic VT — unsynchronized)');
          onArrest();
        }} className="w-full btn-action btn-shock py-3 text-sm">⚡ Polymorphic VT → Defib (Unsync)</button>
        <button onClick={onArrest} className="w-full btn-action btn-danger py-3 text-sm">🔴 No Pulse → CPR</button>
        <button onClick={() => setPhase('rhythm_select')} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  return null;
}
