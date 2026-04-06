import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { formatTimeLong, formatTime } from '../utils/formatTime';

export default function MasterTimer() {
  const {
    elapsed, isRunning, cycleElapsed, cycleNumber, cycleDuration,
    cprActive, setWorker, tick, newCycle
  } = useTimerStore();

  const workerRef = useRef(null);
  const prevCycleRef = useRef(0);

  // Initialize web worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        tick(e.data.elapsed);
      }
    };

    workerRef.current = worker;
    setWorker(worker);

    return () => worker.terminate();
  }, []);

  // Cycle boundary detection
  useEffect(() => {
    if (elapsed > 0 && cycleElapsed < prevCycleRef.current && isRunning) {
      newCycle();
    }
    prevCycleRef.current = cycleElapsed;
  }, [cycleElapsed]);

  const cycleProgress = (cycleElapsed / cycleDuration) * 100;
  const cycleRemaining = cycleDuration - cycleElapsed;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-bg-secondary rounded-xl">
      {/* Master Clock */}
      <div className="text-center">
        <div className="text-text-muted text-xs uppercase tracking-wider">Total Time</div>
        <div className={`text-3xl font-mono font-bold tabular-nums ${isRunning ? 'text-danger' : 'text-text-primary'}`}>
          {formatTimeLong(elapsed)}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-bg-tertiary" />

      {/* Cycle Timer */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-muted text-xs">
            Cycle {cycleNumber} — {formatTime(cycleRemaining)} remaining
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            cprActive ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            {cprActive ? '🫀 CPR' : '⏸ PAUSE'}
          </span>
        </div>

        {/* Cycle progress bar */}
        <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              cycleProgress > 90 ? 'bg-danger animate-pulse' :
              cycleProgress > 75 ? 'bg-warning' : 'bg-info'
            }`}
            style={{ width: `${cycleProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
