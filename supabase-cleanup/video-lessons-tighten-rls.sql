-- ============================================================================
-- video_lessons: tighten the write policy (review, then run in Supabase SQL
-- editor — same review-only convention as the rest of this folder).
--
-- Problem: the current policy from video-lessons.sql is
--
--   create policy video_lessons_admin_write
--     on public.video_lessons for all
--     to authenticated
--     using (true) with check (true);
--
-- "authenticated" is NOT the same as "admin" — any Supabase user of this
-- project (should sign-up ever be enabled, or another product share the
-- project) could insert/update/delete video lessons. The app only ever has
-- one legitimate writer: the admin account used by src/services/auth.js.
--
-- Fix: bind the write policy to the admin email(s). Keep public read as-is.
-- If you change the admin email (or add more), update the list below AND the
-- ADMIN_EMAILS env var on Vercel so the API allowlist stays in sync.
-- ============================================================================

drop policy if exists video_lessons_admin_write on public.video_lessons;
create policy video_lessons_admin_write
  on public.video_lessons for all
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@acls-emr.local')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@acls-emr.local')
  );

-- Verify: as the admin session, insert/update should still work from the
-- admin UI (/admin/video-lessons). As any other authenticated user, writes
-- should now fail with a row-level security violation.
