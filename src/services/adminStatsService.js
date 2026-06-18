import { authedGet } from './adminApi';

// Aggregate dashboard numbers (admin-only).
export function fetchAdminStats() {
  return authedGet('/api/admin/stats');
}
