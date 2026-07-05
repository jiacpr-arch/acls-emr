-- ============================================================================
-- video_lessons: fill v2 — replace per-clip content for 17 clips with values
-- aligned to the ACTUAL videos, from the instructor's corrected spreadsheet
-- "ACLS_clips.xlsx" (2026-07-05). Supersedes the content values in
-- video-lessons-fill-content.sql and the related-link values in
-- video-lessons-related-links.sql.
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-07-05
-- via SQL. Kept here as documentation / re-run reference.
--
-- What changed vs v1:
--   * titles/key_points/chapters/quiz now describe the real footage
--     (v1 airway 2-5 content was shifted vs the actual uploads)
--   * chapters use real timestamps; start_sec=0 / end_sec=clip duration
--   * orientation = portrait (คลิปแนวตั้ง 9:16 ทั้งหมด)
--   * related links point at pre-course chapters matched to the NEW content
--     (e.g. EKG 2 is now brady/AV block → pc06)
--
-- NOT covered here (pending YouTube links from the instructor):
--   * 4 new "ยา (IV)" clips (Adrenaline / Adenosine / Atropine / Cordarone)
--     — topic id 'iv' was added to src/data/videoTopics.js in the same commit
--   * the existing BLS clip (youtube V1x8d0SohTw) is absent from the new
--     spreadsheet and was left untouched
-- ============================================================================

begin;

update public.video_lessons set
  title = 'Airway 1 : การเปิดทางเดินหายใจด้วยมือ: Head tilt–chin lift & Jaw thrust',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 253,
  required = true,
  key_points = '- เปิดทางเดินหายใจด้วยมือ 2 วิธีหลัก
- Head tilt–chin lift: มือวางหน้าผาก ยกคางขึ้น (ผู้ป่วยทั่วไป)
- Jaw thrust: ใช้เมื่อสงสัยบาดเจ็บกระดูกคอ
- ระวังกดใต้คาง/แหงนคอมากเกินไป',
  chapters = '[{"t": 0, "label": "บทนำ/คำชี้แจง"}, {"t": 40, "label": "สาเหตุการอุดตันทางเดินหายใจ (สิ่งแปลกปลอม/ลิ้นตก)"}, {"t": 100, "label": "วิธีทำ Head tilt–chin lift"}, {"t": 120, "label": "ข้อควรระวัง"}, {"t": 140, "label": "Jaw Thrust (สงสัยบาดเจ็บคอ)"}, {"t": 240, "label": "ถ้าไม่ดีขึ้นให้ใช้อุปกรณ์ช่วย"}]'::jsonb,
  quiz = '[{"id": "6da91268", "question": "ท่าใดใช้เปิดทางเดินหายใจเมื่อสงสัยบาดเจ็บกระดูกคอ?", "choices": [{"id": "a", "text": "Jaw thrust"}, {"id": "b", "text": "Head tilt–chin lift"}, {"id": "c", "text": "กดหน้าอก"}, {"id": "d", "text": "ให้ Adenosine"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc09',
  related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where id = 'f57784c8-c0f3-488d-9485-e7c24d4bc649';

update public.video_lessons set
  title = 'Airway 2 : OPA: อุปกรณ์เปิดทางเดินหายใจทางปาก',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 192,
  required = true,
  key_points = '- OPA = อุปกรณ์เปิดทางเดินหายใจทางปาก
- วัดขนาดให้พอดี (มุมปากถึงติ่งหู)
- ช่วยยกโคนลิ้นไม่ให้ตกปิดทางเดินหายใจ
- ใช้เฉพาะผู้ป่วยหมดสติ ไม่มี gag reflex',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 36, "label": "รู้จัก OPA"}, {"t": 48, "label": "การวัดขนาดให้พอดี"}, {"t": 72, "label": "หลักการทำงาน"}, {"t": 96, "label": "สาธิตวิธีใส่"}, {"t": 168, "label": "การช่วยหายใจหลังใส่"}, {"t": 180, "label": "ข้อควรระวัง (ใช้ไม่ได้ในคนที่รู้สึกตัว)"}]'::jsonb,
  quiz = '[{"id": "35c8baf6", "question": "OPA ใช้ไม่ได้กับผู้ป่วยแบบใด?", "choices": [{"id": "a", "text": "ผู้ป่วยที่ไม่มี gag reflex"}, {"id": "b", "text": "ผู้ป่วยที่ยังรู้สึกตัว/มี gag reflex"}, {"id": "c", "text": "ผู้ป่วยหมดสติ"}, {"id": "d", "text": "ผู้ป่วยหัวใจหยุดเต้น"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc09',
  related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where id = 'e9ddcd7e-2682-4abc-97ff-ff5a5a8dc36f';

update public.video_lessons set
  title = 'Airway 3 : NPA: อุปกรณ์เปิดทางเดินหายใจทางจมูก',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 236,
  required = false,
  key_points = '- NPA = อุปกรณ์เปิดทางเดินหายใจทางจมูก
- เลือกขนาดจากนิ้วก้อยของผู้ป่วย
- ใส่ตามแนวผนังจมูก
- ระวังในผู้ป่วยที่มีเลือดกำเดา/บาดเจ็บใบหน้า',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 12, "label": "รู้จัก NPA (ต่างจาก OPA)"}, {"t": 72, "label": "การเลือกขนาด (ใช้นิ้วก้อยผู้ป่วย)"}, {"t": 132, "label": "ข้อควรระวัง (เลือดกำเดา)"}, {"t": 156, "label": "วิธีใส่ (ตามแนวผนังจมูก)"}, {"t": 216, "label": "การยืนยันว่าใส่สำเร็จ"}]'::jsonb,
  quiz = '[{"id": "4555f8e0", "question": "เลือกขนาด NPA โดยเทียบกับอะไร?", "choices": [{"id": "a", "text": "อายุผู้ป่วย"}, {"id": "b", "text": "ความสูงของผู้ป่วย"}, {"id": "c", "text": "ขนาดนิ้วก้อยของผู้ป่วย"}, {"id": "d", "text": "น้ำหนักผู้ป่วย"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc09',
  related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where id = '86da4935-c011-4798-b3ac-bcfab55a11dc';

update public.video_lessons set
  title = 'Airway 4 : BVM: การช่วยหายใจด้วย Bag-Valve-Mask',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 763,
  required = true,
  key_points = '- ส่วนประกอบ: ถุงบีบ (resuscitator), ถุงเก็บอากาศ (reservoir), หน้ากาก
- วางหน้ากาก: ด้านแหลมที่จมูก ด้านป้านที่คาง
- ต่อออกซิเจนและตรวจ reservoir ก่อนใช้
- ขนาดถุง: ผู้ใหญ่ 1600-2000 ml, เด็ก 450-750 ml, ทารก 240 ml',
  chapters = '[{"t": 0, "label": "บทนำ Bag-Valve-Mask"}, {"t": 35, "label": "ส่วนประกอบ"}, {"t": 105, "label": "การวางหน้ากากให้ถูกตำแหน่ง"}, {"t": 245, "label": "หลักการอากาศเข้า & Reservoir"}, {"t": 350, "label": "ข้อควรระวัง/ตรวจอุปกรณ์"}, {"t": 455, "label": "เทคนิคครอบและบีบถุง"}, {"t": 595, "label": "ขนาดถุงเก็บอากาศ"}, {"t": 700, "label": "ทำร่วมกับ Jaw thrust"}]'::jsonb,
  quiz = '[{"id": "6b6aa73b", "question": "ขนาดถุงเก็บอากาศ (reservoir) สำหรับผู้ใหญ่ประมาณเท่าใด?", "choices": [{"id": "a", "text": "100 ml"}, {"id": "b", "text": "240 ml"}, {"id": "c", "text": "450-750 ml"}, {"id": "d", "text": "1600-2000 ml"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc09',
  related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where id = '8a1feee4-dc13-4b9d-b016-1c81fe9d8693';

update public.video_lessons set
  title = 'Airway 5 : การใส่ท่อช่วยหายใจ ETT (Endotracheal Intubation)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 987,
  required = false,
  key_points = '- การใส่ท่อช่วยหายใจ (advanced airway)
- ตรวจอุปกรณ์: laryngoscope, เบลด, ท่อ ETT, cuff
- ห้ามใส่ท่อเลย Murphy eye และวัด cuff pressure ให้เหมาะสม
- ต้อง sedate ก่อน และยืนยันตำแหน่งท่อ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 45, "label": "ตรวจอุปกรณ์ (laryngoscope/เบลด/ท่อ)"}, {"t": 135, "label": "ส่วนประกอบท่อ & Murphy eye"}, {"t": 180, "label": "การเช็ค cuff"}, {"t": 270, "label": "ข้อควรระวัง"}, {"t": 315, "label": "การใส่ท่อด้วย laryngoscope"}, {"t": 450, "label": "การ sedate ก่อนใส่ท่อ"}, {"t": 495, "label": "การยืนยันตำแหน่งท่อ"}, {"t": 540, "label": "การวัด cuff pressure"}, {"t": 720, "label": "ประโยชน์/ช่วยหายใจผ่านท่อ"}]'::jsonb,
  quiz = '[{"id": "e3c52a6d", "question": "ก่อนใส่ท่อช่วยหายใจในผู้ป่วยที่ยังมีปฏิกิริยา ควรทำอะไร?", "choices": [{"id": "a", "text": "ให้ยาระงับความรู้สึก (sedate)"}, {"id": "b", "text": "ให้ Adenosine"}, {"id": "c", "text": "ไม่ต้องเตรียมอะไร"}, {"id": "d", "text": "ช็อกไฟฟ้า"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc09',
  related_label = 'บทที่ 9: การจัดการทางเดินหายใจ'
where id = '31ffa0b0-7262-45f6-a08e-3e8d3b7328d3';

update public.video_lessons set
  title = 'EKG 1 : ภาพรวมการอ่าน EKG & หัวใจเต้นเร็ว (SVT/AF/VT)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 333,
  required = true,
  key_points = '- ทบทวนการอ่าน EKG อย่างเป็นระบบ
- SVT: QRS แคบ อัตราเร็วมาก คลื่น P มักไม่เห็น
- AF: ไม่มี P wave จังหวะไม่สม่ำเสมอ
- VT: QRS กว้าง — มีชีพจรใช้ synchronized, ไม่มีชีพจรใช้ defibrillation',
  chapters = '[{"t": 0, "label": "บทนำ/วัตถุประสงค์"}, {"t": 40, "label": "Normal Sinus Rhythm & การต่อ monitor"}, {"t": 200, "label": "Supraventricular Tachycardia (SVT)"}, {"t": 260, "label": "Atrial Fibrillation (AF)"}, {"t": 320, "label": "Ventricular Tachycardia (VT): มีชีพจร vs ไม่มีชีพจร"}]'::jsonb,
  quiz = '[{"id": "e1e301c5", "question": "SVT มีลักษณะ QRS อย่างไร?", "choices": [{"id": "a", "text": "เส้นแบน"}, {"id": "b", "text": "QRS แคบ อัตราเร็วมาก"}, {"id": "c", "text": "QRS กว้าง"}, {"id": "d", "text": "ไม่มี QRS"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc07',
  related_label = 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร'
where id = '16aa9e8d-d04f-4d92-ad7e-2b3d3112f7e1';

update public.video_lessons set
  title = 'EKG 2 : หัวใจเต้นช้า & AV Block (Mobitz II)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 400,
  required = true,
  key_points = '- จังหวะหัวใจเต้นช้าและ AV block
- ดูความสัมพันธ์ของ P wave กับ QRS
- Mobitz II: PR คงที่แต่มี beat หลุดกระทันหัน อันตราย
- มักต้องใช้ pacemaker',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "ลักษณะจังหวะเต้นช้า (P wave/QRS แคบ)"}, {"t": 160, "label": "Low grade AV block"}, {"t": 200, "label": "Mobitz II (อันตราย ต้อง pacemaker)"}, {"t": 280, "label": "ฝึกอ่าน EKG"}]'::jsonb,
  quiz = '[{"id": "af656fd7", "question": "AV block ชนิด Mobitz II มีความสำคัญอย่างไร?", "choices": [{"id": "a", "text": "ไม่อันตราย"}, {"id": "b", "text": "หายได้เอง"}, {"id": "c", "text": "อันตราย มักต้องใช้ pacemaker"}, {"id": "d", "text": "รักษาด้วย Adenosine"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc06',
  related_label = 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร'
where id = 'a151e109-ade2-496b-a832-4f25bff11f9d';

update public.video_lessons set
  title = 'EKG 3 : ฝึกอ่านจังหวะจริง: แยกมีชีพจร/ไม่มีชีพจร',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 328,
  required = true,
  key_points = '- ฝึกอ่าน rhythm strip จริงหลายแบบ
- แยกจังหวะ ''มีชีพจร'' กับ ''ไม่มีชีพจร''
- จังหวะไม่มีชีพจร (VF/VT) ต้อง CPR + ช็อกไฟฟ้า
- ประเมินผู้ป่วยควบคู่กับ monitor เสมอ',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 60, "label": "ฝึกอ่านจังหวะที่มีชีพจร"}, {"t": 100, "label": "จังหวะไม่มีชีพจร (VF/VT)"}, {"t": 200, "label": "ฝึกแยกแยะต่อเนื่อง"}, {"t": 300, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "7045d5ec", "question": "จังหวะที่ ''ไม่มีชีพจร'' เช่น VF/VT ต้องทำอย่างไร?", "choices": [{"id": "a", "text": "ให้ยาลดความดัน"}, {"id": "b", "text": "รอดูอาการ"}, {"id": "c", "text": "สังเกตอาการ"}, {"id": "d", "text": "เริ่ม CPR และช็อกไฟฟ้า"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc10',
  related_label = 'บทที่ 10: ภาวะหัวใจหยุดเต้น VF/pVT (Shockable)'
where id = '055668cb-f4c2-4cbe-bf66-a8d0e78f2cd4';

update public.video_lessons set
  title = 'Defib 1 : การใช้ Monitor & การติด Lead',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 207,
  required = true,
  key_points = '- การใช้เครื่อง monitor และการติด lead
- ติดสาย/แผ่นบนตัวผู้ป่วยให้ถูกตำแหน่ง
- เลือก lead มาตรฐาน (Lead II) เพื่อดูจังหวะ
- การขยับตัวทำให้เกิดสัญญาณรบกวน',
  chapters = '[{"t": 0, "label": "บทนำ/ความสำคัญของ monitor"}, {"t": 48, "label": "เริ่มเรื่อง monitor"}, {"t": 84, "label": "การติด lead (LL/LA)"}, {"t": 156, "label": "การเลือก lead (มาตรฐาน Lead II)"}, {"t": 192, "label": "สัญญาณรบกวนเมื่อผู้ป่วยขยับ"}]'::jsonb,
  quiz = '[{"id": "851ab895", "question": "lead มาตรฐานที่ใช้ดูจังหวะหัวใจคือ?", "choices": [{"id": "a", "text": "Lead II"}, {"id": "b", "text": "V6"}, {"id": "c", "text": "ไม่มีมาตรฐาน"}, {"id": "d", "text": "Lead aVR"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc02',
  related_label = 'บทที่ 2: การประเมินผู้ป่วยอย่างเป็นระบบ'
where id = 'bd6f9021-fc66-4c61-849b-624dbd30472d';

update public.video_lessons set
  title = 'Defib 2 : การช็อกไฟฟ้า (Defibrillation) ด้วย Paddle',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 91,
  required = true,
  key_points = '- การช็อกไฟฟ้าด้วย paddle
- ทาเจลและวางแพดเดิลตำแหน่ง Sternum–Apex
- ชาร์จพลังงานแล้วประกาศให้ทุกคนถอยห่าง
- ใช้กับ VF และ pulseless VT',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 12, "label": "เตรียมเครื่องและทาเจล"}, {"t": 48, "label": "ตำแหน่งวางแพดเดิล (Sternum–Apex)"}, {"t": 60, "label": "ชาร์จและประกาศถอยห่าง"}, {"t": 72, "label": "การปล่อยช็อก"}]'::jsonb,
  quiz = '[{"id": "ef53d68d", "question": "ก่อนปล่อยกระแสไฟฟ้าต้องทำอะไร?", "choices": [{"id": "a", "text": "ให้ยา"}, {"id": "b", "text": "ประกาศให้ทุกคนถอยห่าง (clear)"}, {"id": "c", "text": "เพิ่มพลังงานสองเท่า"}, {"id": "d", "text": "กดหน้าอกต่อ"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc10',
  related_label = 'บทที่ 10: ภาวะหัวใจหยุดเต้น VF/pVT (Shockable)'
where id = '799adb29-1d25-4b7c-a366-284f493f9803';

update public.video_lessons set
  title = 'Defib 3 : Synchronized Cardioversion',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 351,
  required = false,
  key_points = '- Synchronized cardioversion สำหรับผู้ป่วยที่ยังมีชีพจรแต่ไม่คงที่
- เปิดโหมด Sync ให้ปล่อยพลังงานตรงกับคลื่น R
- ตั้งพลังงานตามชนิดจังหวะ
- ประกาศถอยก่อนปล่อยพลังงานทุกครั้ง',
  chapters = '[{"t": 0, "label": "บทนำ (ต่างจากช็อกธรรมดา)"}, {"t": 80, "label": "ตั้งพลังงาน/ทาเจล"}, {"t": 120, "label": "เทคนิคการกดแพดเดิล"}, {"t": 160, "label": "เปิดโหมด Sync (ตรง R wave)"}, {"t": 180, "label": "ประกาศถอยและปล่อยพลังงาน"}, {"t": 280, "label": "หลักการ sync กับคลื่นหัวใจ"}]'::jsonb,
  quiz = '[{"id": "83a92c4d", "question": "Synchronized cardioversion ปล่อยพลังงานตรงกับอะไร?", "choices": [{"id": "a", "text": "คลื่น P"}, {"id": "b", "text": "คลื่น T"}, {"id": "c", "text": "คลื่น R (R wave)"}, {"id": "d", "text": "ปล่อยเมื่อไรก็ได้"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc07',
  related_label = 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร'
where id = '186d986e-a4cc-4723-bb32-1db642521163';

update public.video_lessons set
  title = 'Defib 4 : Transcutaneous Pacing (กระตุ้นหัวใจสำหรับหัวใจเต้นช้า)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 451,
  required = false,
  key_points = '- Transcutaneous pacing สำหรับ bradycardia ที่มีอาการ
- ติดแผ่น pacing และตั้งอัตรา ~70-80
- เพิ่ม mA จนเกิด capture (มี QRS ตาม + คลำชีพจรได้)
- มีโหมด Demand และ Fixed',
  chapters = '[{"t": 0, "label": "บทนำ (สำหรับ bradycardia)"}, {"t": 70, "label": "การติดแผ่น pacing"}, {"t": 140, "label": "โหมด Demand vs Fixed"}, {"t": 210, "label": "การยืนยัน Capture"}, {"t": 245, "label": "การตั้งอัตรา/พลังงาน (70-80 mA)"}, {"t": 385, "label": "สรุป"}]'::jsonb,
  quiz = '[{"id": "ee9cf796", "question": "การยืนยันว่า pacing ได้ผล (capture) ดูจากอะไร?", "choices": [{"id": "a", "text": "เสียงเตือนดัง"}, {"id": "b", "text": "ไม่ต้องตรวจสอบ"}, {"id": "c", "text": "หน้าจอดับ"}, {"id": "d", "text": "มี QRS ตามหลัง pacing และคลำชีพจรได้"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc06',
  related_label = 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร'
where id = 'b8ff6f12-045d-4c86-9e5f-438ef2bd0295';

update public.video_lessons set
  title = 'Bradycardia 1 : Bradycardia Algorithm & ยา Atropine',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 254,
  required = true,
  key_points = '- แนวทาง Bradycardia: ประเมิน stable/unstable
- Monitor: SpO2, BP, EKG 12 lead
- ยา first-line: Atropine
- ประเมินซ้ำหลังให้ยา',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 100, "label": "Bradycardia Algorithm (Stable/Unstable)"}, {"t": 160, "label": "การประเมินและ EKG"}, {"t": 180, "label": "First-line: Atropine (เตรียม/ให้ยา)"}, {"t": 240, "label": "การประเมินซ้ำ"}]'::jsonb,
  quiz = '[{"id": "827f2beb", "question": "ยา first-line ใน symptomatic bradycardia คือ?", "choices": [{"id": "a", "text": "Atropine"}, {"id": "b", "text": "Aspirin"}, {"id": "c", "text": "Adenosine"}, {"id": "d", "text": "Amiodarone"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc06',
  related_label = 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร'
where id = '454c97f1-aa8a-43db-a02d-d362a004f3e6';

update public.video_lessons set
  title = 'Bradycardia 2 : Bradycardia ไม่คงที่ → Transcutaneous Pacing',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 287,
  required = false,
  key_points = '- กรณี bradycardia ไม่คงที่หรือ Atropine ไม่ได้ผล
- ใช้ transcutaneous pacing
- เพิ่ม mA จนเกิด capture (78 mA capture, 72 mA ยังไม่ capture)
- ยาเสริม: Dopamine, Epinephrine drip; พิจารณา transvenous pacing',
  chapters = '[{"t": 0, "label": "ทบทวน Algorithm"}, {"t": 80, "label": "เตรียมและติดแผ่น pacing"}, {"t": 140, "label": "ตั้งอัตราและเพิ่ม mA"}, {"t": 200, "label": "ยืนยัน Capture (78 mA capture vs 72 mA no capture)"}, {"t": 260, "label": "ตารางสรุปยา (Atropine/Dopamine/Epinephrine/Pacer)"}]'::jsonb,
  quiz = '[{"id": "d21e3546", "question": "เมื่อ pacing ที่ 72 mA ยังไม่ capture ควรทำอย่างไร?", "choices": [{"id": "a", "text": "ช็อกไฟฟ้า"}, {"id": "b", "text": "เพิ่ม mA ให้สูงขึ้นจนเกิด capture"}, {"id": "c", "text": "ลด mA ลง"}, {"id": "d", "text": "หยุด pacing"}], "correctId": "b", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc06',
  related_label = 'บทที่ 6: ภาวะหัวใจเต้นช้าแบบมีชีพจร'
where id = '11fe23c7-c445-49e3-9181-1bf2fd921154';

update public.video_lessons set
  title = 'Tachycardia 1 : Tachycardia Algorithm & Stable SVT (Vagal Maneuver)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 193,
  required = true,
  key_points = '- แนวทาง Tachycardia: ประเมิน stable/unstable
- ผู้ป่วยคงที่ QRS แคบสม่ำเสมอ = SVT
- เริ่มด้วย vagal maneuver (Valsalva)
- เตรียมยา/cardioversion หากไม่ได้ผล',
  chapters = '[{"t": 0, "label": "บทนำ/เคสใจสั่น"}, {"t": 36, "label": "Tachycardia Algorithm"}, {"t": 72, "label": "ประเมินและติด monitor"}, {"t": 120, "label": "วินิจฉัย SVT (ผู้ป่วยคงที่)"}, {"t": 144, "label": "ตารางแนวทาง (Sync/Adenosine)"}, {"t": 156, "label": "Vagal maneuver (Valsalva)"}]'::jsonb,
  quiz = '[{"id": "fe8f02da", "question": "ขั้นแรกในการรักษา stable SVT คือ?", "choices": [{"id": "a", "text": "ให้ Atropine"}, {"id": "b", "text": "Synchronized cardioversion"}, {"id": "c", "text": "Vagal maneuver (เช่น Valsalva)"}, {"id": "d", "text": "Defibrillation"}], "correctId": "c", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc07',
  related_label = 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร'
where id = '4a7ac653-ce5c-405b-ae45-27fb232f76d3';

update public.video_lessons set
  title = 'Tachycardia 2 : การให้ Adenosine (Double T-way) & Synchronized Cardioversion',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 364,
  required = false,
  key_points = '- การให้ Adenosine ด้วยเทคนิค Double T-way (ฉีดเร็ว + flush)
- เตรียม saline flush ให้พร้อม
- หากผู้ป่วยไม่คงที่ → synchronized cardioversion
- Synchronize 100J → 200J จนกลับเป็น sinus',
  chapters = '[{"t": 0, "label": "บทนำ"}, {"t": 40, "label": "เตรียม Adenosine + saline flush"}, {"t": 100, "label": "เทคนิค Double T-way (ฉีดเร็ว+flush)"}, {"t": 200, "label": "กรณี Unstable → Cardioversion"}, {"t": 240, "label": "Synchronize 100J→200J"}, {"t": 320, "label": "กลับเป็น Sinus + ตารางสรุป"}]'::jsonb,
  quiz = '[{"id": "0a6e03eb", "question": "เทคนิค Double T-way ในการให้ Adenosine คือ?", "choices": [{"id": "a", "text": "ผสมกับยาอื่น"}, {"id": "b", "text": "ฉีดช้าๆ"}, {"id": "c", "text": "หยดเข้าหลอดเลือด"}, {"id": "d", "text": "ฉีดยาเร็วพร้อม flush น้ำเกลือทันที"}], "correctId": "d", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc07',
  related_label = 'บทที่ 7: ภาวะหัวใจเต้นเร็วแบบมีชีพจร'
where id = 'f88ba57a-c09c-405c-a6b1-65ca2135ecaa';

update public.video_lessons set
  title = 'Cardiac Arrest 1 : สถานการณ์จำลองภาวะหัวใจหยุดเต้น (Megacode)',
  orientation = 'portrait',
  start_sec = 0,
  end_sec = 490,
  required = true,
  key_points = '- สถานการณ์จำลองภาวะหัวใจหยุดเต้น (megacode)
- CPR คุณภาพสูงต่อเนื่อง + defibrillation
- ให้ Adrenaline และ Amiodarone 300 mg
- ใส่ท่อช่วยหายใจ ทำเป็นรอบ 2 นาที จน ROSC',
  chapters = '[{"t": 0, "label": "บทนำ (เริ่มจาก tachycardia)"}, {"t": 70, "label": "จังหวะเปลี่ยนเป็นหัวใจหยุดเต้น"}, {"t": 105, "label": "Defibrillation 200J"}, {"t": 140, "label": "CPR คุณภาพสูง + ช่วยหายใจ"}, {"t": 210, "label": "ให้ Adrenaline"}, {"t": 245, "label": "เตรียมใส่ท่อช่วยหายใจ"}, {"t": 350, "label": "ช็อกซ้ำ"}, {"t": 385, "label": "ให้ Amiodarone 300 mg"}, {"t": 455, "label": "ROSC (สัญญาณชีพกลับมา)"}]'::jsonb,
  quiz = '[{"id": "bc267c7e", "question": "ยาต้านหัวใจเต้นผิดจังหวะที่ให้ใน VF/VT ดื้อการช็อก (ในคลิป 300 mg) คือ?", "choices": [{"id": "a", "text": "Amiodarone (Cordarone)"}, {"id": "b", "text": "Adenosine"}, {"id": "c", "text": "Adrenaline"}, {"id": "d", "text": "Atropine"}], "correctId": "a", "explanation": ""}]'::jsonb,
  related_path = '/pre-course/pc10',
  related_label = 'บทที่ 10: ภาวะหัวใจหยุดเต้น VF/pVT (Shockable)'
where id = '1315c67f-c83a-40d3-8e36-5b849b5d165e';

commit;
