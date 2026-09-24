-- =====================================================
-- Migration: assessment_attempts_lock_read
-- Target project: elyyijlcjfvhxbpzscnv (emr-ai-clinic) — shared by acls-emr and bls-hcp-app
--
-- Problem (found 24 ก.ย. 2569 while planning server-side grading): policy "anon read attempts"
-- was `for select to anon, authenticated using (true)` — anyone holding the public anon key
-- (it ships in every app bundle) could read EVERY row of acls_assessment_attempts over the
-- REST API, including student_name / student_phone / student_email. get_student_roster() and
-- get_admin_stats() are SECURITY INVOKER yet anon could EXECUTE them, so the roster RPC leaked
-- the same contact data through a second door.
--
-- Nothing legitimate reads this table as anon: the only client read helper
-- (assessmentService.fetchAttemptsByStudent) has no callers, and every other reader is either
-- SECURITY DEFINER (get_cohort_summary) or called with the service role (api/admin/*).
--
-- Why not just drop the SELECT policy: the client writes attempts with
-- `.insert(row).select('id').single()` — INSERT ... RETURNING, which Postgres only allows when
-- the new row also passes a SELECT policy. PWA installs keep running cached bundles for a long
-- time, so the replacement policy lets a request read back ONLY the row its own statement just
-- inserted: created_at defaults to now() (the transaction timestamp), so `created_at = now()` is
-- true inside that one INSERT's transaction and false for every existing row in any later
-- request. Writes keep working unchanged; history becomes unreadable to anon.
-- =====================================================

drop policy if exists "anon read attempts" on public.acls_assessment_attempts;
drop policy if exists "anon read own insert" on public.acls_assessment_attempts;
create policy "anon read own insert" on public.acls_assessment_attempts
  for select to anon, authenticated
  using (created_at = now());

-- Admin-only aggregates: callers are api/admin/* (acls-emr) and src/app/api/admin/* (bls-hcp-app),
-- both with the service role.
revoke execute on function public.get_student_roster() from public, anon, authenticated;
revoke execute on function public.get_admin_stats() from public, anon, authenticated;
grant execute on function public.get_student_roster() to service_role;
grant execute on function public.get_admin_stats() to service_role;
