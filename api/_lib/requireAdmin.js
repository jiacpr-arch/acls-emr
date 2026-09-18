import { getSupabaseAdmin } from './supabaseAdmin.js';

// A valid JWT alone is not enough: any Supabase user of the project would pass
// auth.getUser(), so the admin identity must also be on this allowlist.
// Override via ADMIN_EMAILS (comma-separated, case-insensitive).
// Must stay in sync with the video_lessons RLS policy in Supabase
// (supabase-cleanup/video-lessons-tighten-rls.sql).
// admin@acls-emr.local is the shared admin login account (src/services/auth.js)
// — it is only safe on this list while that account exists in Supabase Auth,
// which blocks anyone else from registering the same address. If that account
// is ever deleted, remove it here too (or set ADMIN_EMAILS) in the same change.
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
  const resolveUser = getUser || defaultResolveUser();
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

// A deployment missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is a config
// problem, not a rejected login. getSupabaseAdmin throws a plain Error (no
// `.status`), so handlers doing `res.status(err.status || 401)` would report a
// misconfigured deploy as 401 and echo the raw internal message to the browser
// — which reads as "your session is bad" and sends the admin chasing the wrong
// thing. Tag it 503 with an actionable message instead; the detail stays in the
// server log.
function defaultResolveUser() {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    console.error('requireAdmin:', err.message);
    const e = new Error(
      'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase service role key — ผู้ดูแลระบบต้องเพิ่ม env var ให้ deployment นี้'
    );
    e.status = 503;
    throw e;
  }
  return (t) => admin.auth.getUser(t);
}
