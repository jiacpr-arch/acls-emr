-- ขยาย acls_images ให้รองรับสื่อของ 3 หน้า Guide BLS (AED / Algorithm / Choking)
-- parent_type ใหม่: 'bls-guide-step' (รูป), 'bls-guide-video' (วิดีโอ)
-- parent_id สังเคราะห์: '<page>:<key>' เช่น 'aed:1', 'algorithm:adult', 'choking:unconscious'
-- ไม่ต้องเพิ่ม RLS policy — acls_images_admin_write (FOR ALL TO authenticated USING (true) WITH CHECK (true))
-- ครอบคลุมทุก parent_type อยู่แล้ว
--
-- Applied directly to emr-ai-clinic (elyyijlcjfvhxbpzscnv) via Supabase MCP.

alter table public.acls_images
  drop constraint if exists acls_images_parent_type_check;

alter table public.acls_images
  add constraint acls_images_parent_type_check
  check (parent_type = any (array[
    'section'::text, 'qa'::text, 'precourse-step'::text, 'precourse-video'::text,
    'bls-guide-step'::text, 'bls-guide-video'::text
  ]));
