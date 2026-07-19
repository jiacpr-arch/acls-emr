-- =====================================================
-- Migration: practical_checkin
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- QR check-in + practical-exam results for the in-person session:
-- instructors define "stations" (ฐาน) per class, then scan each student's
-- personal QR (payload = class_id + student_pk, no PII) at the station to
-- record attendance — and, on exam stations, a pass/fail result + score.
--
-- Same architecture as cohort-sync.sql / codeblue-results.sql: anon clients
-- call SECURITY DEFINER RPCs; tables are RLS-locked with zero policies so
-- direct PostgREST access is impossible. All RPCs here are INSTRUCTOR-level
-- (write access to attendance must not be reachable with the student join
-- code) and resolve via _cohort_resolve_class_instructor, which also rejects
-- archived classes.
--
-- Online-only, no offline queue: a check-in happens live at the station with
-- the instructor's phone; a failed call is retried by re-scanning.
-- =====================================================

create table if not exists public.cohort_stations (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.cohort_classes(id) on delete cascade,
  name        text not null,
  kind        text not null check (kind in ('practice','exam')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists cohort_stations_class_idx on public.cohort_stations(class_id);

create table if not exists public.cohort_checkins (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.cohort_classes(id) on delete cascade,
  station_id    uuid not null references public.cohort_stations(id) on delete cascade,
  student_pk    uuid not null references public.cohort_students(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  exam_passed   boolean,   -- null = practice station / exam not judged yet
  exam_score    numeric,
  note          text,
  unique (student_pk, station_id)
);
create index if not exists cohort_checkins_class_idx on public.cohort_checkins(class_id);
create index if not exists cohort_checkins_station_idx on public.cohort_checkins(station_id);

alter table public.cohort_stations enable row level security;
alter table public.cohort_checkins enable row level security;
revoke all on public.cohort_stations from anon, authenticated;
revoke all on public.cohort_checkins from anon, authenticated;

-- ===== RPCs (all instructor-level) =====

-- Create (p_station_id null) or update a station.
create or replace function public.upsert_station(
  p_code text,
  p_station_id uuid,
  p_name text,
  p_kind text,
  p_sort_order int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_id uuid;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  if p_kind not in ('practice','exam') then
    raise exception 'invalid_kind';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name_required';
  end if;
  if p_station_id is null then
    insert into cohort_stations (class_id, name, kind, sort_order)
      values (v_class_id, trim(p_name), p_kind, coalesce(p_sort_order, 0))
      returning id into v_id;
  else
    update cohort_stations
      set name = trim(p_name), kind = p_kind, sort_order = coalesce(p_sort_order, sort_order)
      where id = p_station_id and class_id = v_class_id
      returning id into v_id;
    if v_id is null then
      raise exception 'unknown_station';
    end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.delete_station(
  p_code text,
  p_station_id uuid
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
  delete from cohort_stations where id = p_station_id and class_id = v_class_id;
end;
$$;

-- The scanner's workhorse. Inserts the attendance stamp (idempotent —
-- unique(student_pk, station_id), a re-scan is flagged as duplicate, never
-- an error) and returns the student's name/id from the server so the QR
-- itself never has to carry PII.
create or replace function public.checkin_student(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_station cohort_stations%rowtype;
  v_student cohort_students%rowtype;
  v_row cohort_checkins%rowtype;
  v_duplicate boolean := false;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  select * into v_station from cohort_stations
    where id = p_station_id and class_id = v_class_id;
  if v_station.id is null then
    raise exception 'unknown_station';
  end if;
  select * into v_student from cohort_students
    where id = p_student_pk and class_id = v_class_id;
  if v_student.id is null then
    raise exception 'unknown_student';
  end if;

  insert into cohort_checkins (class_id, station_id, student_pk, note)
    values (v_class_id, p_station_id, p_student_pk, p_note)
    on conflict (student_pk, station_id) do nothing;
  if not found then
    v_duplicate := true;
  end if;
  select * into v_row from cohort_checkins
    where student_pk = p_student_pk and station_id = p_station_id;

  return jsonb_build_object(
    'duplicate', v_duplicate,
    'checkedInAt', v_row.checked_in_at,
    'examPassed', v_row.exam_passed,
    'examScore', v_row.exam_score,
    'note', v_row.note,
    'student', jsonb_build_object(
      'id', v_student.id, 'studentId', v_student.student_id, 'name', v_student.name),
    'station', jsonb_build_object(
      'id', v_station.id, 'name', v_station.name, 'kind', v_station.kind)
  );
end;
$$;

create or replace function public.undo_checkin(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid
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
  delete from cohort_checkins
    where student_pk = p_student_pk and station_id = p_station_id
      and class_id = v_class_id;
end;
$$;

-- Upsert, not update-only: recording an exam result implies the student is
-- present at the station, so a missing check-in row is created on the fly.
create or replace function public.set_exam_result(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_passed boolean,
  p_score numeric default null,
  p_note text default null
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
  insert into cohort_checkins (class_id, station_id, student_pk, exam_passed, exam_score, note)
    values (v_class_id, p_station_id, p_student_pk, p_passed, p_score, p_note)
    on conflict (student_pk, station_id) do update
      set exam_passed = excluded.exam_passed,
          exam_score  = excluded.exam_score,
          note        = coalesce(excluded.note, cohort_checkins.note);
end;
$$;

-- The attendance matrix: every student × every station of the class.
-- { "stations": [{id,name,kind,sortOrder}...],
--   "rows": [{ "student": {...}, "checkins": { "<station_id>": {...} } }...] }
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
              'note', c.note
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

grant execute on function public.upsert_station(text, uuid, text, text, int) to anon, authenticated;
grant execute on function public.delete_station(text, uuid) to anon, authenticated;
grant execute on function public.checkin_student(text, uuid, uuid, text) to anon, authenticated;
grant execute on function public.undo_checkin(text, uuid, uuid) to anon, authenticated;
grant execute on function public.set_exam_result(text, uuid, uuid, boolean, numeric, text) to anon, authenticated;
grant execute on function public.get_checkin_board(text) to anon, authenticated;
