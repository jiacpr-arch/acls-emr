-- =====================================================
-- Migration: open_online_league
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Problem: students without a class code (self-learners arriving from ads /
-- social) play the Code Blue Sim fully anonymously — their results never
-- reach the cloud, they have no leaderboard, and switching devices loses
-- everything. We also can't see this audience at all.
--
-- Fix, in three additive parts:
--
-- 1. OPEN LEAGUE CLASSES — one well-known "class" per course mode that any
--    self-learner can join with a single tap (the client hardcodes the join
--    codes below). Reuses the whole cohort pipeline as-is: results sync,
--    medal leaderboard, instructor dashboard (= our view of online users).
--      ONLINE     → acls (morroo.com)
--      ONLINEBLS  → bls  (bls.morroo.com)
--    Instructor codes are generated at apply time and NOT stored in the
--    repo — recover them any time with verify-by-SQL or ask the DB.
--    NOTE: clients auto-generate a unique player code (P-XXXXXXXX) as the
--    student_id for these classes, so the free-text-id collision problem of
--    normal classes doesn't apply here.
--
-- 2. fast_clear COLUMN — the client's "speed demon" medal needs the
--    fast-clear flag, which wasn't in the payload. Additive column +
--    submit_codeblue_result now reads payload.fastClear (old clients that
--    don't send it keep working via coalesce).
--
-- 3. get_my_codeblue_progress RPC — student-bearer read-back of one's own
--    game progress, aggregated server-side from cohort_codeblue_results:
--    cleared scenario ids, best grade per scenario, hi-score per difficulty.
--    Same bearer model as get_student_progress (class join code + own
--    student_pk). This is what makes "continue on another device" real for
--    the game, for open-league players and normal class students alike.
-- =====================================================

-- ===== 1) Open league classes (idempotent) =====

insert into public.cohort_classes (code, name, course_mode, instructor_code)
select 'ONLINE', 'ลีกออนไลน์ ACLS (บุคคลทั่วไป)', 'acls', public._cohort_gen_code_v2()
where not exists (select 1 from public.cohort_classes where code = 'ONLINE');

insert into public.cohort_classes (code, name, course_mode, instructor_code)
select 'ONLINEBLS', 'ลีกออนไลน์ BLS (บุคคลทั่วไป)', 'bls', public._cohort_gen_code_v2()
where not exists (select 1 from public.cohort_classes where code = 'ONLINEBLS');

-- ===== 2) fast_clear flag on game results =====

alter table public.cohort_codeblue_results
  add column if not exists fast_clear boolean not null default false;

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
    level, difficulty, won, grade, score, wrong_count, duration_seconds, finished_at,
    fast_clear
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
    coalesce((p_payload->>'finishedAt')::timestamptz, now()),
    coalesce((p_payload->>'fastClear')::boolean, false)
  )
  on conflict (id) do nothing;
end;
$$;

-- ===== 3) Game progress read-back =====

-- Returns jsonb the client hydrates straight into its localStorage model:
--   cleared  : [scenario_id, ...]            (won at least once)
--   grades   : { scenario_id: {grade, diff, fast} }  best per scenario,
--              ranked grade first (S>A>B>C) then difficulty (hard>normal>easy),
--              fast = won fast at least once (sticky, matches client)
--   hiscores : { difficulty: best_score }    across all attempts, win or lose
create or replace function public.get_my_codeblue_progress(
  p_code text,
  p_student_pk uuid
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
  v_class_id := _cohort_resolve_class(p_code);
  if not exists (select 1 from cohort_students where id = p_student_pk and class_id = v_class_id) then
    raise exception 'unknown_student';
  end if;

  with wins as (
    select r.scenario_id, r.grade, r.difficulty, r.fast_clear
      from cohort_codeblue_results r
      where r.student_pk = p_student_pk and r.won
  ),
  best as (
    select distinct on (w.scenario_id)
        w.scenario_id,
        w.grade,
        w.difficulty,
        bool_or(w.fast_clear) over (partition by w.scenario_id) as fast
      from wins w
      order by w.scenario_id,
        case w.grade when 'S' then 4 when 'A' then 3 when 'B' then 2 else 1 end desc,
        case w.difficulty when 'hard' then 3 when 'normal' then 2 else 1 end desc
  ),
  his as (
    select r.difficulty, max(r.score) as best_score
      from cohort_codeblue_results r
      where r.student_pk = p_student_pk
      group by r.difficulty
  )
  select jsonb_build_object(
    'cleared', coalesce((select jsonb_agg(b.scenario_id) from best b), '[]'::jsonb),
    'grades', coalesce((
      select jsonb_object_agg(b.scenario_id,
        jsonb_build_object('grade', b.grade, 'diff', b.difficulty, 'fast', b.fast))
      from best b
    ), '{}'::jsonb),
    'hiscores', coalesce((
      select jsonb_object_agg(h.difficulty, h.best_score) from his h
    ), '{}'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_my_codeblue_progress(text, uuid) to anon, authenticated;
