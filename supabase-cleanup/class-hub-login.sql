-- Per-class "log in with the JIA account before the exam" (Phase 14 of the JIA Hub rollout).
-- Shared by acls-emr and bls-hcp-app (same project, elyyijlcjfvhxbpzscnv). Additive only: one
-- nullable-free column that defaults to off (so no class changes behaviour) and three new RPCs —
-- no existing table, RPC or course_mode value is renamed or redefined.
--
-- The teacher switches it on from the instructor dashboard (instructor code; legacy classes without
-- one: the join code, same rule as every other instructor RPC). When it is on, the apps ask a
-- learner in that class to log in with their JIA account (Hub passport) and confirm it on this
-- device before the pre-test, the post-test and the certificate — so the class's results carry a
-- real, Hub-verified person (cohort_students.hub_user_id / exam_grades.hub_user_id) and reach the
-- Hub. The teacher sees who has linked an account (get_cohort_hub_links).

alter table public.cohort_classes
  add column if not exists require_hub_login boolean not null default false;

-- Anyone holding the class's join code or instructor code may read the rule (it is not a secret;
-- the learner's app needs it before the exam).
create or replace function public.get_class_exam_policy(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req boolean;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  select c.require_hub_login into v_req
    from cohort_classes c
   where (c.code = upper(trim(p_code)) or c.instructor_code = upper(trim(p_code)))
     and c.archived_at is null
   limit 1;
  if not found then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  return jsonb_build_object('requireHubLogin', coalesce(v_req, false));
end;
$$;

-- Instructor only.
create or replace function public.set_class_require_hub_login(p_code text, p_value boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_value is null then
    raise exception 'invalid_value' using errcode = 'P0001';
  end if;
  v_id := _cohort_resolve_class_instructor(p_code);
  update cohort_classes set require_hub_login = p_value where id = v_id;
  return jsonb_build_object('requireHubLogin', p_value);
end;
$$;

-- Instructor only: the roster rows (by pk) that are linked to a JIA account. Ids only — the
-- dashboard already has names from get_cohort_summary.
create or replace function public.get_cohort_hub_links(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  v_id := _cohort_resolve_class_instructor(p_code);
  return coalesce(
    (select jsonb_agg(s.id order by s.id) from cohort_students s
      where s.class_id = v_id and s.hub_user_id is not null),
    '[]'::jsonb);
end;
$$;

revoke all on function public.get_class_exam_policy(text) from public;
revoke all on function public.set_class_require_hub_login(text, boolean) from public;
revoke all on function public.get_cohort_hub_links(text) from public;
grant execute on function public.get_class_exam_policy(text) to anon, authenticated, service_role;
grant execute on function public.set_class_require_hub_login(text, boolean) to anon, authenticated, service_role;
grant execute on function public.get_cohort_hub_links(text) to anon, authenticated, service_role;
