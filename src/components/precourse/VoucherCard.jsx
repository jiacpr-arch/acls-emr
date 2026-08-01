import { Ticket, Check, X, MessageCircle } from 'lucide-react';
import { useVoucherStore } from '../../stores/voucherStore';
import { validateVoucher } from '../../config/vouchers';
import { jiacprCourse } from '../../data/jiacprCourse';
import { track } from '../../services/analytics';

// Entry point + status for the voucher feature. Shared by both the ACLS and
// BLS pre-course pages. Three states:
//   - no voucher            → a button that opens the VoucherModal
//   - voucher, LINE pending → a blocking full-screen gate: must add the LINE
//                              OA friend (or cancel the code) before anything
//                              unlocks — no plain dismiss, by design
//   - voucher, LINE done    → the green "unlocked" banner
export default function VoucherCard({ onOpen }) {
  const voucher = useVoucherStore((s) => s.voucher);
  const clearVoucher = useVoucherStore((s) => s.clearVoucher);
  const confirmLine = useVoucherStore((s) => s.confirmLine);
  const codeValid = !!(voucher && validateVoucher(voucher.code));
  const pending = codeValid && !voucher.lineConfirmed;
  const active = codeValid && !!voucher.lineConfirmed;

  if (pending) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
        <div className="w-full max-w-md bg-bg-secondary animate-slide-up p-5 space-y-4 text-center"
          style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
          <div className="w-14 h-14 mx-auto inline-flex items-center justify-center bg-success/15"
            style={{ borderRadius: 'var(--radius-full)' }}>
            <MessageCircle size={26} strokeWidth={2.4} style={{ color: '#06C755' }} />
          </div>
          <div>
            <div className="text-headline">เกือบเสร็จแล้ว — เพิ่มเพื่อน LINE ก่อน</div>
            <div className="text-caption text-text-muted mt-1">
              รหัส <span className="font-bold text-text-primary">{voucher.label || voucher.code}</span> จะปลดล็อก
              Pre-test / Post-test ทันทีที่เพิ่มเพื่อน LINE
            </div>
          </div>
          <a
            href={jiacprCourse.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              confirmLine();
              track('voucher_line_confirmed', { meta: ['Contact', 'Lead'], props: { code: voucher.code, value: 2500, currency: 'THB' } });
            }}
            className="btn btn-lg btn-block no-underline"
            style={{ background: '#06C755', color: '#fff', textDecoration: 'none' }}
          >
            <MessageCircle size={18} strokeWidth={2.4} /> เพิ่มเพื่อน LINE เพื่อปลดล็อก
          </a>
          <button onClick={clearVoucher} className="block w-full text-center text-caption text-text-muted underline bg-transparent">
            ยกเลิกรหัสนี้
          </button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="dash-card flex items-center gap-3 border border-success/30 !bg-success/8">
        <div className="w-10 h-10 inline-flex items-center justify-center bg-success/15 text-success shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Check size={18} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">ปลดล็อกด้วย voucher แล้ว</div>
          <div className="text-2xs text-text-muted truncate">
            {voucher.label || voucher.code} · เข้าทำ Post-test ได้เลย
          </div>
        </div>
        <button onClick={clearVoucher} className="btn btn-ghost btn-sm">
          <X size={13} strokeWidth={2.4} /> นำออก
        </button>
      </div>
    );
  }

  return (
    <button onClick={onOpen}
      className="dash-card w-full flex items-center gap-3 hover:bg-bg-tertiary/50 transition-colors"
      style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
      <div className="w-10 h-10 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Ticket size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-strong text-text-primary">มีรหัส voucher?</div>
        <div className="text-2xs text-text-muted">กรอกรหัสเพื่อปลดล็อก Pre-test / Post-test</div>
      </div>
    </button>
  );
}
