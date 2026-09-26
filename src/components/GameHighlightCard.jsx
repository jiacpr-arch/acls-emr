import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// การ์ดไฮไลต์เกม — ดีไซน์ "Monitor": พื้นจอมอนิเตอร์เข้ม + เส้น trace สีเขียว
// ให้ทางเข้าเกมโดดออกจากการ์ดขาวทั้งหน้าแบบตั้งใจ (เข้มเหมือนกันทั้งสองธีม)
// (prop `Icon` ของ call site เดิมไม่ได้ใช้แล้ว — เส้น trace ทำหน้าที่แทนไอคอน)
export default function GameHighlightCard({ to, onClick, title, desc, eyebrow = 'Code Blue Sim', style }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };
  return (
    <button onClick={handleClick} className="monitor-card" style={style}>
      <span className="font-mono text-2xs font-semibold uppercase" style={{ letterSpacing: '0.08em', color: 'var(--color-trace)' }}>
        ● {eyebrow}
      </span>
      <svg className="monitor-trace" viewBox="0 0 356 34" preserveAspectRatio="none" width="100%" height="34" fill="none" aria-hidden="true">
        <path d="M0 18 h30 l4 -8 l4 14 l5 -18 l4 22 l5 -12 l6 6 l5 -6 l4 10 l5 -14 l4 12 l6 -4 h20 l4 -9 l4 15 l5 -20 l4 22 l5 -10 l6 4 l5 -8 l4 10 l5 -12 l4 10 l6 -4 h22 l4 -8 l4 14 l5 -18 l4 22 l5 -12 l6 6 l5 -6 l4 10 l5 -14 l4 12 l6 -4 H356"
          strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="flex items-center gap-3">
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-headline" style={{ fontSize: 17, color: '#E9EFEC' }}>{title}</span>
          {desc && <span className="text-caption" style={{ color: '#9FB0A9' }}>{desc}</span>}
        </span>
        <ArrowRight size={20} strokeWidth={2.2} className="shrink-0" style={{ color: 'var(--color-trace)' }} />
      </span>
    </button>
  );
}
