---
description: วิเคราะห์ผล Facebook Ads + conversion ประจำสัปดาห์ แล้วเสนอว่าควรปรับอะไร
---

ทำรายงานวิเคราะห์ Facebook Ads ประจำสัปดาห์เป็นภาษาไทย ตามขั้นตอนนี้:

## 1. ดึงข้อมูลฝั่ง Facebook Ads (บัญชี Jiacpr, ad_account_id: 10153192786713173)

ใช้ Facebook Ads MCP tools:
- `ads_get_ad_entities` (level: ad, date_preset: last_7d) fields: id, name, status,
  effective_status, spend, impressions, clicks, ctr, cpc, frequency — เอาเฉพาะตัวที่ ACTIVE และมียอดใช้จ่าย
- `ads_insights_performance_trend` — ดูเทรนด์ว่าตัวไหนกำลังขึ้น/ลง
- `ads_get_opportunity_score` — คำแนะนำจาก Meta

## 2. ดึงข้อมูลฝั่ง conversion (PostHog project 436967)

ใช้ PostHog MCP — เทียบ 7 วันล่าสุดกับ 7 วันก่อนหน้า:
- จำนวน `contact_click` (คลิก LINE/โทร — ตัวเลขสำคัญสุด) แยกตาม `utm_campaign` และ `source`
- จำนวน `student_registered`, `post_test_completed`, `acls_course_click`
- funnel `$pageview → student_registered → post_test_completed → contact_click`
  (มี insight สำเร็จรูปแล้ว: short_id zKYdtkHF และ PQdzcvLx, dashboard id 1697373)

## 3. วิเคราะห์ตามเกณฑ์ใน docs/ads-tracking-guide.md

- คำนวณ **cost per contact** = spend ÷ contact_click (รวมและรายแคมเปญถ้า UTM มีข้อมูล)
- ตัวไหนเข้าเกณฑ์ **เพิ่มงบ**: cost per contact ต่ำต่อเนื่อง + delivery นิ่ง → แนะนำเพิ่มทีละ ~20%
- ตัวไหนเข้าเกณฑ์ **ปิด/เปลี่ยนครีเอทีฟ**: frequency > 4 และ CTR ตก หรือ CTR < 1.5%
- เช็คว่า `Contact` event สะสมถึง ~50 ครั้ง/สัปดาห์หรือยัง — ถ้าถึงแล้ว แนะนำให้เปิดแคมเปญ
  objective Leads ที่ optimize ที่ event Contact

## 4. รายงานผล

- ตารางสรุป ad ที่รันอยู่: spend / CTR / CPC / frequency / เทรนด์
- ตัวเลข conversion สัปดาห์นี้ vs สัปดาห์ก่อน
- ข้อเสนอ action ชัดๆ ไม่เกิน 3 ข้อ เรียงตามผลกระทบ

## 5. ลงมือปรับ (ต้องถามยืนยันก่อนเสมอ)

ถ้ามี action ที่ทำผ่าน MCP ได้ (pause ad, ปรับงบ) ให้ถามยืนยันด้วย AskUserQuestion
ก่อนทุกครั้ง — ห้าม pause หรือแก้งบโดยไม่ได้รับคำยืนยัน
