import { useNavigate } from 'react-router-dom';
import { Play, Award, Sparkles, User, UserCheck, RefreshCw } from 'lucide-react';

// At-a-glance progress + next-step CTA. Decides what the student should do
// next: identify → first lesson → continue → post-test → see certificate.
// Also surfaces the active-student status at the top so they always know
// whose progress is being tracked.
export default function BLSProgressCard({
  activeStudent,
  lessonsPassed,
  totalLessons,
  nextLesson,
  postTestPassed,
  postTestUnlocked,
  onIdentify,
  onChangeStudent,
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
      label: 'ดูใบประกาศนียบัตร',
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
    cta.tone === 'success' ? 'btn-success'
    : cta.tone === 'warning' ? 'btn-warning'
    : 'btn-primary';

  return (
    <>
      {/* Active-student status — its own card so identity reads as a
          separate concern from progress */}
      <div className="dash-card flex items-center gap-3">
        {activeStudent ? (
          <>
            <div
              className="w-8 h-8 inline-flex items-center justify-center shrink-0 bg-info/12 text-info"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <UserCheck size={15} strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-text-primary truncate">
                {activeStudent.name}
              </div>
              <div className="text-2xs text-text-muted font-mono">
                {activeStudent.studentId ? `รหัส ${activeStudent.studentId}` : activeStudent.phone}
              </div>
            </div>
            <button
              onClick={onChangeStudent}
              className="text-2xs font-bold inline-flex items-center gap-1 px-2.5 py-1.5 text-text-secondary"
              style={{ borderRadius: 99, background: 'var(--color-bg-tertiary)' }}
            >
              <RefreshCw size={11} strokeWidth={2.4} /> เปลี่ยน
            </button>
          </>
        ) : (
          <>
            <div
              className="w-8 h-8 inline-flex items-center justify-center shrink-0 bg-bg-tertiary text-text-muted"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <User size={15} strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-text-primary">
                ยังไม่ได้ระบุตัวผู้เรียน
              </div>
              <div className="text-2xs text-text-muted">
                ใส่ชื่อก่อนเริ่ม เพื่อบันทึกผล
              </div>
            </div>
            <button
              onClick={onIdentify}
              className="text-2xs font-bold px-3 py-1.5 text-white"
              style={{ borderRadius: 99, background: 'var(--color-info)' }}
            >
              ระบุตัวตน
            </button>
          </>
        )}
      </div>

      {/* Progress + primary CTA */}
      <div className="dash-card">
        <div className="flex items-center gap-4">
          <ProgressRing percent={percent} />
          <div className="flex-1 min-w-0">
            <div className="text-2xs font-bold uppercase tracking-wider text-text-muted">
              ความคืบหน้า
            </div>
            <div className="text-xl font-extrabold text-text-primary leading-tight tabular-nums">
              {lessonsPassed}<span className="text-text-muted text-sm font-bold">/{totalLessons}</span>
              <span className="text-text-secondary text-[13px] font-semibold ml-1.5">บทผ่าน</span>
            </div>
            <div className="text-2xs text-text-muted mt-0.5">
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
          className={`btn btn-xl btn-full mt-5 ${ctaClass}`}
        >
          <CtaIcon size={20} strokeWidth={2.4} />
          {cta.label}
        </button>
      </div>
    </>
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
          stroke="var(--color-info)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-info tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
