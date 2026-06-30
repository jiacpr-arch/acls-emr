import { HeartPulse, Activity, Award, ChevronRight } from 'lucide-react';
import { track } from '../../services/analytics';

const ACLS_URL = 'https://acls.morroo.com';

// Cross-promo for the sibling ACLS course (acls.morroo.com). Shown to BLS
// students who have shown completion intent and may want to advance to ACLS.
export default function ACLSCourseUpsellCard() {
  return (
    <div className="space-y-2">
      <div className="text-overline text-text-muted px-1">เรียนต่อขั้นสูง</div>

      <a
        href={ACLS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('acls_course_click', {
          meta: 'Lead',
          props: { source: 'acls_upsell_card', content_name: 'acls_online_course', value: 9900, currency: 'THB' },
        })}
        className="relative overflow-hidden text-white block no-underline group"
        style={{
          textDecoration: 'none',
          borderRadius: 'var(--radius-2xl)',
          background:
            'linear-gradient(135deg, #EF4444 0%, #DC2626 55%, #B91C1C 100%)',
          boxShadow:
            '0 10px 30px rgba(220, 38, 38, 0.28), 0 2px 6px rgba(15, 26, 46, 0.12)',
        }}
      >
        <div
          aria-hidden
          className="absolute -top-16 -right-12 w-48 h-48 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />

        <div className="relative px-5 py-5">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 inline-flex items-center justify-center shrink-0"
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <HeartPulse size={22} strokeWidth={2.4} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-full">
                คอร์สต่อยอด · ฟรี
              </div>
              <h2 className="text-[18px] font-extrabold leading-tight tracking-tight mt-1.5">
                เรียนต่อ ACLS ออนไลน์
              </h2>
              <div className="text-[12px] text-white/85 mt-0.5">
                ต่อยอดจาก BLS สู่การช่วยชีวิตขั้นสูง
              </div>
            </div>
          </div>

          {/* Value bullets */}
          <ul className="mt-4 grid grid-cols-1 gap-1.5">
            <li className="flex items-center gap-2 text-[12px] text-white/90">
              <Activity size={13} strokeWidth={2.4} className="shrink-0" />
              ฝึกอ่าน EKG · อัลกอริทึม ACLS · ยาฉุกเฉิน
            </li>
            <li className="flex items-center gap-2 text-[12px] text-white/90">
              <Award size={13} strokeWidth={2.4} className="shrink-0" />
              สอบรับใบประกาศนียบัตร ILCOR 2025 ใช้ได้ 24 เดือน
            </li>
          </ul>

          {/* CTA */}
          <div
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-red-700 font-extrabold text-[13px] group-hover:bg-white/95 transition-colors"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            เปิด acls.morroo.com
            <ChevronRight size={15} strokeWidth={2.6} />
          </div>
        </div>
      </a>
    </div>
  );
}
