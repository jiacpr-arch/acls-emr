// Code Blue Simulator — multi-scenario library, easy → hard
//
// Each scenario:
//   id, title, level ('beginner' | 'intermediate' | 'advanced'), intro,
//   initialState (patient + scene flags), steps[] (decision tree)
//
// step.commands[]: { target, label, correct, feedback }
// step.effect: { state? (patches initialState), narration? } — applied after correct pick
// step.finalStep: marks the closing step (game ends after this)

// ---------- shared character / patient state shape ----------
const baseState = {
  consciousness: 'awake',          // 'awake' | 'unresponsive' | 'rosc'
  hr: 80, bp: '120/80', spo2: 98, etco2: 0,
  rhythm: 'nsr',                   // 'nsr' | 'vf' | 'vt' | 'flat' | 'pea' | 'brady' | 'svt'
  compressorActive: false,
  airwayActive: false,
  ivAccess: false,
  defibCharged: false,
  cprCycle: 0,
  epiGiven: 0,
  amioGiven: 0,
};

// ============================================================
// 1. Stable SVT — BEGINNER (7 steps)
//    Patient awake, just tachy. Vagal → adenosine 6 → 12.
// ============================================================
const svtStable = {
  id: 'svt-stable',
  title: 'SVT — Stable Tachycardia',
  level: 'beginner',
  durationLabel: '~5 นาที',
  description: 'หญิงอายุ 28 ปี ใจสั่น HR 180 ความดันยังดี — ฝึก vagal + adenosine',
  intro: 'หญิง 28 ปี เข้า ER ด้วยใจสั่น 30 นาที ตื่นรู้สึกตัวดี HR 180/min ความดัน 118/74 — Monitor: narrow-complex tachycardia regular',
  initialState: { ...baseState, hr: 180, bp: '118/74', spo2: 97, rhythm: 'svt' },

  steps: [
    {
      id: 1,
      narration: 'รับคนไข้ stable SVT — ขั้นแรกควรทำอะไร?',
      commands: [
        { target: 'leader',  label: 'ABC + IV access + 12-Lead ECG + monitor', correct: true,  feedback: 'ถูก! Stable patient — ตรวจประเมินก่อนรักษา' },
        { target: 'defib',   label: 'Synchronized cardioversion ทันที',          correct: false, feedback: 'Stable แล้ว — ยังไม่ต้อง shock' },
        { target: 'drug',    label: 'Epinephrine 1mg IV',                        correct: false, feedback: 'Epi ใช้ใน arrest — คนไข้นี้ยัง stable' },
        { target: 'monitor', label: 'นั่งดูเฉย ๆ',                                correct: false, feedback: 'ต้องประเมินและรักษา' },
      ],
      effect: { state: { ivAccess: true }, narration: 'IV เปิด, 12-Lead ยืนยัน narrow regular SVT' },
    },
    {
      id: 2,
      narration: 'Stable narrow regular SVT — non-pharm step แรก?',
      commands: [
        { target: 'leader',  label: 'Vagal maneuver (Modified Valsalva)', correct: true,  feedback: 'ถูก! Modified Valsalva ได้ผล ~43%' },
        { target: 'leader',  label: 'นวด carotid 2 ข้างพร้อมกัน',          correct: false, feedback: 'อันตราย! ห้ามนวด 2 ข้างพร้อมกัน' },
        { target: 'drug',    label: 'Adenosine 12mg เลย',                  correct: false, feedback: 'ลอง vagal ก่อน — ถ้าไม่ได้ค่อยให้ยา' },
        { target: 'defib',   label: 'Cardiovert 100J',                     correct: false, feedback: 'Stable — ยังไม่ shock' },
      ],
      effect: { narration: 'Vagal maneuver ลอง 1 ครั้ง — ไม่กลับ' },
    },
    {
      id: 3,
      narration: 'Vagal ไม่ได้ผล — ยาตัวต่อไป?',
      commands: [
        { target: 'drug', label: 'Adenosine 6mg rapid IV push + flush 20ml', correct: true,  feedback: 'ถูก! 6mg IV push เร็ว ๆ ผ่าน 3-way + flush ทันที' },
        { target: 'drug', label: 'Adenosine 6mg ค่อย ๆ push ช้า ๆ',           correct: false, feedback: 'ห้าม! Half-life 6 วินาที ต้อง rapid push' },
        { target: 'drug', label: 'Adenosine 12mg เริ่มเลย',                   correct: false, feedback: 'Start 6mg ก่อน ถ้าไม่ได้ค่อยขึ้น 12mg' },
        { target: 'drug', label: 'Diltiazem 20mg IV',                         correct: false, feedback: 'ใช้ใน AF/Flutter ไม่ใช่ SVT' },
      ],
      effect: { state: { epiGiven: 0 }, narration: 'Adenosine 6mg pushed — sinus pause สั้น ๆ แล้วกลับมาเป็น SVT' },
    },
    {
      id: 4,
      narration: '6mg ไม่กลับ — dose ต่อไป?',
      commands: [
        { target: 'drug', label: 'Adenosine 12mg rapid IV (อาจ repeat อีก 12mg)', correct: true,  feedback: 'ถูก! 12mg เป็น dose ที่ 2 — repeat 12mg ได้ 1 ครั้ง' },
        { target: 'drug', label: 'Adenosine 24mg ทันที',                          correct: false, feedback: 'Max single dose = 12mg' },
        { target: 'leader', label: 'รออีกครึ่งชั่วโมง',                            correct: false, feedback: 'ไม่ต้องรอ — ให้ dose ต่อทันที' },
        { target: 'defib', label: 'Cardiovert 200J',                              correct: false, feedback: 'ยัง stable อยู่ — ยังไม่ shock' },
      ],
      effect: { state: { rhythm: 'nsr', hr: 88, bp: '120/76' }, narration: 'Adenosine 12mg → กลับเป็น Sinus rhythm 88/min!' },
    },
    {
      id: 5,
      narration: 'กลับเป็น sinus แล้ว — ขั้นต่อไปคืออะไร?',
      commands: [
        { target: 'monitor', label: 'Monitor ต่อ 4-6 ชม. + 12-Lead ซ้ำ', correct: true,  feedback: 'ถูก! Watch for recurrence + r/o WPW' },
        { target: 'leader',  label: 'D/C กลับบ้านทันที',                  correct: false, feedback: 'ต้อง monitor ก่อน' },
        { target: 'drug',    label: 'Beta-blocker IV ป้องกัน',             correct: false, feedback: 'ไม่จำเป็นเฉพาะ acute' },
        { target: 'defib',   label: 'Synchronized cardioversion',          correct: false, feedback: 'Sinus แล้ว ห้าม shock' },
      ],
      effect: { narration: 'Monitor ต่อ — ซ้ำ ECG, ดูว่ามี delta wave (WPW) หรือไม่' },
      finalStep: true,
    },
  ],
};

// ============================================================
// 2. Stable Bradycardia — BEGINNER (7 steps)
//    HR 35, asymptomatic vs symptomatic decision, atropine path.
// ============================================================
const bradyStable = {
  id: 'brady-stable',
  title: 'Symptomatic Bradycardia',
  level: 'beginner',
  durationLabel: '~6 นาที',
  description: 'ชาย 70 ปี HR 38 มึน ๆ — ฝึกประเมิน stable/unstable + Atropine',
  intro: 'ชาย 70 ปี รู้สึกมึน เหนื่อยง่าย 1 ชั่วโมง HR 38/min BP 92/56 — Monitor: sinus brady',
  initialState: { ...baseState, hr: 38, bp: '92/56', spo2: 96, rhythm: 'brady' },

  steps: [
    {
      id: 1,
      narration: 'ชายมึน HR 38 — เริ่มจากตรงไหน?',
      commands: [
        { target: 'leader',  label: 'ABC + IV + O₂ + 12-Lead ECG + Monitor', correct: true,  feedback: 'ถูก! ประเมินก่อนตัดสินใจรักษา' },
        { target: 'drug',    label: 'Atropine 1mg ทันที',                     correct: false, feedback: 'ต้องประเมิน symptomatic ก่อน' },
        { target: 'defib',   label: 'TCP เลย',                                correct: false, feedback: 'ยังไม่ใช่ขั้นแรก' },
        { target: 'compressor', label: 'เริ่ม CPR',                            correct: false, feedback: 'มี pulse — ห้าม CPR' },
      ],
      effect: { state: { ivAccess: true }, narration: 'ABC ดี, IV เปิด, O₂ cannula 3L, 12-Lead = sinus brady 38' },
    },
    {
      id: 2,
      narration: 'จะวินิจฉัย symptomatic bradycardia ได้ต้องดูอะไร?',
      commands: [
        { target: 'leader', label: 'Hypotension/altered MS/ischemic chest pain/HF',   correct: true,  feedback: 'ถูก! ต้องมี end-organ hypoperfusion' },
        { target: 'leader', label: 'แค่ HR <60 ก็ symptomatic แล้ว',                   correct: false, feedback: 'แค่ rate ไม่พอ ต้องมีอาการด้วย' },
        { target: 'leader', label: 'ดูเฉพาะอุณหภูมิ',                                   correct: false, feedback: 'ไม่เกี่ยว' },
        { target: 'monitor', label: 'รอจน HR <30 ค่อยตัดสินใจ',                         correct: false, feedback: 'ไม่ใช่ — ดู symptom' },
      ],
      effect: { narration: 'BP 92/56, dizziness, no chest pain — borderline symptomatic' },
    },
    {
      id: 3,
      narration: 'คนไข้ borderline symptomatic — ยา first-line?',
      commands: [
        { target: 'drug', label: 'Atropine 1mg IV push fast (<1 min)',         correct: true,  feedback: 'ถูก! Atropine 1mg push เร็ว flush 20ml' },
        { target: 'drug', label: 'Atropine 0.5mg ค่อย ๆ ฉีดช้า ๆ',              correct: false, feedback: 'ผิด! ต้อง 1mg push เร็ว — ถ้า slow → paradoxical brady' },
        { target: 'drug', label: 'Epinephrine 1mg bolus',                       correct: false, feedback: 'Epi infusion ใช้ทีหลัง ถ้า atropine ไม่ได้' },
        { target: 'drug', label: 'Adenosine 6mg',                               correct: false, feedback: 'Adenosine ใช้ใน SVT ตรงข้ามเลย' },
      ],
      effect: { narration: 'Atropine 1mg pushed — รอดู response 3-5 นาที' },
    },
    {
      id: 4,
      narration: 'ถ้าหลัง Atropine 1mg ไม่ดีขึ้น — ทำอะไรต่อ?',
      commands: [
        { target: 'drug',  label: 'Atropine ซ้ำได้ q3-5min, max 3mg',              correct: true,  feedback: 'ถูก! ให้ได้ถึง 3mg total' },
        { target: 'drug',  label: 'Atropine 5mg push ทีเดียว',                     correct: false, feedback: 'Single max 1mg, total max 3mg' },
        { target: 'drug',  label: 'Lidocaine 100mg',                                correct: false, feedback: 'ไม่ใช่สำหรับ brady' },
        { target: 'leader', label: 'รอ 30 นาทีก่อนตัดสินใจ',                          correct: false, feedback: 'นานเกินไป — ถ้าไม่ดีขึ้นใน 3-5 min ขั้นถัดไปได้เลย' },
      ],
      effect: { state: { hr: 56, bp: '105/68' }, narration: 'Atropine 1mg ครั้งที่ 2 → HR ขึ้นเป็น 56' },
    },
    {
      id: 5,
      narration: 'HR ดีขึ้น 56 BP 105/68 อาการดีขึ้น — ขั้นต่อไป?',
      commands: [
        { target: 'monitor', label: 'Monitor ต่อ + หาสาเหตุ (electrolytes, drug, ischemia)', correct: true,  feedback: 'ถูก! Atropine ไม่แก้ root cause — ต้องหาสาเหตุ' },
        { target: 'drug',    label: 'Atropine ต่อ q5min ตลอด',                                correct: false, feedback: 'ไม่จำเป็น — อาการดีขึ้นแล้ว' },
        { target: 'defib',   label: 'TCP standby',                                            correct: false, feedback: 'ไม่ต้องแล้วเพราะ atropine ได้ผล' },
        { target: 'leader',  label: 'D/C กลับบ้าน',                                            correct: false, feedback: 'ต้อง monitor ก่อนหาสาเหตุ' },
      ],
      effect: { narration: 'Lab + ECG ซ้ำ — มอง K+, TSH, drug review (beta-blocker, digoxin)' },
      finalStep: true,
    },
  ],
};

// ============================================================
// 3. VF Cardiac Arrest — INTERMEDIATE (11 steps, original)
// ============================================================
const vfArrest = {
  id: 'vfib-1',
  title: 'VF Cardiac Arrest',
  level: 'intermediate',
  durationLabel: '~10 นาที',
  description: 'ชาย 58 ปี เจ็บหน้าอก ล้มลงในห้องฉุกเฉิน — ฝึก ACLS shockable arrest',
  intro: 'ชายอายุ 58 ปี เจ็บหน้าอกร้าวลงแขนซ้าย 30 นาที — กำลังนั่งคุยอยู่ในห้องฉุกเฉิน อยู่ดีๆล้มลง หมดสติ คุณคือ Team Leader',

  initialState: {
    ...baseState,
    consciousness: 'unresponsive',
    hr: 0, bp: '0/0', spo2: 0, etco2: 0,
    rhythm: 'flat',
  },

  steps: [
    {
      id: 1,
      narration: 'ผู้ป่วยล้มลง ไม่ตอบสนอง คุณจะสั่งอะไรเป็นอันดับแรก?',
      commands: [
        { target: 'leader',     label: 'ตรวจการตอบสนอง + เรียกขอความช่วยเหลือ', correct: true,  feedback: 'ถูก! ขั้นแรก assess + activate emergency' },
        { target: 'compressor', label: 'กดหน้าอกเลย ไม่ต้องเช็ค',                correct: false, feedback: 'ต้อง assess ก่อน เผื่อเป็นการเป็นลม' },
        { target: 'drug',       label: 'ฉีด Epinephrine ทันที',                  correct: false, feedback: 'ยังไม่ใช่จังหวะ ต้อง assess ก่อน' },
        { target: 'airway',     label: 'ใส่ ETT',                                 correct: false, feedback: 'ยังไม่ถึงขั้นนั้น' },
      ],
      effect: { narration: 'ไม่ตอบสนอง! ทีมกำลังมา ขอ crash cart' },
    },
    {
      id: 2,
      narration: 'ไม่ตอบสนอง ไม่หายใจปกติ ขั้นต่อไป?',
      commands: [
        { target: 'leader',     label: 'คลำ carotid pulse ≤10 วินาที', correct: true,  feedback: 'ถูก! ตรวจ pulse ไม่เกิน 10s' },
        { target: 'compressor', label: 'เริ่มกด CPR เลย',                correct: false, feedback: 'ตรวจ pulse ก่อน ถ้าไม่มี ค่อยเริ่ม CPR' },
        { target: 'airway',     label: 'ฟังเสียงหายใจ 1 นาที',          correct: false, feedback: 'นานเกินไป ต้องเร็วกว่านี้' },
        { target: 'monitor',    label: 'ติด lead 12 lead ECG ก่อน',     correct: false, feedback: '12-lead รอได้ ต้อง assess pulse ก่อน' },
      ],
      effect: { narration: 'คลำ pulse ไม่ได้! → Cardiac arrest' },
    },
    {
      id: 3,
      narration: 'ไม่มี pulse! ทำอะไรต่อ?',
      commands: [
        { target: 'compressor', label: 'เริ่ม CPR คุณภาพสูง 100-120/min', correct: true,  feedback: 'เยี่ยม! เริ่ม CPR ทันที' },
        { target: 'airway',     label: 'ใส่ ETT ก่อน',                     correct: false, feedback: 'CPR สำคัญกว่า — advanced airway ทำหลัง' },
        { target: 'drug',       label: 'ให้ Epi ก่อน',                     correct: false, feedback: 'CPR + monitor ก่อน Epi' },
        { target: 'leader',     label: 'รอ defibrillator มาถึงค่อยทำ',     correct: false, feedback: 'ห้ามรอ! เริ่ม CPR ทันที' },
      ],
      effect: { state: { compressorActive: true, etco2: 12, hr: 100 }, narration: 'CPR เริ่มแล้ว! กด 30:2 ลึก 5-6 cm' },
    },
    {
      id: 4,
      narration: 'CPR กำลังทำอยู่ Crash cart มาแล้ว ขั้นต่อไป?',
      commands: [
        { target: 'monitor', label: 'ติด pad / lead เพื่อดู rhythm', correct: true,  feedback: 'ถูก! ดู rhythm เร็วที่สุด' },
        { target: 'drug',    label: 'ฉีด Epi 1 mg เดี๋ยวนี้',         correct: false, feedback: 'ต้องรู้ rhythm ก่อน' },
        { target: 'airway',  label: 'หยุด CPR เพื่อใส่ ETT',          correct: false, feedback: 'ห้ามหยุด CPR เพื่อ airway' },
        { target: 'leader',  label: 'พิมพ์ EMR ก่อน',                  correct: false, feedback: 'ไม่ใช่เวลานี้' },
      ],
      effect: { state: { rhythm: 'vf' }, narration: 'Rhythm: Ventricular Fibrillation (VF) — Shockable!' },
    },
    {
      id: 5,
      narration: 'VF! Defibrillator พร้อม จะสั่งอะไร?',
      commands: [
        { target: 'defib',      label: 'Charge 200 J (biphasic)', correct: true,  feedback: 'ถูก! Charge เลย CPR ต่อระหว่าง charge' },
        { target: 'defib',      label: 'Shock 50 J ก่อน',          correct: false, feedback: 'พลังงานน้อยเกินไป' },
        { target: 'drug',       label: 'ฉีด Amiodarone ทันที',     correct: false, feedback: 'Amio หลัง shock 3 ครั้ง' },
        { target: 'compressor', label: 'หยุดกดเพื่อ shock',          correct: false, feedback: 'อย่าหยุด CPR ระหว่าง charge' },
      ],
      effect: { state: { defibCharged: true }, narration: 'Charging... 200 J พร้อม' },
    },
    {
      id: 6,
      narration: 'Defib charged! สั่งอะไรต่อ?',
      commands: [
        { target: 'defib',      label: '"Clear!" ตรวจรอบ + Shock', correct: true,  feedback: 'ถูก! Clear ก่อนเสมอ' },
        { target: 'defib',      label: 'Shock เลยไม่ต้อง clear',    correct: false, feedback: 'อันตราย! ต้อง clear ก่อน' },
        { target: 'compressor', label: 'กดต่อระหว่าง shock',         correct: false, feedback: 'ห้าม! ต้องไม่มีคนแตะผู้ป่วย' },
        { target: 'leader',     label: 'รอ 30 วินาที',               correct: false, feedback: 'shock ทันที ที่ charged' },
      ],
      effect: { state: { defibCharged: false, compressorActive: false }, narration: '⚡ SHOCK! 200 J' },
    },
    {
      id: 7,
      narration: 'หลัง shock ขั้นต่อไป?',
      commands: [
        { target: 'compressor', label: 'CPR ต่อทันที 2 นาที',     correct: true,  feedback: 'ถูก! ห้ามเช็ค pulse ทันที' },
        { target: 'leader',     label: 'เช็ค pulse ทันที',         correct: false, feedback: 'รอ 2 นาที ค่อยเช็ค' },
        { target: 'monitor',    label: 'ดู rhythm ทันทีอีกครั้ง',  correct: false, feedback: 'CPR ต่อก่อน' },
        { target: 'drug',       label: 'ฉีด Epi ทันที',           correct: false, feedback: 'CPR ก่อน + ระหว่าง CPR ค่อยให้ยา' },
      ],
      effect: { state: { compressorActive: true, cprCycle: 1, etco2: 18, hr: 100 }, narration: 'CPR cycle 2 — เปิด IV/IO + พิจารณาให้ยา' },
    },
    {
      id: 8,
      narration: 'ระหว่าง CPR คุณจะสั่งอะไร?',
      commands: [
        { target: 'drug',   label: 'IV access + Epinephrine 1 mg IV', correct: true,  feedback: 'ถูก! Epi 1 mg ทุก 3-5 นาที' },
        { target: 'drug',   label: 'Atropine 1 mg',                    correct: false, feedback: 'Atropine ไม่ใช้ใน VF' },
        { target: 'drug',   label: 'NaHCO3 1 amp',                     correct: false, feedback: 'ไม่ใช่ตัวเลือกแรก' },
        { target: 'airway', label: 'หยุด CPR ใส่ ETT',                  correct: false, feedback: 'ห้ามหยุด CPR' },
      ],
      effect: { state: { ivAccess: true, epiGiven: 1 }, narration: 'Epinephrine 1 mg IV pushed!' },
    },
    {
      id: 9,
      narration: 'หลัง CPR 2 นาที ดู rhythm — ยังเป็น VF! สั่งอะไรต่อ?',
      commands: [
        { target: 'defib',      label: 'Shock อีกครั้ง 200 J',  correct: true,  feedback: 'ถูก! Shockable rhythm = shock' },
        { target: 'leader',     label: 'หยุด CPR เลิกพยายาม',    correct: false, feedback: 'ยังเร็วเกินไป' },
        { target: 'drug',       label: 'Adenosine 6 mg',         correct: false, feedback: 'Adenosine ใช้ใน SVT ไม่ใช่ VF' },
        { target: 'compressor', label: 'กดเร็วขึ้น 200/min',     correct: false, feedback: 'เร็วเกิน — ต้อง 100-120/min' },
      ],
      effect: { state: { compressorActive: false }, narration: '⚡ SHOCK 2 → resume CPR' },
    },
    {
      id: 10,
      narration: 'หลัง shock ครั้งที่ 2 ทำ CPR + พิจารณายาตัวต่อไป?',
      commands: [
        { target: 'drug', label: 'Amiodarone 300 mg IV bolus',          correct: true,  feedback: 'ถูก! Amio 300 mg หลัง shock 2-3' },
        { target: 'drug', label: 'Epi 5 mg IV',                         correct: false, feedback: 'ขนาดผิด — Epi 1 mg' },
        { target: 'drug', label: 'Lidocaine 100 mg เป็น first-line',     correct: false, feedback: 'Amio first-line ก่อน' },
        { target: 'drug', label: 'Magnesium 2 g',                        correct: false, feedback: 'Mg ใช้ใน Torsades — ไม่ใช่ VF ปกติ' },
      ],
      effect: { state: { compressorActive: true, amioGiven: 1, cprCycle: 2 }, narration: 'Amio 300 mg pushed! CPR ต่อ' },
    },
    {
      id: 11,
      narration: 'หลัง CPR 2 นาที — Rhythm เปลี่ยนเป็น Sinus + คลำ pulse ได้! ขั้นต่อไป?',
      commands: [
        { target: 'leader',     label: 'ROSC! เริ่ม post-arrest care + 12-lead ECG', correct: true,  feedback: 'เยี่ยม! Post-ROSC: airway, BP, TTM, identify cause' },
        { target: 'compressor', label: 'CPR ต่ออีก 2 นาที',                            correct: false, feedback: 'มี pulse แล้ว ไม่ต้อง CPR' },
        { target: 'defib',      label: 'Shock อีกครั้ง',                              correct: false, feedback: 'NSR ห้าม shock!' },
        { target: 'drug',       label: 'Epi 1 mg อีก dose',                           correct: false, feedback: 'ROSC แล้ว ไม่ต้อง bolus Epi อีก' },
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

// ============================================================
// 4. Bradycardia → Symptomatic + TCP — INTERMEDIATE (9 steps)
//    HR 30, hypotension, atropine fails → pacing → vasopressors.
// ============================================================
const bradyUnstable = {
  id: 'brady-unstable',
  title: 'Unstable Bradycardia → TCP',
  level: 'intermediate',
  durationLabel: '~8 นาที',
  description: 'ชาย 75 ปี HR 30 BP 70/40 — ฝึก Atropine → TCP → Vasopressors',
  intro: 'ชายอายุ 75 ปี ถูกพามา ER ด้วยอ่อนเพลียมาก หน้ามืด HR 30/min BP 70/40 GCS E3V4M5 — Monitor: 3rd degree AV block',
  initialState: { ...baseState, hr: 30, bp: '70/40', spo2: 92, rhythm: 'brady' },

  steps: [
    {
      id: 1,
      narration: '3rd-degree AVB hypotensive — ขั้นแรก?',
      commands: [
        { target: 'leader', label: 'ABC + IV + O₂ + 12-Lead + monitor + เรียก specialist', correct: true,  feedback: 'ถูก! High-degree AVB = unstable, เตรียมพร้อมทุกทาง' },
        { target: 'drug',   label: 'Epi 1mg bolus IV',                                       correct: false, feedback: 'ใช้ใน arrest — คนไข้ยังมี pulse' },
        { target: 'compressor', label: 'CPR เลย',                                            correct: false, feedback: 'มี pulse ห้าม CPR' },
        { target: 'defib',  label: 'Defib 200J',                                             correct: false, feedback: 'Bradycardia ห้าม defib' },
      ],
      effect: { state: { ivAccess: true }, narration: 'IV เปิด, O₂ NRB 15L, 12-Lead = complete heart block' },
    },
    {
      id: 2,
      narration: 'Symptomatic 3rd-degree AVB — ลอง Atropine มี chance ผลดีมั้ย?',
      commands: [
        { target: 'drug',   label: 'ลอง Atropine 1mg แต่อย่าหยุด chain ของ TCP', correct: true,  feedback: 'ถูก! Type II/3rd-degree → Atropine มัก ineffective แต่ลองได้ ขณะเตรียม TCP' },
        { target: 'drug',   label: 'Atropine ใช้ได้ผลแน่ — ไม่ต้องเตรียม TCP',     correct: false, feedback: 'Type II/3rd-degree มัก ineffective — ต้องเตรียม TCP ด้วย' },
        { target: 'drug',   label: 'Atropine ห้ามใช้ใน 3rd-degree',               correct: false, feedback: 'ใช้ได้ — แต่อย่าพึ่งพาอย่างเดียว' },
        { target: 'leader', label: 'ข้าม Atropine ไป TCP เลย',                     correct: false, feedback: 'ลอง Atropine ระหว่างเตรียม TCP ก็ได้' },
      ],
      effect: { state: { hr: 32 }, narration: 'Atropine 1mg pushed → HR ขึ้นนิดเดียว 32, BP ยังต่ำ' },
    },
    {
      id: 3,
      narration: 'Atropine ไม่ได้ผล — ขั้นถัดไป?',
      commands: [
        { target: 'defib', label: 'Transcutaneous Pacing (TCP) — sedate + เริ่ม pacing', correct: true,  feedback: 'ถูก! TCP first-line ใน atropine-refractory unstable brady' },
        { target: 'drug',  label: 'Atropine 5mg ทีเดียว',                                correct: false, feedback: 'Max dose total 3mg' },
        { target: 'compressor', label: 'CPR',                                             correct: false, feedback: 'มี pulse — ห้าม CPR' },
        { target: 'drug',  label: 'Lidocaine 100mg',                                      correct: false, feedback: 'ไม่ใช่สำหรับ brady' },
      ],
      effect: { narration: 'เตรียม TCP — ติด pad, เริ่ม Demand mode, set rate 70/min' },
    },
    {
      id: 4,
      narration: 'TCP setup — ก่อน start pacing ควรทำอะไร?',
      commands: [
        { target: 'drug',   label: 'Sedate ด้วย Midazolam 1-2mg + Fentanyl 25-50mcg',  correct: true,  feedback: 'ถูก! TCP เจ็บ ต้อง sedate ก่อน (ถ้าไม่ unconscious)' },
        { target: 'defib',  label: 'Output 200mA เริ่มเลย ไม่ sedate',                  correct: false, feedback: 'อันตราย — TCP เจ็บมาก' },
        { target: 'leader', label: 'รอให้คนไข้หลับเอง',                                  correct: false, feedback: 'ให้ยา sedate ดีกว่า' },
        { target: 'drug',   label: 'Atropine ซ้ำอีก dose',                              correct: false, feedback: 'ไม่ช่วย — ไป TCP' },
      ],
      effect: { state: { defibCharged: true }, narration: 'Sedate แล้ว — TCP พร้อม start' },
    },
    {
      id: 5,
      narration: 'เริ่ม pacing — set output ยังไง?',
      commands: [
        { target: 'defib', label: 'เริ่ม 0mA ค่อย ๆ เพิ่ม +10 mA จนได้ capture แล้ว +10 safety', correct: true,  feedback: 'ถูก! ค่อย ๆ เพิ่มจน electrical+mechanical capture' },
        { target: 'defib', label: 'Set 200mA ทันที',                                                correct: false, feedback: 'ไม่ต้องสูงเลยเริ่มต้น — ค่อย ๆ titrate' },
        { target: 'defib', label: 'Set 5mA แล้วทิ้งไว้',                                            correct: false, feedback: 'น้อยเกิน — ไม่ capture' },
        { target: 'defib', label: 'Set rate 200/min',                                               correct: false, feedback: 'Set rate 60-80 ก็พอ' },
      ],
      effect: { state: { hr: 70, bp: '92/56', defibCharged: false }, narration: 'Capture ที่ 70mA → safety margin 80mA, mechanical capture confirmed via femoral pulse' },
    },
    {
      id: 6,
      narration: 'Pacing capture แล้ว BP 92/56 ดีขึ้น — ระยะยาวต้องทำอะไรต่อ?',
      commands: [
        { target: 'leader', label: 'ปรึกษา cardiology ใส่ transvenous pacemaker + หาสาเหตุ', correct: true,  feedback: 'ถูก! TCP เป็น bridge → ต้อง transvenous + identify root cause' },
        { target: 'defib',  label: 'ทำ TCP อย่างเดียวยาว ๆ ไม่ต้องอะไรอีก',                    correct: false, feedback: 'TCP เจ็บ + pad burn ใช้ได้ไม่นาน — ต้องทำ transvenous' },
        { target: 'leader', label: 'D/C ward ทั่วไปเลย',                                       correct: false, feedback: 'ต้อง CCU/ICU' },
        { target: 'drug',   label: 'ฉีด Atropine ทุก 5 นาที',                                    correct: false, feedback: 'ไม่ช่วยแล้ว' },
      ],
      effect: { state: { hr: 72, bp: '108/70', spo2: 97 }, narration: 'On TCP, on dopamine drip 5 mcg/kg/min → BP stable, ส่ง CCU + cardiology' },
      finalStep: true,
    },
  ],
};

// ============================================================
// 5. PEA Cardiac Arrest with Hypovolemia — ADVANCED (9 steps)
//    Non-shockable arrest, must identify reversible cause to ROSC.
// ============================================================
const peaArrest = {
  id: 'pea-hypovolemia',
  title: 'PEA — Identify Reversible Cause',
  level: 'advanced',
  durationLabel: '~12 นาที',
  description: 'หญิง 65 ปี อาเจียนเป็นเลือดสด → arrest — ฝึก non-shockable + H&T (Hypovolemia)',
  intro: 'หญิง 65 ปี Hx peptic ulcer disease, ถ่ายดำ 3 วัน อาเจียนเป็นเลือดสด ~1 ลิตร ใน ER แล้วล้มลง — Hb 6.2, BP เคยวัดได้ 70/40 ก่อนจะ arrest',
  initialState: {
    ...baseState,
    consciousness: 'unresponsive',
    hr: 0, bp: '0/0', spo2: 0, etco2: 0,
    rhythm: 'flat',
  },

  steps: [
    {
      id: 1,
      narration: 'คนไข้ล้มลง — ขั้นแรก?',
      commands: [
        { target: 'leader',     label: 'Check response → call help → check pulse ≤10s',          correct: true,  feedback: 'ถูก! BLS sequence' },
        { target: 'compressor', label: 'CPR เลย ไม่ต้อง check',                                   correct: false, feedback: 'ต้อง assess ก่อน' },
        { target: 'drug',       label: 'Push fluid ทันที',                                         correct: false, feedback: 'ต้อง confirm arrest ก่อน' },
        { target: 'monitor',    label: '12-lead ECG 12 leads ก่อน',                                correct: false, feedback: 'รอ — assess pulse ก่อน' },
      ],
      effect: { narration: 'Unresponsive, no pulse, gasping → cardiac arrest' },
    },
    {
      id: 2,
      narration: 'ไม่มี pulse — สั่งอะไร?',
      commands: [
        { target: 'compressor', label: 'CPR 100-120/min, ลึก 5-6cm + ติด monitor pad',           correct: true,  feedback: 'ถูก!' },
        { target: 'compressor', label: 'CPR 60/min ก็พอ',                                          correct: false, feedback: 'ช้าเกิน' },
        { target: 'airway',     label: 'หยุดทุกอย่างใส่ ETT ก่อน',                                  correct: false, feedback: 'ห้ามหยุด CPR เพื่อ airway' },
        { target: 'drug',       label: 'Epi 1mg ก่อนทุกอย่าง',                                     correct: false, feedback: 'CPR + monitor มาก่อน' },
      ],
      effect: { state: { compressorActive: true, etco2: 8, hr: 100 }, narration: 'CPR เริ่มแล้ว, ติด pad — รอดู rhythm' },
    },
    {
      id: 3,
      narration: 'Rhythm: PEA (organized rhythm rate 70 แต่ไม่มี pulse) — ขั้นต่อไป?',
      commands: [
        { target: 'drug',  label: 'Continue CPR + IV/IO + Epinephrine 1mg ASAP',     correct: true,  feedback: 'ถูก! Non-shockable = Epi ASAP, ห้าม shock' },
        { target: 'defib', label: 'Charge 200J shock เลย',                            correct: false, feedback: 'อันตราย! PEA non-shockable — ห้าม shock' },
        { target: 'drug',  label: 'Atropine 1mg',                                      correct: false, feedback: 'Atropine ไม่ใช้ใน PEA แล้ว (AHA 2010+)' },
        { target: 'leader', label: 'รอ rhythm เปลี่ยนเป็น VF ค่อยทำอะไร',              correct: false, feedback: 'PEA = ทำ CPR + Epi + หาสาเหตุ' },
      ],
      effect: { state: { rhythm: 'pea', ivAccess: true, epiGiven: 1 }, narration: 'IV เปิด, Epi 1mg pushed, CPR ต่อ' },
    },
    {
      id: 4,
      narration: 'PEA arrest — ขั้นสำคัญที่สุดที่ต้องทำคือ?',
      commands: [
        { target: 'leader', label: 'หา reversible causes (5H 5T) — เน้น Hypovolemia ในเคสนี้',  correct: true,  feedback: 'ถูก! ใน PEA ต้อง systematic หา H\'s & T\'s' },
        { target: 'drug',   label: 'Epi อีก dose ทันที',                                          correct: false, feedback: 'Epi q3-5min — ไม่ใช่ทุก dose' },
        { target: 'defib',  label: 'Shock 200J',                                                  correct: false, feedback: 'ห้าม shock PEA' },
        { target: 'monitor', label: 'รอเฉย ๆ',                                                    correct: false, feedback: 'ห้ามรอ — PEA ต้อง active treatment' },
      ],
      effect: { narration: 'History GI bleed + Hb ต่ำ → Hypovolemia เป็นสาเหตุน่าจะที่สุด' },
    },
    {
      id: 5,
      narration: 'น่าจะ Hypovolemia (Hs ตัวแรก) — ทำอะไร?',
      commands: [
        { target: 'drug', label: 'IV fluid bolus NSS/LR 1L wide-open + เตรียมเลือด PRC',       correct: true,  feedback: 'ถูก! Volume + blood = treat root cause' },
        { target: 'drug', label: 'Epi เพิ่มเป็น 5mg',                                              correct: false, feedback: 'ขนาดผิด — Epi 1mg ทุก 3-5 min' },
        { target: 'drug', label: 'Furosemide 40mg IV',                                            correct: false, feedback: 'ผิดทาง — diuretic = ลดปริมาตร — แย่ลง' },
        { target: 'drug', label: 'Norepi 8mcg/min',                                                correct: false, feedback: 'Vasopressor ไม่ช่วยถ้าไม่มี volume — fluid ก่อน' },
      ],
      effect: { state: { etco2: 14 }, narration: 'NSS 1L wide-open, ขอเลือด O-neg 2 ถุงด่วน — EtCO₂ ขึ้น 14' },
    },
    {
      id: 6,
      narration: 'ระหว่าง CPR ดู airway/ventilation — ขั้นต่อไป?',
      commands: [
        { target: 'airway', label: 'Advanced airway (ETT/SGA) + waveform EtCO₂',     correct: true,  feedback: 'ถูก! ETT + EtCO₂ ช่วย monitor CPR quality + ROSC' },
        { target: 'airway', label: 'หยุด CPR แล้วใส่ ETT 5 นาที',                     correct: false, feedback: 'ห้ามหยุด CPR นาน — ใส่ระหว่าง compress' },
        { target: 'airway', label: 'Bag-mask ตลอด ไม่ต้องใส่ ETT',                    correct: false, feedback: 'ETT ดีกว่าใน prolonged arrest' },
        { target: 'leader', label: 'ไม่ต้องสน airway',                                  correct: false, feedback: 'Airway สำคัญ ใน PEA โดยเฉพาะ' },
      ],
      effect: { state: { airwayActive: true, etco2: 18 }, narration: 'ETT 7.5 #22cm, EtCO₂ waveform 18 — ventilation ดี' },
    },
    {
      id: 7,
      narration: 'ผ่านไป 4 นาที — เลือดมาแล้ว 2 ถุง + Epi dose 2 — สั่งอะไร?',
      commands: [
        { target: 'drug', label: 'Transfuse PRC + push fluid ต่อ + Epi q3-5min',       correct: true,  feedback: 'ถูก! Resuscitate volume + Epi ต่อ' },
        { target: 'drug', label: 'หยุด fluid — ให้แค่ Epi',                              correct: false, feedback: 'Hypovolemia ต้อง volume ก่อน' },
        { target: 'drug', label: 'Calcium gluconate 10ml',                                correct: false, feedback: 'ใช้ใน hyperkalemia — ไม่ใช่เคสนี้' },
        { target: 'drug', label: 'NaHCO₃ 100mEq routine',                                 correct: false, feedback: 'Routine ไม่แนะนำ — ใช้เฉพาะ confirmed acidosis/TCA OD' },
      ],
      effect: { state: { epiGiven: 2, etco2: 24 }, narration: 'PRC × 2, NSS 2L, Epi dose 2 → EtCO₂ 24 (>20!)' },
    },
    {
      id: 8,
      narration: 'EtCO₂ ขึ้น 24 (>20) — บอกอะไร?',
      commands: [
        { target: 'leader', label: 'อาจจะ ROSC! Pause CPR สั้น ๆ check rhythm + pulse', correct: true,  feedback: 'ถูก! EtCO₂ พุ่งสูง = อาจ ROSC ลอง check' },
        { target: 'compressor', label: 'CPR เร็วขึ้นเป็น 200/min',                         correct: false, feedback: 'EtCO₂ ขึ้น = อาจดีขึ้น ไม่ใช่ต้อง CPR หนักขึ้น' },
        { target: 'defib',  label: 'Charge defib 360J',                                    correct: false, feedback: 'PEA ห้าม shock' },
        { target: 'drug',   label: 'Epi อีก 5 dose ทีเดียว',                                correct: false, feedback: 'ขนาดผิด' },
      ],
      effect: { state: { compressorActive: false }, narration: 'Pause CPR — rhythm sinus 90/min, คลำ pulse ได้!' },
    },
    {
      id: 9,
      narration: 'ROSC! ขั้นถัดไป?',
      commands: [
        { target: 'leader', label: 'Post-ROSC: BP target MAP≥65, SpO₂ 94-98, Lab, EKG, OGD/Sx ICU', correct: true,  feedback: 'เยี่ยม! Post-ROSC + แก้สาเหตุ (GI bleed → endoscopy/surgery)' },
        { target: 'compressor', label: 'CPR ต่ออีก 2 นาทีเพื่อชัวร์',                                  correct: false, feedback: 'ROSC แล้ว ห้าม CPR' },
        { target: 'defib',  label: 'Defib 200J',                                                       correct: false, feedback: 'NSR + pulse ห้าม defib' },
        { target: 'drug',   label: 'D/C กลับบ้าน',                                                      correct: false, feedback: 'Post-ROSC ต้อง ICU + แก้สาเหตุ' },
      ],
      effect: {
        state: {
          compressorActive: false,
          rhythm: 'nsr', hr: 92, bp: '105/68', spo2: 96, etco2: 32,
          consciousness: 'rosc',
        },
        narration: '🎉 ROSC! Volume + blood + Epi → ส่ง ICU + endoscopy ด่วน',
      },
      finalStep: true,
    },
  ],
};

// ============================================================
// EXPORTS
// ============================================================
export const scenarios = [svtStable, bradyStable, vfArrest, bradyUnstable, peaArrest];

// Default export = first scenario for backward compat with any older imports
export const scenario = vfArrest;
