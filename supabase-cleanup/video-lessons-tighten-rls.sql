-- ============================================================================
-- video_lessons: tighten the write policy.
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-03 as
-- migration `video_lessons_tighten_rls`. Kept here as documentation.
--
-- Problem: the original policy from video-lessons.sql was
--
--   create policy video_lessons_admin_write
--     on public.video_lessons for all
--     to authenticated
--     using (true) with check (true);
--
-- "authenticated" is NOT the same as "admin" — any Supabase user of this
-- project could insert/update/delete video lessons.
--
-- Fix: bind the write policy to the admin allowlist. Keep public read as-is.
-- The email list must stay in sync with DEFAULT_ADMIN_EMAILS /
-- the ADMIN_EMAILS env var used by api/_lib/requireAdmin.js.
-- ============================================================================

drop policy if exists video_lessons_admin_write on public.video_lessons;
create policy video_lessons_admin_write
  on public.video_lessons for all
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@acls-emr.local', 'jiacpr@gmail.com')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('admin@acls-emr.local', 'jiacpr@gmail.com')
  );

-- Verify: as the admin session, insert/update should still work from the
-- admin UI (/admin/video-lessons). As any other authenticated user, writes
-- should now fail with a row-level security violation.
