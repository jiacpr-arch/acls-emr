# Prep Pass — เนื้อหาเสียเงินใน Code Blue Sim

ผู้เรียนทั่วไปเล่นเคส **พื้นฐาน** ได้ฟรี ส่วนเคส **ปานกลาง** และ **Megacode** ต้องมี Prep Pass
(จ่ายครั้งเดียวผ่าน Stripe ด้วย PromptPay หรือบัตร ไม่ตัดเงินอัตโนมัติ)

- **นักเรียนในคลาสของอาจารย์ใช้ฟรีทุกเคส** (ลีกออนไลน์ไม่นับ)
- Pass ผูกกับ **บัญชี JIA** (`sub` ของ Hub passport — ดู `docs/hub-passport.md`) ใช้ได้ทุกเครื่อง และทุก deployment ที่ใช้ Supabase เดียวกัน
- ซื้อซ้ำตอน Pass ยังไม่หมด = ต่ออายุต่อท้าย ไม่ทับกัน
- **ยังไม่ตั้งค่า = ฟรีทั้งหมดเหมือนเดิม** — `/api/premium/status` ตอบ `configured:false` แล้วหน้าเว็บไม่ล็อกอะไรเลย
- เป็น paywall แบบนุ่ม: ข้อมูลเคสอยู่ใน JS bundle อยู่แล้ว คนที่ตั้งใจแกะโค้ดเล่นได้ — กันคนทั่วไป ไม่ใช่ DRM

| ส่วน | ไฟล์ |
|---|---|
| แพ็กเกจ/ราคา + กฎว่าเคสไหนต้องใช้ Pass | `src/config/premiumPlans.js` (server ใช้ไฟล์เดียวกัน — ราคาไม่รับจาก client) |
| `GET /api/premium/status` → `{ configured, loggedIn, pass:{plan,expiresAt}\|null }` | `api/premium/status.js` |
| `POST /api/premium/checkout {plan, returnTo}` → URL หน้าจ่ายเงิน Stripe (ต้อง login บัญชี JIA) | `api/premium/checkout.js` |
| `POST /api/premium/webhook` ← Stripe (ตรวจลายเซ็น) → `grant_premium_pass` | `api/premium/webhook.js` |
| ตรรกะ + เทสต์ | `api/_lib/premiumHandlers.js`, `api/_lib/stripeCheckout.js`, `api/_lib/premiumHandlers.test.js` |
| ตาราง `premium_passes` + RPC `grant_premium_pass` | `supabase-cleanup/premium-passes.sql` |
| ฝั่งเว็บ | `src/services/premium.js`, `src/hooks/usePremium.js`, `src/components/PremiumPanel.jsx`, `PremiumModal.jsx`, หน้า `/premium` |

## เปิดใช้งาน (ทำครั้งเดียว)

1. **Supabase** (`elyyijlcjfvhxbpzscnv`): รัน `supabase-cleanup/premium-passes.sql`
2. **Stripe** (บัญชีไทย): เปิด PromptPay ที่ Settings → Payment methods
   แล้วสร้าง webhook endpoint → `https://<โดเมน>/api/premium/webhook`
   เลือก event `checkout.session.completed` และ `checkout.session.async_payment_succeeded`
3. **Vercel** ทุก deployment ที่จะขาย (ฝั่ง server เท่านั้น ห้าม `VITE_`):
   - `STRIPE_SECRET_KEY` (`sk_live_…` / ทดสอบใช้ `sk_test_…`)
   - `STRIPE_WEBHOOK_SECRET` (`whsec_…` ของ endpoint ข้อ 2 — แต่ละโดเมนมี endpoint/secret ของตัวเอง)
   - ไม่บังคับ: `STRIPE_PAYMENT_METHODS` (ค่าเริ่มต้น `card,promptpay`; ถ้ายังไม่ได้เปิด PromptPay ให้ตั้ง `card`)
   - ต้องมีอยู่แล้ว: `HUB_PASSPORT_CLIENT_ID/SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy แล้วเปิด `/premium` — ต้องเห็นปุ่ม "เข้าสู่ระบบบัญชี JIA เพื่อซื้อ" หรือปุ่ม "ซื้อ"

ทดสอบด้วยโหมด test ของ Stripe ก่อน (บัตร `4242 4242 4242 4242`) แล้วเช็ก
`select * from premium_passes order by created_at desc limit 5;`

## งานแอดมิน

- ให้ Pass ฟรี/ชดเชย:
  `select grant_premium_pass('<hub sub>', 'pass30', 30, 0, 'manual-<อะไรก็ได้ที่ไม่ซ้ำ>');`
- คืนเงิน: คืนใน Stripe แล้ว `update premium_passes set expires_at = now() where stripe_session_id = 'cs_…';`
- เปลี่ยนราคา/เพิ่มแพ็กเกจ: แก้ `src/config/premiumPlans.js` (Pass ที่ขายไปแล้วไม่กระทบ)
