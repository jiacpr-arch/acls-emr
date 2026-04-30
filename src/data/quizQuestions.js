// Quiz questions for the cartoon ACLS Quiz Game
// Each level has progressively harder questions
// shape: { q, options: [4], answer: index, explain }

export const quizLevels = [
  {
    id: 1,
    name: 'BLS Basics',
    icon: '🫁',
    color: 'success',
    boss: 'Patient with no pulse',
    questions: [
      {
        q: 'พบผู้ป่วยหมดสติ ไม่หายใจ ขั้นแรกควรทำอะไร?',
        options: ['ให้ออกซิเจนทันที', 'เรียกขอความช่วยเหลือและขอ AED', 'วัดความดัน', 'ใส่ ETT'],
        answer: 1,
        explain: 'หลัก BLS: เรียก help + ขอ AED ก่อน แล้วจึงเริ่ม CPR',
      },
      {
        q: 'อัตราการกดหน้าอกที่ถูกต้องในผู้ใหญ่?',
        options: ['60-80 ครั้ง/นาที', '80-100 ครั้ง/นาที', '100-120 ครั้ง/นาที', '120-140 ครั้ง/นาที'],
        answer: 2,
        explain: '100-120 ครั้ง/นาที ลึก 5-6 cm และปล่อยให้คืนตัวเต็มที่',
      },
      {
        q: 'อัตราส่วน compression:ventilation ในผู้ใหญ่ที่ไม่ใส่ advanced airway?',
        options: ['15:2', '30:2', '5:1', '10:1'],
        answer: 1,
        explain: '30:2 — กด 30 ครั้ง สลับช่วยหายใจ 2 ครั้ง',
      },
      {
        q: 'คลำชีพจรไม่ควรเกินกี่วินาที?',
        options: ['5 วินาที', '10 วินาที', '20 วินาที', '30 วินาที'],
        answer: 1,
        explain: 'ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้เริ่ม CPR ทันที',
      },
      {
        q: 'ความลึกของการกดหน้าอกในผู้ใหญ่ที่เหมาะสม?',
        options: ['2-3 cm', '3-4 cm', '5-6 cm', '7-8 cm'],
        answer: 2,
        explain: '5-6 cm (อย่างน้อย 5 cm แต่ไม่เกิน 6 cm)',
      },
    ],
  },
  {
    id: 2,
    name: 'Rhythms & Defib',
    icon: '⚡',
    color: 'shock',
    boss: 'VFib Monster',
    questions: [
      {
        q: 'จังหวะหัวใจใดต้องช็อกไฟฟ้า?',
        options: ['Asystole', 'PEA', 'VF / pVT', 'Sinus Bradycardia'],
        answer: 2,
        explain: 'Shockable rhythms = VF และ Pulseless VT เท่านั้น',
      },
      {
        q: 'ขนาดพลังงาน defibrillation ครั้งแรก (biphasic)?',
        options: ['50 J', '120-200 J', '300 J', '360 J'],
        answer: 1,
        explain: 'Biphasic 120-200 J ตามที่ผู้ผลิตแนะนำ — Monophasic 360 J',
      },
      {
        q: 'หลัง shock ควรทำอะไรต่อ?',
        options: ['เช็ค pulse ทันที', 'CPR ต่อ 2 นาที', 'ให้ Epinephrine', 'รอจังหวะใหม่'],
        answer: 1,
        explain: 'Shock แล้ว CPR ต่อทันที 2 นาที ค่อย check rhythm',
      },
      {
        q: 'PEA มีลักษณะใด?',
        options: ['เส้นตรงทั้งหมด', 'มีจังหวะบนจอแต่คลำชีพจรไม่ได้', 'หัวใจเต้นช้า', 'หัวใจเต้นเร็วมาก'],
        answer: 1,
        explain: 'PEA = มี electrical activity แต่ไม่มี pulse — non-shockable',
      },
      {
        q: 'จังหวะ Asystole จัดอยู่ในกลุ่มใด?',
        options: ['Shockable', 'Non-shockable', 'ขึ้นกับอายุ', 'ขึ้นกับสาเหตุ'],
        answer: 1,
        explain: 'Asystole = non-shockable — ห้าม shock ต้อง CPR + Epi + หา H&T',
      },
    ],
  },
  {
    id: 3,
    name: 'Drugs & Doses',
    icon: '💉',
    color: 'info',
    boss: 'Pharmacology Pro',
    questions: [
      {
        q: 'ขนาด Epinephrine ใน cardiac arrest?',
        options: ['0.1 mg IV', '1 mg IV ทุก 3-5 นาที', '5 mg IV ครั้งเดียว', '10 mg IM'],
        answer: 1,
        explain: '1 mg IV/IO ทุก 3-5 นาที — ยาหลักใน arrest',
      },
      {
        q: 'Amiodarone ครั้งแรกใน VF/pVT ที่ดื้อ shock?',
        options: ['100 mg', '150 mg', '300 mg', '450 mg'],
        answer: 2,
        explain: 'Amiodarone 300 mg IV bolus ครั้งแรก, ครั้งที่สอง 150 mg',
      },
      {
        q: 'Atropine ใน symptomatic bradycardia?',
        options: ['0.5 mg ทุก 5 นาที max 3 mg', '1 mg ทุก 3-5 นาที max 3 mg', '2 mg ครั้งเดียว', '5 mg drip'],
        answer: 1,
        explain: '1 mg IV ทุก 3-5 นาที, ขนาดสูงสุด 3 mg',
      },
      {
        q: 'Adenosine dose แรกใน stable SVT?',
        options: ['3 mg', '6 mg rapid push', '12 mg slow', '18 mg'],
        answer: 1,
        explain: '6 mg rapid IV push, ตามด้วย 12 mg และ 12 mg ถ้าจำเป็น',
      },
      {
        q: 'ยาตัวใดควรพิจารณาใน Torsades de pointes?',
        options: ['Amiodarone', 'Magnesium sulfate 1-2 g', 'Lidocaine', 'Beta-blocker'],
        answer: 1,
        explain: 'Magnesium 1-2 g IV — first-line ใน Torsades',
      },
    ],
  },
  {
    id: 4,
    name: 'Special Situations',
    icon: '🚨',
    color: 'warning',
    boss: 'H&T Hunter',
    questions: [
      {
        q: 'หญิงตั้งครรภ์ cardiac arrest ควรทำอะไรเพิ่ม?',
        options: ['ลดแรงกด', 'ดันมดลูกไปด้านซ้าย', 'ห้าม shock', 'ห้ามให้ Epi'],
        answer: 1,
        explain: 'Left uterine displacement ลด aortocaval compression',
      },
      {
        q: 'ใน anaphylaxis Epinephrine ให้ทางไหน?',
        options: ['IV bolus 1 mg', 'IM 0.3-0.5 mg ที่ต้นขาด้านข้าง', 'SC 1 mg', 'PO 5 mg'],
        answer: 1,
        explain: 'IM 0.3-0.5 mg ที่ vastus lateralis ซ้ำได้ทุก 5-15 นาที',
      },
      {
        q: 'H&T ตัวใดเกี่ยวกับโพแทสเซียม?',
        options: ['Hypoxia', 'Hypovolemia', 'Hyper/Hypokalemia', 'Hypothermia'],
        answer: 2,
        explain: 'Hyper/Hypokalemia = หนึ่งใน reversible causes',
      },
      {
        q: 'ผู้ป่วย opioid overdose ที่ apnea ควรให้ยาใด?',
        options: ['Flumazenil', 'Naloxone', 'Atropine', 'Calcium gluconate'],
        answer: 1,
        explain: 'Naloxone 0.4-2 mg IV/IM/IN ทุก 2-3 นาที',
      },
      {
        q: 'Targeted Temperature Management หลัง ROSC เป้าหมายเท่าไร?',
        options: ['28-30°C', '32-36°C นานอย่างน้อย 24 ชม.', '37-38°C', '39-40°C'],
        answer: 1,
        explain: '32-36°C ต่อเนื่อง 24 ชม. ลดความเสียหายของสมอง',
      },
    ],
  },
  {
    id: 5,
    name: 'Megacode Boss',
    icon: '👑',
    color: 'danger',
    boss: 'The Code Master',
    questions: [
      {
        q: 'ผู้ป่วย VF shock 3 ครั้งแล้วยังไม่กลับ ควรพิจารณายาตัวใด?',
        options: ['Atropine', 'Amiodarone 300 mg', 'Adenosine', 'Lidocaine 50 mg'],
        answer: 1,
        explain: 'Amiodarone 300 mg IV หลัง shock ครั้งที่ 3 (refractory VF/pVT)',
      },
      {
        q: 'CCF (Chest Compression Fraction) ที่เป็นเป้าหมาย?',
        options: ['>50%', '>60%', '>80%', '100%'],
        answer: 2,
        explain: '>80% — minimize interruption ของการกดหน้าอก',
      },
      {
        q: 'Wide-complex tachycardia ที่ unstable ควรทำอะไร?',
        options: ['Adenosine', 'Synchronized cardioversion', 'Defibrillation 360 J', 'Vagal maneuver'],
        answer: 1,
        explain: 'Unstable = synchronized cardioversion ทันที',
      },
      {
        q: 'หลังใส่ advanced airway ควรช่วยหายใจอัตราเท่าไร?',
        options: ['1 ครั้งทุก 3 วินาที', '1 ครั้งทุก 6 วินาที (10/min)', '1 ครั้งทุก 10 วินาที', 'หยุด CPR ก่อนทุกครั้ง'],
        answer: 1,
        explain: '1 ครั้งทุก 6 วินาที (10/min) กดหน้าอกต่อเนื่องไม่หยุด',
      },
      {
        q: 'EtCO2 ระหว่าง CPR ที่บอกถึง CPR คุณภาพดี?',
        options: ['<10 mmHg', '>10 mmHg (ideal >20)', '50-60 mmHg', '>80 mmHg'],
        answer: 1,
        explain: 'EtCO2 >10 mmHg แสดงว่ามี perfusion พอ ถ้า <10 ต้องปรับ CPR',
      },
    ],
  },
];

export const totalQuestions = quizLevels.reduce((s, l) => s + l.questions.length, 0);
