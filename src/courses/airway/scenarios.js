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
          { label: 'Head-tilt/chin-lift', correct: true, feedback: 'ถูกต้อง — chin-lift ยกขากรรไกรจะดึงโคนลิ้นที่ติดกับ mandible ให้พ้นผนังคอหอยด้านหลัง เมื่อไม่สงสัย trauma จึงใช้ท่ามาตรฐานนี้เปิดได้ดีที่สุด' },
          { label: 'Jaw-thrust เท่านั้น', correct: false, feedback: 'Jaw-thrust ยก mandible โดยไม่แหงนคอ สงวนไว้เมื่อสงสัยบาดเจ็บ C-spine เท่านั้น เคสนี้ไม่มีประวัติ trauma จึงไม่จำเป็น', trap: true },
          { label: 'Trendelenburg position', correct: false, feedback: 'ท่าศีรษะต่ำไม่ได้เปิดทางเดินหายใจ และยังเสี่ยงให้สิ่งคัดหลั่งไหลย้อนเข้าหลอดลม' },
          { label: 'จับนั่งตัวตรงทันที', correct: false, feedback: 'ผู้ป่วยหมดสติไม่มีการป้องกันทางเดินหายใจ การจับนั่งเสี่ยงสำลักและไม่ได้แก้ปัญหาลิ้นตก' },
        ] },
      { situation: 'คุณได้ยินเสียง snoring ดังเวลาผู้ป่วยหายใจ',
        question: 'เสียงนี้บ่งบอกสาเหตุอุดกั้นจากอะไรมากที่สุด?',
        options: [
          { label: 'ลิ้นตกไปติดผนังคอหลัง', correct: true, feedback: 'ถูกต้อง — snoring เกิดจากลมผ่านช่องแคบที่ลิ้นหย่อนไปติดผนังคอหอย มักแก้ได้ด้วยการจัดท่าเปิดทางเดินหายใจ' },
          { label: 'หลอดลมฝอยตีบ (asthma)', correct: false, feedback: 'หลอดลมฝอยตีบจะได้ยิน wheeze ตอนหายใจออก ไม่ใช่ snoring ที่เกิดจากการอุดกั้นระดับคอหอย', trap: true },
          { label: 'กล่องเสียงบวม', correct: false, feedback: 'กล่องเสียงบวม/ตีบจะได้ยิน stridor เสียงสูงตอนหายใจเข้า ไม่ใช่ snoring' },
          { label: 'ไม่มีความหมายพิเศษ', correct: false, feedback: 'เสียง snoring มีความหมายทางคลินิกชัดเจน บ่งการอุดกั้นบางส่วนที่ต้องรีบแก้' },
        ] },
      { situation: 'มีเสมหะปนเลือดในปากผู้ป่วยที่มองเห็นได้ชัด',
        question: 'ควรดูดสิ่งคัดหลั่งด้วยวิธีใดและนานเท่าไร?',
        options: [
          { label: 'Rigid suction (Yankauer) ไม่เกิน 10–15 วินาทีต่อครั้ง', correct: true, feedback: 'ถูกต้อง — Yankauer ดูดในช่องปากที่มองเห็นโดยตรง จำกัด 10–15 วินาทีเพื่อไม่ให้ดูดออกซิเจนออกจนเกิด hypoxia' },
          { label: 'ดูดต่อเนื่องจนแน่ใจว่าสะอาดหมด', correct: false, feedback: 'การดูดนานเกินไปจะดึงอากาศ/ออกซิเจนออกไปด้วย ทำให้ผู้ป่วย hypoxia จึงต้องจำกัดเวลาแต่ละครั้ง', trap: true },
          { label: 'ไม่ต้องดูด รอให้ไหลออกเอง', correct: false, feedback: 'สิ่งคัดหลั่งที่มองเห็นต้องดูดออกก่อนช่วยหายใจ ไม่งั้นจะถูกดันเข้าหลอดลมตอนบีบ BVM' },
          { label: 'ใช้ soft catheter ผ่านจมูกแทน', correct: false, feedback: 'สิ่งคัดหลั่งข้นในช่องปากที่เห็นชัดใช้ rigid tip ดูดได้เร็วกว่า soft catheter ที่อุดตันง่าย' },
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
          { label: 'OPA — วัดจากมุมปากถึงมุมกราม', correct: true, feedback: 'ถูกต้อง — วัดจากมุมปากถึงมุมกราม; OPA เหมาะกับผู้ป่วยหมดสติสนิทไม่มี gag reflex เพราะไม่กระตุ้นอาเจียนและคงลิ้นได้ดี' },
          { label: 'NPA เท่านั้น เพราะปลอดภัยกว่าเสมอ', correct: false, feedback: 'ทั้งสองใช้ได้ในเคสไม่มี gag reflex แต่ OPA เป็นตัวเลือกมาตรฐานและคงลิ้นได้ดีกว่า ไม่ใช่ว่า NPA ปลอดภัยกว่าเสมอ', trap: true },
          { label: 'ไม่ต้องใช้อุปกรณ์ใด ๆ', correct: false, feedback: 'ยังมีเสียง snoring แปลว่าลิ้นยังตกอยู่ ต้องใช้อุปกรณ์พยุงทางเดินหายใจ' },
          { label: 'ใส่ ETT ทันทีโดยไม่ประเมินก่อน', correct: false, feedback: 'ข้ามขั้นพื้นฐานไปมากเกินไป ควรลองอุปกรณ์ basic ก่อนตัดสินใจ advanced airway' },
        ] },
      { situation: 'อีกเคสหนึ่ง ผู้ป่วยกึ่งรู้สึกตัว ยังมี gag reflex อยู่บ้างเมื่อกระตุ้น',
        question: 'อุปกรณ์ทางกลใดเหมาะสมกว่า?',
        options: [
          { label: 'NPA', correct: true, feedback: 'ถูกต้อง — NPA ผ่านทางจมูกไม่สัมผัสโคนลิ้น จึงทนต่อ gag reflex ได้ดีกว่า OPA' },
          { label: 'OPA', correct: false, feedback: 'OPA สัมผัสโคนลิ้น/คอหอย จะกระตุ้นอาเจียนและเสี่ยงสำลักในผู้ป่วยที่ยังมี gag reflex', trap: true },
          { label: 'ไม่ใช้อุปกรณ์ใดเลย', correct: false, feedback: 'ยังจำเป็นต้องพยุงทางเดินหายใจ การไม่ใช้อุปกรณ์เสี่ยงอุดกั้นซ้ำ' },
          { label: 'i-gel ทันที', correct: false, feedback: 'ยังไม่ถึงข้อบ่งชี้ advanced airway ควรเริ่มด้วยอุปกรณ์ basic ที่เหมาะกับระดับความรู้สึกตัว' },
        ] },
      { situation: 'ผู้ป่วยรายเดิมมีเลือดไหลจากหูและตาช้ำรอบดวงตาทั้งสองข้าง (raccoon eyes)',
        question: 'ควรทำอย่างไรกับแผน NPA ที่วางไว้?',
        options: [
          { label: 'งดใช้ NPA เพราะสงสัยกระดูกฐานกะโหลกหัก', correct: true, feedback: 'ถูกต้อง — raccoon eyes/เลือดออกจากหูบ่งชี้ basilar skull fracture; NPA อาจทะลุผ่านรอยแตกเข้าโพรงกะโหลก/สมองได้' },
          { label: 'ใส่ NPA ตามแผนเดิม', correct: false, feedback: 'อันตราย — เข้าข่ายข้อห้ามชัดเจน เสี่ยงท่อทะลุเข้ากะโหลกผ่านฐานกะโหลกที่แตก', trap: true },
          { label: 'ใส่ NPA ทั้งสองรูจมูกเพื่อความมั่นใจ', correct: false, feedback: 'ยิ่งเพิ่มความเสี่ยงทะลุเข้ากะโหลกเป็นสองเท่า ไม่ได้ช่วยอะไร' },
          { label: 'ไม่เกี่ยวข้องกับการเลือกอุปกรณ์', correct: false, feedback: 'เกี่ยวข้องโดยตรง — เป็นข้อห้ามสำคัญของ NPA' },
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
          { label: '10–15 L/min (high-flow)', correct: true, feedback: 'ถูกต้อง — high-flow เติม reservoir bag ให้เต็มทันทุกครั้ง ทำให้ FiO₂ ที่ส่งเข้าใกล้ 100%' },
          { label: '2 L/min', correct: false, feedback: 'flow ต่ำเติม reservoir ไม่ทัน FiO₂ ที่ได้จะต่ำ ไม่พอสำหรับผู้ป่วยหยุดหายใจ', trap: true },
          { label: 'ไม่ต้องต่อ O₂', correct: false, feedback: 'BVM ที่ไม่ต่อ O₂ ให้เพียง FiO₂ ~21% ควรต่อ high-flow เสมอเมื่อมีอุปกรณ์' },
          { label: '1 L/min ผ่าน nasal cannula แทน', correct: false, feedback: 'nasal cannula flow ต่ำ ไม่พอสำหรับการช่วยหายใจในภาวะหยุดหายใจ' },
        ] },
      { situation: 'คุณบีบมือเดียวด้วย EC-clamp แต่หน้าอกผู้ป่วยไม่ยกและได้ยินลมรั่วรอบหน้ากาก',
        question: 'ควรทำอย่างไรต่อทันที?',
        options: [
          { label: 'เปลี่ยนเป็นเทคนิค 2 คน (double EC-clamp + บีบ)', correct: true, feedback: 'ถูกต้อง — สองคนช่วยให้ seal แน่นและบีบได้เต็มที่ ควรปรับทันทีที่หน้าอกไม่ยก ไม่ต้องรอ' },
          { label: 'บีบแรงขึ้นด้วยมือเดิม', correct: false, feedback: 'seal ยังรั่วอยู่ การบีบแรงขึ้นไม่แก้การรั่ว แต่ดันลมเข้ากระเพาะเพิ่ม เสี่ยงสำรอก', trap: true },
          { label: 'หยุดช่วยหายใจไปเลย', correct: false, feedback: 'ผู้ป่วยยังต้องการการช่วยหายใจ การหยุดจะทำให้ hypoxia แย่ลง' },
          { label: 'เปลี่ยนไปใช้ mouth-to-mouth แทน', correct: false, feedback: 'ยังมี BVM ที่ให้ O₂ สูงกว่า ควรแก้ที่เทคนิค seal ก่อน' },
        ] },
      { situation: 'หลังปรับเป็น 2 คน หน้าอกยกดีแล้ว เพื่อนร่วมทีมบีบถุงเร็วและแรงมาก',
        question: 'คุณควรบอกเพื่อนร่วมทีมอย่างไร?',
        options: [
          { label: 'บีบพอเห็นหน้าอกยก จังหวะ ~1 วินาที/ครั้งพอ ไม่ต้องแรง/เร็ว', correct: true, feedback: 'ถูกต้อง — บีบพอหน้าอกยก ~1 วินาที/ครั้ง ป้องกันลมเข้ากระเพาะ และเลี่ยงความดันในทรวงอกที่สูงเกินจนลด venous return' },
          { label: 'บีบแรง/เร็วแบบนี้ถูกต้องแล้ว', correct: false, feedback: 'บีบแรง/เร็วดันลมเข้ากระเพาะ (สำรอก) และเพิ่มความดันในทรวงอกจนลด venous return และ cardiac output', trap: true },
          { label: 'ไม่ต้องพูดอะไร ปล่อยตามเดิม', correct: false, feedback: 'ควรแก้ทันทีเพื่อความปลอดภัยผู้ป่วย การปล่อยไว้เสี่ยง gastric inflation' },
          { label: 'ให้เปลี่ยนไปใช้ปากเป่าแทนถุง', correct: false, feedback: 'ไม่ใช่การแก้ที่เหมาะสม ควรปรับจังหวะ/แรงบีบถุงแทน' },
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
          { label: 'Waveform capnography', correct: true, feedback: 'ถูกต้อง — waveform capnography เป็นมาตรฐานทองยืนยันท่ออยู่ในหลอดลม และต้องเฝ้าต่อเนื่องเพื่อจับท่อเลื่อนหลุด' },
          { label: 'ฟัง breath sound ครั้งเดียวตอนใส่', correct: false, feedback: 'การฟังครั้งเดียวไม่ไวพอและอาจหลอกได้ (เช่นลมเข้ากระเพาะ) ใช้เสริมได้แต่ไม่แทน capnography ต่อเนื่อง', trap: true },
          { label: 'ดูสีผิวผู้ป่วยอย่างเดียว', correct: false, feedback: 'สีผิวไม่จำเพาะและเปลี่ยนช้า ไม่ยืนยันตำแหน่งท่อ' },
          { label: 'วัดความดันโลหิต', correct: false, feedback: 'ความดันโลหิตไม่เกี่ยวข้องกับตำแหน่งท่อโดยตรง' },
        ] },
      { situation: 'ระหว่าง CPR ค่า EtCO₂ อยู่ที่ระดับต่ำต่อเนื่องมาสักพัก',
        question: 'ค่านี้บ่งบอกอะไร?',
        options: [
          { label: 'CPR อาจไม่มีประสิทธิภาพเพียงพอ ควรตรวจสอบคุณภาพการกด', correct: true, feedback: 'ถูกต้อง — EtCO₂ สะท้อนเลือดที่ไปปอดจาก cardiac output ของ CPR; ค่าต่ำต่อเนื่องเตือนให้ตรวจคุณภาพการกด (ลึก/เร็ว/เปลี่ยนคนที่ล้า)' },
          { label: 'ผู้ป่วยฟื้นแล้ว', correct: false, feedback: 'ตรงข้าม — ROSC จะทำ EtCO₂ พุ่งสูงขึ้น ค่าต่ำต่อเนื่องบ่งว่าการไหลเวียนยังไม่ดี', trap: true },
          { label: 'เครื่องวัดผิดพลาดเสมอ', correct: false, feedback: 'ไม่ควรด่วนโทษเครื่อง ควรตรวจคุณภาพ CPR และตำแหน่งท่อก่อน' },
          { label: 'ไม่มีความหมายทางคลินิก', correct: false, feedback: 'EtCO₂ เป็นตัวชี้วัดสำคัญของประสิทธิภาพ CPR' },
        ] },
      { situation: 'จู่ ๆ ค่า EtCO₂ พุ่งขึ้นอย่างฉับพลันและคงอยู่ระดับสูง',
        question: 'ทีมควรทำอะไรทันที?',
        options: [
          { label: 'หยุดประเมินและคลำชีพจร — สงสัย ROSC', correct: true, feedback: 'ถูกต้อง — EtCO₂ พุ่งขึ้นฉับพลันและคงอยู่ มักเป็นสัญญาณแรกของ ROSC เพราะเลือดกลับมาไหลเวียนเอง ควรหยุดประเมินและคลำชีพจร' },
          { label: 'สงสัยท่อหลุดออกจากหลอดลม', correct: false, feedback: 'ท่อหลุดจะทำให้ waveform หายไป ไม่ใช่พุ่งสูงขึ้น', trap: true },
          { label: 'เพิ่มพลังงานช็อกทันที', correct: false, feedback: 'ไม่เกี่ยวข้องกับการอ่านค่า EtCO₂ นี้' },
          { label: 'ไม่ต้องทำอะไรเป็นพิเศษ', correct: false, feedback: 'ควรหยุดประเมินทันที เพราะอาจเป็น ROSC ที่ต้องดูแลต่อ' },
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
          { label: 'ให้ไอต่อไปเอง เฝ้าสังเกตใกล้ชิด', correct: true, feedback: 'ถูกต้อง — การไอที่แรงคือกลไกขับสิ่งแปลกปลอมที่ได้ผลที่สุด ตราบใดที่ยังไอ/พูดได้ให้กระตุ้นให้ไอต่อและเฝ้าใกล้ชิด' },
          { label: 'ทำ abdominal thrust ทันที', correct: false, feedback: 'ยังไม่จำเป็น การแทรกแซงตอนยังไอได้ดีอาจรบกวนกลไกไอตามธรรมชาติ', trap: true },
          { label: 'ตบหลังแรง ๆ ทันที', correct: false, feedback: 'ยังไม่ถึงขั้นแทรกแซง เพราะการอุดกั้นยังเป็นบางส่วน' },
          { label: 'ให้ดื่มน้ำเพื่อกลืนลง', correct: false, feedback: 'อาจทำให้สำลักหนักขึ้น' },
        ] },
      { situation: '30 วินาทีต่อมา ผู้ป่วยไอไม่ออกแล้ว มือยังกุมคอ พูดไม่ได้ หน้าเริ่มเขียว',
        question: 'ตอนนี้ควรทำอย่างไร?',
        options: [
          { label: 'ทำ abdominal thrust (Heimlich) ทันที', correct: true, feedback: 'ถูกต้อง — ไอไม่ออก/พูดไม่ได้/หน้าเขียวคืออุดกั้นสมบูรณ์ ต้องทำ abdominal thrust ทันทีเพื่อดันสิ่งแปลกปลอมออก' },
          { label: 'รอดูอาการต่ออีกสักครู่', correct: false, feedback: 'อุดกั้นสมบูรณ์ทำให้สมองขาดออกซิเจนภายในไม่กี่นาที ต้องช่วยทันที ห้ามรอ', trap: true },
          { label: 'พาไปนั่งพักที่เก้าอี้', correct: false, feedback: 'ไม่ใช่การช่วยเหลือที่ถูกต้องในภาวะฉุกเฉินนี้' },
          { label: 'ให้น้ำดื่มอีกครั้ง', correct: false, feedback: 'ไม่ช่วยแก้การอุดกั้นและอาจทำให้แย่ลง' },
        ] },
      { situation: 'ระหว่างทำ thrust ครั้งที่ 4 ผู้ป่วยหมดสติในอ้อมแขนคุณ',
        question: 'ขั้นตอนต่อไปคืออะไร?',
        options: [
          { label: 'ประคองลงพื้นเบา ๆ แล้วเริ่ม CPR ทันที', correct: true, feedback: 'ถูกต้อง — เมื่อหมดสติให้เริ่ม CPR เพราะการกดหน้าอกสร้างแรงดันช่วยดันสิ่งแปลกปลอมได้ด้วย; ก่อนช่วยหายใจทุกครั้งให้มองหาสิ่งแปลกปลอมที่เห็นได้' },
          { label: 'ทำ abdominal thrust ต่อในท่านอน', correct: false, feedback: 'เมื่อหมดสติให้เปลี่ยนเป็น CPR แทน เพราะกดหน้าอกได้แรงดันมากกว่าและช่วยไหลเวียนไปด้วย', trap: true },
          { label: 'ล้วงคอแบบสุ่มมั่วโดยมองไม่เห็น', correct: false, feedback: 'การล้วงแบบมองไม่เห็นอาจดันสิ่งแปลกปลอมลึกลงไปอีก — เอาออกเฉพาะที่มองเห็นเท่านั้น' },
          { label: 'รอ EMS มาโดยไม่ทำอะไร', correct: false, feedback: 'ต้องเริ่ม CPR ทันทีระหว่างรอ ไม่ปล่อยเวลาให้สมองขาดออกซิเจน' },
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
