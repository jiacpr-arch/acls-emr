-- ============================================================================
-- video_lessons: fill v3 — add the 4 new "ยา (IV)" drug clips from the
-- instructor's spreadsheet "ACLS_clips.xlsx". Completes the work deferred in
-- video-lessons-fill-content-v2.sql, whose header noted:
--   "NOT covered here (pending YouTube links): 4 new 'ยา (IV)' clips
--    (Adrenaline / Adenosine / Atropine / Cordarone)".
--
-- The topic id 'iv' already exists in src/data/videoTopics.js. key_points
-- (markdown), chapters (สารบัญช่วงเวลา / timestamps) and quiz are copied
-- verbatim from the spreadsheet; timestamps are converted mm:ss → seconds.
--
-- related_path: the spreadsheet's own "/iv/adrenaline" style paths are NOT
-- real app routes (same issue video-lessons-related-links.sql fixed for the
-- other clips), so all 4 point at /pre-course/pc13 "เภสัชวิทยาใน ACLS".
--
-- STATUS: NOT YET APPLIED. youtube_id is a placeholder for each clip
-- (__YT_*__). Replace the 4 placeholders with the real 11-char YouTube ids,
-- then run once on emr-ai-clinic (elyyijlcjfvhxbpzscnv). The inserts are
-- guarded by title so re-running does not create duplicates.
-- ============================================================================

begin;

insert into public.video_lessons
  (topic, title, youtube_id, orientation, start_sec, end_sec, required,
   key_points, chapters, quiz, related_path, related_label, sort_order)
select
  'iv',
  'IV 1 : การเปิดเส้น IV & ให้ยา Adrenaline (Epinephrine)',
  '__YT_ADRENALINE__',   -- TODO: replace with real 11-char YouTube id
  'portrait',
  0, 301, true,
  '- การเปิดเส้นเลือด IV (รัดแขน–แทงเข็ม)
- Adrenaline (Epinephrine) 1 mg (1:10,000)
- ให้ทุก 3-5 นาทีในภาวะหัวใจหยุดเต้น
- ต่อ extension/stopcock และ flush น้ำเกลือ',
  '[{"t": 0, "label": "บทนำ"}, {"t": 20, "label": "รัดแขนและแทงเส้น IV"}, {"t": 100, "label": "เตรียมยา Adrenaline (1 mg/10 ml)"}, {"t": 160, "label": "ต่อ extension/stopcock"}, {"t": 220, "label": "การฉีด Adrenaline"}]'::jsonb,
  '[{"id": "iv01adre", "question": "ขนาด Adrenaline ในภาวะหัวใจหยุดเต้นคือ?", "choices": [{"id": "a", "text": "150 mg"}, {"id": "b", "text": "1 mg ทุก 3-5 นาที"}, {"id": "c", "text": "0.5 mg ครั้งเดียว"}, {"id": "d", "text": "6 mg"}], "correctId": "b", "explanation": ""}]'::jsonb,
  '/pre-course/pc13',
  'บทที่ 13: เภสัชวิทยาใน ACLS (Pharmacology)',
  1
where not exists (
  select 1 from public.video_lessons where title = 'IV 1 : การเปิดเส้น IV & ให้ยา Adrenaline (Epinephrine)'
);

insert into public.video_lessons
  (topic, title, youtube_id, orientation, start_sec, end_sec, required,
   key_points, chapters, quiz, related_path, related_label, sort_order)
select
  'iv',
  'IV 2 : การให้ยา Adenosine (ฉีดเร็ว + Flush)',
  '__YT_ADENOSINE__',   -- TODO: replace with real 11-char YouTube id
  'portrait',
  0, 148, false,
  '- Adenosine ออกฤทธิ์สั้นมาก ต้องฉีดเร็ว
- ขนาดแรก 6 mg ถ้าไม่ได้ผลให้ 12 mg
- ฉีดเร็วพร้อม flush น้ำเกลือทันที และยกแขนขึ้น
- ใช้ใน stable SVT',
  '[{"t": 0, "label": "บทนำ"}, {"t": 12, "label": "ลักษณะยา Adenosine (ออกฤทธิ์สั้นมาก)"}, {"t": 48, "label": "ขนาดยา (6 mg/12 mg)"}, {"t": 60, "label": "เทคนิคฉีดเร็ว + flush"}, {"t": 132, "label": "ยกแขนหลังฉีด"}]'::jsonb,
  '[{"id": "iv02aden", "question": "หลังฉีด Adenosine ควรทำอะไรทันที?", "choices": [{"id": "a", "text": "รอ 5 นาที"}, {"id": "b", "text": "ให้ยาซ้ำทันที"}, {"id": "c", "text": "flush น้ำเกลือเร็วและยกแขนขึ้น"}, {"id": "d", "text": "กดหน้าอก"}], "correctId": "c", "explanation": ""}]'::jsonb,
  '/pre-course/pc13',
  'บทที่ 13: เภสัชวิทยาใน ACLS (Pharmacology)',
  2
where not exists (
  select 1 from public.video_lessons where title = 'IV 2 : การให้ยา Adenosine (ฉีดเร็ว + Flush)'
);

insert into public.video_lessons
  (topic, title, youtube_id, orientation, start_sec, end_sec, required,
   key_points, chapters, quiz, related_path, related_label, sort_order)
select
  'iv',
  'IV 3 : การให้ยา Atropine',
  '__YT_ATROPINE__',   -- TODO: replace with real 11-char YouTube id
  'portrait',
  0, 130, false,
  '- Atropine ใช้ในหัวใจเต้นช้า (symptomatic bradycardia)
- ขนาด 1 mg ทุก 3-5 นาที (สูงสุด 3 mg)
- ฉีดเข้าเส้นแล้ว flush น้ำเกลือ
- ไม่ใช้ในภาวะหัวใจหยุดเต้น (asystole/PEA)',
  '[{"t": 0, "label": "บทนำ"}, {"t": 48, "label": "เตรียมยา Atropine"}, {"t": 72, "label": "ข้อบ่งใช้ (bradycardia)"}, {"t": 108, "label": "การฉีดและ flush"}]'::jsonb,
  '[{"id": "iv03atro", "question": "Atropine ใช้รักษาภาวะใด?", "choices": [{"id": "a", "text": "VF"}, {"id": "b", "text": "ความดันสูง"}, {"id": "c", "text": "หัวใจเต้นเร็ว"}, {"id": "d", "text": "หัวใจเต้นช้า (bradycardia)"}], "correctId": "d", "explanation": ""}]'::jsonb,
  '/pre-course/pc13',
  'บทที่ 13: เภสัชวิทยาใน ACLS (Pharmacology)',
  3
where not exists (
  select 1 from public.video_lessons where title = 'IV 3 : การให้ยา Atropine'
);

insert into public.video_lessons
  (topic, title, youtube_id, orientation, start_sec, end_sec, required,
   key_points, chapters, quiz, related_path, related_label, sort_order)
select
  'iv',
  'IV 4 : การให้ยา Cordarone (Amiodarone)',
  '__YT_CORDARONE__',   -- TODO: replace with real 11-char YouTube id
  'portrait',
  0, 165, false,
  '- Cordarone (Amiodarone) สำหรับ VF/VT และหัวใจเต้นเร็ว
- 1 หลอด = 150 mg
- ผสม/เจือจาง (dilute) ก่อนให้
- ฉีดช้าๆ แล้ว flush น้ำเกลือตาม',
  '[{"t": 0, "label": "บทนำ"}, {"t": 24, "label": "ขนาดยา Cordarone/Amiodarone (150 mg)"}, {"t": 60, "label": "เตรียมและ dilute"}, {"t": 120, "label": "ฉีดช้าๆ + flush"}]'::jsonb,
  '[{"id": "iv04cord", "question": "Cordarone (Amiodarone) 1 หลอดมีขนาดกี่ mg?", "choices": [{"id": "a", "text": "150 mg"}, {"id": "b", "text": "1 mg"}, {"id": "c", "text": "100 mg"}, {"id": "d", "text": "300 mg"}], "correctId": "a", "explanation": ""}]'::jsonb,
  '/pre-course/pc13',
  'บทที่ 13: เภสัชวิทยาใน ACLS (Pharmacology)',
  4
where not exists (
  select 1 from public.video_lessons where title = 'IV 4 : การให้ยา Cordarone (Amiodarone)'
);
commit;
