-- ===========================================================================
-- code_blue_characters — ตัวละครที่แอดมินสร้างเองสำหรับเกม Code Blue
--   poses (jsonb) = { idle: url, talk: url, panic: url, stern: url, happy: url }
--   รูปอัปโหลดเข้า storage bucket 'acls-images' (path: code-blue-characters/...)
--   char_key = slug ที่โจทย์อ้างถึง (who) — unique
-- ความปลอดภัย: ผู้เรียนอ่านได้ทั้งหมด (ตัวละครไม่ใช่ความลับ), แอดมิน (authenticated) เขียนได้
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-12
--         as migration `code_blue_characters`. Kept here as documentation.
-- ===========================================================================

create table if not exists public.code_blue_characters (
  id          uuid primary key default gen_random_uuid(),
  char_key    text not null unique,                    -- slug ที่โจทย์อ้าง (who)
  name        text not null,
  role        text,
  plate_from  text default '#405089',                  -- สี nameplate (บน)
  plate_to    text default '#232F5E',                  -- สี nameplate (ล่าง)
  poses       jsonb not null default '{}'::jsonb,       -- { pose: image_url }
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.code_blue_characters_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists code_blue_characters_set_updated_at on public.code_blue_characters;
create trigger code_blue_characters_set_updated_at
  before update on public.code_blue_characters
  for each row execute function public.code_blue_characters_touch_updated_at();

alter table public.code_blue_characters enable row level security;

drop policy if exists code_blue_characters_public_read on public.code_blue_characters;
create policy code_blue_characters_public_read
  on public.code_blue_characters for select
  using (true);

drop policy if exists code_blue_characters_admin_all on public.code_blue_characters;
create policy code_blue_characters_admin_all
  on public.code_blue_characters for all
  to authenticated
  using (true)
  with check (true);
