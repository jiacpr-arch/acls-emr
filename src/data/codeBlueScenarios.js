// Code Blue Simulator — step-based scenario
// Player acts as team leader, picks commands that target a specific team role.
// Each step describes the situation, lists commands (some right, some wrong),
// and a `effect` block applied when the right command is chosen.

export const scenario = {
  id: 'vfib-1',
  title: 'VF Cardiac Arrest',
  intro: 'ชายอายุ 58 ปี เจ็บหน้าอกร้าวลงแขนซ้าย 30 นาที — กำลังนั่งคุยอยู่ในห้องฉุกเฉิน อยู่ดีๆล้มลง หมดสติ คุณคือ Team Leader',

  initialState: {
    consciousness: 'unresponsive',
    hr: 0, bp: '0/0', spo2: 0, etco2: 0,
    rhythm: 'flat',
    compressorActive: false,
    airwayActive: false,
    ivAccess: false,
    defibCharged: false,
    cprCycle: 0,
    epiGiven: 0,
    amioGiven: 0,
  },

  steps: [
    {
      id: 1,
      narration: 'ผู้ป่วยล้มลง ไม่ตอบสนอง คุณจะสั่งอะไรเป็นอันดับแรก?',
      commands: [
        { target: 'leader',     label: 'ตรวจการตอบสนอง + เรียกขอความช่วยเหลือ', correct: true, feedback: 'ถูก! ขั้นแรก assess + activate emergency' },
        { target: 'compressor', label: 'กดหน้าอกเลย ไม่ต้องเช็ค', correct: false, feedback: 'ต้อง assess ก่อน เผื่อเป็นการเป็นลม' },
        { target: 'drug',       label: 'ฉีด Epinephrine ทันที', correct: false, feedback: 'ยังไม่ใช่จังหวะ ต้อง assess ก่อน' },
        { target: 'airway',     label: 'ใส่ ETT', correct: false, feedback: 'ยังไม่ถึงขั้นนั้น' },
      ],
      effect: { narration: 'ไม่ตอบสนอง! ทีมกำลังมา ขอ crash cart' },
    },
    {
      id: 2,
      narration: 'ไม่ตอบสนอง ไม่หายใจปกติ ขั้นต่อไป?',
      commands: [
        { target: 'leader',     label: 'คลำ carotid pulse ≤10 วินาที', correct: true, feedback: 'ถูก! ตรวจ pulse ไม่เกิน 10s' },
        { target: 'compressor', label: 'เริ่มกด CPR เลย', correct: false, feedback: 'ตรวจ pulse ก่อน ถ้าไม่มี ค่อยเริ่ม CPR' },
        { target: 'airway',     label: 'ฟังเสียงหายใจ 1 นาที', correct: false, feedback: 'นานเกินไป ต้องเร็วกว่านี้' },
        { target: 'monitor',    label: 'ติด lead 12 lead ECG ก่อน', correct: false, feedback: '12-lead รอได้ ต้อง assess pulse ก่อน' },
      ],
      effect: { narration: 'คลำ pulse ไม่ได้! → Cardiac arrest' },
    },
    {
      id: 3,
      narration: 'ไม่มี pulse! ทำอะไรต่อ?',
      commands: [
        { target: 'compressor', label: 'เริ่ม CPR คุณภาพสูง 100-120/min', correct: true, feedback: 'เยี่ยม! เริ่ม CPR ทันที' },
        { target: 'airway',     label: 'ใส่ ETT ก่อน', correct: false, feedback: 'CPR สำคัญกว่า — advanced airway ทำหลัง' },
        { target: 'drug',       label: 'ให้ Epi ก่อน', correct: false, feedback: 'CPR + monitor ก่อน Epi' },
        { target: 'leader',     label: 'รอ defibrillator มาถึงค่อยทำ', correct: false, feedback: 'ห้ามรอ! เริ่ม CPR ทันที' },
      ],
      effect: {
        state: { compressorActive: true, etco2: 12, hr: 100 },
        narration: 'CPR เริ่มแล้ว! กด 30:2 ลึก 5-6 cm',
      },
    },
    {
      id: 4,
      narration: 'CPR กำลังทำอยู่ Crash cart มาแล้ว ขั้นต่อไป?',
      commands: [
        { target: 'monitor',    label: 'ติด pad / lead เพื่อดู rhythm', correct: true, feedback: 'ถูก! ดู rhythm เร็วที่สุด' },
        { target: 'drug',       label: 'ฉีด Epi 1 mg เดี๋ยวนี้', correct: false, feedback: 'ต้องรู้ rhythm ก่อน' },
        { target: 'airway',     label: 'หยุด CPR เพื่อใส่ ETT', correct: false, feedback: 'ห้ามหยุด CPR เพื่อ airway' },
        { target: 'leader',     label: 'พิมพ์ EMR ก่อน', correct: false, feedback: 'ไม่ใช่เวลานี้' },
      ],
      effect: {
        state: { rhythm: 'vf' },
        narration: 'Rhythm: Ventricular Fibrillation (VF) — Shockable!',
      },
    },
    {
      id: 5,
      narration: 'VF! Defibrillator พร้อม จะสั่งอะไร?',
      commands: [
        { target: 'defib',      label: 'Charge 200 J (biphasic)', correct: true, feedback: 'ถูก! Charge เลย CPR ต่อระหว่าง charge' },
        { target: 'defib',      label: 'Shock 50 J ก่อน', correct: false, feedback: 'พลังงานน้อยเกินไป' },
        { target: 'drug',       label: 'ฉีด Amiodarone ทันที', correct: false, feedback: 'Amio หลัง shock 3 ครั้ง' },
        { target: 'compressor', label: 'หยุดกดเพื่อ shock', correct: false, feedback: 'อย่าหยุด CPR ระหว่าง charge' },
      ],
      effect: { state: { defibCharged: true }, narration: 'Charging... 200 J พร้อม' },
    },
    {
      id: 6,
      narration: 'Defib charged! สั่งอะไรต่อ?',
      commands: [
        { target: 'defib',      label: '"Clear!" ตรวจรอบ + Shock', correct: true, feedback: 'ถูก! Clear ก่อนเสมอ' },
        { target: 'defib',      label: 'Shock เลยไม่ต้อง clear', correct: false, feedback: 'อันตราย! ต้อง clear ก่อน' },
        { target: 'compressor', label: 'กดต่อระหว่าง shock', correct: false, feedback: 'ห้าม! ต้องไม่มีคนแตะผู้ป่วย' },
        { target: 'leader',     label: 'รอ 30 วินาที', correct: false, feedback: 'shock ทันที ที่ charged' },
      ],
      effect: {
        state: { defibCharged: false, compressorActive: false },
        narration: '⚡ SHOCK! 200 J',
      },
    },
    {
      id: 7,
      narration: 'หลัง shock ขั้นต่อไป?',
      commands: [
        { target: 'compressor', label: 'CPR ต่อทันที 2 นาที', correct: true, feedback: 'ถูก! ห้ามเช็ค pulse ทันที' },
        { target: 'leader',     label: 'เช็ค pulse ทันที', correct: false, feedback: 'รอ 2 นาที ค่อยเช็ค' },
        { target: 'monitor',    label: 'ดู rhythm ทันทีอีกครั้ง', correct: false, feedback: 'CPR ต่อก่อน' },
        { target: 'drug',       label: 'ฉีด Epi ทันที', correct: false, feedback: 'CPR ก่อน + ระหว่าง CPR ค่อยให้ยา' },
      ],
      effect: {
        state: { compressorActive: true, cprCycle: 1, etco2: 18, hr: 100 },
        narration: 'CPR cycle 2 — เปิด IV/IO + พิจารณาให้ยา',
      },
    },
    {
      id: 8,
      narration: 'ระหว่าง CPR คุณจะสั่งอะไร?',
      commands: [
        { target: 'drug',       label: 'IV access + Epinephrine 1 mg IV', correct: true, feedback: 'ถูก! Epi 1 mg ทุก 3-5 นาที' },
        { target: 'drug',       label: 'Atropine 1 mg', correct: false, feedback: 'Atropine ไม่ใช้ใน VF' },
        { target: 'drug',       label: 'NaHCO3 1 amp', correct: false, feedback: 'ไม่ใช่ตัวเลือกแรก' },
        { target: 'airway',     label: 'หยุด CPR ใส่ ETT', correct: false, feedback: 'ห้ามหยุด CPR' },
      ],
      effect: {
        state: { ivAccess: true, epiGiven: 1 },
        narration: 'Epinephrine 1 mg IV pushed!',
      },
    },
    {
      id: 9,
      narration: 'หลัง CPR 2 นาที ดู rhythm — ยังเป็น VF! สั่งอะไรต่อ?',
      commands: [
        { target: 'defib',      label: 'Shock อีกครั้ง 200 J', correct: true, feedback: 'ถูก! Shockable rhythm = shock' },
        { target: 'leader',     label: 'หยุด CPR เลิกพยายาม', correct: false, feedback: 'ยังเร็วเกินไป' },
        { target: 'drug',       label: 'Adenosine 6 mg', correct: false, feedback: 'Adenosine ใช้ใน SVT ไม่ใช่ VF' },
        { target: 'compressor', label: 'กดเร็วขึ้น 200/min', correct: false, feedback: 'เร็วเกิน — ต้อง 100-120/min' },
      ],
      effect: {
        state: { compressorActive: false },
        narration: '⚡ SHOCK 2 → resume CPR',
      },
    },
    {
      id: 10,
      narration: 'หลัง shock ครั้งที่ 2 ทำ CPR + พิจารณายาตัวต่อไป?',
      commands: [
        { target: 'drug',       label: 'Amiodarone 300 mg IV bolus', correct: true, feedback: 'ถูก! Amio 300 mg หลัง shock 2-3' },
        { target: 'drug',       label: 'Epi 5 mg IV', correct: false, feedback: 'ขนาดผิด — Epi 1 mg' },
        { target: 'drug',       label: 'Lidocaine 100 mg เป็น first-line', correct: false, feedback: 'Amio first-line ก่อน' },
        { target: 'drug',       label: 'Magnesium 2 g', correct: false, feedback: 'Mg ใช้ใน Torsades — ไม่ใช่ VF ปกติ' },
      ],
      effect: {
        state: { compressorActive: true, amioGiven: 1, cprCycle: 2 },
        narration: 'Amio 300 mg pushed! CPR ต่อ',
      },
    },
    {
      id: 11,
      narration: 'หลัง CPR 2 นาที — Rhythm เปลี่ยนเป็น Sinus + คลำ pulse ได้! ขั้นต่อไป?',
      commands: [
        { target: 'leader',     label: 'ROSC! เริ่ม post-arrest care + 12-lead ECG', correct: true, feedback: 'เยี่ยม! Post-ROSC: airway, BP, TTM, identify cause' },
        { target: 'compressor', label: 'CPR ต่ออีก 2 นาที', correct: false, feedback: 'มี pulse แล้ว ไม่ต้อง CPR' },
        { target: 'defib',      label: 'Shock อีกครั้ง', correct: false, feedback: 'NSR ห้าม shock!' },
        { target: 'drug',       label: 'Epi 1 mg อีก dose', correct: false, feedback: 'ROSC แล้ว ไม่ต้อง bolus Epi อีก' },
      ],
      effect: {
        state: {
          compressorActive: false,
          rhythm: 'nsr', hr: 88, bp: '110/70', spo2: 97, etco2: 35,
          consciousness: 'rosc',
        },
        narration: '🎉 ROSC! ผู้ป่วยกลับมามี circulation',
      },
      finalStep: true,
    },
  ],
};

export const scenarios = [scenario];
