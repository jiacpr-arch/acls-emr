-- =====================================================
-- Migration: codeblue_leaderboard
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- Backs the /sim-board page (PR #257, "Add class medal leaderboard for
-- Code Blue Sim") — a student-facing leaderboard for Code Blue Simulator,
-- ranked by medal points. Gated behind the STUDENT join code (same
-- bearer any student already has), unlike get_cohort_codeblue_summary
-- (codeblue-results.sql), which needs the instructor code and returns
-- phone numbers. This one returns name + medal counts only.
--
-- Medal rule (per scenario, best attempt by fewest mistakes among
-- won=true attempts): 0 wrong -> gold (3 pts), <=2 wrong -> silver
-- (2 pts), otherwise -> bronze (1 pt). Points sum across all cleared
-- scenarios.
--
-- NOTE: PR #257 shipped /sim-board (src/pages/CodeBlueLeaderboard.jsx)
-- and the client-side RPC wrapper without committing this migration file
-- or recording which shape the RPC actually returns. A second, unrelated
-- PR (#258, this branch) independently added a get_codeblue_leaderboard
-- RPC of its own on the live project — same function name via CREATE OR
-- REPLACE, but a different ("total score") shape — which silently
-- overwrote #257's version and broke /sim-board for a window before this
-- file was written. This migration restores and documents the exact
-- shape the shipped UI expects (points/gold/silver/bronze/cleared),
-- verified against the live CodeBlueLeaderboard.jsx.
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
  totals as (
    select student_pk,
      count(*) filter (where medal = 'gold') as gold,
      count(*) filter (where medal = 'silver') as silver,
      count(*) filter (where medal = 'bronze') as bronze,
      count(*) as cleared,
      count(*) filter (where medal = 'gold') * 3
        + count(*) filter (where medal = 'silver') * 2
        + count(*) filter (where medal = 'bronze') * 1 as points
    from medals
    group by student_pk
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'studentPk', s.id, 'studentId', s.student_id, 'name', s.name,
        'points', t.points, 'gold', t.gold, 'silver', t.silver, 'bronze', t.bronze,
        'cleared', t.cleared
      )
      order by t.points desc, t.cleared desc
    ),
    '[]'::jsonb
  )
    into v_result
    from totals t
    join cohort_students s on s.id = t.student_pk
    where s.class_id = v_class_id;

  return v_result;
end;
$$;

grant execute on function public.get_codeblue_leaderboard(text) to anon, authenticated;
