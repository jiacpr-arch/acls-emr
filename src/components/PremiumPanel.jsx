import { useState } from 'react';
import { Sparkles, Check, LogIn, AlertCircle, GraduationCap } from 'lucide-react';
import { PREMIUM_PLANS } from '../config/premiumPlans';
import { usePremium } from '../hooks/usePremium';
import { usePassport } from '../hooks/usePassport';
import { startPassportLogin } from '../services/passport';
import { startPremiumCheckout } from '../services/premium';
import { track } from '../services/analytics';

const PERKS = [
  'ปลดล็อกเคสระดับปานกลางและ Megacode ทุกเคสใน Code Blue Sim',
  'เคสใหม่ที่เพิ่มเข้ามาระหว่างที่ Pass ยังไม่หมดอายุ',
  'ใช้ได้ทุกเครื่องที่เข้าสู่ระบบบัญชี JIA เดียวกัน',
];

const ERRORS = {
  network: 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง',
  unavailable: 'ระบบชำระเงินยังไม่เปิดบนเว็บนี้',
  stripe: 'เปิดหน้าชำระเงินไม่สำเร็จ ลองใหม่อีกครั้ง',
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// เนื้อหาหน้าขาย Prep Pass — ใช้ทั้งใน PremiumModal (/sim) และหน้า /premium
// returnTo = หน้าที่จะกลับมาหลังจ่ายเงิน/login
export default function PremiumPanel({ returnTo }) {
  const premium = usePremium();
  const passport = usePassport();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const back = returnTo || (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/');

  const buy = async (planId) => {
    setError('');
    setBusy(planId);
    track('premium_checkout_start', { props: { plan: planId } });
    const out = await startPremiumCheckout(planId, back);
    if (out.ok) return; // กำลังไปหน้า Stripe
    setBusy(null);
    if (out.reason === 'not_logged_in') startPassportLogin(back);
    else setError(ERRORS[out.reason] || ERRORS.stripe);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-warning/15 text-warning"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Sparkles size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="text-headline text-text-primary">Prep Pass</div>
          <div className="text-2xs text-text-muted">ฝึกเคสยากให้ครบก่อนสอบจริง</div>
        </div>
      </div>

      {premium.hasPass && (
        <div className="bg-success/10 border border-success/30 p-3 text-caption text-success inline-flex items-center gap-2 w-full"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Check size={16} strokeWidth={2.4} />
          Prep Pass ใช้งานได้ถึง {fmtDate(premium.pass.expiresAt)} — ซื้อเพิ่มจะต่ออายุต่อจากวันนี้
        </div>
      )}

      {premium.returnFlag === 'success' && !premium.hasPass && (
        <div className="bg-info/10 border border-info/30 p-3 text-caption text-info w-full"
          style={{ borderRadius: 'var(--radius-md)' }}>
          ได้รับการชำระเงินแล้ว กำลังเปิดสิทธิ์… (ถ้าเกิน 1 นาที ลองรีเฟรชหน้านี้)
        </div>
      )}

      <ul className="space-y-1.5">
        {PERKS.map((p) => (
          <li key={p} className="flex gap-2 text-body text-text-secondary">
            <Check size={16} strokeWidth={2.4} className="text-success shrink-0 mt-0.5" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-2">
        {PREMIUM_PLANS.map((plan) => (
          <div key={plan.id}
            className={`p-3 border flex items-center gap-3 ${plan.best ? 'border-warning bg-warning/5' : 'border-border'}`}
            style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary">
                {plan.label}
                {plan.best && <span className="ml-2 text-2xs font-bold text-warning">แนะนำ</span>}
              </div>
              <div className="text-2xs text-text-muted">{plan.note}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-text-primary">{plan.amountThb.toLocaleString('th-TH')} ฿</div>
            </div>
            {passport.loggedIn && premium.configured && (
              <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => buy(plan.id)}>
                {busy === plan.id ? 'กำลังเปิด…' : 'ซื้อ'}
              </button>
            )}
          </div>
        ))}
      </div>

      {!premium.configured && premium.loaded && (
        <div className="text-caption text-text-muted">ตอนนี้เนื้อหาทั้งหมดบนเว็บนี้ยังเปิดให้ใช้ฟรี</div>
      )}

      {premium.configured && !passport.loggedIn && (
        <button type="button" className="btn btn-primary btn-block inline-flex items-center justify-center gap-2"
          onClick={() => startPassportLogin(back)}>
          <LogIn size={16} strokeWidth={2.4} /> เข้าสู่ระบบบัญชี JIA เพื่อซื้อ
        </button>
      )}

      {error && (
        <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={14} strokeWidth={2.2} /> {error}
        </div>
      )}

      <div className="bg-bg-tertiary/60 p-3 text-caption text-text-secondary flex gap-2"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <GraduationCap size={16} strokeWidth={2.2} className="shrink-0 mt-0.5" />
        <span>นักเรียนที่ลงคอร์สกับ JIA ใช้ได้ฟรีทุกเคส — เข้าคลาสด้วยรหัสจากอาจารย์ในหน้าเตรียมตัวก่อนเรียน</span>
      </div>

      <div className="text-2xs text-text-muted">
        ชำระผ่าน Stripe ด้วย PromptPay หรือบัตร · จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ ·
        Prep Pass เป็นสื่อฝึกซ้อม ไม่ใช่บัตรรับรองหลักสูตร ACLS/BLS
      </div>
    </div>
  );
}
