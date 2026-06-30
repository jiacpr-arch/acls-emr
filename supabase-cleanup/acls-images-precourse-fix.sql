-- ===========================================================================
-- acls_images — รองรับสื่อ pre-course (รูป/วิดีโอ) ที่ผูกกับ "read step"
--
-- ปัญหาเดิม: parent_id เป็น type uuid แต่สื่อ pre-course ใช้ id ของ read step
--   เป็นสตริง เช่น 'pc01-r0' (ดู src/services/precourseImageService.js)
--   → อัปโหลดรูป/เพิ่มวิดีโอแล้วล้มเหลวด้วย
--     "invalid input syntax for type uuid: \"pc01-r0\""
--   อีกทั้ง CHECK constraint อนุญาตเฉพาะ section/qa/precourse-step
--   ยังขาด 'precourse-video' ที่ addPreCourseVideo() ใช้
--
-- การแก้: เปลี่ยน parent_id เป็น text (โพลีมอร์ฟิก ไม่มี FK อยู่แล้ว — แค่ index
--   idx_acls_images_parent) และเพิ่ม 'precourse-video' ใน CHECK constraint
-- รันบน Supabase SQL editor หรือ supabase db push
-- ===========================================================================

alter table public.acls_images
  alter column parent_id type text using parent_id::text;

alter table public.acls_images
  drop constraint if exists acls_images_parent_type_check;

alter table public.acls_images
  add constraint acls_images_parent_type_check
  check (parent_type = any (array['section'::text, 'qa'::text, 'precourse-step'::text, 'precourse-video'::text]));
