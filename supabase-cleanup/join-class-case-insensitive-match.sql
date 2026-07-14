-- =====================================================
-- Migration: join_class_case_insensitive_match
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Problem: join_class matched an existing student by exact, case-sensitive
-- text ("cs.student_id = trim(p_student_id)"). A student who typed their own
-- ID with different casing on a later visit (observed in the wild: the same
-- person registered once as "893vfz" and again as "893VFZ" after mistakenly
-- entering the class join code as their own student ID) got a brand new
-- cohort_students row instead of being recognised as the same person —
-- duplicating them in the instructor roster with their history split across
-- two rows.
--
-- Fix: match the existing-student lookup case-insensitively
-- (upper(trim(...)) on both sides, consistent with how _cohort_resolve_class,
-- _cohort_resolve_class_instructor and the acls_assessment_attempts fallback
-- join in get_cohort_summary already compare codes/ids). Stored casing is
-- left untouched — only the comparison changes — so existing rows and other
-- reads are unaffected.
-- =====================================================

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
      and upper(trim(cs.student_id)) = upper(trim(p_student_id));

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
