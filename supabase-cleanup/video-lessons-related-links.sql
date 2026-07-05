-- ============================================================================
-- video_lessons: point related links (Block D) at real pre-course chapters.
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-05
-- via SQL. Kept here as documentation / re-run reference.
--
-- Supersedes the related_path/related_label values in
-- video-lessons-fill-content.sql: those came verbatim from the instructor's
-- spreadsheet (/airway/aw01, /ekg/ekg01, ...) but no such routes exist in the
-- app, so the "อ่านบทเรียนที่เกี่ยวข้อง" button led nowhere. Real reading
-- content lives at /pre-course/:lessonId (pc01–pc13, see
-- src/data/preCourseContent.js).
--
-- Mapping (clip → most relevant pre-course chapter):
--   airway ทั้ง 5 คลิป                → pc09 การจัดการทางเดินหายใจ
--   EKG 1 พื้นฐาน rhythm strip        → pc10 VF/pVT (มีเนื้อหาลักษณะ ECG)
--   EKG 2 shockable                   → pc10 VF/pVT
--   EKG 3 non-shockable               → pc11 PEA/Asystole
--   Defib 1 พื้นฐาน & ความปลอดภัย     → pc10 VF/pVT
--   Defib 2 synchronized cardioversion → pc07 หัวใจเต้นเร็ว
--   Defib 3 vector change (refractory VF) → pc10 VF/pVT
--   Defib 4 transcutaneous pacing     → pc06 หัวใจเต้นช้า
--   Bradycardia ทั้ง 2 คลิป           → pc06 หัวใจเต้นช้า
--   Tachycardia ทั้ง 2 คลิป           → pc07 หัวใจเต้นเร็ว
--   Cardiac Arrest 1 ภาพรวม algorithm → pc10 VF/pVT (บทแรกของ arrest)
--   BLS 1 การกดหน้าอกคุณภาพสูง        → pc02 การประเมินผู้ป่วย (BLS Assessment)
-- ============================================================================

begin;

update public.video_lessons
set related_path = '/pre-course/pc09',
    related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where topic = 'airway';

-- EKG 1, EKG 2, Defib 1, Defib 3, Cardiac Arrest 1
update public.video_lessons
set related_path = '/pre-course/pc10',
    related_label = 'บทที่ 10: ภาวะหัวใจหยุดเต้น VF/pVT (Shockable)'
where id in (
  '16aa9e8d-d04f-4d92-ad7e-2b3d3112f7e1',
  'a151e109-ade2-496b-a832-4f25bff11f9d',
  'bd6f9021-fc66-4c61-849b-624dbd30472d',
  '186d986e-a4cc-4723-bb32-1db642521163',
  '1315c67f-c83a-40d3-8e36-5b849b5d165e'
);

-- EKG 3
update public.video_lessons
set related_path = '/pre-course/pc11',
    related_label = 'บทที่ 11: ภาวะหัวใจหยุดเต้น PEA/Asystole'
where id = '055668cb-f4c2-4cbe-bf66-a8d0e78f2cd4';

-- Defib 2, Tachycardia 1, Tachycardia 2
update public.video_lessons
set related_path = '/pre-course/pc07',
    related_label = 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร'
where id in (
  '799adb29-1d25-4b7c-a366-284f493f9803',
  '4a7ac653-ce5c-405b-ae45-27fb232f76d3',
  'f88ba57a-c09c-405c-a6b1-65ca2135ecaa'
);

-- Defib 4, Bradycardia 1, Bradycardia 2
update public.video_lessons
set related_path = '/pre-course/pc06',
    related_label = 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร'
where id in (
  'b8ff6f12-045d-4c86-9e5f-438ef2bd0295',
  '454c97f1-aa8a-43db-a02d-d362a004f3e6',
  '11fe23c7-c445-49e3-9181-1bf2fd921154'
);

-- BLS 1
update public.video_lessons
set related_path = '/pre-course/pc02',
    related_label = 'บทที่ 2: การประเมินผู้ป่วยอย่างเป็นระบบ'
where id = 'a1295bf7-2af8-4763-9a89-0d57e48710e1';

commit;
