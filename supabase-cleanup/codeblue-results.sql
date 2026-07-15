-- =====================================================
-- Migration: codeblue_results
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- Persists Code Blue Simulator game results (per student, per scenario) so
-- instructors can see which students practiced which cases and what grade
-- they got — previously this only lived in each device's localStorage
-- (hi-score + cleared-case set), invisible to instructors and lost on a
-- cleared cache / new device.
--
-- Same architecture as cohort-sync.sql: anon clients call SECURITY DEFINER
-- RPCs with the class join code (bearer secret); the table itself is
-- RLS-locked with zero policies so direct PostgREST access is impossible.
--
-- Best-effort, not gating: a game result never blocks certification, so
-- (unlike lesson progress / quiz attempts) this intentionally has no local
-- offline queue — a failed submit_codeblue_result call is just dropped,
-- same trade-off as the acls_assessment_attempts mirror-write pattern.
-- =====================================================

create table if not exists public.cohort_codeblue_results (
  id                uuid primary key,
  class_id          uuid not null references public.cohort_classes(id) on delete cascade,
  student_pk        uuid not null references public.cohort_students(id) on delete cascade,
  scenario_id       text not null,
  level             text not null,      -- 'basic' | 'intermediate' | 'megacode'
  difficulty        text not null,      -- 'easy' | 'normal' | 'hard'
  won               boolean not null,
  grade             text not null,      -- 'S' | 'A' | 'B' | 'C'
  score             int not null,
  wrong_count       int not null,
  duration_seconds  int not null,
  finished_at       timestamptz not null
);
create index if not exists cohort_codeblue_results_class_idx on public.cohort_codeblue_results(class_id);
create index if not exists cohort_codeblue_results_student_idx on public.cohort_codeblue_results(student_pk, scenario_id);

alter table public.cohort_codeblue_results enable row level security;
revoke all on public.cohort_codeblue_results from anon, authenticated;

-- ===== RPCs =====

-- Student-level write. Same bearer model as submit_quiz_attempt: the class
-- join code + the student's own row id. Records every finished case (win
-- or lose) so instructors can see practice attempts, not just successes.
create or replace function public.submit_codeblue_result(
  p_code text,
  p_attempt_uuid uuid,
  p_student_pk uuid,
  p_scenario_id text,
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
  insert into cohort_codeblue_results (
    id, class_id, student_pk, scenario_id,
    level, difficulty, won, grade, score, wrong_count, duration_seconds, finished_at
  ) values (
    p_attempt_uuid,
    v_class_id,
    p_student_pk,
    p_scenario_id,
    p_payload->>'level',
    p_payload->>'difficulty',
    (p_payload->>'won')::boolean,
    p_payload->>'grade',
    (p_payload->>'score')::int,
    coalesce((p_payload->>'wrongCount')::int, 0),
    coalesce((p_payload->>'durationSeconds')::int, 0),
    coalesce((p_payload->>'finishedAt')::timestamptz, now())
  )
  on conflict (id) do nothing;
end;
$$;

-- Instructor-level read. Uses the INSTRUCTOR resolver (not the plain student
-- one) — get_cohort_summary regressed once (see fix-get-cohort-summary-
-- instructor-resolver.sql) by using the wrong resolver, so this mirrors the
-- corrected pattern from the start.
create or replace function public.get_cohort_codeblue_summary(p_code text)
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
              'scenarioId', r.scenario_id, 'level', r.level, 'difficulty', r.difficulty,
              'won', r.won, 'grade', r.grade, 'score', r.score,
              'finishedAt', r.finished_at
            ) order by r.finished_at desc
          )
          from cohort_codeblue_results r
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

grant execute on function public.submit_codeblue_result(text, uuid, uuid, text, jsonb) to anon, authenticated;
grant execute on function public.get_cohort_codeblue_summary(text) to anon, authenticated;
