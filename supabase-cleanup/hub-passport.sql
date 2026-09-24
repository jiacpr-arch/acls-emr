-- =====================================================
-- Migration: hub_passport_link
-- Target project: elyyijlcjfvhxbpzscnv (emr-ai-clinic) — shared by acls-emr and bls-hcp-app
-- Status: APPLIED 24 ก.ย. 2569 (migration hub_passport_link) — verified: columns present, existing rows untouched
--
-- Optional "log in with a JIA account" (the Hub, class.jiacpr.com — repo jia-learning-hub,
-- docs/unified-identity.md). A student who logs in there gets a signed passport; the app's own
-- server (api/passport/*, bls-hcp-app src/app/api/passport/*) verifies it and records which real
-- person a roster row / certificate belongs to. hub_user_id is the Hub's auth user id (the
-- passport's `sub`) — a different Supabase project, so it is a plain uuid with no foreign key.
--
-- Purely additive, nullable columns: every existing row, RPC and client keeps working unchanged.
-- Written only by the server routes with the service role, after verifying the passport — never
-- by the class-code RPCs (join_class etc.) that anyone with a class code can call. RLS on both
-- tables is unchanged (cohort_students: no direct client access; certificates: service role only).
-- =====================================================

alter table public.cohort_students add column if not exists hub_user_id uuid;
alter table public.cohort_students add column if not exists hub_bound_at timestamptz;

-- One JIA account = at most one roster row per class (a second device/student id for the same
-- person in the same class is refused by /api/passport/bind with reason account_in_use).
create unique index if not exists cohort_students_class_hub_user_uidx
  on public.cohort_students (class_id, hub_user_id)
  where hub_user_id is not null;

alter table public.certificates add column if not exists hub_user_id uuid;
create index if not exists certificates_hub_user_idx
  on public.certificates (hub_user_id)
  where hub_user_id is not null;

-- Undo (only if nothing reads these yet):
--   drop index if exists public.certificates_hub_user_idx;
--   alter table public.certificates drop column if exists hub_user_id;
--   drop index if exists public.cohort_students_class_hub_user_uidx;
--   alter table public.cohort_students drop column if exists hub_bound_at;
--   alter table public.cohort_students drop column if exists hub_user_id;
