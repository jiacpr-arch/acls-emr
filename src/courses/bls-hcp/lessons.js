// BLS for Healthcare Providers — pre-course lessons (AHA BLS-HCP 2020, ผสม TRC notes)
// Same step-based schema as src/data/preCourseContent.js so the existing LessonReader engine works as-is.
//
// NOTE: เนื้อหาในไฟล์นี้เป็นโครงเริ่มต้น (placeholder + บทแรกที่ใส่เนื้อหาตัวอย่าง)
// จะต้องผ่านการ review โดยแพทย์ EM/ICU ก่อนปล่อย production
// ระวังลิขสิทธิ์ AHA — paraphrase เท่านั้น ห้าม quote algorithm table ตรง ๆ

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
        body: 'Basic Life Support (BLS) คือชุดทักษะพื้นฐานในการช่วยชีวิตที่บุคลากรทางการแพทย์ทุกคนต้องทำได้: จดจำภาวะหัวใจหยุดเต้น → เรียกขอความช่วยเหลือ → กดหน้าอกคุณภาพสูง → ใช้ AED เร็วที่สุด' },
      { type: 'read', heading: 'Chain of Survival — OHCA (นอก รพ.)',
        body: '1) จดจำเหตุและเรียก EMS ทันที (ใช้ speakerphone)\n2) CPR คุณภาพสูง โดยเน้นกดหน้าอก\n3) Defibrillation รวดเร็วด้วย AED\n4) Advanced resuscitation (EMS / ER)\n5) Post-cardiac arrest care\n6) Recovery (กายภาพ + จิตใจ + สังคม)' },
      { type: 'read', heading: 'Chain of Survival — IHCA (ใน รพ.)',
        body: '1) Early recognition + activate code blue/RRT\n2) CPR คุณภาพสูง\n3) Defibrillation\n4) Advanced resuscitation\n5) Post-cardiac arrest care\n6) Recovery' },
      { type: 'quiz', id: 'bls-1-q1',
        question: 'พบผู้ป่วยหมดสติ ไม่ตอบสนอง ใน ward — ขั้นตอนแรกที่ควรทำคืออะไร?',
        choices: [
          { id: 'a', text: 'เริ่มกดหน้าอกทันที' },
          { id: 'b', text: 'ตรวจชีพจรนาน 30 วินาที' },
          { id: 'c', text: 'เรียก code blue / RRT พร้อมขอ defibrillator' },
          { id: 'd', text: 'ไปตามแพทย์เวร' },
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
        explanation: 'OHCA = ผู้ป่วยนอกโรงพยาบาล เริ่มจากการเรียก EMS (1669 ในไทย); IHCA = ในโรงพยาบาล เรียก code blue / RRT ภายใน' },
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
        body: '1) อัตรา 100–120 ครั้ง/นาที\n2) ความลึก 5–6 ซม. (อย่างน้อย 1/3 ของ AP diameter)\n3) ปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil)\n4) ลดการหยุดกดหน้าอกให้น้อยที่สุด (CCF > 60%)\n5) ห้าม over-ventilation (10 ครั้ง/นาที หาก advanced airway)' },
      { type: 'read', heading: 'ตำแหน่งและท่าทาง',
        body: '• วางส้นมือบนกลางหน้าอก ครึ่งล่างของกระดูก sternum\n• ประสานมือทั้งสอง แขนเหยียดตรง ใช้น้ำหนักตัวกด\n• ผู้ป่วยควรอยู่บนพื้นแข็ง (backboard ถ้าอยู่บนเตียง)' },
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
        explanation: '5–6 ซม. หรืออย่างน้อย 1/3 ของ AP diameter หน้าอก กดตื้นเกินไป output ไม่พอ; กดลึกเกินเสี่ยงต่อ rib fracture' },
      { type: 'quiz', id: 'bls-2-q3',
        question: 'Chest Compression Fraction (CCF) ที่แนะนำคืออย่างน้อยเท่าไร?',
        choices: [
          { id: 'a', text: '40%' },
          { id: 'b', text: '60%' },
          { id: 'c', text: '80%' },
          { id: 'd', text: '100%' },
        ],
        correctId: 'b',
        explanation: 'CCF ≥ 60% (เป้าหมาย 80% ใน AHA) — เวลาที่กดหน้าอกจริงเทียบกับเวลารวมของ resuscitation' },
    ],
  },

  // ===================== บทที่ 3–8 — placeholder =====================
  // TODO (PR3): เติมเนื้อหา บทที่ 3 AED, บทที่ 4 2-rescuer + team dynamics,
  // บทที่ 5 CPR เด็ก, บทที่ 6 CPR ทารก, บทที่ 7 FBAO, บทที่ 8 Opioid emergency
  // ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อน merge production
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
  return { ...l, sections, quiz };
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
