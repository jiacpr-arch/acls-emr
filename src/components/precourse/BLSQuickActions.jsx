import { useNavigate } from 'react-router-dom';
import { BookOpen, HeartPulse, Award, FileText } from 'lucide-react';

// 2x2 quick action grid for BLS landing. Blue-and-white tones with subtle
// gradient accents per tile so the page feels active rather than text-heavy.
export default function BLSQuickActions({
  lessonsPassed,
  totalLessons,
  postTestPassed,
  postTestUnlocked,
  onScrollToLessons,
}) {
  const navigate = useNavigate();

  const tiles = [
    {
      Icon: BookOpen,
      label: 'บทเรียน',
      sub: `${lessonsPassed}/${totalLessons} ผ่าน`,
      onClick: onScrollToLessons,
      iconBg: 'linear-gradient(135deg, #0EA5E9, #2563EB)',
    },
    {
      Icon: HeartPulse,
      label: 'ฝึก CPR',
      sub: 'Metronome 110/min',
      onClick: () => navigate('/skill-practice'),
      iconBg: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    },
    {
      Icon: FileText,
      label: 'Post-test',
      sub: postTestPassed
        ? 'ผ่านแล้ว'
        : postTestUnlocked
          ? 'พร้อมสอบ'
          : 'ยังไม่ปลดล็อก',
      onClick: () => postTestUnlocked && navigate('/pre-course/post-test'),
      iconBg: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
      disabled: !postTestUnlocked,
    },
    {
      Icon: Award,
      label: 'ใบประกาศ',
      sub: postTestPassed ? 'พร้อมดาวน์โหลด' : 'ผ่าน Post-test ก่อน',
      onClick: () => navigate('/certification'),
      iconBg: postTestPassed
        ? 'linear-gradient(135deg, #059669, #047857)'
        : 'linear-gradient(135deg, #93C5FD, #60A5FA)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((t) => {
        const Icon = t.Icon;
        return (
          <button
            key={t.label}
            onClick={t.onClick}
            disabled={t.disabled}
            className="dash-card text-left flex flex-col gap-4 !p-5 transition-transform active:scale-[0.97] disabled:opacity-55 disabled:cursor-not-allowed"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div
              className="w-12 h-12 inline-flex items-center justify-center text-white"
              style={{
                background: t.iconBg,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.22)',
              }}
            >
              <Icon size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-[17px] font-bold text-text-primary leading-tight">
                {t.label}
              </div>
              <div className="text-[11px] text-text-muted mt-1.5">{t.sub}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
