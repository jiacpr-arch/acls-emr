# เข้าสู่ระบบด้วยบัญชี JIA (Hub passport) — ไม่บังคับ

นักเรียนกด **"เข้าสู่ระบบด้วยบัญชี JIA"** ในหน้าต่างระบุตัวผู้เรียน (`StudentIdentityModal`) → ไป login
ที่ Hub (`class.jiacpr.com`, repo `jia-learning-hub` — ภาพรวมทั้งระบบอยู่ที่ `docs/unified-identity.md`
ของ repo นั้น) ด้วย LINE หรืออีเมล → กลับมาที่แอปพร้อม "บัตรผ่าน" (passport) ที่ Hub เซ็นไว้

- ชื่อ–นามสกุลใช้ชื่อจากบัญชี JIA (ล็อก แก้ในแอปนี้ไม่ได้ — แก้ที่ `class.jiacpr.com/account`)
  ทั้งตอนลงทะเบียนและบนใบประกาศ
- ถ้าอยู่ในคลาส: roster (`cohort_students`) ถูกผูกกับบัญชี JIA (`hub_user_id`) ให้อัตโนมัติ
- ใบประกาศที่ออกหลัง login: `certificates.hub_user_id` + ชื่อจาก Hub
- **ไม่บังคับ** — ไม่ login ก็ใช้งานได้เหมือนเดิมทุกอย่าง, PWA ที่ cache bundle เก่ายังออกใบได้ตามเดิม

แอปนี้อยู่คนละ Supabase โปรเจกต์กับ Hub (`elyyijlcjfvhxbpzscnv` vs `tpoiyykbgsgnrdwzgzvn`) จึงใช้ session
ร่วมกันไม่ได้ — ใช้ JWT (ES256) ที่ Hub เซ็น แล้วแอปตรวจลายเซ็นเองกับกุญแจสาธารณะของ Hub
(`https://class.jiacpr.com/.well-known/jwks.json`) แทน

## ทำงานยังไง

| ขั้น | ไฟล์ |
|---|---|
| ปุ่ม/สถานะในหน้าต่างระบุตัว, ชื่อถูกล็อก, ใส่ `hubSub` ใน record ของนักเรียน | `src/components/precourse/StudentIdentityModal.jsx` |
| state ฝั่ง client (อ่านแค่ profile สาธารณะจาก `/api/passport/me`) | `src/services/passport.js`, `src/hooks/usePassport.js` |
| `GET /api/passport/login` — สร้าง PKCE + state เก็บใน cookie httpOnly แล้ว redirect ไป `/sso` ของ Hub | `api/passport/login.js` |
| `GET /api/passport/callback` — ตรวจ state, แลก code ที่ `sso-auth` ของ Hub **ด้วย client secret** (server-to-server), ตรวจ JWT แล้วเก็บใน cookie `jia_passport` (httpOnly, Secure, SameSite=Lax, อายุเท่าบัตร ≤ 12 ชม.) | `api/passport/callback.js` |
| `GET /api/passport/me`, `POST /api/passport/logout` | `api/passport/me.js`, `api/passport/logout.js` |
| `POST /api/passport/bind` — ผูก roster row กับบัญชี (service role เท่านั้น) | `api/passport/bind.js` |
| sync engine เรียก bind หลัง sync นักเรียนเสร็จ (เฉพาะบัญชีที่ login อยู่ตอนนี้) | `src/services/syncEngine.js` (`flushPassportBinds`) |
| ใบประกาศ: ชื่อจาก Hub + `hub_user_id` | `src/pages/Certification.jsx`, `api/cert/notify.js` |
| `GET /api/passport/certificates` — ใบประกาศออนไลน์กลางของผู้เรียนจาก Hub (ดูหัวข้อ "ใบประกาศออนไลน์กลาง") | `api/passport/certificates.js`, `src/components/precourse/HubCertificateCard.jsx` |
| ตัวตรวจ JWT (บังคับ `alg=ES256`, `typ`, `kid` ใน JWKS, `iss`, `aud`=client ของแอปนี้, `exp/nbf` ±60 วิ) | `api/_lib/hubPassport.js` |

กันอะไรไว้บ้าง:

- **passport ไม่เคยอยู่ใน localStorage/JS** — อยู่ใน cookie httpOnly เท่านั้น (ไม่มี storage key ใหม่)
- **บัตรของแอปอื่นใช้ไม่ได้** — `aud` ต้องตรง `HUB_PASSPORT_CLIENT_ID` ของ deployment นี้
- **เครื่องใช้ร่วมกัน** — bind/ใบประกาศเชื่อบัญชีเฉพาะเมื่อ `hubSub` ที่นักเรียนกดยืนยันไว้ตรงกับบัญชีใน
  cookie ตอนนั้น (`expectedSub`) บัญชีคนอื่นที่ค้าง login ไว้จะไม่ถูกผูกกับนักเรียนคนนี้
- roster row ที่ผูกกับบัญชีอื่นแล้วจะ **ไม่ถูกเปลี่ยน** (`bound_to_other`), บัญชีเดียวผูกได้ 1 row ต่อคลาส
  (`account_in_use`) — ต้องแก้โดยแอดมิน (ดูด้านล่าง)
- `hub_user_id` เขียนได้เฉพาะ route ฝั่ง server หลังตรวจ passport — **ไม่ผ่าน RPC แบบรหัสคลาส** (`join_class`
  ฯลฯ) ที่ใครมีรหัสคลาสก็เรียกได้

## ตั้งค่าก่อนใช้งานจริง

1. **Hub** (`jia-learning-hub`): apply migration ชุด unified-identity + deploy `sso-auth` + ตั้งคีย์เซ็น
   (`HUB_PASSPORT_PRIVATE_JWK`/`HUB_PASSPORT_KID`) ตามเช็คลิสต์ใน `docs/unified-identity.md` ของ repo นั้น
2. **Supabase ของแอปนี้** (`elyyijlcjfvhxbpzscnv`): ~~รัน `supabase-cleanup/hub-passport.sql`~~ — **apply แล้ว 24 ก.ย. 2569**
   (เพิ่มคอลัมน์ nullable อย่างเดียว ของเดิมไม่กระทบ — ใช้ร่วมกับ bls-hcp-app)
3. **ลงทะเบียนแอปที่ Hub** — 1 แถวต่อ deployment, secret คนละตัว (สุ่มยาวๆ เช่น `openssl rand -base64 32`):
   ```sql
   insert into learning_hub.sso_clients(client_id,name,kind,redirect_uris,secret_hash,allowed_courses) values
    ('acls','ACLS (acls.morroo.com)','passport',array['https://acls.morroo.com/api/passport/callback'],
     extensions.crypt('<secret ของ acls>',extensions.gen_salt('bf',10)),array['als']),
    ('airway','Airway (airway.morroo.com)','passport',array['https://airway.morroo.com/api/passport/callback'],
     extensions.crypt('<secret ของ airway>',extensions.gen_salt('bf',10)),array['airway']),
    ('defib','Defib (defib.morroo.com)','passport',array['https://defib.morroo.com/api/passport/callback'],
     extensions.crypt('<secret ของ defib>',extensions.gen_salt('bf',10)),array['defib']),
    ('iv','IV (iv.morroo.com)','passport',array['https://iv.morroo.com/api/passport/callback'],
     extensions.crypt('<secret ของ iv>',extensions.gen_salt('bf',10)),array['iv']);
   ```
   (`redirect_uris` ต้องตรงเป๊ะกับโดเมนจริงของแต่ละ deployment; Hub รับเฉพาะ `https://`;
   `allowed_courses` = id คอร์สของ Hub ที่ deployment นั้นส่งผลสอบเข้าได้ — ACLS คือ `als` ดูหัวข้อ "ผลสอบกลาง")
4. **Vercel แต่ละ deployment**: `HUB_PASSPORT_CLIENT_ID` (= `client_id` ด้านบน) และ
   `HUB_PASSPORT_CLIENT_SECRET` (= secret ตัวที่ใช้สร้าง `secret_hash`) — ฝั่ง server เท่านั้น ห้าม `VITE_`
   ตั้งแค่ deployment ไหน ปุ่มก็โผล่เฉพาะที่นั่น

ตัวแปรอื่น (มีค่า default แล้ว ไม่ต้องตั้ง): `HUB_PASSPORT_REDIRECT_URI`, `HUB_SSO_URL`,
`HUB_SSO_AUTH_URL`, `HUB_JWKS_URL`, `HUB_PASSPORT_ISSUER`, `HUB_SUPABASE_ANON_KEY`,
`HUB_RESULTS_URL` (ค่าเริ่มต้น = `results-ingest` ข้างๆ `sso-auth`)

## ทดสอบบน production/preview

1. เปิด `/pre-course` → หน้าต่างระบุตัว → เห็นปุ่ม "เข้าสู่ระบบด้วยบัญชี JIA"
2. กดปุ่ม → login ที่ class.jiacpr.com → กลับมาหน้าเดิม → เปิดหน้าต่างระบุตัวอีกครั้ง → เห็น "เข้าสู่ระบบบัญชี
   JIA แล้ว" + เลขบัตร + ชื่อถูกล็อก → กรอกรหัสนักเรียน → ยืนยัน
3. (ในคลาส) หลัง sync: `select hub_user_id, hub_bound_at from cohort_students where id='<id นักเรียน>'` มีค่า
4. ออกใบประกาศ → ชื่อบนใบ = ชื่อใน Hub, `certificates.hub_user_id` มีค่า

## แก้ปัญหา / งานแอดมิน

- ปุ่มไม่โผล่: `GET /api/passport/me` ต้องตอบ `configured:true` (ตั้ง env ข้อ 4 ครบทั้ง 2 ตัวแล้ว redeploy)
- กลับมาพร้อม `?passport=error&reason=...`: `expired` (เกิน 10 นาทีหรือคนละ browser — กดใหม่),
  `state` (ลิงก์ซ้ำ/ถูกปลอม), `exchange` (secret/redirect ไม่ตรงกับแถว `sso_clients` หรือ Hub ยังไม่ตั้งคีย์เซ็น —
  ดู log ของ function `api/passport/callback`)
- นักเรียนผูกผิดบัญชี: `update cohort_students set hub_user_id=null, hub_bound_at=null where id='<id>';`
  แล้วให้นักเรียนเปิดหน้าต่างระบุตัว → ยืนยันอีกครั้งตอน login บัญชีที่ถูก

## ผลสอบกลาง (ส่งผลสอบเข้า Hub) — 24 ก.ย. 2569

ผลสอบ pre/post ที่ `/api/exam/grade` ตรวจแล้ว ถูกส่งเข้า "ผลสอบกลาง" ของ Hub (`learning_hub.exam_results`) ผ่าน Edge Function
`results-ingest` ของ Hub — `api/_lib/hubResults.js`:
- **เฉพาะเมื่อผู้เรียน login บัญชี JIA อยู่** (cookie บัตรผ่านตรงกับ `hubSub`) — ส่ง `{clientId, clientSecret, passport, result:{courseId,
  kind, correct, total, attemptRef: uuid ของ attempt}}`; Hub ตรวจบัตร + secret + ledger + `allowed_courses` แล้วคิดคะแนน/ผ่านเอง
- ส่ง 2 จังหวะ: ตอนตรวจครั้งแรก (รอ ≤2.5 วิ ไม่ให้การตรวจช้า) และตอนออกใบประกาศ (`/api/cert/notify` ส่ง pre+post ที่ใบนั้นใช้อีกรอบ
  — Hub ตัดซ้ำด้วย uuid เดิม); Hub ล่ม/ปฏิเสธ แค่ log ไม่กระทบการตรวจหรือใบประกาศ
- id คอร์สที่ Hub: `acls`→`als`, นอกนั้นเท่าเดิม — แถว `sso_clients` ของแต่ละ deployment ต้องมี `allowed_courses` ตรงนี้
  (ถ้ายังใช้ build BLS ของ repo นี้ (`VITE_COURSE_MODE=bls`) บนโดเมนไหนอยู่ ต้องมีแถวของ deployment นั้นที่มี `array['bls']` ด้วย)
- ผู้เรียนที่สอบตอนไม่ได้ login: ผลอยู่ใน `exam_grades` ของแอปนี้ตามเดิม แต่ไม่เข้า Hub (Hub ต้องรู้ว่าเป็นของใคร)

## ใบประกาศออนไลน์กลาง (Hub) — 24 ก.ย. 2569

เมื่อผล post-test ที่ส่งเข้า Hub ผ่านเกณฑ์และเจ้าหน้าที่รับรอง Hub จะออก "ใบประกาศออนไลน์กลาง JIA" (`learning_hub.person_certificates`,
เลข `JIA-ALS-ONL-<ปี>-<hex>`, อายุ 24 เดือน) — ใบประกาศเดิมของแอปนี้ **ยังออกเหมือนเดิมทุกอย่าง** ส่วนนี้แค่โชว์ใบกลางเพิ่ม:
- หน้า `/certification` แสดงการ์ด "ใบประกาศออนไลน์กลาง JIA" (เลขที่ + วันหมดอายุ + ลิงก์ตรวจสอบที่ `class.jiacpr.com/portal?verify=…`)
  **เฉพาะเมื่อ** นักเรียนคนนี้ยืนยันบัญชี JIA ไว้ (`hubSub`) และบัญชีเดียวกันยัง login อยู่ — ยังไม่มีใบ/ใบหมดอายุ/ถูกเพิกถอน = ไม่แสดงอะไร
- `GET /api/passport/certificates` (server) ถาม `results-ingest` ด้วย `{clientId, clientSecret, passport, action:'certificates'}` — Hub
  ตรวจบัตร + secret + ledger แบบเดียวกับตอนส่งผลสอบ แล้วคืนเฉพาะคอร์สใน `allowed_courses` ของ deployment นี้; route ส่งต่อให้ browser
  แค่ เลข/คอร์ส/วันออก/วันหมดอายุ/สถานะ/สถานะชื่อ/ลิงก์ตรวจสอบ (token ของใบ, เลขบัตรนักเรียน, คะแนน ไม่ออกจาก server) และลิงก์ต้องเป็น
  `/portal?verify=<uuid>` บนโดเมนของ Hub เท่านั้น
- Hub ล่ม/ปฏิเสธ → ตอบ `certificates: []` (+ `unavailable: true`) ไม่ error — หน้าเว็บแค่ไม่แสดงการ์ด
- ผู้เรียนกด "ขอรับใบประกาศ" ได้ที่ `class.jiacpr.com/my-certificates` (ถ้า Hub ยังไม่ได้ออกให้อัตโนมัติ เช่น ตอนรับรองผลยังไม่มีชื่อบนบัตร)
