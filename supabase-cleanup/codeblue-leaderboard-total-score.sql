-- =====================================================
-- Migration: codeblue_leaderboard_total_score
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- The open online league (open-online-league.sql) makes the /sim-board
-- leaderboard a prize-campaign surface: "top player wins a prize". Medal
-- points (3/2/1 per case) tie easily — with a bounded case pool many
-- players hit identical totals, so a campaign can't pick a clear #1.
--
-- Adds totalScore = sum over scenarios of the best single-attempt score
-- (win or lose, so partial credit counts, but replaying the same case can
-- only ever upgrade — no farming). Ranking becomes:
--   points desc → totalScore desc → cleared desc
-- Shape stays backward compatible: old clients simply ignore the new
-- totalScore key and see the same fields as before.
-- =====================================================

create or replace function public.get_codeblue_leaderboard(p_code text)
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

  with best_per_scenario as (
    select student_pk, scenario_id, min(wrong_count) as best_wrong
      from cohort_codeblue_results
      where class_id = v_class_id and won = true
      group by student_pk, scenario_id
  ),
  medals as (
    select student_pk,
      case when best_wrong = 0 then 'gold'
           when best_wrong <= 2 then 'silver'
           else 'bronze' end as medal
    from best_per_scenario
  ),
  -- best score per scenario across ALL attempts (win or lose): losing runs
  -- give partial credit toward the total, replays only upgrade
  score_per_scenario as (
    select student_pk, scenario_id, max(score) as best_score
      from cohort_codeblue_results
      where class_id = v_class_id
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
        'studentPk', s.id, 'studentId', s.student_id, 'name', s.name,
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

grant execute on function public.get_codeblue_leaderboard(text) to anon, authenticated;
