import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import ScrollPicker from './ScrollPicker';
import AVPUSelect from './AVPUSelect';
import { TrendingUp, Zap, Activity } from 'lucide-react';

// Escalating biphasic energy ladder for cardioversion / defib (AHA)
const ENERGY_LADDER = [100, 120, 150, 200, 300, 360];
const nextEnergyUp = (current, max) => {
  const idx = ENERGY_LADDER.findIndex(e => e >= current);
  for (let i = idx + 1; i < ENERGY_LADDER.length; i++) {
    if (ENERGY_LADDER[i] <= max) return ENERGY_LADDER[i];
  }
  // already at/above max — return the highest allowed
  return ENERGY_LADDER.filter(e => e <= max).pop() ?? max;
};

const CARDIOVERSION_RHYTHMS = [
  {
    key: 'svt',
    label: 'Narrow Regular (SVT)',
    detail: 'QRS แคบ สม่ำเสมอ',
    initial: 100,
    isDefib: false,
    color: 'info',
  },
  {
    key: 'af',
    label: 'AF / Atrial Flutter',
    detail: 'QRS แคบ ไม่สม่ำเสมอ',
    initial: 200,
    isDefib: false,
    color: 'info',
  },
  {
    key: 'vt_mono',
    label: 'VT monomorphic',
    detail: 'QRS กว้าง สม่ำเสมอ — มีชีพจร',
    initial: 100,
    isDefib: false,
    color: 'warning',
  },
  {
    key: 'vt_poly',
    label: 'VT polymorphic → DEFIB',
    detail: 'Sync ไม่ได้ — Unsynchronized shock',
    initial: 200,
    isDefib: true,
    color: 'danger',
  },
];

// Tachycardia Pathway — AHA 2024 Guideline
// HR > 150 + Stable/Unstable auto-detect
// Flow: Unstable assessment → Rhythm type → Treatment
export default function TachycardiaPathway({ onLog, onMonitor, onArrest, onRecheckPulse, isTraining }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const addEvent = useCaseStore(s => s.addEvent);
  const defibMaxEnergy = useSettingsStore(s => s.defibMaxEnergy) || 360;
  const [phase, setPhase] = useState('vitals'); // vitals → unstable_check → ...
  const [unstableSigns, setUnstableSigns] = useState({});
  const [rhythmType, setRhythmType] = useState(null);
  const [cardioRhythm, setCardioRhythm] = useState(null); // selected rhythm card for cardioversion
  const [cardioversionEnergy, setCardioversionEnergy] = useState(100);
  const [cardioShockCount, setCardioShockCount] = useState(0);
  const [lastShockEnergy, setLastShockEnergy] = useState(null);
  const [adenosineCount, setAdenosineCount] = useState(0);

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
    const isDefib = cardioRhythm?.isDefib;
    const headerLabel = isDefib ? 'Unsynchronized Defibrillation' : 'Synchronized Cardioversion';
    const actionLabel = isDefib ? 'Defib' : 'Cardiovert';
    const energyAllowed = ENERGY_LADDER.filter(e => e <= defibMaxEnergy);

    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className={`text-[11px] font-extrabold uppercase tracking-[0.2em] ${isDefib ? 'text-danger' : 'text-shock'}`}>
          {headerLabel}
        </div>
        <div className={`pathway-icon-tile ${isDefib ? 'bg-danger/12 text-danger' : 'bg-shock/12 text-shock'}`}>
          <Zap size={32} strokeWidth={2.2} />
        </div>

        {isTraining && (
          <div className="training-tip">
            <span className="training-tip-label">TIP: </span>
            {isDefib
              ? 'Polymorphic VT — ใช้ Unsync mode. Sedate ถ้ามีชีพจร, MgSO₄ 2g ถ้า Torsades.'
              : 'Sedate ก่อนถ้ารู้สึกตัว (Midazolam 1-2mg). กด SYNC ก่อน shock ทุกครั้ง.'}
          </div>
        )}

        {/* STEP 1: Rhythm selector — clear cards */}
        <div className="glass-card !p-3 text-left">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2">
            1. เลือก Rhythm ที่ตรงกับ EKG
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {CARDIOVERSION_RHYTHMS.map(r => {
              const active = cardioRhythm?.key === r.key;
              const toneActive = {
                info:    'bg-info/15 border-info text-info',
                warning: 'bg-warning/15 border-warning text-warning',
                danger:  'bg-danger/15 border-danger text-danger',
              }[r.color];
              return (
                <button
                  key={r.key}
                  onClick={() => {
                    setCardioRhythm(r);
                    // first-time pick: seed energy. Already shocked? auto-escalate from last.
                    if (cardioShockCount === 0) {
                      setCardioversionEnergy(Math.min(r.initial, defibMaxEnergy));
                    } else if (lastShockEnergy) {
                      setCardioversionEnergy(nextEnergyUp(lastShockEnergy, defibMaxEnergy));
                    }
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 transition-colors ${
                    active ? toneActive : 'bg-bg-primary border-bg-tertiary text-text-secondary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-current' : 'border-text-muted'}`}>
                      {active && <span className="w-2 h-2 rounded-full bg-current" />}
                    </span>
                    <span className="text-left">
                      <span className="text-xs font-bold block">{r.label}</span>
                      <span className="text-[10px] opacity-75 font-normal block">{r.detail}</span>
                    </span>
                  </span>
                  <span className="text-[10px] font-mono opacity-75 shrink-0">start {r.initial}J</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Energy ladder — escalating */}
        <div className="glass-card !p-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              2. Energy (Biphasic) — Shock #{cardioShockCount + 1}
            </div>
            {lastShockEnergy && (
              <div className="text-[10px] text-text-muted font-mono">last: {lastShockEnergy}J ↑</div>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {ENERGY_LADDER.map(j => {
              const disabled = j > defibMaxEnergy;
              const selected = cardioversionEnergy === j;
              const suggested = lastShockEnergy
                ? j === nextEnergyUp(lastShockEnergy, defibMaxEnergy)
                : cardioRhythm && j === Math.min(cardioRhythm.initial, defibMaxEnergy);
              return (
                <button
                  key={j}
                  disabled={disabled}
                  onClick={() => setCardioversionEnergy(j)}
                  className={`py-2.5 rounded-lg text-[11px] font-bold relative ${
                    disabled
                      ? 'bg-bg-tertiary/40 text-text-muted/40 cursor-not-allowed line-through'
                      : selected
                        ? 'bg-shock text-white ring-2 ring-shock/40'
                        : suggested
                          ? 'bg-shock/10 border border-shock/40 text-shock'
                          : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}
                >
                  {j}
                  {suggested && !selected && !disabled && (
                    <span className="absolute -top-1.5 -right-1 text-[8px] bg-shock text-white px-1 rounded-full">↑</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-text-muted mt-1.5">
            Max {defibMaxEnergy}J · {energyAllowed.length} steps · เครื่องบางรุ่นได้แค่ 200J (ตั้งใน Settings)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onLog('drug', '💊 Midazolam 1-2mg IV (sedation)', { context: 'cardioversion_sedation', dose: '1-2 mg', route: 'IV' })}
            className="btn-action btn-purple py-3 text-xs font-semibold">💊 Sedate</button>
          <button
            disabled={!cardioRhythm}
            onClick={() => {
              const nextCount = cardioShockCount + 1;
              const label = isDefib
                ? `⚡ Defibrillation #${nextCount} (Unsync) ${cardioversionEnergy}J — ${cardioRhythm.label}`
                : `⚡ Synchronized Cardioversion #${nextCount} ${cardioversionEnergy}J — ${cardioRhythm.label}`;
              onLog('shock', label);
              setLastShockEnergy(cardioversionEnergy);
              setCardioShockCount(nextCount);
              // pre-arm next energy step
              setCardioversionEnergy(nextEnergyUp(cardioversionEnergy, defibMaxEnergy));
            }}
            className={`btn-action py-3 text-xs font-semibold ${cardioRhythm ? (isDefib ? 'btn-danger' : 'btn-shock') : 'bg-bg-tertiary text-text-muted cursor-not-allowed'}`}>
            ⚡ {actionLabel} {cardioversionEnergy}J
          </button>
        </div>

        {!cardioRhythm && (
          <div className="text-[10px] text-text-muted">เลือก rhythm ก่อนถึงจะกด {actionLabel} ได้</div>
        )}

        <div className="text-xs text-text-muted font-semibold">Re-assess after {actionLabel.toLowerCase()} ↓</div>

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
            onLog('drug', '💉 Adenosine 6mg rapid IV push', { drugId: 'adenosine_first', dose: '6 mg', route: 'IV', doseNumber: 1 });
          }} className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>2. 💉 Adenosine 6mg</div>
            <div className="text-[10px] text-text-muted font-normal">Rapid push + flush 20ml simultaneously (3-way stopcock)</div>
          </button>

          <button onClick={() => {
            setAdenosineCount(prev => prev + 1);
            onLog('drug', '💉 Adenosine 12mg rapid IV push', { drugId: 'adenosine_second', dose: '12 mg', route: 'IV' });
          }} className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>3. 💉 Adenosine 12mg (repeat)</div>
            <div className="text-[10px] text-text-muted font-normal">Same technique. May repeat once.</div>
          </button>

          <button onClick={() => onLog('drug', '💉 Diltiazem 15-20mg IV over 2min', { drugId: 'diltiazem', dose: '15-20 mg', route: 'IV' })}
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
          <button onClick={() => onLog('drug', '💉 Diltiazem 15-20mg IV over 2min', { drugId: 'diltiazem', dose: '15-20 mg', route: 'IV' })}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Diltiazem 15-20mg IV</div>
            <div className="text-[10px] text-text-muted font-normal">Over 2 min. Repeat 20-25mg after 15 min if needed.</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Metoprolol 5mg IV q5min (max 15mg)', { dose: '5 mg', route: 'IV' })}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Metoprolol 5mg IV</div>
            <div className="text-[10px] text-text-muted font-normal">q5min, max 15mg</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg IV over 10min', { drugId: 'amiodarone_vt', dose: '150 mg', route: 'IV' })}
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
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg + D5W 100ml drip 10min', { drugId: 'amiodarone_vt', dose: '150 mg', route: 'IV' })}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg IV over 10min</div>
            <div className="text-[10px] text-text-muted font-normal">150mg + D5W 100ml → drip 10 min. ⚠️ Do NOT rapid push (has pulse!)</div>
          </button>
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg repeat', { drugId: 'amiodarone_vt', dose: '150 mg', route: 'IV', repeat: true })}
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
          <button onClick={() => onLog('drug', '💉 Amiodarone 150mg IV over 10min (wide irregular)', { drugId: 'amiodarone_vt', dose: '150 mg', route: 'IV', context: 'wide_irregular' })}
            className="w-full btn-action btn-purple py-3 text-sm font-semibold text-left px-4">
            <div>💉 Amiodarone 150mg</div>
            <div className="text-[10px] text-text-muted font-normal">Safe in WPW</div>
          </button>
          <button onClick={() => onLog('drug', '💉 MgSO₄ 2g IV (Torsades)', { drugId: 'magnesium', dose: '2 g', route: 'IV', context: 'torsades' })}
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
