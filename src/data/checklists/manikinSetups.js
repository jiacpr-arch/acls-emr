// คู่มือ "เตรียมหุ่น + ลำดับจังหวะ" สำหรับอาจารย์/ผู้คุมหุ่น ที่ฐาน Megacode
//
// ปัญหาที่แก้: ใบสอบ/ใบฝึกเดิมบอกแค่โจทย์ผู้ป่วยกับ algorithm (เช่น "PEA → VF →
// ROSC") อาจารย์ที่มาคุมฐานจึงไม่รู้ว่า "ต้องตั้งหุ่นยังไง เตรียมจังหวะอะไรบ้าง
// และเปลี่ยนจากจังหวะไหนไปจังหวะไหนตอนไหน" ไฟล์นี้เติมส่วนที่ขาดให้ครบ
//
// ⚠️ ไฟล์นี้ "ไม่แตะ" เนื้อหาข้อสอบ — แยกไฟล์ออกมาโดยเฉพาะเพื่อให้ธนาคารข้อสอบ
// (megacodeCases.js) ยังเทียบกับต้นฉบับ docx ได้บรรทัดต่อบรรทัด ผูกกับเคสด้วย
// id เท่านั้น (case-01…case-15, practice-01…practice-10 และ id ของใบประเมิน
// สถานี megacode*) เคสจากเกม Code Blue Sim ไม่อยู่ในไฟล์นี้ — สร้าง setup
// อัตโนมัติจากบทของเกมใน codeBlueExamCases.js
//
// โครงสร้างต่อเคส:
//   manikin : ตั้ง/แต่งหุ่นเฉพาะเคสนี้ (เพิ่มจากชุดมาตรฐาน MANIKIN_BASE_KIT)
//   props   : อุปกรณ์เฉพาะเคสที่ต้องวางรอไว้ที่ฐาน
//   steps[] : ลำดับจังหวะบนจอ เรียงตามเวลา
//     rhythm : จังหวะที่ต้องตั้ง (ชื่อ + rate)
//     vitals : ค่าที่โชว์/ตอบเมื่อทีมถาม
//     cue    : สิ่งที่ผู้คุมหุ่นต้องพูด/แสดงในขั้นนี้ (ผลตรวจ อาการ เสียงปอด ฯลฯ)
//     next   : เปลี่ยนเป็นจังหวะไหน "เมื่อทีมทำอะไร" — หัวใจของแผ่นนี้
//
// อ้างอิงเนื้อหาทางคลินิก: AHA ACLS 2020 (rate/ขนาดยา/ลำดับ algorithm)
// ตัวเลขสัญญาณชีพเป็น "ค่าที่แนะนำให้ตั้ง" ให้เคสเดินได้ตามใบประเมิน — อาจารย์
// ปรับได้ตามอุปกรณ์ที่ศูนย์มีจริง

// ชุดอุปกรณ์ที่ต้องมีทุกเคส — โชว์ครั้งเดียวในแผงคู่มือ ไม่ต้องเขียนซ้ำ 25 เคส
export const MANIKIN_BASE_KIT = [
  'หุ่นฝึก ACLS ผู้ใหญ่ (กดหน้าอกได้ + ใส่ท่อช่วยหายใจได้) วางบนพื้นแข็ง/แผ่นรองหลัง',
  'เครื่อง defib/monitor ฝึก: manual defib + synchronized cardioversion + transcutaneous pacing พร้อม pads และรีโมทเปลี่ยนจังหวะ',
  'ชุดทางเดินหายใจ: bag-mask, OPA/NPA, ET tube + laryngoscope, capnography (จำลอง), เครื่องดูดเสมหะ',
  'ยา/สารน้ำจำลอง: epinephrine 1 mg, amiodarone 300/150 mg, atropine 1 mg, NSS/LRS + ชุดเปิดเส้น IV/IO',
  'ผู้คุมหุ่น 1 คน ถือแผ่นนี้ — ทำหน้าที่เปลี่ยนจังหวะบนจอ + ตอบค่าสัญญาณชีพ/ผลตรวจเมื่อทีมถาม',
];

// วิธีใช้แผ่นนี้หน้างาน — โชว์ใต้หัวข้อในแผงคู่มือ
export const MANIKIN_HOWTO = [
  'ตั้งจังหวะขั้นที่ 1 ค้างไว้ "ก่อน" เรียกนักเรียนเข้าฐาน แล้วอ่านโจทย์ให้ฟัง',
  'เปลี่ยนจังหวะเฉพาะเมื่อทีมทำสิ่งที่ระบุในช่อง "เปลี่ยนเมื่อ" เท่านั้น — ทีมยังไม่ทำ ห้ามเปลี่ยนเอง',
  'ทีมทำผิด/ช้าเกิน 2 cycle: คงจังหวะเดิมไว้ (ให้เคสไม่ดีขึ้น) แล้วบันทึกไว้ตอนให้คะแนน',
  'ค่าสัญญาณชีพให้ตอบเมื่อทีมถาม/ประเมินเท่านั้น อย่าบอกล่วงหน้า',
];

// ── ธนาคารข้อสอบ 15 เคส (megacodeCases.js) ───────────────────────────────────
const EXAM_SETUPS = {
  'case-01': {
    manikin: 'หุ่นชายวัยกลางคน ไม่หายใจ ไม่มีชีพจร · แต้มรอยช้ำ/รอยถลอกที่อกซ้าย · จัดขาสองข้างให้ผิดรูป · ปิด/ลดเสียงปอดข้างซ้าย · ใส่ hard collar รอไว้ให้ทีมทำ C-spine precaution ต่อ',
    props: ['ชุด needle thoracocentesis + ชุด ICD', 'pelvic binder + เฝือกดามขา', 'ถุงเลือด/สารน้ำจำลองสำหรับ massive transfusion', 'hard collar + long spinal board'],
    steps: [
      {
        rhythm: 'PEA — sinus tachycardia ~140/min (QRS แคบ เป็นจังหวะบนจอ)',
        vitals: 'BP: วัด/คลำไม่ได้ · SpO₂: no signal · EtCO₂ 8-10 mmHg',
        cue: 'ตอบเมื่อทีมประเมิน: ไม่รู้สึกตัว ไม่หายใจ คลำ carotid ไม่ได้ · ฟังปอดซ้ายเงียบ เคาะโปร่ง หลอดลมเบี้ยวไปทางขวา เส้นเลือดคอโป่ง · ท้องไม่โป่ง เชิงกรานโยกได้',
        next: '→ VF เมื่อทีมทำ needle thoracocentesis ข้างซ้าย + ให้เลือด/สารน้ำแล้ว (ราว 2 cycle / นาทีที่ 4-6)',
      },
      {
        rhythm: 'VF (ventricular fibrillation)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12-15 mmHg (ขึ้นเล็กน้อยหลังแก้ pneumothorax)',
        cue: 'ถ้าทีมช็อกโดยไม่เคลียร์ทีม/ไม่กดต่อทันทีหลังช็อก ให้จดไว้ตอนให้คะแนน · คง VF ไว้จนกว่าจะได้ทั้ง shock และ amiodarone',
        next: '→ ROSC เมื่อ shock ครั้งที่ 2 + amiodarone 300 mg IV และทีมกลับมากดต่อทันที',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~110/min',
        vitals: 'BP 90/60 mmHg · SpO₂ 96% (on ETT) · EtCO₂ พุ่งขึ้นเป็น 35 mmHg',
        cue: 'ให้ EtCO₂ กระโดดขึ้นก่อน 1-2 วินาที เป็นสัญญาณให้ทีมจับ ROSC เอง (อย่าประกาศแทน) · ผู้ป่วยยังไม่รู้สึกตัว',
        next: 'จบเคส — ให้ทีมทำ post-ROSC care, pelvic binding/splint, ประสานผ่าตัด/ส่งต่อ แล้วปิดเคส',
      },
    ],
  },
  'case-02': {
    manikin: 'หุ่นชาย COPD ใส่ ET tube ค้างไว้แล้ว "ผิดตำแหน่ง" (จำลอง esophageal intubation: บีบ bag แล้วท้องโป่ง ไม่มีเสียงลมเข้าปอดทั้งสองข้าง capnography เป็นเส้นแบน) · ปิดเสียงปอดข้างซ้ายไว้ด้วย',
    props: ['ชุดใส่ ET tube ใหม่ + ETCO₂ detector', 'ชุด needle thoracocentesis + ชุด ICD', 'ป้าย/การ์ด DOPE ไว้เฉลยตอน debrief'],
    steps: [
      {
        rhythm: 'Asystole (เส้นแบน — ยืนยัน ≥2 lead)',
        vitals: 'BP: วัดไม่ได้ · SpO₂ ไม่ขึ้น · EtCO₂: เส้นแบน 0 mmHg',
        cue: 'บีบ bag → ท้องโป่ง เสียงลมเข้าท้อง ไม่มีเสียงปอด · ถ้าทีมถาม EtCO₂ ตอบว่า "ไม่มี waveform เลย" (เบาะแสท่อผิดตำแหน่ง ไม่ใช่แค่ arrest)',
        next: '→ VF เมื่อทีมใส่ ET tube ใหม่ถูกตำแหน่ง + ยืนยันตำแหน่งท่อ และทำ needle thoracocentesis ข้างซ้าย',
      },
      {
        rhythm: 'VF',
        vitals: 'EtCO₂ 12-15 mmHg (มี waveform แล้วหลังใส่ท่อใหม่)',
        cue: 'คง VF ไว้จนกว่าทีมจะให้ทั้ง shock และ amiodarone 300 mg',
        next: '→ ROSC หลัง shock + amiodarone 300 mg IV',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~100/min',
        vitals: 'BP 100/60 mmHg · SpO₂ 95% · EtCO₂ 35 mmHg',
        cue: 'ให้ทีมยืนยันตำแหน่งท่อซ้ำ + ฟังปอดสองข้างหลัง ROSC',
        next: 'จบเคส — สรุป DOPE ตอน debrief',
      },
    ],
  },
  'case-03': {
    manikin: 'หุ่นหญิงตั้งครรภ์ (หรือหุ่นผู้ใหญ่ + หมอนจำลองครรภ์ GA 32 สัปดาห์) ไม่หายใจ ไม่มีชีพจร · ใส่สิ่งแปลกปลอมจำลอง (ชิ้นอาหาร/ฟองน้ำ) ไว้ในคอหอย · หนุนสะโพกขวาด้วยลิ่ม/ผ้าห่มม้วน เพื่อให้ทีมทำ left uterine displacement ต่อ',
    props: ['Magill forceps + laryngoscope', 'เครื่องดูดเสมหะ', 'ชุดเครื่องมือ perimortem cesarean delivery (จำลอง)', 'เบอร์/ป้ายเรียกทีมสูติ-กุมารแพทย์'],
    steps: [
      {
        rhythm: 'PEA — sinus rhythm ~70/min (มีจังหวะบนจอ แต่ไม่มีชีพจร)',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'เล่าฉากก่อนหมดสติ: กินอาหารอยู่ เอามือกุมคอ (choking sign) · บีบ bag แล้วลมเข้ายาก หน้าอกไม่ขยับ (ทางเดินหายใจอุดกั้น) · ถ้าทีมไม่ทำ uterine displacement ให้ BP/EtCO₂ ต่ำค้างไว้',
        next: '→ VF เมื่อทีมนำสิ่งแปลกปลอมออกได้ + ใส่ ET tube สำเร็จ (ราวนาทีที่ 4)',
      },
      {
        rhythm: 'VF',
        vitals: 'EtCO₂ 15 mmHg (ลมเข้าปอดได้แล้ว)',
        cue: 'ถ้ายังไม่ ROSC ภายใน 4-5 นาที ให้ผู้คุมหุ่นถามนำว่า "จะทำอะไรกับทารกครับ/คะ" เพื่อดูว่าทีมนึกถึง perimortem C/S',
        next: '→ ROSC หลัง defibrillation + amiodarone 300 mg IV',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~100/min',
        vitals: 'BP 100/70 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ให้ทีมคง left uterine displacement ต่อ และประเมินทารก/ตามทีมสูติ',
        next: 'จบเคส',
      },
    ],
  },
  'case-04': {
    manikin: 'หุ่นชายหนุ่ม ตัวเปียก (พรมน้ำ/คลุมผ้าชุบน้ำ) ไม่หายใจ ไม่มีชีพจร · ใส่น้ำ/เสมหะจำลองในทางเดินหายใจให้ทีมต้องดูดออก · แจ้งอุณหภูมิแกน 34°C เมื่อทีมวัด',
    props: ['เครื่องดูดเสมหะ + สาย suction', 'ผ้าห่ม/เครื่องทำความอบอุ่น (warming blanket)', 'เทอร์โมมิเตอร์แกนกลาง', 'amiodarone ทั้ง 300 mg และ 150 mg แยกหลอดให้เห็นชัด'],
    steps: [
      {
        rhythm: 'VF — refractory (ตั้งค้างไว้ ห้ามเปลี่ยนเร็ว)',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 10 mmHg · Temp 34°C',
        cue: 'เคสจมน้ำ = hypoxic arrest → ดูว่าทีมยึด A → B → C (ช่วยหายใจก่อน) หรือไม่ · ดูด ET tube แล้วมีน้ำ/สิ่งแปลกปลอมออก · คง VF ไว้แม้ทีมช็อกครั้งที่ 1-3 และให้ epinephrine + amiodarone 300 mg แล้ว',
        next: '→ ROSC เมื่อครบทั้ง 3 อย่าง: shock ซ้ำตามข้อบ่งชี้ + amiodarone ซ้ำ 150 mg + เริ่ม rewarming (ถ้ายังขาดข้อใด ให้คง VF ต่อ)',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 100/60 mmHg · SpO₂ 94% (on ETT) · EtCO₂ 35 mmHg · Temp 34°C',
        cue: 'อุณหภูมิยังต่ำ — ดูว่าทีมสั่ง rewarming ต่อและวางแผน ICU',
        next: 'จบเคส',
      },
    ],
  },
  'case-05': {
    manikin: 'หุ่นชายสูงอายุ นอนบนเตียงผู้ป่วยใน มี monitor ติดอยู่แล้วและมีเส้น IV เดิมคาไว้ · เริ่มเคสตอนหุ่นยังพูดได้ว่า "เจ็บหน้าอก" แล้วเงียบไป (ผู้คุมหุ่นพูดแทน) จากนั้นไม่หายใจ ไม่มีชีพจร',
    props: ['เครื่อง 12-lead ECG (หรือแผ่น ECG จำลอง STEMI ไว้ยื่นให้หลัง ROSC)', 'aspirin/ยา ACS จำลอง', 'ใบส่ง cath lab'],
    steps: [
      {
        rhythm: 'VF (coarse) — ดื้อต่อการช็อก 2 ครั้งแรก',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10-12 mmHg',
        cue: 'เริ่มเคสด้วย monitor alarm ดัง แล้วให้ทีมยืนยันว่าไม่มีชีพจรเอง · ช็อกครั้งที่ 1 และ 2: คง VF ไว้เหมือนเดิม',
        next: '→ ROSC หลัง shock ครั้งที่ 3 + amiodarone 300 mg IV (ให้ครบ epinephrine ทุก 3-5 นาทีด้วย)',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min พร้อม ST elevation (lead II, III, aVF)',
        vitals: 'BP 100/70 mmHg · SpO₂ 95% · EtCO₂ 35 mmHg',
        cue: 'ยื่นแผ่น 12-lead ECG ที่มี ST elevation ให้ทันทีที่ทีมสั่ง — ดูว่าทีมต่อยอดเป็น ACS pathway',
        next: 'จบเคส — ทีมต้องสั่ง 12-lead, aspirin/antiplatelet และเตรียม cath lab',
      },
    ],
  },
  'case-06': {
    manikin: 'หุ่นหญิงอายุน้อย "ยังรู้สึกตัวแต่ซึม" — ผู้คุมหุ่นพูดแทนผู้ป่วย ("หน้ามืด จะเป็นลม") · ผิวเย็นชื้น · มีชีพจรช้าคลำได้เบา (เคสนี้ไม่ใช่ cardiac arrest ห้ามให้ทีมกดหน้าอก)',
    props: ['แผ่น pacing + สายเครื่อง pacing', 'atropine หลายหลอด (ให้ครบ max 3 mg)', 'ยา sedation จำลอง (midazolam/fentanyl) สำหรับก่อน cardioversion'],
    steps: [
      {
        rhythm: '3rd degree AV block — HR 30/min (P wave กับ QRS ไม่สัมพันธ์กัน)',
        vitals: 'BP 70/40 mmHg · SpO₂ 93% · RR 22 · ผู้ป่วยซึม เหงื่อแตก',
        cue: 'ไม่ตอบสนองต่อ atropine — ให้ atropine กี่ครั้ง HR ก็ยังคง 30/min (สอนว่า block ระดับ AV node ล่างมัก atropine ไม่ได้ผล)',
        next: '→ Paced rhythm (capture) เมื่อทีมตั้ง transcutaneous pacing และไล่ mA ขึ้นถึง threshold ~70-80 mA',
      },
      {
        rhythm: 'Paced rhythm — capture ที่ 70-80 mA, HR 70/min',
        vitals: 'BP 90/60 mmHg · ผู้ป่วยรู้สึกตัวขึ้น แต่บ่นเจ็บหน้าอกจากไฟ pacing',
        cue: 'ถ้าทีมไม่ยืนยัน "mechanical capture" ด้วยการคลำชีพจร ให้ถามนำว่า "จับ capture ได้จริงไหมครับ/คะ"',
        next: '→ Unstable VT (มีชีพจร) หลังจับ capture ได้ประมาณ 1-2 นาที — ประกาศว่าจอเปลี่ยน ผู้ป่วยซึมลงทันที',
      },
      {
        rhythm: 'Unstable VT (มีชีพจร) — wide QRS ~180/min',
        vitals: 'BP 50/30 mmHg · ผู้ป่วยซึมลงมาก แต่ยังคลำชีพจรได้',
        cue: 'ย้ำเมื่อทีมถาม: "ยังคลำชีพจรได้" (เพื่อให้เลือก synchronized cardioversion ไม่ใช่ defibrillation) · ถ้าทีมกดปุ่มโดยไม่กด sync ให้จดไว้',
        next: '→ NSR เมื่อทีมทำ synchronized cardioversion 100 J (ให้เครดิตถ้าให้ sedation ก่อน)',
      },
      {
        rhythm: 'Normal sinus rhythm ~80/min (ใบสอบเรียกขั้นนี้ว่า ROSC)',
        vitals: 'BP 110/70 mmHg · SpO₂ 98% · ผู้ป่วยรู้สึกตัวดี',
        cue: 'ให้ทีมประเมินซ้ำ + สั่ง 12-lead ECG และวางแผนดูแลต่อ',
        next: 'จบเคส',
      },
    ],
  },
  'case-07': {
    manikin: 'หุ่นชายสูงอายุ นอนบนเตียง หลังผ่าตัดช่องท้อง (แปะแผลผ่าตัดจำลอง) · เริ่มเคสตอนยังรู้สึกตัว บ่นแน่นหน้าอก (ผู้คุมหุ่นพูดแทน) · เตรียมทรุดเป็น arrest ระหว่างเคส',
    props: ['แผ่น pacing (แปะรอไว้ให้ทีมสั่ง standby)', 'atropine', 'เครื่อง 12-lead ECG + แผ่น ECG จำลอง'],
    steps: [
      {
        rhythm: '3rd degree AV block — HR 30/min',
        vitals: 'BP 80/50 mmHg · SpO₂ 95% · ผู้ป่วยรู้สึกตัว บ่นแน่นหน้าอก',
        cue: 'atropine ไม่ได้ผล (HR คง 30/min) · ดูว่าทีมสั่งเตรียม/แปะแผ่น pacing ไว้ล่วงหน้าหรือไม่ — เป็นข้อประเมินสำคัญของเคสนี้',
        next: '→ VF หลังจากทีมให้ atropine ครบและเตรียม pacing (หรือช้าเกิน 2 นาที) — ประกาศ "ผู้ป่วยหมดสติ จอเปลี่ยน!"',
      },
      {
        rhythm: 'VF',
        vitals: 'BP: วัดไม่ได้ · ไม่มีชีพจร · EtCO₂ 10 mmHg',
        cue: 'ทีมต้องสลับมาเป็น cardiac arrest algorithm ทันที: CPR + defibrillation (ไม่ใช่ pacing)',
        next: '→ 2nd degree AV block type II เมื่อทีมช็อกสำเร็จ (คลำชีพจรได้แล้ว)',
      },
      {
        rhythm: '2nd degree AV block type II (Mobitz II) — HR 40/min',
        vitals: 'BP 80/50 mmHg · คลำชีพจรได้ · ผู้ป่วยซึม',
        cue: 'ตอบเมื่อทีมถาม: "P wave เยอะกว่า QRS, PR คงที่, มี QRS ตกหล่นเป็นช่วง" · ถ้าทีมจะช็อกซ้ำ ให้ย้ำว่าคลำชีพจรได้',
        next: '→ Paced rhythm (capture) เมื่อทีมทำ transcutaneous pacing และไล่หา threshold ได้',
      },
      {
        rhythm: 'Paced rhythm — capture, HR 70/min',
        vitals: 'BP 100/60 mmHg · SpO₂ 97% · EtCO₂ 35 mmHg',
        cue: 'ยื่นแผ่น 12-lead ECG (ST elevation ผนังล่าง) เมื่อทีมสั่ง',
        next: 'จบเคส — ทีมต้องต่อยอด ACS management และปรึกษา cardiology',
      },
    ],
  },
  'case-08': {
    manikin: 'หุ่นชายวัยกลางคน · เริ่มเคสด้วยผู้คุมหุ่นบรรยาย "เพิ่งชักเกร็งกระตุกจบไปเมื่อครู่" · มีน้ำลาย/สารคัดหลั่งในปาก (ใส่น้ำจำลองให้ทีมต้องดูด) · หายใจเฮือกช้าๆ ชีพจรช้ามาก',
    props: ['เครื่องดูดเสมหะ', 'atropine หลายหลอด', 'แผ่น pacing', 'เครื่องเจาะน้ำตาลปลายนิ้ว (DTX)'],
    steps: [
      {
        rhythm: 'Sinus bradycardia — HR 24/min',
        vitals: 'BP 70/40 mmHg · SpO₂ 88% · ยังคลำชีพจรได้ · ผู้ป่วยไม่รู้สึกตัวหลังชัก',
        cue: 'ตอบว่ามีน้ำลายมากในปาก (ทีมต้องดูดและเปิดทางเดินหายใจก่อน) · atropine dose แรกไม่ได้ผล — HR ยังคง 24/min',
        next: '→ Asystole เมื่อทีมให้ atropine dose ที่ 2 / เตรียม pacing แล้ว (หรือครบ 2 นาที) — ประกาศ "คลำชีพจรไม่ได้แล้ว!"',
      },
      {
        rhythm: 'Asystole (เส้นแบน — ยืนยัน ≥2 lead)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 8 mmHg',
        cue: 'ทีมต้องเริ่ม CPR ทันทีและให้ epinephrine 1 mg · ถ้าทีมจะช็อก asystole ให้จดไว้ (ข้อผิดที่พบบ่อย)',
        next: '→ VF หลัง epinephrine 1 dose + CPR 1 cycle (2 นาที)',
      },
      {
        rhythm: 'VF',
        vitals: 'EtCO₂ 12 mmHg',
        cue: 'คง VF จนกว่าทีมจะช็อกอย่างปลอดภัย (เคลียร์ทีม) และกลับมากดต่อทันที',
        next: '→ ROSC หลัง defibrillation',
      },
      {
        rhythm: 'ROSC — NSR ~90/min มี PVCs เป็นระยะ',
        vitals: 'BP 110/70 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ผู้ป่วยยังไม่ตื่นดี — ดูว่าทีมดูแลทางเดินหายใจหลังชักและหาสาเหตุการชักต่อ (รวมเจาะ DTX)',
        next: 'จบเคส',
      },
    ],
  },
  'case-09': {
    manikin: 'หุ่นชายหนุ่ม รู้สึกตัวแต่กระสับกระส่าย (ผู้คุมหุ่นพูดแทน: "ใจสั่น แน่นหน้าอก จะเป็นลม") · ผิวเย็นชื้น · ชีพจรเร็วมากคลำได้เบา · เคสนี้เริ่มแบบยังมีชีพจร',
    props: ['เครื่อง defib ที่กดโหมด sync ได้จริง', 'ยา sedation จำลอง', 'สารน้ำ NSS สำหรับ bolus'],
    steps: [
      {
        rhythm: 'SVT — narrow complex สม่ำเสมอ ~200/min',
        vitals: 'BP 70/40 mmHg · SpO₂ 94% · ผู้ป่วยซึมลง เหงื่อแตก',
        cue: 'ยืนยันเมื่อทีมถาม: "คลำชีพจรได้ เร็วและเบา" → unstable tachycardia · Cardioversion ครั้งแรก (50-100 J): ไม่สำเร็จ คง SVT ไว้เหมือนเดิม',
        next: '→ VF เมื่อทีมทำ synchronized cardioversion ครั้งที่ 2 ด้วยพลังงานที่สูงขึ้น',
      },
      {
        rhythm: 'VF',
        vitals: 'BP: วัดไม่ได้ · ไม่มีชีพจร · EtCO₂ 10 mmHg',
        cue: 'ทีมต้องเปลี่ยนเป็น defibrillation (ปลด sync) + เริ่ม CPR ทันที — ถ้ายังกด sync ค้างแล้วเครื่องไม่ปล่อยไฟ ให้ปล่อยให้ทีมค้นพบเอง',
        next: '→ PEA หลัง defibrillation 1 ครั้ง',
      },
      {
        rhythm: 'PEA — sinus bradycardia ~45/min บนจอ แต่คลำชีพจรไม่ได้',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'ย้ำว่า "จอมีจังหวะแต่คลำชีพจรไม่ได้" · ทีมต้อง CPR + epinephrine + ไล่ H\'s & T\'s และให้สารน้ำ',
        next: '→ ROSC เมื่อทีม CPR ต่อเนื่อง + epinephrine + IV fluid bolus (ราว 1-2 cycle)',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 100/60 mmHg · SpO₂ 97% · EtCO₂ 35 mmHg',
        cue: 'ให้ทีมสั่ง 12-lead ECG และประเมินซ้ำ',
        next: 'จบเคส',
      },
    ],
  },
  'case-10': {
    manikin: 'หุ่นหญิงสูงอายุ นั่ง/นอนที่ห้องตรวจ OPD มี cuff วัดความดันคาแขน · ทรุดหมดสติทันทีตอนเริ่มเคส · เคสนี้ "ไม่มี ROSC" — ปลายทางคือให้ทีมตัดสินใจยุติการช่วยฟื้นคืนชีพ',
    props: ['แผ่น pacing', 'amiodarone 300 mg', 'สารน้ำ + ยา inotrope จำลอง', 'มีผู้แสดงเป็นญาติรออยู่หน้าห้อง (สำหรับข้อสื่อสารกับญาติ)'],
    steps: [
      {
        rhythm: 'Pulseless VT — wide QRS เร็ว ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10 mmHg',
        cue: 'ยืนยันเมื่อทีมคลำ: "คลำชีพจรไม่ได้" → shockable · ทีมต้อง defibrillation (ไม่ใช่ sync) + CPR',
        next: '→ 2nd degree AV block type II เมื่อทีมช็อก + ให้ amiodarone 300 mg (คลำชีพจรได้แล้ว)',
      },
      {
        rhythm: '2nd degree AV block type II — HR 40/min',
        vitals: 'BP 80/50 mmHg · คลำชีพจรได้เบา · ผู้ป่วยไม่รู้สึกตัว',
        cue: 'ทีมต้องทำ transcutaneous pacing · ให้ capture ได้ที่ threshold 80 mA แต่ BP ยังต่ำ 80/50 → ดูว่าทีมเพิ่ม rate / ให้สารน้ำ / พิจารณา inotrope',
        next: '→ Loss of capture แล้วเข้าสู่ Asystole หลัง pacing ได้ประมาณ 1-2 นาที (ค่อยๆ ให้ spike ไม่ตาม QRS ก่อน แล้วเป็นเส้นแบน)',
      },
      {
        rhythm: 'Asystole — ตั้งค้างไว้จนจบเคส (ห้ามให้ ROSC)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ ต่ำลงเรื่อยๆ 8 → 6 mmHg',
        cue: 'ทีมช่วยต่ออย่างไรก็ไม่ตอบสนอง · ให้ข้อมูลเมื่อทีมถาม: ลงมือช่วยมาแล้ว ~25-30 นาที, EtCO₂ ต่ำค้าง, ไม่มีสาเหตุที่แก้ไขได้เหลืออยู่',
        next: 'จบเคสเมื่อทีมพิจารณายุติ CPR ตามเกณฑ์ + สื่อสารกับทีมและญาติ (ให้ผู้แสดงเป็นญาติเข้ามาถาม)',
      },
    ],
  },
  'case-11': {
    manikin: 'หุ่นชายวัยกลางคน หมดสติในโรงอาหาร (จัดฉากมีถาดอาหารข้างตัว) · ใส่ชิ้นอาหารจำลองไว้ในคอหอย · ไม่หายใจ ไม่มีชีพจร',
    props: ['Magill forceps + laryngoscope', 'เครื่องดูดเสมหะ', 'epinephrine หลายหลอด (ต้องให้ถึง dose ที่ 2)'],
    steps: [
      {
        rhythm: 'PEA — sinus rhythm ~70/min (มีจังหวะบนจอ ไม่มีชีพจร)',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'บีบ bag แล้วลมเข้ายากมาก หน้าอกไม่ขยับ · เมื่อทีมเปิดปากดู ให้เห็นชิ้นอาหาร (ทีมต้องคีบออก) · ให้ EtCO₂ ขึ้นเป็น 15 หลังเอาสิ่งแปลกปลอมออกแล้ว',
        next: '→ Unstable VT (มีชีพจร) เมื่อทีมนำสิ่งแปลกปลอมออก + ให้ epinephrine dose ที่ 2 แล้ว',
      },
      {
        rhythm: 'Unstable VT (มีชีพจร) — wide QRS ~170/min',
        vitals: 'BP 80/40 mmHg · คลำชีพจรได้เบา · ผู้ป่วยซึม',
        cue: 'ย้ำเมื่อทีมประเมิน: "คลำชีพจรได้แล้ว แต่ความดันต่ำ ผู้ป่วยซึม" → ต้อง synchronized cardioversion ไม่ใช่ defibrillation',
        next: '→ ROSC เมื่อทีมทำ synchronized cardioversion 100 J',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 110/70 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ให้ทีมประเมินทางเดินหายใจซ้ำและวางแผนดูแลต่อ',
        next: 'จบเคส',
      },
    ],
  },
  'case-12': {
    manikin: 'หุ่นชายวัยกลางคนในฟิตเนส · "แปะ AED pads ไว้แล้ว" ก่อนเริ่มเคส และให้ผู้แสดงเป็นเทรนเนอร์กำลังกดหน้าอกอยู่ตอนทีมมาถึง (เทรนเนอร์รายงาน: CPR ไป 2 cycle, AED ช็อกไป 1 ครั้ง) · ทดสอบการรับช่วงต่อ',
    props: ['เครื่อง AED ฝึก (ที่แปะไว้แล้ว) + เครื่อง manual defib สำหรับเปลี่ยน', 'amiodarone 300 mg', 'เครื่อง 12-lead ECG + แผ่น ECG จำลอง STEMI', 'สารน้ำ + inotrope จำลอง'],
    steps: [
      {
        rhythm: 'VF (ต่อจาก AED ที่ช็อกไปแล้ว 1 ครั้ง)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'ให้เทรนเนอร์รายงานสั้นๆ แล้วดูว่าทีมรับช่วงต่อโดยไม่หยุดกดนาน · ทีมต้องอ่านจังหวะเองและช็อกซ้ำ',
        next: '→ PEA เมื่อทีมช็อก + ให้ amiodarone 300 mg IV',
      },
      {
        rhythm: 'PEA — NSR ~80/min บนจอ แต่คลำชีพจรไม่ได้',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'ย้ำ "จอสวยแต่ไม่มีชีพจร" — ห้ามช็อก ทีมต้องกดต่อ + epinephrine dose ถัดไป',
        next: '→ VF อีกครั้ง หลัง CPR 1 cycle + epinephrine (ประกาศ "จอเปลี่ยน!")',
      },
      {
        rhythm: 'VF (รอบที่ 2)',
        vitals: 'EtCO₂ 15 mmHg',
        cue: 'ทีมต้องกลับไป shockable pathway ทันที',
        next: '→ ROSC หลัง defibrillation',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~95/min พร้อม ST elevation',
        vitals: 'BP 85/50 mmHg (ต่ำ — ตั้งใจให้ทีมต้องให้สารน้ำ/inotrope) · SpO₂ 95% · EtCO₂ 35 mmHg',
        cue: 'ยื่นแผ่น 12-lead ECG (STEMI) เมื่อทีมสั่ง · ถ้าทีมให้สารน้ำ/inotrope ให้ BP ขึ้นเป็น 105/65',
        next: 'จบเคส — ทีมต้องเตรียม cath lab',
      },
    ],
  },
  'case-13': {
    manikin: 'หุ่นชายวัยกลางคน ใส่ ET tube มาแล้ว "ลึกเกินไป" — ตั้งไว้ที่ 25 ซม.ที่มุมปาก และปิดเสียงปอดข้างซ้าย (จำลอง right main bronchus intubation) · เตรียมค่า DTX 35 mg% ไว้ตอบเมื่อทีมเจาะ',
    props: ['เครื่องเจาะน้ำตาลปลายนิ้ว (DTX) + การ์ดผล 35 mg%', '50% glucose / 10% dextrose จำลอง', 'ETCO₂ detector + stethoscope', 'ป้ายการ์ด DOPE'],
    steps: [
      {
        rhythm: 'PEA — sinus rhythm ~60/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂ 80% แล้วตกลง · EtCO₂ 10 mmHg',
        cue: 'ฟังปอด: ข้างขวาได้ยินชัด ข้างซ้ายเงียบ · บอกความลึกท่อ 25 ซม.เมื่อทีมตรวจ · ตอบ DTX 35 mg% เมื่อทีมเจาะ · ถ้าทีมยังไม่เลื่อนท่อและไม่แก้น้ำตาล ให้คง PEA ไว้',
        next: '→ ROSC เมื่อทีมทำครบ: เลื่อน ET tube ขึ้น (เหลือ ~21-23 ซม.) + แก้ hypoglycemia + epinephrine dose ที่ 2',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~95/min',
        vitals: 'BP 100/60 mmHg · SpO₂ 97% (ทั้งสองข้างได้ยินเสียงปอดแล้ว) · EtCO₂ 35 mmHg · DTX 120 mg% หลังแก้',
        cue: 'ให้ทีมยืนยันตำแหน่งท่อซ้ำและวางแผนดูแลต่อ',
        next: 'จบเคส — สรุป DOPE ตอน debrief',
      },
    ],
  },
  'case-14': {
    manikin: 'หุ่นชายสูงอายุ นอนบนเตียงผู้ป่วยใน · ทำท้องให้โป่งตึง (หนุนหมอน/ผ้าใต้ผ้าคลุม) · ผิวซีดเย็น · ก่อนหมดสติให้ผู้คุมหุ่นบ่น "ปวดท้องมาก" แล้วซึมลงจนไม่มีชีพจร',
    props: ['ถุงเลือด/สารน้ำจำลอง + ชุดให้เลือดเร็ว (rapid infuser/pressure bag)', 'ใบ massive transfusion protocol', 'สาย IV ขนาดใหญ่ 2 เส้น / ชุด IO', 'เบอร์ติดต่อทีมศัลยกรรม'],
    steps: [
      {
        rhythm: 'PEA — NSR ~60/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'ตรวจร่างกาย: ท้องโป่งตึง กดเจ็บ ผิวซีดเย็น (เบาะแส hypovolemia จากเลือดออกในช่องท้อง) · ถ้าทีมให้แต่ epinephrine โดยไม่ให้เลือด/สารน้ำ ให้คง PEA ไว้',
        next: '→ ROSC เมื่อทีมให้เลือด/สารน้ำปริมาณมากตาม massive transfusion protocol + ใส่ ET tube + epinephrine ตาม algorithm',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~110/min',
        vitals: 'BP 85/50 mmHg (ยังต่ำ เพราะยังไม่หยุดเลือด) · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'BP ที่ยังต่ำเป็นตัวบีบให้ทีมประสานผ่าตัดด่วน — ถ้าทีมไม่ตาม surgery ให้ BP ตกลงอีกเป็น 75/40',
        next: 'จบเคสเมื่อทีมประสานทีมศัลยกรรมเพื่อผ่าตัดฉุกเฉินและวางแผนส่งต่อ',
      },
    ],
  },
  'case-15': {
    manikin: 'หุ่นหญิงตั้งครรภ์ GA 36 สัปดาห์ (หรือหุ่นผู้ใหญ่ + หมอนจำลองครรภ์) · แขวนขวด MgSO₄ ที่กำลังหยดอยู่ให้เห็นชัด — เป็นเบาะแสหลักของเคส · ริมฝีปาก/ปลายมือเขียว · หนุนสะโพกขวาให้ทีมทำ left uterine displacement ต่อ',
    props: ['ขวด MgSO₄ + เครื่องควบคุมการหยด (แขวนไว้)', '10% calcium gluconate 1 g', 'ชุดเครื่องมือ perimortem cesarean delivery (จำลอง)', 'เบอร์/ป้ายเรียกทีมสูติ-กุมารแพทย์'],
    steps: [
      {
        rhythm: 'Asystole (เส้นแบน — ยืนยัน ≥2 lead)',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'เบาะแส MgSO₄: ตอบเมื่อทีมถามว่าได้ MgSO₄ 1 g/h มา 6 ชั่วโมง, deep tendon reflex หายไป, หายใจช้าลงก่อนหมดสติ · ถ้าทีมไม่หยุด MgSO₄ ให้เตือนตัวเองไว้ตอนให้คะแนน',
        next: '→ PEA เมื่อทีมหยุด MgSO₄ + ให้ 10% calcium gluconate 1 g IV + epinephrine dose ที่ 2',
      },
      {
        rhythm: 'PEA — sinus bradycardia ~40/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'ทีมต้อง CPR ต่อ + epinephrine dose ถัดไป และคง left uterine displacement · ถ้าเลย 4-5 นาทีแล้วยังไม่ ROSC ให้ถามนำเรื่อง perimortem C/S',
        next: '→ ROSC หลัง CPR 1-2 cycle + epinephrine ถัดไป (โดยมี LUD ตลอด)',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~100/min',
        vitals: 'BP 130/85 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ความดันยังสูงจาก preeclampsia — ดูว่าทีมวางแผนคุมความดัน/ชัก และประเมินทารก',
        next: 'จบเคส',
      },
    ],
  },
};

// ── ธนาคารเคสฝึกเสริม 10 เคส (practiceCases.js) ──────────────────────────────
const PRACTICE_SETUPS = {
  'practice-01': {
    manikin: 'หุ่นหญิงวัยกลางคน นอนบนเตียง CT · แขวนขวดสารทึบรังสีที่กำลังฉีดอยู่ (เบาะแสหลัก) · แต้มผื่นลมพิษแดงทั่วตัว/หน้าบวม · ไม่หายใจ ไม่มีชีพจร',
    props: ['ขวด/หลอดสารทึบรังสีจำลอง (แขวนคาไว้)', 'epinephrine หลายหลอด', 'สารน้ำปริมาณมาก + pressure bag', 'ชุด difficult airway (bougie/ท่อขนาดเล็ก)', 'antihistamine + corticosteroid จำลอง'],
    steps: [
      {
        rhythm: 'PEA — sinus tachycardia ~130/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'ตอบเมื่อทีมประเมิน: ผื่นลมพิษทั้งตัว หน้า/ลิ้นบวม ฟังปอดมี wheeze · ใส่ท่อยาก (ให้ทีมต้องพยายาม 2 ครั้ง) · ถ้าทีมไม่สั่งหยุดสารทึบรังสี ให้คง PEA ไว้',
        next: '→ ROSC เมื่อทีมหยุดสารก่อแพ้ + epinephrine 1 mg IV ตาม algorithm + สารน้ำ bolus ปริมาณมาก + จัดการทางเดินหายใจได้',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~110/min',
        vitals: 'BP 90/55 mmHg · SpO₂ 94% (on ETT) · EtCO₂ 35 mmHg · ยังมี wheeze',
        cue: 'ดูว่าทีมให้ H1/H2 + corticosteroid และวางแผนเฝ้าระวัง biphasic reaction',
        next: 'จบเคส',
      },
    ],
  },
  'practice-02': {
    manikin: 'หุ่นชายหนุ่ม จัดฉากในห้องน้ำ · วางอุปกรณ์ฉีดยาเสพติดจำลองข้างตัว · เริ่มเคสแบบ "ยังมีชีพจร แต่หายใจ 4 ครั้ง/นาที" · รูม่านตาเล็กมาก (ใช้การ์ดรูปตา/บอกด้วยวาจา)',
    props: ['naloxone หลายหลอด (0.4 mg และ 2 mg)', 'bag-mask', 'อุปกรณ์ฉีดยาจำลอง (props ฉาก)'],
    steps: [
      {
        rhythm: 'Respiratory arrest — sinus rhythm ~70/min มีชีพจร',
        vitals: 'RR 4/min · SpO₂ 78% · BP 90/60 mmHg · รูม่านตา pinpoint',
        cue: 'ย้ำเมื่อทีมคลำ: "มีชีพจร แต่หายใจแค่ 4 ครั้ง/นาที" — ทีมต้องช่วยหายใจ ไม่ใช่กดหน้าอก · SpO₂ ขึ้นเป็น 95% เมื่อทีมช่วยหายใจถูกวิธี',
        next: '→ PEA ถ้าทีมช้า/ไม่ช่วยหายใจภายใน ~1 นาที (หรือหลังให้ naloxone แล้วยังไม่ตื่น) — ประกาศ "คลำชีพจรไม่ได้แล้ว"',
      },
      {
        rhythm: 'PEA — sinus bradycardia ~50/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10 mmHg',
        cue: 'ระหว่าง arrest ให้ยึด CPR + epinephrine เป็นหลัก — ถ้าทีมมัวแต่หา naloxone ให้จดไว้ตอน debrief',
        next: '→ ROSC หลัง CPR 1-2 cycle + epinephrine ตาม algorithm',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 105/65 mmHg · SpO₂ 96% · RR 12 (ช่วยหายใจอยู่) · EtCO₂ 35 mmHg',
        cue: 'ดูว่าทีมวางแผนเฝ้าระวัง re-narcotization และ admit',
        next: 'จบเคส',
      },
    ],
  },
  'practice-03': {
    manikin: 'หุ่นหญิงสูงอายุ · เตรียมผลเลือดไว้ตอบ: K 2.8, Mg 1.2 mEq/L, QTc ยาว · เริ่มเคสตอนยังรู้สึกตัวบ่นใจสั่น แล้วหมดสติทันที',
    props: ['MgSO₄ 1-2 g สำหรับ IV', 'การ์ดผลเลือด K/Mg ต่ำ + แผ่น ECG ที่ QT ยาว', 'รายการยาที่ผู้ป่วยได้ (ยาขับปัสสาวะ + ยาปฏิชีวนะกลุ่มที่ทำ QT ยาว)'],
    steps: [
      {
        rhythm: 'Polymorphic VT / Torsades de pointes (แกน QRS บิดสลับขึ้นลง) — ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10 mmHg',
        cue: 'ถ้าทีมจะกด sync ให้เครื่องจับ R wave ไม่ได้ (สอนว่า polymorphic VT ต้อง defibrillation ไม่ใช่ synchronized cardioversion) · ยื่นการ์ดผลเลือด K/Mg ต่ำเมื่อทีมสั่งตรวจ',
        next: '→ ROSC เมื่อทีม defibrillation + ให้ MgSO₄ 1-2 g IV + สั่งหยุดยาที่ทำ QT ยาว',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~85/min (QTc ยังยาว)',
        vitals: 'BP 105/65 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ถ้าทีมไม่แก้ K/Mg ให้กลับเป็น torsades ซ้ำ 1 รอบ (ทางเลือกสำหรับกลุ่มที่เก่ง) แล้วดูว่าทีมพิจารณา overdrive pacing',
        next: 'จบเคส',
      },
    ],
  },
  'practice-04': {
    manikin: 'หุ่นชายวัยรุ่น ใส่ ET tube แล้ว · ให้ผู้แสดงบีบ bag "ถี่มาก" ให้ทีมเห็นตอนเข้าฉาก (ต้นเหตุของเคส) · ตั้งให้ปอดแข็ง บีบ bag ฝืด · หน้าอกโป่งค้าง',
    props: ['bag-mask + วงจรที่ปลดออกได้ง่าย (ใช้ตอน decompress)', 'ชุด needle thoracocentesis (เผื่อ tension pneumothorax)', 'ยาพ่นขยายหลอดลมจำลอง'],
    steps: [
      {
        rhythm: 'Sinus bradycardia ~45/min (ยังมีชีพจรเบา)',
        vitals: 'BP 70/40 mmHg · SpO₂ 85% · บีบ bag ฝืดมาก หน้าอกโป่งค้าง',
        cue: 'บอกเมื่อทีมประเมิน: "ความดันตกลงเรื่อยๆ ทุกครั้งที่บีบ bag" (เบาะแส auto-PEEP)',
        next: '→ PEA ภายใน ~1 นาทีถ้าทีมยังบีบ bag ถี่เหมือนเดิม',
      },
      {
        rhythm: 'PEA — sinus bradycardia ~40/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'คง PEA ไว้จนกว่าทีมจะปลดวงจรช่วยหายใจ + กดไล่ลมค้าง · เมื่อปลดวงจร ให้ทำเสียงลมพุ่งออกและบอกว่า "หน้าอกยุบลง"',
        next: '→ ROSC เมื่อทีมปลดวงจร/ไล่ลมค้าง + ตั้งการช่วยหายใจใหม่ rate 6-8/นาที + ให้สารน้ำ',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~110/min',
        vitals: 'BP 95/60 mmHg · SpO₂ 93% · EtCO₂ 45 mmHg (คั่ง CO₂)',
        cue: 'ดูว่าทีมตั้ง ventilator strategy (rate ต่ำ, expiratory time ยาว) และให้ยาขยายหลอดลม',
        next: 'จบเคส',
      },
    ],
  },
  'practice-05': {
    manikin: 'หุ่นหญิงวัยผู้ใหญ่ · วางแผงยา amitriptyline เปล่าข้างตัว (เบาะแส) · เริ่มเคสตอนซึม เพิ่งชักจบ · เตรียมแผ่น ECG ที่ QRS กว้างไว้ยื่นให้',
    props: ['sodium bicarbonate หลายขวด (bolus + infusion)', 'แผงยา amitriptyline เปล่า + แผ่น ECG QRS กว้าง', 'ยากันชักจำลอง', 'ป้ายเบอร์ศูนย์พิษวิทยา'],
    steps: [
      {
        rhythm: 'Sinus tachycardia ~120/min พร้อม QRS กว้าง > 120 ms (ยังมีชีพจร)',
        vitals: 'BP 85/50 mmHg · SpO₂ 94% · ผู้ป่วยซึม',
        cue: 'ยื่นแผ่น ECG QRS กว้างเมื่อทีมสั่ง · ตอบประวัติกินยาเกินขนาดเมื่อทีมถามญาติ',
        next: '→ Pulseless VT ถ้าทีมยังไม่ให้ sodium bicarbonate ภายใน ~2 นาที',
      },
      {
        rhythm: 'Pulseless VT — wide QRS เร็ว ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10 mmHg',
        cue: 'ทีมต้อง defibrillation ทันที · ถ้าทีมสั่ง amiodarone/ยา class IA-IC ให้ QRS กว้างขึ้นและ BP แย่ลง แล้วจดไว้ debrief',
        next: '→ ROSC เมื่อทีม defibrillation + ให้ sodium bicarbonate IV bolus',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~100/min (QRS แคบลงเหลือ ~100 ms)',
        vitals: 'BP 100/60 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg',
        cue: 'ให้ QRS แคบลงชัดเจนหลัง bicarbonate — เป็นจุดสอนหลักของเคส',
        next: 'จบเคส — ทีมต้องให้ bicarbonate ต่อแบบ infusion + ปรึกษาศูนย์พิษวิทยา/ICU',
      },
    ],
  },
  'practice-06': {
    manikin: 'หุ่นชายวัยกลางคน จัดฉากข้างตู้ควบคุมไฟ (ใช้กล่อง/ป้าย "ไฟฟ้าแรงสูง") · แต้มแผลไหม้ที่มือ (ทางเข้า) และที่เท้า (ทางออก) · ใส่ hard collar ไว้เพราะอาจตกจากที่สูง',
    props: ['ป้าย/สวิตช์ตัดกระแสไฟจำลอง (ทดสอบ scene safety)', 'hard collar + long spinal board', 'amiodarone 300 mg', 'สารน้ำสำหรับ rhabdomyolysis'],
    steps: [
      {
        rhythm: 'VF',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 10 mmHg',
        cue: '⚠️ ข้อสำคัญ: ถ้าทีมเข้าไปแตะผู้ป่วยโดยไม่สั่งตัดกระแสไฟก่อน ให้หยุดเคสทันทีและบันทึกเป็นข้อผิดด้านความปลอดภัย · ให้ VF ค้างไว้จนช็อกครั้งที่ 2',
        next: '→ ROSC หลัง defibrillation ครั้งที่ 2 + amiodarone 300 mg IV',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~95/min มี PVCs',
        vitals: 'BP 105/65 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg · ปัสสาวะสีเข้ม',
        cue: 'บอกว่าปัสสาวะสีน้ำตาลเข้ม (เบาะแส rhabdomyolysis) เมื่อทีมประเมินหลัง ROSC',
        next: 'จบเคส — ทีมต้อง monitor arrhythmia, ให้สารน้ำ, ตรวจแผลไหม้ทางเข้า-ออก และคง C-spine precaution',
      },
    ],
  },
  'practice-07': {
    manikin: 'หุ่นหญิงวัยเจริญพันธุ์ หลังคลอด · จำลองเลือดออกทางช่องคลอดปริมาณมาก (ผ้าซับ/น้ำสีแดงจำนวนมาก) · คลำมดลูกนุ่มไม่แข็งตัว (บอกด้วยวาจา) · ผิวซีดเย็น',
    props: ['ถุงเลือด/สารน้ำจำลอง + pressure bag', 'oxytocin/uterotonic จำลอง', 'ใบ massive transfusion protocol', 'ผ้าซับเลือดจำนวนมาก (ทำให้เห็นปริมาณจริง)'],
    steps: [
      {
        rhythm: 'PEA — sinus tachycardia ~140/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 8 mmHg',
        cue: 'ตอบเมื่อทีมตรวจ: มดลูกนุ่มคลำได้เหนือสะดือ เลือดออกไม่หยุด (uterine atony) · ถ้าทีมให้แต่ยาโดยไม่ให้เลือด/สารน้ำ ให้คง PEA ไว้',
        next: '→ ROSC เมื่อทีมให้เลือด/สารน้ำเร็วตาม MTP + uterine massage + oxytocin',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~115/min',
        vitals: 'BP 90/55 mmHg · SpO₂ 96% · EtCO₂ 35 mmHg · เลือดออกลดลงหลัง uterotonic',
        cue: 'ดูว่าทีมประสานสูติศาสตร์เพื่อหยุดเลือดต่อ (หัตถการ/ผ่าตัด)',
        next: 'จบเคส',
      },
    ],
  },
  'practice-08': {
    manikin: 'หุ่นหญิงสูงอายุ ติดเตียง (จัดผ้าอ้อม/สายสวนปัสสาวะที่มีปัสสาวะขุ่น) · ตัวร้อน (บอกอุณหภูมิ 39.5°C) · เริ่มเคสตอนซึมมาก ความดันต่ำ แล้วหมดสติ',
    props: ['สารน้ำปริมาณมาก + pressure bag', 'ยาปฏิชีวนะ broad-spectrum จำลอง + ขวด hemoculture', 'vasopressor (norepinephrine) จำลอง', 'ถุงปัสสาวะขุ่น (props)'],
    steps: [
      {
        rhythm: 'PEA — sinus tachycardia ~130/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 10 mmHg · Temp 39.5°C',
        cue: 'เบาะแส: ปัสสาวะขุ่นมีกลิ่น ไข้สูง ผิวอุ่นแดง (distributive shock) · ทีมต้อง CPR + epinephrine + สารน้ำปริมาณมาก',
        next: '→ Asystole ถ้าทีมยังไม่ให้สารน้ำปริมาณมากภายใน ~2 นาที (หรือหลัง CPR 1 cycle)',
      },
      {
        rhythm: 'Asystole (เส้นแบน)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 8 mmHg',
        cue: 'ทีมต้อง CPR ต่อ + epinephrine ทุก 3-5 นาที และสั่ง antibiotic โดยเร็ว',
        next: '→ ROSC หลัง CPR 1-2 cycle + สารน้ำปริมาณมาก + epinephrine ตาม algorithm',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~120/min',
        vitals: 'BP 80/45 mmHg (ยังต่ำ) · SpO₂ 94% · EtCO₂ 35 mmHg',
        cue: 'BP ที่ยังต่ำหลัง ROSC เป็นตัวบีบให้ทีมเริ่ม vasopressor และหา source of infection',
        next: 'จบเคส',
      },
    ],
  },
  'practice-09': {
    manikin: 'หุ่นชายสูงอายุ รู้สึกตัวแต่กระสับกระส่าย (ผู้คุมหุ่นพูดแทน: "ใจสั่น แน่นหน้าอก") · เหงื่อแตก ผิวเย็นชื้น · ชีพจรเร็วและ "ไม่สม่ำเสมอ" — ให้ผู้คุมหุ่นเคาะจังหวะชีพจรแบบไม่เป็นระเบียบตอนทีมคลำ',
    props: ['เครื่อง defib ที่กด sync ได้จริง', 'ยา sedation จำลอง', 'amiodarone 300 mg', 'แผ่น ECG จำลอง AF'],
    steps: [
      {
        rhythm: 'Atrial fibrillation with RVR — irregularly irregular ~170/min (ไม่มี P wave)',
        vitals: 'BP 80/50 mmHg · SpO₂ 95% · คลำชีพจรได้ไม่สม่ำเสมอ',
        cue: 'ยืนยันเมื่อทีมถาม: "จังหวะไม่สม่ำเสมออย่างสิ้นเชิง ไม่เห็น P wave" → unstable tachycardia ต้อง synchronized cardioversion 120-200 J',
        next: '→ VF เมื่อทีมทำ cardioversion (จำลองภาวะแทรกซ้อน R-on-T) — ประกาศ "จอเปลี่ยนเป็น VF!"',
      },
      {
        rhythm: 'VF',
        vitals: 'BP: วัดไม่ได้ · ไม่มีชีพจร · EtCO₂ 10 mmHg',
        cue: 'จุดสอนหลัก: ทีมต้อง "ปลด sync" แล้ว defibrillation + เริ่ม CPR ทันที — ถ้ายังกด sync ค้างไว้ เครื่องจะไม่ปล่อยไฟ ปล่อยให้ทีมค้นพบเอง',
        next: '→ ROSC หลัง defibrillation + amiodarone 300 mg IV',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 110/70 mmHg · SpO₂ 97% · EtCO₂ 35 mmHg',
        cue: 'ให้ทีมสั่ง 12-lead ECG และพิจารณา anticoagulation/ปรึกษา cardiology',
        next: 'จบเคส',
      },
    ],
  },
  'practice-10': {
    manikin: 'หุ่นชายวัยกลางคน จัดฉากกลางแจ้ง ใส่ชุดวิ่ง · ตัวร้อนจัด (แจ้งอุณหภูมิแกน 41.5°C เมื่อทีมวัด) · ผิวแห้งแดง · เพิ่งชักจบก่อนหมดสติ',
    props: ['อุปกรณ์ cooling: ขวดน้ำ/ฟ็อกกี้พ่นน้ำ + พัดลม + ice pack', 'สารน้ำเย็น', 'เทอร์โมมิเตอร์แกนกลาง', 'ชุดตรวจ electrolyte/DTX'],
    steps: [
      {
        rhythm: 'PEA — sinus tachycardia ~140/min บนจอ ไม่มีชีพจร',
        vitals: 'BP: วัดไม่ได้ · SpO₂: no signal · EtCO₂ 10 mmHg · Temp 41.5°C',
        cue: 'ย้ำอุณหภูมิ 41.5°C ทุกครั้งที่ทีมถาม — เป็นเบาะแสหลัก · ถ้าทีมไม่เริ่ม cooling ให้คง PEA ไว้ (สอนว่า cooling ต้องทำ "พร้อมกับ" การช่วยชีวิต)',
        next: '→ ROSC เมื่อทีมเริ่ม rapid cooling (ถอดเสื้อผ้า พ่นน้ำ+พัดลม/ice pack) + ให้สารน้ำเย็น + CPR/epinephrine ตาม algorithm',
      },
      {
        rhythm: 'ROSC — sinus tachycardia ~115/min',
        vitals: 'BP 95/55 mmHg · SpO₂ 95% · EtCO₂ 35 mmHg · Temp 39.5°C (ลดลงหลัง cooling)',
        cue: 'บอกว่าปัสสาวะสีเข้ม (rhabdomyolysis) เมื่อทีมประเมินต่อ',
        next: 'จบเคส — ทีมต้องคุมอุณหภูมิเป้าหมายต่อและวางแผน ICU',
      },
    ],
  },
};

// ── ใบประเมินสถานี Megacode (stationChecklists.js — จุด A/B) ─────────────────
// ใบพวกนี้ไม่มีโจทย์ผู้ป่วยตายตัว ("ผู้สอนกำหนดการเปลี่ยนจังหวะระหว่างการทดสอบ")
// จึงให้ "สคริปต์จังหวะมาตรฐาน" ไว้ใช้ได้ทันทีเมื่ออาจารย์ไม่ได้เตรียมเคสมาเอง
const STATION_SETUPS = {
  megacodeCardiacArrest: {
    manikin: 'หุ่น ACLS ผู้ใหญ่ ไม่หายใจ ไม่มีชีพจร วางบนพื้นแข็ง · ใบนี้ไม่มีโจทย์ตายตัว — ใช้สคริปต์ด้านล่างได้เลย หรืออาจารย์กำหนดเคสเองแล้วยึดหลัก "เปลี่ยนจังหวะเมื่อทีมทำถูกเท่านั้น"',
    props: ['pads + เครื่อง manual defib', 'ชุด ET tube + capnography', 'epinephrine + amiodarone', 'นาฬิกาจับเวลาสำหรับ cycle 2 นาที'],
    steps: [
      {
        rhythm: 'VF (จังหวะเริ่มต้น — shockable)',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 10 mmHg',
        cue: 'ทดสอบ: CPR คุณภาพสูงทันที, แปะ pads เร็ว, ช็อกอย่างปลอดภัย, กลับมากดต่อทันทีหลังช็อก · คง VF ไว้ 2 รอบการช็อก',
        next: '→ Asystole/PEA เมื่อทีมช็อกครบ 2 ครั้ง + epinephrine + amiodarone 300 mg (ทดสอบการสลับเส้นทาง non-shockable)',
      },
      {
        rhythm: 'Asystole หรือ PEA (non-shockable) — เลือกอย่างใดอย่างหนึ่ง',
        vitals: 'BP: วัดไม่ได้ · EtCO₂ 12 mmHg',
        cue: 'ทดสอบ: ไม่ช็อก non-shockable, ให้ epinephrine ทุก 3-5 นาที, ไล่ H\'s & T\'s, เปลี่ยนคนกดทุก 2 นาที',
        next: '→ ROSC เมื่อทีมทำ CPR ต่อเนื่อง + epinephrine ตามรอบ + ระบุ/แก้สาเหตุที่สมมติไว้ได้',
      },
      {
        rhythm: 'ROSC — sinus rhythm ~90/min',
        vitals: 'BP 95/60 mmHg · SpO₂ 95% · EtCO₂ พุ่งขึ้น 35 mmHg',
        cue: 'ปล่อยให้ทีมจับ ROSC เองจาก EtCO₂ ที่กระโดดขึ้น + คลำชีพจร',
        next: 'จบเคส — ประเมิน post-cardiac arrest care (ABC, 12-lead, หาสาเหตุ, ส่งต่อ)',
      },
    ],
  },
  megacodeBradycardia: {
    manikin: 'หุ่น ACLS ผู้ใหญ่ "ยังรู้สึกตัวแต่ซึม" — ผู้คุมหุ่นพูดแทนผู้ป่วย · มีชีพจรช้าคลำได้ · ห้ามให้ทีมกดหน้าอก (ไม่ใช่ arrest) · เตรียมแผ่น pacing ไว้ที่ฐาน',
    props: ['แผ่น pacing + เครื่องที่ pacing ได้จริง', 'atropine หลายหลอด (ให้ครบ max 3 mg)', 'ยา sedation จำลอง', 'สารน้ำ + dopamine/epinephrine infusion จำลอง'],
    steps: [
      {
        rhythm: 'Symptomatic bradycardia — เลือก 1: sinus bradycardia 35/min หรือ 3rd degree AV block 30/min',
        vitals: 'BP 75/45 mmHg · SpO₂ 93% · ผู้ป่วยซึม เหงื่อแตก แน่นหน้าอก',
        cue: 'ตอบสัญญาณ unstable ให้ครบเมื่อทีมประเมิน (ซึม ความดันต่ำ เจ็บหน้าอก) · atropine 1 mg dose แรก: HR ขึ้นชั่วครู่เป็น 45 แล้วตกกลับ 30',
        next: '→ Paced rhythm (capture) เมื่อทีมตั้ง transcutaneous pacing และไล่ mA ถึง threshold ~70-80 mA — หรือ HR ขึ้นถ้าทีมเริ่ม dopamine/epinephrine infusion',
      },
      {
        rhythm: 'Paced rhythm — capture, HR 70/min',
        vitals: 'BP 95/60 mmHg · ผู้ป่วยรู้สึกตัวขึ้น แต่บ่นเจ็บจากไฟ pacing',
        cue: 'ถามนำถ้าทีมไม่ยืนยัน mechanical capture ด้วยการคลำชีพจร · ดูว่าทีมให้ sedation',
        next: 'จบเคส — ประเมินซ้ำ, หาสาเหตุที่แก้ไขได้, ปรึกษา/ส่งต่อเพื่อ transvenous pacing',
      },
    ],
  },
  megacodeTachycardia: {
    manikin: 'หุ่น ACLS ผู้ใหญ่ รู้สึกตัวแต่กระสับกระส่าย — ผู้คุมหุ่นพูดแทน · ชีพจรเร็วคลำได้เบา · ห้ามกดหน้าอก · อาจารย์เลือกชนิดจังหวะก่อนเริ่ม (SVT / AF with RVR / VT มีชีพจร)',
    props: ['เครื่อง defib ที่กด sync ได้จริง', 'adenosine 6/12 mg จำลอง', 'ยา sedation จำลอง', 'amiodarone'],
    steps: [
      {
        rhythm: 'เลือก 1 อย่าง: SVT ~200/min · AF with RVR ~170/min · VT มีชีพจร ~180/min',
        vitals: 'ตั้งตามความต้องการทดสอบ — stable: BP 120/70 · unstable: BP 75/45 พร้อมอาการซึม/เจ็บหน้าอก',
        cue: 'ย้ำเสมอว่า "คลำชีพจรได้" เพื่อบังคับเส้นทาง tachycardia · ถ้าทดสอบ stable narrow QRS: vagal maneuver ไม่ได้ผล → adenosine 6 mg ไม่ได้ผล → 12 mg ได้ผล',
        next: '→ NSR เมื่อทีมทำถูกตามเส้นทาง: unstable = synchronized cardioversion (ตามชนิดจังหวะ) · stable narrow = vagal/adenosine · stable wide = antiarrhythmic infusion',
      },
      {
        rhythm: 'Normal sinus rhythm ~85/min',
        vitals: 'BP 115/70 mmHg · SpO₂ 98% · ผู้ป่วยรู้สึกตัวดีขึ้น',
        cue: 'ถ้าอยากเพิ่มความยาก: ให้กลับเป็นจังหวะเร็วซ้ำ 1 รอบ เพื่อทดสอบการประเมินซ้ำ',
        next: 'จบเคส — ประเมินซ้ำ, 12-lead ECG, หาสาเหตุและวางแผนดูแลต่อ',
      },
    ],
  },
  megacodePostArrest: {
    manikin: 'หุ่น ACLS ผู้ใหญ่ "เพิ่ง ROSC" — มีชีพจรแล้วแต่ยังไม่รู้สึกตัว ใส่ ET tube คาไว้และมีทีมบีบ bag อยู่ตอนเริ่มฉาก · เริ่มเคสด้วยผู้คุมหุ่นบอกว่า "คลำชีพจรได้แล้ว เวลา ROSC เมื่อสักครู่"',
    props: ['เครื่อง 12-lead ECG + แผ่น ECG จำลอง (STEMI หรือปกติ ตามที่อยากทดสอบ)', 'capnography', 'สารน้ำ + norepinephrine/dopamine จำลอง', 'ชุด targeted temperature management (ผ้าห่มเย็น/ice pack จำลอง)', 'ใบส่ง ICU / cath lab'],
    steps: [
      {
        rhythm: 'ROSC — sinus tachycardia ~110/min (ยังไม่รู้สึกตัว)',
        vitals: 'BP 80/50 mmHg (ต่ำ) · SpO₂ 92% on bagging · EtCO₂ 45 mmHg · DTX 180 mg%',
        cue: 'ตั้งใจให้ค่าผิดปกติหลายอย่าง เพื่อดูว่าทีมแก้ครบ: ความดันต่ำ (ต้องให้สารน้ำ/vasopressor), SpO₂ ต่ำ (ปรับ O₂ ให้ ≥94% แต่ห้าม hyperoxia), EtCO₂ สูง (ปรับอัตราช่วยหายใจให้ PETCO₂ 35-40) · ถ้าทีมบีบ bag เร็วเกิน ให้ BP ตกลงอีก',
        next: '→ คงที่ เมื่อทีมให้สารน้ำ/vasopressor + ปรับ ventilation + สั่ง 12-lead ECG',
      },
      {
        rhythm: 'คงที่ — sinus rhythm ~95/min',
        vitals: 'BP 110/70 mmHg (MAP ≥65) · SpO₂ 96% · EtCO₂ 38 mmHg · ผู้ป่วยยังไม่ทำตามคำสั่ง',
        cue: 'ผู้ป่วยไม่ทำตามคำสั่ง = ข้อบ่งชี้ TTM — ดูว่าทีมสั่งคุมอุณหภูมิเป้าหมายและวางแผน ICU/cath lab · เพิ่มความยากได้โดยให้ re-arrest (VF) 1 รอบ เพื่อทดสอบการเฝ้าระวัง',
        next: 'จบเคส — ทีมสรุปแผนดูแลต่อและส่งต่อ ICU',
      },
    ],
  },
};

export const MANIKIN_SETUPS = { ...EXAM_SETUPS, ...PRACTICE_SETUPS, ...STATION_SETUPS };

// หา setup ของเคส/ใบประเมินที่กำลังเปิดอยู่ — รองรับทั้ง
//  1) เคสจากเกม Code Blue Sim ที่แนบ setup มากับตัวเคสเอง (derive อัตโนมัติ)
//  2) เคส/ใบประเมินที่ผูกด้วย id ในไฟล์นี้
export function resolveManikinSetup(target) {
  if (!target) return null;
  if (target.setup) return target.setup;
  return MANIKIN_SETUPS[target.id] ?? null;
}
