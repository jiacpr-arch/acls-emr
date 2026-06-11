# คู่มือติดตามผล Facebook Ads (รายสัปดาห์)

เว็บนี้ส่ง conversion event ไป 2 ที่: **Meta Pixel** (Facebook ใช้ optimize โฆษณา)
และ **PostHog** (ไว้ดู funnel เอง) — ดูรายละเอียด event ได้ที่ `src/services/analytics.js`

## Event ที่ระบบส่ง

| เหตุการณ์ | PostHog | Meta | ความหมายทางธุรกิจ |
|---|---|---|---|
| เข้าเว็บ | `$pageview` | `PageView` | traffic จาก ads |
| คลิก LINE/โทร | `contact_click` | `Contact` | **ลูกค้าสนใจคอร์ส — ตัวเลขสำคัญที่สุด** |
| ลงทะเบียนนักเรียน | `student_registered` | `CompleteRegistration` | ได้ contact lead ในระบบ |
| ทำ quiz บทเรียนจบ | `lesson_quiz_completed` | – | engagement |
| สอบ pre-test | `pre_test_completed` | – | engagement |
| สอบ post-test | `post_test_completed` | `PostTestCompleted` (custom) | นักเรียนคุณภาพ — ใช้ทำ lookalike audience |
| คลิกคอร์ส ACLS ออนไลน์ | `acls_course_click` | `Lead` | สนใจคอร์ส 9,900 บาท |

ทุก event แนบ `course_mode` (acls/bls) และ `utm_source / utm_campaign / fbclid`
จาก URL ที่ลูกค้าคลิกเข้ามา — **ตอนตั้ง ads ให้ใส่ UTM ที่ลิงก์เสมอ** เช่น
`https://bls.morroo.com/?utm_source=facebook&utm_medium=paid&utm_campaign=bls-june`

## ตัวเลข 5 ตัว ดูทุกสัปดาห์ (ใช้เวลา ~10 นาที)

เปิด Facebook Ads Manager → เพิ่ม custom columns: Amount Spent, Contacts,
Registrations Completed, CTR (link), Frequency

| ตัวเลข | คืออะไร | เกณฑ์ |
|---|---|---|
| 1. Spend | ใช้เงินไปเท่าไร | เทียบกับงบที่ตั้งไว้ |
| 2. **Cost per Contact** | Spend ÷ จำนวน Contact (คลิก LINE+โทร) | ตัวเลขชี้ขาดว่า ads คุ้มไหม — คอร์ส 2,500–3,500 บาท ถ้า cost per contact < 100–150 บาท ถือว่าดีมาก |
| 3. Registrations | คนลงทะเบียนเรียนในแอป | วัดคุณภาพ traffic |
| 4. CTR (link) | % คนเห็นแล้วคลิก | < 1% = ครีเอทีฟเริ่มไม่ดึงดูด |
| 5. Frequency | คนเดิมเห็นซ้ำกี่ครั้ง | > 3–4 = กลุ่มเป้าหมายเริ่มอิ่มตัว |

## เกณฑ์ตัดสินใจ

- **เพิ่มงบ** เมื่อ cost per contact ต่ำต่อเนื่อง 1–2 สัปดาห์ → เพิ่มทีละ ~20% (อย่าเพิ่มก้าวกระโดด เดี๋ยว Meta reset learning phase)
- **ปิด ad / เปลี่ยนครีเอทีฟ** เมื่อ frequency > 4 และ CTR ตกลงเรื่อยๆ
- **ทำครีเอทีฟใหม่** อย่างน้อยทุก 3–4 สัปดาห์ ป้องกัน ad fatigue
- **อย่าตัดสินจากข้อมูล < 3 วัน** — Meta ต้องการเวลา learning

## ขั้นที่ควรทำใน Ads Manager (ครั้งเดียว เมื่อ event สะสมพอ)

เมื่อมี `Contact` event สะสม **~50 ครั้ง/สัปดาห์** ขึ้นไป:
สร้าง campaign ใหม่แบบ objective = **Leads** (หรือ Sales) โดยตั้ง performance goal
ให้ optimize ที่ event **Contact** — Facebook จะหาคนที่ "มีแนวโน้มทัก LINE"
แทนที่จะหาแค่คนชอบคลิก ซึ่งคุ้มกว่ามาก

แนะนำเพิ่ม: สร้าง Custom Audience จากคนที่ยิง `PostTestCompleted` แล้วทำ
**Lookalike Audience 1%** ประเทศไทย — ได้กลุ่มเป้าหมายคล้ายนักเรียนที่เรียนจบจริง

## ดู funnel ใน PostHog

us.posthog.com (โปรเจกต์ Default project) → dashboard "Facebook Ads Funnel":
`$pageview → student_registered → post_test_completed → contact_click`
แยกตาม `utm_campaign` เพื่อดูว่าแคมเปญไหนพาคนมาถึง "สนใจคอร์ส" จริง

## ตรวจว่า tracking ยังทำงาน

- Meta: Events Manager → pixel → Test Events → เปิดเว็บแล้วกดปุ่ม ต้องเห็น event วิ่ง
- PostHog: Activity → Live events
- env ที่ต้องตั้งใน Vercel ทั้ง 2 โปรเจกต์: `VITE_META_PIXEL_ID`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`
