-- =====================================================
-- Migration: fix_get_cohort_summary_instructor_resolver
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Regression: cohort_summary_mirror_fallback.sql (PR #242) redefined
-- get_cohort_summary to add the acls_assessment_attempts fallback, but used
-- _cohort_resolve_class(p_code) — the plain student-code resolver — as its
-- base instead of _cohort_resolve_class_instructor(p_code), which
-- instructor-code.sql (PR #207) had established as the correct resolver for
-- instructor-level RPCs.
--
-- Effect: for any class created after instructor-code.sql shipped (i.e. any
-- class with its own distinct instructor_code — the normal case since
-- 2026-07-04), the instructor page sends the instructor code as p_code, the
-- resolver only matches the student join `code` column, finds nothing, and
-- raises invalid_code. InstructorCohort.jsx's `!instructorCode` guard around
-- its "need instructor code" prompt only handles the *other* case (no code
-- on this device), so this specific error was swallowed and the page fell
-- through to the empty local IndexedDB cache — instructor sees "0 นักเรียน"
-- + "cached (offline)" for a class that actually has a full roster.
--
-- Reported via a screenshot of class "ALS RAM 1/7/67" (code 893VFZ,
-- instructor code EUKZPG) showing 0 students despite 38 being enrolled.
--
-- Fix: restore _cohort_resolve_class_instructor(p_code) as the resolver,
-- keeping the acls_assessment_attempts merge logic from PR #242.
-- =====================================================

create or replace function public.get_cohort_summary(
  p_code text,
  p_lesson_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_result jsonb;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);

  with students as (
    select id, student_id, name, phone, created_at
      from cohort_students
      where class_id = v_class_id
      order by created_at desc
  ),
  agg as (
    select
      s.id as student_pk,
      jsonb_build_object('id', s.id, 'studentId', s.student_id, 'name', s.name,
                         'phone', s.phone, 'createdAt', s.created_at) as student,
      coalesce(
        (
          select jsonb_object_agg(lid, lesson_obj)
          from (
            select lid,
              jsonb_build_object(
                'read', exists(
                  select 1 from cohort_lesson_progress lp
                    where lp.student_pk = s.id and lp.lesson_id = lid
                ),
                'attemptCount', greatest(
                  (
                    select count(*) from cohort_quiz_attempts q
                      where q.student_pk = s.id and q.lesson_id = lid
                  ),
                  (
                    select count(*) from acls_assessment_attempts a
                      where upper(trim(a.student_code)) = upper(trim(s.student_id))
                        and a.bank_id = (case lid when 'pre-test' then 'pretest'
                                                   when 'post-test' then 'posttest' end)
                  )
                ),
                'bestScore', greatest(
                  (
                    select max(q.score) from cohort_quiz_attempts q
                      where q.student_pk = s.id and q.lesson_id = lid
                  ),
                  (
                    select max(a.score) from acls_assessment_attempts a
                      where upper(trim(a.student_code)) = upper(trim(s.student_id))
                        and a.bank_id = (case lid when 'pre-test' then 'pretest'
                                                   when 'post-test' then 'posttest' end)
                  )
                ),
                'passed', coalesce((
                  select bool_or(q.passed) from cohort_quiz_attempts q
                    where q.student_pk = s.id and q.lesson_id = lid
                ), false) or coalesce((
                  select bool_or(a.passed) from acls_assessment_attempts a
                    where upper(trim(a.student_code)) = upper(trim(s.student_id))
                      and a.bank_id = (case lid when 'pre-test' then 'pretest'
                                                 when 'post-test' then 'posttest' end)
                ), false),
                'lastAttemptAt', greatest(
                  (
                    select max(q.finished_at) from cohort_quiz_attempts q
                      where q.student_pk = s.id and q.lesson_id = lid
                  ),
                  (
                    select max(a.finished_at) from acls_assessment_attempts a
                      where upper(trim(a.student_code)) = upper(trim(s.student_id))
                        and a.bank_id = (case lid when 'pre-test' then 'pretest'
                                                   when 'post-test' then 'posttest' end)
                  )
                )
              ) as lesson_obj
            from unnest(p_lesson_ids) as lid
          ) sub
        ),
        '{}'::jsonb
      ) as lessons
    from students s
  )
  select coalesce(jsonb_agg(jsonb_build_object('student', student, 'lessons', lessons)), '[]'::jsonb)
    into v_result
    from agg;

  return v_result;
end;
$$;
