-- ============================================================================
-- video_lessons: fill per-clip content (title, orientation, required flag,
-- key points markdown, chapter TOC, quiz, related link) for all 18 clips,
-- from the instructor's spreadsheet "ACLS คลิปวิดีโอ" (2026-07-05).
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-05
-- via SQL. Kept here as documentation / re-run reference.
--
-- Rows are matched by id (uuid), so re-running is idempotent.
-- youtube_id, topic, sort_order, start_sec/end_sec are intentionally
-- left untouched.
--
-- NOTE: related_path values (/airway/aw01, /ekg/ekg01, ...) come verbatim
-- from the spreadsheet; these routes do not exist in the app.
-- SUPERSEDED on 2026-07-05 by video-lessons-related-links.sql, which points
-- related_path/related_label at real /pre-course/pcNN chapters instead.
-- ============================================================================

begin;

update public.video_lessons set
  title = 'Airway 1 : การเปิดทางเดินหายใจ: Head tilt–chin lift / Jaw thrust',
  orientation = 'landscape',
  required = true,
  key_points = '- Head tilt–chin lift ใช้ในผู้ป่วยทั่วไป
- Jaw thrust ใช้เมื่อสงสัยบาดเจ็บกระดูกคอ
- ดูดเสมหะเมื่อมีสิ่งอุดกั้น
- ประเมินการหายใจหลังเปิดทางเดินหายใจเสมอ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "Head tilt-chin lift"}, {"t": 100, "label": "Jaw thrust"}, {"t": 160, "label": "เมื่อไหร่ใช้แบบใด"}, {"t": 210, "label": "การดูดเสมหะ"}]'::jsonb,
  quiz = '[{"id": "4ba4674c", "question": "ควรใช้ท่า Jaw thrust เมื่อใด?", "choices": [{"id": "a", "text": "เมื่อสงสัยบาดเจ็บกระดูกสันหลังส่วนคอ"}, {"id": "b", "text": "เมื่อผู้ป่วยรู้สึกตัวดี"}, {"id": "c", "text": "ห้ามใช้ในการช่วยชีวิต"}, {"id": "d", "text": "ผู้ป่วยทุกราย"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/airway/aw01',
  related_label = 'บทที่ 1'
where id = 'f57784c8-c0f3-488d-9485-e7c24d4bc649';

update public.video_lessons set
  title = 'Airway 2 : การช่วยหายใจด้วย Bag-Valve-Mask (BVM) แบบ 2 คน',
  orientation = 'portrait',
  required = true,
  key_points = '- เทคนิค 2 คนดีกว่า 1 คน (ครอบหน้ากากแนบสนิท)
- ใช้เทคนิค E-C clamp ครอบหน้ากาก
- บีบถุงช้า ~1 วินาที ให้ทรวงอกยกพอเห็น
- หลีกเลี่ยงการบีบแรง/เร็วเกินไป (ลดการเข้ากระเพาะและ hyperventilation)',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "อุปกรณ์ BVM"}, {"t": 90, "label": "เทคนิค E-C clamp"}, {"t": 160, "label": "การบีบถุงที่ถูกต้อง"}, {"t": 220, "label": "ข้อผิดพลาด"}]'::jsonb,
  quiz = '[{"id": "21c47286", "question": "เหตุใดการใช้ BVM แบบ 2 คนจึงดีกว่า?", "choices": [{"id": "a", "text": "ประหยัดออกซิเจน"}, {"id": "b", "text": "ครอบหน้ากากแนบสนิทและช่วยหายใจได้มีประสิทธิภาพกว่า"}, {"id": "c", "text": "ไม่ต้องเปิดทางเดินหายใจ"}, {"id": "d", "text": "ใช้เวลาน้อยกว่า"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/airway/aw02',
  related_label = 'บทที่ 2'
where id = 'e9ddcd7e-2682-4abc-97ff-ff5a5a8dc36f';

update public.video_lessons set
  title = 'Airway 3 : อุปกรณ์เสริมทางเดินหายใจ: OPA & NPA',
  orientation = 'landscape',
  required = false,
  key_points = '- OPA (oropharyngeal) ใช้ในผู้ป่วยไม่รู้สึกตัว ไม่มี gag reflex
- NPA (nasopharyngeal) ใช้ได้แม้ยังมี gag reflex เล็กน้อย
- วัดขนาดก่อนใส่ (OPA: มุมปากถึงติ่งหู)
- ใส่ผิดขนาดอาจดันลิ้นอุดกั้นทางเดินหายใจ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "OPA"}, {"t": 100, "label": "NPA"}, {"t": 160, "label": "การวัดขนาด"}, {"t": 210, "label": "ข้อควรระวัง"}]'::jsonb,
  quiz = '[{"id": "816687e3", "question": "OPA เหมาะกับผู้ป่วยแบบใด?", "choices": [{"id": "a", "text": "ทุกรายโดยไม่ต้องประเมิน"}, {"id": "b", "text": "ผู้ป่วยรู้สึกตัวดี"}, {"id": "c", "text": "ผู้ป่วยไม่รู้สึกตัวและไม่มี gag reflex"}, {"id": "d", "text": "ผู้ป่วยที่มีเลือดกำเดา"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/airway/aw03',
  related_label = 'บทที่ 3'
where id = '86da4935-c011-4798-b3ac-bcfab55a11dc';

update public.video_lessons set
  title = 'Airway 4 : ทางเดินหายใจขั้นสูง (ETT / Supraglottic Airway)',
  orientation = 'landscape',
  required = false,
  key_points = '- Advanced airway ได้แก่ ท่อช่วยหายใจ (ETT) และ supraglottic (เช่น LMA, i-gel)
- เมื่อใส่แล้ว: กดหน้าอกต่อเนื่อง ช่วยหายใจ 1 ครั้งทุก 6 วินาที (10 ครั้ง/นาที)
- ยืนยันตำแหน่งด้วย capnography (waveform) เสมอ
- ไม่ควรหยุดกดหน้าอกนานเพื่อใส่ท่อ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "ชนิดของ advanced airway"}, {"t": 120, "label": "การยืนยันตำแหน่ง"}, {"t": 180, "label": "อัตราการช่วยหายใจหลังใส่ท่อ"}, {"t": 240, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "f78196d9", "question": "หลังใส่ท่อช่วยหายใจแล้ว ควรช่วยหายใจอย่างไรระหว่าง CPR?", "choices": [{"id": "a", "text": "30:2 เหมือนเดิม"}, {"id": "b", "text": "ไม่ต้องช่วยหายใจ"}, {"id": "c", "text": "หยุดกดหน้าอกเพื่อช่วยหายใจ"}, {"id": "d", "text": "1 ครั้งทุก 6 วินาที โดยกดหน้าอกต่อเนื่อง"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/airway/aw04',
  related_label = 'บทที่ 4'
where id = '8a1feee4-dc13-4b9d-b016-1c81fe9d8693';

update public.video_lessons set
  title = 'Airway 5 : Capnography (EtCO2) ในการดูแลทางเดินหายใจ',
  orientation = 'landscape',
  required = false,
  key_points = '- Capnography วัดคาร์บอนไดออกไซด์ในลมหายใจออก (EtCO2)
- ใช้ยืนยันตำแหน่งท่อช่วยหายใจ (waveform ต่อเนื่อง)
- ประเมินคุณภาพ CPR และตรวจจับ ROSC (EtCO2 เพิ่มขึ้นฉับพลัน)
- ค่าปกติขณะหายใจ ~35-45 mmHg; ระหว่าง CPR ที่ดีควร >10 mmHg',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "EtCO2 คืออะไร"}, {"t": 110, "label": "ยืนยันตำแหน่งท่อ"}, {"t": 170, "label": "ประเมิน CPR & ROSC"}, {"t": 230, "label": "การแปลค่า"}]'::jsonb,
  quiz = '[{"id": "d6ba65ff", "question": "Capnography (EtCO2) ใช้ประโยชน์ในข้อใด?", "choices": [{"id": "a", "text": "ยืนยันตำแหน่งท่อช่วยหายใจและประเมินคุณภาพ CPR"}, {"id": "b", "text": "ตรวจน้ำตาลในเลือด"}, {"id": "c", "text": "แทนการช็อกไฟฟ้า"}, {"id": "d", "text": "วัดความดันเลือดโดยตรง"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/airway/aw05',
  related_label = 'บทที่ 5'
where id = '31ffa0b0-7262-45f6-a08e-3e8d3b7328d3';

update public.video_lessons set
  title = 'EKG 1 : พื้นฐานการอ่าน Rhythm Strip',
  orientation = 'landscape',
  required = true,
  key_points = '- วิเคราะห์: อัตรา สม่ำเสมอหรือไม่ มี P wave หรือไม่ ความกว้าง QRS
- แยก rhythm เร็ว/ช้า และ narrow/wide complex
- ประเมินผู้ป่วยควบคู่กับคลื่นไฟฟ้าหัวใจเสมอ (treat the patient, not the monitor)',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "ส่วนประกอบคลื่น P-QRS-T"}, {"t": 100, "label": "การนับอัตรา"}, {"t": 180, "label": "narrow vs wide"}, {"t": 240, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "04a58980", "question": "QRS ที่กว้าง (≥0.12 วินาที) บ่งชี้อะไร?", "choices": [{"id": "a", "text": "จังหวะจากไซนัสปกติ"}, {"id": "b", "text": "การนำไฟฟ้าผิดปกติ/มักมาจากเวนตริเคิล"}, {"id": "c", "text": "หัวใจหยุดเต้น"}, {"id": "d", "text": "คลื่นรบกวน"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/ekg/ekg01',
  related_label = 'บทที่ 1'
where id = '16aa9e8d-d04f-4d92-ad7e-2b3d3112f7e1';

update public.video_lessons set
  title = 'EKG 2 : Shockable Rhythms: VF & Pulseless VT',
  orientation = 'landscape',
  required = true,
  key_points = '- VF (Ventricular Fibrillation): คลื่นสั่นระส่ำ ไม่มี QRS ชัด
- Pulseless VT: QRS กว้างสม่ำเสมอ ไม่มีชีพจร
- ทั้งสองเป็น shockable — รักษาด้วยการช็อกไฟฟ้า (defibrillation) + CPR
- ยิ่งช็อกเร็ว โอกาสรอดยิ่งสูง',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "ลักษณะ VF"}, {"t": 100, "label": "ลักษณะ pulseless VT"}, {"t": 160, "label": "ทำไมต้องช็อก"}, {"t": 210, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "a392c3a7", "question": "ข้อใดเป็นจังหวะที่ต้องช็อกไฟฟ้า (shockable)?", "choices": [{"id": "a", "text": "Asystole"}, {"id": "b", "text": "PEA"}, {"id": "c", "text": "Ventricular Fibrillation (VF)"}, {"id": "d", "text": "Sinus bradycardia"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/ekg/ekg02',
  related_label = 'บทที่ 2'
where id = 'a151e109-ade2-496b-a832-4f25bff11f9d';

update public.video_lessons set
  title = 'EKG 3 : Non-shockable: Asystole & PEA',
  orientation = 'landscape',
  required = true,
  key_points = '- Asystole: ไม่มีกิจกรรมไฟฟ้า (เส้นแบน) — ยืนยันหลาย lead
- PEA: มีคลื่นไฟฟ้าแต่คลำชีพจรไม่ได้
- ทั้งสอง non-shockable — เน้น CPR คุณภาพสูง + Adrenaline + แก้ไขสาเหตุ (H''s & T''s)
- ห้ามช็อกไฟฟ้าในสองจังหวะนี้',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "Asystole"}, {"t": 100, "label": "PEA"}, {"t": 160, "label": "แนวทางการรักษา"}, {"t": 220, "label": "H''s & T''s"}]'::jsonb,
  quiz = '[{"id": "1d4faa9f", "question": "การรักษาหลักของ Asystole คือข้อใด?", "choices": [{"id": "a", "text": "Synchronized cardioversion"}, {"id": "b", "text": "Adenosine"}, {"id": "c", "text": "ช็อกไฟฟ้าทันที"}, {"id": "d", "text": "CPR คุณภาพสูง + Adrenaline + แก้สาเหตุ"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/ekg/ekg03',
  related_label = 'บทที่ 3'
where id = '055668cb-f4c2-4cbe-bf66-a8d0e78f2cd4';

update public.video_lessons set
  title = 'Defib 1 : Defibrillation พื้นฐาน & ความปลอดภัย',
  orientation = 'landscape',
  required = true,
  key_points = '- ใช้กับ VF และ pulseless VT เท่านั้น
- Biphasic 120-200 J (ตามเครื่อง), Monophasic 360 J
- ประกาศ ''ถอยห่าง'' (clear) ก่อนช็อกทุกครั้ง
- กดหน้าอกต่อทันทีหลังช็อก ไม่ต้องรอเช็คจังหวะ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "ข้อบ่งชี้"}, {"t": 90, "label": "ระดับพลังงาน"}, {"t": 150, "label": "ความปลอดภัย/clear"}, {"t": 210, "label": "กดต่อหลังช็อก"}]'::jsonb,
  quiz = '[{"id": "44e2d26e", "question": "หลังจากช็อกไฟฟ้าแล้วควรทำอะไรทันที?", "choices": [{"id": "a", "text": "กดหน้าอกต่อทันที"}, {"id": "b", "text": "ให้ยาทันที"}, {"id": "c", "text": "ช็อกซ้ำทันที"}, {"id": "d", "text": "เช็คชีพจร 1 นาที"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/defib/df01',
  related_label = 'บทที่ 1'
where id = 'bd6f9021-fc66-4c61-849b-624dbd30472d';

update public.video_lessons set
  title = 'Defib 2 : Synchronized Cardioversion',
  orientation = 'landscape',
  required = false,
  key_points = '- ใช้กับ tachycardia ที่มีชีพจรแต่ผู้ป่วยไม่คงที่
- เครื่องจะปล่อยพลังงานให้ตรงกับ R wave (sync)
- พลังงาน: narrow สม่ำเสมอ 50-100 J, AF 120-200 J, wide สม่ำเสมอ 100 J
- พิจารณายาระงับความรู้สึกถ้าผู้ป่วยรู้สึกตัว',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "ต่างจาก defibrillation อย่างไร"}, {"t": 100, "label": "ข้อบ่งชี้"}, {"t": 160, "label": "ระดับพลังงาน"}, {"t": 220, "label": "sedation"}]'::jsonb,
  quiz = '[{"id": "604a2745", "question": "Synchronized cardioversion ต่างจาก defibrillation อย่างไร?", "choices": [{"id": "a", "text": "ใช้พลังงานสูงกว่าเสมอ"}, {"id": "b", "text": "ปล่อยพลังงานให้ตรงกับ R wave"}, {"id": "c", "text": "ใช้กับ VF เท่านั้น"}, {"id": "d", "text": "ไม่ต้องใช้เครื่องช็อก"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/defib/df02',
  related_label = 'บทที่ 2'
where id = '799adb29-1d25-4b7c-a366-284f493f9803';

update public.video_lessons set
  title = 'Defib 3 : Vector Change Defibrillation (VF ดื้อการช็อก)',
  orientation = 'landscape',
  required = false,
  key_points = '- ใช้เมื่อ VF ยังคงอยู่หลังช็อกหลายครั้ง (refractory VF)
- เปลี่ยนตำแหน่ง/ทิศทางของแผ่นช็อก (เช่น anterior-posterior)
- อาจพิจารณา double sequential defibrillation ในบางสถานการณ์ (ยังเป็นทางเลือก)
- ควบคู่กับ CPR คุณภาพสูงและการแก้สาเหตุ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "refractory VF คืออะไร"}, {"t": 110, "label": "การเปลี่ยนตำแหน่งแผ่น"}, {"t": 180, "label": "double sequential"}, {"t": 240, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "8665c749", "question": "Vector change defibrillation หมายถึงอะไร?", "choices": [{"id": "a", "text": "เปลี่ยนผู้กดหน้าอก"}, {"id": "b", "text": "เพิ่มพลังงานเป็นสองเท่า"}, {"id": "c", "text": "เปลี่ยนตำแหน่ง/ทิศทางแผ่นช็อกในกรณี VF ดื้อการรักษา"}, {"id": "d", "text": "เปลี่ยนยา"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/defib/df03',
  related_label = 'บทที่ 3'
where id = '186d986e-a4cc-4723-bb32-1db642521163';

update public.video_lessons set
  title = 'Defib 4 : Transcutaneous Pacing (การกระตุ้นหัวใจผ่านผิวหนัง)',
  orientation = 'landscape',
  required = false,
  key_points = '- ใช้ใน bradycardia ที่มีอาการและไม่ตอบสนองต่อ Atropine
- ตั้งอัตรา ~60-80 ครั้ง/นาที เพิ่ม output จนเห็น electrical & mechanical capture
- ยืนยัน capture ด้วยชีพจรที่คลำได้
- พิจารณายาระงับปวด/ความรู้สึกเพราะเจ็บ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "ข้อบ่งชี้"}, {"t": 110, "label": "การตั้งค่า"}, {"t": 170, "label": "การยืนยัน capture"}, {"t": 230, "label": "การบรรเทาความเจ็บ"}]'::jsonb,
  quiz = '[{"id": "f79fb796", "question": "Transcutaneous pacing ใช้ในกรณีใด?", "choices": [{"id": "a", "text": "Asystole เสมอ"}, {"id": "b", "text": "SVT"}, {"id": "c", "text": "VF"}, {"id": "d", "text": "Bradycardia ที่มีอาการและไม่ตอบสนองต่อ Atropine"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/defib/df04',
  related_label = 'บทที่ 4'
where id = 'b8ff6f12-045d-4c86-9e5f-438ef2bd0295';

update public.video_lessons set
  title = 'Bradycardia 1 : Bradycardia Algorithm',
  orientation = 'landscape',
  required = true,
  key_points = '- อัตรา <50-60 ครั้ง/นาที ที่ทำให้เกิดอาการ
- ประเมินสัญญาณไม่คงที่: ความดันต่ำ ซึม เจ็บอก หัวใจล้มเหลว
- ลำดับ: Atropine 1 mg → pacing หรือ dopamine/epinephrine drip
- หาสาเหตุร่วม (ยา, ขาดออกซิเจน, เกลือแร่ผิดปกติ)',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "นิยาม symptomatic brady"}, {"t": 110, "label": "สัญญาณไม่คงที่"}, {"t": 170, "label": "ลำดับการรักษา"}, {"t": 240, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "127808d4", "question": "ยาตัวแรกใน symptomatic bradycardia คือ?", "choices": [{"id": "a", "text": "Atropine"}, {"id": "b", "text": "Amiodarone"}, {"id": "c", "text": "Adrenaline 1 mg push"}, {"id": "d", "text": "Adenosine"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/brady/br01',
  related_label = 'บทที่ 1'
where id = '454c97f1-aa8a-43db-a02d-d362a004f3e6';

update public.video_lessons set
  title = 'Bradycardia 2 : เมื่อ Atropine ไม่ได้ผล: Pacing & ยา Drip',
  orientation = 'landscape',
  required = false,
  key_points = '- ถ้า Atropine ไม่ได้ผล → transcutaneous pacing
- หรือ dopamine 5-20 mcg/kg/min / epinephrine 2-10 mcg/min
- เตรียม transvenous pacing หากจำเป็น
- ปรึกษาผู้เชี่ยวชาญ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "pacing"}, {"t": 110, "label": "dopamine drip"}, {"t": 170, "label": "epinephrine drip"}, {"t": 230, "label": "การส่งต่อ"}]'::jsonb,
  quiz = '[{"id": "3faa605c", "question": "หาก Atropine ไม่ได้ผลใน bradycardia ควรทำอะไรต่อ?", "choices": [{"id": "a", "text": "ช็อกไฟฟ้า"}, {"id": "b", "text": "Transcutaneous pacing หรือยา drip (dopamine/epinephrine)"}, {"id": "c", "text": "Adenosine"}, {"id": "d", "text": "หยุดการรักษา"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/brady/br02',
  related_label = 'บทที่ 2'
where id = '11fe23c7-c445-49e3-9181-1bf2fd921154';

update public.video_lessons set
  title = 'Tachycardia 1 : Tachycardia Algorithm ภาพรวม',
  orientation = 'landscape',
  required = true,
  key_points = '- อัตรา >150 ครั้ง/นาที มักทำให้เกิดอาการ
- ประเมินว่าคงที่หรือไม่คงที่
- ไม่คงที่ → synchronized cardioversion ทันที
- คงที่ → แยก narrow/wide และรักษาตามชนิด',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "นิยาม"}, {"t": 110, "label": "stable vs unstable"}, {"t": 170, "label": "แนวทางตามชนิด"}, {"t": 240, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "335f99d0", "question": "ผู้ป่วย tachycardia ที่ไม่คงที่ (มีอาการรุนแรง) ควรรักษาอย่างไร?", "choices": [{"id": "a", "text": "Atropine"}, {"id": "b", "text": "Adenosine เท่านั้น"}, {"id": "c", "text": "Synchronized cardioversion"}, {"id": "d", "text": "รอสังเกตอาการ"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/tachy/ta01',
  related_label = 'บทที่ 1'
where id = '4a7ac653-ce5c-405b-ae45-27fb232f76d3';

update public.video_lessons set
  title = 'Tachycardia 2 : Stable SVT: Vagal Maneuver & Adenosine',
  orientation = 'landscape',
  required = false,
  key_points = '- SVT คงที่ ชนิด narrow สม่ำเสมอ
- เริ่มด้วย vagal maneuver (เช่น Valsalva)
- ถ้าไม่ได้ผล ให้ Adenosine 6 mg แล้ว 12 mg
- ถ้ายังไม่ได้ผล พิจารณายาควบคุมอัตรา/ปรึกษาผู้เชี่ยวชาญ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "vagal maneuver"}, {"t": 110, "label": "Adenosine"}, {"t": 170, "label": "ทางเลือกอื่น"}, {"t": 220, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "af98d9ba", "question": "ขั้นแรกในการรักษา stable SVT คือข้อใด?", "choices": [{"id": "a", "text": "Defibrillation"}, {"id": "b", "text": "Atropine"}, {"id": "c", "text": "Synchronized cardioversion"}, {"id": "d", "text": "Vagal maneuver"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/tachy/ta02',
  related_label = 'บทที่ 2'
where id = 'f88ba57a-c09c-405c-a6b1-65ca2135ecaa';

update public.video_lessons set
  title = 'Cardiac Arrest 1 : ภาพรวม Cardiac Arrest Algorithm',
  orientation = 'landscape',
  required = true,
  key_points = '- เริ่ม CPR ทันที ให้ออกซิเจน ต่อ monitor
- แยกจังหวะเป็น shockable / non-shockable
- วนรอบทุก 2 นาที: เช็คจังหวะ–ช็อก(ถ้ามี)–CPR–ยา
- มองหาและแก้ไข H''s & T''s ตลอดเวลา',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 50, "label": "เริ่ม CPR & monitor"}, {"t": 120, "label": "แยก shockable/non-shockable"}, {"t": 210, "label": "วงจร 2 นาที"}, {"t": 300, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "67fa7bb0", "question": "ควรเช็คจังหวะหัวใจซ้ำทุกกี่นาทีในระหว่างช่วยชีวิต?", "choices": [{"id": "a", "text": "ทุก 2 นาที"}, {"id": "b", "text": "ทุก 5 นาที"}, {"id": "c", "text": "ทุก 10 นาที"}, {"id": "d", "text": "ทุก 30 วินาที"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/arrest/ca01',
  related_label = 'บทที่ 1'
where id = '1315c67f-c83a-40d3-8e36-5b849b5d165e';

update public.video_lessons set
  title = 'BLS 1 : ทบทวน BLS: การกดหน้าอกคุณภาพสูง',
  orientation = 'landscape',
  required = true,
  key_points = '- ตรวจการตอบสนอง เรียกช่วยเหลือ คลำชีพจร ≤10 วินาที
- กดหน้าอกเร็ว 100-120 ครั้ง/นาที ลึก 5-6 ซม.
- ปล่อยให้ทรวงอกคืนตัวเต็มที่ (full recoil)
- ลดการหยุดกดหน้าอกให้น้อยที่สุด (CCF >60%)',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 30, "label": "ตรวจประเมิน"}, {"t": 80, "label": "ตำแหน่งและเทคนิคการกด"}, {"t": 160, "label": "อัตรา/ความลึก"}, {"t": 220, "label": "ข้อผิดพลาดที่พบบ่อย"}]'::jsonb,
  quiz = '[{"id": "1d624f09", "question": "อัตราการกดหน้าอกที่แนะนำคือเท่าใด?", "choices": [{"id": "a", "text": "80-100 ครั้ง/นาที"}, {"id": "b", "text": "100-120 ครั้ง/นาที"}, {"id": "c", "text": "มากกว่า 140 ครั้ง/นาที"}, {"id": "d", "text": "60-80 ครั้ง/นาที"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/cpr/bls01',
  related_label = 'บทที่ 1'
where id = 'a1295bf7-2af8-4763-9a89-0d57e48710e1';

commit;
