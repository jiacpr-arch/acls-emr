import { getSupabaseAdmin } from './supabaseAdmin.js';

/**
 * Verifies the request carries a valid Supabase JWT (admin session).
 * Returns the user on success; throws a 401-equivalent error on failure.
 *
 * Frontend should call with:
 *   Authorization: Bearer <session.access_token>
 */
export async function requireAdmin(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const token = auth.slice('Bearer '.length).trim();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const err = new Error('Invalid or expired session');
    err.status = 401;
    throw err;
  }
  return data.user;
}
