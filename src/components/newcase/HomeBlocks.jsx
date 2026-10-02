import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

// ชิ้นส่วนหน้าแรกชุด "Monitor" — ใช้ร่วมกันทั้ง ACLS และ BLS
// หลักการ: สีแดงทึบมีจุดเดียว (ปุ่มฉุกเฉิน) ที่เหลือเป็นการ์ดขาวเส้นขอบบาง
// สีความหมายอยู่ที่ไอคอน/ป้ายเท่านั้น ไม่ย้อมทั้งใบ

// ปุ่มฉุกเฉิน — แดงทึบเต็มความกว้าง แตะแล้วเริ่มบันทึกทันที
export function EmergencyCTA({ Icon, title, desc, hint, onClick, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-3.5 text-white disabled:opacity-50 home-emergency"
        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
      >
        <span className="home-emergency-icon">
          <Icon size={26} strokeWidth={2} />
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-title" style={{ fontSize: 20, lineHeight: 1.2, letterSpacing: '0.01em' }}>{title}</span>
          <span className="text-caption" style={{ opacity: 0.9 }}>{desc}</span>
        </span>
        <ArrowRight size={22} strokeWidth={2.2} className="shrink-0" />
      </button>
      {hint && <div className="text-2xs text-text-muted font-mono pl-1">{hint}</div>}
    </div>
  );
}

// การ์ดเส้นทางเรียน — แถบ segment ตามจำนวนขั้น + ปุ่มขั้นถัดไปสีเข้ม
export function LearnPathCard({ eyebrow = 'เส้นทางใบประกาศ', done, total, title, desc, cta, onClick }) {
  const segments = Array.from({ length: total || 0 }, (_, i) => i < done);
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-overline">{eyebrow}</span>
        {total > 0 && (
          <span className="font-mono text-caption text-text-secondary tabular">{done} / {total}</span>
        )}
      </div>
      {total > 0 && (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          {segments.map((on, i) => (
            <div key={i} style={{ height: 6, borderRadius: 3, background: on ? 'var(--color-accent)' : 'var(--color-bg-tertiary)' }} />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="text-headline" style={{ fontSize: 17 }}>{title}</div>
        {desc && <div className="text-caption text-text-muted">{desc}</div>}
      </div>
      <button onClick={onClick} className="btn btn-ink self-start">
        {cta} <ArrowRight size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
}

// รายการเมนูแบบกลุ่ม — การ์ดใบเดียว แถวคั่นด้วยเส้นบาง ไอคอนสีหมึกบนพื้นเทา
export function MenuList({ title, items }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2">
      {title && <span className="text-overline px-1">{title}</span>}
      <div className="card home-menu" style={{ padding: 0, overflow: 'hidden' }}>
        {items.map(({ Icon, to, label, desc }) => (
          <button key={to} onClick={() => navigate(to)} className="home-menu-row">
            <span className="home-menu-tile"><Icon size={18} strokeWidth={2} /></span>
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="text-body-strong text-text-primary">{label}</span>
              {desc && <span className="text-caption text-text-muted">{desc}</span>}
            </span>
            <ChevronRight size={18} className="shrink-0" style={{ color: 'var(--color-border-strong)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
