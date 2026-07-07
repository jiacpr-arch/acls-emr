import { Ticket, Check, X } from 'lucide-react';
import { useVoucherStore } from '../../stores/voucherStore';
import { validateVoucher } from '../../config/vouchers';

// Entry point + status banner for the voucher feature. Shared by both the ACLS
// and BLS pre-course pages.
//   - no active voucher → a button that opens the VoucherModal
//   - active voucher     → a green banner with a "remove" action
export default function VoucherCard({ onOpen }) {
  const voucher = useVoucherStore((s) => s.voucher);
  const clearVoucher = useVoucherStore((s) => s.clearVoucher);
  const active = !!(voucher && validateVoucher(voucher.code));

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
      className="dash-card w-full flex items-center gap-3 text-left hover:bg-bg-tertiary/50 transition-colors">
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
