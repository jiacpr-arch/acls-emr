import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateVoucher } from '../config/vouchers';

// Holds the redeemed voucher (if any). A valid voucher unlocks the Post-test
// without requiring every pre-course lesson to be passed. Persisted locally so
// it survives refreshes — mirrors the classStore pattern.
export const useVoucherStore = create(
  persist(
    (set) => ({
      voucher: null, // { code, label, redeemedAt } | null

      redeemVoucher: (v) => set({
        voucher: { code: v.code, label: v.label, redeemedAt: new Date().toISOString() },
      }),
      clearVoucher: () => set({ voucher: null }),
    }),
    { name: 'acls-voucher' }
  )
);

// Re-validate the stored code against the current config every time — a code
// that was removed or has since expired stops working even if it is still
// sitting in localStorage.
export const hasActiveVoucher = () => {
  const v = useVoucherStore.getState().voucher;
  return !!(v && validateVoucher(v.code));
};
