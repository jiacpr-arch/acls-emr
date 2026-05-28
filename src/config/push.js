// Public VAPID key for Web Push subscription.
// Safe to commit — it's the public half of the signing pair.
// Can be overridden via VITE_VAPID_PUBLIC_KEY env var.

const DEFAULT_PUBLIC_KEY = 'BH5zjcz8nBNK5ZdfLw4m3-0wTsRLS4I2tjTz-X1waylgkqW5h1iMpkd5wZbaoF6hdR0CWF2WLniS7zwFQA5lWVU';

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
