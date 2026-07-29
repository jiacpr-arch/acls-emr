-- =====================================================
-- Migration: codeblue_leaderboard_monthly
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Monthly prize campaigns ("champion of the month" for both the whole
-- site and the online league) need period-scoped boards: the all-time
-- boards accumulate forever, so the same veteran would win every month.
--
-- Adds optional p_since / p_until (finished_at >= since, < until) to both
-- leaderboard RPCs. Medals, totalScore and ranks are all computed from
-- results INSIDE the window only, so each month is a fresh race.
--
-- Postgres note: CREATE OR REPLACE with extra args would create an
-- overload, not replace — and two candidates break PostgREST dispatch.
-- So the old signatures are dropped first; the new ones default both
-- params to null (= all-time), which keeps every already-deployed client
-- (calling with the old arg set) working unchanged through the rollout.
-- =====================================================

drop function if exists public.get_codeblue_leaderboard(text);
drop function if exists public.get_codeblue_global_leaderboard(text, uuid);

create or replace function public.get_codeblue_leaderboard(
  p_code text,
  p_since timestamptz default null,
  p_until timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_is_open boolean;
  v_result jsonb;
begin
  v_class_id := _cohort_resolve_class(p_code);
  select (c.code in ('ONLINE','ONLINEBLS')) into v_is_open
    from cohort_classes c where c.id = v_class_id;

  with results as (
    select r.student_pk, r.scenario_id, r.won, r.wrong_count, r.score
      from cohort_codeblue_results r
      where r.class_id = v_class_id
        and (p_since is null or r.finished_at >= p_since)
        and (p_until is null or r.finished_at < p_until)
  ),
  best_per_scenario as (
    select student_pk, scenario_id, min(wrong_count) as best_wrong
      from results where won
      group by student_pk, scenario_id
  ),
  medals as (
    select student_pk,
      case when best_wrong = 0 then 'gold'
           when best_wrong <= 2 then 'silver'
           else 'bronze' end as medal
    from best_per_scenario
  ),
  score_per_scenario as (
    select student_pk, scenario_id, max(score) as best_score
      from results
      group by student_pk, scenario_id
  ),
  scores as (
    select student_pk, sum(best_score) as total_score
      from score_per_scenario
      group by student_pk
  ),
  totals as (
    select m.student_pk,
      count(*) filter (where m.medal = 'gold') as gold,
      count(*) filter (where m.medal = 'silver') as silver,
      count(*) filter (where m.medal = 'bronze') as bronze,
      count(*) as cleared,
      count(*) filter (where m.medal = 'gold') * 3
        + count(*) filter (where m.medal = 'silver') * 2
        + count(*) filter (where m.medal = 'bronze') * 1 as points
    from medals m
    group by m.student_pk
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'studentPk', s.id,
        'studentId', case when v_is_open then null else s.student_id end,
        'name', s.name,
        'points', t.points, 'gold', t.gold, 'silver', t.silver, 'bronze', t.bronze,
        'cleared', t.cleared,
        'totalScore', coalesce(sc.total_score, 0)
      )
      order by t.points desc, coalesce(sc.total_score, 0) desc, t.cleared desc
    ),
    '[]'::jsonb
  )
    into v_result
    from totals t
    join cohort_students s on s.id = t.student_pk
    left join scores sc on sc.student_pk = t.student_pk
    where s.class_id = v_class_id;

  return v_result;
end;
$$;

create or replace function public.get_codeblue_global_leaderboard(
  p_course_mode text,
  p_student_pk uuid default null,
  p_since timestamptz default null,
  p_until timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if p_course_mode not in ('bls','acls') then
    raise exception 'invalid_mode';
  end if;

  with results as (
    select r.student_pk, r.scenario_id, r.won, r.wrong_count, r.score
      from cohort_codeblue_results r
      join cohort_classes c on c.id = r.class_id
      where c.course_mode = p_course_mode and c.archived_at is null
        and (p_since is null or r.finished_at >= p_since)
        and (p_until is null or r.finished_at < p_until)
  ),
  best_per_scenario as (
    select student_pk, scenario_id, min(wrong_count) as best_wrong
      from results where won
      group by student_pk, scenario_id
  ),
  medals as (
    select student_pk,
      case when best_wrong = 0 then 'gold'
           when best_wrong <= 2 then 'silver'
           else 'bronze' end as medal
    from best_per_scenario
  ),
  score_per_scenario as (
    select student_pk, scenario_id, max(score) as best_score
      from results
      group by student_pk, scenario_id
  ),
  scores as (
    select student_pk, sum(best_score) as total_score
      from score_per_scenario
      group by student_pk
  ),
  totals as (
    select m.student_pk,
      count(*) filter (where m.medal = 'gold') as gold,
      count(*) filter (where m.medal = 'silver') as silver,
      count(*) filter (where m.medal = 'bronze') as bronze,
      count(*) as cleared,
      count(*) filter (where m.medal = 'gold') * 3
        + count(*) filter (where m.medal = 'silver') * 2
        + count(*) filter (where m.medal = 'bronze') * 1 as points
    from medals m
    group by m.student_pk
  ),
  ranked as (
    select t.student_pk, t.gold, t.silver, t.bronze, t.cleared, t.points,
      coalesce(sc.total_score, 0) as total_score,
      s.name, c.name as class_name,
      (c.code in ('ONLINE','ONLINEBLS')) as is_open_league,
      row_number() over (
        order by t.points desc, coalesce(sc.total_score, 0) desc, t.cleared desc
      ) as rank
    from totals t
    join cohort_students s on s.id = t.student_pk
    join cohort_classes c on c.id = s.class_id
    left join scores sc on sc.student_pk = t.student_pk
  )
  select jsonb_build_object(
    'totalPlayers', (select count(*) from ranked),
    'top', coalesce((
      select jsonb_agg(jsonb_build_object(
          'rank', x.rank, 'name', x.name, 'className', x.class_name,
          'isOpenLeague', x.is_open_league,
          'points', x.points, 'gold', x.gold, 'silver', x.silver, 'bronze', x.bronze,
          'cleared', x.cleared, 'totalScore', x.total_score
        ) order by x.rank)
      from (select * from ranked order by rank limit 50) x
    ), '[]'::jsonb),
    'me', (
      select jsonb_build_object(
          'rank', rk.rank, 'name', rk.name, 'className', rk.class_name,
          'isOpenLeague', rk.is_open_league,
          'points', rk.points, 'gold', rk.gold, 'silver', rk.silver, 'bronze', rk.bronze,
          'cleared', rk.cleared, 'totalScore', rk.total_score
        )
      from ranked rk
      where p_student_pk is not null and rk.student_pk = p_student_pk
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_codeblue_leaderboard(text, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.get_codeblue_global_leaderboard(text, uuid, timestamptz, timestamptz) to anon, authenticated;
