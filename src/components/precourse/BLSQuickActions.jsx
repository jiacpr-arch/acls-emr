import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getScenarioGameStatus } from '../../data/blsScenarios';
import { getSimGameStatus } from '../../game/achievements';

// Numbered study journey for the BLS landing. Full-width step cards (1 → 5)
// that mirror the Learn hub's card style, so the Pre-course page is the single
// place a student follows: อ่านบท → ฝึก CPR → BLS Rescue → Post-test → ใบประกาศฯ.
const toneColor = {
  info:    'var(--color-info)',
  danger:  'var(--color-danger)',
  purple:  'var(--color-purple)',
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
  // ขั้นที่ 2 (ฝึก CPR) วัดผลจากเกมลำดับขั้น 8 ด่าน + ข้อสอบรวม — อ่านสดจาก
  // localStorage ทุก render ให้ตรงกับเงื่อนไขบนหน้าใบประกาศนียบัตร
  const scenarioGame = getScenarioGameStatus();
  // ขั้นที่ 3 (เกม BLS Rescue) วัดผลจากเคสตัดสินใจระดับพื้นฐานให้ครบทุกเคส —
  // อ่านสดจาก localStorage เหมือนกัน (ตรงกับเงื่อนไขบนหน้าใบประกาศนียบัตร)
  const simGame = getSimGameStatus();
  // ใบประกาศนียบัตรต้องผ่านทุกขั้น 1–4 ไม่ใช่แค่ Post-test
  const allStepsDone = lessonsComplete && scenarioGame.allPassed && simGame.allPassed && postTestPassed;

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
      subtitle: 'Metronome + เกมลำดับขั้น',
      desc: scenarioGame.allPassed ? 'ผ่านครบทุกด่านแล้ว' : 'จังหวะ 110/นาที · ผ่านเกมให้ครบทุกด่าน',
      tone: 'danger',
      onClick: () => navigate('/skill-practice'),
      count: { done: scenarioGame.done, total: scenarioGame.total },
      complete: scenarioGame.allPassed,
    },
    {
      step: 3,
      emoji: '🚨',
      label: 'เกม BLS Rescue',
      subtitle: 'ภารกิจกู้ชีพ',
      desc: simGame.allPassed ? 'ผ่านครบทุกเคสพื้นฐานแล้ว' : 'ผ่านเคสพื้นฐานให้ครบทุกหมวด',
      tone: 'purple',
      onClick: () => navigate('/sim'),
      count: { done: simGame.done, total: simGame.total },
      complete: simGame.allPassed,
    },
    {
      step: 4,
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
      step: 5,
      emoji: '🏅',
      label: 'ใบประกาศนียบัตร',
      subtitle: 'My Records',
      desc: allStepsDone ? 'พร้อมดาวน์โหลด' : 'ผ่านขั้น 1–4 ให้ครบก่อน',
      tone: 'warning',
      onClick: () => navigate('/certification'),
      complete: allStepsDone,
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
            {/* Step number badge — drives the 1 → 2 → 3 → 4 → 5 reading order */}
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
