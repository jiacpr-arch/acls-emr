-- ===========================================================================
-- video_lessons — ตารางเก็บ "วิดีโอบทเรียน" (ACLS) จัดการผ่านหน้าแอดมิน
--   วิดีโออยู่บน YouTube → เก็บแค่ youtube_id (ไม่ใช้ storage)
--   เนื้อหาประกอบ 4 บล็อก: key_points (สรุป), chapters (สารบัญ), quiz (ควิซ), related_* (ลิงก์)
-- รูปแบบ RLS: public อ่านได้ / เขียนได้เฉพาะ authenticated (แอดมิน) — เหมือน acls_chapters
-- รันบน Supabase SQL editor หรือ supabase db push ก่อนใช้งานฟีเจอร์
-- ===========================================================================

create table if not exists public.video_lessons (
  id            uuid primary key default gen_random_uuid(),
  topic         text not null,                       -- ดู VIDEO_TOPICS ใน src/data/videoTopics.js
  title         text not null,
  youtube_id    text not null,                       -- 11 ตัวอักษร
  orientation   text not null default 'portrait',    -- 'portrait' | 'landscape'
  start_sec     integer,                             -- ตัดช่วง (null = ตั้งแต่ต้น)
  end_sec       integer,                             -- ตัดช่วง (null = จนจบ)
  required      boolean not null default true,       -- บังคับเพื่อใบประกาศนียบัตรหรือไม่
  key_points    text not null default '',            -- บล็อก B (markdown bullet)
  chapters      jsonb not null default '[]'::jsonb,  -- บล็อก A: [{ "t": seconds, "label": "..." }]
  quiz          jsonb not null default '[]'::jsonb,  -- บล็อก C: [{ "id","question","choices":[{"id","text"}],"correctId","explanation" }]
  related_path  text,                                -- บล็อก D: route ภายในแอป เช่น /pre-course/pc09
  related_label text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists video_lessons_topic_sort_idx
  on public.video_lessons (topic, sort_order);

-- keep updated_at fresh on edits
create or replace function public.video_lessons_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists video_lessons_set_updated_at on public.video_lessons;
create trigger video_lessons_set_updated_at
  before update on public.video_lessons
  for each row execute function public.video_lessons_touch_updated_at();

-- ===== RLS =====
alter table public.video_lessons enable row level security;

drop policy if exists video_lessons_public_read on public.video_lessons;
create policy video_lessons_public_read
  on public.video_lessons for select
  using (true);

drop policy if exists video_lessons_admin_write on public.video_lessons;
create policy video_lessons_admin_write
  on public.video_lessons for all
  to authenticated
  using (true)
  with check (true);
