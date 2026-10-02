# ตรวจข้อสอบ pre/post-test ฝั่ง server

เดิมทุกแอป (ACLS/BLS/Airway/Defib/IV) ตรวจข้อสอบในเบราว์เซอร์ แล้ว server เก็บคะแนน/ผ่าน-ไม่ผ่านตามที่ client ส่งมา
(`submit_quiz_attempt`, insert ตรงเข้า `acls_assessment_attempts`, `/api/cert/notify`) — ปลอมคะแนนหรือส่งข้อสอบไม่ครบก็ผ่านได้
ตอนนี้ **server ตรวจเอง** จากคำตอบจริง และใบประกาศนับเฉพาะผลที่ server ตรวจแล้วผ่าน

## ทำงานยังไง

- ผู้เรียนยัง **ทำข้อสอบออฟไลน์ได้เหมือนเดิม** — กดส่งแล้ว แอปเรียก `POST /api/exam/grade` ทันที (≤6 วิ) ถ้าออนไลน์ได้ผลยืนยันเลย;
  ออฟไลน์ขึ้น "รอระบบตรวจยืนยันผล" แล้ว sync engine ตรวจให้เองเมื่อออนไลน์ (`src/services/examGrade.js`,
  `flushExamGrades` ใน `src/services/syncEngine.js` — ทำให้ทุกคน มี/ไม่มีคลาส โหมดออฟไลน์ก็ตาม; ส่งแค่คำตอบ + local id)
- `api/_lib/examGrader.js` ตรวจกับเฉลยของ server เอง: **ต้องตอบครบทั้งชุดที่ได้จริง** (ACLS pool: 20 ข้อ แบ่ง easy/medium/hard ตาม
  config), ตัวเลือกต้องเป็นของข้อนั้น, ชุดต้องมีจริงในคอร์สนั้น; คะแนน `round(ถูก/ทั้งหมด×100)` ผ่านเมื่อ ≥ เกณฑ์ (สูตรเดียวกับหน้าเว็บ)
  - คอร์สที่ข้อสอบเป็นไฟล์ JS (BLS/Airway/Defib/IV): `api/_lib/examKeys.js` import ไฟล์ชุดข้อสอบตรงๆ —
    `examKeys.test.js` ฟ้องถ้าเกณฑ์/lessonId/รายการชุดไม่ตรงกับ `src/courses/*/{pre,post}Test/index.js`
  - ACLS: อ่านจาก `acls_assessment_*` ด้วย service role
- ผลเก็บใน `public.exam_grades` (service role เท่านั้น) — uuid เดิม = ผลเดิม ไม่ตรวจซ้ำ (retry/เครื่องที่สอง/sync ได้ผลตรงกัน)
- หน้าใบประกาศ (`src/pages/Certification.jsx`): pre/post นับผ่านเมื่อ server ตรวจแล้วผ่านเท่านั้น ถ้าผ่านในเครื่องแต่ยังไม่ยืนยัน
  ขึ้น "รอระบบตรวจยืนยัน" + ปุ่ม "ตรวจผลสอบตอนนี้"; `/api/cert/notify` ตรวจ uuid ที่ส่งมาอีกรอบ ถ้าเป็น pre+post ที่ผ่านจริงของคอร์สนั้น
  → `certificates.exam_verified = true` และใช้คะแนนจาก server
- roster ของครู (`cohort_quiz_attempts`) ได้คะแนนจาก server สำหรับ attempt ที่ตรวจทันก่อน sync
- ผู้เรียนที่ login บัญชี JIA: ผลที่ตรวจแล้วถูกส่งเข้า "ผลสอบกลาง" ของ Hub ด้วย (`api/_lib/hubResults.js`, ดู `docs/hub-passport.md`)
- แก้บั๊กเดิม: reload ระหว่างสอบเคยสุ่มชุดใหม่แล้วคำตอบหาย — ตอนนี้จำชุด + ลำดับข้อไว้ใน store (`questionIds`)

**ยังเฉลยหลังสอบเหมือนเดิม** (ตัดสินใจแล้ว) — เฉลยจึงยังอยู่ในแอป/อ่านได้; สิ่งที่ปิดได้คือการปลอมคะแนน ส่งไม่ครบชุด หรือส่ง
`passed:true` ตรงๆ ไม่ใช่การ "รู้คำตอบ"

## ตั้งค่า

1. ~~รัน `supabase-cleanup/exam-grades.sql` บน `elyyijlcjfvhxbpzscnv`~~ — **apply แล้ว 24 ก.ย. 2569** (ใช้ร่วมกับ bls-hcp-app)
2. ไม่มี env ใหม่ (ใช้ `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` เดิม)

ถ้า deploy ก่อนรัน SQL: การตรวจจะ error (500) → ผลสอบค้าง "รอตรวจ" (ไม่หาย) จนกว่าจะรัน SQL แล้ว sync รอบถัดไปตรวจให้เอง
— **ระหว่างนั้นออกใบประกาศไม่ได้** จึงต้องรัน SQL ก่อน

## ยังไม่ทำ

แบบทดสอบในบทเรียน/วิดีโอ, EKG test, Rhythm quiz, เกม scenario ของ skill courses (เฉลยทันทีโดยตั้งใจ, ยังตัดสินด้วย localStorage) ·
`get_cohort_summary` ของครูยังอ่าน `acls_assessment_attempts` ที่ client เขียนเองด้วย · anon ยังอ่าน `correct_id` ของ ACLS ได้
