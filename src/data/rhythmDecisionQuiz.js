// Rhythm Decision Quiz — เฉพาะคอร์ส Defibrillation & Electrical Therapy
// ต่างจาก ekgQuiz.js (ACLS) ตรงที่ไม่ได้ทดสอบ "จังหวะนี้ชื่ออะไร" แบบละเอียด
// แต่ทดสอบ "จังหวะนี้ต้องทำหัตถการไฟฟ้าอะไร" — ตรงกับ 3 บทของคอร์สนี้พอดี:
// AED/manual defib (shockable), cardioversion (organized+unstable), pacing (brady+symptomatic)
// rhythmId ใช้ร่วมกับ EKGWaveform.jsx (คอมโพเนนต์เดียวกับที่ ACLS EKG quiz ใช้)

export const RHYTHM_QUIZ_PASS_PERCENT = 75;

// localStorage flag — ผ่านเมื่อทำครบ bank ครั้งเดียวได้ ≥ เกณฑ์ (device-level เหมือน ekg_test_passed)
export const RHYTHM_QUIZ_PASSED_KEY = 'rhythm_quiz_passed';

export const DECISION_LABELS = {
  shockable: 'ช็อกทันที (Defibrillate)',
  nonshockable: 'ไม่ช็อก — CPR ต่อ',
  cardiovert: 'Synchronized Cardioversion',
  pace: 'Transcutaneous Pacing',
};

export const DECISION_OPTIONS = Object.keys(DECISION_LABELS);

export const rhythmQuizQuestions = [
  // ---- Shockable — VF/pVT ไม่มีชีพจร ช็อกทันทีไม่ต้อง sync ----
  {
    id: 'r1', rhythmId: 'vf_coarse', pulse: 'none', answer: 'shockable',
    hint: 'VF หยาบ — คลื่นไฟฟ้าสับสนไม่มีรูปแบบ ไม่มีชีพจร → ช็อกทันที ไม่ต้อง sync',
  },
  {
    id: 'r2', rhythmId: 'vf_fine', pulse: 'none', answer: 'shockable',
    hint: 'VF ละเอียด — เสี่ยงเข้าใจผิดว่าเป็น asystole ถ้าไม่ดูให้ดี ยังเป็น shockable rhythm เหมือนเดิม',
  },
  {
    id: 'r3', rhythmId: 'pvt', pulse: 'none', answer: 'shockable',
    hint: 'Pulseless VT — QRS กว้าง เร็ว สม่ำเสมอ ไม่มีชีพจร → ช็อกทันทีเหมือน VF',
  },
  {
    id: 'r4', rhythmId: 'tdp', pulse: 'none', answer: 'shockable',
    hint: 'Torsades de Pointes (polymorphic VT) ไม่มีชีพจร → shockable เหมือน VF/pVT',
  },
  // ---- Non-shockable — asystole/PEA ไม่มีชีพจร หรือจังหวะปกติที่ไม่ต้องทำอะไร ----
  {
    id: 'r5', rhythmId: 'asystole', pulse: 'none', answer: 'nonshockable',
    hint: 'เส้นเรียบ ไม่มีคลื่นไฟฟ้า — ห้ามช็อก (ช็อก asystole ไม่ได้ผล เสียเวลา CPR) ให้ CPR + epinephrine ตามรอบ',
  },
  {
    id: 'r6', rhythmId: 'pea', pulse: 'none', answer: 'nonshockable',
    hint: 'PEA — เห็นคลื่นไฟฟ้า organized แต่คลำชีพจรไม่ได้ → ไม่ช็อก ต้องหาสาเหตุ H\'s & T\'s ระหว่าง CPR',
  },
  {
    id: 'r7', rhythmId: 'nsr', pulse: 'present', answer: 'nonshockable',
    hint: 'จังหวะปกติ มีชีพจร — ไม่มีข้อบ่งชี้ทำหัตถการไฟฟ้าใด ๆ',
  },
  {
    id: 'r8', rhythmId: 'avb1', pulse: 'present', answer: 'nonshockable',
    hint: 'AV block ระดับ 1 มักไม่มีอาการ — เฝ้าระวัง ไม่ต้องช็อกหรือ pace',
  },
  // ---- Cardiovert — จังหวะ organized มีชีพจร แต่อาการไม่คงที่ ----
  {
    id: 'r9', rhythmId: 'svt', pulse: 'present', answer: 'cardiovert',
    hint: 'SVT ที่ความดันตก/ซึมลง (unstable) — จังหวะ organized มีชีพจร ต้อง synchronized cardioversion ไม่ใช่ defibrillation',
  },
  {
    id: 'r10', rhythmId: 'af', pulse: 'present', answer: 'cardiovert',
    hint: 'Atrial fibrillation เต้นเร็วจนอาการไม่คงที่ — cardiovert แบบ synchronized เช่นกัน',
  },
  {
    id: 'r11', rhythmId: 'vt', pulse: 'present', answer: 'cardiovert',
    hint: 'VT ที่ยังคลำชีพจรได้แต่ความดันตก (unstable) — ต่างจาก pulseless VT ตรงที่ต้อง sync cardiovert ไม่ใช่ช็อกตรง ๆ',
  },
  {
    id: 'r12', rhythmId: 'aflutter', pulse: 'present', answer: 'cardiovert',
    hint: 'Atrial flutter ที่อาการไม่คงที่ — synchronized cardioversion เช่นกัน',
  },
  // ---- Pace — bradycardia/heart block ที่มีอาการ ----
  {
    id: 'r13', rhythmId: 'sb', pulse: 'present', answer: 'pace',
    hint: 'Sinus bradycardia ที่มีอาการ (ความดันตก ซึมลง) และให้ atropine แล้วไม่ตอบสนอง → transcutaneous pacing',
  },
  {
    id: 'r14', rhythmId: 'avb2', pulse: 'present', answer: 'pace',
    hint: 'Mobitz II — เสี่ยงกลายเป็น complete heart block กะทันหัน ถ้ามีอาการต้อง pacing',
  },
  {
    id: 'r15', rhythmId: 'avb3', pulse: 'present', answer: 'pace',
    hint: 'Complete heart block (3rd degree) — atria กับ ventricle เต้นไม่สัมพันธ์กัน ต้อง pacing',
  },
  {
    id: 'r16', rhythmId: 'junctional', pulse: 'present', answer: 'pace',
    hint: 'Junctional escape rhythm ที่ช้าและมีอาการ — เมื่อ atropine ไม่ตอบสนอง ต้อง pacing เช่นกัน',
  },
];
