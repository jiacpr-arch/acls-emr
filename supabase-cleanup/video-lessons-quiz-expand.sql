-- ============================================================================
-- video_lessons: QUIZ EXPANSION (DRAFT) — ขยายควิซเป็น 3 ข้อ/คลิป + คำอธิบายเฉลย
-- ----------------------------------------------------------------------------
-- ⚠️  ยังไม่ได้ APPLY และ "ต้องให้อาจารย์ตรวจ/แก้ก่อน" — เป็นเนื้อหาเวชปฏิบัติ
--     ร่างจาก key_points/chapters เดิมใน video-lessons-fill-content-v2.sql
--     เพื่อเป็นจุดตั้งต้น ให้แก้ถ้อยคำ/เพิ่มคำอธิบายให้ครบผ่าน:
--       (ก) หน้าแอดมิน /admin/video-lessons  (แก้ทีละคลิปในส่วน "✅ C · ควิซ")
--       (ข) หรือรัน SQL นี้เองหลังตรวจแล้ว
--
-- โครง quiz (jsonb array) — แต่ละข้อ:
--   { "id": "<8-char>", "question": "...", "correctId": "a|b|c|d",
--     "explanation": "...",
--     "choices": [ { "id": "a", "text": "..." }, ... ] }
--   * correctId อ้างอิงจาก choice.id (ไม่อิงตำแหน่ง) — ฝั่ง UI สลับลำดับตัวเลือกให้เอง
--   * ข้อแรกของแต่ละคลิปคงคำถาม/ id เดิมไว้ แล้วเติม explanation + เพิ่มอีก 2 ข้อ
--   * เกณฑ์ผ่าน ACLS ≥70% → 3 ข้อต้องถูก 3/3 (2/3=67% ไม่ผ่าน)
-- ============================================================================

begin;

-- Airway 1 : Head tilt–chin lift & Jaw thrust
update public.video_lessons set quiz = '[
  {"id":"6da91268","question":"ท่าใดใช้เปิดทางเดินหายใจเมื่อสงสัยบาดเจ็บกระดูกคอ?","correctId":"a","explanation":"Jaw thrust ยกขากรรไกรโดยไม่แหงนคอ จึงเหมาะเมื่อสงสัยบาดเจ็บกระดูกคอ","choices":[{"id":"a","text":"Jaw thrust"},{"id":"b","text":"Head tilt–chin lift"},{"id":"c","text":"กดหน้าอก"},{"id":"d","text":"ให้ Adenosine"}]},
  {"id":"a1q20001","question":"ท่า Head tilt–chin lift ทำอย่างไร?","correctId":"a","explanation":"วางมือที่หน้าผากดันศีรษะไปด้านหลังพร้อมยกคางขึ้น ใช้กับผู้ป่วยทั่วไปที่ไม่สงสัยบาดเจ็บคอ","choices":[{"id":"a","text":"วางมือที่หน้าผาก แล้วยกคางขึ้น"},{"id":"b","text":"กดบริเวณกลางหน้าอก"},{"id":"c","text":"บีบจมูกแล้วเป่าปาก"},{"id":"d","text":"ยกขากรรไกรโดยไม่แตะศีรษะ"}]},
  {"id":"a1q30002","question":"สาเหตุการอุดตันทางเดินหายใจที่พบบ่อยในผู้ป่วยหมดสติคือ?","correctId":"b","explanation":"เมื่อหมดสติกล้ามเนื้อคลายตัว โคนลิ้นตกไปด้านหลังปิดทางเดินหายใจ การเปิดทางเดินหายใจด้วยมือจึงช่วยได้","choices":[{"id":"a","text":"ความดันโลหิตสูง"},{"id":"b","text":"ลิ้น (โคนลิ้น) ตกไปด้านหลัง"},{"id":"c","text":"หัวใจเต้นเร็ว"},{"id":"d","text":"ไข้สูง"}]}
]'::jsonb where id = 'f57784c8-c0f3-488d-9485-e7c24d4bc649';

-- Airway 2 : OPA
update public.video_lessons set quiz = '[
  {"id":"35c8baf6","question":"OPA ใช้ไม่ได้กับผู้ป่วยแบบใด?","correctId":"b","explanation":"OPA กระตุ้น gag reflex ในผู้ที่ยังรู้สึกตัว ทำให้อาเจียน/สำลัก ใช้เฉพาะผู้ป่วยหมดสติที่ไม่มี gag reflex","choices":[{"id":"a","text":"ผู้ป่วยที่ไม่มี gag reflex"},{"id":"b","text":"ผู้ป่วยที่ยังรู้สึกตัว/มี gag reflex"},{"id":"c","text":"ผู้ป่วยหมดสติ"},{"id":"d","text":"ผู้ป่วยหัวใจหยุดเต้น"}]},
  {"id":"a2q20003","question":"วัดขนาด OPA ให้พอดีโดยเทียบระยะใด?","correctId":"a","explanation":"วัดจากมุมปากถึงติ่งหู (หรือมุมขากรรไกร) เพื่อให้ปลายอุปกรณ์อยู่ตำแหน่งพอดี","choices":[{"id":"a","text":"มุมปากถึงติ่งหู"},{"id":"b","text":"ปลายจมูกถึงคาง"},{"id":"c","text":"ความยาวของนิ้วชี้"},{"id":"d","text":"ระยะระหว่างตาสองข้าง"}]},
  {"id":"a2q30004","question":"OPA ช่วยเปิดทางเดินหายใจโดยหลักการใด?","correctId":"c","explanation":"OPA ยกโคนลิ้นไม่ให้ตกไปปิดทางเดินหายใจส่วนบน","choices":[{"id":"a","text":"เพิ่มความดันในปอด"},{"id":"b","text":"ดูดเสมหะออก"},{"id":"c","text":"ยกโคนลิ้นไม่ให้ตกปิดทางเดินหายใจ"},{"id":"d","text":"ให้ออกซิเจนความเข้มข้นสูง"}]}
]'::jsonb where id = 'e9ddcd7e-2682-4abc-97ff-ff5a5a8dc36f';

-- Airway 3 : NPA
update public.video_lessons set quiz = '[
  {"id":"4555f8e0","question":"เลือกขนาด NPA โดยเทียบกับอะไร?","correctId":"c","explanation":"เทียบเส้นผ่านศูนย์กลางกับนิ้วก้อยของผู้ป่วยเพื่อประมาณขนาดที่พอดี","choices":[{"id":"a","text":"อายุผู้ป่วย"},{"id":"b","text":"ความสูงของผู้ป่วย"},{"id":"c","text":"ขนาดนิ้วก้อยของผู้ป่วย"},{"id":"d","text":"น้ำหนักผู้ป่วย"}]},
  {"id":"a3q20005","question":"ควรระวังการใส่ NPA ในผู้ป่วยกลุ่มใดเป็นพิเศษ?","correctId":"a","explanation":"ผู้ที่มีเลือดกำเดา/บาดเจ็บใบหน้าหรือฐานกะโหลก เสี่ยงเลือดออกหรือใส่ผิดทาง","choices":[{"id":"a","text":"ผู้ป่วยเลือดกำเดาออก/บาดเจ็บใบหน้า"},{"id":"b","text":"ผู้ป่วยหมดสติทุกราย"},{"id":"c","text":"ผู้ป่วยที่หายใจปกติ"},{"id":"d","text":"ผู้ป่วยเด็กเท่านั้น"}]},
  {"id":"a3q30006","question":"ใส่ NPA ไปตามแนวใด?","correctId":"b","explanation":"สอดตามแนวผนังจมูก (ขนานกับเพดานปาก) ไม่ใช่ดันขึ้นบน","choices":[{"id":"a","text":"เฉียงขึ้นด้านบน"},{"id":"b","text":"ตามแนวผนังจมูก (ขนานพื้นเพดานปาก)"},{"id":"c","text":"หมุนเป็นเกลียว"},{"id":"d","text":"ดันแรงที่สุดเท่าที่ทำได้"}]}
]'::jsonb where id = '86da4935-c011-4798-b3ac-bcfab55a11dc';

-- Airway 4 : BVM
update public.video_lessons set quiz = '[
  {"id":"6b6aa73b","question":"ขนาดถุงเก็บอากาศ (reservoir) สำหรับผู้ใหญ่ประมาณเท่าใด?","correctId":"d","explanation":"ถุงบีบผู้ใหญ่ประมาณ 1600–2000 ml (เด็ก 450–750 ml, ทารก 240 ml)","choices":[{"id":"a","text":"100 ml"},{"id":"b","text":"240 ml"},{"id":"c","text":"450-750 ml"},{"id":"d","text":"1600-2000 ml"}]},
  {"id":"a4q20007","question":"การวางหน้ากาก BVM ที่ถูกต้องคือ?","correctId":"a","explanation":"ด้านแหลมของหน้ากากครอบที่สันจมูก ด้านป้านครอบที่คาง เพื่อให้แนบสนิทไม่รั่ว","choices":[{"id":"a","text":"ด้านแหลมที่จมูก ด้านป้านที่คาง"},{"id":"b","text":"ด้านแหลมที่คาง ด้านป้านที่จมูก"},{"id":"c","text":"วางกลับด้านอย่างไรก็ได้"},{"id":"d","text":"ครอบเฉพาะปาก"}]},
  {"id":"a4q30008","question":"ก่อนใช้ BVM ควรทำอะไร?","correctId":"b","explanation":"ต่อออกซิเจนและตรวจว่าถุง reservoir พองก่อนใช้ เพื่อให้ได้ออกซิเจนเข้มข้นสูง","choices":[{"id":"a","text":"ให้ยา sedate ก่อน"},{"id":"b","text":"ต่อออกซิเจนและตรวจ reservoir"},{"id":"c","text":"ช็อกไฟฟ้า"},{"id":"d","text":"ใส่ท่อ ETT ก่อนเสมอ"}]}
]'::jsonb where id = '8a1feee4-dc13-4b9d-b016-1c81fe9d8693';

-- Airway 5 : ETT
update public.video_lessons set quiz = '[
  {"id":"e3c52a6d","question":"ก่อนใส่ท่อช่วยหายใจในผู้ป่วยที่ยังมีปฏิกิริยา ควรทำอะไร?","correctId":"a","explanation":"ให้ยาระงับความรู้สึก (sedate) เพื่อลดปฏิกิริยาและทำให้ใส่ท่อได้ปลอดภัย","choices":[{"id":"a","text":"ให้ยาระงับความรู้สึก (sedate)"},{"id":"b","text":"ให้ Adenosine"},{"id":"c","text":"ไม่ต้องเตรียมอะไร"},{"id":"d","text":"ช็อกไฟฟ้า"}]},
  {"id":"a5q20009","question":"หลังใส่ท่อ ETT แล้วต้องทำสิ่งใดเสมอ?","correctId":"c","explanation":"ต้องยืนยันตำแหน่งท่อ (ฟังปอด/ดู chest rise/EtCO2) ว่าท่ออยู่ในหลอดลมจริง","choices":[{"id":"a","text":"ถอดออกทันที"},{"id":"b","text":"ให้ Atropine"},{"id":"c","text":"ยืนยันตำแหน่งท่อ"},{"id":"d","text":"ไม่ต้องตรวจสอบ"}]},
  {"id":"a5q30010","question":"อุปกรณ์หลักที่ใช้เปิดช่องปากเพื่อมองสายเสียงขณะใส่ท่อคือ?","correctId":"b","explanation":"ใช้ laryngoscope พร้อมเบลดในการเปิดช่องปากและมองเห็นสายเสียง","choices":[{"id":"a","text":"เครื่องดูดเสมหะ"},{"id":"b","text":"laryngoscope และเบลด"},{"id":"c","text":"เครื่อง defibrillator"},{"id":"d","text":"OPA"}]}
]'::jsonb where id = '31ffa0b0-7262-45f6-a08e-3e8d3b7328d3';

-- EKG 1 : ภาพรวม EKG & tachycardia
update public.video_lessons set quiz = '[
  {"id":"e1e301c5","question":"SVT มีลักษณะ QRS อย่างไร?","correctId":"b","explanation":"SVT มี QRS แคบและอัตราเร็วมาก คลื่น P มักไม่เห็น","choices":[{"id":"a","text":"เส้นแบน"},{"id":"b","text":"QRS แคบ อัตราเร็วมาก"},{"id":"c","text":"QRS กว้าง"},{"id":"d","text":"ไม่มี QRS"}]},
  {"id":"k1q20011","question":"Atrial Fibrillation (AF) มีลักษณะเด่นคือ?","correctId":"c","explanation":"AF ไม่มี P wave ชัดเจนและจังหวะไม่สม่ำเสมอ (irregularly irregular)","choices":[{"id":"a","text":"P wave ชัดเจนทุกตัว จังหวะสม่ำเสมอ"},{"id":"b","text":"QRS กว้างสม่ำเสมอ"},{"id":"c","text":"ไม่มี P wave จังหวะไม่สม่ำเสมอ"},{"id":"d","text":"เส้นแบนราบ"}]},
  {"id":"k1q30012","question":"VT ที่ไม่มีชีพจร (pulseless VT) รักษาด้วยวิธีใด?","correctId":"a","explanation":"pulseless VT เป็นจังหวะช็อกได้ ต้อง CPR ร่วมกับ defibrillation (ไม่ใช่ synchronized)","choices":[{"id":"a","text":"CPR และ defibrillation"},{"id":"b","text":"Synchronized cardioversion"},{"id":"c","text":"ให้ Adenosine"},{"id":"d","text":"ให้ Atropine"}]}
]'::jsonb where id = '16aa9e8d-d04f-4d92-ad7e-2b3d3112f7e1';

-- EKG 2 : bradycardia & AV block
update public.video_lessons set quiz = '[
  {"id":"af656fd7","question":"AV block ชนิด Mobitz II มีความสำคัญอย่างไร?","correctId":"c","explanation":"Mobitz II มีความเสี่ยงกลายเป็น complete heart block มักต้องใช้ pacemaker","choices":[{"id":"a","text":"ไม่อันตราย"},{"id":"b","text":"หายได้เอง"},{"id":"c","text":"อันตราย มักต้องใช้ pacemaker"},{"id":"d","text":"รักษาด้วย Adenosine"}]},
  {"id":"k2q20013","question":"การอ่าน AV block ต้องดูความสัมพันธ์ของอะไร?","correctId":"b","explanation":"ดูความสัมพันธ์ระหว่าง P wave กับ QRS ว่านำกันอย่างไรและมี beat หลุดหรือไม่","choices":[{"id":"a","text":"คลื่น T กับ U"},{"id":"b","text":"P wave กับ QRS"},{"id":"c","text":"ความสูงของ QRS"},{"id":"d","text":"สี ของกราฟ"}]},
  {"id":"k2q30014","question":"ลักษณะเด่นของ Mobitz II คือ?","correctId":"a","explanation":"ช่วง PR คงที่แต่จู่ ๆ มี QRS หลุดหายไปโดยไม่มีการยืด PR ล่วงหน้า","choices":[{"id":"a","text":"PR คงที่ แต่มี beat หลุดกระทันหัน"},{"id":"b","text":"PR ยาวขึ้นเรื่อย ๆ จน beat หลุด"},{"id":"c","text":"ไม่มี P wave"},{"id":"d","text":"QRS แคบและเร็ว"}]}
]'::jsonb where id = 'a151e109-ade2-496b-a832-4f25bff11f9d';

-- EKG 3 : แยกมีชีพจร/ไม่มีชีพจร
update public.video_lessons set quiz = '[
  {"id":"7045d5ec","question":"จังหวะที่ไม่มีชีพจร เช่น VF/VT ต้องทำอย่างไร?","correctId":"d","explanation":"จังหวะไม่มีชีพจรที่ช็อกได้ ต้องเริ่ม CPR และช็อกไฟฟ้าทันที","choices":[{"id":"a","text":"ให้ยาลดความดัน"},{"id":"b","text":"รอดูอาการ"},{"id":"c","text":"สังเกตอาการ"},{"id":"d","text":"เริ่ม CPR และช็อกไฟฟ้า"}]},
  {"id":"k3q20015","question":"สิ่งใดต้องประเมินควบคู่กับการดู monitor เสมอ?","correctId":"b","explanation":"ต้องประเมินผู้ป่วย (คลำชีพจร/การตอบสนอง) ควบคู่ ไม่ตัดสินจากกราฟอย่างเดียว","choices":[{"id":"a","text":"สีของหน้าจอ"},{"id":"b","text":"ประเมินผู้ป่วย เช่น คลำชีพจร"},{"id":"c","text":"เสียงเครื่อง"},{"id":"d","text":"ยี่ห้อเครื่อง"}]},
  {"id":"k3q30016","question":"จังหวะแบบใดจัดเป็น ไม่มีชีพจร ที่ต้องช็อก?","correctId":"c","explanation":"VF และ pulseless VT เป็นจังหวะช็อกได้ (shockable) ที่ไม่มีชีพจร","choices":[{"id":"a","text":"Normal sinus rhythm"},{"id":"b","text":"SVT ที่ยังมีชีพจร"},{"id":"c","text":"VF และ pulseless VT"},{"id":"d","text":"Sinus bradycardia มีชีพจร"}]}
]'::jsonb where id = '055668cb-f4c2-4cbe-bf66-a8d0e78f2cd4';

-- Defib 1 : Monitor & Lead
update public.video_lessons set quiz = '[
  {"id":"851ab895","question":"lead มาตรฐานที่ใช้ดูจังหวะหัวใจคือ?","correctId":"a","explanation":"Lead II เป็น lead มาตรฐานที่ใช้ดูจังหวะเพราะเห็น P wave และ QRS ชัด","choices":[{"id":"a","text":"Lead II"},{"id":"b","text":"V6"},{"id":"c","text":"ไม่มีมาตรฐาน"},{"id":"d","text":"Lead aVR"}]},
  {"id":"d1q20017","question":"สิ่งใดทำให้เกิดสัญญาณรบกวน (artifact) บน monitor?","correctId":"b","explanation":"การขยับตัวของผู้ป่วยทำให้เกิดสัญญาณรบกวน ควรให้ผู้ป่วยอยู่นิ่งขณะอ่าน","choices":[{"id":"a","text":"การหายใจปกติ"},{"id":"b","text":"การขยับตัวของผู้ป่วย"},{"id":"c","text":"แสงในห้อง"},{"id":"d","text":"เสียงพูด"}]},
  {"id":"d1q30018","question":"หลักสำคัญของการติด lead/แผ่นบนตัวผู้ป่วยคือ?","correctId":"c","explanation":"ต้องติดให้ถูกตำแหน่งบนตัวผู้ป่วยเพื่อให้อ่านจังหวะได้ถูกต้อง","choices":[{"id":"a","text":"ติดที่ใดก็ได้"},{"id":"b","text":"ติดบนเสื้อผ้า"},{"id":"c","text":"ติดให้ถูกตำแหน่งบนตัวผู้ป่วย"},{"id":"d","text":"ติดเฉพาะขาข้างเดียว"}]}
]'::jsonb where id = 'bd6f9021-fc66-4c61-849b-624dbd30472d';

-- Defib 2 : Defibrillation ด้วย Paddle
update public.video_lessons set quiz = '[
  {"id":"ef53d68d","question":"ก่อนปล่อยกระแสไฟฟ้าต้องทำอะไร?","correctId":"b","explanation":"ต้องประกาศให้ทุกคนถอยห่าง (clear) เพื่อความปลอดภัยก่อนปล่อยกระแส","choices":[{"id":"a","text":"ให้ยา"},{"id":"b","text":"ประกาศให้ทุกคนถอยห่าง (clear)"},{"id":"c","text":"เพิ่มพลังงานสองเท่า"},{"id":"d","text":"กดหน้าอกต่อ"}]},
  {"id":"d2q20019","question":"ตำแหน่งวางแพดเดิลที่ถูกต้องคือ?","correctId":"a","explanation":"วางตำแหน่ง Sternum–Apex (ใต้กระดูกไหปลาร้าขวา และแนวรักแร้ซ้าย)","choices":[{"id":"a","text":"Sternum–Apex"},{"id":"b","text":"ที่หน้าท้องทั้งสองข้าง"},{"id":"c","text":"ที่หลังทั้งสองข้าง"},{"id":"d","text":"ที่คอ"}]},
  {"id":"d2q30020","question":"Defibrillation ด้วย paddle ใช้กับจังหวะใด?","correctId":"c","explanation":"ใช้กับ VF และ pulseless VT ซึ่งเป็นจังหวะช็อกได้ที่ไม่มีชีพจร","choices":[{"id":"a","text":"Normal sinus"},{"id":"b","text":"Sinus bradycardia"},{"id":"c","text":"VF และ pulseless VT"},{"id":"d","text":"AV block"}]}
]'::jsonb where id = '799adb29-1d25-4b7c-a366-284f493f9803';

-- Defib 3 : Synchronized Cardioversion
update public.video_lessons set quiz = '[
  {"id":"83a92c4d","question":"Synchronized cardioversion ปล่อยพลังงานตรงกับอะไร?","correctId":"c","explanation":"ปล่อยพลังงานตรงกับคลื่น R เพื่อหลีกเลี่ยงช่วงเปราะบาง (T wave) ที่อาจกระตุ้น VF","choices":[{"id":"a","text":"คลื่น P"},{"id":"b","text":"คลื่น T"},{"id":"c","text":"คลื่น R (R wave)"},{"id":"d","text":"ปล่อยเมื่อไรก็ได้"}]},
  {"id":"d3q20021","question":"Synchronized cardioversion ใช้กับผู้ป่วยแบบใด?","correctId":"a","explanation":"ใช้กับผู้ป่วยที่ยังมีชีพจรแต่ไม่คงที่ (unstable) จากจังหวะเต้นเร็วผิดปกติ","choices":[{"id":"a","text":"ผู้ป่วยที่ยังมีชีพจรแต่ไม่คงที่"},{"id":"b","text":"ผู้ป่วยหัวใจหยุดเต้นไม่มีชีพจร"},{"id":"c","text":"ผู้ป่วยหายใจปกติทุกราย"},{"id":"d","text":"ผู้ป่วย bradycardia"}]},
  {"id":"d3q30022","question":"ก่อนปล่อยพลังงานทุกครั้งต้องทำสิ่งใด?","correctId":"b","explanation":"ต้องประกาศถอย (clear) ให้ทุกคนห่างจากผู้ป่วยก่อนปล่อยพลังงาน","choices":[{"id":"a","text":"กดหน้าอกต่อไป"},{"id":"b","text":"ประกาศถอย (clear)"},{"id":"c","text":"ปิดเครื่อง monitor"},{"id":"d","text":"ให้ยา Adenosine"}]}
]'::jsonb where id = '186d986e-a4cc-4723-bb32-1db642521163';

-- Defib 4 : Transcutaneous Pacing
update public.video_lessons set quiz = '[
  {"id":"ee9cf796","question":"การยืนยันว่า pacing ได้ผล (capture) ดูจากอะไร?","correctId":"d","explanation":"electrical capture = มี QRS ตามหลังเข็ม pacing; mechanical capture = คลำชีพจรได้ตามอัตรา","choices":[{"id":"a","text":"เสียงเตือนดัง"},{"id":"b","text":"ไม่ต้องตรวจสอบ"},{"id":"c","text":"หน้าจอดับ"},{"id":"d","text":"มี QRS ตามหลัง pacing และคลำชีพจรได้"}]},
  {"id":"d4q20023","question":"Transcutaneous pacing ใช้สำหรับภาวะใด?","correctId":"a","explanation":"ใช้กับ bradycardia ที่มีอาการ (symptomatic) โดยเฉพาะเมื่อ Atropine ไม่ได้ผล","choices":[{"id":"a","text":"Bradycardia ที่มีอาการ"},{"id":"b","text":"VF"},{"id":"c","text":"SVT ที่คงที่"},{"id":"d","text":"ความดันสูง"}]},
  {"id":"d4q30024","question":"ควรตั้งอัตรา pacing ประมาณเท่าใด?","correctId":"b","explanation":"ตั้งอัตราประมาณ 70–80 ครั้ง/นาที แล้วเพิ่ม mA จนเกิด capture","choices":[{"id":"a","text":"30-40 ครั้ง/นาที"},{"id":"b","text":"70-80 ครั้ง/นาที"},{"id":"c","text":"150-180 ครั้ง/นาที"},{"id":"d","text":"ไม่ต้องตั้งอัตรา"}]}
]'::jsonb where id = 'b8ff6f12-045d-4c86-9e5f-438ef2bd0295';

-- Bradycardia 1 : Algorithm & Atropine
update public.video_lessons set quiz = '[
  {"id":"827f2beb","question":"ยา first-line ใน symptomatic bradycardia คือ?","correctId":"a","explanation":"Atropine เป็นยา first-line ในภาวะหัวใจเต้นช้าที่มีอาการ","choices":[{"id":"a","text":"Atropine"},{"id":"b","text":"Aspirin"},{"id":"c","text":"Adenosine"},{"id":"d","text":"Amiodarone"}]},
  {"id":"b1q20025","question":"การประเมินผู้ป่วย bradycardia แบ่งออกเป็น?","correctId":"c","explanation":"แบ่งเป็น stable กับ unstable เพื่อตัดสินใจการรักษา (ยา vs pacing)","choices":[{"id":"a","text":"ร้อน/เย็น"},{"id":"b","text":"เด็ก/ผู้ใหญ่"},{"id":"c","text":"stable/unstable"},{"id":"d","text":"เช้า/บ่าย"}]},
  {"id":"b1q30026","question":"หลังให้ยาในภาวะ bradycardia ควรทำอะไรต่อ?","correctId":"b","explanation":"ต้องประเมินซ้ำหลังให้ยาเพื่อดูการตอบสนองและวางแผนขั้นถัดไป","choices":[{"id":"a","text":"หยุดดูแลทันที"},{"id":"b","text":"ประเมินซ้ำ"},{"id":"c","text":"ช็อกไฟฟ้า"},{"id":"d","text":"ให้ Adenosine"}]}
]'::jsonb where id = '454c97f1-aa8a-43db-a02d-d362a004f3e6';

-- Bradycardia 2 : Unstable → Pacing
update public.video_lessons set quiz = '[
  {"id":"d21e3546","question":"เมื่อ pacing ที่ 72 mA ยังไม่ capture ควรทำอย่างไร?","correctId":"b","explanation":"เพิ่ม mA ขึ้นเรื่อย ๆ จนเกิด capture (ในคลิปที่ 78 mA จึง capture)","choices":[{"id":"a","text":"ช็อกไฟฟ้า"},{"id":"b","text":"เพิ่ม mA ให้สูงขึ้นจนเกิด capture"},{"id":"c","text":"ลด mA ลง"},{"id":"d","text":"หยุด pacing"}]},
  {"id":"b2q20027","question":"เมื่อ Atropine ไม่ได้ผลใน bradycardia ที่ไม่คงที่ ควรทำอะไร?","correctId":"a","explanation":"พิจารณา transcutaneous pacing เมื่อ Atropine ไม่ได้ผลหรือผู้ป่วยไม่คงที่","choices":[{"id":"a","text":"ใช้ transcutaneous pacing"},{"id":"b","text":"ให้ Aspirin"},{"id":"c","text":"รอสังเกตอาการ"},{"id":"d","text":"ให้ Adenosine"}]},
  {"id":"b2q30028","question":"ยาเสริม (drip) สำหรับ bradycardia ที่ดื้อการรักษาได้แก่?","correctId":"c","explanation":"Dopamine และ Epinephrine drip เป็นทางเลือกเมื่อ pacing/Atropine ไม่พอ","choices":[{"id":"a","text":"Amiodarone, Adenosine"},{"id":"b","text":"Aspirin, Nitroglycerin"},{"id":"c","text":"Dopamine, Epinephrine drip"},{"id":"d","text":"Atropine, Adenosine"}]}
]'::jsonb where id = '11fe23c7-c445-49e3-9181-1bf2fd921154';

-- Tachycardia 1 : Algorithm & Stable SVT
update public.video_lessons set quiz = '[
  {"id":"fe8f02da","question":"ขั้นแรกในการรักษา stable SVT คือ?","correctId":"c","explanation":"เริ่มด้วย vagal maneuver เช่น Valsalva ก่อนใช้ยา","choices":[{"id":"a","text":"ให้ Atropine"},{"id":"b","text":"Synchronized cardioversion"},{"id":"c","text":"Vagal maneuver (เช่น Valsalva)"},{"id":"d","text":"Defibrillation"}]},
  {"id":"t1q20029","question":"ผู้ป่วยคงที่ที่มี QRS แคบและสม่ำเสมออัตราเร็ว วินิจฉัยเป็น?","correctId":"a","explanation":"ลักษณะ QRS แคบสม่ำเสมออัตราเร็วในผู้ป่วยคงที่เข้าได้กับ SVT","choices":[{"id":"a","text":"SVT"},{"id":"b","text":"VF"},{"id":"c","text":"Asystole"},{"id":"d","text":"Sinus bradycardia"}]},
  {"id":"t1q30030","question":"การประเมินผู้ป่วย tachycardia แบ่งออกเป็น?","correctId":"b","explanation":"แบ่งเป็น stable/unstable เพื่อเลือกแนวทาง (vagal/ยา vs cardioversion)","choices":[{"id":"a","text":"เด็ก/ผู้ใหญ่"},{"id":"b","text":"stable/unstable"},{"id":"c","text":"มีไข้/ไม่มีไข้"},{"id":"d","text":"นั่ง/นอน"}]}
]'::jsonb where id = '4a7ac653-ce5c-405b-ae45-27fb232f76d3';

-- Tachycardia 2 : Adenosine & Synchronized Cardioversion
update public.video_lessons set quiz = '[
  {"id":"0a6e03eb","question":"เทคนิค Double T-way ในการให้ Adenosine คือ?","correctId":"d","explanation":"ฉีด Adenosine เร็วพร้อม flush น้ำเกลือทันที เพราะยาสลายเร็วมาก","choices":[{"id":"a","text":"ผสมกับยาอื่น"},{"id":"b","text":"ฉีดช้าๆ"},{"id":"c","text":"หยดเข้าหลอดเลือด"},{"id":"d","text":"ฉีดยาเร็วพร้อม flush น้ำเกลือทันที"}]},
  {"id":"t2q20031","question":"ก่อนให้ Adenosine ควรเตรียมสิ่งใดให้พร้อม?","correctId":"a","explanation":"เตรียม saline flush ให้พร้อมเพื่อ flush ทันทีหลังฉีดยา","choices":[{"id":"a","text":"saline flush"},{"id":"b","text":"เครื่องกระตุกหัวใจแบบ paddle เท่านั้น"},{"id":"c","text":"ยา Atropine"},{"id":"d","text":"เจลอัลตราซาวด์"}]},
  {"id":"t2q30032","question":"หากผู้ป่วย SVT ไม่คงที่ (unstable) ควรทำอย่างไร?","correctId":"c","explanation":"ผู้ป่วยไม่คงที่ให้ synchronized cardioversion (เช่น 100J→200J)","choices":[{"id":"a","text":"รอสังเกตอาการ"},{"id":"b","text":"ให้ยาลดไข้"},{"id":"c","text":"Synchronized cardioversion"},{"id":"d","text":"ให้ Atropine"}]}
]'::jsonb where id = 'f88ba57a-c09c-405c-a6b1-65ca2135ecaa';

-- Cardiac Arrest 1 : Megacode
update public.video_lessons set quiz = '[
  {"id":"bc267c7e","question":"ยาต้านหัวใจเต้นผิดจังหวะที่ให้ใน VF/VT ดื้อการช็อก (ในคลิป 300 mg) คือ?","correctId":"a","explanation":"Amiodarone (Cordarone) 300 mg เป็นยาต้านจังหวะใน VF/pulseless VT ที่ดื้อการช็อก","choices":[{"id":"a","text":"Amiodarone (Cordarone)"},{"id":"b","text":"Adenosine"},{"id":"c","text":"Adrenaline"},{"id":"d","text":"Atropine"}]},
  {"id":"c1q20033","question":"ในภาวะหัวใจหยุดเต้น ควรทำ CPR/ประเมินจังหวะเป็นรอบละกี่นาที?","correctId":"b","explanation":"ทำ CPR คุณภาพสูงเป็นรอบละ 2 นาที แล้วประเมินจังหวะ/ชีพจร","choices":[{"id":"a","text":"30 วินาที"},{"id":"b","text":"2 นาที"},{"id":"c","text":"10 นาที"},{"id":"d","text":"20 นาที"}]},
  {"id":"c1q30034","question":"ยากระตุ้นหลอดเลือด (vasopressor) ที่ให้ในภาวะหัวใจหยุดเต้นคือ?","correctId":"c","explanation":"Adrenaline (Epinephrine) เป็นยาหลักที่ให้ในภาวะหัวใจหยุดเต้น","choices":[{"id":"a","text":"Adenosine"},{"id":"b","text":"Atropine"},{"id":"c","text":"Adrenaline (Epinephrine)"},{"id":"d","text":"Aspirin"}]}
]'::jsonb where id = '1315c67f-c83a-40d3-8e36-5b849b5d165e';

commit;
