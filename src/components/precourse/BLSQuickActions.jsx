import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

// Numbered study journey for the BLS landing. Full-width step cards (1 → 4)
// that mirror the Learn hub's card style, so the Pre-course page is the single
// place a student follows: อ่านบท → ฝึก CPR → Post-test → ใบประกาศฯ.
const toneColor = {
  info:    'var(--color-info)',
  danger:  'var(--color-danger)',
  shock:   'var(--color-shock)',
  warning: 'var(--color-warning)',
};

export default function BLSQuickActions({
  lessonsPassed,
  totalLessons,
  postTestPassed,
  postTestUnlocked,
  onScrollToLessons,
}) {
  const navigate = useNavigate();

  const lessonsComplete = totalLessons > 0 && lessonsPassed === totalLessons;

  const tiles = [
    {
      step: 1,
      emoji: '🎓',
      label: 'บทเรียน',
      subtitle: `${totalLessons} บท + Quiz`,
      desc: 'อ่าน + ทำแบบทดสอบ',
      tone: 'info',
      onClick: onScrollToLessons,
      count: { done: lessonsPassed, total: totalLessons },
      complete: lessonsComplete,
    },
    {
      step: 2,
      emoji: '💗',
      label: 'ฝึก CPR',
      subtitle: 'Metronome',
      desc: 'จังหวะ 110/นาที',
      tone: 'danger',
      onClick: () => navigate('/skill-practice'),
    },
    {
      step: 3,
      emoji: '🏆',
      label: 'Post-test',
      subtitle: 'ข้อสอบปลายทาง',
      desc: postTestPassed ? 'ผ่านแล้ว' : postTestUnlocked ? 'พร้อมสอบ' : 'ยังไม่ปลดล็อก',
      tone: 'shock',
      onClick: () => postTestUnlocked && navigate('/pre-course/post-test'),
      disabled: !postTestUnlocked,
      complete: postTestPassed,
    },
    {
      step: 4,
      emoji: '🏅',
      label: 'ใบประกาศนียบัตร',
      subtitle: 'My Records',
      desc: postTestPassed ? 'พร้อมดาวน์โหลด' : 'ผ่าน Post-test ก่อน',
      tone: 'warning',
      onClick: () => navigate('/certification'),
      complete: postTestPassed,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {tiles.map((tile) => {
        const color = toneColor[tile.tone] || toneColor.info;
        return (
          <button
            key={tile.step}
            onClick={tile.onClick}
            disabled={tile.disabled}
            className={`learn-card tone-${tile.tone} relative flex flex-col items-center text-center px-3 pt-6 pb-4 disabled:opacity-55 disabled:cursor-not-allowed`}
          >
            {/* Step number badge — drives the 1 → 2 → 3 → 4 reading order */}
            <span
              className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 text-2xs font-extrabold text-white shadow-sm"
              style={{ borderRadius: '50%', background: color }}
              aria-hidden="true"
            >
              {tile.step}
            </span>

            {/* Top-right progress marker: green check when done, xx/xx while a
                multi-chapter unit is still incomplete. */}
            {tile.complete ? (
              <span
                className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 text-white shadow-sm"
                style={{ borderRadius: '50%', background: 'var(--color-success)' }}
              >
                <Check size={14} strokeWidth={3} />
              </span>
            ) : tile.count?.total ? (
              <span
                className="absolute top-2 right-2 inline-flex items-center justify-center px-1.5 h-6 text-2xs font-extrabold text-white shadow-sm"
                style={{ borderRadius: '999px', background: color }}
                aria-hidden="true"
              >
                {tile.count.done}/{tile.count.total}
              </span>
            ) : null}

            <span className="text-[40px] leading-none mb-2" aria-hidden="true">
              {tile.emoji}
            </span>
            <span className="text-base font-bold leading-tight" style={{ color }}>
              {tile.label}
            </span>
            <span className="text-sm font-semibold text-text-primary leading-tight mt-0.5">
              {tile.subtitle}
            </span>
            <span className="text-xs text-text-muted leading-snug mt-1">
              {tile.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
