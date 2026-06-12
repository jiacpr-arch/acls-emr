import { MessageCircle } from 'lucide-react';
import { jiacprCourse } from '../data/jiacprCourse';
import { track } from '../services/analytics';

// ปุ่ม LINE ลอยมุมขวาล่าง — CTA หลักของการขายคอร์ส มองเห็นทุกหน้า
// วางเหนือ bottom-pill-bar (สูง 52px + เว้นขอบ 10px)
export default function LineFloatButton() {
  return (
    <a
      href={jiacprCourse.lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="สอบถามคอร์สทาง LINE"
      onClick={() => track('contact_click', {
        meta: 'Contact',
        props: { channel: 'line', source: 'float_button', value: 2500, currency: 'THB' },
      })}
      className="fixed z-40 inline-flex items-center gap-1.5 px-3.5 py-2.5 text-white font-extrabold text-[13px] no-underline"
      style={{
        right: 'calc(env(safe-area-inset-right, 0px) + 14px)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
        background: '#06C755',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 4px 14px rgba(6, 199, 85, 0.45), 0 2px 4px rgba(15, 26, 46, 0.15)',
        textDecoration: 'none',
      }}
    >
      <MessageCircle size={17} strokeWidth={2.6} />
      สอบถามคอร์ส
    </a>
  );
}
