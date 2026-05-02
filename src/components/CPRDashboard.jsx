import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useCaseStore } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playDrugAlert, playBeep } from '../utils/sound';
import { formatTime, formatTimeLong } from '../utils/formatTime';
import CircularTimer from './CircularTimer';
import {
  RefreshCw, Wind, Search, HeartPulse, Pause, Play, Pill,
  AlertTriangle, Syringe, Zap, X, Hand,
} from 'lucide-react';

export default function CPRDashboard({
  onCheckRhythm,
  onGiveDrug,
  onAirway,
  onROSC,
  onSecondary,
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
    addEtCO2, events,
  } = useCaseStore();

  const settings = useSettingsStore();

  const hasAdvancedAirway = events.some(e =>
    e.category === 'airway' && (e.type?.includes('ETT') || e.type?.includes('SGA') || e.type?.includes('LMA'))
  );

  const [cprMode, setCprMode] = useState('hand_only');
  const [breathAlert, setBreathAlert] = useState(false);
  const breathTimerRef = useRef(null);

  useEffect(() => {
    if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    if (cprMode === 'advanced' && cprActive && settings.soundEnabled) {
      breathTimerRef.current = setInterval(() => {
        playBeep(523, 0.2, 0.25);
        setBreathAlert(true);
        setTimeout(() => setBreathAlert(false), 1500);
      }, 6000);
    }
    return () => { if (breathTimerRef.current) clearInterval(breathTimerRef.current); };
  }, [cprMode, cprActive, settings.soundEnabled]);

  const [compressionCount, setCompressionCount] = useState(0);
  useEffect(() => {
    if (cprMode !== 'bvm_30_2' || !cprActive) { setCompressionCount(0); return; }
    const ms = Math.round(60000 / (settings.metronomeRate || 110));
    const iv = setInterval(() => {
      setCompressionCount(prev => {
        const next = prev + 1;
        if (next >= 30) {
          setBreathAlert(true);
          if (settings.soundEnabled) playBeep(523, 0.3, 0.3);
          setTimeout(() => setBreathAlert(false), 3000);
          return 0;
        }
        return next;
      });
    }, ms);
    return () => clearInterval(iv);
  }, [cprMode, cprActive, settings.metronomeRate, settings.soundEnabled]);

  useEffect(() => { if (!cprActive) startCPR(); }, []);

  const remaining = cycleDuration - cycleElapsed;
  const almostDone = remaining <= 15;
  const ccf = getCCF();

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

  const [etco2Val, setEtco2Val] = useState(35);
  const [showPauseReason, setShowPauseReason] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(null);

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

  const compressionColor = almostDone ? 'stroke-danger' : 'stroke-success';
  const epiColor = epiDue ? 'stroke-danger' : 'stroke-purple';
  const ccfColor = ccf >= 80 ? 'text-success' : ccf >= 60 ? 'text-warning' : 'text-danger';

  return (
    <div className="text-center space-y-3 animate-slide-up">
      {/* Total time header */}
      <div className="dash-card !py-2.5 !px-4 flex items-center justify-between">
        <div className="text-left">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Duration</div>
          <div className="text-numeric text-2xl text-text-primary tracking-tight">{formatTimeLong(elapsed)}</div>
        </div>
        <div className="flex gap-2">
          <div className="stat-box !p-2 min-w-[58px]">
            <div className={`stat-value text-lg ${ccfColor}`}>{ccf}%</div>
            <div className="stat-label">CCF</div>
          </div>
          <div className="stat-box !p-2 min-w-[58px]">
            <div className="stat-value text-lg text-shock">{shockCount}</div>
            <div className="stat-label">Shocks</div>
          </div>
        </div>
      </div>

      {/* Compressor rotation alert */}
      {compressorRotateDue && (
        <button onClick={dismissCompressorRotate}
          className="w-full bg-warning/10 border border-warning/30 px-4 py-2.5 text-caption font-bold text-warning animate-pulse text-center inline-flex items-center justify-center gap-2"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <RefreshCw size={14} strokeWidth={2.4} /> Switch Compressor! — Tap to dismiss
        </button>
      )}

      {/* Two circular timers */}
      <div className="flex items-start justify-center gap-3 px-2">
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
          <div className={`text-numeric text-[1.75rem] tracking-tight ${almostDone ? 'text-danger' : 'text-success'}`}>
            {formatTime(remaining)}
          </div>
          <div className="text-[10px] text-text-muted font-semibold">/ {formatTime(cycleDuration)}</div>
        </CircularTimer>

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
              <div className={`text-numeric text-[1.75rem] tracking-tight ${epiDue ? 'text-danger' : 'text-purple'}`}>
                {epiDue ? 'DUE' : formatTime(epiRemaining)}
              </div>
              <div className="text-[10px] text-text-muted font-semibold">q3-5 min</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-text-muted">--:--</div>
              <div className="text-[10px] text-text-muted">No Epi yet</div>
            </>
          )}
        </CircularTimer>
      </div>

      {/* Breath alert */}
      {breathAlert && (
        <div className="bg-info text-white text-center py-2.5 text-body-strong animate-pulse inline-flex items-center justify-center gap-2 w-full"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Wind size={16} strokeWidth={2.4} /> {cprMode === 'bvm_30_2' ? '2 BREATHS NOW!' : 'GIVE 1 BREATH'}
        </div>
      )}

      {/* BVM 30:2 compression counter */}
      {cprMode === 'bvm_30_2' && cprActive && !breathAlert && (
        <div className="text-center text-caption text-text-muted">
          Compressions: <span className="font-mono font-bold text-text-primary">{compressionCount}/30</span>
        </div>
      )}

      {/* CPR mode segmented control */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'hand_only', Icon: Hand, label: 'Hand-only' },
          { id: 'bvm_30_2', Icon: Wind, label: 'BVM 30:2' },
          { id: 'advanced', Icon: Wind, label: 'Advanced' },
        ].map(m => {
          const MIcon = m.Icon;
          const active = cprMode === m.id;
          return (
            <button key={m.id} onClick={() => {
              setCprMode(m.id);
              addEvent({ elapsed, category: 'cpr',
                type: `CPR Mode: ${m.id === 'hand_only' ? 'Hand-only' : m.id === 'bvm_30_2' ? 'BVM 30:2' : 'Advanced Airway (continuous)'}`,
                details: { cprMode: m.id }
              });
            }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-colors ${
              active ? 'bg-info text-white' : 'bg-bg-secondary border border-border text-text-muted hover:bg-bg-tertiary'
            }`} style={{ borderRadius: 'var(--radius-sm)' }}>
              <MIcon size={12} strokeWidth={2.2} /> {m.label}
            </button>
          );
        })}
      </div>

      {isTraining && (
        <div className="text-left text-caption text-info"
          style={{
            background: 'rgba(37, 99, 235, 0.06)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            padding: '8px 12px',
            borderRadius: 'var(--radius)',
          }}>
          <span className="text-overline" style={{ color: 'var(--color-info)' }}>Tip </span>
          {currentRhythm?.shockable
            ? 'Shockable: Epi after 2nd shock → Amiodarone after 3rd shock'
            : 'Non-shockable: Epi immediately → repeat q3-5 min'
          }
        </div>
      )}

      {/* EtCO₂ */}
      {hasAdvancedAirway ? (
      <div className={`dash-card !p-2.5 ${etco2Val > 40 ? '!border-success/50 animate-pulse' : etco2Val < 10 ? '!border-danger/50' : ''}`}>
        <div className="flex items-center gap-3">
          <Wind size={16} strokeWidth={2.2} className="text-text-secondary shrink-0" />
          <div className="flex-1">
            <input type="range" min={0} max={80} value={etco2Val}
              onChange={e => setEtco2Val(parseInt(e.target.value))}
              className="w-full accent-info h-2" />
            <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
              <span className="text-danger">&lt;10</span>
              <span>EtCO₂</span>
              <span className="text-success">&gt;20 ROSC?</span>
            </div>
          </div>
          <span className={`text-numeric text-xl min-w-[40px] text-right ${
            etco2Val < 10 ? 'text-danger' : etco2Val > 40 ? 'text-success animate-pulse' : etco2Val > 20 ? 'text-success' : 'text-text-primary'
          }`}>{etco2Val}</span>
          <button onClick={() => {
            addEtCO2(etco2Val, 'during_cpr');
            addEvent({ elapsed, category: 'etco2', type: `🌬️ EtCO₂: ${etco2Val} mmHg`, details: { value: etco2Val } });
          }} className="btn btn-info btn-sm">Save</button>
        </div>
        {etco2Val > 40 && (
          <div className="text-caption text-success font-bold mt-1 text-center inline-flex items-center justify-center gap-1 w-full">
            <AlertTriangle size={12} strokeWidth={2.4} /> EtCO₂ &gt;40 — Check Pulse NOW!
          </div>
        )}
      </div>
      ) : (
      <div className="dash-card !p-2.5 flex items-center justify-between">
        <span className="text-caption text-text-muted inline-flex items-center gap-1.5">
          <Wind size={13} strokeWidth={2} /> EtCO₂
        </span>
        <span className="text-[11px] text-text-muted">Place ETT/SGA first to measure EtCO₂</span>
      </div>
      )}

      {/* Other drug timers (non-epi) */}
      {activeDrugTimers.filter(t => t.drugId !== 'epinephrine_arrest').map(t => {
        const rem = Math.max(0, Math.ceil((t.intervalSeconds * 1000 - (now - t.startedAt)) / 1000));
        const due = rem <= 0;
        return (
          <div key={t.id} className={`dash-card flex items-center justify-between !px-4 !py-2 text-caption ${
            due ? '!border-danger/40 animate-pulse' : ''
          }`}>
            <span className="font-semibold inline-flex items-center gap-1.5">
              <Pill size={13} strokeWidth={2} /> {t.drugName}
            </span>
            <span className={`font-mono font-bold inline-flex items-center gap-1 ${due ? 'text-danger' : 'text-text-primary'}`}>
              {due ? <><AlertTriangle size={12} strokeWidth={2.4} /> DUE</> : formatTime(rem)}
            </span>
          </div>
        );
      })}

      {/* CPR Pause countdown */}
      {pauseCountdown && !cprActive && (
        <PauseCountdown data={pauseCountdown} now={now} onResume={handleResume} isTraining={isTraining} />
      )}

      {/* Main action buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={onROSC} className="btn btn-outline-success btn-lg btn-block">
          <HeartPulse size={16} strokeWidth={2.4} /> ROSC
        </button>
        <button onClick={handleCheckRhythm} className={`btn btn-lg btn-block ${almostDone ? 'btn-info' : 'btn-ghost'}`}>
          <Search size={16} strokeWidth={2.2} /> Check Rhythm
        </button>
      </div>

      {/* Secondary action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onGiveDrug}
          className={`btn btn-block ${epiDue ? 'btn-purple animate-pulse' : 'btn-ghost'}`}>
          <Syringe size={14} strokeWidth={2.2} /> Drug
        </button>
        <button onClick={onAirway} className="btn btn-ghost btn-block">
          <Wind size={14} strokeWidth={2.2} /> Airway
        </button>
        <button onClick={onSecondary} className="btn btn-ghost btn-block">
          <Search size={14} strokeWidth={2.2} /> H&T
        </button>
      </div>

      {/* Pause reason modal */}
      {showPauseReason && (
        <div className="dash-card !p-3 space-y-1.5">
          <div className="text-overline mb-1">Why pause CPR?</div>
          {[
            { reason: 'rhythm_check', label: 'Rhythm/Pulse Check', max: 10, Icon: Search },
            { reason: 'defibrillation', label: 'Defibrillation', max: 5, Icon: Zap },
            { reason: 'airway', label: 'Airway Placement', max: 15, Icon: Wind },
            { reason: 'switch', label: 'Switch Compressor', max: 5, Icon: RefreshCw },
            { reason: 'rosc_check', label: 'Suspected ROSC', max: 10, Icon: HeartPulse },
          ].map(r => {
            const RIcon = r.Icon;
            return (
              <button key={r.reason} onClick={() => handlePause(r.reason, r.label, r.max)}
                className="w-full flex items-center justify-between px-3 py-2 bg-bg-primary border border-border text-caption hover:bg-bg-tertiary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}>
                <span className="font-semibold inline-flex items-center gap-2">
                  <RIcon size={13} strokeWidth={2.2} className="text-text-secondary" /> {r.label}
                </span>
                <span className="text-text-muted">≤{r.max}s</span>
              </button>
            );
          })}
          <button onClick={() => setShowPauseReason(false)}
            className="w-full text-text-muted text-[11px] underline mt-1">Cancel</button>
        </div>
      )}
    </div>
  );
}

function PauseCountdown({ data, now, onResume, isTraining }) {
  const pauseDuration = Math.round((now - data.startedAt) / 1000);
  const overTime = pauseDuration > data.maxSec;

  return (
    <div className={`dash-card !p-3 text-center ${overTime ? '!border-danger/50 animate-pulse' : '!border-warning/50'}`}>
      <div className="text-overline mb-1 inline-flex items-center justify-center gap-1.5">
        <Pause size={11} strokeWidth={2.4} /> CPR Paused: {data.label}
      </div>
      <div className={`text-numeric text-3xl ${overTime ? 'text-danger' : 'text-warning'}`}>
        {pauseDuration}s
      </div>
      {overTime && (
        <div className="text-caption text-danger font-bold mt-1 inline-flex items-center justify-center gap-1 w-full">
          <AlertTriangle size={13} strokeWidth={2.4} /> Exceeded {data.maxSec}s — Resume CPR NOW!
        </div>
      )}
      {isTraining && overTime && (
        <div className="text-[11px] text-danger mt-0.5">Pause too long = score penalty</div>
      )}
      <button onClick={onResume} className="btn btn-success btn-lg btn-block mt-2">
        <Play size={16} strokeWidth={2.4} /> Resume CPR
      </button>
    </div>
  );
}
