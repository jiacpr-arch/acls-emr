import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateVoucher } from '../config/vouchers';

// Holds the redeemed voucher (if any). A valid voucher unlocks the Post-test
// without requiring every pre-course lesson to be passed — but only once the
// student has added the LINE OA friend (lineConfirmed). Persisted locally so
// it survives refreshes — mirrors the classStore pattern.
export const useVoucherStore = create(
  persist(
    (set) => ({
      voucher: null, // { code, label, redeemedAt, lineConfirmed } | null

      redeemVoucher: (v) => set({
        voucher: {
          code: v.code, label: v.label, redeemedAt: new Date().toISOString(),
          lineConfirmed: false,
        },
      }),
      // Honor-system — the web app can't verify a real LINE friend add, same
      // as the certificate page's LINE gate. Called when the student taps
      // "เพิ่มเพื่อน LINE" on the pending-confirmation card.
      confirmLine: () => set((s) => ({
        voucher: s.voucher ? { ...s.voucher, lineConfirmed: true } : null,
      })),
      clearVoucher: () => set({ voucher: null }),
    }),
    { name: 'acls-voucher' }
  )
);

// Re-validate the stored code against the current config every time — a code
// that was removed or has since expired stops working even if it is still
// sitting in localStorage. Also requires lineConfirmed: redeeming a voucher
// alone does not unlock anything until the LINE step is done.
export const hasActiveVoucher = () => {
  const v = useVoucherStore.getState().voucher;
  return !!(v?.lineConfirmed && validateVoucher(v.code));
};
