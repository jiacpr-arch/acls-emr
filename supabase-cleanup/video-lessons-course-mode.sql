-- แยก video_lessons ระหว่าง ACLS/BLS — ก่อนหน้านี้ตารางนี้ ACLS/BLS ใช้ร่วมกันโดยไม่มีคอลัมน์แยกโหมด
-- ทุก query ต้อง .eq('course_mode', 'acls'|'bls') ตามโหมดของ build
-- ไม่ต้องแก้ RLS — video_lessons_admin_write คุมด้วย admin-email allowlist อยู่แล้ว ไม่เกี่ยวกับ course_mode
--
-- Applied directly to emr-ai-clinic (elyyijlcjfvhxbpzscnv) via Supabase MCP.
-- DEFAULT 'acls' ทำให้ 51 แถวเดิม (เนื้อหา ACLS ทั้งหมด) ได้ course_mode='acls' อัตโนมัติ ไม่กระทบข้อมูลเดิม

alter table public.video_lessons
  add column if not exists course_mode text not null default 'acls';

alter table public.video_lessons
  drop constraint if exists video_lessons_course_mode_check;
alter table public.video_lessons
  add constraint video_lessons_course_mode_check check (course_mode in ('acls', 'bls'));
