export default function QuizProgress({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-caption">
        <span className="font-bold text-text-secondary">ข้อ {current} / {total}</span>
        <span className="text-text-muted">{pct}%</span>
      </div>
      <div className="progress-track !h-1.5">
        <div className="progress-fill bg-info" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
