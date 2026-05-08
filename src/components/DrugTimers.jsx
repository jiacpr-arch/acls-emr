import { useState, useEffect } from 'react';
import { useCaseStore } from '../stores/caseStore';

export default function DrugTimers() {
  const { drugTimers, removeDrugTimer } = useCaseStore();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (drugTimers.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [drugTimers.length]);

  if (drugTimers.length === 0) return null;

  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Drug Reminders</div>
      <div className="space-y-2">
        {drugTimers.filter(t => t.isActive).map(timer => {
          const elapsedMs = now - timer.startedAt;
          const totalMs = timer.intervalSeconds * 1000;
          const remainingMs = Math.max(0, totalMs - elapsedMs);
          const remainingSec = Math.ceil(remainingMs / 1000);
          const progress = Math.min(100, (elapsedMs / totalMs) * 100);
          const isDue = remainingMs <= 0;
          const isUrgent = remainingSec <= 30;

          const mins = Math.floor(remainingSec / 60);
          const secs = remainingSec % 60;

          return (
            <div key={timer.id} className={`p-2 rounded-lg ${
              isDue ? 'bg-danger/20 border border-danger animate-pulse' :
              isUrgent ? 'bg-warning/20 border border-warning' :
              'bg-bg-tertiary'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-text-primary">
                  💊 {timer.drugName}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono font-bold ${
                    isDue ? 'text-danger' : isUrgent ? 'text-warning' : 'text-text-primary'
                  }`}>
                    {isDue ? 'DUE NOW!' : `${mins}:${String(secs).padStart(2, '0')}`}
                  </span>
                  <button
                    onClick={() => removeDrugTimer(timer.id)}
                    className="text-text-muted hover:text-danger text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isDue ? 'bg-danger' : isUrgent ? 'bg-warning' : 'bg-purple'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
