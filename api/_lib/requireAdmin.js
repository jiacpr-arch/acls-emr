import { getSupabaseAdmin } from './supabaseAdmin.js';

// A valid JWT alone is not enough: any Supabase user of the project would pass
// auth.getUser(), so the admin identity must also be on this allowlist.
// Override via ADMIN_EMAILS (comma-separated, case-insensitive).
// Must stay in sync with the video_lessons RLS policy in Supabase
// (supabase-cleanup/video-lessons-tighten-rls.sql).
const DEFAULT_ADMIN_EMAILS = 'admin@acls-emr.local,jiacpr@gmail.com';

export function getAdminEmails(env = process.env) {
  return (env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifies the request carries a valid Supabase JWT belonging to an
 * allowlisted admin. Returns the user on success; throws an error with
 * `status` 401 (bad/missing token) or 403 (valid user, not an admin).
 *
 * Frontend should call with:
 *   Authorization: Bearer <session.access_token>
 */
export async function requireAdmin(req, { getUser } = {}) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const token = auth.slice('Bearer '.length).trim();
  const resolveUser = getUser || ((t) => getSupabaseAdmin().auth.getUser(t));
  const { data, error } = await resolveUser(token);
  if (error || !data?.user) {
    const err = new Error('Invalid or expired session');
    err.status = 401;
    throw err;
  }
  const email = (data.user.email || '').toLowerCase();
  if (!email || !getAdminEmails().includes(email)) {
    const err = new Error('Not an admin account');
    err.status = 403;
    throw err;
  }
  return data.user;
}
