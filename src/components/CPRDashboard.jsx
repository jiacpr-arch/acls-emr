import { useState, useEffect } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useCaseStore } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playDrugAlert } from '../utils/sound';
import { formatTime, formatTimeLong } from '../utils/formatTime';
import CircularTimer from './CircularTimer';

// =============================================
// CPR DASHBOARD — CodeBlue Style
// Two circular timers: Compression + Epinephrine
// Replaces the old CPRCycleStep wizard step
// =============================================

export default function CPRDashboard({
  onCheckRhythm,
  onGiveDrug,
  onAirway,
  onROSC,
  onSecondary,
  onShock,
  isTraining,
}) {
  const {
    cycleElapsed, cycleDuration, cycleNumber,
    cprActive, startCPR, stopCPR, elapsed,
    compressorRotateDue, dismissCompressorRotate,
    getCCF,
  } = useTimerStore();

  const {
    shockCount, currentRhythm, drugTimers, addEvent,
    etco2Readings, latestEtCO2, addEtCO2, events,
  } = useCaseStore();

  const settings = useSettingsStore();

  // Check if advanced airway placed (ETT/SGA)
  const hasAdvancedAirway = events.some(e =>
    e.category === 'airway' && (e.type?.includes('ETT') || e.type?.includes('SGA') || e.type?.includes('LMA'))
  );

  // Ensure CPR is active when dashboard mounts
  const [cprMode, setCprMode] = useState('hand_only'); // hand_only | bvm_30_2 | advanced

  useEffect(() => { if (!cprActive) startCPR(); }, []);

  // Cycle calculations
  const remaining = cycleDuration - cycleElapsed;
  const progress = cycleElapsed / cycleDuration;
  const almostDone = remaining <= 15;
  const ccf = getCCF();

  // Drug timer tracking
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const activeDrugTimers = drugTimers.filter(t => t.isActive);
  const epiTimer = activeDrugTimers.find(t => t.drugId === 'epinephrine_arrest');
  const epiDue = epiTimer && (now - epiTimer.startedAt) >= epiTimer.intervalSeconds * 1000;
  const epiRemaining = epiTimer
    ? Math.max(0, Math.ceil((epiTimer.intervalSeconds * 1000 - (now - epiTimer.startedAt)) / 1000))
    : null;
  const epiCount = useCaseStore.getState().events.filter(
    e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')
  ).length;

  // Drug alert sounds
  const [alertedDrugs, setAlertedDrugs] = useState(new Set());
  useEffect(() => {
    activeDrugTimers.forEach(t => {
      const isDue = (now - t.startedAt) >= t.intervalSeconds * 1000;
      if (isDue && !alertedDrugs.has(t.id) && settings.soundEnabled && settings.drugReminderEnabled) {
        playDrugAlert();
        setAlertedDrugs(prev => new Set(prev).add(t.id));
      }
    });
  }, [now]);

  // EtCO2 quick input
  const [showEtco2, setShowEtco2] = useState(false);
  const [etco2Val, setEtco2Val] = useState(35);

  // Pause reason
  const [showPauseReason, setShowPauseReason] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(null);

  // CPR pause for rhythm check
  const handleCheckRhythm = () => {
    stopCPR('rhythm_check');
    addEvent({ elapsed, category: 'cpr', type: `Rhythm Check (Cycle ${cycleNumber})`, details: {} });
    onCheckRhythm();
  };

  const handlePause = (reason, label, maxSec) => {
    stopCPR(reason);
    addEvent({ elapsed, category: 'cpr', type: `⏸ CPR Paused: ${label}`, details: { reason, maxSec } });
    setPauseCountdown({ reason, label, maxSec, startedAt: Date.now() });
    setShowPauseReason(false);
  };

  const handleResume = () => {
    startCPR();
    addEvent({ elapsed, category: 'cpr', type: '▶️ CPR Resumed', details: {} });
    setPauseCountdown(null);
  };

  // Color logic
  const compressionColor = almostDone ? 'stroke-danger' : 'stroke-success';
  const epiColor = epiDue ? 'stroke-danger' : 'stroke-purple';
  const ccfColor = ccf >= 80 ? 'text-success' : ccf >= 60 ? 'text-warning' : 'text-danger';

  return (
    <div className="text-center space-y-3 animate-slide-up">
      {/* Total time header */}
      <div className="dash-card !py-2 flex items-center justify-between px-4">
        <div className="text-left">
          <div className="text-[9px] text-text-muted font-semibold uppercase">Total Duration</div>
          <div className="text-2xl font-mono font-black tabular-nums text-text-primary tracking-tight">{formatTimeLong(elapsed)}</div>
        </div>
        <div className="flex gap-3">
          <div className="stat-box !p-2 min-w-[52px]">
            <div className={`stat-value text-lg ${ccfColor}`}>{ccf}%</div>
            <div className="stat-label">CCF</div>
          </div>
          <div className="stat-box !p-2 min-w-[52px]">
            <div className="stat-value text-lg text-shock">{shockCount}</div>
            <div className="stat-label">Shocks</div>
          </div>
        </div>
      </div>

      {/* Compressor rotation alert */}
      {compressorRotateDue && (
        <button onClick={dismissCompressorRotate}
          className="w-full bg-warning/10 border border-warning/30 rounded-xl px-4 py-2.5 text-sm font-bold text-warning animate-pulse text-center">
          🔄 Switch Compressor! — Tap to dismiss
        </button>
      )}

      {/* Two circular timers side by side */}
      <div className="flex items-start justify-center gap-3 px-2">
        {/* Compression Timer */}
        <CircularTimer
          value={remaining}
          max={cycleDuration}
          size={150}
          strokeWidth={10}
          color={compressionColor}
          alert={almostDone}
          label="Compressions"
          sublabel={`Cycles: ${cycleNumber}`}
        >
          <div className={`text-[1.75rem] font-mono font-black tabular-nums tracking-tight ${almostDone ? 'text-danger' : 'text-success'}`}>
            {formatTime(remaining)}
          </div>
          <div className="text-[9px] text-text-muted font-semibold">/ {formatTime(cycleDuration)}</div>
        </CircularTimer>

        {/* Epinephrine Timer */}
        <CircularTimer
          value={epiRemaining !== null ? epiRemaining : 0}
          max={epiTimer ? epiTimer.intervalSeconds : 240}
          size={150}
          strokeWidth={10}
          color={epiColor}
          alert={epiDue}
          label="Epinephrine"
          sublabel={`Epis: ${epiCount}`}
        >
          {epiRemaining !== null ? (
            <>
              <div className={`text-[1.75rem] font-mono font-black tabular-nums tracking-tight ${epiDue ? 'text-danger' : 'text-purple'}`}>
                {epiDue ? 'DUE' : formatTime(epiRemaining)}
              </div>
              <div className="text-[9px] text-text-muted font-semibold">q3-5 min</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-text-muted">--:--</div>
              <div className="text-[9px] text-text-muted">No Epi yet</div>
            </>
          )}
        </CircularTimer>
      </div>

      {/* Training hint */}
      {/* CPR Mode indicator */}
      <div className="flex items-center justify-center gap-2">
        {['hand_only', 'bvm_30_2', 'advanced'].map(m => (
          <button key={m} onClick={() => {
            setCprMode(m);
            addEvent({ elapsed, category: 'cpr', type: `CPR Mode: ${m === 'hand_only' ? 'Hand-only' : m === 'bvm_30_2' ? 'BVM 30:2' : 'Advanced Airway (continuous)'}`, details: { cprMode: m } });
          }} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            cprMode === m ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-muted'
          }`}>
            {m === 'hand_only' ? '🤲 Hand-only' : m === 'bvm_30_2' ? '🫁 BVM 30:2' : '🫁 Advanced'}
          </button>
        ))}
      </div>

      {isTraining && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-left text-xs text-blue-700">
          <span className="font-bold text-[10px] text-blue-500">TIP: </span>
          {currentRhythm?.shockable
            ? 'Shockable: Epi after 2nd shock → Amiodarone after 3rd shock'
            : 'Non-shockable: Epi immediately → repeat q3-5 min'
          }
        </div>
      )}

      {/* EtCO₂ — only visible after advanced airway */}
      {hasAdvancedAirway ? (
      <div className={`glass-card !p-2.5 ${etco2Val > 40 ? '!border-success/50 animate-pulse' : etco2Val < 10 ? '!border-danger/50' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="text-sm">🌬️</span>
          <div className="flex-1">
            <input type="range" min={0} max={80} value={etco2Val}
              onChange={e => setEtco2Val(parseInt(e.target.value))}
              className="w-full accent-info h-2" />
            <div className="flex justify-between text-[8px] text-text-muted mt-0.5">
              <span className="text-danger">&lt;10</span>
              <span>EtCO₂</span>
              <span className="text-success">&gt;20 ROSC?</span>
            </div>
          </div>
          <span className={`text-xl font-mono font-black min-w-[40px] text-right ${
            etco2Val < 10 ? 'text-danger' : etco2Val > 40 ? 'text-success animate-pulse' : etco2Val > 20 ? 'text-success' : 'text-text-primary'
          }`}>{etco2Val}</span>
          <button onClick={() => {
            addEtCO2(etco2Val, 'during_cpr');
            addEvent({ elapsed, category: 'etco2', type: `🌬️ EtCO₂: ${etco2Val} mmHg`, details: { value: etco2Val } });
          }} className="btn-action btn-info !min-h-[32px] !min-w-[32px] px-2 py-1 text-[10px] font-bold">
            Save
          </button>
        </div>
        {etco2Val > 40 && (
          <div className="text-xs text-success font-bold mt-1 text-center">
            ⚠️ EtCO₂ &gt;40 — Check Pulse NOW!
          </div>
        )}
      </div>
      ) : (
      <div className="glass-card !p-2.5 flex items-center justify-between">
        <span className="text-xs text-text-muted">🌬️ EtCO₂</span>
        <span className="text-[10px] text-text-muted">Place ETT/SGA first to measure EtCO₂</span>
      </div>
      )}

      {/* Other drug timers (non-epi) */}
      {activeDrugTimers.filter(t => t.drugId !== 'epinephrine_arrest').map(t => {
        const rem = Math.max(0, Math.ceil((t.intervalSeconds * 1000 - (now - t.startedAt)) / 1000));
        const due = rem <= 0;
        return (
          <div key={t.id} className={`glass-card flex items-center justify-between px-4 py-2 text-sm ${
            due ? '!border-danger/40 animate-pulse' : ''
          }`}>
            <span className="font-semibold">💊 {t.drugName}</span>
            <span className={`font-mono font-bold ${due ? 'text-danger' : 'text-text-primary'}`}>
              {due ? '⚠️ DUE' : formatTime(rem)}
            </span>
          </div>
        );
      })}

      {/* CPR Pause countdown (if paused) */}
      {pauseCountdown && !cprActive && (
        <PauseCountdown
          data={pauseCountdown}
          now={now}
          onResume={handleResume}
          isTraining={isTraining}
        />
      )}

      {/* Main action buttons — 2 rows */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* ROSC */}
        <button onClick={onROSC}
          className="btn-action py-3.5 text-sm bg-transparent border-2 border-success/50 text-success font-bold">
          💚 ROSC
        </button>
        {/* Check Rhythm */}
        <button onClick={handleCheckRhythm}
          className={`btn-action py-3.5 text-sm font-bold ${
            almostDone ? 'btn-info' : 'btn-ghost'
          }`}>
          🔍 Check Rhythm
        </button>
      </div>

      {/* Secondary action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={onShock}
          className={`btn-action py-3 text-xs font-semibold ${
            currentRhythm?.shockable ? 'btn-shock' : 'btn-ghost'
          }`}>
          ⚡ Shock
        </button>
        <button onClick={onGiveDrug}
          className={`btn-action py-3 text-xs font-semibold ${
            epiDue ? 'btn-purple animate-pulse' : 'btn-ghost'
          }`}>
          💉 Drug
        </button>
        <button onClick={onAirway}
          className="btn-action btn-ghost py-3 text-xs font-semibold">
          🫁 Airway
        </button>
        <button onClick={onSecondary}
          className="btn-action btn-ghost py-3 text-xs font-semibold">
          🔍 H&T
        </button>
      </div>

      {/* Pause reason modal */}
      {showPauseReason && (
        <div className="glass-card !p-3 space-y-1.5">
          <div className="text-xs font-semibold text-text-muted mb-1">Why pause CPR?</div>
          {[
            { reason: 'rhythm_check', label: 'Rhythm/Pulse Check', max: 10, icon: '🔍' },
            { reason: 'defibrillation', label: 'Defibrillation', max: 5, icon: '⚡' },
            { reason: 'airway', label: 'Airway Placement', max: 15, icon: '🫁' },
            { reason: 'switch', label: 'Switch Compressor', max: 5, icon: '🔄' },
            { reason: 'rosc_check', label: 'Suspected ROSC', max: 10, icon: '💚' },
          ].map(r => (
            <button key={r.reason} onClick={() => handlePause(r.reason, r.label, r.max)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-xs">
              <span className="font-semibold">{r.icon} {r.label}</span>
              <span className="text-text-muted">≤{r.max}s</span>
            </button>
          ))}
          <button onClick={() => setShowPauseReason(false)}
            className="w-full text-text-muted text-[10px] underline mt-1">Cancel</button>
        </div>
      )}
    </div>
  );
}

// Pause countdown component
function PauseCountdown({ data, now, onResume, isTraining }) {
  const pauseDuration = Math.round((now - data.startedAt) / 1000);
  const overTime = pauseDuration > data.maxSec;

  return (
    <div className={`glass-card !p-3 text-center ${overTime ? '!border-danger/50 animate-pulse' : '!border-warning/50'}`}>
      <div className="text-xs text-text-muted font-semibold mb-1">⏸ CPR Paused: {data.label}</div>
      <div className={`text-3xl font-mono font-black ${overTime ? 'text-danger' : 'text-warning'}`}>
        {pauseDuration}s
      </div>
      {overTime && (
        <div className="text-xs text-danger font-bold mt-1">
          ⚠️ Exceeded {data.maxSec}s — Resume CPR NOW!
        </div>
      )}
      {isTraining && overTime && (
        <div className="text-[10px] text-danger mt-0.5">Pause too long = score penalty</div>
      )}
      <button onClick={onResume}
        className="w-full btn-action btn-success py-3 text-sm font-bold mt-2">
        ▶️ Resume CPR
      </button>
    </div>
  );
}
