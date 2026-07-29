-- =====================================================
-- Migration: codeblue_global_leaderboard
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Site-wide Code Blue leaderboard across ALL classes of a course mode
-- (instructor classes + the open online league) — the marketing surface:
-- anyone can see the top players of the whole site, and a registered
-- player can see their own site-wide rank. Two parts:
--
-- 1. get_codeblue_global_leaderboard(p_course_mode, p_student_pk?) —
--    PUBLIC (no bearer): same medal/points/totalScore rules as the class
--    board, ranked across every active class of the mode. Returns top 50
--    + totalPlayers + the caller's own row ('me', looked up by their own
--    student_pk) so rank is visible even when outside the top 50.
--    Exposes name + class label ONLY — never student_id (in the open
--    league that string is the player code, i.e. a credential) and never
--    phone. Same-name students in different classes stay separate rows.
--
-- 2. get_codeblue_leaderboard patch — the class board used to return
--    student_id for the isMe fallback (#257, harmless for classroom ids).
--    In the open league student_id IS the player code, so league members
--    could read each other's codes and impersonate. Open-league classes
--    now return studentId = null; the client's isMe falls back to
--    studentPk equality, which is how league identities match anyway.
-- =====================================================

create or replace function public.get_codeblue_global_leaderboard(
  p_course_mode text,
  p_student_pk uuid default null
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

grant execute on function public.get_codeblue_global_leaderboard(text, uuid) to anon, authenticated;

-- ===== patch: hide player codes on the class board (open league) =====

create or replace function public.get_codeblue_leaderboard(p_code text)
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

grant execute on function public.get_codeblue_leaderboard(text) to anon, authenticated;
