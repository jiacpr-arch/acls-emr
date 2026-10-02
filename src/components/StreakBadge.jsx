import { useEffect, useState } from 'react';
import { Flame, PartyPopper } from 'lucide-react';
import { recordVisitToday } from '../services/streakService';

// compact = ชิป mono เล็กบนบรรทัด hero หน้าแรก; ค่าเริ่มต้นเป็นการ์ดเต็ม
export default function StreakBadge({ compact = false }) {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    setStreak(recordVisitToday());
  }, []);

  if (!streak || streak.count < 1) return null;

  const isMilestone = streak.count > 0 && streak.count % 7 === 0;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-2xs font-semibold text-text-secondary bg-bg-secondary border border-border"
        style={{ borderRadius: 99 }}
        title={streak.best > streak.count ? `เข้าเรียนต่อเนื่อง ${streak.count} วัน (best ${streak.best})` : `เข้าเรียนต่อเนื่อง ${streak.count} วัน`}
      >
        <Flame size={12} strokeWidth={2.2} className={isMilestone ? 'text-warning' : ''} aria-hidden="true" />
        {streak.count} วัน
      </span>
    );
  }

  return (
    <div className="dash-card flex items-center gap-3">
      <div
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-bg-tertiary)', color: 'var(--color-warning)' }}
        aria-hidden="true"
      >
        <Flame size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-caption text-text-muted">
          เข้าเรียนต่อเนื่อง
          {streak.best > streak.count && (
            <span className="ml-1 opacity-70">(best {streak.best})</span>
          )}
        </div>
        <div className="text-headline text-text-primary">
          {streak.count} วัน
          {isMilestone && (
            <span className="ml-2 text-caption inline-flex items-center gap-1 text-warning">
              <PartyPopper size={14} strokeWidth={2.2} /> ครบสัปดาห์!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
