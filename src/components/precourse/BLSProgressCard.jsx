import { useNavigate } from 'react-router-dom';
import { Play, Award, Sparkles } from 'lucide-react';

// At-a-glance progress + next-step CTA. Decides what the student should do
// next: identify → first lesson → continue → post-test → see certificate.
export default function BLSProgressCard({
  activeStudent,
  lessonsPassed,
  totalLessons,
  nextLesson,
  postTestPassed,
  postTestUnlocked,
  onIdentify,
}) {
  const navigate = useNavigate();

  const percent = totalLessons === 0
    ? 0
    : Math.round(((lessonsPassed + (postTestPassed ? 1 : 0)) / (totalLessons + 1)) * 100);

  let cta;
  if (!activeStudent) {
    cta = {
      label: 'ระบุตัวตนเพื่อเริ่ม',
      icon: Sparkles,
      tone: 'primary',
      onClick: onIdentify,
    };
  } else if (postTestPassed) {
    cta = {
      label: 'ดูใบประกาศ',
      icon: Award,
      tone: 'success',
      onClick: () => navigate('/certification'),
    };
  } else if (postTestUnlocked) {
    cta = {
      label: 'เริ่มทำ Post-test',
      icon: Award,
      tone: 'warning',
      onClick: () => navigate('/pre-course/post-test'),
    };
  } else if (nextLesson) {
    cta = {
      label: lessonsPassed === 0 ? 'เริ่มบทเรียนแรก' : `เรียนต่อ — ${nextLesson.shortTitle}`,
      icon: Play,
      tone: 'primary',
      onClick: () => navigate(`/pre-course/${nextLesson.id}`),
    };
  } else {
    cta = {
      label: 'เริ่มเรียน',
      icon: Play,
      tone: 'primary',
      onClick: () => navigate('/pre-course'),
    };
  }

  const CtaIcon = cta.icon;
  const ctaClass =
    cta.tone === 'success' ? 'bg-success'
    : cta.tone === 'warning' ? 'bg-warning'
    : 'bg-info';

  return (
    <div
      className="dash-card relative"
      style={{
        marginTop: -22,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <div className="flex items-center gap-4">
        <ProgressRing percent={percent} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            ความคืบหน้า
          </div>
          <div className="text-[20px] font-extrabold text-text-primary leading-tight tabular-nums">
            {lessonsPassed}<span className="text-text-muted text-[14px] font-bold">/{totalLessons}</span>
            <span className="text-text-secondary text-[13px] font-semibold ml-1.5">บทผ่าน</span>
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {postTestPassed ? (
              <span className="text-success font-bold">Post-test ผ่านแล้ว ✓</span>
            ) : postTestUnlocked ? (
              <span className="text-warning font-bold">Post-test พร้อมสอบ</span>
            ) : (
              <>เหลืออีก {totalLessons - lessonsPassed} บทก่อนปลดล็อก Post-test</>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={cta.onClick}
        className={`btn btn-lg btn-full mt-3 text-white ${ctaClass}`}
      >
        <CtaIcon size={18} strokeWidth={2.4} />
        {cta.label}
      </button>
    </div>
  );
}

function ProgressRing({ percent }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-bg-tertiary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#bls-ring-grad)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <defs>
          <linearGradient id="bls-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[14px] font-extrabold text-info tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
