-- =====================================================
-- Migration: cohort_instructor_code
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Splits the class secret into two codes:
--   code             — student join code. Grants join/sync only.
--   instructor_code  — instructor secret. Required for cohort summary,
--                      student deletion, and recovering the student code.
--
-- Backward compatibility (no broken-rollout window):
--   * Legacy classes (instructor_code IS NULL) keep the old bearer
--     behaviour: their student code still works for instructor RPCs.
--   * create_class (v1) is kept unchanged so already-deployed clients
--     keep creating legacy classes until the new client ships.
--   * New clients call create_class_v2, whose classes require the
--     instructor code for instructor-level access.
-- =====================================================

alter table public.cohort_classes
  add column if not exists instructor_code text unique;

-- Code generator that avoids collisions across BOTH code columns, so a
-- student code can never equal any instructor code (and vice versa).
create or replace function public._cohort_gen_code_v2()
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  i int;
  tries int := 0;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (
      select 1 from cohort_classes c
        where c.code = v_code or c.instructor_code = v_code
    );
    tries := tries + 1;
    if tries > 10 then
      raise exception 'code_generation_failed';
    end if;
  end loop;
  return v_code;
end;
$$;

-- Resolve a class for INSTRUCTOR-level access.
-- Accepts the instructor code; for legacy classes (no instructor code yet)
-- the student code is accepted as before.
create or replace function public._cohort_resolve_class_instructor(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  select id into v_id
    from cohort_classes
    where instructor_code = upper(trim(p_code)) and archived_at is null;
  if v_id is not null then
    return v_id;
  end if;
  select id into v_id
    from cohort_classes
    where code = upper(trim(p_code))
      and instructor_code is null
      and archived_at is null;
  if v_id is null then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  return v_id;
end;
$$;

create or replace function public.create_class_v2(p_name text, p_course_mode text)
returns table (class_id uuid, code text, instructor_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_instructor_code text;
  v_id uuid;
begin
  if p_course_mode not in ('bls','acls') then
    raise exception 'invalid_mode';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name_required';
  end if;
  v_code := _cohort_gen_code_v2();
  v_instructor_code := _cohort_gen_code_v2();
  insert into cohort_classes (code, name, course_mode, instructor_code)
    values (v_code, trim(p_name), p_course_mode, v_instructor_code)
    returning id into v_id;
  return query select v_id, v_code, v_instructor_code;
end;
$$;

-- Verify an instructor code (or a legacy class code) and return the class
-- info INCLUDING the student join code, so an instructor can reconnect on a
-- new device — and recover a lost student code — from the instructor code.
create or replace function public.verify_instructor_code(p_code text)
returns table (class_id uuid, class_name text, course_mode text, class_code text, instructor_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  return query
    select c.id, c.name, c.course_mode, c.code, c.instructor_code
      from cohort_classes c
      where c.id = v_class_id;
end;
$$;

-- Instructor-level RPCs now resolve via the instructor path. Legacy classes
-- keep working with their student code; v2 classes reject it, so students
-- holding only the join code can no longer read the whole-class roster
-- (names + phones) or delete rows.
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
                'attemptCount', (
                  select count(*) from cohort_quiz_attempts q
                    where q.student_pk = s.id and q.lesson_id = lid
                ),
                'bestScore', (
                  select max(q.score) from cohort_quiz_attempts q
                    where q.student_pk = s.id and q.lesson_id = lid
                ),
                'passed', coalesce((
                  select bool_or(q.passed) from cohort_quiz_attempts q
                    where q.student_pk = s.id and q.lesson_id = lid
                ), false),
                'lastAttemptAt', (
                  select max(q.finished_at) from cohort_quiz_attempts q
                    where q.student_pk = s.id and q.lesson_id = lid
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

create or replace function public.delete_cohort_student(
  p_code text,
  p_student_pk uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  delete from cohort_students where id = p_student_pk and class_id = v_class_id;
end;
$$;

grant execute on function public.create_class_v2(text, text) to anon, authenticated;
grant execute on function public.verify_instructor_code(text) to anon, authenticated;

revoke execute on function public._cohort_gen_code_v2() from anon, authenticated, public;
revoke execute on function public._cohort_resolve_class_instructor(text) from anon, authenticated, public;
