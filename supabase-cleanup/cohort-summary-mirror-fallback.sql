-- =====================================================
-- Migration: cohort_summary_mirror_fallback
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Problem: pre-test/post-test results reach Supabase through two independent
-- paths — a direct write to acls_assessment_attempts on submit (services/
-- assessmentService.js submitAttempt), and a device-side sync queue that
-- eventually pushes the same attempt into cohort_quiz_attempts (services/
-- syncEngine.js). The instructor cohort report (get_cohort_summary) only
-- ever read from cohort_quiz_attempts. When the device-side sync stalls or
-- never completes (LINE in-app browser using an isolated WebView storage,
-- the tab closed right after finishing, a flaky connection), the direct
-- write still lands, but the instructor report shows nothing — even though
-- the score was recorded and the student saw a passing result.
--
-- Fix: get_cohort_summary now also reads acls_assessment_attempts (matching
-- on upper(trim(student_id)) = upper(trim(student_code)), since student ids
-- have also been seen to reach the cohort table in mismatched case) and
-- combines it with cohort_quiz_attempts: bestScore/passed/lastAttemptAt take
-- the better of the two sources, attemptCount takes the higher count. This
-- only affects the two assessment lesson ids ('pre-test' / 'post-test');
-- BLS classes and regular lessons are untouched since no matching bank_id
-- exists for them.
--
-- Also hardens join_class: registering with a student_id equal to the
-- class's own join code (a common mistake — students type the code they
-- were handed instead of their own student id) is now rejected instead of
-- silently colliding with (and overwriting the name on) whichever record
-- happens to hold that code already.
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

-- Reject class-code-as-student-id before it can collide with (and overwrite
-- the name on) an existing student row.
create or replace function public.join_class(
  p_code text,
  p_student_uuid uuid,
  p_student_id text,
  p_name text,
  p_phone text default null
)
returns table (class_id uuid, student_pk uuid, class_name text, course_mode text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_existing_pk uuid;
  v_pk uuid;
  v_class_name text;
  v_mode text;
  v_phone text;
begin
  v_class_id := _cohort_resolve_class(p_code);
  select c.id, c.name, c.course_mode into v_class_id, v_class_name, v_mode
    from cohort_classes c where c.id = v_class_id;

  if p_student_id is null or length(trim(p_student_id)) = 0
     or p_name is null or length(trim(p_name)) = 0 then
    raise exception 'student_required';
  end if;

  if upper(trim(p_student_id)) = upper(trim(p_code)) then
    raise exception 'student_id_is_class_code' using errcode = 'P0001';
  end if;

  v_phone := nullif(trim(coalesce(p_phone, '')), '');

  select cs.id into v_existing_pk
    from cohort_students cs
    where cs.class_id = v_class_id
      and cs.student_id = trim(p_student_id);

  if v_existing_pk is not null then
    update cohort_students
       set name = trim(p_name),
           phone = coalesce(v_phone, phone)
     where id = v_existing_pk;
    v_pk := v_existing_pk;
  else
    v_pk := coalesce(p_student_uuid, gen_random_uuid());
    insert into cohort_students (id, class_id, student_id, name, phone)
      values (v_pk, v_class_id, trim(p_student_id), trim(p_name), v_phone)
      on conflict (id) do update set name = excluded.name, phone = coalesce(excluded.phone, cohort_students.phone);
  end if;

  return query select v_class_id, v_pk, v_class_name, v_mode;
end;
$$;
