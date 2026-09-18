// ตารางวันเรียนภาคปฏิบัติ ACLS — ใช้กับหน้า /pre-course/schedule (ผ่าน activeDaySchedule)
//
// ต้นฉบับที่อ่านง่ายกว่า (พร้อมเหตุผลเบื้องหลังแต่ละช่วง) อยู่ที่
// docs/acls-teaching-schedule.md — แก้ที่ไฟล์นั้นแล้วซิงก์ตัวเลขมาที่นี่ด้วย
//
// ต่างจาก BLS ตรงบริบทงานจริง: อาจารย์ 1 ท่าน นักเรียน 6–8 คน จึงสอนเรียงฐาน
// ทีละฐานทั้งกลุ่ม (ไม่มีหมุนขนาน) และวันสอนมี 2 รูปแบบสถานที่ — จึง export
// เป็นหลาย variant ให้หน้าเว็บมี toggle เลือก
// ข้อมูลทั้งหมด static ไม่มีการเรียก network — เปิดได้แม้เน็ตล่ม

const STREET_META = {
  title: 'ตารางวันฝึก ACLS',
  subtitle: 'The Street — เซ็ตอัพ 10:00 · เริ่มสอน 11:00',
  facts: [
    { label: 'นักเรียน', value: '6–8 คน' },
    { label: 'อาจารย์', value: '1 ท่าน' },
    { label: 'ฐาน+จุดฝึก', value: '5 ฐาน' },
    { label: 'สอบ Megacode', value: 'รายคน' },
  ],
};

const STREET_BLOCKS = [
  {
    start: '10:00', end: '10:45', kind: 'prep',
    title: 'เซ็ตอัพ',
    lines: [
      'จัดหุ่น ALS + monitor/defibrillator · เปิดทดสอบเครื่องทุกตัว (manual mode, pacing, sync)',
      'เตรียมอุปกรณ์ airway (ET tube, laryngoscope, BVM) · ยาจำลอง + IV set · แผ่น ECG rhythm',
      'เชื่อมคลาสด้วยรหัสอาจารย์ + ตั้งฐานในระบบเช็คชื่อ (ปุ่ม "เพิ่มฐานมาตรฐาน")',
    ],
  },
  {
    start: '10:45', end: '11:00', kind: 'prep',
    title: 'ลงทะเบียน',
    lines: ['นักเรียนเปิดบัตร QR ให้สแกน · ตรวจสิทธิ์ว่าเรียนออนไลน์ครบ 13 บท + Post-test ผ่านแล้ว'],
  },
  {
    start: '11:00', end: '11:10', kind: 'teach',
    title: 'เปิดคอร์ส',
    lines: ['ชี้แจงเกณฑ์ผ่าน · ลำดับฐานของวัน · กติกาสอบ Megacode รายคน'],
  },
  {
    start: '11:10', end: '11:45', kind: 'teach',
    title: 'ฐาน 1: Airway & Breathing',
    lines: ['ทั้งกลุ่มที่ฐานเดียวกัน — สแกนเช็คชื่อเมื่อจบฐาน'],
  },
  {
    start: '11:45', end: '12:20', kind: 'teach',
    title: 'ฐาน 2: BLS + FBAO Removal',
    lines: [],
  },
  {
    start: '12:20', end: '13:05', kind: 'break',
    title: 'พักกลางวัน',
    lines: ['ใช้ช่วงพักรีเซ็ตเครื่อง defib + เตรียมแผ่น rhythm สำหรับช่วงบ่าย'],
  },
  {
    start: '13:05', end: '13:40', kind: 'teach',
    title: 'ฐาน 3: Electrical Therapy + AED',
    lines: ['Defib manual · Synchronized cardioversion · Transcutaneous pacing'],
  },
  {
    start: '13:40', end: '14:20', kind: 'teach',
    title: 'จุด A: VF/pVT + PEA/Asystole',
    lines: ['วิ่ง Cardiac Arrest Algorithm ทั้งสองเส้นทาง สลับกันเป็น team leader'],
  },
  {
    start: '14:20', end: '15:00', kind: 'teach',
    title: 'จุด B: Bradycardia + Tachycardia',
    lines: ['เคสยังมีชีพจร — ห้ามกดหน้าอก · จบจุด B แล้วต้องเช็คชื่อครบทุกฐาน ระบบจึงเปิดใบสอบให้'],
  },
  {
    start: '15:00', end: '15:10', kind: 'teach',
    title: 'บรีฟกติกาสอบ',
    lines: ['สอบทีละคน คนละ ~10 นาที · ระหว่างรอ คนอื่นเป็นทีมให้เพื่อน'],
  },
  {
    start: '15:10', end: '16:30', kind: 'exam',
    title: 'สอบ Megacode รายคน',
    lines: [
      'นักเรียนเป็น team leader ทีละคน — สแกน QR ที่ฐานสอบ ระบบสุ่มเคสและล็อกกับนักเรียน',
      '6 คน จบ ~16:10 · 7 คน ~16:20 · 8 คน ~16:30',
    ],
  },
  {
    start: '16:30', end: '16:40', kind: 'exam',
    title: 'สอบซ่อม · ปิดคอร์ส',
    lines: ['คนไม่ผ่านติวเฉพาะจุดที่ตกแล้วสอบใหม่ · ประกาศผล · ใบประกาศนียบัตร'],
  },
];

const HOSPITAL_META = {
  title: 'ตารางวันฝึก ACLS',
  subtitle: 'ใน รพ. (นอกสถานที่) — เริ่มสอน 08:00',
  facts: [
    { label: 'นักเรียน', value: '6–8 คน' },
    { label: 'อาจารย์', value: '1 ท่าน' },
    { label: 'ฐาน+จุดฝึก', value: '5 ฐาน' },
    { label: 'จบก่อนเที่ยง', value: '~13:05' },
  ],
};

const HOSPITAL_BLOCKS = [
  {
    start: '07:15', end: '07:50', kind: 'prep',
    title: 'เซ็ตอัพ',
    lines: [
      'จัดหุ่น ALS · ใช้ monitor/defibrillator ของหน่วยงานได้เลย — ทดสอบ manual mode, pacing, sync',
      'เชื่อมคลาสด้วยรหัสอาจารย์ + ตั้งฐานในระบบเช็คชื่อ · เช็คสัญญาณเน็ต/hotspot ในห้อง',
    ],
  },
  {
    start: '07:50', end: '08:00', kind: 'prep',
    title: 'ลงทะเบียน',
    lines: ['นักเรียนเปิดบัตร QR ให้สแกน · ตรวจสิทธิ์ว่าเรียนออนไลน์ครบ 13 บท + Post-test ผ่านแล้ว'],
  },
  {
    start: '08:00', end: '08:10', kind: 'teach',
    title: 'เปิดคอร์ส',
    lines: ['ชี้แจงเกณฑ์ผ่าน · ลำดับฐานของวัน · กติกาสอบ Megacode รายคน'],
  },
  {
    start: '08:10', end: '08:45', kind: 'teach',
    title: 'ฐาน 1: Airway & Breathing',
    lines: ['ทั้งกลุ่มที่ฐานเดียวกัน — สแกนเช็คชื่อเมื่อจบฐาน'],
  },
  {
    start: '08:45', end: '09:20', kind: 'teach',
    title: 'ฐาน 2: BLS + FBAO Removal',
    lines: [],
  },
  {
    start: '09:20', end: '09:55', kind: 'teach',
    title: 'ฐาน 3: Electrical Therapy + AED',
    lines: ['Defib manual · Synchronized cardioversion · Transcutaneous pacing'],
  },
  {
    start: '09:55', end: '10:05', kind: 'break',
    title: 'พักเบรก',
    lines: [],
  },
  {
    start: '10:05', end: '10:45', kind: 'teach',
    title: 'จุด A: VF/pVT + PEA/Asystole',
    lines: ['วิ่ง Cardiac Arrest Algorithm ทั้งสองเส้นทาง สลับกันเป็น team leader'],
  },
  {
    start: '10:45', end: '11:25', kind: 'teach',
    title: 'จุด B: Bradycardia + Tachycardia',
    lines: ['เคสยังมีชีพจร — ห้ามกดหน้าอก · จบจุด B แล้วต้องเช็คชื่อครบทุกฐาน ระบบจึงเปิดใบสอบให้'],
  },
  {
    start: '11:25', end: '11:35', kind: 'teach',
    title: 'บรีฟกติกาสอบ',
    lines: ['สอบทีละคน คนละ ~10 นาที · ระหว่างรอ คนอื่นเป็นทีมให้เพื่อน'],
  },
  {
    start: '11:35', end: '12:55', kind: 'exam',
    title: 'สอบ Megacode รายคน',
    lines: [
      'นักเรียนเป็น team leader ทีละคน — สแกน QR ที่ฐานสอบ ระบบสุ่มเคสและล็อกกับนักเรียน',
      '6 คน จบ ~12:35 · 7 คน ~12:45 · 8 คน ~12:55',
    ],
  },
  {
    start: '12:55', end: '13:05', kind: 'exam',
    title: 'สอบซ่อม · ปิดคอร์ส',
    lines: ['คนไม่ผ่านติวเฉพาะจุดที่ตกแล้วสอบใหม่ · ประกาศผล · ใบประกาศนียบัตร'],
  },
];

// ฐานอิงชุดมาตรฐาน DEFAULT_STATIONS.acls (src/data/checkinStations.js) และเกณฑ์
// อิง passRule จริงใน stationChecklists.js — ถ้าแก้ใบประเมิน ให้แก้ gate ที่นี่ตาม
export const STATIONS = [
  {
    key: '1',
    title: 'Airway & Breathing',
    items: [
      'เปิดทางเดินหายใจ head-tilt/chin-lift · jaw-thrust',
      'เลือกและใส่ OPA / NPA ถูกขนาด',
      'Bag-mask ventilation ทั้งเดี่ยวและ 2 คน (double EC-clamp)',
      'ประเมินประสิทธิภาพการช่วยหายใจ + ส่งต่อทีม',
    ],
    gate: 'ใบประเมิน airway ผ่าน 17/21 ข้อ + ข้อวิกฤตครบ',
  },
  {
    key: '2',
    title: 'BLS + FBAO Removal',
    items: [
      'High-quality CPR: ลึก 5–6 ซม. · 100–120 ครั้ง/นาที · full recoil',
      '2-rescuer + AED: สลับคนกดทุก 2 นาที หยุดกดไม่เกิน 10 วินาที',
      'แก้ทางเดินหายใจอุดกั้น (FBAO)',
    ],
    gate: 'ใบประเมิน BLS 2-rescuer ผ่าน 20/25 ข้อ + ข้อวิกฤตครบ',
  },
  {
    key: '3',
    title: 'Electrical Therapy + AED',
    items: [
      'อ่าน rhythm จาก monitor แล้วเลือกโหมดถูก',
      'Manual defibrillation (VF/pVT) — เลือก energy เคลียร์คน ช็อกปลอดภัย',
      'Synchronized cardioversion (unstable tachycardia) — กด SYNC ก่อนเสมอ',
      'Transcutaneous pacing (symptomatic bradycardia)',
    ],
    gate: 'ใบประเมิน Electrical Therapy ผ่าน 19/24 ข้อ + ข้อวิกฤตครบ',
  },
  {
    key: 'A',
    title: 'จุด A: Cardiac Arrest (VF/pVT + PEA/Asystole)',
    items: [
      'วิ่ง algorithm เส้น shockable: CPR → ช็อก → adrenaline → amiodarone',
      'เส้น non-shockable: CPR + adrenaline เร็วที่สุด + หา H’s & T’s',
      'สลับกันเป็น team leader · closed-loop communication',
    ],
    gate: 'ใบประเมิน Megacode Cardiac Arrest ผ่าน 21/26 ข้อ + ข้อวิกฤตครบ',
  },
  {
    key: 'B',
    title: 'จุด B: Bradycardia + Tachycardia',
    items: [
      'Bradycardia unstable: atropine → pacing / dopamine / adrenaline drip',
      'Tachycardia unstable: synchronized cardioversion',
      'Stable: แยก QRS กว้าง/แคบ ก่อนเลือกยา',
      'เคสมีชีพจรตลอด — ห้ามกดหน้าอก',
    ],
    gate: 'ใบประเมิน Brady ผ่าน 15/19 · Tachy ผ่าน 18/22 + ข้อวิกฤตครบ',
    note: 'จบจุด B แล้วอาจารย์สแกนเช็คชื่อให้ครบทุกฐาน — ระบบบล็อกใบสอบ Megacode จนกว่านักเรียนคนนั้นจะเช็คชื่อฐานอื่นครบ',
  },
  {
    key: 'MC',
    title: 'สอบ Megacode (สุ่มข้อสอบ)',
    items: [
      'สอบทีละคน — นักเรียนเป็น team leader เพื่อนที่เหลือเป็นทีม',
      'สแกน QR ที่ฐานสอบ → ระบบสุ่มเคสจากธนาคารข้อสอบแล้วล็อกกับนักเรียน (สแกนซ้ำได้โจทย์เดิม)',
      'อาจารย์ติ๊กใบประเมินในแอป ระบบคำนวณผ่าน/ตกให้ทันที',
    ],
    gate: 'ผ่านตาม passRule ของเคสที่สุ่มได้ + ข้อวิกฤตครบ',
    subPlan: [
      { at: 'คนละ', what: '~10 นาที: รันเคส 7–8 นาที + feedback 2 นาที' },
      { at: '6 คน', what: 'ช่วงสอบรวม ~60 นาที' },
      { at: '8 คน', what: 'ช่วงสอบรวม ~80 นาที' },
    ],
  },
];

export const PASS_RULES = [
  { part: 'บทเรียนออนไลน์ 13 บท', rule: 'ควิซ ≥ 70% ทุกบท', when: 'ก่อนวันเรียน' },
  { part: 'Pre-test 20 ข้อ', rule: 'ทำก่อนเริ่มเรียน (วัดพื้นฐาน)', when: 'ก่อนวันเรียน' },
  { part: 'Post-test 30 ข้อ', rule: '≥ 85%', when: 'ก่อนวันเรียน' },
  { part: 'เข้าฐานฝึก', rule: 'ครบทุกฐาน (ระบบเช็คจาก QR)', when: 'วันเรียน' },
  { part: 'สอบ Megacode', rule: 'ผ่าน passRule ของเคส + ข้อวิกฤตทุกข้อ', when: 'วันเรียน', critical: true },
];

export const CONTINGENCIES = [
  { when: 'อาจารย์ติดเคสด่วน/มาช้า', then: 'อาจารย์คนเดียวคือ single point of failure — แจ้งเลื่อนทั้งรุ่นแต่เนิ่นๆ ดีกว่าตัดเนื้อหา ถ้าช้าไม่เกิน 30 นาที ตัดช่วงเปิดคอร์สและย่อฐาน 1–3 ฐานละ 5 นาที' },
  { when: 'นักเรียนมาสาย', then: 'กลุ่มเล็ก รอไม่ได้นาน — ให้เข้าฐานที่กำลังสอนเลย แล้วเก็บฐานที่ขาดช่วงพัก/ก่อนสอบ (ระบบไม่เปิดใบสอบให้จนกว่าจะเช็คชื่อครบ)' },
  { when: 'monitor/defib ใช้ไม่ได้', then: 'ที่ รพ.: ยืมเครื่องสำรองของ ward · ที่ The Street: ฐาน 3 สอนด้วยรูปหน้าจอ + พูด sequence แล้วนัดชดเชยกับเครื่องจริง' },
  { when: 'เคสสอบลากยาวเกินคนละ 10 นาที', then: 'อาจารย์คุมเวลาเข้ม: ถึงนาทีที่ 8 ให้จบเคสที่จุดที่อยู่ แล้วตัดสินจากที่เห็น — เผื่อเวลาไว้แล้วคนละ ~2 นาที' },
  { when: 'เน็ตล่ม', then: 'จดผลลงกระดาษแล้วกรอกเข้าระบบเมื่อเน็ตกลับมา — ระบบเช็คชื่อไม่มีคิว offline' },
];

export const DAY_VARIANTS = [
  { key: 'street', label: 'The Street', sublabel: 'เริ่ม 11:00', meta: STREET_META, blocks: STREET_BLOCKS },
  { key: 'hospital', label: 'ใน รพ.', sublabel: 'เริ่ม 08:00', meta: HOSPITAL_META, blocks: HOSPITAL_BLOCKS },
];
