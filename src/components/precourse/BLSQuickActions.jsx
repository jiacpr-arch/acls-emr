import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, HeartPulse, Siren, Trophy, Award,
  CheckCircle2, Lock,
} from 'lucide-react';
import { getScenarioGameStatus } from '../../data/blsScenarios';
import { simGameStatus } from '../../data/codeBlueScenarios';

// Numbered study journey for the BLS landing (firstaid LearningPathCard
// style): one white card, five numbered rows 1 → 5. The Pre-course page is
// the single place a student follows: อ่านบท → ฝึก CPR → เกมกู้ชีพ →
// Post-test → ใบประกาศฯ.
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
  // ใบประกาศนียบัตร (ขั้น 5) ต้องผ่านทุกขั้น 1–4 ไม่ใช่แค่ Post-test
  const simGame = simGameStatus();
  const allStepsDone = lessonsComplete && scenarioGame.allPassed && postTestPassed && simGame.allPassed;

  const tiles = [
    {
      step: 1,
      color: '#2563EB',
      Icon: GraduationCap,
      label: 'บทเรียน',
      desc: `${totalLessons} บท + Quiz · อ่าน + ทำแบบทดสอบ`,
      onClick: onScrollToLessons,
      count: { done: lessonsPassed, total: totalLessons },
      complete: lessonsComplete,
    },
    {
      step: 2,
      color: '#DC2626',
      Icon: HeartPulse,
      label: 'ฝึก CPR',
      desc: scenarioGame.allPassed
        ? 'Metronome + เกมลำดับขั้น · ผ่านครบทุกด่านแล้ว'
        : 'Metronome จังหวะ 110/นาที · ผ่านเกมให้ครบทุกด่าน',
      onClick: () => navigate('/skill-practice'),
      count: { done: scenarioGame.done, total: scenarioGame.total },
      complete: scenarioGame.allPassed,
    },
    {
      step: 3,
      color: '#EA580C',
      Icon: Siren,
      label: 'เกมกู้ชีพ',
      desc: simGame.allPassed
        ? `BLS Rescue ${simGame.total} เคส · ผ่านครบทุกเคสแล้ว`
        : `BLS Rescue · เกมตัดสินใจช่วยชีวิต ${simGame.total} เคส`,
      onClick: () => navigate('/sim'),
      count: { done: simGame.done, total: simGame.total },
      complete: simGame.allPassed,
    },
    {
      step: 4,
      color: '#059669',
      Icon: Trophy,
      label: 'Post-test',
      desc: postTestPassed ? 'ผ่านแล้ว' : postTestUnlocked ? 'ข้อสอบปลายทาง · พร้อมสอบ' : 'ข้อสอบปลายทาง · ยังไม่ปลดล็อก',
      onClick: () => postTestUnlocked && navigate('/pre-course/post-test'),
      disabled: !postTestUnlocked,
      complete: postTestPassed,
    },
    {
      step: 5,
      color: '#D97706',
      Icon: Award,
      label: 'ใบประกาศนียบัตร',
      desc: allStepsDone ? 'พร้อมดาวน์โหลด' : 'ผ่านขั้น 1–4 ให้ครบก่อน',
      onClick: () => navigate('/certification'),
      complete: allStepsDone,
    },
  ];

  return (
    <div className="card">
      <div className="text-headline text-text-primary">เส้นทางสู่ใบประกาศนียบัตร</div>
      <div className="text-caption text-text-muted" style={{ marginBottom: 10 }}>
        ทำตามลำดับ 1 → 5
      </div>
      <div className="flex flex-col gap-1.5">
        {tiles.map((tile) => {
          const Icon = tile.Icon;
          return (
            <button
              key={tile.step}
              onClick={tile.onClick}
              disabled={tile.disabled}
              className="w-full flex items-center gap-3 p-2.5 transition-colors hover:bg-bg-tertiary/60 disabled:opacity-55 disabled:cursor-not-allowed"
              style={{ borderRadius: 10, textAlign: 'left', justifyContent: 'flex-start' }}
            >
              {/* 36px badge: เสร็จ = เช็คเขียว, ล็อก = กุญแจ, ปกติ = เลขขั้น */}
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: tile.complete
                    ? '#D1FAE5'
                    : tile.disabled
                      ? 'var(--color-bg-tertiary)'
                      : `${tile.color}15`,
                }}
                aria-hidden="true"
              >
                {tile.complete ? (
                  <CheckCircle2 size={20} color="var(--color-success)" />
                ) : tile.disabled ? (
                  <Lock size={16} className="text-text-muted" />
                ) : (
                  <span className="font-bold" style={{ color: tile.color }}>{tile.step}</span>
                )}
              </span>
              <Icon size={20} strokeWidth={2.2} className="shrink-0"
                style={{ color: tile.complete ? 'var(--color-success)' : tile.color }} />
              <span className="flex-1 min-w-0">
                <span className="block text-body-strong text-text-primary">{tile.label}</span>
                <span className="block text-caption text-text-muted">{tile.desc}</span>
              </span>
              {!tile.complete && tile.count?.total ? (
                <span
                  className="text-2xs font-bold px-2 py-1 shrink-0"
                  style={{ borderRadius: 99, color: tile.color, background: `${tile.color}12` }}
                  aria-hidden="true"
                >
                  {tile.count.done}/{tile.count.total}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
