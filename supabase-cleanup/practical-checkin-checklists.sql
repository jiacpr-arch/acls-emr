-- =====================================================
-- Migration: practical_checkin_checklists
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- Attaches an optional digital checklist result to a check-in: which
-- checklist template was used (a client-side id — see
-- src/data/checklists/*.js) and which items were ticked. Additive-only on
-- top of practical-checkin.sql: two nullable columns on cohort_checkins,
-- and set_exam_result / get_checkin_board extended with new optional
-- trailing params so existing callers keep working unchanged.
--
-- checklist_items is intentionally un-validated jsonb (client-trusted) —
-- this is a scoring aid for the instructor, not the source of truth for
-- certification, so it does not need the same rigor as attendance rows.
-- =====================================================

alter table public.cohort_checkins add column if not exists checklist_id text;
alter table public.cohort_checkins add column if not exists checklist_items jsonb;

-- Postgres overloads functions by argument list, so adding 2 trailing
-- parameters via create-or-replace would leave the old 6-arg signature
-- alongside this one — an RPC call omitting the new args would then be
-- ambiguous between the two. Drop the old signature explicitly first.
drop function if exists public.set_exam_result(text, uuid, uuid, boolean, numeric, text);

create or replace function public.set_exam_result(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_passed boolean,
  p_score numeric default null,
  p_note text default null,
  p_checklist_id text default null,
  p_checklist_items jsonb default null
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
  if not exists (
    select 1 from cohort_stations where id = p_station_id and class_id = v_class_id
  ) then
    raise exception 'unknown_station';
  end if;
  if not exists (
    select 1 from cohort_students where id = p_student_pk and class_id = v_class_id
  ) then
    raise exception 'unknown_student';
  end if;
  insert into cohort_checkins (
    class_id, station_id, student_pk, exam_passed, exam_score, note,
    checklist_id, checklist_items
  )
    values (
      v_class_id, p_station_id, p_student_pk, p_passed, p_score, p_note,
      p_checklist_id, p_checklist_items
    )
    on conflict (student_pk, station_id) do update
      set exam_passed     = excluded.exam_passed,
          exam_score      = excluded.exam_score,
          note            = coalesce(excluded.note, cohort_checkins.note),
          checklist_id    = coalesce(excluded.checklist_id, cohort_checkins.checklist_id),
          checklist_items = coalesce(excluded.checklist_items, cohort_checkins.checklist_items);
end;
$$;

create or replace function public.get_checkin_board(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_stations jsonb;
  v_rows jsonb;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);

  select coalesce(jsonb_agg(
      jsonb_build_object('id', st.id, 'name', st.name, 'kind', st.kind, 'sortOrder', st.sort_order)
      order by st.sort_order, st.created_at
    ), '[]'::jsonb)
    into v_stations
    from cohort_stations st
    where st.class_id = v_class_id;

  with students as (
    select id, student_id, name, phone, created_at
      from cohort_students
      where class_id = v_class_id
      order by created_at desc
  ),
  agg as (
    select
      jsonb_build_object('id', s.id, 'studentId', s.student_id, 'name', s.name, 'phone', s.phone) as student,
      coalesce(
        (
          select jsonb_object_agg(
            c.station_id,
            jsonb_build_object(
              'checkedInAt', c.checked_in_at,
              'examPassed', c.exam_passed,
              'examScore', c.exam_score,
              'note', c.note,
              'checklistId', c.checklist_id,
              'checklistItems', c.checklist_items
            )
          )
          from cohort_checkins c
          where c.student_pk = s.id
        ),
        '{}'::jsonb
      ) as checkins
    from students s
  )
  select coalesce(jsonb_agg(jsonb_build_object('student', student, 'checkins', checkins)), '[]'::jsonb)
    into v_rows
    from agg;

  return jsonb_build_object('stations', v_stations, 'rows', v_rows);
end;
$$;

grant execute on function public.set_exam_result(text, uuid, uuid, boolean, numeric, text, text, jsonb) to anon, authenticated;
grant execute on function public.get_checkin_board(text) to anon, authenticated;
