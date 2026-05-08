import { useTimerStore } from '../stores/timerStore';

export default function CCFGauge() {
  const { totalCPRTime, elapsed, pauses } = useTimerStore();
  const ccf = elapsed > 0 ? Math.round((totalCPRTime / elapsed) * 100) : 0;

  const getColor = (val) => {
    if (val >= 80) return 'text-success';
    if (val >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getBgColor = (val) => {
    if (val >= 80) return 'stroke-success';
    if (val >= 60) return 'stroke-warning';
    return 'stroke-danger';
  };

  // SVG circular gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (ccf / 100) * circumference;

  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">CCF</div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="90" height="90" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="45" cy="45" r={radius}
              fill="none" strokeWidth="8"
              className="stroke-bg-tertiary"
            />
            {/* Progress circle */}
            <circle
              cx="45" cy="45" r={radius}
              fill="none" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={`${getBgColor(ccf)} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold font-mono ${getColor(ccf)}`}>{ccf}%</span>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between text-text-secondary">
          <span>Target</span>
          <span className="font-semibold">≥80%</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>CPR Time</span>
          <span className="font-mono">{Math.round(totalCPRTime)}s</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Pauses</span>
          <span className="font-mono">{pauses.length}</span>
        </div>
      </div>
    </div>
  );
}
