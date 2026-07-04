import { useCaseStore } from '../../stores/caseStore';
import { useTimerStore } from '../../stores/timerStore';
import { formatTimeLong, formatTime } from '../../utils/formatTime';
import { CPR_TIMER_STEPS } from '../../data/recordingSteps';
import { HeartPulse, Pause, Pill, AlertTriangle, FileText, Zap } from 'lucide-react';

export default function TimerBar({ onToggleLog, showLog, isTraining, currentStep }) {
  const { elapsed, cycleElapsed, cycleNumber, cycleDuration, cprActive, isRunning } = useTimerStore();
  const { shockCount, events, drugTimers } = useCaseStore();
  const cycleRemaining = cycleDuration - cycleElapsed;
  const cycleProgress = (cycleElapsed / cycleDuration) * 100;

  // Only show CPR cycle info during cardiac arrest steps
  const showCPRCycle = CPR_TIMER_STEPS.includes(currentStep);

  // Show drug interval timers for Brady/Tachy
  const now = Date.now();
  const activeTimers = drugTimers.filter(t => t.isActive);

  return (
    <div className="timer-bar px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-mono font-black tabular-nums tracking-tight ${isRunning ? (isTraining ? 'text-info' : 'text-danger') : 'text-text-muted'}`}>
          {formatTimeLong(elapsed)}
        </div>

        {showCPRCycle ? (
          /* CPR mode — show cycle timer */
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-3xs text-text-muted font-medium">Cycle {cycleNumber}</span>
              <span className={`badge ${cprActive ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                {cprActive ? <HeartPulse size={11} strokeWidth={2.4} /> : <Pause size={11} strokeWidth={2.4} />}
                {cprActive ? 'CPR' : 'PAUSE'} · {formatTime(cycleRemaining)}
              </span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${cycleProgress > 90 ? 'bg-danger animate-pulse' : cycleProgress > 75 ? 'bg-warning' : 'bg-info'}`}
                style={{ width: `${cycleProgress}%` }} />
            </div>
          </div>
        ) : (
          /* Non-CPR mode — show drug timers or just elapsed */
          <div className="flex-1 min-w-0">
            {activeTimers.length > 0 ? (
              activeTimers.slice(0, 2).map(t => {
                const rem = Math.max(0, Math.ceil((t.intervalSeconds * 1000 - (now - t.startedAt)) / 1000));
                const due = rem <= 0;
                return (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-3xs text-text-muted font-medium truncate inline-flex items-center gap-1">
                      <Pill size={11} strokeWidth={2.2} /> {t.drugName}
                    </span>
                    <span className={`badge ${due ? 'bg-danger/15 text-danger animate-pulse' : 'bg-purple/15 text-purple'}`}>
                      {due ? <><AlertTriangle size={11} strokeWidth={2.4} /> DUE</> : formatTime(rem)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-3xs text-text-muted">Recording...</div>
            )}
          </div>
        )}

        {showCPRCycle && (
          <span className="badge bg-shock/15 text-shock"><Zap size={11} strokeWidth={2.4} /> {shockCount}</span>
        )}
        <button onClick={onToggleLog} className={`badge transition-all ${showLog ? 'bg-info/20 text-info' : 'bg-bg-tertiary/50 text-text-muted'}`}>
          <FileText size={11} strokeWidth={2.2} /> {events.length}
        </button>
      </div>
    </div>
  );
}
