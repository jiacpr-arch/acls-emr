-- =====================================================
-- Admin stats + certificate log
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
-- Migration: admin_stats_and_certificates
--
-- Backs the admin "สถิติผู้เรียน" page (/admin/stats) and the
-- /api/admin/stats endpoint. Also adds a certificate issuance log so cert
-- counts are real (populated best-effort by /api/cert/notify).
-- =====================================================

-- Certificate issuance log. Not tied to a class — captures every issuance
-- regardless of cohort enrollment. RLS on with no policies → service-role only.
create table if not exists public.certificates (
  id              uuid primary key default gen_random_uuid(),
  cert_id         text unique not null,
  student_name    text,
  course_mode     text,
  pre_test_score  numeric,
  post_test_score numeric,
  ekg_passed      boolean,
  issued_at       timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- Aggregate dashboard numbers. SECURITY INVOKER (default) so it respects RLS
-- for any direct anon/auth caller (blocked by the cohort tables' RLS); the
-- /api/admin/stats endpoint calls it with the service-role key, which bypasses
-- RLS and sees full counts.
create or replace function public.get_admin_stats()
returns json
language sql
stable
as $$
  select json_build_object(
    'students_total', (select count(*) from public.cohort_students),
    'classes_total',  (select count(*) from public.cohort_classes),
    'classes_active', (select count(*) from public.cohort_classes where archived_at is null),
    'students_by_mode', (
      select coalesce(json_agg(t order by t.course_mode), '[]'::json) from (
        select c.course_mode, count(s.id)::int as students
        from public.cohort_students s
        join public.cohort_classes c on c.id = s.class_id
        group by c.course_mode
      ) t
    ),
    'classes_by_mode', (
      select coalesce(json_agg(t order by t.course_mode), '[]'::json) from (
        select course_mode, count(*)::int as classes
        from public.cohort_classes group by course_mode
      ) t
    ),
    'pre_test_passed', (
      select count(distinct student_pk)::int from public.cohort_quiz_attempts
      where lesson_id = 'pre-test' and passed
    ),
    'post_test_passed', (
      select count(distinct student_pk)::int from public.cohort_quiz_attempts
      where lesson_id in ('post-test', 'bls-post-test') and passed
    ),
    'certs_total', (select count(*)::int from public.certificates),
    'certs_by_mode', (
      select coalesce(json_agg(t order by t.course_mode), '[]'::json) from (
        select course_mode, count(*)::int as certs
        from public.certificates group by course_mode
      ) t
    )
  );
$$;
