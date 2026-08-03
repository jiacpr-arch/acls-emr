// IV/IO decision-game scenarios — one continuous case per stage, built on the
// shared engine in src/courses/shared/scenarioEngine.js. Facts/traps
// paraphrased from the vetted lesson content in ./lessons.js — should still
// be sanity-checked by the course instructor before production use.

import { createScenarioEngine } from '../shared/scenarioEngine';

export const DEFAULT_TIME_LIMIT_SEC = 20;

const stages = [
  {
    id: 'iv-stage-1', chapterId: 'iv-1', stageNumber: 1,
    title: 'Peripheral IV ในภาวะวิกฤต', subtitle: 'บทที่ 1 · ผู้ป่วย trauma เสียเลือด',
    emoji: '💉', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยชายอายุ 28 ปี อุบัติเหตุรถจักรยานยนต์ มีแผลฉีกขาดที่ขา เสียเลือดมาก ความดันเริ่มต่ำ',
        question: 'ควรเลือกขนาดสาย IV เท่าไร?',
        options: [
          { label: '14–16G (large-bore)', correct: true, feedback: 'ถูกต้อง — ต้องการให้เลือด/สารน้ำปริมาณมากเร็ว ควรเปิดขนาดใหญ่ที่สุดที่เป็นไปได้' },
          { label: '22G เพราะเจ็บน้อยกว่า', correct: false, feedback: 'ขนาดเล็กเกินไปสำหรับการให้เลือด/สารน้ำปริมาณมากเร็ว', trap: true },
          { label: 'ไม่ต้องเปิด IV เลย', correct: false, feedback: 'ผู้ป่วยเสียเลือดมากต้องการ IV Access ด่วน' },
          { label: 'ใช้เข็มฉีดยาธรรมดาแทนสาย IV', correct: false, feedback: 'ต้องใช้ IV catheter ที่ต่อสารน้ำได้ต่อเนื่อง' },
        ] },
      { situation: 'คุณเลือก antecubital fossa เป็นตำแหน่งแทง',
        question: 'ทำไมจึงเลือกตำแหน่งนี้เป็นอันดับแรก?',
        options: [
          { label: 'เส้นใหญ่ ใส่ง่าย ให้ยา/สารน้ำไหลเร็ว', correct: true, feedback: 'ถูกต้อง — เป็นตำแหน่งแรกที่เลือกในภาวะฉุกเฉิน' },
          { label: 'เพราะใกล้หัวใจที่สุดในร่างกาย', correct: false, feedback: 'ไม่ใช่เหตุผลหลัก เหตุผลคือเส้นใหญ่และใส่ง่าย', trap: true },
          { label: 'เพราะเจ็บน้อยที่สุดเสมอ', correct: false, feedback: 'ไม่ใช่เกณฑ์หลักในการเลือกตำแหน่ง' },
          { label: 'ไม่มีเหตุผลพิเศษ สุ่มเลือก', correct: false, feedback: 'มีเหตุผลทางคลินิกชัดเจน' },
        ] },
      { situation: '10 นาทีต่อมา บริเวณรอบจุดแทง IV เริ่มบวมและเย็น ขณะให้สารน้ำ',
        question: 'สิ่งนี้บ่งบอกภาวะแทรกซ้อนใด และควรทำอย่างไร?',
        options: [
          { label: 'Infiltration — หยุดให้สารน้ำทางสายนี้และเปิดเส้นใหม่', correct: true, feedback: 'ถูกต้อง — สายเลื่อนหลุดจากเส้นเลือด ต้องเปิดเส้นใหม่' },
          { label: 'ปกติดี ให้สารน้ำต่อไปตามเดิม', correct: false, feedback: 'บวม/เย็นบ่งบอก infiltration ต้องหยุดใช้สายนี้', trap: true },
          { label: 'เพิ่มอัตราการให้สารน้ำให้เร็วขึ้น', correct: false, feedback: 'จะทำให้สารน้ำเข้าเนื้อเยื่อมากขึ้น' },
          { label: 'รอดูอาการอีก 30 นาที', correct: false, feedback: 'ควรแก้ไขทันที ไม่ควรรอ' },
        ] },
    ],
  },
  {
    id: 'iv-stage-2', chapterId: 'iv-2', stageNumber: 2,
    title: 'IO Access', subtitle: 'บทที่ 2 · เปิด IV ไม่สำเร็จ',
    emoji: '🦴', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วย cardiac arrest ทีมพยายามเปิด peripheral IV มา 90 วินาทีแล้วยังไม่สำเร็จ',
        question: 'ควรทำอย่างไรต่อ?',
        options: [
          { label: 'เปลี่ยนไปใช้ IO ทันที', correct: true, feedback: 'ถูกต้อง — ไม่ควรเสียเวลานานเกินไปกับ IV ที่ยาก' },
          { label: 'พยายาม IV ต่อไปเรื่อย ๆ', correct: false, feedback: 'เสียเวลาให้ยาที่จำเป็นล่าช้าออกไป', trap: true },
          { label: 'หยุดให้ยาไปเลย', correct: false, feedback: 'ยังต้องหาทางให้ยาต่อไป เพียงแต่เปลี่ยนเส้นทาง' },
          { label: 'ให้ยาทาง ETT แทน', correct: false, feedback: 'ปัจจุบันไม่แนะนำ route ทาง ETT แล้ว' },
        ] },
      { situation: 'คุณเลือกตำแหน่ง proximal tibia และเริ่มใส่เข็ม IO ด้วย driver',
        question: 'สัญญาณใดบ่งบอกว่าเข็มถึงโพรงไขกระดูกแล้ว?',
        options: [
          { label: 'รู้สึก "pop" หรือแรงต้านลดลงกะทันหัน', correct: true, feedback: 'ถูกต้อง — สัญญาณบ่งบอกว่าทะลุ cortex เข้าโพรงไขกระดูกแล้ว' },
          { label: 'ผู้ป่วยหยุดปวดทันที', correct: false, feedback: 'ไม่ใช่สัญญาณที่เชื่อถือได้ในผู้ป่วยไม่รู้สึกตัว', trap: true },
          { label: 'ผิวหนังเปลี่ยนสี', correct: false, feedback: 'ไม่ใช่สัญญาณที่บ่งบอกตำแหน่งเข็ม' },
          { label: 'ไม่มีสัญญาณใดบอกได้', correct: false, feedback: 'มีสัญญาณทางกายภาพชัดเจนที่สังเกตได้' },
        ] },
      { situation: 'คุณตรวจดูประวัติผู้ป่วยพบว่าเพิ่งใส่ IO ที่ tibia ข้างเดียวกันเมื่อ 12 ชั่วโมงก่อน',
        question: 'ควรทำอย่างไร?',
        options: [
          { label: 'เลี่ยงไปใส่ที่ตำแหน่งอื่นหรือกระดูกอื่น (เช่น proximal humerus หรือ tibia อีกข้าง)', correct: true, feedback: 'ถูกต้อง — ห้ามใส่ซ้ำที่กระดูกเดียวกันภายใน 24–48 ชั่วโมง เสี่ยงยารั่วออกจากรูเดิม' },
          { label: 'ใส่ที่ตำแหน่งเดิมได้เลยไม่มีปัญหา', correct: false, feedback: 'เสี่ยงยารั่วออกจากรูเดิมที่ยังไม่ปิดสนิท', trap: true },
          { label: 'ไม่ใส่ IO เลย รอ IV อย่างเดียว', correct: false, feedback: 'ยังมีตำแหน่ง/กระดูกอื่นที่ใช้ได้' },
          { label: 'ใส่ที่ตำแหน่งเดิมแต่ลึกกว่าเดิม', correct: false, feedback: 'ไม่แก้ปัญหารูเดิมที่ยังไม่ปิด' },
        ] },
    ],
  },
  {
    id: 'iv-stage-3', chapterId: 'iv-3', stageNumber: 3,
    title: 'การให้ยาระหว่าง CPR', subtitle: 'บทที่ 3 · ทีมช่วยชีวิตให้ epinephrine',
    emoji: '💊', passScore: 80,
    steps: [
      { situation: 'แพทย์สั่งให้ epinephrine ทาง IV ระหว่างที่ทีมกำลังกดหน้าอกต่อเนื่อง',
        question: 'ควรให้ยาอย่างไร?',
        options: [
          { label: 'ฉีด bolus แล้วตามด้วย flush ทันที โดยไม่หยุดกดหน้าอก', correct: true, feedback: 'ถูกต้อง — ผู้ช่วยเหลือแยกคนฉีดยาระหว่างอีกคนกดหน้าอกต่อเนื่อง' },
          { label: 'หยุดกดหน้าอกก่อนแล้วค่อยฉีดยา', correct: false, feedback: 'การให้ยาไม่จำเป็นต้องหยุดกดหน้าอก ต่างจาก rhythm check', trap: true },
          { label: 'หยดยาช้า ๆ ตลอด 5 นาที', correct: false, feedback: 'ควรให้แบบ bolus เพื่อให้ออกฤทธิ์เร็วที่สุด' },
          { label: 'รอให้ CPR จบรอบก่อนจึงให้ยา', correct: false, feedback: 'ควรให้ยาทันทีโดยไม่รบกวนการกดหน้าอก' },
        ] },
      { situation: 'หลังฉีด epinephrine แล้ว คุณกำลังจะ flush',
        question: 'ควร flush ด้วยอะไรและปริมาณเท่าไร?',
        options: [
          { label: 'Normal saline ประมาณ 20 mL', correct: true, feedback: 'ถูกต้อง — เป็นปริมาณมาตรฐานในผู้ใหญ่' },
          { label: 'น้ำเปล่า 5 mL', correct: false, feedback: 'ต้องใช้ normal saline ปริมาณมาตรฐาน ไม่ใช่น้ำเปล่า', trap: true },
          { label: 'ไม่ต้อง flush เลย', correct: false, feedback: 'การ flush จำเป็นเพื่อดันยาเข้าสู่ระบบไหลเวียนกลาง' },
          { label: 'เลือด 20 mL', correct: false, feedback: 'ใช้ normal saline ไม่ใช่เลือด' },
        ] },
      { situation: 'พยาบาลอีกคนเสนอให้ยกแขนข้างที่ให้ยาขึ้นหลัง flush',
        question: 'ควรทำตามหรือไม่ และทำไม?',
        options: [
          { label: 'ควรทำ — ยกแขนสูงกว่าหัวใจ 10–20 วินาที ช่วยให้ยาไหลเข้าระบบไหลเวียนกลางเร็วขึ้น', correct: true, feedback: 'ถูกต้อง — ใช้ได้เฉพาะ peripheral IV ที่แขน' },
          { label: 'ไม่ควร ไม่มีประโยชน์ใด', correct: false, feedback: 'การยกแขนช่วยเสริมด้วยแรงโน้มถ่วงจริง มีหลักฐานสนับสนุน', trap: true },
          { label: 'ควรยกขาแทนแขน', correct: false, feedback: 'ยกแขนข้างที่ให้ยา ไม่ใช่ขา' },
          { label: 'ต้องยกแขนค้างไว้ตลอดการช่วยชีวิต', correct: false, feedback: 'ยกเพียง 10–20 วินาทีหลัง flush เท่านั้น' },
        ] },
    ],
  },
  {
    id: 'iv-stage-4', chapterId: 'iv-4', stageNumber: 4,
    title: 'Route ที่ให้ยาได้', subtitle: 'บทที่ 4 · เลือก route ให้ถูกต้อง',
    emoji: '🧪', passScore: 80,
    steps: [
      { situation: 'ทีมกำลังถกเถียงว่าจะให้ epinephrine ทาง IO ได้หรือไม่ เพราะเพิ่งใส่ IO แทน IV ที่ไม่สำเร็จ',
        question: 'คำตอบที่ถูกต้องคือ?',
        options: [
          { label: 'ให้ได้ — ยาที่ให้ IV ได้เกือบทั้งหมดให้ IO ได้เช่นกัน', correct: true, feedback: 'ถูกต้อง — IO เข้าสู่ระบบไหลเวียนกลางโดยตรง ดูดซึมใกล้เคียง IV' },
          { label: 'ให้ไม่ได้ ต้องรอ IV เท่านั้น', correct: false, feedback: 'IO เป็นเส้นทางที่ให้ยาได้เทียบเท่า IV ในสถานการณ์ฉุกเฉิน', trap: true },
          { label: 'ให้ได้เฉพาะยาแก้ปวดเท่านั้น', correct: false, feedback: 'ให้ได้เกือบทุกชนิดที่ใช้ระหว่าง CPR' },
          { label: 'ต้องลดขนาดยาลงครึ่งหนึ่งเมื่อให้ทาง IO', correct: false, feedback: 'โดยทั่วไปใช้ขนาดเดียวกับ IV ตามคำสั่งแพทย์' },
        ] },
      { situation: 'สมาชิกทีมใหม่เสนอให้ยาผ่านท่อ ETT ที่ใส่ไว้แล้ว เพราะเคยเรียนมาแบบนั้น',
        question: 'ควรตอบสนองอย่างไร?',
        options: [
          { label: 'อธิบายว่าปัจจุบันไม่แนะนำ route ทาง ETT แล้ว เพราะดูดซึมคาดเดาไม่ได้', correct: true, feedback: 'ถูกต้อง — ควรใช้ IV/IO เป็นหลักเสมอ' },
          { label: 'เห็นด้วยและให้ยาทาง ETT ทันที', correct: false, feedback: 'แนวทางปัจจุบันไม่แนะนำวิธีนี้แล้ว', trap: true },
          { label: 'ไม่ตอบอะไร ปล่อยให้ทำไปตามที่เสนอ', correct: false, feedback: 'ควรแก้ไขให้ถูกต้องเพื่อความปลอดภัยผู้ป่วย' },
          { label: 'บอกว่า ETT ให้ยาไม่ได้เลยทุกกรณี', correct: false, feedback: 'ในอดีตทำได้แต่ปัจจุบันไม่แนะนำเพราะผลไม่แน่นอน ไม่ใช่ว่าทำไม่ได้เลยทางเทคนิค' },
        ] },
      { situation: 'ผู้ป่วยอีกรายในห้องฉุกเฉินมีปฏิกิริยาแพ้รุนแรง (anaphylaxis) แต่ยังไม่มี IV',
        question: 'เส้นทางใดเหมาะกับการให้ epinephrine เร่งด่วนในบริบทนี้ (ไม่ใช่ cardiac arrest)?',
        options: [
          { label: 'Intramuscular (IM) เป็นทางเลือกที่เหมาะสมสำหรับ anaphylaxis', correct: true, feedback: 'ถูกต้อง — แม้ IM ไม่เหมาะกับ cardiac arrest แต่เหมาะกับ anaphylaxis ที่ยังไม่มี IV เพราะให้ได้เร็วกว่าการเสียเวลาเปิด IV' },
          { label: 'Oral เท่านั้น', correct: false, feedback: 'ดูดซึมช้าเกินไปสำหรับ anaphylaxis', trap: true },
          { label: 'ต้องรอเปิด IV ก่อนเท่านั้น ห้ามใช้ทางอื่น', correct: false, feedback: 'IM epinephrine เป็นมาตรฐานการรักษาแรกสำหรับ anaphylaxis โดยไม่ต้องรอ IV' },
          { label: 'ไม่มีทางเลือกใดที่เหมาะสม', correct: false, feedback: 'IM เป็นทางเลือกที่เหมาะสมและใช้กันเป็นมาตรฐาน' },
        ] },
    ],
  },
  {
    id: 'iv-stage-5', chapterId: 'iv-5', stageNumber: 5,
    title: 'สารน้ำและ Hypovolemic Shock', subtitle: 'บทที่ 5 · ผู้ป่วยเลือดออกในทางเดินอาหาร',
    emoji: '🩸', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยหญิง 55 ปี อาเจียนเป็นเลือดปริมาณมาก ความดัน 78/50 ชีพจรเบาเร็ว 128/min ทีมเพิ่งเปิด IV 16G สำเร็จที่แขนซ้าย',
        question: 'ควรเริ่มให้สารน้ำชนิดใดก่อนระหว่างรอเลือด?',
        options: [
          { label: 'Balanced crystalloid (เช่น Lactated Ringer\'s) หรือ Normal saline', correct: true, feedback: 'ถูกต้อง — crystalloid เป็นสารน้ำแรกที่ให้ได้ทันทีระหว่างเตรียม blood products' },
          { label: 'น้ำเปล่าทาง IV', correct: false, feedback: 'น้ำเปล่าไม่ isotonic ทำให้เม็ดเลือดแดงแตกได้ ห้ามให้ทาง IV', trap: true },
          { label: 'สารน้ำที่มีน้ำตาลเข้มข้นสูง (D50)', correct: false, feedback: 'ใช้รักษาภาวะน้ำตาลต่ำ ไม่ใช่สารน้ำสำหรับ resuscitation' },
          { label: 'ไม่ต้องให้สารน้ำใด ๆ รอเลือดอย่างเดียว', correct: false, feedback: 'ควรเริ่ม crystalloid ทันทีระหว่างรอเลือด ไม่ควรปล่อยให้ shock แย่ลง' },
        ] },
      { situation: 'ให้ crystalloid ไปแล้ว 1 ลิตร ความดันยังต่ำอยู่ที่ 82/55 ทีมกำลังพิจารณาเปิดสายเพิ่ม',
        question: 'ทำไมจึงควรเปิดสาย IV ขนาดใหญ่เส้นที่สอง แทนที่จะเร่งอัตราไหลของเส้นเดิมอย่างเดียว?',
        options: [
          { label: 'สองสายให้อัตราการไหลรวมสูงกว่าสายเดียว และสำรองเส้นทางไว้กรณีสายแรกมีปัญหา', correct: true, feedback: 'ถูกต้อง — เลือดออกรุนแรงต้องการอัตราไหลสูงสุดและมีเส้นสำรอง' },
          { label: 'ไม่มีประโยชน์ สายเดียวก็เพียงพอเสมอ', correct: false, feedback: 'ในเลือดออกรุนแรง สายเดียวอาจให้สารน้ำ/เลือดได้ไม่เร็วพอ', trap: true },
          { label: 'เพื่อให้ผู้ป่วยเจ็บมากขึ้นโดยเจตนา', correct: false, feedback: 'ไม่ใช่เหตุผลทางคลินิก' },
          { label: 'เพราะสายเดิมต้องถอดออกเสมอหลังใช้ 1 ลิตร', correct: false, feedback: 'ไม่มีกฎเช่นนี้ สายเดิมยังใช้ต่อได้ถ้าทำงานปกติ' },
        ] },
      { situation: 'ผลตรวจยืนยันเลือดออกในทางเดินอาหารส่วนบนรุนแรง เลือดที่จองไว้มาถึงห้องฉุกเฉินแล้ว',
        question: 'เมื่อเลือดออกรุนแรงเช่นนี้ ควรให้ความสำคัญกับอะไรมากกว่าการให้ crystalloid ปริมาณมากต่อไปเรื่อย ๆ?',
        options: [
          { label: 'ให้เลือด/ส่วนประกอบของเลือดโดยเร็ว แทนการทุ่ม crystalloid ปริมาณมาก', correct: true, feedback: 'ถูกต้อง — hemorrhagic shock ต้องการเลือดทดแทนเลือดที่เสียไป การให้ crystalloid มากเกินไปยังเจือจางความสามารถในการนำออกซิเจนและปัจจัยการแข็งตัวของเลือด' },
          { label: 'ให้ crystalloid ปริมาณมากต่อไปโดยไม่ต้องให้เลือดเลย', correct: false, feedback: 'crystalloid ปริมาณมากเกินไปเจือจางเลือดและปัจจัยการแข็งตัว ไม่ทดแทนความสามารถนำออกซิเจน', trap: true },
          { label: 'หยุดให้สารน้ำทั้งหมดทันที', correct: false, feedback: 'ยังต้องรักษาการไหลเวียนต่อเนื่อง เพียงแต่เปลี่ยนมาเน้นเลือด' },
          { label: 'รอผลตรวจเพิ่มเติมก่อนโดยไม่ให้อะไรเลย', correct: false, feedback: 'ควรให้เลือดทันทีเมื่อพร้อม ไม่ควรรอโดยไม่จำเป็น' },
        ] },
    ],
  },
];

const engine = createScenarioEngine(stages, {
  progressKeyPrefix: 'iv_scenario_progress_',
  finalExamTitle: 'ข้อสอบรวม — ทบทวนทุกเคส IV/IO',
});

export const scenarios = stages;
export const {
  FINAL_EXAM_ID, buildFinalExam, getStageById, getStageProgress,
  saveStageProgress, isFinalExamUnlocked, getScenarioGameStatus,
} = engine;
