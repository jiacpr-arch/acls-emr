// แพ็กเกจ "Prep Pass" — ใช้ร่วมกันทั้งหน้าเว็บ (แสดงราคา) และ api/_lib/premiumHandlers.js
// (ราคาที่ส่งให้ Stripe มาจากไฟล์นี้ฝั่ง server เท่านั้น — client ส่งมาแค่ id แพ็กเกจ)
// ไฟล์นี้ต้องไม่ import อะไรที่ใช้ import.meta.env เพราะ api/ ของ Vercel import ตรงๆ
//
// เปลี่ยนราคา: แก้ amountThb แล้ว deploy — pass ที่ซื้อไปแล้วไม่กระทบ
export const PREMIUM_PLANS = [
  { id: 'pass30', days: 30, amountThb: 249, label: 'Prep Pass 30 วัน', note: 'เหมาะกับช่วงเตรียมสอบ' },
  { id: 'pass365', days: 365, amountThb: 590, label: 'Prep Pass 1 ปี', note: 'คุ้มสุด · เฉลี่ยไม่ถึง 50 ฿/เดือน', best: true },
];

export const findPremiumPlan = (id) => PREMIUM_PLANS.find((p) => p.id === id) || null;

// เคสใน Code Blue Sim ที่ต้องใช้ Pass: ทุกระดับที่ไม่ใช่ "พื้นฐาน" (ปานกลาง + Megacode)
// เคสที่ไม่ได้ระบุ level นับเป็นพื้นฐาน (ตรงกับ LEVEL_META ใน data/codeBlueScenarios.js)
export const isPremiumCase = (c) => !!c && (c.level || 'basic') !== 'basic';
