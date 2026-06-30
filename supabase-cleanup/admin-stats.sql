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

-- ---------------------------------------------------------------
-- Migration: add_student_contact_to_attempts_and_certs
-- Capture phone/email on every assessment attempt and certificate so admins can
-- follow up with students who registered standalone (no class code). The cert
-- log is populated best-effort by /api/cert/notify; attempts by submitAttempt().
-- ---------------------------------------------------------------
alter table public.acls_assessment_attempts
  add column if not exists student_phone text,
  add column if not exists student_email text;

alter table public.certificates
  add column if not exists student_phone text,
  add column if not exists student_email text;

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

-- ---------------------------------------------------------------
-- Migration: admin_student_roster
-- Full student roster for /admin/students (name + phone + email + class +
-- pass status). Unions two populations:
--   1. Class students   — cohort_students joined via a class code.
--   2. Standalone takers — students who did pre/post test without a class,
--      grouped by their local student id, keeping the latest non-null contact
--      info. Excludes anyone already counted as a class student.
-- ---------------------------------------------------------------
create or replace function public.get_student_roster()
returns json
language sql
stable
as $$
  with class_students as (
    select
      s.id::text                            as id,
      s.student_id                          as student_id,
      s.name                                as name,
      s.phone                               as phone,
      null::text                            as email,
      c.name                                as class_name,
      c.code                                as class_code,
      c.course_mode                         as course_mode,
      s.created_at                          as created_at,
      exists (
        select 1 from public.cohort_quiz_attempts q
        where q.student_pk = s.id and q.lesson_id = 'pre-test' and q.passed
      )                                     as pre_test_passed,
      exists (
        select 1 from public.cohort_quiz_attempts q
        where q.student_pk = s.id and q.lesson_id in ('post-test', 'bls-post-test') and q.passed
      )                                     as post_test_passed
    from public.cohort_students s
    join public.cohort_classes c on c.id = s.class_id
  ),
  attempt_students as (
    select
      a.student_local_id                                                                          as id,
      max(a.student_code)                                                                         as student_id,
      (array_agg(a.student_name  order by a.created_at desc))[1]                                  as name,
      (array_agg(a.student_phone order by a.created_at desc) filter (where a.student_phone is not null))[1] as phone,
      (array_agg(a.student_email order by a.created_at desc) filter (where a.student_email is not null))[1] as email,
      null::text                                                                                  as class_name,
      null::text                                                                                  as class_code,
      'acls'::text                                                                                as course_mode,
      min(a.created_at)                                                                           as created_at,
      bool_or(a.bank_id = 'pretest'  and a.passed)                                                as pre_test_passed,
      bool_or(a.bank_id = 'posttest' and a.passed)                                                as post_test_passed
    from public.acls_assessment_attempts a
    where a.student_local_id is not null
      and not exists (
        select 1 from public.cohort_students s where s.id::text = a.student_local_id
      )
    group by a.student_local_id
  )
  select coalesce(json_agg(t order by t.created_at desc), '[]'::json)
  from (
    select * from class_students
    union all
    select * from attempt_students
  ) t;
$$;
