// ธนาคารข้อสอบ Megacode 15 เคส — JIA TRAINER CENTER, ACLS Megacode Examination
// คัดลอกจาก "ACLS_Megacode_Checklist.docx" — ไม่มีข้อวิกฤต ★ / ไม่มีเกณฑ์ตัวเลข
// ตายตัว (ต่างจาก stationChecklists.js): ผ่าน/ไม่ผ่านเป็นดุลยพินิจของอาจารย์
// ผู้คุมสอบล้วนๆ คะแนน X/Y ที่ระบบคำนวณให้เป็นข้อมูลอ้างอิงเท่านั้น
// ห้ามแก้เนื้อหาโดยไม่เทียบกับต้นฉบับ/แนวทาง ACLS เพราะใช้ตัดสินผลสอบจริง
//
// การแก้จากต้นฉบับ (ตรวจทานทางคลินิกตาม ACLS 2020, ก.ค. 2026 — ดู PR):
// - เคส 6, 11: "Pulseless VT (BP xx/xx)" ขัดแย้งในตัวเอง (มี BP = มีชีพจร) และ
//   การรักษาที่ถูกในข้อถัดไปคือ synchronized cardioversion ซึ่งใช้กับ VT ที่มี
//   ชีพจร → แก้ป้ายกำกับเป็น unstable VT (มีชีพจร) ตามเจตนาของหัตถการ
// - เคส 4: amiodarone ระบุ 150 mg เดี่ยวๆ ทั้งที่ยังไม่เคยได้ 300 mg → ระบุ
//   ลำดับขนาดให้ครบ (300 → 150)
// - เคส 3, 15 (arrest ในหญิงตั้งครรภ์ GA ≥20 สัปดาห์): เพิ่มข้อ perimortem
//   cesarean delivery ภายใน 4-5 นาทีตามแนวทาง ACLS (ต้นฉบับไม่มี)
//
// field `level` เป็น metadata ที่เพิ่มทีหลัง (ไม่ได้มาจาก docx และไม่แตะเนื้อหา
// เคส): ระดับความยากไว้ให้อาจารย์เลือกสุ่มเฉพาะระดับใน ChecklistGrader —
// จัดตามความซับซ้อน: จำนวนจังหวะหัวใจที่เปลี่ยน + หัตถการพิเศษที่ต้องทำ
//   easy   = จังหวะน้อย ไม่มีหัตถการพิเศษ (เคส 5, 11, 12)
//   medium = มีเปลี่ยนจังหวะหลายรอบ/ต้องแก้สาเหตุตรงไปตรงมา (เคส 4, 6, 8, 9, 13, 14)
//   hard   = หลายหัตถการซ้อน/ประชากรพิเศษ/การตัดสินใจยาก (เคส 1, 2, 3, 7, 10, 15)

export const MEGACODE_LEVEL_META = {
  easy: { label: 'ง่าย', order: 0 },
  medium: { label: 'ปานกลาง', order: 1 },
  hard: { label: 'ยาก', order: 2 },
};

function items(list) {
  return list.map((text) => ({ text }));
}

// ข้อประเมินแกนกลาง — ประเมิน "ทุกเคส" เพิ่มจากเช็คลิสต์เฉพาะเคส เพื่อให้นักเรียน
// ทุกคนถูกวัดด้วยมาตรฐานเดียวกันไม่ว่าจะสุ่มได้เคสไหน (เคสเฉพาะมี 4-13 ข้อ
// ต่างกันมาก) — เนื้อหาเป็นทักษะสากลตาม ACLS 2020 เพิ่มโดยระบบ ไม่ได้มาจาก
// docx ต้นฉบับ; ผ่าน/ไม่ผ่านยังเป็นดุลยพินิจอาจารย์เหมือนเดิม
export const MEGACODE_CORE_ITEMS = [
  { no: 'C1', text: 'ประเมินความปลอดภัย/BSI เรียกทีมช่วยเหลือ และเริ่ม CPR ทันทีเมื่อยืนยันว่าไม่มีชีพจร' },
  { no: 'C2', text: 'กดหน้าอกคุณภาพสูง: 100-120 ครั้ง/นาที ลึก 5-6 ซม. ปล่อยหน้าอกคืนสุด หยุดกดน้อยที่สุด เปลี่ยนคนกดทุก 2 นาที' },
  { no: 'C3', text: 'ประเมินจังหวะทุก 2 นาที และแยก shockable / non-shockable ได้ถูกต้องตลอดเคส' },
  { no: 'C4', text: 'ช็อกไฟฟ้าอย่างปลอดภัย (เคลียร์ทีมก่อนช็อก) และกลับมากดหน้าอกต่อทันทีหลังช็อก' },
  { no: 'C5', text: 'ให้ epinephrine 1 mg IV ทุก 3-5 นาที ถูกจังหวะตาม algorithm' },
  { no: 'C6', text: 'ช่วยหายใจเหมาะสม (30:2 หรือ 1 ครั้ง/6 วินาทีเมื่อมี advanced airway) และใช้ capnography ยืนยัน/ติดตาม' },
  { no: 'C7', text: "ค้นหาสาเหตุที่แก้ไขได้ (H's & T's) ที่เข้ากับเคส และสั่งการแก้ไข" },
  { no: 'C8', text: 'ทำหน้าที่ team leader: สั่งการชัดเจน มอบหมายบทบาท ใช้ closed-loop communication' },
  { no: 'C9', text: 'เริ่มการดูแล post-cardiac arrest หลัง ROSC (ABC, 12-lead ECG, หาสาเหตุ, วางแผนดูแลต่อ)' },
];

export const MEGACODE_CASES = [
  {
    id: 'case-01',
    no: 1,
    level: 'hard',
    title: 'Trauma (Lt pneumothorax, fracture pelvis, fracture femur)',
    algorithm: 'PEA → VF → ROSC',
    scenario: 'ชาย 30 ปี อุบัติเหตุจราจร นอนหมดสติ ทำ CPR มานาน 10 นาที ก่อนถึง รพ. มีรอยช้ำที่หน้าอก ขาสองข้างผิดรูป',
    items: items([
      'ประเมิน scene safety / BSI และเริ่ม CPR ทันที',
      'จดจำจังหวะแรกเป็น PEA (sinus tachycardia ~140/min) ได้ถูกต้อง',
      "นึกถึง H's & T's จากกลไกการบาดเจ็บ (tension pneumothorax, hypovolemia)",
      'ทำ needle thoracocentesis ด้าน Lt เมื่อสงสัย tension pneumothorax',
      'ใส่ ET tube และยืนยันตำแหน่งท่อ',
      'ทำ ICD placement',
      'ให้ IV fluid/blood transfusion ตาม massive transfusion protocol',
      'ทำ pelvic binding และ leg splint สำหรับกระดูกหัก',
      'ทำ C-spine precaution ตลอดการช่วยชีวิต',
      'จดจำจังหวะเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'ให้การดูแล post-ROSC และเตรียมส่งต่อ/ผ่าตัดที่เหมาะสม',
    ]),
  },
  {
    id: 'case-02',
    no: 2,
    level: 'hard',
    title: 'Lt pneumothorax และ esophageal intubation',
    algorithm: 'Asystole → VF → ROSC',
    scenario: 'ชาย 50 ปี COPD เหนื่อย มา รพ. ได้รับการรักษาโดยใส่ ET tube แล้ว (ใส่ผิดตำแหน่งในหลอดอาหาร) แรกรับหมดสติ',
    items: items([
      'ตรวจสอบและยืนยันตำแหน่งท่อช่วยหายใจ (สงสัย esophageal intubation)',
      'จดจำจังหวะแรกเป็น Asystole ได้ถูกต้อง และเริ่ม CPR ทันที',
      'แก้ไข esophageal intubation โดยใส่ ET tube ใหม่ให้ถูกตำแหน่ง',
      'ทำ needle thoracocentesis เมื่อสงสัย Lt pneumothorax',
      'ทำ ICD placement',
      'นึกถึงและใช้แนวคิด DOPE ในการหาสาเหตุ (Displacement, Obstruction, Pneumothorax, Equipment failure)',
      'จดจำจังหวะเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
  {
    id: 'case-03',
    no: 3,
    level: 'hard',
    title: 'Pregnancy with FB aspiration',
    algorithm: 'PEA → VF → ROSC',
    scenario: 'หญิงตั้งครรภ์ GA 32 week กินอาหารแล้วเอามือกุมคอ (choking sign) หมดสติ',
    items: items([
      'จดจำอาการ choking sign และสงสัย foreign body airway obstruction',
      'จดจำจังหวะแรกเป็น PEA ได้ถูกต้อง และเริ่ม CPR',
      'ตรวจช่องปาก/คอ และทำ FB removal',
      'ใส่ ET tube หลังนำสิ่งแปลกปลอมออก',
      'คำนึงถึง CPR in pregnancy (เอียงตัวมารดา/uterine displacement, ตำแหน่งมือกดหน้าอกสูงขึ้น)',
      'พิจารณา/เตรียม perimortem cesarean delivery หากไม่ ROSC ภายใน 4-5 นาที (GA ≥ 20 สัปดาห์) พร้อมตามทีมสูติ-กุมารแพทย์',
      'จดจำจังหวะเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
  {
    id: 'case-04',
    no: 4,
    level: 'medium',
    title: 'จมน้ำ (Hypoxia)',
    algorithm: 'Refractory VF → ROSC',
    scenario: 'ชาย 30 ปี เล่นน้ำในสระ ตะคริว จมน้ำ ทำ CPR มาแล้ว 5 นาทีก่อนถึงห้องฉุกเฉิน อุณหภูมิร่างกาย 34°C',
    items: items([
      'พิจารณาลำดับการช่วยชีวิตแบบ A → B → C sequence สำหรับภาวะจมน้ำ (hypoxic arrest)',
      'จัดการทางเดินหายใจ (definite airway management) และ ET tube suction สิ่งแปลกปลอม/น้ำ',
      'จดจำจังหวะ VF ที่ดื้อต่อการรักษา (refractory VF) และให้ defibrillation ซ้ำตามข้อบ่งชี้',
      'ให้ amiodarone ตามลำดับขนาดที่ถูกต้องสำหรับ refractory VF (300 mg ครั้งแรก, ซ้ำ 150 mg เมื่อยังดื้อ)',
      'ดูแลรักษาภาวะอุณหภูมิกายต่ำ (keep warm / active rewarming)',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
  {
    id: 'case-05',
    no: 5,
    level: 'easy',
    title: 'ACS',
    algorithm: 'Refractory VF → ROSC',
    scenario: 'ชาย 70 ปี admit อยู่ที่หอผู้ป่วย มีอาการเจ็บหน้าอกแล้วหมดสติ',
    items: items([
      'จดจำจังหวะ VF ได้ถูกต้อง และให้ defibrillation ทันที',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก (refractory VF)',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'ให้การดูแลตาม ACS management หลัง ROSC (ECG 12-lead, aspirin/antiplatelet, เตรียม cath lab ตามข้อบ่งชี้)',
    ]),
  },
  {
    id: 'case-06',
    no: 6,
    level: 'medium',
    title: 'Unstable Bradycardia',
    algorithm: '3rd degree AV block → Unstable VT → ROSC',
    scenario: 'หญิง 30 ปี มีอาการหน้ามืด',
    items: items([
      'จดจำ 3rd degree AV block (HR 30/min, BP 70/40 mmHg) และระบุเป็น unstable bradycardia',
      'ให้ atropine ตามขนาดจนถึง maximum dose อย่างถูกต้อง',
      'เตรียมและให้ transcutaneous pacing เมื่อ atropine ไม่ได้ผล พร้อมปรับหา threshold ที่เหมาะสม',
      'จดจำการเปลี่ยนเป็น VT ที่ยังมีชีพจรแต่ไม่คงที่ (unstable VT, BP 50/30 mmHg) ได้ถูกต้อง และระบุเป็น unstable tachycardia',
      'ทำ synchronized cardioversion 100 J พร้อมพิจารณาให้ sedation ก่อนทำหัตถการ',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs / ECG หลัง ROSC (normal sinus rhythm)',
    ]),
  },
  {
    id: 'case-07',
    no: 7,
    level: 'hard',
    title: 'ACS (Bradycardia, VF)',
    algorithm: '3rd degree AV block → VF → 2nd degree AV block type II',
    scenario: 'ชาย 60 ปี DM ผ่าตัด laparoscopic cholecystectomy มา 2 วัน ยัง admit อยู่ ตื่นขึ้นมามีอาการแน่นหน้าอก',
    items: items([
      'จดจำ 3rd degree AV block (HR 30/min) และให้ atropine ตามขนาดที่ถูกต้อง',
      'เตรียม transcutaneous pacing ไว้ล่วงหน้าเมื่อ atropine ไม่ได้ผล',
      'จดจำการเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation ทันที',
      'จดจำการเปลี่ยนเป็น 2nd degree AV block type II และให้ transcutaneous pacing (หา threshold ที่เหมาะสม)',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'ให้การดูแลตาม ACS management (12-lead ECG, ปรึกษา cardiology ตามข้อบ่งชี้)',
    ]),
  },
  {
    id: 'case-08',
    no: 8,
    level: 'medium',
    title: 'Seizure with Bradycardia',
    algorithm: 'Sinus Bradycardia → Asystole → VF → ROSC',
    scenario: 'ชาย 45 ปี พบหมดสติข้างรถจักรยานยนต์ มีอาการชักกระตุกก่อนมาถึงห้องฉุกเฉิน 1 นาที',
    items: items([
      'จดจำ sinus bradycardia (rate 24/min) และให้ atropine dose แรกตามข้อบ่งชี้',
      'ให้ atropine dose ที่ 2 หรือเตรียม/ให้ transcutaneous pacing เมื่อไม่ตอบสนอง',
      'จดจำการเปลี่ยนเป็น Asystole ได้ถูกต้อง และเริ่ม CPR',
      'ให้ epinephrine 1 dose ตามขนาดที่ถูกต้อง',
      'จดจำการเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs / ECG หลัง ROSC (NSR with PVCs)',
      'ให้การดูแลทางเดินหายใจ (airway care) อย่างเหมาะสมหลังชัก',
    ]),
  },
  {
    id: 'case-09',
    no: 9,
    level: 'medium',
    title: 'Unstable SVT',
    algorithm: 'SVT → VF → PEA → ROSC',
    scenario: 'ชาย 30 ปี วิ่งออกกำลังกายแล้วรู้สึกใจสั่น พักแล้วไม่ดีขึ้น แน่นหน้าอก หน้ามืด',
    items: items([
      'จดจำ SVT (rate 200/min, BP 70/40 mmHg) และระบุเป็น unstable tachycardia',
      'ทำ synchronized cardioversion และเพิ่มพลังงานเมื่อไม่สำเร็จ (2 ครั้ง)',
      'จดจำการเปลี่ยนเป็น VF ได้ถูกต้อง และให้ defibrillation ทันที',
      'จดจำการเปลี่ยนเป็น PEA (sinus bradycardia rate 45/min) ได้ถูกต้อง และเริ่ม CPR',
      "ค้นหาสาเหตุ (H's & T's) และให้ IV fluid bolus อย่างเหมาะสม",
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs / ECG หลัง ROSC',
    ]),
  },
  {
    id: 'case-10',
    no: 10,
    level: 'hard',
    title: 'ACS (Bradycardia) — Termination of CPR',
    algorithm: 'Pulseless VT → 2nd degree AV block type II → Asystole',
    scenario: 'หญิง 75 ปี มาตรวจตามนัดที่ OPD หมดสติขณะวัดความดันโลหิต',
    items: items([
      'จดจำ Pulseless VT ได้ถูกต้อง และให้ defibrillation/amiodarone 300 mg ตามลำดับที่ถูกต้อง',
      'จดจำการเปลี่ยนเป็น 2nd degree AV block type II (rate 40/min) และให้ transcutaneous pacing',
      'ปรับหา threshold ที่เหมาะสม (80 mA) และพิจารณาเพิ่ม rate, load IV fluid, ±inotrope เมื่อ BP ยังต่ำ (80/50 mmHg)',
      'สังเกตภาวะ loss of capture และเปลี่ยนเป็น asystole ได้ทันท่วงที',
      'ตัดสินใจ/พิจารณาการยุติการช่วยฟื้นคืนชีพ (termination of CPR) อย่างเหมาะสมตามเกณฑ์',
      'สื่อสารกับทีมและญาติอย่างเหมาะสมเมื่อพิจารณายุติ CPR',
    ]),
  },
  {
    id: 'case-11',
    no: 11,
    level: 'easy',
    title: 'Foreign Body Airway Obstruction',
    algorithm: 'PEA → Unstable VT → ROSC',
    scenario: 'ชาย 60 ปี หมดสติในโรงอาหารของโรงพยาบาล ขณะกินอาหารกลางวัน',
    items: items([
      'จดจำจังหวะแรกเป็น PEA ได้ถูกต้อง และเริ่ม CPR',
      'ให้ epinephrine dose ที่ 2 ตามขนาด/เวลาที่ถูกต้อง',
      'ตรวจช่องปาก/คอ และทำ FB removal ในผู้ป่วย cardiac arrest',
      'จดจำการเปลี่ยนเป็น VT ที่ยังมีชีพจรแต่ไม่คงที่ (unstable VT, BP 80/40 mmHg) ได้ถูกต้อง',
      'ทำ synchronized cardioversion 100 J',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
  {
    id: 'case-12',
    no: 12,
    level: 'easy',
    title: 'ACS (In-hospital cardiac arrest after AED)',
    algorithm: 'VF → PEA → VF → ROSC',
    scenario: 'ชาย 45 ปี หมดสติขณะออกกำลังกายในฟิตเนส เทรนเนอร์เริ่ม CPR และติด AED ให้แล้ว (CPR ไป 2 cycles และ AED ให้ shock ไป 1 ครั้ง)',
    items: items([
      'รับช่วงต่อจาก AED/เทรนเนอร์อย่างราบรื่น และประเมินจังหวะ VF ได้ถูกต้อง',
      'ให้ amiodarone 300 mg IV ตามขนาดที่ถูกต้อง',
      'จดจำการเปลี่ยนเป็น PEA (NSR rate 80/min) ได้ถูกต้อง และให้ epinephrine dose ถัดไป',
      'จดจำการเปลี่ยนกลับเป็น VF ได้ถูกต้อง และให้ defibrillation',
      'จดจำ ROSC ได้ถูกต้อง (sinus rhythm with ST elevation) และให้ fluid/inotropes ตามความดันโลหิต',
      'ให้การดูแลตาม ACS management หลัง ROSC (12-lead ECG, เตรียม cath lab)',
    ]),
  },
  {
    id: 'case-13',
    no: 13,
    level: 'medium',
    title: 'One-lung Intubation, Hypoglycemia',
    algorithm: 'PEA → ROSC',
    scenario: 'ชาย 50 ปี DM ดื่มสุราหนักทุกวัน ไม่ได้กินอาหารมา 1 วัน ใส่ ET tube มาจาก รพ.ชุมชนแล้ว refer มา (ใส่ลึก 25 cm)',
    items: items([
      'ตรวจสอบตำแหน่งท่อช่วยหายใจและสงสัย one-lung (right main bronchus) intubation',
      'จดจำจังหวะ PEA ได้ถูกต้อง และเริ่ม CPR',
      'ให้ epinephrine dose ที่ 2 ตามขนาด/เวลาที่ถูกต้อง',
      'เลื่อนท่อ ET tube ขึ้นให้ตำแหน่งถูกต้อง',
      'ตรวจน้ำตาลในเลือดและแก้ไขภาวะ hypoglycemia',
      'ใช้แนวคิด DOPE ในการหาสาเหตุที่แก้ไขได้',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
  {
    id: 'case-14',
    no: 14,
    level: 'medium',
    title: 'Ruptured Abdominal Aortic Aneurysm',
    algorithm: 'PEA → ROSC',
    scenario: 'ชาย 70 ปี DM, HTN มา admit เพื่อผ่าตัด AAA วันนี้ปวดท้องมาก ตอนนี้ซึมลง',
    items: items([
      'จดจำจังหวะ PEA (NSR rate 60/min) ได้ถูกต้อง และเริ่ม CPR',
      'ใส่ ET tube และให้เลือด/สารน้ำอย่างรวดเร็ว',
      'นึกถึง hypovolemia จาก massive intraabdominal bleeding เป็นสาเหตุที่แก้ไขได้',
      'ดำเนินการตาม massive transfusion protocol และ blood management',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'ประสานทีมศัลยกรรมเพื่อผ่าตัดฉุกเฉินอย่างเหมาะสม',
    ]),
  },
  {
    id: 'case-15',
    no: 15,
    level: 'hard',
    title: 'Pregnancy with Severe Preeclampsia',
    algorithm: 'Asystole → PEA → ROSC',
    scenario: 'หญิง 28 ปี G2P1A0 GA 36 week ตาพร่ามัว จุกแน่นลิ้นปี่ BP 180/100 mmHg, urine protein positive วินิจฉัย severe preeclampsia ได้รับ MgSO4 1 g/h นาน 6 ชั่วโมง หลังจากนั้นซึมลง ตัวเขียว',
    items: items([
      'จดจำจังหวะ Asystole ได้ถูกต้อง และเริ่ม CPR ทันที',
      'นึกถึงภาวะ MgSO4 toxicity เป็นสาเหตุ และหยุดให้ MgSO4',
      'ให้ 10% Calcium gluconate 1 g IV เพื่อแก้พิษ MgSO4',
      'ให้ epinephrine dose ที่ 2 ตามขนาด/เวลาที่ถูกต้อง',
      'จดจำการเปลี่ยนเป็น PEA (sinus bradycardia rate 40/min) และให้ epinephrine dose ถัดไป',
      'คำนึงถึง CPR in pregnancy: ทำ left uterine displacement ตลอดการช่วยชีวิต',
      'พิจารณา/เตรียม perimortem cesarean delivery หากไม่ ROSC ภายใน 4-5 นาที พร้อมตามทีมสูติ-กุมารแพทย์',
      "พิจารณาสาเหตุอื่นที่เกี่ยวข้องกับการตั้งครรภ์ (H's & T's เฉพาะในหญิงตั้งครรภ์)",
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
    ]),
  },
];
