import { Phone, MessageCircle, Sparkles, Users, Award } from 'lucide-react';
import { jiacprCourse } from '../../data/jiacprCourse';
import { track } from '../../services/analytics';

const PHONE_NUMBER = '0909791212';
const PHONE_DISPLAY = '090-979-1212';
const LINE_URL = 'https://line.me/R/ti/p/@jiacpr';
const LINE_DISPLAY = '@jiacpr';

// Promo card for the in-person BLS course. Placed after the post-test card
// where students have shown completion intent and may want hands-on training.
// source: ระบุจุดที่การ์ดแสดง เพื่อแยกใน analytics ว่า CTA จุดไหนทำยอด
export default function BLSCourseUpsellCard({ source = 'bls_upsell_card' }) {
  return (
    <div className="space-y-2">
      <div className="text-overline text-text-muted px-1">คอร์สสอนจริง (Hands-on)</div>

      <div
        className="relative overflow-hidden text-white"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background:
            'linear-gradient(135deg, #10B981 0%, #059669 55%, #047857 100%)',
          boxShadow:
            '0 10px 30px rgba(5, 150, 105, 0.28), 0 2px 6px rgba(15, 26, 46, 0.12)',
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
              <Sparkles size={22} strokeWidth={2.4} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-full">
                โปรโมชั่นพิเศษ · ลดสูงสุด 50%
              </div>
              <h2 className="text-[18px] font-extrabold leading-tight tracking-tight mt-1.5">
                คอร์สอบรม BLS ภาคปฏิบัติ
              </h2>
              <div className="text-[12px] text-white/85 mt-0.5">
                ฝึกกับหุ่น CPR จริง · รับใบประกาศ ILCOR 2025
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] line-through text-white/60 font-semibold">
              5,000 บาท
            </span>
            <span className="text-[22px] font-extrabold leading-none">
              2,500 – 3,500
            </span>
            <span className="text-[12px] text-white/85 font-semibold">บาท / ท่าน</span>
          </div>
          <div className="text-[11px] text-white/75 mt-1">
            * ราคาขึ้นอยู่กับจำนวนผู้เรียนและสถานที่
          </div>

          {/* Value bullets */}
          <ul className="mt-3 grid grid-cols-1 gap-1.5">
            <li className="flex items-center gap-2 text-[12px] text-white/90">
              <Users size={13} strokeWidth={2.4} className="shrink-0" />
              สอนสด · กลุ่มเล็ก · ครูพี่เลี้ยงดูแลใกล้ชิด
            </li>
            <li className="flex items-center gap-2 text-[12px] text-white/90">
              <Award size={13} strokeWidth={2.4} className="shrink-0" />
              ใบประกาศจากสถาบันใช้ได้ 24 เดือน
            </li>
          </ul>

          {/* Contact buttons */}
          <div className="text-[11px] font-semibold text-white/85 mt-4">
            ติดต่อสอบถาม / จัดอบรมโดย {jiacprCourse.orgName}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={`tel:${PHONE_NUMBER}`}
              onClick={() => track('contact_click', {
                meta: ['Contact', 'Lead'],
                props: { channel: 'phone', source, content_name: 'bls_inperson_course', value: 2500, currency: 'THB' },
              })}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-emerald-700 font-extrabold text-[13px] hover:bg-white/95 transition-colors"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <Phone size={15} strokeWidth={2.6} />
              โทร {PHONE_DISPLAY}
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('contact_click', {
                meta: ['Contact', 'Lead'],
                props: { channel: 'line', source, content_name: 'bls_inperson_course', value: 2500, currency: 'THB' },
              })}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 font-extrabold text-[13px] text-white transition-colors"
              style={{
                borderRadius: 'var(--radius-md)',
                background: '#06C755',
                boxShadow: '0 2px 6px rgba(6, 199, 85, 0.35)',
              }}
            >
              <MessageCircle size={15} strokeWidth={2.6} />
              LINE {LINE_DISPLAY}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
