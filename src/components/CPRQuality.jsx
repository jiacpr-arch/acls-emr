import { useTimerStore } from '../stores/timerStore';

export default function CPRQuality() {
  const { totalCPRTime, elapsed, pauses, cycleNumber, cprActive } = useTimerStore();
  const ccf = elapsed > 0 ? Math.round((totalCPRTime / elapsed) * 100) : 0;

  // Calculate quality score
  const getScore = () => {
    if (elapsed < 10) return { grade: '-', label: 'Recording...', color: 'text-text-muted' };
    if (ccf >= 80 && pauses.every(p => (p.duration || 0) <= 10)) {
      return { grade: 'A', label: 'Excellent', color: 'text-success' };
    }
    if (ccf >= 60) {
      return { grade: 'B', label: 'Adequate', color: 'text-warning' };
    }
    return { grade: 'C', label: 'Needs Improvement', color: 'text-danger' };
  };

  const score = getScore();

  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">CPR Quality</div>

      {/* Grade */}
      <div className="text-center mb-3">
        <div className={`text-4xl font-bold ${score.color}`}>{score.grade}</div>
        <div className={`text-xs font-semibold ${score.color}`}>{score.label}</div>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <MetricRow
          label="CCF"
          value={`${ccf}%`}
          target="≥80%"
          ok={ccf >= 80}
          warn={ccf >= 60}
        />
        <MetricRow
          label="Cycles"
          value={cycleNumber}
          target=""
          ok={true}
        />
        <MetricRow
          label="Total Pauses"
          value={pauses.length}
          target="Minimize"
          ok={pauses.length <= cycleNumber}
        />
        <MetricRow
          label="Status"
          value={cprActive ? 'Compressing' : 'Paused'}
          target=""
          ok={cprActive}
        />
      </div>
    </div>
  );
}

function MetricRow({ label, value, target, ok, warn }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        {target && <span className="text-text-muted">{target}</span>}
        <span className={`font-semibold font-mono ${
          ok ? 'text-success' : (warn ? 'text-warning' : 'text-danger')
        }`}>
          {value}
        </span>
      </div>
    </div>
  );
}
