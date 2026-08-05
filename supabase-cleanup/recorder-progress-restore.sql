-- =====================================================
-- Migration: get_my_recorder_progress
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- The read-back half of recorder-results.sql. That migration added the
-- write path (submit_recorder_result) plus an instructor-level summary,
-- but nothing that lets a *student* pull their own Recorder Hero progress
-- onto a second device — so stars/hi-scores earned on the phone were
-- invisible on the tablet, and lost for good on a cleared cache.
-- Code Blue already has this (get_my_codeblue_progress); this is the
-- same thing for Recorder Hero.
--
-- Same bearer model as get_my_codeblue_progress / get_student_progress:
-- the class join code + the student's own row id. Returns only that one
-- student's rows.
--
-- Shape mirrors the client's two localStorage models exactly so the
-- client can merge it in without reshaping:
--   levels  : { level_id: {stars, hiscore} }   campaign levels + case packs
--             (acls_recgame_progress) — best stars and best score, taken
--             independently: a run can score high with a sloppy star
--             rating and vice-versa, and the client keeps each at its max.
--   endless : { category: hiscore }            Endless Shuffle rounds
--             (acls_recgame_endless) — level_id is stored as
--             "endless:<category>"; the prefix is stripped here because
--             the client keys that map on the bare category.
-- =====================================================

create or replace function public.get_my_recorder_progress(
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

  with mine as (
    select r.level_id, r.score, r.stars
      from cohort_recorder_results r
      where r.student_pk = p_student_pk
  ),
  levels as (
    select m.level_id,
           max(m.score) as hiscore,
           coalesce(max(m.stars), 0) as stars
      from mine m
      where m.level_id not like 'endless:%'
      group by m.level_id
  ),
  endless as (
    select substring(m.level_id from 9) as category,   -- strip "endless:"
           max(m.score) as hiscore
      from mine m
      where m.level_id like 'endless:%'
      group by 1
  )
  select jsonb_build_object(
    'levels', coalesce((
      select jsonb_object_agg(l.level_id,
        jsonb_build_object('stars', l.stars, 'hiscore', l.hiscore))
      from levels l
    ), '{}'::jsonb),
    'endless', coalesce((
      select jsonb_object_agg(e.category, e.hiscore)
      from endless e
      where e.category <> ''
    ), '{}'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_my_recorder_progress(text, uuid) to anon, authenticated;
