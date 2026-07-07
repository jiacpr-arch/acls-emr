// Client-side voucher codes. A valid voucher unlocks the Pre-test / Post-test
// directly — the student can take the Post-test without first passing every
// pre-course lesson. Validation is client-only (the list ships in the bundle),
// so treat these as low-friction access codes, not a real paywall.
//
// To add / retire a code: edit this list. expiresAt = null means it never
// expires; otherwise set an ISO date string (compared lexicographically, which
// works for ISO-8601).
export const VOUCHERS = [
  { code: 'ACLS2025', label: 'ปลดล็อก Pre/Post-test', expiresAt: null },
  // เพิ่มโค้ดอื่นได้ที่นี่ เช่น:
  // { code: 'VIP2026', label: 'สิทธิ์พิเศษ VIP', expiresAt: '2026-12-31T23:59:59.999Z' },
];

// Return the voucher object when the code is valid and not expired, else null.
// nowIso is injectable so this stays easy to unit-test.
export function validateVoucher(code, nowIso = new Date().toISOString()) {
  const norm = String(code || '').trim().toUpperCase();
  if (!norm) return null;
  const v = VOUCHERS.find((x) => x.code.toUpperCase() === norm);
  if (!v) return null;
  if (v.expiresAt && v.expiresAt < nowIso) return null;
  return v;
}
