-- =====================================================
-- Migration: recorder_results
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- Persists Recorder Hero game results (per student, per level/round) so
-- instructors can see who practiced the recorder game and how they did —
-- previously this only lived in each device's localStorage (stars/hiscore
-- per level, hiscore per Endless category), invisible to instructors and
-- lost on a cleared cache / new device.
--
-- Same architecture as codeblue-results.sql: anon clients call SECURITY
-- DEFINER RPCs with the class join code (bearer secret); the table itself
-- is RLS-locked with zero policies so direct PostgREST access is
-- impossible.
--
-- level_id is a campaign level id (e.g. "hunt-1"), a case-pack id, or
-- "endless:<category>" for an Endless Shuffle round (category = "all" or
-- a case category key) — there's no separate "rounds" table, each finished
-- round/level is one row.
--
-- Best-effort, not gating: a game result never blocks certification, so
-- (like Code Blue Sim) this intentionally has no local offline queue — a
-- failed submit_recorder_result call is just dropped.
-- =====================================================

create table if not exists public.cohort_recorder_results (
  id                uuid primary key,
  class_id          uuid not null references public.cohort_classes(id) on delete cascade,
  student_pk        uuid not null references public.cohort_students(id) on delete cascade,
  level_id          text not null,
  mode              text not null,      -- 'hunt' | 'live' | 'audit' | 'endless'
  score             int not null,
  max_score         int,                -- null for endless (no fixed max)
  stars             int,                -- null for endless (no star rating)
  miss_count        int not null default 0,
  finished_at       timestamptz not null
);
create index if not exists cohort_recorder_results_class_idx on public.cohort_recorder_results(class_id);
create index if not exists cohort_recorder_results_student_idx on public.cohort_recorder_results(student_pk, level_id);

alter table public.cohort_recorder_results enable row level security;
revoke all on public.cohort_recorder_results from anon, authenticated;

-- ===== RPCs =====

-- Student-level write. Same bearer model as submit_codeblue_result: the
-- class join code + the student's own row id.
create or replace function public.submit_recorder_result(
  p_code text,
  p_attempt_uuid uuid,
  p_student_pk uuid,
  p_level_id text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
begin
  v_class_id := _cohort_resolve_class(p_code);
  if not exists (select 1 from cohort_students where id = p_student_pk and class_id = v_class_id) then
    raise exception 'unknown_student';
  end if;
  insert into cohort_recorder_results (
    id, class_id, student_pk, level_id,
    mode, score, max_score, stars, miss_count, finished_at
  ) values (
    p_attempt_uuid,
    v_class_id,
    p_student_pk,
    p_level_id,
    p_payload->>'mode',
    (p_payload->>'score')::int,
    (p_payload->>'maxScore')::int,
    (p_payload->>'stars')::int,
    coalesce((p_payload->>'missCount')::int, 0),
    coalesce((p_payload->>'finishedAt')::timestamptz, now())
  )
  on conflict (id) do nothing;
end;
$$;

-- Instructor-level read. Uses the INSTRUCTOR resolver, same as
-- get_cohort_codeblue_summary.
create or replace function public.get_cohort_recorder_summary(p_code text)
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
      jsonb_build_object('id', s.id, 'studentId', s.student_id, 'name', s.name, 'phone', s.phone) as student,
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'levelId', r.level_id, 'mode', r.mode,
              'score', r.score, 'maxScore', r.max_score, 'stars', r.stars, 'missCount', r.miss_count,
              'finishedAt', r.finished_at
            ) order by r.finished_at desc
          )
          from cohort_recorder_results r
          where r.student_pk = s.id
        ),
        '[]'::jsonb
      ) as results
    from students s
  )
  select coalesce(jsonb_agg(jsonb_build_object('student', student, 'results', results)), '[]'::jsonb)
    into v_result
    from agg;

  return v_result;
end;
$$;

grant execute on function public.submit_recorder_result(text, uuid, uuid, text, jsonb) to anon, authenticated;
grant execute on function public.get_cohort_recorder_summary(text) to anon, authenticated;
