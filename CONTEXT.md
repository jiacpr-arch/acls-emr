# bls.morroo.com — Project Context

## 1. ภาพรวม

**bls.morroo.com** คือเว็บแอป (PWA) สอนหลักสูตร **BLS for Healthcare Providers**
(การช่วยชีวิตขั้นพื้นฐานสำหรับบุคลากรการแพทย์) อิงแนวทาง **ILCOR 2025** เป็นภาษาไทย
ผู้เรียนอ่านบทเรียน → ดูวิดีโอ → ทำ quiz/สอบ → ได้ใบ certificate

แอปนี้เป็น **โปรเจกต์เดียวกับ acls.morroo.com** (repo `jiacpr-arch/acls-emr`) —
codebase เดียวรันได้ 2 โหมดด้วย flag `VITE_COURSE_MODE`:

- `acls` (default) → acls.morroo.com — ฟีเจอร์เต็ม (EMR บันทึก CPR จริง, algorithm,
  drug calc, code blue simulation)
- `bls` → **bls.morroo.com** — เน้น pre-course learning + สอบ + cert

จัดทำโดยศูนย์ฝึก **JIA Trainer Center** (jiacpr / jia1669.com) มีคอร์สสอนสดหน้างานควบคู่กัน

## 2. เนื้อหาหลักสูตร BLS

- **8 บทเรียน** (`bls-1` ถึง `bls-7` + `bls-1r`): Chain of Survival (IHCA/OHCA),
  CPR คุณภาพสูงในผู้ใหญ่, การใช้ AED, One-rescuer CPR, การช่วยหายใจ, เด็ก ฯลฯ —
  แต่ละบทมี quiz + วิดีโอ YouTube เฉพาะบท
- **Pre-test / Post-test**: post-test มี 2 ชุด (set A/B) ชุดละ ~23 ข้อ สลับกัน
- **เกณฑ์ผ่าน**: บทเรียน 75% / post-test 84%
- **Certificate**: PDF (jsPDF), template `bls-hcp-ilcor-2025`, อายุ 24 เดือน,
  รหัสขึ้นต้น `JIA-BLS`, ธีมสีฟ้า `#0EA5E9`
- มีโหมด **Instructor Cohort** สำหรับครูผู้สอนติดตามนักเรียนเป็นกลุ่ม

> ⚠️ **หมายเหตุสำคัญ**: เนื้อหาบทเรียนยังเป็น **draft** ที่ paraphrase จาก ILCOR 2025 + TRC —
> ต้องผ่าน **medical review โดยแพทย์ EM/ICU** ก่อนขึ้น production และ
> **ห้าม quote ตาราง algorithm ตรง ๆ** (ลิขสิทธิ์ ILCOR 2025)

## 3. Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4, React Router 7, Zustand (state),
  Recharts (กราฟ), lucide-react (ไอคอน), react-markdown
- **PWA / offline-first**: vite-plugin-pwa + Workbox, ข้อมูลเก็บใน
  **IndexedDB ผ่าน Dexie** — ใช้งานออฟไลน์ได้ แล้ว sync ขึ้น cloud ทีหลัง
- **เสียง**: howler (metronome จังหวะกด CPR) — **PDF**: jspdf + autotable (cert/export)
- **Node** ≥ 22, repo version 2.0.0

## 4. Backend & AI

- **Supabase** (project `emr-ai-clinic`): เก็บเนื้อหา (`acls_*` tables), admin auth,
  storage bucket `acls-images`
- **Serverless API** (Vercel functions ใน `/api`):
  - ฟีเจอร์ **"นักเรียนถามคำถาม"** มี AI pipeline: นักเรียนส่งคำถาม → **DeepSeek** ตอบ
    → **DeepSeek** จัดหมวด (classify chapter) → **OpenAI** สร้างภาพประกอบ
    → upload เข้า Supabase → admin review แล้ว publish
  - มีหน้า admin จัดการ chapters, Q&A deep, student questions
- **Sync engine**: flush ข้อมูล local (Dexie) → Supabase แบบ idempotent (ใช้ uuid กันซ้ำ)
  + ตาราง retry เมื่อ sync fail
- **Meta Pixel** (`VITE_META_PIXEL_ID`) สำหรับวัดผล/optimize โฆษณา + Vercel Analytics

## 5. โครงสร้าง repo

```
src/
  pages/        ~30 หน้า (PreCourse, Learn, LessonReader, Pre/PostTestExam,
                Certification, Admin*, + ACLS: Recording, Algorithm, DrugCalc,
                CodeBlueSim ...)
  components/   UI panels (CPR, AED, EKG, timers, admin, ...)
  courses/      bls-hcp/ (lessons, postTest, cert) + als/
  config/       courseMode.js  ← จุดสลับ ACLS/BLS
  services/     supabase, syncEngine, auth, *Service.js
  stores/       Zustand stores
  db/           Dexie schema (offline)
api/            Vercel serverless (student-question, qa-deep, _lib)
```

## 6. Deployment

- โฮสต์บน **Vercel** (build `npm run build` → `dist/`)
- 2 Vercel projects แยกกัน ต่างกันที่ env `VITE_COURSE_MODE` (`bls` สำหรับ bls.morroo.com)
- ใช้ Supabase instance เดียวกันทั้งสองโหมด

## 7. บริบทธุรกิจ / การตลาด

- เป็นส่วนหนึ่งของ **Morroo Suite** — ชุดเครื่องมือ EMR+AI สำหรับคลินิก/แพทย์ไทย
  (พี่น้อง: Pocket คู่มือแพทย์, Lab แปลผลแล็บ AI, ICD-10 ค้นรหัสโรค, Advice ปรึกษาสุขภาพ AI)
  มี cross-promo card ในแอป
- **ขายต่อยอดคอร์สสอนสด** ของ jiacpr: LINE `@jiacpr`, โทร 090-979-1212,
  jiacpr.com/newcourse
- ช่องทางคอนเทนต์: YouTube `@jia-bu8yn`, TikTok `@jia_lucksa`
