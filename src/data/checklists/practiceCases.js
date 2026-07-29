// ธนาคารเคสฝึกเสริม 10 เคส — สำหรับ "การเรียนการสอน" (จุดฝึก Megacode)
//
// แต่งขึ้นใหม่ตามแนวทาง ACLS 2020/ILCOR โดยใช้โครงสร้าง/มาตรฐานเดียวกับธนาคาร
// ข้อสอบ 15 เคส (megacodeCases.js): โจทย์ผู้ป่วย + ลำดับจังหวะ + เช็คลิสต์ +
// ระดับความยาก — ตั้งใจเลือกหัวข้อที่ "ไม่ซ้ำ" กับธนาคารสอบและเคสจากเกม เพื่อ
// ขยาย coverage การสอน (anaphylaxis, opioid, torsades, asthma, TCA, ไฟฟ้าดูด,
// PPH, sepsis, unstable AF, heat stroke)
//
// ⚠️ เป็นชุด "ฝึก" — ไม่ใช่ชุดสอบต้นฉบับของศูนย์ จึงแยกไฟล์/แยก pool ไม่ปนเข้า
// การสุ่มข้อสอบที่ฐานสอบ ผ่าน/ไม่ผ่านเป็นดุลยพินิจอาจารย์เหมือนธนาคารสอบ และ
// ข้อประเมินแกนกลาง C1-C9 ถูกเพิ่มให้อัตโนมัติใน ChecklistGrader เหมือนกันทุกเคส

function items(list) {
  return list.map((text) => ({ text }));
}

export const PRACTICE_CASES = [
  {
    id: 'practice-01',
    no: 'P1',
    level: 'medium',
    title: 'Anaphylaxis จาก contrast media',
    algorithm: 'PEA → ROSC',
    scenario: 'หญิง 45 ปี ทำ CT with contrast ระหว่างฉีดสารทึบรังสี มีผื่นลมพิษทั้งตัว หายใจมีเสียงวี้ด ความดันตก แล้วหมดสติ คลำชีพจรไม่ได้',
    items: items([
      'จดจำจังหวะ PEA ได้ถูกต้อง และเริ่ม CPR ทันที',
      'นึกถึง anaphylaxis จาก contrast media และหยุดสารก่อแพ้ทันที',
      'ให้ epinephrine 1 mg IV ตาม algorithm (ยาหลักของ anaphylaxis ด้วย)',
      'ให้ IV fluid bolus ปริมาณมาก (distributive shock)',
      'ใส่ ET tube โดยเร็ว — เตรียมรับมือทางเดินหายใจบวม (difficult airway)',
      'จดจำ ROSC ได้ถูกต้อง และให้ H1/H2 antihistamine + corticosteroid หลัง ROSC',
      'วางแผนเฝ้าระวัง biphasic reaction หลัง ROSC',
    ]),
  },
  {
    id: 'practice-02',
    no: 'P2',
    level: 'easy',
    title: 'Opioid overdose',
    algorithm: 'Respiratory arrest → PEA → ROSC',
    scenario: 'ชาย 25 ปี ถูกพบซึมในห้องน้ำสถานีขนส่ง หายใจช้า 4 ครั้ง/นาที รูม่านตาเล็กมากทั้งสองข้าง มีอุปกรณ์ฉีดยาเสพติดข้างตัว',
    items: items([
      'ประเมินและช่วยหายใจด้วย bag-mask ทันทีในผู้ป่วยหยุดหายใจที่ยังมีชีพจร',
      'นึกถึง opioid overdose (pinpoint pupils + ประวัติ) และให้ naloxone 0.4-2 mg IV/IM ซ้ำได้',
      'จดจำการทรุดลงเป็น PEA ได้ถูกต้อง และเริ่ม CPR',
      'ระหว่าง arrest ให้ยึด CPR คุณภาพสูง + epinephrine ตาม algorithm เป็นหลัก (naloxone ไม่ใช่ priority ระหว่าง arrest)',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'เฝ้าระวัง re-narcotization (naloxone หมดฤทธิ์ก่อน opioid) และวางแผน admit',
    ]),
  },
  {
    id: 'practice-03',
    no: 'P3',
    level: 'medium',
    title: 'Torsades de pointes (hypomagnesemia)',
    algorithm: 'Polymorphic VT (torsades) → ROSC',
    scenario: 'หญิง 60 ปี กินยาขับปัสสาวะเป็นประจำ และเพิ่งได้ยาปฏิชีวนะที่ทำให้ QT ยาว มีอาการใจสั่นเป็นพักๆ แล้วหมดสติ คลำชีพจรไม่ได้',
    items: items([
      'จดจำ polymorphic VT (torsades de pointes) ได้ถูกต้อง และให้ defibrillation (ไม่ใช่ synchronized cardioversion)',
      'ให้ MgSO4 1-2 g IV เป็นยาจำเพาะของ torsades',
      'สั่งหยุดยาที่ทำให้ QT ยาวทุกตัว',
      'ส่งตรวจและแก้ไข K/Mg ที่ต่ำ',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'หลัง ROSC ติดตาม QTc และพิจารณา overdrive pacing หากกลับเป็นซ้ำ',
    ]),
  },
  {
    id: 'practice-04',
    no: 'P4',
    level: 'hard',
    title: 'Severe asthma (auto-PEEP)',
    algorithm: 'Bradycardia → PEA → ROSC',
    scenario: 'ชาย 20 ปี หอบหืดรุนแรง ใส่ ET tube แล้วช่วยหายใจด้วย bag บีบถี่ๆ สักพักความดันตก หัวใจเต้นช้าลง แล้วคลำชีพจรไม่ได้',
    items: items([
      'จดจำการทรุดจาก bradycardia เป็น PEA ได้ถูกต้อง และเริ่ม CPR',
      'นึกถึง auto-PEEP / air trapping จากการบีบ bag ถี่เกินไปเป็นสาเหตุ',
      'ปลดวงจรช่วยหายใจชั่วคราว + กดหน้าอกไล่ลมค้าง (decompress air trapping)',
      'ตั้งการช่วยหายใจใหม่: rate ต่ำ (6-8/นาที) ปล่อย expiratory time ยาว',
      'ตรวจแยก tension pneumothorax (ภาวะแทรกซ้อนที่พบร่วมบ่อย)',
      'ให้ IV fluid bolus ช่วย venous return',
      'จดจำ ROSC ได้ถูกต้อง และวางแผน ventilator strategy + bronchodilator หลัง ROSC',
    ]),
  },
  {
    id: 'practice-05',
    no: 'P5',
    level: 'hard',
    title: 'Tricyclic antidepressant overdose',
    algorithm: 'Wide QRS → Pulseless VT → ROSC',
    scenario: 'หญิง 30 ปี กิน amitriptyline เกินขนาดหลังทะเลาะกับครอบครัว มาถึงห้องฉุกเฉินซึม ชัก 1 ครั้ง ECG พบ QRS กว้าง แล้วหมดสติ คลำชีพจรไม่ได้',
    items: items([
      'จดจำ pulseless VT ได้ถูกต้อง และให้ defibrillation ทันที',
      'นึกถึง TCA toxicity จากประวัติ + QRS กว้าง เป็นสาเหตุที่แก้ไขได้',
      'ให้ sodium bicarbonate IV bolus (ยาจำเพาะของ TCA-induced wide QRS/arrhythmia)',
      'หลีกเลี่ยงยา antiarrhythmic class IA/IC และ amiodarone (ทำให้ QRS กว้างขึ้น)',
      'ให้ IV fluid และดูแลทางเดินหายใจ (ระวังชักซ้ำ)',
      'จดจำ ROSC ได้ถูกต้อง และให้ bicarbonate ต่อแบบ infusion + ติดตาม QRS',
      'ปรึกษาศูนย์พิษวิทยา/ICU หลัง ROSC',
    ]),
  },
  {
    id: 'practice-06',
    no: 'P6',
    level: 'easy',
    title: 'ไฟฟ้าดูด (Electrocution)',
    algorithm: 'VF → ROSC',
    scenario: 'ช่างไฟ 35 ปี ถูกไฟฟ้าดูดขณะซ่อมตู้ควบคุมไฟในโรงงาน ล้มหมดสติอยู่ข้างตู้ไฟ',
    items: items([
      'ประเมิน scene safety: สั่งตัดกระแสไฟก่อนเข้าช่วยเหลือ',
      'จดจำจังหวะ VF ได้ถูกต้อง และให้ defibrillation ทันที',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก',
      'นึกถึงการบาดเจ็บร่วม (ตกจากที่สูง) — ทำ C-spine precaution',
      'ตรวจหาแผลไหม้ทางเข้า-ออกของกระแสไฟ',
      'จดจำ ROSC ได้ถูกต้อง และ monitor arrhythmia + ระวัง rhabdomyolysis หลัง ROSC',
    ]),
  },
  {
    id: 'practice-07',
    no: 'P7',
    level: 'medium',
    title: 'Postpartum hemorrhage (hypovolemia)',
    algorithm: 'PEA → ROSC',
    scenario: 'หญิง 32 ปี หลังคลอดบุตรคนที่ 3 ทางช่องคลอด 1 ชั่วโมง เลือดออกทางช่องคลอดปริมาณมาก ซึมลง แล้วหมดสติ คลำชีพจรไม่ได้',
    items: items([
      'จดจำจังหวะ PEA ได้ถูกต้อง และเริ่ม CPR',
      'นึกถึง hypovolemia จาก postpartum hemorrhage เป็นสาเหตุที่แก้ไขได้',
      'ให้ IV fluid/เลือดอย่างรวดเร็วตาม massive transfusion protocol',
      'สั่ง uterine massage + uterotonic (oxytocin) แก้ uterine atony',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs หลัง ROSC',
      'ประสานทีมสูติศาสตร์เพื่อหยุดเลือด (หัตถการ/ผ่าตัด) โดยด่วน',
    ]),
  },
  {
    id: 'practice-08',
    no: 'P8',
    level: 'medium',
    title: 'Septic shock (urosepsis)',
    algorithm: 'PEA → Asystole → ROSC',
    scenario: 'หญิง 80 ปี ติดเตียง ไข้สูง ปัสสาวะขุ่นมา 2 วัน วันนี้ซึมมาก ความดันตก ระหว่างรอผลเลือดหมดสติ คลำชีพจรไม่ได้',
    items: items([
      'จดจำจังหวะ PEA ได้ถูกต้อง และเริ่ม CPR + epinephrine ตาม algorithm',
      'นึกถึง septic shock (urosepsis) — hypovolemia/distributive เป็นสาเหตุ',
      'ให้ IV fluid bolus ปริมาณมากระหว่างช่วยชีวิต',
      'สั่ง broad-spectrum antibiotic โดยเร็ว (ให้ได้ตั้งแต่ระหว่าง/ทันทีหลังช่วยชีวิต)',
      'จดจำการเปลี่ยนเป็น Asystole ได้ถูกต้อง และช่วยชีวิตต่อตาม algorithm',
      'จดจำ ROSC ได้ถูกต้อง และเริ่ม vasopressor + หา source of infection หลัง ROSC',
    ]),
  },
  {
    id: 'practice-09',
    no: 'P9',
    level: 'medium',
    title: 'Unstable AF with RVR',
    algorithm: 'Unstable AF → VF → ROSC',
    scenario: 'ชาย 65 ปี ใจสั่นมา 2 ชั่วโมง แน่นหน้าอก เหงื่อแตก ECG พบ atrial fibrillation rate 170/min BP 80/50 mmHg',
    items: items([
      'จดจำ AF (irregularly irregular, ไม่มี P wave) rate เร็ว และระบุเป็น unstable tachycardia',
      'ทำ synchronized cardioversion 120-200 J พร้อมพิจารณา sedation ก่อน',
      'จดจำการเปลี่ยนเป็น VF ได้ถูกต้อง และสลับเป็น defibrillation (ไม่ synchronized) ทันที',
      'ให้ amiodarone 300 mg IV เมื่อ VF ดื้อต่อการช็อก',
      'จดจำ ROSC ได้ถูกต้อง และประเมิน vital signs / 12-lead ECG หลัง ROSC',
      'พิจารณา anticoagulation และปรึกษา cardiology หลัง ROSC',
    ]),
  },
  {
    id: 'practice-10',
    no: 'P10',
    level: 'medium',
    title: 'Heat stroke (exertional)',
    algorithm: 'PEA → ROSC',
    scenario: 'ชาย 40 ปี วิ่งมาราธอนช่วงบ่ายอากาศร้อนจัด เพื่อนพบเดินเซ พูดสับสน แล้วชักและหมดสติ อุณหภูมิกาย 41.5°C คลำชีพจรไม่ได้',
    items: items([
      'จดจำจังหวะ PEA ได้ถูกต้อง และเริ่ม CPR',
      'นึกถึง heat stroke เป็นสาเหตุ และเริ่ม rapid cooling ทันทีควบคู่การช่วยชีวิต (ถอดเสื้อผ้า พ่นน้ำ+พัดลม/ice pack)',
      'ให้ IV fluid ที่เย็นทดแทน volume',
      'ส่งตรวจ electrolyte / glucose และแก้ไขตามผล',
      'จดจำ ROSC ได้ถูกต้อง และคุมอุณหภูมิเป้าหมายต่อหลัง ROSC',
      'เฝ้าระวัง rhabdomyolysis / multi-organ failure และวางแผน ICU',
    ]),
  },
];
