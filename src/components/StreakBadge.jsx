import { useEffect, useState } from 'react';
import { Flame, PartyPopper } from 'lucide-react';
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
      style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A' }}
    >
      <div
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, borderRadius: 12, background: '#D9770615', color: '#D97706' }}
        aria-hidden="true"
      >
        <Flame size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-caption" style={{ color: '#92400E' }}>
          เข้าเรียนต่อเนื่อง
          {streak.best > streak.count && (
            <span className="ml-1 opacity-70">(best {streak.best})</span>
          )}
        </div>
        <div className="text-headline" style={{ color: '#B45309' }}>
          {streak.count} วัน
          {isMilestone && (
            <span className="ml-2 text-caption inline-flex items-center gap-1" style={{ color: '#B45309' }}>
              <PartyPopper size={14} strokeWidth={2.2} /> ครบสัปดาห์!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
