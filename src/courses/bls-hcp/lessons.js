// BLS for Healthcare Providers — pre-course lessons (AHA BLS-HCP 2020, ผสม TRC notes)
// ใช้ schema เดียวกับ src/data/preCourseContent.js เพื่อให้ LessonReader engine ใช้ได้เลย
//
// IMPORTANT: เนื้อหาในไฟล์นี้เป็น draft ที่ paraphrase จากแนวทาง AHA 2020 + TRC
// ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อนปล่อย production
// ระวังลิขสิทธิ์ AHA — ห้าม quote algorithm table ตรง ๆ ใช้ paraphrase เท่านั้น

export const preCourseVideos = [
  {
    platform: 'youtube',
    label: 'ดูบน YouTube',
    url: 'https://youtube.com/@jia-bu8yn',
  },
  {
    platform: 'tiktok',
    label: 'ดูบน TikTok',
    url: 'https://www.tiktok.com/@jia_lucksa',
  },
];

// Per-lesson videos — แต่ละบทมีวีดีโอเฉพาะของตัวเอง
// TODO: แทนที่ url ด้วยลิงก์วีดีโอ specific ของแต่ละบทเมื่อพร้อม
const lessonVideos = {
  'bls-1': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/7RrA-X0vhq0' },
  ],
  'bls-2': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/IbvE4PnW_80' },
  ],
  'bls-3': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/dtIswl6Od2I' },
  ],
  'bls-4': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/dQ9TcHdhIr0' },
  ],
  'bls-5': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/0kaOCefb-xc' },
  ],
  'bls-6': [
    { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtu.be/fu65-_ENCLo' },
  ],
  'bls-7': [
    { platform: 'youtube', label: 'ผู้ใหญ่ (YouTube)', url: 'https://youtu.be/t3WnWOOVh2c' },
    { platform: 'youtube', label: 'เด็ก (YouTube)', url: 'https://youtu.be/pCgxwQUzph0' },
  ],
};

const lessonDefs = [
  // ===================== บทที่ 1 =====================
  {
    id: 'bls-1',
    title: 'บทที่ 1: ภาพรวม BLS และ Chain of Survival',
    description: 'ห่วงโซ่การรอดชีวิตในโรงพยาบาล (IHCA) และนอกโรงพยาบาล (OHCA) บทบาทของผู้ช่วยเหลือคนแรก',
    estMinutes: 6,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'BLS คืออะไร',
        body: 'Basic Life Support (BLS) คือชุดทักษะพื้นฐานที่บุคลากรทางการแพทย์ทุกคนต้องทำได้:\n• จดจำภาวะหัวใจหยุดเต้นทันที\n• เรียกขอความช่วยเหลือ + ขอ defibrillator\n• กดหน้าอกคุณภาพสูง\n• ใช้ AED เร็วที่สุด\n• ดูแลทางเดินหายใจขั้นพื้นฐาน' },
      { type: 'read', heading: 'Chain of Survival — OHCA (นอก รพ.)',
        body: '1) จดจำเหตุและเรียก EMS ทันที (1669 ในไทย ใช้ speakerphone)\n2) CPR คุณภาพสูง โดยเน้นกดหน้าอก\n3) Defibrillation รวดเร็วด้วย AED\n4) Advanced resuscitation (EMS / ER)\n5) Post-cardiac arrest care\n6) Recovery (กายภาพ + จิตใจ + สังคม)' },
      { type: 'read', heading: 'Chain of Survival — IHCA (ใน รพ.)',
        body: '1) Early recognition + activate code blue / RRT\n2) CPR คุณภาพสูง\n3) Defibrillation\n4) Advanced resuscitation\n5) Post-cardiac arrest care\n6) Recovery' },
      { type: 'quiz', id: 'bls-1-q1',
        question: 'พบผู้ป่วยหมดสติ ไม่ตอบสนอง ใน ward — ขั้นตอนแรกที่ควรทำคืออะไร?',
        choices: [
          { id: 'a', text: 'เริ่มกดหน้าอกทันทีก่อนเรียกใคร' },
          { id: 'b', text: 'ตรวจชีพจรนาน 30 วินาที' },
          { id: 'c', text: 'เรียก code blue / RRT พร้อมขอ defibrillator' },
          { id: 'd', text: 'ไปตามแพทย์เวรเอง' },
        ],
        correctId: 'c',
        explanation: 'IHCA: เมื่อจดจำเหตุได้ ต้อง activate code blue / RRT ทันที พร้อมขอ defibrillator การช่วยเหลือคนเดียวเสียเวลา' },
      { type: 'quiz', id: 'bls-1-q2',
        question: 'ห่วงโซ่การรอดชีวิตของ OHCA แตกต่างจาก IHCA อย่างไร?',
        choices: [
          { id: 'a', text: 'OHCA เริ่มจากการเรียก EMS ผ่านระบบ 1669 ไม่ใช่ code blue' },
          { id: 'b', text: 'OHCA ไม่ต้องใช้ AED' },
          { id: 'c', text: 'IHCA ไม่จำเป็นต้อง CPR' },
          { id: 'd', text: 'ไม่ต่างกันเลย' },
        ],
        correctId: 'a',
        explanation: 'OHCA = นอกโรงพยาบาล เรียก EMS (1669); IHCA = ในโรงพยาบาล เรียก code blue / RRT ภายใน' },
      { type: 'quiz', id: 'bls-1-q3',
        question: 'การตรวจชีพจรในผู้ใหญ่ที่หมดสติควรใช้เวลานานสุดเท่าไร?',
        choices: [
          { id: 'a', text: 'ไม่เกิน 10 วินาที' },
          { id: 'b', text: '15–20 วินาที' },
          { id: 'c', text: '30 วินาที' },
          { id: 'd', text: '1 นาที' },
        ],
        correctId: 'a',
        explanation: 'ตรวจชีพจร carotid ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้เริ่ม CPR ทันที' },
    ],
  },

  // ===================== บทที่ 2 =====================
  {
    id: 'bls-2',
    title: 'บทที่ 2: CPR คุณภาพสูงในผู้ใหญ่',
    description: 'อัตรา ความลึก การคืนตัวของหน้าอก และการลดการหยุดกดหน้าอก',
    estMinutes: 10,
    passingScore: 75,
    steps: [
      { type: 'read', heading: '5 องค์ประกอบของ High-Quality CPR',
        body: '1) อัตรา 100–120 ครั้ง/นาที\n2) ความลึก 5–6 ซม. (อย่างน้อย 1/3 ของ AP diameter)\n3) ปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil)\n4) ลดการหยุดกดหน้าอกให้น้อยที่สุด (CCF > 60%, เป้าหมาย 80%)\n5) ห้าม over-ventilation (หลังใส่ advanced airway: 1 ครั้งทุก 6 วินาที = 10 ครั้ง/นาที)' },
      { type: 'read', heading: 'ตำแหน่งและท่าทาง',
        body: '• วางส้นมือบนกลางหน้าอก ครึ่งล่างของกระดูก sternum\n• ประสานมือทั้งสอง แขนเหยียดตรง ไหล่อยู่เหนือมือ ใช้น้ำหนักตัวกด\n• ผู้ป่วยควรอยู่บนพื้นแข็ง (backboard ถ้าอยู่บนเตียงนุ่ม)' },
      { type: 'quiz', id: 'bls-2-q1',
        question: 'อัตราการกดหน้าอกในผู้ใหญ่ตามแนวทาง AHA 2020 คือเท่าไร?',
        choices: [
          { id: 'a', text: '60–80 ครั้ง/นาที' },
          { id: 'b', text: '80–100 ครั้ง/นาที' },
          { id: 'c', text: '100–120 ครั้ง/นาที' },
          { id: 'd', text: 'มากกว่า 120 ครั้ง/นาที' },
        ],
        correctId: 'c',
        explanation: 'AHA แนะนำ 100–120 ครั้ง/นาที กดเร็วเกินจะกดได้ไม่ลึก กดช้าเกินจะได้ flow ไม่พอ' },
      { type: 'quiz', id: 'bls-2-q2',
        question: 'ความลึกในการกดหน้าอกในผู้ใหญ่ที่เหมาะสมคือ?',
        choices: [
          { id: 'a', text: '2–3 ซม.' },
          { id: 'b', text: '3–4 ซม.' },
          { id: 'c', text: '5–6 ซม.' },
          { id: 'd', text: 'มากกว่า 7 ซม.' },
        ],
        correctId: 'c',
        explanation: '5–6 ซม. หรืออย่างน้อย 1/3 ของ AP diameter หน้าอก กดตื้นเกิน output ไม่พอ; กดลึกเกินเสี่ยงต่อ rib fracture' },
      { type: 'quiz', id: 'bls-2-q3',
        question: 'Chest Compression Fraction (CCF) ที่แนะนำคืออย่างน้อยเท่าไร?',
        choices: [
          { id: 'a', text: '40%' },
          { id: 'b', text: '60%' },
          { id: 'c', text: '80%' },
          { id: 'd', text: '100%' },
        ],
        correctId: 'b',
        explanation: 'CCF ≥ 60% (เป้าหมาย 80% ตาม AHA) — เวลาที่กดหน้าอกจริงเทียบกับเวลารวมของ resuscitation' },
      { type: 'quiz', id: 'bls-2-q4',
        question: 'ทำไมต้องปล่อยให้หน้าอกคืนตัวเต็มที่ระหว่าง compression?',
        choices: [
          { id: 'a', text: 'เพื่อพักกล้ามเนื้อผู้กด' },
          { id: 'b', text: 'เพื่อให้เลือดไหลกลับเข้า heart ใน diastole (venous return)' },
          { id: 'c', text: 'เพื่อให้ผู้ป่วยหายใจเอง' },
          { id: 'd', text: 'ไม่มีผลทาง physiology' },
        ],
        correctId: 'b',
        explanation: 'Incomplete recoil → ลด venous return → ลด cardiac output ของ CPR อย่างมาก' },
    ],
  },

  // ===================== บทที่ 3 =====================
  {
    id: 'bls-3',
    title: 'บทที่ 3: การใช้ AED',
    description: 'การติดและใช้ Automated External Defibrillator อย่างปลอดภัยและมีประสิทธิภาพ',
    estMinutes: 7,
    passingScore: 75,
    steps: [
      { type: 'read', heading: '4 ขั้นตอนการใช้ AED',
        body: '1) เปิดเครื่อง — ฟังคำสั่งเสียง\n2) ติด pads ที่ตำแหน่งถูกต้อง\n3) ให้ AED วิเคราะห์ rhythm (ห้ามแตะผู้ป่วย)\n4) ถ้าแนะนำ shock — เคลียร์คนรอบ → กดปุ่ม shock → เริ่ม CPR ต่อทันที 2 นาที' },
      { type: 'read', heading: 'ตำแหน่ง pads',
        body: '• Anterolateral (มาตรฐาน): pad 1 ที่ใต้กระดูกไหปลาร้าขวา; pad 2 ที่ใต้รักแร้ซ้าย\n• Anteroposterior: ถ้ามี pacemaker / pads ใหญ่ ใช้กลางอกหน้า + กลางหลัง\n• ระยะห่างจาก pacemaker/ICD อย่างน้อย 2.5 ซม.' },
      { type: 'read', heading: 'สถานการณ์พิเศษ',
        body: '• Hairy chest: โกนเร็ว ๆ หรือใช้ pads สำรองดึงขนออก\n• Wet chest: เช็ดให้แห้งก่อนติด pads\n• Patch (ยา transdermal): ดึงออก เช็ดยาออกก่อน\n• ในน้ำ: ย้ายผู้ป่วยขึ้นแห้งก่อน\n• เด็ก < 8 ปี: ใช้ pediatric pads / dose attenuator ถ้ามี; ถ้าไม่มีใช้ผู้ใหญ่ได้' },
      { type: 'quiz', id: 'bls-3-q1',
        question: 'ทันทีหลัง shock ควรทำอะไรต่อ?',
        choices: [
          { id: 'a', text: 'ตรวจชีพจรทันที' },
          { id: 'b', text: 'เริ่มกดหน้าอกต่อทันที 2 นาที' },
          { id: 'c', text: 'รอให้ AED วิเคราะห์ซ้ำ' },
          { id: 'd', text: 'ใส่ advanced airway' },
        ],
        correctId: 'b',
        explanation: 'หลัง shock ต้องเริ่ม CPR ต่อ 2 นาทีทันที โดยไม่ตรวจชีพจร เพื่อรักษา perfusion' },
      { type: 'quiz', id: 'bls-3-q2',
        question: 'ใช้ AED ในเด็กอายุน้อยกว่า 8 ปี ควรใช้อะไร?',
        choices: [
          { id: 'a', text: 'ใช้ pads ผู้ใหญ่ตามปกติ' },
          { id: 'b', text: 'ใช้ pediatric pads / dose attenuator ถ้ามี (ถ้าไม่มีใช้ผู้ใหญ่ได้)' },
          { id: 'c', text: 'ห้ามใช้ AED ในเด็กทุกกรณี' },
          { id: 'd', text: 'รอ EMS มาเท่านั้น' },
        ],
        correctId: 'b',
        explanation: 'เด็ก < 8 ปี ใช้ pediatric pads / attenuator ถ้ามี; ถ้าไม่มีให้ใช้ผู้ใหญ่ — defib เป็นชีวิต ห้ามชะลอ' },
      { type: 'quiz', id: 'bls-3-q3',
        question: 'ผู้ป่วย VF ที่มีหน้าอกเปียกน้ำ ควรทำอะไรก่อนติด AED pads?',
        choices: [
          { id: 'a', text: 'รอให้แห้งเอง' },
          { id: 'b', text: 'เช็ดหน้าอกให้แห้งอย่างรวดเร็ว' },
          { id: 'c', text: 'ห้ามใช้ AED' },
          { id: 'd', text: 'ใส่ glove เพิ่ม' },
        ],
        correctId: 'b',
        explanation: 'เช็ดให้แห้งเพื่อให้ pads ติดและ shock ผ่านได้ดี ห้ามรอ' },
      { type: 'quiz', id: 'bls-3-q4',
        question: 'ผู้ป่วยใส่ pacemaker อยู่ ต้องวาง pads อย่างไร?',
        choices: [
          { id: 'a', text: 'วางตรงบน pacemaker' },
          { id: 'b', text: 'ห่างจาก pacemaker อย่างน้อย 2.5 ซม.' },
          { id: 'c', text: 'ไม่ shock เลย' },
          { id: 'd', text: 'ปิด pacemaker ก่อน' },
        ],
        correctId: 'b',
        explanation: 'หลีกเลี่ยงตรง pacemaker เพื่อไม่ให้เครื่องเสียหาย แต่ต้อง shock ได้' },
    ],
  },

  // ===================== บทที่ 4 =====================
  {
    id: 'bls-4',
    title: 'บทที่ 4: 2-rescuer CPR และ Team Dynamics',
    description: 'การทำงานเป็นทีม การสลับคนกด การสื่อสารแบบ closed-loop',
    estMinutes: 8,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'อัตราส่วน Compression : Ventilation',
        body: '• ไม่มี advanced airway: 30:2 (1 หรือ 2 ผู้ช่วยเหลือ)\n• มี advanced airway (ETT/SGA/LMA): continuous compressions + 1 breath ทุก 6 วินาที (10/min)\n• ไม่ pause compression เพื่อ ventilate หลังใส่ advanced airway' },
      { type: 'read', heading: 'การสลับคนกด',
        body: '• สลับทุก 2 นาที (หรือเร็วกว่าถ้าเหนื่อย) เพื่อรักษาคุณภาพ\n• สลับให้เร็ว ไม่หยุดเกิน 5 วินาที\n• ใช้จังหวะ "rhythm check" เป็นโอกาสสลับ' },
      { type: 'read', heading: 'Closed-loop communication',
        body: '• Leader สั่งคำสั่งชัดเจน ระบุตัวบุคคล: "คุณ A ขอ epinephrine 1 mg IV"\n• ผู้รับยืนยัน: "รับทราบ epinephrine 1 mg IV"\n• เมื่อทำเสร็จรายงานกลับ: "ให้ epinephrine 1 mg IV แล้ว เวลา 14:32"\n• ลด miscommunication และ documentation ผิด' },
      { type: 'quiz', id: 'bls-4-q1',
        question: 'ในการทำ CPR ผู้ใหญ่ที่ใส่ advanced airway แล้ว ควร ventilate อย่างไร?',
        choices: [
          { id: 'a', text: '30:2 ตามปกติ' },
          { id: 'b', text: '1 ครั้งทุก 6 วินาที (10 ครั้ง/นาที) ร่วมกับ continuous compressions' },
          { id: 'c', text: '1 ครั้งทุก 3 วินาที' },
          { id: 'd', text: 'ไม่ต้อง ventilate' },
        ],
        correctId: 'b',
        explanation: 'หลังใส่ advanced airway: continuous compressions + 1 breath ทุก 6 วินาที ไม่ pause' },
      { type: 'quiz', id: 'bls-4-q2',
        question: 'ควรสลับคนกดหน้าอกบ่อยแค่ไหน?',
        choices: [
          { id: 'a', text: 'ทุก 30 วินาที' },
          { id: 'b', text: 'ทุก 2 นาที หรือเร็วกว่าถ้าเหนื่อย' },
          { id: 'c', text: 'ทุก 10 นาที' },
          { id: 'd', text: 'ไม่ต้องสลับ' },
        ],
        correctId: 'b',
        explanation: 'สลับทุก 2 นาทีเพื่อรักษาคุณภาพการกด เหนื่อยเร็วกว่าที่คิด' },
      { type: 'quiz', id: 'bls-4-q3',
        question: 'Closed-loop communication คืออะไร?',
        choices: [
          { id: 'a', text: 'การสั่งงานต่อกันเป็นทอด ๆ' },
          { id: 'b', text: 'การที่ leader สั่ง → ผู้รับยืนยัน → ทำเสร็จรายงานกลับ' },
          { id: 'c', text: 'การปิดประตูห้องระหว่างทำ CPR' },
          { id: 'd', text: 'การส่งสัญญาณมือ' },
        ],
        correctId: 'b',
        explanation: 'Closed-loop: สั่ง → ยืนยัน → รายงานกลับ ลด error ใน high-stress environment' },
      { type: 'quiz', id: 'bls-4-q4',
        question: 'การหยุดกดหน้าอกเพื่อสลับคนกด ไม่ควรเกินกี่วินาที?',
        choices: [
          { id: 'a', text: '5 วินาที' },
          { id: 'b', text: '10 วินาที' },
          { id: 'c', text: '20 วินาที' },
          { id: 'd', text: '30 วินาที' },
        ],
        correctId: 'a',
        explanation: 'การหยุด > 5 วินาทีจะลด coronary perfusion pressure อย่างมาก กระทบการกลับมาของ ROSC' },
    ],
  },

  // ===================== บทที่ 5 =====================
  {
    id: 'bls-5',
    title: 'บทที่ 5: BLS ในโรงพยาบาล — Defib ใน AED Mode',
    description: 'ในโรงพยาบาลใช้ monitor/defibrillator แทน AED stand-alone — BLS provider ใช้ AED mode เพื่อ shock ได้ทันที',
    estMinutes: 7,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'ทำไม BLS ในโรงพยาบาลต่างจากนอก',
        body: '• นอก รพ.: ใช้ AED stand-alone (เครื่องเล็ก คำสั่งเสียง ทำงาน mode เดียว)\n• ใน รพ.: ใช้ monitor/defibrillator (Philips HeartStart, Zoll R/X, Lifepak 15/20, Mindray) — เครื่องเดียวกันที่ ALS team จะใช้\n• เครื่องในโรงพยาบาลส่วนใหญ่มี 2 modes: AED mode (สำหรับ BLS provider) + Manual mode (สำหรับ ALS)\n• ข้อดี: BLS provider ที่มาถึงก่อน shock ได้ทันที ไม่ต้องรอ ALS team ตีความ rhythm' },
      { type: 'read', heading: 'ขั้นตอนใช้ Defib ใน AED Mode',
        body: '1) เปิดเครื่อง → เลือก AED mode (ปุ่ม / สวิตช์ / เมนู ขึ้นกับรุ่น)\n2) ติด pads — anterolateral (ใต้ไหปลาร้าขวา + ใต้รักแร้ซ้าย) หรือ AP\n3) เครื่องวิเคราะห์ rhythm — ห้ามแตะผู้ป่วย (CPR ต้องหยุด ~5–10 วินาที)\n4) ถ้า "shock advised": เคลียร์คนรอบ → กด shock → CPR ต่อทันที 2 นาที\n5) ถ้า "no shock advised": CPR ต่อ 2 นาที (PEA/asystole)\n6) เครื่องจะวิเคราะห์ซ้ำทุก 2 นาทีอัตโนมัติ' },
      { type: 'read', heading: 'ความแตกต่างจาก AED Stand-alone',
        body: '• Defib + monitor: ใหญ่กว่า มี ECG display + IV port + pacing + sync cardioversion (สำหรับ ALS)\n• AED stand-alone: เล็ก พกพา ทำงาน mode เดียว\n• AED mode บน defib ทำงาน flow เหมือน AED ปกติ — คำสั่งเสียงเหมือนกัน\n• ข้อระวัง: pads ของ defib อาจมีหลายแบบ (peds vs adult) — เช็คก่อนติด' },
      { type: 'read', heading: 'การส่งต่อ BLS → ALS Team',
        body: '• BLS provider เริ่ม AED mode ทันทีเมื่อเครื่องมาถึง — ห้ามรอ ALS\n• เมื่อ ALS team มา: หัวหน้าทีมจะ switch ไป manual mode เพื่ออ่าน rhythm ละเอียดขึ้น, ใช้ sync cardioversion / pacing\n• Hand-off ที่ดี: รายงาน (1) เวลาเริ่ม CPR (2) จำนวน shock + เวลา (3) rhythm ที่เห็น (4) ยาที่ให้ไปแล้ว — ใช้ closed-loop' },
      { type: 'quiz', id: 'bls-5-q1',
        question: 'ทำไมในโรงพยาบาลถึงใช้ defib ที่มี AED mode แทน AED stand-alone?',
        choices: [
          { id: 'a', text: 'AED stand-alone ผิดกฎหมายในโรงพยาบาล' },
          { id: 'b', text: 'เพราะเป็นเครื่องเดียวกันที่ ALS team ใช้ — BLS shock ก่อน ส่งต่อ manual mode ได้เลย' },
          { id: 'c', text: 'AED stand-alone shock แรงกว่า' },
          { id: 'd', text: 'ไม่ต่างกัน เลือกอันไหนก็ได้' },
        ],
        correctId: 'b',
        explanation: 'เครื่องในโรงพยาบาลเป็น defib/monitor ที่มี AED mode สำหรับ BLS + manual mode สำหรับ ALS — ใช้ต่อเนื่องไม่ต้องเปลี่ยนเครื่อง' },
      { type: 'quiz', id: 'bls-5-q2',
        question: 'BLS provider นำ defib มาถึง — ขั้นตอนแรกหลังเปิดเครื่องคืออะไร?',
        choices: [
          { id: 'a', text: 'อ่าน rhythm บนจอแล้วเลือก energy' },
          { id: 'b', text: 'เลือก AED mode แล้วติด pads' },
          { id: 'c', text: 'รอ ALS team มาถึงก่อน' },
          { id: 'd', text: 'ใส่ IV ก่อน' },
        ],
        correctId: 'b',
        explanation: 'BLS provider ใช้ AED mode (ไม่ได้รับการสอนอ่าน rhythm) — เลือก mode → ติด pads → ให้เครื่องวิเคราะห์' },
      { type: 'quiz', id: 'bls-5-q3',
        question: 'หลังเครื่องในโหมด AED แนะนำ "shock advised" และ shock ไปแล้ว ทำอะไรต่อ?',
        choices: [
          { id: 'a', text: 'ตรวจชีพจรทันที' },
          { id: 'b', text: 'รอเครื่องวิเคราะห์ rhythm อีกครั้ง' },
          { id: 'c', text: 'เริ่ม CPR ต่อทันที 2 นาที' },
          { id: 'd', text: 'Switch ไป manual mode ทันที' },
        ],
        correctId: 'c',
        explanation: 'AED mode ใช้ flow เดียวกับ AED ปกติ: หลัง shock → CPR ต่อ 2 นาที ห้ามตรวจชีพจร' },
      { type: 'quiz', id: 'bls-5-q4',
        question: 'ALS team มาถึงระหว่าง code — ควรทำอย่างไรกับเครื่อง defib?',
        choices: [
          { id: 'a', text: 'ถอด pads ออก เปลี่ยนเครื่องใหม่' },
          { id: 'b', text: 'BLS provider continue ใน AED mode ตลอด' },
          { id: 'c', text: 'หัวหน้า ALS switch ไป manual mode + รับ hand-off (เวลา shock, rhythm, ยา)' },
          { id: 'd', text: 'ปิดเครื่องก่อนเปลี่ยน mode' },
        ],
        correctId: 'c',
        explanation: 'ALS team รับ hand-off แล้ว switch manual mode เพื่ออ่าน rhythm + ใช้ sync/pacing — pads เดิม ไม่ต้องถอด' },
    ],
  },

  // ===================== บทที่ 6 =====================
  {
    id: 'bls-6',
    title: 'บทที่ 6: CPR ในทารก (< 1 ปี)',
    description: 'เทคนิคพิเศษสำหรับทารก: 2-finger / 2-thumb encircling, brachial pulse',
    estMinutes: 7,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'การตรวจชีพจรในทารก',
        body: 'ใช้ brachial pulse (ที่ inner upper arm) — carotid ยากในทารก ตรวจไม่เกิน 10 วินาที\nHR < 60 + poor perfusion → start compressions ทันที' },
      { type: 'read', heading: 'เทคนิคการกดหน้าอก',
        body: '• 1 ผู้ช่วยเหลือ: 2-finger technique (2 นิ้วบน sternum ใต้เส้น nipple)\n• 2 ผู้ช่วยเหลือ (HCP): 2-thumb encircling technique (โอบรอบหน้าอก ใช้นิ้วโป้งกด) — ให้ output ดีกว่า\n• ความลึก ~ 4 ซม. หรือ 1/3 ของ AP diameter\n• อัตรา 100–120 ครั้ง/นาที' },
      { type: 'read', heading: 'อัตราส่วน Compression : Ventilation',
        body: '• 1-rescuer: 30:2\n• 2-rescuer (HCP): 15:2\n• AED < 1 ปี: ใช้ manual defibrillator ถ้ามี; ถ้าไม่มีใช้ AED with pediatric attenuator; ถ้าไม่มีใช้ adult AED ได้' },
      { type: 'quiz', id: 'bls-6-q1',
        question: 'ตรวจชีพจรในทารกใช้ตำแหน่งใด?',
        choices: [
          { id: 'a', text: 'Carotid' },
          { id: 'b', text: 'Radial' },
          { id: 'c', text: 'Brachial' },
          { id: 'd', text: 'Femoral หรือ Brachial' },
        ],
        correctId: 'd',
        explanation: 'Brachial pulse เป็นมาตรฐาน, femoral ก็ใช้ได้ — carotid ยากในทารกเพราะคอสั้น' },
      { type: 'quiz', id: 'bls-6-q2',
        question: 'ใน 2-rescuer CPR ของทารก เทคนิคไหนแนะนำ?',
        choices: [
          { id: 'a', text: '1-hand technique' },
          { id: 'b', text: '2-finger technique' },
          { id: 'c', text: '2-thumb encircling technique' },
          { id: 'd', text: 'Heel of hand (เหมือนผู้ใหญ่)' },
        ],
        correctId: 'c',
        explanation: '2-thumb encircling ให้ output และ depth ที่ดีกว่า 2-finger ใน 2-rescuer setting' },
      { type: 'quiz', id: 'bls-6-q3',
        question: 'ความลึกของการกดหน้าอกในทารกคือ?',
        choices: [
          { id: 'a', text: '~2 ซม.' },
          { id: 'b', text: '~4 ซม. หรือ 1/3 ของ AP diameter' },
          { id: 'c', text: '~5–6 ซม.' },
          { id: 'd', text: 'ลึกเท่ากับผู้ใหญ่' },
        ],
        correctId: 'b',
        explanation: 'ทารก: 1/3 ของ AP diameter ~ 4 ซม.' },
      { type: 'quiz', id: 'bls-6-q4',
        question: 'อัตราส่วน compression:ventilation ในทารก 1-rescuer คือ?',
        choices: [
          { id: 'a', text: '5:1' },
          { id: 'b', text: '15:2' },
          { id: 'c', text: '30:2' },
          { id: 'd', text: '10:1' },
        ],
        correctId: 'c',
        explanation: '1-rescuer: 30:2 (ทุกช่วงอายุ); 2-rescuer ในเด็ก/ทารก: 15:2' },
    ],
  },

  // ===================== บทที่ 7 =====================
  {
    id: 'bls-7',
    title: 'บทที่ 7: ทางเดินหายใจอุดกั้น (FBAO)',
    description: 'Foreign Body Airway Obstruction ในผู้ใหญ่ เด็ก ทารก',
    estMinutes: 6,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'การประเมิน FBAO',
        body: 'Mild obstruction: ไอได้ พูดได้ → ให้ไอเอง อย่ารบกวน\nSevere obstruction: ไอไม่ออก, พูดไม่ได้, จับคอ, หน้าเขียว → ต้องช่วยทันที' },
      { type: 'read', heading: 'ผู้ใหญ่ + เด็ก (รู้สึกตัว)',
        body: '• Abdominal thrusts (Heimlich maneuver) ที่เหนือสะดือ ใต้ xiphoid\n• ทำซ้ำจนกว่าสิ่งของจะออก หรือผู้ป่วยหมดสติ\n• ในหญิงตั้งครรภ์ระยะท้าย หรืออ้วนมาก ใช้ chest thrusts แทน' },
      { type: 'read', heading: 'ทารก (รู้สึกตัว)',
        body: '• ห้าม abdominal thrust (เสี่ยง liver injury)\n• Back blows 5 ครั้ง (วางคว่ำหน้าบนแขน หัวต่ำ) สลับกับ chest thrusts 5 ครั้ง (2 นิ้ว ใต้เส้น nipple)\n• ทำซ้ำจนสิ่งของออก' },
      { type: 'read', heading: 'ผู้ป่วยหมดสติ',
        body: '• เริ่ม CPR ทันที (ไม่ตรวจ pulse)\n• ก่อนให้ breath แต่ละครั้ง ดูในปาก ถ้าเห็นสิ่งของให้เอาออก\n• ห้าม blind finger sweep ในเด็ก' },
      { type: 'quiz', id: 'bls-7-q1',
        question: 'ผู้ใหญ่สำลักอาหาร พูดไม่ได้ จับคอ — ทำอะไรก่อน?',
        choices: [
          { id: 'a', text: 'รอให้ไอเอง' },
          { id: 'b', text: 'Abdominal thrusts (Heimlich maneuver)' },
          { id: 'c', text: 'ดื่มน้ำ' },
          { id: 'd', text: 'ฉีดอะดรีนาลีน' },
        ],
        correctId: 'b',
        explanation: 'Severe obstruction → abdominal thrusts จนกว่าจะออกหรือหมดสติ' },
      { type: 'quiz', id: 'bls-7-q2',
        question: 'ทารก (< 1 ปี) สำลัก รู้สึกตัว ทำอะไร?',
        choices: [
          { id: 'a', text: 'Abdominal thrust 5 ครั้ง' },
          { id: 'b', text: 'Back blows 5 ครั้ง สลับ chest thrusts 5 ครั้ง' },
          { id: 'c', text: 'เริ่ม CPR ทันที' },
          { id: 'd', text: 'ฉีดน้ำเข้าจมูก' },
        ],
        correctId: 'b',
        explanation: 'ทารกใช้ back blows + chest thrusts (ห้าม abdominal thrust เสี่ยง liver injury)' },
      { type: 'quiz', id: 'bls-7-q3',
        question: 'หญิงตั้งครรภ์ไตรมาส 3 สำลัก พูดไม่ได้ ควรทำอะไร?',
        choices: [
          { id: 'a', text: 'Abdominal thrusts ตามปกติ' },
          { id: 'b', text: 'Chest thrusts แทน abdominal thrusts' },
          { id: 'c', text: 'Back blows อย่างเดียว' },
          { id: 'd', text: 'ทำ CPR เลย' },
        ],
        correctId: 'b',
        explanation: 'ครรภ์แก่ / อ้วนมาก: chest thrusts แทน abdominal เพื่อไม่กระทบมดลูก' },
      { type: 'quiz', id: 'bls-7-q4',
        question: 'ผู้ป่วย FBAO หมดสติแล้ว ทำอะไรต่อ?',
        choices: [
          { id: 'a', text: 'Abdominal thrusts ต่อ' },
          { id: 'b', text: 'เริ่ม CPR ทันที และดูในปากก่อนแต่ละ breath' },
          { id: 'c', text: 'รอ EMS' },
          { id: 'd', text: 'ทำ blind finger sweep' },
        ],
        correctId: 'b',
        explanation: 'หมดสติ → เริ่ม CPR; ดูในปากก่อนแต่ละ breath ถ้าเห็นสิ่งของเอาออก ห้าม blind finger sweep' },
    ],
  },

];

function deriveLesson(l) {
  const sections = l.steps.filter(s => s.type === 'read').map(s => ({ heading: s.heading, body: s.body }));
  const quiz = l.steps.filter(s => s.type === 'quiz').map(s => ({
    id: s.id,
    question: s.question,
    choices: s.choices,
    correctId: s.correctId,
    explanation: s.explanation,
  }));
  return { ...l, sections, quiz, videos: lessonVideos[l.id] ?? [] };
}

export const preCourseLessons = lessonDefs.map(deriveLesson);

export function findLessonById(id) {
  return preCourseLessons.find(l => l.id === id) || null;
}

export function getLessonStepCount(lesson) {
  return lesson?.steps?.length ?? 0;
}

export function getLessonQuizCount(lesson) {
  return lesson?.quiz?.length ?? 0;
}
