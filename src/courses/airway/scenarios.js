// Airway decision-game scenarios — one continuous case per stage, mirroring
// the pattern in src/data/blsScenarios.js but built on the shared engine in
// src/courses/shared/scenarioEngine.js. Facts/traps paraphrased from the
// vetted lesson content in ./lessons.js — should still be sanity-checked by
// the course instructor before production use.

import { createScenarioEngine } from '../shared/scenarioEngine';

export const DEFAULT_TIME_LIMIT_SEC = 20;

const stages = [
  {
    id: 'aw-stage-1', chapterId: 'aw-1', stageNumber: 1,
    title: 'ประเมินและเปิดทางเดินหายใจ', subtitle: 'บทที่ 1 · ผู้ป่วยหมดสติใน ward',
    emoji: '🫁', passScore: 80,
    steps: [
      { situation: 'คุณพบผู้ป่วยชายวัย 55 ปีนอนหมดสติบนพื้น เรียกไม่ตอบสนอง ไม่มีประวัติอุบัติเหตุ',
        question: 'ท่าเปิดทางเดินหายใจแรกที่ควรใช้คือท่าใด?',
        options: [
          { label: 'Head-tilt/chin-lift', correct: true, feedback: 'ถูกต้อง — ไม่สงสัย trauma จึงใช้ท่ามาตรฐานนี้ได้เลย' },
          { label: 'Jaw-thrust เท่านั้น', correct: false, feedback: 'Jaw-thrust สงวนไว้สำหรับกรณีสงสัยบาดเจ็บกระดูกสันหลังส่วนคอ', trap: true },
          { label: 'Trendelenburg position', correct: false, feedback: 'ไม่ใช่ท่าเปิดทางเดินหายใจ' },
          { label: 'จับนั่งตัวตรงทันที', correct: false, feedback: 'ผู้ป่วยหมดสติไม่ควรจับนั่ง' },
        ] },
      { situation: 'คุณได้ยินเสียง snoring ดังเวลาผู้ป่วยหายใจ',
        question: 'เสียงนี้บ่งบอกสาเหตุอุดกั้นจากอะไรมากที่สุด?',
        options: [
          { label: 'ลิ้นตกไปติดผนังคอหลัง', correct: true, feedback: 'ถูกต้อง — snoring/gurgling มักเกิดจากลิ้นหย่อนตัวหรือสิ่งคัดหลั่ง' },
          { label: 'หลอดลมฝอยตีบ (asthma)', correct: false, feedback: 'อาการนั้นจะได้ยิน wheeze ไม่ใช่ snoring', trap: true },
          { label: 'กล่องเสียงบวม', correct: false, feedback: 'จะได้ยิน stridor แทน' },
          { label: 'ไม่มีความหมายพิเศษ', correct: false, feedback: 'เสียง snoring มีความหมายทางคลินิกชัดเจน' },
        ] },
      { situation: 'มีเสมหะปนเลือดในปากผู้ป่วยที่มองเห็นได้ชัด',
        question: 'ควรดูดสิ่งคัดหลั่งด้วยวิธีใดและนานเท่าไร?',
        options: [
          { label: 'Rigid suction (Yankauer) ไม่เกิน 10–15 วินาทีต่อครั้ง', correct: true, feedback: 'ถูกต้อง — ใช้ในช่องปากที่มองเห็นโดยตรง และจำกัดเวลาเพื่อลด hypoxia' },
          { label: 'ดูดต่อเนื่องจนแน่ใจว่าสะอาดหมด', correct: false, feedback: 'ดูดนานเกินไปเสี่ยง hypoxia', trap: true },
          { label: 'ไม่ต้องดูด รอให้ไหลออกเอง', correct: false, feedback: 'สิ่งคัดหลั่งที่มองเห็นควรดูดออกก่อนช่วยหายใจ' },
          { label: 'ใช้ soft catheter ผ่านจมูกแทน', correct: false, feedback: 'สิ่งคัดหลั่งในช่องปากที่มองเห็นชัด ใช้ rigid tip เหมาะกว่า' },
        ] },
    ],
  },
  {
    id: 'aw-stage-2', chapterId: 'aw-2', stageNumber: 2,
    title: 'OPA / NPA', subtitle: 'บทที่ 2 · เลือกอุปกรณ์ให้เหมาะกับผู้ป่วย',
    emoji: '🧰', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยหมดสติสนิท ไม่มี gag reflex คุณเปิดทางเดินหายใจแล้วแต่ยังมีเสียง snoring',
        question: 'ควรใช้อุปกรณ์ใดช่วยคงทางเดินหายใจ?',
        options: [
          { label: 'OPA — วัดจากมุมปากถึงมุมกราม', correct: true, feedback: 'ถูกต้อง — OPA เหมาะกับผู้ป่วยหมดสติสนิทไม่มี gag reflex' },
          { label: 'NPA เท่านั้น เพราะปลอดภัยกว่าเสมอ', correct: false, feedback: 'ทั้งสองใช้ได้ในเคสนี้ แต่ OPA เป็นตัวเลือกมาตรฐานเมื่อไม่มี gag reflex', trap: true },
          { label: 'ไม่ต้องใช้อุปกรณ์ใด ๆ', correct: false, feedback: 'ยังมีเสียงอุดกั้นอยู่ ควรใช้อุปกรณ์ช่วย' },
          { label: 'ใส่ ETT ทันทีโดยไม่ประเมินก่อน', correct: false, feedback: 'ข้ามขั้นตอนพื้นฐานไปมากเกินไป' },
        ] },
      { situation: 'อีกเคสหนึ่ง ผู้ป่วยกึ่งรู้สึกตัว ยังมี gag reflex อยู่บ้างเมื่อกระตุ้น',
        question: 'อุปกรณ์ทางกลใดเหมาะสมกว่า?',
        options: [
          { label: 'NPA', correct: true, feedback: 'ถูกต้อง — NPA ทนต่อ gag reflex ได้ดีกว่า OPA' },
          { label: 'OPA', correct: false, feedback: 'OPA จะกระตุ้นอาเจียนถ้ายังมี gag reflex', trap: true },
          { label: 'ไม่ใช้อุปกรณ์ใดเลย', correct: false, feedback: 'ยังมีความจำเป็นต้องช่วยคงทางเดินหายใจ' },
          { label: 'i-gel ทันที', correct: false, feedback: 'ยังไม่ถึงขั้นต้องใช้ advanced airway ในสถานการณ์นี้' },
        ] },
      { situation: 'ผู้ป่วยรายเดิมมีเลือดไหลจากหูและตาช้ำรอบดวงตาทั้งสองข้าง (raccoon eyes)',
        question: 'ควรทำอย่างไรกับแผน NPA ที่วางไว้?',
        options: [
          { label: 'งดใช้ NPA เพราะสงสัยกระดูกฐานกะโหลกหัก', correct: true, feedback: 'ถูกต้อง — สัญญาณเหล่านี้บ่งบอก basilar skull fracture ซึ่ง NPA เสี่ยงทะลุเข้ากะโหลกศีรษะ' },
          { label: 'ใส่ NPA ตามแผนเดิม', correct: false, feedback: 'อันตราย — เข้าข่ายข้อห้ามชัดเจน', trap: true },
          { label: 'ใส่ NPA ทั้งสองรูจมูกเพื่อความมั่นใจ', correct: false, feedback: 'ยิ่งเพิ่มความเสี่ยง' },
          { label: 'ไม่เกี่ยวข้องกับการเลือกอุปกรณ์', correct: false, feedback: 'เกี่ยวข้องโดยตรง เป็นข้อห้ามสำคัญ' },
        ] },
    ],
  },
  {
    id: 'aw-stage-3', chapterId: 'aw-3', stageNumber: 3,
    title: 'Bag-Mask Ventilation', subtitle: 'บทที่ 3 · ช่วยหายใจด้วย BVM',
    emoji: '👝', passScore: 80,
    steps: [
      { situation: 'คุณเตรียม BVM ช่วยหายใจผู้ป่วยหยุดหายใจ มี O₂ ต่อพร้อม reservoir',
        question: 'ควรตั้ง O₂ flow เท่าไรเพื่อให้ได้ FiO₂ สูงสุด?',
        options: [
          { label: '10–15 L/min (high-flow)', correct: true, feedback: 'ถูกต้อง — high-flow ต่อ reservoir ให้ FiO₂ ใกล้ 100%' },
          { label: '2 L/min', correct: false, feedback: 'ต่ำเกินไปสำหรับสถานการณ์ฉุกเฉิน', trap: true },
          { label: 'ไม่ต้องต่อ O₂', correct: false, feedback: 'ควรต่อ O₂ high-flow เสมอถ้ามีอุปกรณ์' },
          { label: '1 L/min ผ่าน nasal cannula แทน', correct: false, feedback: 'ไม่เพียงพอสำหรับผู้ป่วยหยุดหายใจ' },
        ] },
      { situation: 'คุณบีบมือเดียวด้วย EC-clamp แต่หน้าอกผู้ป่วยไม่ยกและได้ยินลมรั่วรอบหน้ากาก',
        question: 'ควรทำอย่างไรต่อทันที?',
        options: [
          { label: 'เปลี่ยนเป็นเทคนิค 2 คน (double EC-clamp + บีบ)', correct: true, feedback: 'ถูกต้อง — ปรับทันทีเมื่อ seal ไม่ดี ไม่ต้องรอ' },
          { label: 'บีบแรงขึ้นด้วยมือเดิม', correct: false, feedback: 'ไม่แก้ปัญหา seal และเสี่ยง gastric inflation', trap: true },
          { label: 'หยุดช่วยหายใจไปเลย', correct: false, feedback: 'ผู้ป่วยยังต้องการการช่วยหายใจ' },
          { label: 'เปลี่ยนไปใช้ mouth-to-mouth แทน', correct: false, feedback: 'ยังมี BVM ใช้ได้ ควรแก้ที่เทคนิคก่อน' },
        ] },
      { situation: 'หลังปรับเป็น 2 คน หน้าอกยกดีแล้ว เพื่อนร่วมทีมบีบถุงเร็วและแรงมาก',
        question: 'คุณควรบอกเพื่อนร่วมทีมอย่างไร?',
        options: [
          { label: 'บีบพอเห็นหน้าอกยก จังหวะ ~1 วินาที/ครั้งพอ ไม่ต้องแรง/เร็ว', correct: true, feedback: 'ถูกต้อง — ป้องกัน gastric inflation และ over-ventilation' },
          { label: 'บีบแรง/เร็วแบบนี้ถูกต้องแล้ว', correct: false, feedback: 'เสี่ยง gastric inflation และลด cardiac output', trap: true },
          { label: 'ไม่ต้องพูดอะไร ปล่อยตามเดิม', correct: false, feedback: 'ควรแก้ไขทันทีเพื่อความปลอดภัยผู้ป่วย' },
          { label: 'ให้เปลี่ยนไปใช้ปากเป่าแทนถุง', correct: false, feedback: 'ไม่ใช่การแก้ปัญหาที่เหมาะสม' },
        ] },
    ],
  },
  {
    id: 'aw-stage-4', chapterId: 'aw-4', stageNumber: 4,
    title: 'Advanced Airway & Capnography', subtitle: 'บทที่ 4 · ยืนยันตำแหน่งท่อ',
    emoji: '📈', passScore: 80,
    steps: [
      { situation: 'แพทย์เพิ่งใส่ ETT ให้ผู้ป่วยขณะกำลังทำ CPR',
        question: 'วิธีใดยืนยันตำแหน่งท่อได้เชื่อถือได้สุดและต้องใช้ต่อเนื่อง?',
        options: [
          { label: 'Waveform capnography', correct: true, feedback: 'ถูกต้อง — มาตรฐานทอง ต้องติดตามต่อเนื่องตลอดการช่วยชีวิต' },
          { label: 'ฟัง breath sound ครั้งเดียวตอนใส่', correct: false, feedback: 'ควรใช้ประกอบ ไม่ใช่วิธีเดียวหรือครั้งเดียว', trap: true },
          { label: 'ดูสีผิวผู้ป่วยอย่างเดียว', correct: false, feedback: 'ไม่จำเพาะและช้าเกินไป' },
          { label: 'วัดความดันโลหิต', correct: false, feedback: 'ไม่เกี่ยวข้องกับตำแหน่งท่อโดยตรง' },
        ] },
      { situation: 'ระหว่าง CPR ค่า EtCO₂ อยู่ที่ระดับต่ำต่อเนื่องมาสักพัก',
        question: 'ค่านี้บ่งบอกอะไร?',
        options: [
          { label: 'CPR อาจไม่มีประสิทธิภาพเพียงพอ ควรตรวจสอบคุณภาพการกด', correct: true, feedback: 'ถูกต้อง — EtCO₂ สะท้อน cardiac output จาก CPR โดยอ้อม' },
          { label: 'ผู้ป่วยฟื้นแล้ว', correct: false, feedback: 'ตรงข้าม — EtCO₂ ต่ำต่อเนื่องไม่ใช่สัญญาณดี', trap: true },
          { label: 'เครื่องวัดผิดพลาดเสมอ', correct: false, feedback: 'ไม่ควรด่วนสรุปแบบนี้โดยไม่ตรวจสอบ' },
          { label: 'ไม่มีความหมายทางคลินิก', correct: false, feedback: 'มีความหมายสำคัญต่อการประเมิน CPR' },
        ] },
      { situation: 'จู่ ๆ ค่า EtCO₂ พุ่งขึ้นอย่างฉับพลันและคงอยู่ระดับสูง',
        question: 'ทีมควรทำอะไรทันที?',
        options: [
          { label: 'หยุดประเมินและคลำชีพจร — สงสัย ROSC', correct: true, feedback: 'ถูกต้อง — การพุ่งขึ้นฉับพลันคงอยู่มักเป็นสัญญาณแรกของ ROSC' },
          { label: 'สงสัยท่อหลุดออกจากหลอดลม', correct: false, feedback: 'ท่อหลุดจะทำให้ waveform หายไป ไม่ใช่พุ่งขึ้น', trap: true },
          { label: 'เพิ่มพลังงานช็อกทันที', correct: false, feedback: 'ไม่เกี่ยวข้องกับการอ่านค่า EtCO₂ นี้' },
          { label: 'ไม่ต้องทำอะไรเป็นพิเศษ', correct: false, feedback: 'ควรหยุดประเมินทันทีเมื่อสังเกตเห็นสัญญาณนี้' },
        ] },
    ],
  },
  {
    id: 'aw-stage-5', chapterId: 'aw-5', stageNumber: 5,
    title: 'ทางเดินหายใจอุดกั้นจากสิ่งแปลกปลอม', subtitle: 'บทที่ 5 · ผู้ป่วยสำลักอาหาร',
    emoji: '🍖', passScore: 80,
    steps: [
      { situation: 'ชายวัย 40 ปีกำลังกินอาหาร จู่ ๆ ยกมือกุมคอ หน้าแดง แต่ยังไอเสียงดังและพูดได้บ้าง',
        question: 'ควรทำอะไรก่อน?',
        options: [
          { label: 'ให้ไอต่อไปเอง เฝ้าสังเกตใกล้ชิด', correct: true, feedback: 'ถูกต้อง — อุดกั้นบางส่วนที่ยังไอ/พูดได้ ให้ไอเองต่อไปก่อน' },
          { label: 'ทำ abdominal thrust ทันที', correct: false, feedback: 'ยังไม่จำเป็น เพราะยังไอและพูดได้', trap: true },
          { label: 'ตบหลังแรง ๆ ทันที', correct: false, feedback: 'ยังไม่ถึงขั้นต้องแทรกแซง' },
          { label: 'ให้ดื่มน้ำเพื่อกลืนลง', correct: false, feedback: 'อาจทำให้สำลักหนักขึ้น' },
        ] },
      { situation: '30 วินาทีต่อมา ผู้ป่วยไอไม่ออกแล้ว มือยังกุมคอ พูดไม่ได้ หน้าเริ่มเขียว',
        question: 'ตอนนี้ควรทำอย่างไร?',
        options: [
          { label: 'ทำ abdominal thrust (Heimlich) ทันที', correct: true, feedback: 'ถูกต้อง — เข้าสู่อุดกั้นสมบูรณ์ ต้องช่วยเหลือทันที' },
          { label: 'รอดูอาการต่ออีกสักครู่', correct: false, feedback: 'อุดกั้นสมบูรณ์ต้องรีบช่วยทันที ไม่รอ', trap: true },
          { label: 'พาไปนั่งพักที่เก้าอี้', correct: false, feedback: 'ไม่ใช่การช่วยเหลือที่ถูกต้องในภาวะฉุกเฉินนี้' },
          { label: 'ให้น้ำดื่มอีกครั้ง', correct: false, feedback: 'ไม่ช่วยแก้การอุดกั้นและอาจทำให้แย่ลง' },
        ] },
      { situation: 'ระหว่างทำ thrust ครั้งที่ 4 ผู้ป่วยหมดสติในอ้อมแขนคุณ',
        question: 'ขั้นตอนต่อไปคืออะไร?',
        options: [
          { label: 'ประคองลงพื้นเบา ๆ แล้วเริ่ม CPR ทันที', correct: true, feedback: 'ถูกต้อง — การกดหน้าอกช่วยดันแรงดันไล่สิ่งแปลกปลอมได้เช่นกัน ก่อนเป่า/บีบให้มองหาสิ่งแปลกปลอมที่เห็นได้ก่อนเสมอ' },
          { label: 'ทำ abdominal thrust ต่อในท่านอน', correct: false, feedback: 'เมื่อหมดสติให้เปลี่ยนเป็น CPR แทน', trap: true },
          { label: 'ล้วงคอแบบสุ่มมั่วโดยมองไม่เห็น', correct: false, feedback: 'อาจดันสิ่งแปลกปลอมลึกลงไปอีก — เอาออกเฉพาะที่มองเห็นเท่านั้น' },
          { label: 'รอ EMS มาโดยไม่ทำอะไร', correct: false, feedback: 'ต้องเริ่ม CPR ทันทีระหว่างรอ' },
        ] },
    ],
  },
];

const engine = createScenarioEngine(stages, {
  progressKeyPrefix: 'aw_scenario_progress_',
  finalExamTitle: 'ข้อสอบรวม — ทบทวนทุกเคส Airway',
});

export const scenarios = stages;
export const {
  FINAL_EXAM_ID, buildFinalExam, getStageById, getStageProgress,
  saveStageProgress, isFinalExamUnlocked, getScenarioGameStatus,
} = engine;
