-- ขยาย acls_images ให้รองรับสื่อของคลังความรู้ BLS (/bls/knowledge, 9 บท)
-- parent_type ใหม่: 'bls-knowledge-section' (รูป), 'bls-knowledge-video' (วิดีโอ)
-- parent_id สังเคราะห์: '<chapterId>:<sectionIndex>' เช่น 'bls-ch1:0', 'bls-ch3:2'
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
    'bls-guide-step'::text, 'bls-guide-video'::text,
    'bls-knowledge-section'::text, 'bls-knowledge-video'::text
  ]));
