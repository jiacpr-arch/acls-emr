-- ===========================================================================
-- code_blue_scenarios — เก็บ "โจทย์" ของเกม Code Blue Simulator ที่แอดมินสร้าง/AI ร่าง
--   payload (jsonb) = Scenario object (story[], ...) แบบเดียวกับ src/data/scenarios/*.js
--   สถานะ: draft (AI ร่าง/ยังไม่ตรวจ) → published (คนคัดแล้ว เผยแพร่) | rejected
-- ความปลอดภัย: ผู้เรียนเห็นเฉพาะ status='published' (RLS public read กรองที่ status)
--              เขียน/ดูร่างได้เฉพาะ authenticated (แอดมิน)
-- มิเรอร์รูปแบบจาก recorder-cases.sql (PR #238)
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-12
--         as migration `code_blue_scenarios`. Kept here as documentation.
-- ===========================================================================

create table if not exists public.code_blue_scenarios (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  level       text not null default 'basic',           -- basic|intermediate|megacode
  course      text not null default 'acls',            -- acls|bls
  status      text not null default 'draft',           -- draft|published|rejected
  source      text not null default 'manual',          -- ai|manual|builtin
  payload     jsonb not null,                          -- Scenario object (story[], ...)
  admin_notes text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists code_blue_scenarios_status_idx
  on public.code_blue_scenarios (status, course, sort_order);

-- keep updated_at fresh on edits
create or replace function public.code_blue_scenarios_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists code_blue_scenarios_set_updated_at on public.code_blue_scenarios;
create trigger code_blue_scenarios_set_updated_at
  before update on public.code_blue_scenarios
  for each row execute function public.code_blue_scenarios_touch_updated_at();

-- ===== RLS =====
alter table public.code_blue_scenarios enable row level security;

-- ผู้เรียน (anon/authenticated) เห็นเฉพาะโจทย์ที่เผยแพร่แล้ว
drop policy if exists code_blue_scenarios_public_read on public.code_blue_scenarios;
create policy code_blue_scenarios_public_read
  on public.code_blue_scenarios for select
  using (status = 'published');

-- แอดมิน (authenticated) เขียน/อ่านร่างได้ทั้งหมด
-- (ใช้ variant จำกัดด้วย email allowlist ได้แบบเดียวกับ video-lessons-tighten-rls.sql
--  ให้ตรงกับ api/_lib/requireAdmin.js)
drop policy if exists code_blue_scenarios_admin_all on public.code_blue_scenarios;
create policy code_blue_scenarios_admin_all
  on public.code_blue_scenarios for all
  to authenticated
  using (true)
  with check (true);
