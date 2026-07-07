import { useState } from 'react';
import { Ticket, AlertCircle } from 'lucide-react';
import { validateVoucher } from '../../config/vouchers';
import { useVoucherStore } from '../../stores/voucherStore';
import { track } from '../../services/analytics';

// Modal for entering a voucher code that unlocks the Pre-test / Post-test.
// initialCode prefills the input — used when a /pre-course?voucher=CODE link
// carried an invalid code and we want to show the user what they typed.
export default function VoucherModal({ open, onClose, initialCode = '' }) {
  const redeemVoucher = useVoucherStore((s) => s.redeemVoucher);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');

  // Re-sync the input to initialCode each time the modal (re)opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setCode(initialCode); setError(''); }
  }

  if (!open) return null;

  const submit = (e) => {
    e?.preventDefault();
    const v = validateVoucher(code);
    if (!v) {
      setError('รหัสไม่ถูกต้องหรือหมดอายุ');
      return;
    }
    redeemVoucher(v);
    track('voucher_redeemed', { props: { code: v.code, via: 'manual' } });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md bg-bg-secondary animate-slide-up p-5 space-y-4"
        style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Ticket size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-headline">ใช้รหัส voucher</div>
            <div className="text-2xs text-text-muted">ปลดล็อกให้เข้าทำ Pre-test / Post-test ได้เลย</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-caption font-semibold text-text-secondary">รหัส voucher</span>
            <input
              type="text" autoFocus value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="เช่น ACLS2025"
              className="w-full text-xl font-mono tracking-[0.2em] text-center mt-1" />
          </label>
          {error && (
            <div className="bg-danger/8 border border-danger/30 p-2 text-caption text-danger inline-flex items-center gap-2 w-full"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={14} strokeWidth={2.2} /> {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            ใช้รหัส
          </button>
          <button type="button" onClick={onClose}
            className="block w-full text-center text-caption text-text-muted underline bg-transparent">
            ปิด
          </button>
        </form>
      </div>
    </div>
  );
}
