-- ===========================================================================
-- recorder_cases — เก็บ "เคส" ของเกม Recorder Hero ที่แอดมินสร้าง/AI ร่าง
--   payload (jsonb) = Case object (initialScene, events[], ...) แบบเดียวกับ src/data/recorderCases.js
--   สถานะ: draft (AI ร่าง/ยังไม่ตรวจ) → published (คนคัดแล้ว เผยแพร่) | rejected
-- ความปลอดภัย: ผู้เรียนเห็นเฉพาะ status='published' (RLS public read กรองที่ status)
--              เขียน/ดูร่างได้เฉพาะ authenticated (แอดมิน)
-- รันบน Supabase SQL editor หรือ supabase db push ก่อนใช้งานฟีเจอร์
-- ===========================================================================

create table if not exists public.recorder_cases (
  id          uuid primary key default gen_random_uuid(),
  title_th    text not null,
  category    text not null default 'cardiac_arrest',  -- cardiac_arrest|bradycardia|tachycardia|mi|stroke|special
  difficulty  text not null default 'basic',           -- basic|intermediate|advanced
  status      text not null default 'draft',           -- draft|published|rejected
  source      text not null default 'manual',          -- ai|manual|builtin
  payload     jsonb not null,                          -- Case object
  admin_notes text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists recorder_cases_status_idx
  on public.recorder_cases (status, category, sort_order);

-- keep updated_at fresh on edits
create or replace function public.recorder_cases_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists recorder_cases_set_updated_at on public.recorder_cases;
create trigger recorder_cases_set_updated_at
  before update on public.recorder_cases
  for each row execute function public.recorder_cases_touch_updated_at();

-- ===== RLS =====
alter table public.recorder_cases enable row level security;

-- ผู้เรียน (anon/authenticated) เห็นเฉพาะเคสที่เผยแพร่แล้ว
drop policy if exists recorder_cases_public_read on public.recorder_cases;
create policy recorder_cases_public_read
  on public.recorder_cases for select
  using (status = 'published');

-- แอดมิน (authenticated) เขียน/อ่านร่างได้ทั้งหมด
-- (ใช้ variant จำกัดด้วย email allowlist ได้แบบเดียวกับ video-lessons-tighten-rls.sql
--  ให้ตรงกับ api/_lib/requireAdmin.js)
drop policy if exists recorder_cases_admin_all on public.recorder_cases;
create policy recorder_cases_admin_all
  on public.recorder_cases for all
  to authenticated
  using (true)
  with check (true);
