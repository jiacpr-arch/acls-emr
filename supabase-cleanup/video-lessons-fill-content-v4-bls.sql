-- ============================================================================
-- video_lessons: fill v4 — BLS course (course_mode='bls'), 10 clips
--
-- ปัญหา: คลิป BLS ทั้ง 10 รายการถูก insert โดยไม่มี key_points/quiz
-- (kp_len=0, quiz_n=0 ทุกแถว) ทำให้หน้า /video-lessons/:id สร้างสเต็ปได้แค่
-- [video → result] — กด "ถัดไป" จากวิดีโอแล้วเด้งไปหน้าสรุปผลที่มีแต่ลิงก์
-- "อ่านต่อในบทเรียน" ทันที ไม่มีสเต็ป "สรุปประเด็น" และ "แบบทดสอบ"
-- แบบฝั่ง ACLS (ดู buildStepKeys ใน src/pages/VideoLessonDetail.jsx)
--
-- ไฟล์นี้เติม key_points + quiz ให้ครบทั้ง 10 คลิป โดย:
--   * key_points สรุปจาก read steps ของบทเรียนที่คลิปนั้นผูกอยู่
--     (src/courses/bls-hcp/lessons.js — เนื้อหาที่มีอยู่แล้วในแอป)
--   * quiz นำคำถามจากบทเรียนเดียวกันมาใช้ตรง ๆ (id/choices/correctId/
--     explanation เดิม) คัดเฉพาะข้อที่ตรงกับขอบเขตของคลิป — คลิปที่แยก
--     ผู้ใหญ่/เด็ก (aed, choking) แบ่งข้อสอบตามกลุ่มอายุ
--   * ไม่แตะ title / youtube_id / related_path / chapters (ยังไม่มี timestamp จริง)
--
-- STATUS: APPLIED to emr-ai-clinic (elyyijlcjfvhxbpzscnv) on 2026-08-15
-- via SQL. Kept here as documentation / re-run reference.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- chain 1/1 — บทที่ 1: ภาพรวม BLS และ Chain of Survival (lesson bls-1)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **BLS คือทักษะพื้นฐานที่ HCP ทุกคนต้องทำได้**: จดจำภาวะหัวใจหยุดเต้นทันที · เรียกขอความช่วยเหลือ + ขอ defibrillator · กดหน้าอกคุณภาพสูง · ใช้ AED เร็วที่สุด · ดูแลทางเดินหายใจขั้นพื้นฐาน
- **Universal Chain of Survival (2025) มี 6 ห่วง** ครอบคลุมทั้ง IHCA และ OHCA: 1) Early Recognition & Prevention 2) Early High-Quality CPR 3) Defibrillation 4) Advanced Resuscitation 5) Post-Cardiac Arrest Care 6) Recovery & Survivorship (ห่วงใหม่ — ฟื้นฟูระยะยาว + สนับสนุนครอบครัว)
- **IHCA (ใน รพ.)**: มักมีสัญญาณเตือนล่วงหน้า — เน้นห่วงแรก เฝ้าระวังสัญญาณชีพ + เรียก RRT/MET/code blue ก่อนเกิด arrest
- **OHCA (นอก รพ.)**: เน้น bystander CPR ทันที + AED ในชุมชน + EMS — dispatcher-assisted CPR ช่วยเพิ่ม survival
- **Hands-only CPR เฉพาะ untrained bystander** — BLS-HCP ต้องช่วยหายใจเสมอ
- **ตรวจชีพจร carotid ไม่เกิน 10 วินาที** — ถ้าไม่แน่ใจให้เริ่ม CPR ทันที',
  quiz = '[
    {"id": "bls-1-q1", "question": "พบผู้ป่วยหมดสติ ไม่ตอบสนอง ใน ward — ขั้นตอนแรกที่ควรทำคืออะไร?", "choices": [{"id": "a", "text": "เริ่มกดหน้าอกทันทีก่อนเรียกใคร"}, {"id": "b", "text": "ตรวจชีพจรนาน 30 วินาที"}, {"id": "c", "text": "เรียก code blue / RRT พร้อมขอ defibrillator"}, {"id": "d", "text": "ไปตามแพทย์เวรเอง"}], "correctId": "c", "explanation": "IHCA: เมื่อจดจำเหตุได้ ต้อง activate code blue / RRT ทันที พร้อมขอ defibrillator การช่วยเหลือคนเดียวเสียเวลา"},
    {"id": "bls-1-q2", "question": "Universal Chain of Survival (2025) มีกี่ห่วง และห่วงสุดท้ายคืออะไร?", "choices": [{"id": "a", "text": "5 ห่วง — ห่วงสุดท้าย Post-cardiac arrest care"}, {"id": "b", "text": "6 ห่วง — ห่วงสุดท้าย Recovery & Survivorship"}, {"id": "c", "text": "4 ห่วง — ห่วงสุดท้าย Defibrillation"}, {"id": "d", "text": "แยกตาม IHCA/OHCA ไม่มีจำนวนตายตัว"}], "correctId": "b", "explanation": "Universal Chain 2025 มี 6 ห่วง รวม IHCA + OHCA เข้าด้วยกัน; ห่วงที่ 6 (Recovery & Survivorship) เป็นห่วงใหม่ที่เน้นฟื้นฟูระยะยาวและการสนับสนุนครอบครัว"},
    {"id": "bls-1-q3", "question": "การตรวจชีพจรในผู้ใหญ่ที่หมดสติควรใช้เวลานานสุดเท่าไร?", "choices": [{"id": "a", "text": "ไม่เกิน 10 วินาที"}, {"id": "b", "text": "15–20 วินาที"}, {"id": "c", "text": "30 วินาที"}, {"id": "d", "text": "1 นาที"}], "correctId": "a", "explanation": "ตรวจชีพจร carotid ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้เริ่ม CPR ทันที"}
  ]'::jsonb
where id = '5bc2c991-7a79-46ae-b6be-8cdf2376f908';

-- ---------------------------------------------------------------------------
-- cpr-adult 1/2 — บทที่ 2: CPR คุณภาพสูงในผู้ใหญ่ (lesson bls-2)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **5 องค์ประกอบ High-Quality CPR**: อัตรา 100–120 ครั้ง/นาที · ลึก 5–6 ซม. ในผู้ใหญ่ · ปล่อยหน้าอกคืนตัวเต็มที่ (full recoil) · หยุดกดทุกครั้ง < 10 วินาที (CCF > 80%) · ไม่ over-ventilate
- **ตำแหน่ง/ท่ากด**: ส้นมือกลางหน้าอก ครึ่งล่างของ sternum ประสานมือ แขนเหยียดตรง ไหล่เหนือมือ ผู้ป่วยอยู่บนพื้นแข็ง (backboard ถ้าเตียงนุ่ม)
- **BLS-HCP ต้องช่วยหายใจเสมอ** (hands-only = lay rescuer): ไม่มี advanced airway → 30:2; หลังใส่ ETT/SGA/LMA → continuous compressions + บีบ Ambu ผู้ใหญ่ 1 ครั้ง/6 วินาที (10/min)
- **เปิดทางเดินหายใจ**: head-tilt/chin-lift เป็นมาตรฐาน; สงสัย trauma คอ → jaw-thrust ก่อน ถ้าไม่ได้ผลกลับมาใช้ head-tilt/chin-lift — ทางเดินหายใจโล่งสำคัญกว่าเสมอ
- **BVM**: คนเดียวใช้ EC-clamp; ถ้าลมรั่ว/อกไม่ยก → เปลี่ยนเป็น 2-rescuer (double EC-clamp) ทันที; บีบ ~1 วินาที/ครั้ง พอเห็นอกยก กัน gastric inflation
- **สถานการณ์พิเศษ**: มี stoma/tracheostomy → seal ที่ stoma โดยตรง; respiratory arrest ที่ยังมีชีพจร → ช่วยหายใจอย่างเดียว 1 ครั้ง/6 วินาที ไม่กดหน้าอก ประเมินชีพจรซ้ำทุก ~2 นาที',
  quiz = '[
    {"id": "bls-2-q1", "question": "อัตราการกดหน้าอกในผู้ใหญ่ตามแนวทาง ILCOR 2025 คือเท่าไร?", "choices": [{"id": "a", "text": "60–80 ครั้ง/นาที"}, {"id": "b", "text": "80–100 ครั้ง/นาที"}, {"id": "c", "text": "100–120 ครั้ง/นาที"}, {"id": "d", "text": "มากกว่า 120 ครั้ง/นาที"}], "correctId": "c", "explanation": "ILCOR 2025 แนะนำ 100–120 ครั้ง/นาที กดเร็วเกินจะกดได้ไม่ลึก กดช้าเกินจะได้ flow ไม่พอ"},
    {"id": "bls-2-q2", "question": "ความลึกในการกดหน้าอกในผู้ใหญ่ที่เหมาะสมคือ?", "choices": [{"id": "a", "text": "2–3 ซม."}, {"id": "b", "text": "3–4 ซม."}, {"id": "c", "text": "5–6 ซม."}, {"id": "d", "text": "มากกว่า 7 ซม."}], "correctId": "c", "explanation": "ผู้ใหญ่: อย่างน้อย 5 ซม. ไม่เกิน 6 ซม. — กดตื้นเกิน output ไม่พอ; กดลึกเกินเสี่ยง rib fracture (เกณฑ์ 1/3 AP diameter ใช้สำหรับเด็ก/ทารกเท่านั้น)"},
    {"id": "bls-2-q3", "question": "Chest Compression Fraction (CCF) เป้าหมายตามแนวทาง 2025 คือเท่าไร?", "choices": [{"id": "a", "text": "> 40%"}, {"id": "b", "text": "> 60%"}, {"id": "c", "text": "> 80%"}, {"id": "d", "text": "100%"}], "correctId": "c", "explanation": "แนวทางปี 2025 ระบุ CCF > 80% เป็น quality benchmark — เวลาที่กดหน้าอกจริงเทียบกับเวลารวมของ resuscitation; สูงขึ้นสัมพันธ์กับ ROSC + survival"},
    {"id": "bls-2-q4", "question": "ทำไมต้องปล่อยให้หน้าอกคืนตัวเต็มที่ระหว่าง compression?", "choices": [{"id": "a", "text": "เพื่อพักกล้ามเนื้อผู้กด"}, {"id": "b", "text": "เพื่อให้เลือดไหลกลับเข้า heart ใน diastole (venous return)"}, {"id": "c", "text": "เพื่อให้ผู้ป่วยหายใจเอง"}, {"id": "d", "text": "ไม่มีผลทาง physiology"}], "correctId": "b", "explanation": "Incomplete recoil → ลด venous return → ลด cardiac output ของ CPR อย่างมาก"},
    {"id": "bls-2-q5", "question": "BLS-HCP ทำ CPR แตกต่างจาก lay rescuer อย่างไร?", "choices": [{"id": "a", "text": "BLS-HCP ใช้ hand-only CPR เหมือนกัน"}, {"id": "b", "text": "BLS-HCP ต้องช่วยหายใจด้วย (30:2 หรือ 1 ครั้ง/6 วินาที หลัง advanced airway)"}, {"id": "c", "text": "BLS-HCP ไม่ต้องกดหน้าอก"}, {"id": "d", "text": "BLS-HCP ใช้ rate ต่างกัน"}], "correctId": "b", "explanation": "Hand-only CPR = lay rescuer; BLS-HCP ต้องช่วยหายใจเสมอ — 30:2 (no advanced airway) หรือ 1 ครั้ง/6 วินาที (มี advanced airway)"}
  ]'::jsonb
where id = '63b3e0a5-bb9d-4ccf-9956-b65a0bcea6db';

-- ---------------------------------------------------------------------------
-- cpr-adult 2/2 — บทที่ 4: One-rescuer CPR (lesson bls-1r)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **หลัก one-rescuer**: เริ่ม CPR + ขอความช่วยเหลือ + ใช้ AED ให้เร็วที่สุด โดยไม่เสียเวลากดหน้าอก — ใช้ speakerphone โทร 1669 / activate code blue พร้อมกดหน้าอกไปด้วย อย่ารอความช่วยเหลือก่อนเริ่ม
- **ขั้นตอน CAB**: scene safety + ปลุก → ไม่ตอบสนอง → เรียก EMS/code blue + ขอ AED → ตรวจการหายใจ + carotid pulse พร้อมกัน ≤ 10 วินาที → ไม่มี pulse หรือไม่แน่ใจ → CPR 30:2 (100–120/min) → ใช้ AED ทันทีที่มาถึง
- **ใช้ AED คนเดียว**: ติด pads ระหว่างที่ยังกดอยู่ · หยุดกดเฉพาะช่วงเครื่องวิเคราะห์ (~5–10 วินาที เคลียร์คนรอบ) · หลัง shock กลับมากดต่อทันที ห้ามตรวจ pulse ก่อน
- **หยุด CPR ได้เมื่อ**: ROSC · ทีม CPR/EMS รับช่วงต่อ · หมดแรงจริง ๆ · สถานการณ์ไม่ปลอดภัย · แพทย์ประกาศยุติ · สัญญาณเสียชีวิตชัดเจน (rigor mortis, dependent lividity, decomposition) · DNR/advance directive
- **Termination of resuscitation (TOR) เป็นดุลยพินิจของแพทย์เท่านั้น** — BLS-HCP มีหน้าที่ทำ CPR ต่อเนื่องและรายงานทีม',
  quiz = '[
    {"id": "bls-1r-q1", "question": "ผู้ช่วยเหลือคนเดียวพบผู้ป่วยหมดสติริมถนน — ขั้นตอนถูกต้องคือ?", "choices": [{"id": "a", "text": "วิ่งไปตามคนช่วยก่อน แล้วค่อยกลับมาทำ CPR"}, {"id": "b", "text": "ใช้ speakerphone เรียก 1669 พร้อมประเมิน + เริ่ม CPR"}, {"id": "c", "text": "ตรวจชีพจร 30 วินาทีให้แน่ใจ"}, {"id": "d", "text": "รอ ambulance ก่อนเริ่มทำอะไร"}], "correctId": "b", "explanation": "Speakerphone ทำให้เรียก EMS + ทำ CPR ได้พร้อมกัน — early CPR สำคัญต่อ survival, อย่าทิ้งผู้ป่วยไปตามคน"},
    {"id": "bls-1r-q2", "question": "อัตราส่วน Compression:Ventilation ของ one-rescuer ในผู้ใหญ่คือ?", "choices": [{"id": "a", "text": "15:2"}, {"id": "b", "text": "30:2"}, {"id": "c", "text": "50:2"}, {"id": "d", "text": "continuous compression อย่างเดียว"}], "correctId": "b", "explanation": "1-rescuer: 30:2 (ทั้งผู้ใหญ่/เด็ก/ทารก); 2-rescuer ในเด็ก/ทารก: 15:2"},
    {"id": "bls-1r-q3", "question": "ผู้ช่วยเหลือคนเดียวกดหน้าอกอยู่ AED มาถึง — ทำอะไรต่อ?", "choices": [{"id": "a", "text": "กดต่ออีก 5 นาทีค่อยใส่ AED"}, {"id": "b", "text": "ติด pads ระหว่างที่ยังกดอยู่ แล้วให้ AED วิเคราะห์"}, {"id": "c", "text": "รอจน rhythm กลับมาเอง"}, {"id": "d", "text": "ใส่ AED แล้วหยุด CPR ทั้งหมด"}], "correctId": "b", "explanation": "ติด pads ระหว่างกดเพื่อลดเวลา interrupt — early defib เพิ่ม survival อย่างมาก"},
    {"id": "bls-1r-q4", "question": "ผู้ช่วยเหลือคนเดียวกดจนเหนื่อยมาก — ทำอะไรต่อ?", "choices": [{"id": "a", "text": "หยุดทุกอย่าง รอ EMS"}, {"id": "b", "text": "กดต่อแม้คุณภาพลด — ทำจนคนช่วยมาถึง หรือหมดแรงจริง ๆ"}, {"id": "c", "text": "พัก 5 นาที แล้วค่อยกดใหม่"}, {"id": "d", "text": "นวดท้องแทน"}], "correctId": "b", "explanation": "การ interrupt CPR ↓ coronary perfusion → ↓ ROSC chances; กดต่อแม้คุณภาพลดยังดีกว่าหยุด"},
    {"id": "bls-1r-q6", "question": "การตัดสินใจ \"ยุติการช่วยเหลือ\" (termination of resuscitation) เป็นหน้าที่ของใคร?", "choices": [{"id": "a", "text": "แพทย์ ตามดุลยพินิจทางคลินิก — BLS-HCP มีหน้าที่ทำ CPR ต่อเนื่องและรายงาน"}, {"id": "b", "text": "BLS-HCP คนแรกที่ไปถึงที่เกิดเหตุ"}, {"id": "c", "text": "ใครก็ได้ในทีมที่เหนื่อยที่สุด"}, {"id": "d", "text": "ต้องรอญาติเซ็นยินยอมก่อนเสมอ"}], "correctId": "a", "explanation": "TOR เป็นดุลยพินิจทางคลินิกของแพทย์เท่านั้น — BLS-HCP ทำ CPR ต่อเนื่องและรายงานทีม ไม่ใช่ผู้ตัดสินใจยุติการช่วยเหลือเอง"}
  ]'::jsonb
where id = 'e79eec60-1a70-4f84-bb28-e0f7186912ae';

-- ---------------------------------------------------------------------------
-- aed 1/2 — บทที่ 3: การใช้ AED (ผู้ใหญ่) (lesson bls-3)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **4 ขั้นตอนการใช้ AED**: 1) เปิดเครื่อง ฟังคำสั่งเสียง 2) ติด pads ตำแหน่งถูกต้อง 3) ให้เครื่องวิเคราะห์ rhythm (ห้ามแตะผู้ป่วย) 4) ถ้าแนะนำ shock → เคลียร์คนรอบ → กดปุ่ม shock → เริ่ม CPR ต่อทันที 2 นาที
- **BLS-HCP ใช้ AED mode เท่านั้น** — ไม่ต้องอ่าน rhythm strip หรือเลือก Joule เอง; manual defibrillation = ทักษะระดับ ACLS
- **ตำแหน่ง pads**: anterolateral (pad 1 ใต้ไหปลาร้าขวา, pad 2 กลางสีข้างซ้าย mid-axillary line) หรือ anteroposterior (เทียบเท่ากัน — แนะนำเมื่อมี pacemaker/ICD)
- **Pacemaker/ICD**: ห้ามวางทับตัวเครื่องเด็ดขาด วางห่างมากที่สุดเท่าที่ทำได้ (ควร ≥ 8 ซม.)
- **สถานการณ์พิเศษ**: หน้าอกเปียก → เช็ดแห้งเร็ว ๆ ก่อนติด; patch ยา transdermal → ดึงออก เช็ดยา ห้าม shock ทับ; hairy chest → โกนหรือใช้ pads สำรองดึงขน; อยู่ในน้ำ → ย้ายขึ้นที่แห้งก่อน
- **"No shock advised"** → เริ่มกดหน้าอกต่อทันที 2 นาที แล้วเครื่องจะวิเคราะห์รอบถัดไปอัตโนมัติ',
  quiz = '[
    {"id": "bls-3-q1", "question": "ทันทีหลัง shock ควรทำอะไรต่อ?", "choices": [{"id": "a", "text": "ตรวจชีพจรทันที"}, {"id": "b", "text": "เริ่มกดหน้าอกต่อทันที 2 นาที"}, {"id": "c", "text": "รอให้ AED วิเคราะห์ซ้ำ"}, {"id": "d", "text": "ใส่ advanced airway"}], "correctId": "b", "explanation": "หลัง shock ต้องเริ่ม CPR ต่อ 2 นาทีทันที โดยไม่ตรวจชีพจร เพื่อรักษา perfusion"},
    {"id": "bls-3-q3", "question": "ผู้ป่วย VF ที่มีหน้าอกเปียกน้ำ ควรทำอะไรก่อนติด AED pads?", "choices": [{"id": "a", "text": "รอให้แห้งเอง"}, {"id": "b", "text": "เช็ดหน้าอกให้แห้งอย่างรวดเร็ว"}, {"id": "c", "text": "ห้ามใช้ AED"}, {"id": "d", "text": "ใส่ glove เพิ่ม"}], "correctId": "b", "explanation": "เช็ดให้แห้งเพื่อให้ pads ติดและ shock ผ่านได้ดี ห้ามรอ"},
    {"id": "bls-3-q4", "question": "ผู้ป่วยใส่ pacemaker อยู่ ต้องวาง pads อย่างไร?", "choices": [{"id": "a", "text": "วางตรงบน pacemaker"}, {"id": "b", "text": "วางให้ห่างจาก pacemaker มากที่สุดเท่าที่ทำได้ (ควร ≥ 8 ซม.) ห้ามวางทับ"}, {"id": "c", "text": "ไม่ shock เลย"}, {"id": "d", "text": "ปิด pacemaker ก่อน"}], "correctId": "b", "explanation": "หลีกเลี่ยงการวางทับ pacemaker (กระแสถูกบล็อก/เครื่องเสียหาย) — หลักคือวางห่างมากที่สุดเท่าที่ทำได้ ควร ≥ 8 ซม. (3.1 นิ้ว); ถ้าพื้นที่ไม่พอให้ห่างเท่าที่ทำได้ เพราะ defib สำคัญที่สุด (หมายเหตุ: ค่า 2.5 ซม./1 นิ้ว เป็นของแผ่นแปะยา ไม่ใช่ pacemaker)"},
    {"id": "bls-3-q5", "question": "เมื่อ AED บอก \"No shock advised\" ขั้นตอนถัดไปคืออะไร?", "choices": [{"id": "a", "text": "ตรวจชีพจรนาน 30 วินาที"}, {"id": "b", "text": "รอ AED วิเคราะห์ซ้ำเลย"}, {"id": "c", "text": "เริ่มกดหน้าอกต่อทันที 2 นาที แล้วให้ AED วิเคราะห์ใหม่"}, {"id": "d", "text": "ถอดแผ่นออกแล้วใส่ใหม่"}], "correctId": "c", "explanation": "\"No shock advised\" → CPR ต่อทันที 2 นาที (rhythm อาจเป็น PEA/Asystole หรือ ROSC — BLS เน้น minimize interruptions ไม่ต้องเสียเวลาคลำชีพจร) AED จะวิเคราะห์รอบถัดไปอัตโนมัติ\nหมายเหตุ (HCP): ถ้าจังหวะบนจอมีระเบียบ/สงสัย ROSC คลำชีพจรสั้นๆ ≤ 10 วินาทีได้ ถ้าไม่มีชีพจรให้กดหน้าอกต่อทันที"},
    {"id": "bls-3-q6", "question": "BLS-HCP ใช้เครื่อง defibrillator แบบใด?", "choices": [{"id": "a", "text": "Manual mode — อ่าน rhythm แล้วเลือก Joule เอง"}, {"id": "b", "text": "AED / automated mode เท่านั้น"}, {"id": "c", "text": "ใช้ได้ทุกแบบขึ้นกับว่าใครมาก่อน"}, {"id": "d", "text": "ไม่ใช้ defibrillator"}], "correctId": "b", "explanation": "BLS-HCP ใช้ AED mode (อัตโนมัติ) เท่านั้น — ไม่ต้องอ่าน rhythm strip หรือเลือก Joule เอง Manual defibrillation = ทักษะระดับ ACLS"}
  ]'::jsonb
where id = '72db6e3d-e76a-42f0-93fe-41dff6c1a42d';

-- ---------------------------------------------------------------------------
-- aed 2/2 — บทที่ 3: การใช้ AED (เด็ก) (lesson bls-3 + ประเด็นเด็กจาก bls-6)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **เด็ก < 8 ปี หรือน้ำหนัก < 25 กก.**: ใช้ pediatric pads / dose attenuator ถ้ามี — ถ้าไม่มีให้ใช้ pads ผู้ใหญ่ได้เลย ห้ามชะลอ defibrillation
- **ทารก < 1 ปี**: ใช้ manual defibrillator ถ้ามี; ถ้าไม่มีใช้ AED with pediatric attenuator; ถ้าไม่มีอีกใช้ adult AED ได้
- **ตำแหน่ง pads ในเด็กเล็ก/ทารก**: anteroposterior (หน้า-หลัง) มักเหมาะกว่า เพราะหน้าอกเล็ก ป้องกัน pads ทับ/ชนกัน
- **Flow เดียวกับผู้ใหญ่**: เปิดเครื่อง → ติด pads → วิเคราะห์ (ห้ามแตะผู้ป่วย) → shock ถ้าแนะนำ → เริ่ม CPR ต่อทันที 2 นาที',
  quiz = '[
    {"id": "bls-3-q2", "question": "ใช้ AED ในเด็กอายุ < 8 ปี (หรือน้ำหนัก < 25 กก.) ควรใช้อะไร?", "choices": [{"id": "a", "text": "ใช้ pads ผู้ใหญ่ตามปกติ"}, {"id": "b", "text": "ใช้ pediatric pads / dose attenuator ถ้ามี (ถ้าไม่มีใช้ผู้ใหญ่ได้)"}, {"id": "c", "text": "ห้ามใช้ AED ในเด็กทุกกรณี"}, {"id": "d", "text": "รอ EMS มาเท่านั้น"}], "correctId": "b", "explanation": "เด็ก < 8 ปี หรือ < 25 กก. ใช้ pediatric pads / attenuator ถ้ามี; ถ้าไม่มีให้ใช้ผู้ใหญ่ — defib เป็นชีวิต ห้ามชะลอ"},
    {"id": "bls-6-q8", "question": "ตำแหน่งติด AED pads ที่เหมาะสมสำหรับทารกคือ?", "choices": [{"id": "a", "text": "Anterolateral เหมือนผู้ใหญ่เท่านั้น ห้ามใช้แบบอื่น"}, {"id": "b", "text": "Anteroposterior (หน้า-หลัง) มักเหมาะกว่า เพราะหน้าอกเล็ก ป้องกัน pads ทับ/ชนกัน"}, {"id": "c", "text": "ไม่ต้องติด pads ในทารก"}, {"id": "d", "text": "ติดที่ขาทั้งสองข้าง"}], "correctId": "b", "explanation": "หน้าอกทารกเล็ก anteroposterior placement จึงมักเหมาะกว่าเพื่อป้องกัน pads ทับ/ชนกัน"},
    {"id": "bls-3-q1", "question": "ทันทีหลัง shock ควรทำอะไรต่อ?", "choices": [{"id": "a", "text": "ตรวจชีพจรทันที"}, {"id": "b", "text": "เริ่มกดหน้าอกต่อทันที 2 นาที"}, {"id": "c", "text": "รอให้ AED วิเคราะห์ซ้ำ"}, {"id": "d", "text": "ใส่ advanced airway"}], "correctId": "b", "explanation": "หลัง shock ต้องเริ่ม CPR ต่อ 2 นาทีทันที โดยไม่ตรวจชีพจร เพื่อรักษา perfusion"}
  ]'::jsonb
where id = 'eac052ce-02c1-4e2d-833f-f697af8d1b5e';

-- ---------------------------------------------------------------------------
-- team 1/1 — บทที่ 5: 2-rescuer CPR, Team Dynamics และ ROSC (lesson bls-4)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **อัตราส่วน Compression:Ventilation**: ผู้ใหญ่ 30:2 (ทั้ง 1 และ 2 rescuer); เด็ก/ทารก 30:2 (1 rescuer) / 15:2 (2 rescuer HCP); มี advanced airway → continuous compressions + ผู้ใหญ่ 10/min (1 ครั้ง/6 วิ), เด็ก/ทารก 20–30/min
- **สลับคนกดทุก 2 นาที** (หรือเร็วกว่าถ้าเหนื่อย) — สลับให้เร็ว ไม่หยุดเกิน 5 วินาที ใช้จังหวะ rhythm check เป็นโอกาสสลับ
- **Team Dynamics 6 ข้อ**: Clear Roles · Knowing Limitations · Constructive Intervention · Knowledge Sharing · Closed-loop Communication · Clear Message
- **Closed-loop communication**: ผู้สั่งระบุชื่อ+คำสั่ง → ผู้รับทวน → รายงานเมื่อทำเสร็จ → ผู้สั่งยืนยัน — ลด miscommunication ใน high-stress environment
- **CPR Coach**: เฝ้าดูความลึก/อัตรา/recoil/ความล้า แจ้งสลับ Compressor เมื่อคุณภาพลด คุม interruption ≤ 10 วินาที — ไม่ใช่ผู้ควบคุมทีมแทน Team Leader
- **สัญญาณ ROSC**: ชีพจรกลับมา เริ่มหายใจเอง ขยับตัว ไอ ลืมตา สีผิวดีขึ้น → หยุดกดสั้น ๆ ตรวจทันที ไม่ต้องรอครบ 2 นาที (ระวังสับสนกับ agonal gasping)
- **หลัง ROSC**: หายใจปกติแต่ไม่รู้สึกตัว → Recovery position + monitor ใกล้ชิด (re-arrest risk สูง) + ห้ามถอด pads/ปิด AED จนส่งต่อทีม ALS',
  quiz = '[
    {"id": "bls-4-q1", "question": "ในการทำ CPR ผู้ใหญ่ที่ใส่ advanced airway แล้ว ควร ventilate อย่างไร?", "choices": [{"id": "a", "text": "30:2 ตามปกติ"}, {"id": "b", "text": "1 ครั้งทุก 6 วินาที (10 ครั้ง/นาที) ร่วมกับ continuous compressions"}, {"id": "c", "text": "1 ครั้งทุก 3 วินาที"}, {"id": "d", "text": "ไม่ต้อง ventilate"}], "correctId": "b", "explanation": "หลังใส่ advanced airway: continuous compressions + 1 breath ทุก 6 วินาที ไม่ pause"},
    {"id": "bls-4-q2", "question": "ควรสลับคนกดหน้าอกบ่อยแค่ไหน?", "choices": [{"id": "a", "text": "ทุก 30 วินาที"}, {"id": "b", "text": "ทุก 2 นาที หรือเร็วกว่าถ้าเหนื่อย"}, {"id": "c", "text": "ทุก 10 นาที"}, {"id": "d", "text": "ไม่ต้องสลับ"}], "correctId": "b", "explanation": "สลับทุก 2 นาทีเพื่อรักษาคุณภาพการกด เหนื่อยเร็วกว่าที่คิด"},
    {"id": "bls-4-q3", "question": "Closed-loop communication คืออะไร?", "choices": [{"id": "a", "text": "การสั่งงานต่อกันเป็นทอด ๆ"}, {"id": "b", "text": "การที่ leader สั่ง → ผู้รับยืนยัน → ทำเสร็จรายงานกลับ"}, {"id": "c", "text": "การปิดประตูห้องระหว่างทำ CPR"}, {"id": "d", "text": "การส่งสัญญาณมือ"}], "correctId": "b", "explanation": "Closed-loop: สั่ง → ยืนยัน → รายงานกลับ ลด error ใน high-stress environment"},
    {"id": "bls-4-q4", "question": "ตามแนวทางปี 2025 ทุกการหยุดกดหน้าอก (interruption) ไม่ควรเกินกี่วินาที?", "choices": [{"id": "a", "text": "5 วินาที"}, {"id": "b", "text": "10 วินาที"}, {"id": "c", "text": "20 วินาที"}, {"id": "d", "text": "30 วินาที"}], "correctId": "b", "explanation": "แนวทาง 2025: limit interruption ทุกประเภท (สลับคน, AED วิเคราะห์, intubation, pulse check) ไม่เกิน 10 วินาที — เป้าฝึกของการสลับคนเองคือใน 5 วินาที แต่ formal limit ตามมาตรฐานคือ 10 วินาที"},
    {"id": "bls-4-q5", "question": "หลัง ROSC ผู้ป่วยหายใจเองได้ปกติ แต่ยังไม่รู้สึกตัว ทำอะไรต่อ?", "choices": [{"id": "a", "text": "กดหน้าอกต่อเพื่อความปลอดภัย"}, {"id": "b", "text": "จัดท่า Recovery position + monitor + รอ ALS"}, {"id": "c", "text": "ปิด AED แล้วถอด pads ออกทันที"}, {"id": "d", "text": "ปลุกด้วยการตบหน้าและน้ำเย็น"}], "correctId": "b", "explanation": "ROSC + หายใจปกติ + ไม่รู้สึกตัว → Recovery position ป้องกัน aspiration + monitor (re-arrest risk สูง) + ขอ ALS; ห้ามถอด AED จนส่งต่อเสร็จ"}
  ]'::jsonb
where id = '7b432774-e9cc-4dea-9111-5355f1f421a4';

-- ---------------------------------------------------------------------------
-- inhospital 1/1 — บทที่ 6: BLS ในโรงพยาบาล — Defib ใน AED Mode (lesson bls-5)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **ใน รพ. ใช้ monitor/defibrillator** (Philips, Zoll, Lifepak, Mindray) แทน AED stand-alone — เครื่องส่วนใหญ่มี 2 modes: AED mode (BLS provider) + Manual mode (ALS) เป็นเครื่องเดียวกันที่ ALS team ใช้ต่อ
- **ขั้นตอน AED mode**: เปิดเครื่อง → เลือก AED mode → ติด pads (anterolateral หรือ AP) → เครื่องวิเคราะห์ (ห้ามแตะ ≤ 10 วินาที) → "shock advised" → เคลียร์ → shock → CPR ต่อทันที 2 นาที; "no shock advised" → CPR ต่อ 2 นาที — เครื่องวิเคราะห์ซ้ำทุก 2 นาทีอัตโนมัติ
- **BLS provider เริ่ม AED mode ทันทีเมื่อเครื่องมาถึง — ห้ามรอ ALS team**
- **ส่งต่อ ALS**: หัวหน้าทีม switch ไป manual mode (pads เดิม ไม่ต้องถอด) + hand-off แบบ closed-loop: (1) เวลาเริ่ม CPR (2) จำนวน shock + เวลา (3) rhythm ที่เห็น (4) ยาที่ให้แล้ว
- **Vascular access (2025)**: peripheral IV ก่อน — ไม่สำเร็จใน 1–2 ครั้ง เปลี่ยนเป็น IO ทันที; ETT route ไม่แนะนำแล้ว; ให้ยาแล้ว flush 20 mL + ยกแขน/ขา',
  quiz = '[
    {"id": "bls-5-q1", "question": "ทำไมในโรงพยาบาลถึงใช้ defib ที่มี AED mode แทน AED stand-alone?", "choices": [{"id": "a", "text": "AED stand-alone ผิดกฎหมายในโรงพยาบาล"}, {"id": "b", "text": "เพราะเป็นเครื่องเดียวกันที่ ALS team ใช้ — BLS shock ก่อน ส่งต่อ manual mode ได้เลย"}, {"id": "c", "text": "AED stand-alone shock แรงกว่า"}, {"id": "d", "text": "ไม่ต่างกัน เลือกอันไหนก็ได้"}], "correctId": "b", "explanation": "เครื่องในโรงพยาบาลเป็น defib/monitor ที่มี AED mode สำหรับ BLS + manual mode สำหรับ ALS — ใช้ต่อเนื่องไม่ต้องเปลี่ยนเครื่อง"},
    {"id": "bls-5-q2", "question": "BLS provider นำ defib มาถึง — ขั้นตอนแรกหลังเปิดเครื่องคืออะไร?", "choices": [{"id": "a", "text": "อ่าน rhythm บนจอแล้วเลือก energy"}, {"id": "b", "text": "เลือก AED mode แล้วติด pads"}, {"id": "c", "text": "รอ ALS team มาถึงก่อน"}, {"id": "d", "text": "ใส่ IV ก่อน"}], "correctId": "b", "explanation": "BLS provider ใช้ AED mode (ไม่ได้รับการสอนอ่าน rhythm) — เลือก mode → ติด pads → ให้เครื่องวิเคราะห์"},
    {"id": "bls-5-q3", "question": "หลังเครื่องในโหมด AED แนะนำ \"shock advised\" และ shock ไปแล้ว ทำอะไรต่อ?", "choices": [{"id": "a", "text": "ตรวจชีพจรทันที"}, {"id": "b", "text": "รอเครื่องวิเคราะห์ rhythm อีกครั้ง"}, {"id": "c", "text": "เริ่ม CPR ต่อทันที 2 นาที"}, {"id": "d", "text": "Switch ไป manual mode ทันที"}], "correctId": "c", "explanation": "AED mode ใช้ flow เดียวกับ AED ปกติ: หลัง shock → CPR ต่อ 2 นาที ห้ามตรวจชีพจร"},
    {"id": "bls-5-q4", "question": "ALS team มาถึงระหว่าง code — ควรทำอย่างไรกับเครื่อง defib?", "choices": [{"id": "a", "text": "ถอด pads ออก เปลี่ยนเครื่องใหม่"}, {"id": "b", "text": "BLS provider continue ใน AED mode ตลอด"}, {"id": "c", "text": "หัวหน้า ALS switch ไป manual mode + รับ hand-off (เวลา shock, rhythm, ยา)"}, {"id": "d", "text": "ปิดเครื่องก่อนเปลี่ยน mode"}], "correctId": "c", "explanation": "ALS team รับ hand-off แล้ว switch manual mode เพื่ออ่าน rhythm + ใช้ sync/pacing — pads เดิม ไม่ต้องถอด"}
  ]'::jsonb
where id = '8da79a9a-0d67-4518-be92-7b481e9ed463';

-- ---------------------------------------------------------------------------
-- pediatric 1/1 — บทที่ 7: CPR ในทารก (< 1 ปี) (lesson bls-6)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **ตรวจชีพจรทารก**: ใช้ brachial pulse (หรือ femoral แทนได้) ไม่เกิน 10 วินาที — carotid ยากเพราะคอสั้น; HR < 60 + poor perfusion แม้ ventilation/O₂ เพียงพอแล้ว → เริ่มกดหน้าอกทันที
- **เทคนิคกด (2025 เลิกใช้ 2-finger)**: 1 rescuer → heel-of-1-hand หรือ 2-thumb encircling; 2 rescuer HCP → 2-thumb encircling (output ดีที่สุด)
- **ความลึก ~4 ซม. (1/3 ของ AP diameter) อัตรา 100–120 ครั้ง/นาที**
- **เปิดทางเดินหายใจ**: ท่า neutral/sniffing ห้าม hyperextension — occiput ทารกยื่นมาก เอียงมากเกินจะยิ่งอุดทางเดินหายใจ; อาจรองผ้าบาง ๆ ใต้ไหล่
- **ช่วยหายใจ**: mouth-to-mouth-and-nose (ปากครอบทั้งปาก+จมูก) หรือ BVM ขนาดพอดี แรงกดเบา บีบพอเห็นอกยก ~1 วินาที/ครั้ง
- **อัตราส่วน**: 30:2 (1 rescuer) / 15:2 (2 rescuer HCP)
- **"Phone fast"**: unwitnessed + ช่วยคนเดียว → CPR ก่อน ~2 นาทีแล้วค่อยโทร (arrest เด็ก/ทารกมักเป็น asphyxial) — ต่างจากผู้ใหญ่ที่ "phone first" ด้วย speakerphone',
  quiz = '[
    {"id": "bls-6-q1", "question": "ตรวจชีพจรในทารกใช้ตำแหน่งใด?", "choices": [{"id": "a", "text": "Carotid"}, {"id": "b", "text": "Radial"}, {"id": "c", "text": "Brachial"}, {"id": "d", "text": "Femoral หรือ Brachial"}], "correctId": "d", "explanation": "Brachial pulse เป็นมาตรฐาน, femoral ก็ใช้ได้ — carotid ยากในทารกเพราะคอสั้น"},
    {"id": "bls-6-q2", "question": "ใน 2-rescuer CPR ของทารก เทคนิคไหนแนะนำ?", "choices": [{"id": "a", "text": "1-hand technique"}, {"id": "b", "text": "2-finger technique"}, {"id": "c", "text": "2-thumb encircling technique"}, {"id": "d", "text": "Heel of hand (เหมือนผู้ใหญ่)"}], "correctId": "c", "explanation": "2-thumb encircling ให้ output และ depth ที่ดีกว่า 2-finger ใน 2-rescuer setting"},
    {"id": "bls-6-q3", "question": "ความลึกของการกดหน้าอกในทารกคือ?", "choices": [{"id": "a", "text": "~2 ซม."}, {"id": "b", "text": "~4 ซม. หรือ 1/3 ของ AP diameter"}, {"id": "c", "text": "~5–6 ซม."}, {"id": "d", "text": "ลึกเท่ากับผู้ใหญ่"}], "correctId": "b", "explanation": "ทารก: 1/3 ของ AP diameter ~ 4 ซม."},
    {"id": "bls-6-q4", "question": "อัตราส่วน compression:ventilation ในทารก 1-rescuer คือ?", "choices": [{"id": "a", "text": "5:1"}, {"id": "b", "text": "15:2"}, {"id": "c", "text": "30:2"}, {"id": "d", "text": "10:1"}], "correctId": "c", "explanation": "1-rescuer: 30:2 (ทุกช่วงอายุ); 2-rescuer ในเด็ก/ทารก: 15:2"},
    {"id": "bls-6-q7", "question": "ผู้ช่วยเหลือคนเดียวพบทารกหมดสติโดยไม่มีใครเห็นเหตุการณ์ (unwitnessed) ควรทำอย่างไร?", "choices": [{"id": "a", "text": "โทรเรียก EMS ก่อนเสมอ แล้วค่อยเริ่ม CPR"}, {"id": "b", "text": "เริ่ม CPR ก่อนประมาณ 2 นาที แล้วค่อยโทรเรียก EMS (\"phone fast\")"}, {"id": "c", "text": "รอคนอื่นมาก่อนจึงเริ่มทำอะไร"}, {"id": "d", "text": "ไม่ต้องโทรเรียก EMS หากทำ CPR แล้ว"}], "correctId": "b", "explanation": "สาเหตุ arrest ในทารก/เด็กส่วนใหญ่เป็น asphyxial — เน้น CPR ก่อน ~2 นาที (\"phone fast\") ต่างจากผู้ใหญ่ที่เน้น \"phone first\""}
  ]'::jsonb
where id = '5be993fc-49ae-4a6b-82f6-aad7f2e8f05c';

-- ---------------------------------------------------------------------------
-- choking 1/2 — บทที่ 8: FBAO — ผู้ใหญ่ (lesson bls-7)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **ประเมินก่อน**: mild obstruction (ไอได้ พูดได้) → ให้ไอเอง อย่ารบกวน แต่เฝ้าดูต่อเนื่อง — อาจแย่ลงเป็น severe ได้ตลอดเวลา; severe (ไอไม่ออก พูดไม่ได้ จับคอ หน้าเขียว) → ช่วยทันที
- **ผู้ใหญ่/เด็ก ≥ 1 ปี (ILCOR 2025)**: 5 back blows (ก้มตัว ตบกลางสะบักด้วยส้นมือ) สลับกับ 5 abdominal thrusts (Heimlich — กำปั้นเหนือสะดือ ใต้ xiphoid กระตุกขึ้น-เข้าใน) จนกว่าสิ่งของออกหรือหมดสติ
- **หญิงตั้งครรภ์ระยะท้าย / อ้วนมาก**: ใช้ chest thrusts แทน abdominal thrusts (back blows ทำได้ปกติ)
- **หมดสติ**: เริ่ม CPR ทันที (ไม่ตรวจ pulse) — ดูในปากก่อนให้ breath แต่ละครั้ง เห็นสิ่งของจึงเอาออก **ห้าม blind finger sweep** ทุกช่วงวัย
- **เรียก EMS**: มีคนอื่น → สั่งไปโทร 1669 ทันที; อยู่คนเดียว → เริ่มช่วยก่อน ถ้ายังไม่หลุดใช้ speakerphone โทรพร้อมช่วยต่อ
- **หลังช่วยสำเร็จ**: ให้ EMS/แพทย์ประเมินต่อเสมอ — abdominal thrusts เสี่ยงบาดเจ็บอวัยวะภายใน และอาจมีเศษสิ่งของหลงเหลืออุดซ้ำ',
  quiz = '[
    {"id": "bls-7-q1", "question": "ผู้ใหญ่สำลักอาหาร พูดไม่ได้ จับคอ — ทำอะไรตามแนวทาง ILCOR 2025?", "choices": [{"id": "a", "text": "รอให้ไอเอง"}, {"id": "b", "text": "5 back blows สลับกับ 5 abdominal thrusts (Heimlich)"}, {"id": "c", "text": "ดื่มน้ำ"}, {"id": "d", "text": "ฉีดอะดรีนาลีน"}], "correctId": "b", "explanation": "ILCOR 2025: severe FBAO ใน adult/เด็ก ≥ 1 ปี ใช้ back blows สลับ abdominal thrusts (ครั้งละ 5) จนกว่าสิ่งของออกหรือผู้ป่วยหมดสติ"},
    {"id": "bls-7-q3", "question": "หญิงตั้งครรภ์ไตรมาส 3 สำลัก พูดไม่ได้ ควรทำอะไร?", "choices": [{"id": "a", "text": "Abdominal thrusts ตามปกติ"}, {"id": "b", "text": "Chest thrusts แทน abdominal thrusts"}, {"id": "c", "text": "Back blows อย่างเดียว"}, {"id": "d", "text": "ทำ CPR เลย"}], "correctId": "b", "explanation": "ครรภ์แก่ / อ้วนมาก: chest thrusts แทน abdominal เพื่อไม่กระทบมดลูก"},
    {"id": "bls-7-q5", "question": "ผู้ป่วย mild obstruction (ไอได้ พูดได้) ผู้ช่วยเหลือควรทำอย่างไรต่อ?", "choices": [{"id": "a", "text": "ปล่อยผู้ป่วยไอเองแล้วเดินจากไปได้เลย"}, {"id": "b", "text": "ให้ไอเอง อย่ารบกวน แต่เฝ้าดูต่อเนื่อง เพราะอาจแย่ลงเป็น severe ได้ตลอดเวลา"}, {"id": "c", "text": "เริ่ม abdominal thrusts ทันทีเพื่อความปลอดภัย"}, {"id": "d", "text": "ให้ดื่มน้ำเพื่อช่วยให้สิ่งของหลุด"}], "correctId": "b", "explanation": "Mild obstruction ให้ไอเองแต่ต้องเฝ้าดูต่อเนื่อง — ถ้าเริ่มไอไม่ออก/พูดไม่ได้ต้องเปลี่ยนมาช่วยด้วย back blows/abdominal thrusts ทันที"},
    {"id": "bls-7-q6", "question": "ผู้ช่วยเหลือคนเดียวช่วยผู้ใหญ่ที่สำลักอยู่ ควรเรียก EMS เมื่อไร?", "choices": [{"id": "a", "text": "ต้องโทรเรียก EMS ก่อนเสมอ ก่อนเริ่มช่วยเหลือใด ๆ"}, {"id": "b", "text": "ถ้ามีคนอื่นอยู่ด้วยให้สั่งไปโทรทันที; ถ้าอยู่คนเดียวให้เริ่มช่วยก่อน แล้วใช้ speakerphone ถ้ายังไม่หลุด"}, {"id": "c", "text": "ไม่ต้องโทรเรียก EMS หากสิ่งของหลุดออกแล้ว"}, {"id": "d", "text": "รอให้ผู้ป่วยหมดสติก่อนจึงโทร"}], "correctId": "b", "explanation": "มีคนอื่นอยู่ด้วย → สั่งโทรทันที; อยู่คนเดียว → เริ่มช่วยเหลือก่อน แล้วใช้ speakerphone โทรขอความช่วยเหลือถ้ายังไม่หลุด (หลักเดียวกับบทที่ 4)"}
  ]'::jsonb
where id = 'db3e7443-91d1-4619-9480-28445e496a01';

-- ---------------------------------------------------------------------------
-- choking 2/2 — บทที่ 8: FBAO — เด็ก (lesson bls-7)
-- ---------------------------------------------------------------------------
update public.video_lessons set
  key_points = '- **ทารก < 1 ปี (รู้สึกตัว)**: **ห้าม abdominal thrust** (เสี่ยง liver injury) — ใช้ back blows 5 ครั้ง (วางคว่ำหน้าบนแขน หัวต่ำ ตบกลางสะบัก) สลับ chest thrusts 5 ครั้ง (2 นิ้ว ครึ่งล่างของ sternum ตำแหน่งเดียวกับ CPR ทารก) ทำซ้ำจนสิ่งของออก
- **เด็ก ≥ 1 ปี**: ใช้แนวทางเดียวกับผู้ใหญ่ — 5 back blows สลับ 5 abdominal thrusts
- **หมดสติ**: เริ่ม CPR ทันที (ไม่ตรวจ pulse) — ดูในปากก่อนให้ breath แต่ละครั้ง เห็นสิ่งของจึงเอาออก **ห้าม blind finger sweep** ทุกช่วงวัย เสี่ยงดันสิ่งของเข้าลึก
- **หลังช่วยสำเร็จ**: ให้ EMS/แพทย์ประเมินต่อเสมอ — เสี่ยงบาดเจ็บอวัยวะภายใน และอาจมีเศษสิ่งของหลงเหลืออุดกั้นซ้ำ',
  quiz = '[
    {"id": "bls-7-q2", "question": "ทารก (< 1 ปี) สำลัก รู้สึกตัว ทำอะไร?", "choices": [{"id": "a", "text": "Abdominal thrust 5 ครั้ง"}, {"id": "b", "text": "Back blows 5 ครั้ง สลับ chest thrusts 5 ครั้ง"}, {"id": "c", "text": "เริ่ม CPR ทันที"}, {"id": "d", "text": "ฉีดน้ำเข้าจมูก"}], "correctId": "b", "explanation": "ทารกใช้ back blows + chest thrusts (ห้าม abdominal thrust เสี่ยง liver injury)"},
    {"id": "bls-7-q4", "question": "ผู้ป่วย FBAO หมดสติแล้ว ทำอะไรต่อ?", "choices": [{"id": "a", "text": "Abdominal thrusts ต่อ"}, {"id": "b", "text": "เริ่ม CPR ทันที และดูในปากก่อนแต่ละ breath"}, {"id": "c", "text": "รอ EMS"}, {"id": "d", "text": "ทำ blind finger sweep"}], "correctId": "b", "explanation": "หมดสติ → เริ่ม CPR; ดูในปากก่อนแต่ละ breath ถ้าเห็นสิ่งของเอาออก ห้าม blind finger sweep"},
    {"id": "bls-7-q7", "question": "หลังช่วยเหลือ FBAO สำเร็จ สิ่งของหลุดออกและผู้ป่วยหายใจปกติแล้ว ควรทำอย่างไรต่อ?", "choices": [{"id": "a", "text": "ถือว่าจบเหตุการณ์ ไม่ต้องทำอะไรต่อ"}, {"id": "b", "text": "ยังควรให้ EMS/แพทย์ประเมินต่อ เพราะ thrusts เสี่ยงบาดเจ็บอวัยวะภายในและอาจมีเศษสิ่งของหลงเหลือ"}, {"id": "c", "text": "ให้ผู้ป่วยกลับบ้านได้ทันที"}, {"id": "d", "text": "ทำ abdominal thrusts ซ้ำเพื่อความมั่นใจ"}], "correctId": "b", "explanation": "Abdominal thrusts เสี่ยงบาดเจ็บอวัยวะภายในแม้ทำถูกวิธี และ partial FBAO อาจหลงเหลือ/อุดกั้นซ้ำได้ — ควรให้ EMS/แพทย์ประเมินต่อเสมอ"}
  ]'::jsonb
where id = '25a0cef1-a050-40da-a9ed-81d8c2f82d2a';

commit;

-- ตรวจผลหลังรัน: ทุกแถว bls ต้องมี key_points + quiz ครบ
-- select topic, sort_order, title, length(key_points) kp, jsonb_array_length(quiz) qn
-- from video_lessons where course_mode='bls' order by topic, sort_order;
