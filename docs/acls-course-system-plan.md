# แผนงานระบบ acls.morroo.com — รองรับเอกสารหลักสูตรอบรม ACLS

> ครอบคลุมเฉพาะข้อที่เกี่ยวกับระบบ: **ข้อ 6** (คลังข้อสอบ Pre/Post-test), **ข้อ 9** (แบบประเมิน),
> **ข้อ 13** (ทะเบียนผู้ผ่านอบรม), **ข้อ 4** (คู่มือผู้เรียน — เฉพาะส่วน URL/การเข้าใช้ระบบ)
> ส่วนเอกสารโครงการ, คู่มือผู้สอน, checklist อุปกรณ์, ใบประกาศ — ไม่อยู่ในแผนนี้ (ทำนอกระบบ)
>
> ลำดับการทำ: **โครงการ → หลักสูตร → ข้อสอบใน acls.morroo.com → คู่มือผู้เรียน**

---

## 1. สถาปัตยกรรมข้อมูล (ยืนยันจากการตรวจสอบจริง 2026-07-02)

### สภาพปัจจุบัน

| ระบบ | Supabase project | หมายเหตุ |
| --- | --- | --- |
| acls.morroo.com (repo นี้) | **emr-ai-clinic** (`elyyijlcjfvhxbpzscnv`) | ตาราง prefix `acls_*`, `cohort_*`, `certificates` |
| morroo.com | **morroo** (`knxidnzexqehusndquqg`) | `mcq_*`, `challenges`, `coupon_codes`, `profiles` |

ข้อมูล ACLS **แยกจาก morroo.com/nurse.morroo.com อยู่แล้ว** — user/คะแนน/ใบประกาศไม่ปนกัน
ตรงตามข้อกำหนดของข้อ 6 และข้อ 13 โดยไม่ต้องสร้าง Supabase project ใหม่

### การตัดสินใจ: ใช้ project เดิม (emr-ai-clinic) ต่อ

- ✅ นับเป็น 1 ใน 6 projects ในงาน Supabase security hardening อยู่แล้ว
  (อยู่ใน matrix ของ `.github/workflows/supabase-health-check.yml`)
- ✅ ตาราง `acls_assessment_*`, `certificates`, `cohort_*` มี data จริงแล้ว ไม่ต้อง migrate
- ⚠️ ข้อสังเกต: project นี้ใช้ร่วมกับระบบ EMR คลินิก (มีข้อมูลผู้ป่วย) — ถ้าอนาคตต้องการแยกเด็ดขาด
  ค่อยยก schema `acls_*` ไป project ใหม่ได้ (ตารางทั้งหมด prefix ชัดเจน ย้ายง่าย) แต่**ยังไม่ทำในเฟสนี้**

### ทรัพย์สินที่มีอยู่แล้ว (ไม่ต้องสร้างใหม่)

- **คลังข้อสอบ**: `acls_assessment_banks` / `_sets` / `_questions` / `_attempts`
  - Pre-test: pool 80 ข้อ สุ่ม 20 ข้อตามสัดส่วนความยาก เกณฑ์ผ่าน 70%
  - Post-test: ชุด A/B/C ชุดละ 50 ข้อ (รวม 150) สุ่ม 30 ข้อ เกณฑ์ผ่าน 85%
  - ทุกข้อมี `topic`, `difficulty`, `explanation`, `reference` แล้ว
- **ทะเบียนใบประกาศ**: `certificates` (cert_id, ชื่อ, เบอร์, อีเมล, คะแนน pre/post, EKG passed)
- **ระบบรุ่น/คลาส**: `cohort_classes` + `cohort_students` + `cohort_quiz_attempts` (หน้าอาจารย์เปิดคลาสได้แล้ว)
- **การระบุตัวผู้เรียน**: ชื่อ + เบอร์โทร (ไม่มี login) — เบากับผู้เรียน เหมาะกับอบรม onsite

---

## 2. การ map "โครงสร้างมาตรฐาน Morroo" ลง acls

ตรวจ schema จริงของ morroo แล้ว มาตรฐานที่ใช้ร่วมกันคือ:

| มาตรฐาน Morroo | ใน morroo DB | แผนใน acls DB |
| --- | --- | --- |
| ระดับข้อสอบ Basic/Applied/Advanced | `mcq_questions.difficulty` = `easy`/`medium`/`hard` | ✅ มีแล้ว — `acls_assessment_questions.difficulty` ใช้ค่าเดียวกัน (ปัจจุบัน easy 65 / medium 105 / hard 60) |
| Competition (แข่งขัน) | `challenges` + `challenge_submissions` | 🆕 `acls_challenges` + `acls_challenge_submissions` |
| Coupon code | `coupon_codes` + `coupon_redemptions` | 🆕 `acls_coupon_codes` + `acls_coupon_redemptions` |
| Attempt log ต่อ session | `mcq_sessions` + `mcq_attempts` | ✅ มีแล้วใน `acls_assessment_attempts` (answers เก็บเป็น jsonb รายข้อ) |

**นิยามระดับ** (ใช้สื่อสารในเอกสารหลักสูตร ↔ ค่าใน DB):

- **Basic** (`easy`) — ความรู้พื้นฐาน จำได้/เข้าใจ (recall)
- **Applied** (`medium`) — ประยุกต์ใช้กับสถานการณ์/case scenario
- **Advanced** (`hard`) — วิเคราะห์ ตัดสินใจซับซ้อน หลายขั้นตอน

**ข้อแตกต่างสำคัญจาก morroo**: acls ไม่มี user login (ระบุตัวด้วยชื่อ+เบอร์)
→ competition/coupon ฝั่ง acls ออกแบบรอบ **เบอร์โทร** เป็น identity แทน `user_id`
(unique ต่อ challenge/coupon ด้วยเบอร์ + validate ฝั่ง server) — ไม่ต้องเพิ่ม auth ในเฟสนี้

---

## 3. แผนงานตามลำดับ

### Phase 0 — โครงการ + หลักสูตร (เอกสาร, นอกระบบ) ✍️ ทำก่อน

ไม่มีงาน code แต่ระบบต้องรอ **ข้อสรุปจากหลักสูตร** เป็น input:

- [ ] จำนวนข้อ/เกณฑ์ผ่านของ Pre-test และ Post-test ตามหลักสูตร (ปัจจุบัน 20 ข้อ/70% และ 30 ข้อ/85% — ยืนยันหรือแก้)
- [ ] **Blueprint ข้อสอบ**: สัดส่วนหัวข้อ × ระดับ Basic/Applied/Advanced ต่อชุด
  (เช่น BLS 20%, Airway 10%, Rhythm 25%, Pharmacology 20%, Team dynamics 10%, Post-cardiac arrest 15%)
- [ ] จำนวนรุ่น/ผู้เรียนต่อรุ่น (กำหนดรูปแบบเลขทะเบียนข้อ 13 เช่น `ACLS-2569-001-xxx`)
- [ ] หัวข้อแบบประเมิน (ข้อ 9) ที่หลักสูตร/หน่วยงานต้องการเก็บ

### Phase 1 — ข้อ 6: คลังข้อสอบ Pre/Post-test 🎯 งานหลัก

**1.1 จัด blueprint ให้ตรงหลักสูตร** (หลังได้ input จาก Phase 0)

- ตรวจ mapping `topic` × `difficulty` ของ 230 ข้อที่มี เทียบ blueprint → หาช่องว่าง
- เขียนข้อสอบเพิ่มเติมเฉพาะช่องที่ขาด (มี admin UI + SQL seed อยู่แล้ว)
- ปรับ `selection_config` ของ pre-test pool ให้สุ่มตามสัดส่วน blueprint (โครงสร้าง `selection_mode='pool'` รองรับแล้ว)
- เพิ่มรายงาน admin: ตาราง blueprint coverage (หัวข้อ × ระดับ × จำนวนข้อ) ในหน้า `/admin/stats`

**1.2 Competition** (มาตรฐาน Morroo)

- Migration: `acls_challenges` (title, ช่วงเวลา, question_ids, is_active),
  `acls_challenge_submissions` (challenge_id, student_phone, student_name, score, time_taken_seconds; unique (challenge_id, student_phone))
- หน้าใหม่ `/challenge` — เข้าร่วมด้วยชื่อ+เบอร์ (ฟอร์มเดียวกับ pre/post-test), leaderboard แสดง top N
- Admin: สร้าง/ปิด challenge เลือกข้อจากคลัง
- ใช้ในงานอบรมได้เลย: แข่งเก็บคะแนนระหว่างรอ/หลัง workshop เพิ่ม engagement

**1.3 Coupon code** (มาตรฐาน Morroo)

- Migration: `acls_coupon_codes` (code, coupon_type, value, max_uses, max_uses_per_user, expires_at, is_active),
  `acls_coupon_redemptions` (coupon_id, student_phone, redeemed_at)
- Use case ฝั่ง acls: โค้ดเข้าคลาส (แทน/เสริม class code), โค้ดปลดล็อกชุดข้อสอบพิเศษ, โค้ดส่วนลดคอร์ส jiacpr
- Validate ผ่าน API route (ฝั่ง server) กัน brute-force + นับ use ให้ถูก

**1.4 RLS ของตารางใหม่ทั้งหมด**: anon อ่านได้เฉพาะที่จำเป็น (challenge ที่ active), insert ผ่าน policy รัดกุม,
ตารางเฉลย (`correct_id`) คงพฤติกรรมเดิมของ `acls_assessment_questions`

### Phase 2 — ข้อ 9: แบบประเมิน 📋 แนะนำทำในระบบ

**คำแนะนำ: ทำใน acls.morroo.com** (ไม่ใช้ Google Form) เพราะ:

- data อยู่ที่เดียวกับคะแนนสอบ → รายงานสรุปรุ่น (คะแนน + ความพึงพอใจ) ออกจากที่เดียว ผูกกับ `class_id` ได้
- งานไม่ใหญ่: 1 ตาราง + 1 หน้า + export (มี pattern จากหน้า Feedback เดิมอยู่แล้ว แต่หน้า Feedback เก็บแค่ localStorage — ใช้เป็นต้นแบบ UI ได้เลย)
- Google Form เก็บไว้เป็น fallback ถ้ารีบใช้ก่อนระบบเสร็จ

งาน:

- Migration: `acls_course_evaluations` (class_id → cohort_classes, student_phone (nullable — อนุญาต anonymous),
  คะแนนรายหัวข้อ jsonb ตามแบบฟอร์มหลักสูตร (วิทยากร/เนื้อหา/สถานที่/เวลา 1–5), ข้อเสนอแนะ text)
- หน้า `/evaluation?class=CODE` — mobile-first, เสร็จอบรมสแกน QR ตอบได้ทันที
- Admin: สรุปค่าเฉลี่ยรายหัวข้อต่อรุ่น + export CSV (ใช้แนบรายงานผลโครงการ)

### Phase 3 — ข้อ 13: ทะเบียนผู้ผ่านอบรม 🗂️

ต่อยอดจาก `certificates` + `cohort_*` ที่มีอยู่:

- Migration: เพิ่มใน `certificates`: `class_id` (→ cohort_classes), `registry_no` (เลขทะเบียนรูปแบบจาก Phase 0, unique),
  `expires_at` (อายุบัตร เช่น 2 ปี)
- ผูกการออกใบประกาศเข้ากับรุ่น: นักเรียนใน cohort ที่ผ่านเกณฑ์ (post-test ≥ 85% + skill pass) ได้เลขทะเบียนรัน
- หน้า admin "ทะเบียนผู้ผ่านอบรม": ค้นหา (ชื่อ/เบอร์/เลขทะเบียน/รุ่น), export CSV รายรุ่นสำหรับแนบเอกสารราชการ
- หน้า public `/verify/:certId` — ตรวจสอบใบประกาศจริง (แสดงชื่อ + รุ่น + วันหมดอายุ ไม่แสดงเบอร์/อีเมล)
- RLS: ตารางทะเบียนอ่านได้เฉพาะ admin; endpoint verify เปิดเฉพาะ field สาธารณะผ่าน API route

### Phase 4 — ข้อ 4: คู่มือผู้เรียน 📖

- อัปเดต URL สมัคร/เข้าใช้ทั้งหมดในคู่มือ + ในระบบ ให้ชี้ `acls.morroo.com` (ตรวจ `UserGuide.jsx`, เอกสาร docs/, QR ในสไลด์)
- เพิ่ม section ในคู่มือ: วิธีทำ Pre-test ก่อนอบรม (ลิงก์+QR), การเข้าคลาสด้วย class code, การรับใบประกาศ, การทำแบบประเมิน
- ทำ PDF จาก markdown แบบเดียวกับ `instructor-cohort-guide.pdf` ที่มีอยู่

### Phase 5 — Supabase security hardening (คู่ขนาน/ปิดท้าย) 🔐

- acls (emr-ai-clinic) นับเป็น 1 ใน 6 projects ตาม matrix health-check เดิม
- ตารางใหม่ทุกตารางใน Phase 1–3 เปิด RLS + policy ตั้งแต่ migration แรก
- **พบจากการตรวจวันนี้ (ต้องแก้): มี 13 ตารางใน emr-ai-clinic ที่ RLS ปิดอยู่** — เสี่ยงสูงเพราะ anon key อ่าน/เขียนได้ทุกแถว:
  `crm_contacts` (90 แถว), `referral_accounts` (71 แถว), `leads`, `lead_activities`, `coupons`, `campaigns`,
  `banners`, `bot_templates`, `line_link_codes`, `broadcasts`, `user_feedbacks`, `crm_follow_ups`,
  `acls_qa_deep_items_md_backup`
  ห้ามแค่ `ENABLE ROW LEVEL SECURITY` เฉย ๆ (จะ block ระบบที่ใช้อยู่) — ต้องไล่ดูว่าตารางไหน service ไหนใช้ แล้วเขียน policy ให้ถูกก่อนเปิด

---

## 4. สรุปลำดับ + ประมาณการ

| ลำดับ | งาน | ประเภท | ประมาณการ |
| --- | --- | --- | --- |
| 0 | เอกสารโครงการ + หลักสูตร (กำหนด blueprint/เกณฑ์/เลขทะเบียน) | เอกสาร | — (ทำเองนอกระบบ) |
| 1 | ข้อ 6: blueprint coverage + เติมข้อสอบ + competition + coupon | ระบบ | 3–4 sessions |
| 2 | ข้อ 9: แบบประเมินในระบบ + admin export | ระบบ | 1 session |
| 3 | ข้อ 13: เลขทะเบียน + หน้า admin ทะเบียน + verify | ระบบ | 1–2 sessions |
| 4 | ข้อ 4: คู่มือผู้เรียน (URL → acls.morroo.com + PDF) | เอกสาร+ระบบเล็กน้อย | 1 session |
| 5 | RLS hardening (13 ตารางค้าง + ตารางใหม่) | ระบบ | 1–2 sessions |

**เงื่อนไขเริ่ม Phase 1**: ได้ blueprint + เกณฑ์ผ่านจากหลักสูตร (Phase 0) ก่อน
ระหว่างรอ เริ่ม Phase 2 (แบบประเมิน) หรือ Phase 5 (RLS) ก่อนได้ — ไม่พึ่ง input จากหลักสูตร
