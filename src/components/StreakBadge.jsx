import { useEffect, useState } from 'react';
import { recordVisitToday } from '../services/streakService';

export default function StreakBadge() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    setStreak(recordVisitToday());
  }, []);

  if (!streak || streak.count < 1) return null;

  const isMilestone = streak.count > 0 && streak.count % 7 === 0;

  return (
    <div
      className="dash-card flex items-center gap-3"
      style={{
        background: isMilestone
          ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.10) 0%, rgba(220, 38, 38, 0.10) 100%)'
          : undefined,
        borderLeft: '4px solid #D97706',
      }}
    >
      <div
        className="w-10 h-10 inline-flex items-center justify-center shrink-0 text-[22px]"
        style={{ background: 'rgba(217, 119, 6, 0.12)', borderRadius: 'var(--radius)' }}
        aria-hidden="true"
      >
        🔥
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-overline text-text-muted">
          เข้าเรียนต่อเนื่อง
          {streak.best > streak.count && (
            <span className="ml-1 opacity-70">(best {streak.best})</span>
          )}
        </div>
        <div className="text-body-strong text-text-primary mt-0.5">
          <span style={{ color: '#D97706' }}>{streak.count}</span> วัน
          {isMilestone && <span className="ml-2 text-caption text-warning">🎉 ครบสัปดาห์!</span>}
        </div>
      </div>
    </div>
  );
}
