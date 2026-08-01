import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowRight } from 'lucide-react';

// การ์ดไฮไลต์เกม — idiom เดียวกับ GamePromoCard ของ firstaid: พื้นเข้ม navy
// + ตัวหนังสือทอง ให้ทางเข้าเกมโดดออกจากการ์ดขาวทั้งหน้าแบบตั้งใจ
// (นี่คือ gradient เดียวที่อนุญาตในภาษาดีไซน์ชุดนี้)
export default function GameHighlightCard({ to, onClick, title, desc, Icon = Gamepad2, style }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };
  return (
    <button
      onClick={handleClick}
      className="card card-hover w-full flex items-center gap-3.5"
      style={{
        background: 'linear-gradient(135deg, #1B2340, #2A1B40)',
        border: '1.5px solid #4A3D7A',
        textAlign: 'left',
        justifyContent: 'flex-start',
        ...style,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, borderRadius: 12, background: '#DB277725', color: '#F2C14E' }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-headline" style={{ color: '#F2C14E' }}>{title}</div>
        {desc && <div className="text-caption" style={{ color: '#B8C2E0' }}>{desc}</div>}
      </div>
      <ArrowRight size={18} color="#F2C14E" className="shrink-0" />
    </button>
  );
}
