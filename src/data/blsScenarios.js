// BLS decision-game scenarios (BLS for Healthcare Providers, ILCOR 2025).
// 8 stages, one per pre-course chapter (src/courses/bls-hcp/lessons.js). Each
// stage is ONE continuous case — a single evolving patient followed step by
// step from recognition through resolution — so the learner reasons through a
// flowing clinical situation instead of answering disconnected questions.
//
// Each step presents the next beat of the same case + a timed multiple-choice
// question; the first pick locks the step (no retry) and reveals the
// explanation. Facts (rates/depths/ratios) and the wrong-answer "traps" are
// paraphrased directly from the vetted lesson content in
// src/courses/bls-hcp/lessons.js — not invented — but should still be
// sanity-checked by the course instructor before production use. No verbatim
// ILCOR tables are quoted anywhere. The distractors are written to be
// clinically plausible (not obviously silly) to raise the difficulty.
//
// Step shape:
//   {
//     situation: string,           // the next beat of the ongoing case
//     question: string,
//     timeLimitSec?: number,       // default DEFAULT_TIME_LIMIT_SEC if omitted
//     cprDrill?: true,              // after a correct answer, run the 30s CPR
//                                    // metronome drill before "ถัดไป" unlocks
//     options: [
//       { label, correct?: true, feedback, trap?: true }
//     ],
//   }
// Note: the correct option is authored first, but the game shuffles option
// order at render time (getStageById → shuffleOptions), so the answer lands in
// a different position (ก/ข/ค/ง) each question.

export const DEFAULT_TIME_LIMIT_SEC = 20;

export const blsScenarios = [
  // ===================== ด่าน 1 — Chain of Survival / IHCA =====================
  // เคสเดียว: พยาบาลเวรดึกพบผู้ป่วยใน ward หัวใจหยุดเต้น → เดินตามลำดับตั้งแต่จดจำเหตุ
  {
    id: 'stage-1-chain',
    chapterId: 'bls-1',
    stageNumber: 1,
    title: 'Chain of Survival & IHCA',
    subtitle: 'บทที่ 1 · เคสผู้ป่วยหัวใจหยุดเต้นใน ward',
    emoji: '⛓️',
    passScore: 80,
    steps: [
      {
        situation: 'ตี 3 คุณเป็นพยาบาลเวรดึก เดินตรวจผู้ป่วยใน ward พบชายวัย 62 ปีนอนนิ่ง เรียกและสะกิดไหล่แรง ๆ แล้วไม่ตอบสนอง ในห้องมีคุณอยู่คนเดียว',
        question: 'ขั้นตอนแรกที่ถูกต้องที่สุดคืออะไร?',
        timeLimitSec: 20,
        options: [
          { label: 'กดปุ่ม code blue / เรียก RRT พร้อมขอ defibrillator ทันที แล้วจึงเริ่มประเมิน', correct: true, feedback: 'ถูกต้อง — IHCA เมื่อจดจำเหตุได้ต้อง activate ทีม + ขอ defibrillator ให้เร็วที่สุด เพราะ early defib คือหัวใจของการรอด การรีบทำเองคนเดียวก่อนเรียกทีมทำให้เครื่อง shock มาช้า' },
          { label: 'เริ่มกดหน้าอกทันทีก่อน แล้วค่อยเรียกทีมหลังกดครบ 1 รอบ', correct: false, feedback: 'ไม่ใช่ลำดับที่ดีที่สุด — ถ้าอยู่คนเดียวใน รพ. ต้อง activate ทีม + ขอ defibrillator ก่อน/พร้อมกัน มิฉะนั้น shock จะมาช้า การกดอย่างเดียวโดยไม่มีเครื่องมาช่วยลดโอกาสรอด', trap: true },
          { label: 'คลำ carotid ให้แน่ใจว่าไม่มีชีพจรก่อน แล้วจึงเรียกทีม', correct: false, feedback: 'ผิดลำดับ — การหมดสติ + ไม่ตอบสนองพอที่จะเรียกทีมได้แล้ว ไม่ต้องรอผลคลำชีพจรก่อนเรียก การรอทำให้ทีมและเครื่องมาช้า' },
          { label: 'ไปตามแพทย์เวรด้วยตัวเองเพื่อรายงานอาการก่อน', correct: false, feedback: 'ผิด — การละทิ้งผู้ป่วยไปตามคนเสียเวลามาก ควรเรียกทีมผ่านระบบ code blue ที่เรียกทุกคน + เครื่องมาพร้อมกัน' },
        ],
      },
      {
        situation: 'code blue ถูก activate แล้ว ทีมกำลังมา ระหว่างนี้คุณประเมินการหายใจและคลำ carotid ไปพร้อมกัน',
        question: 'ควรใช้เวลาประเมินนานสุดเท่าไร และถ้ายัง "ไม่แน่ใจ" ว่ามีชีพจรหรือไม่ ต้องทำอย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: 'ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้ถือว่าไม่มีชีพจรและเริ่ม CPR ทันที', correct: true, feedback: 'ถูกต้อง — เกณฑ์คือ ≤ 10 วินาที และเมื่อไม่แน่ใจให้เริ่ม CPR เลย ความเสี่ยงของการกดในคนที่ยังมีชีพจรน้อยกว่าความเสี่ยงของการชะลอ CPR ในคนที่ไม่มีชีพจร' },
          { label: 'ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้คลำซ้ำอีกรอบเพื่อความชัวร์ก่อนตัดสินใจ', correct: false, feedback: 'ผิด — การคลำซ้ำทำให้เกิน 10 วินาทีและชะลอ CPR เมื่อไม่แน่ใจให้เริ่ม CPR ทันที ไม่ต้องคลำซ้ำ', trap: true },
          { label: 'ประมาณ 15–20 วินาที เพื่อให้มั่นใจว่าคลำถูกตำแหน่ง', correct: false, feedback: 'นานเกินไป — เกณฑ์คือไม่เกิน 10 วินาที ยิ่งประเมินนานยิ่งชะลอการเริ่มกดหน้าอก' },
          { label: 'คลำจนกว่าจะมั่นใจ 100% ไม่มีกำหนดเวลา', correct: false, feedback: 'ผิด — การรอให้มั่นใจ 100% ทำให้ CPR ล่าช้าอย่างมาก มาตรฐานจำกัดที่ ≤ 10 วินาทีและให้เริ่มเมื่อไม่แน่ใจ' },
        ],
      },
      {
        situation: 'คุณคลำไม่ได้ชีพจร ผู้ป่วยไม่หายใจ แต่มีการ "เฮือก" เป็นพัก ๆ คล้ายอ้าปากหายใจช้า ๆ (agonal gasp)',
        question: 'ควรตีความ agonal gasping อย่างไร และทำอะไรต่อ?',
        cprDrill: true,
        timeLimitSec: 20,
        options: [
          { label: 'ไม่ใช่การหายใจที่มีประสิทธิภาพ ให้ถือว่าไม่หายใจ — เริ่ม CPR ทันที', correct: true, feedback: 'ถูกต้อง — agonal gasp พบได้ระหว่างหัวใจหยุดเต้น ไม่ใช่การหายใจปกติ อย่าให้มันหลอกให้ชะลอ CPR เริ่มกดหน้าอกคุณภาพสูงทันที — ลองจับจังหวะ 30 วินาที' },
          { label: 'แสดงว่ายังพอหายใจได้เอง ให้เฝ้าดูอาการต่อสักครู่ก่อนตัดสินใจ', correct: false, feedback: 'ผิด — agonal gasp ไม่ใช่การหายใจที่ได้ผล การเข้าใจผิดว่าเป็นการหายใจปกติแล้วรอดู เป็นเหตุให้ CPR ล่าช้าบ่อยที่สุด', trap: true },
          { label: 'ช่วยหายใจด้วย BVM อย่างเดียวก่อน ยังไม่ต้องกดหน้าอก', correct: false, feedback: 'ผิด — ไม่มีชีพจรแล้วต้องกดหน้าอก การช่วยหายใจอย่างเดียวใช้กับผู้ที่ยังมีชีพจรแต่หายใจไม่พอเท่านั้น' },
          { label: 'จัดท่า recovery position เพื่อกันสำลักระหว่างรอทีม', correct: false, feedback: 'ผิด — recovery position ใช้กับผู้ที่หมดสติแต่ "หายใจปกติและมีชีพจร" ผู้ป่วยรายนี้ไม่มีชีพจร ต้อง CPR' },
        ],
      },
      {
        situation: 'ทีม code blue มาถึงและรับช่วง CPR ต่อ มีคนถามว่าทำไม IHCA (ในโรงพยาบาล) ถึงต่างจาก OHCA (นอกโรงพยาบาล) ในแง่การเน้นห่วงโซ่',
        question: 'ข้อใดอธิบายจุดเน้นที่ต่างกันได้ถูกต้องที่สุด?',
        timeLimitSec: 25,
        options: [
          { label: 'IHCA เน้นห่วงที่ 1 (เฝ้าระวังสัญญาณชีพ + RRT/MET ก่อน arrest) เพราะมักมีสัญญาณเตือนล่วงหน้า; OHCA เน้น bystander CPR ทันที + AED ชุมชน + EMS', correct: true, feedback: 'ถูกต้อง — ใช้ Universal Chain เดียวกัน แต่ IHCA มีโอกาสป้องกันก่อนเกิดเหตุด้วยการเฝ้าระวัง ส่วน OHCA พึ่งการลงมือช่วยของผู้พบเหตุและระบบ EMS' },
          { label: 'IHCA ไม่ต้องรีบ defibrillate เพราะมีทีมแพทย์พร้อมอยู่แล้ว', correct: false, feedback: 'ผิด — early defibrillation สำคัญเท่ากันทั้งสองบริบท การมีทีมอยู่ไม่ได้ลดความจำเป็นที่จะต้อง shock เร็ว', trap: true },
          { label: 'OHCA ใช้ hand-only CPR เป็นมาตรฐานสำหรับทุกคนรวมทั้ง HCP ที่มาถึง', correct: false, feedback: 'ผิด — hand-only แนะนำเฉพาะ untrained bystander เท่านั้น BLS-HCP ต้องช่วยหายใจเสมอไม่ว่าจะในหรือนอก รพ.' },
          { label: 'ทั้งสองบริบทใช้ห่วงโซ่คนละชุดที่ไม่มีอะไรร่วมกันเลย', correct: false, feedback: 'ผิด — ปี 2025 รวมเป็น Universal Chain เดียวครอบคลุมทั้งสอง ต่างกันเพียงจุดเน้นบางห่วงและทรัพยากรที่มี' },
        ],
      },
      {
        situation: 'ระหว่าง CPR หัวหน้าทีมทบทวนกับทีมว่า Universal Chain of Survival ปี 2025 มีโครงสร้างอย่างไร',
        question: 'Universal Chain of Survival 2025 มีกี่ห่วง และห่วงสุดท้ายคืออะไร?',
        timeLimitSec: 20,
        options: [
          { label: '6 ห่วง — ห่วงสุดท้ายคือ Recovery & Survivorship', correct: true, feedback: 'ถูกต้อง — ปี 2025 รวม IHCA/OHCA เป็น 6 ห่วง ห่วงที่ 6 (Recovery & Survivorship) เป็นห่วงที่เน้นการฟื้นฟูระบบประสาท จิตใจ และการสนับสนุนครอบครัวระยะยาว' },
          { label: '6 ห่วง — ห่วงสุดท้ายคือ Post-cardiac arrest care', correct: false, feedback: 'เกือบถูก แต่ผิด — Post-cardiac arrest care เป็นห่วงที่ 5 ยังมีห่วงที่ 6 (Recovery & Survivorship) ต่อท้ายอีกหนึ่ง', trap: true },
          { label: '5 ห่วง — ห่วงสุดท้ายคือ Defibrillation', correct: false, feedback: 'ผิด — Defibrillation เป็นห่วงที่ 3 และโครงสร้างปี 2025 มี 6 ห่วง ไม่ใช่ 5' },
          { label: '4 ห่วง — ห่วงสุดท้ายคือ Advanced resuscitation', correct: false, feedback: 'ผิด — จำนวนห่วงคือ 6 และ advanced resuscitation เป็นห่วงที่ 4 ไม่ใช่ห่วงสุดท้าย' },
        ],
      },
    ],
  },

  // ===================== ด่าน 2 — CPR คุณภาพสูงในผู้ใหญ่ =====================
  // เคสเดียว: ผู้ป่วยผู้ใหญ่รายเดิม กำลังทำ CPR คุณภาพสูง เดินตามประเด็นคุณภาพทีละข้อ
  {
    id: 'stage-2-quality-cpr',
    chapterId: 'bls-2',
    stageNumber: 2,
    title: 'CPR คุณภาพสูงในผู้ใหญ่',
    subtitle: 'บทที่ 2 · คุมคุณภาพการกดหน้าอกทั้งเคส',
    emoji: '💪',
    passScore: 80,
    steps: [
      {
        situation: 'คุณรับหน้าที่กดหน้าอกผู้ป่วยผู้ใหญ่รายนี้ กำลังจะเริ่มกดบนเตียงผู้ป่วยที่เป็นที่นอนนุ่ม',
        question: 'ก่อนเริ่มกด ควรจัดการเรื่องพื้นรองอย่างไร และกดที่ตำแหน่งใด?',
        timeLimitSec: 20,
        options: [
          { label: 'สอด backboard หรือย้ายลงพื้นแข็ง แล้วกดที่ครึ่งล่างของกระดูก sternum', correct: true, feedback: 'ถูกต้อง — เตียงนุ่มดูดซับแรงกด ทำให้ความลึกจริงไม่พอ ควรมีพื้นแข็งรอง และวางส้นมือที่ครึ่งล่างของ sternum' },
          { label: 'กดบนที่นอนนุ่มได้เลยแต่กดให้ลึกกว่าปกติเพื่อชดเชย', correct: false, feedback: 'ผิด — การกดลึกกว่าปกติบนที่นอนนุ่มประเมินความลึกจริงไม่ได้และไม่น่าเชื่อถือ ควรใช้พื้นแข็งรองแทน', trap: true },
          { label: 'กดที่ยอด xiphoid process เพื่อให้ใกล้หัวใจที่สุด', correct: false, feedback: 'ผิด — กดที่ xiphoid เสี่ยงบาดเจ็บตับ/กระเพาะ ตำแหน่งคือครึ่งล่างของ sternum' },
          { label: 'กดเหนือราวนม 2 นิ้วไปทางศีรษะเพื่อเลี่ยงหัวใจ', correct: false, feedback: 'ผิด — ตำแหน่งคือครึ่งล่างของ sternum การกดสูงเกินไปทำให้ compression ไม่ได้ผลต่อหัวใจ' },
        ],
      },
      {
        situation: 'คุณเริ่มกดหน้าอก หัวหน้าทีมขอให้คุมทั้ง "อัตรา" และ "ความลึก" ให้อยู่ในเกณฑ์',
        question: 'อัตราและความลึกที่ถูกต้องสำหรับผู้ใหญ่ตาม ILCOR 2025 คือ?',
        timeLimitSec: 20,
        options: [
          { label: 'อัตรา 100–120 ครั้ง/นาที และความลึกอย่างน้อย 5 ซม. แต่ไม่เกิน 6 ซม.', correct: true, feedback: 'ถูกต้อง — ทั้งเร็วเกิน/ลึกเกินและช้าเกิน/ตื้นเกินล้วนลดผล กด 100–120/นาที ลึก 5–6 ซม. คือช่วงที่สมดุลที่สุด' },
          { label: 'อัตรา 100–120 ครั้ง/นาที และความลึก 1/3 ของ AP diameter ของผู้ป่วยรายนี้', correct: false, feedback: 'ผิด — เกณฑ์ 1/3 AP diameter ใช้กับเด็ก/ทารก ผู้ใหญ่ใช้ตัวเลขตายตัว 5–6 ซม.', trap: true },
          { label: 'อัตรามากกว่า 120 ครั้ง/นาที ยิ่งเร็วยิ่งได้ flow มาก ความลึก 5–6 ซม.', correct: false, feedback: 'ผิด — เร็วเกิน 120 มักทำให้กดได้ไม่ลึกพอและ recoil ไม่เต็มที่ เกณฑ์บนคือ 120/นาที' },
          { label: 'อัตรา 80–100 ครั้ง/นาที ความลึกอย่างน้อย 5 ซม.', correct: false, feedback: 'ผิด — อัตราต่ำกว่าเกณฑ์ เกณฑ์เริ่มที่ 100 ครั้ง/นาที' },
        ],
      },
      {
        situation: 'CPR Coach สังเกตว่าระหว่างจังหวะกด มือคุณยังพิงค้างบนหน้าอกเล็กน้อย ไม่ปล่อยให้อกคืนตัวเต็มที่',
        question: 'ทำไม full chest recoil จึงสำคัญ และการพิงค้างส่งผลอย่างไร?',
        timeLimitSec: 25,
        options: [
          { label: 'การคืนตัวเต็มที่ทำให้เลือดไหลกลับเข้าหัวใจใน diastole (venous return); การพิงค้างลด venous return จึงลด cardiac output', correct: true, feedback: 'ถูกต้อง — incomplete recoil ลด venous return โดยตรง ทำให้ปริมาณเลือดที่ปั๊มออกในจังหวะถัดไปน้อยลง แม้อัตรา/ความลึกจะดูดี' },
          { label: 'การคืนตัวเต็มที่มีไว้เพื่อพักกล้ามเนื้อผู้กดเป็นหลัก ไม่มีผลต่อผู้ป่วยโดยตรง', correct: false, feedback: 'ผิด — เหตุผลหลักคือ venous return ของผู้ป่วย ไม่ใช่การพักกล้ามเนื้อผู้กด', trap: true },
          { label: 'การพิงค้างช่วยให้หน้าอกนิ่งขึ้น วัดความลึกได้แม่นกว่า จึงเป็นผลดี', correct: false, feedback: 'ผิด — การพิงค้างเป็นผลเสีย มันลด venous return ไม่ได้ช่วยเรื่องการวัดความลึก' },
          { label: 'Full recoil ช่วยให้ผู้ป่วยหายใจเองระหว่างจังหวะกด', correct: false, feedback: 'ผิด — full recoil ไม่เกี่ยวกับการหายใจเองของผู้ป่วย แต่เกี่ยวกับ venous return' },
        ],
      },
      {
        situation: 'ทีมนำ BVM (Ambu bag) ต่อ O₂ high-flow มาถึง ยังไม่ได้ใส่ advanced airway คุณบีบ Ambu คนเดียวด้วยเทคนิค EC-clamp แต่พบว่าลมรั่วจากขอบหน้ากาก หน้าอกไม่ยก',
        question: 'ควรทำอย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: 'เปลี่ยนเป็นเทคนิค 2 คน (double EC-clamp) — คนหนึ่งประคอง seal สองมือ อีกคนบีบ bag', correct: true, feedback: 'ถูกต้อง — เมื่อ seal ไม่สนิทและหน้าอกไม่ยก การเปลี่ยนเป็น 2-rescuer BVM ให้ seal แน่นกว่า แก้ต้นเหตุคือลมรั่ว' },
          { label: 'บีบ bag แรงและเร็วขึ้นเพื่อชดเชยลมที่รั่วออก', correct: false, feedback: 'ผิด — บีบแรง/เร็วเพิ่มความดันในทางเดินอาหาร เสี่ยง gastric inflation และสำลัก ไม่ได้แก้ปัญหา seal', trap: true },
          { label: 'เลิกช่วยหายใจ เปลี่ยนไปกดหน้าอกต่อเนื่องอย่างเดียว', correct: false, feedback: 'ผิด — BLS-HCP ต้องช่วยหายใจ (30:2) ไม่ใช่ hand-only การแก้คือปรับ seal ไม่ใช่เลิกช่วยหายใจ' },
          { label: 'บีบ Ambu ให้ปริมาตรมากขึ้นต่อครั้งเพื่อให้เข้าถึงปอดมากขึ้น', correct: false, feedback: 'ผิด — ปริมาตรมากเกินไม่ช่วยเมื่อ seal รั่ว และเพิ่ม gastric inflation บีบพอเห็นหน้าอกยก ~1 วินาทีก็พอ' },
        ],
      },
      {
        situation: 'seal แน่นแล้ว ทีมกำลังคุมคุณภาพโดยรวม หัวหน้าถามถึงตัวชี้วัดคุณภาพหลัก',
        question: 'Chest Compression Fraction (CCF) เป้าหมายคือเท่าไร และหมายถึงอะไร?',
        cprDrill: true,
        timeLimitSec: 20,
        options: [
          { label: '> 80% — สัดส่วนของเวลาที่กดหน้าอกจริงเทียบกับเวลารวมของการช่วยฟื้นคืนชีพ', correct: true, feedback: 'ถูกต้อง — CCF > 80% หมายถึงหยุดกดให้น้อยที่สุด สัมพันธ์กับ ROSC และ survival ที่สูงขึ้น ลองรักษาจังหวะกด 30 วินาที' },
          { label: '100% — ห้ามหยุดกดเลยแม้แต่วินาทีเดียวตลอดการช่วยชีวิต', correct: false, feedback: 'ผิด — 100% เป็นไปไม่ได้จริง (ต้องหยุดตอน AED วิเคราะห์/สลับคน) เป้าหมายที่ตั้งไว้คือ > 80%', trap: true },
          { label: '> 50% — ขอให้กดมากกว่าหยุดก็เพียงพอ', correct: false, feedback: 'ผิด — ต่ำกว่าเกณฑ์มาก เป้าหมายคือ > 80% ไม่ใช่แค่มากกว่าครึ่ง' },
          { label: '> 60% — สมดุลระหว่างการกดและการช่วยหายใจ', correct: false, feedback: 'ผิด — ยังต่ำกว่าเกณฑ์จริง เป้าหมายคือ > 80%' },
        ],
      },
    ],
  },

  // ===================== ด่าน 3 — AED / Defib สถานการณ์พิเศษ =====================
  // เคสเดียว: ผู้ป่วยสูงอายุรายเดียว ที่มีทั้ง pacemaker + แผ่นแปะยา + หน้าอกเปียก
  {
    id: 'stage-3-aed',
    chapterId: 'bls-3',
    stageNumber: 3,
    title: 'AED — สถานการณ์พิเศษ',
    subtitle: 'บทที่ 3 · ผู้ป่วยรายเดียวหลายเงื่อนไข',
    emoji: '⚡',
    passScore: 80,
    steps: [
      {
        situation: 'ชายวัย 70 ปีทรุดล้มหมดสติ ทีมกำลัง CPR อยู่ AED มาถึง คุณเปิดเสื้อเพื่อติด pads แล้วคลำได้ก้อนแข็งนูนใต้ผิวหนังบริเวณใต้ไหปลาร้าซ้าย (สงสัย pacemaker/ICD)',
        question: 'ควรวาง pads อย่างไร?',
        timeLimitSec: 25,
        options: [
          { label: 'วางให้ห่างจากก้อนนั้นมากที่สุดเท่าที่ทำได้ (ควร ≥ 8 ซม.) หรือใช้ตำแหน่ง anteroposterior — ห้ามวางทับตัวเครื่อง', correct: true, feedback: 'ถูกต้อง — หลีกเลี่ยงวางทับ pacemaker/ICD เพราะกระแสอาจถูกบล็อกหรือเครื่องเสียหาย ยึดหลัก "ห่างเท่าที่ทำได้" เพราะ defib สำคัญที่สุด' },
          { label: 'วาง pad ห่างจากก้อนประมาณ 2.5 ซม. (1 นิ้ว) ก็เพียงพอ', correct: false, feedback: 'ผิด — ระยะ 2.5 ซม. เป็นเกณฑ์ของ "แผ่นแปะยา" ไม่ใช่ pacemaker สำหรับ pacemaker/ICD ควรห่างมากที่สุด (≥ 8 ซม.) หรือใช้ตำแหน่ง AP', trap: true },
          { label: 'งดใช้ AED กับผู้ป่วยที่มี pacemaker เพราะจะทำเครื่องพัง', correct: false, feedback: 'ผิด — ยัง defibrillate ได้ตามปกติ เพียงวาง pads ให้ห่างจากตัวเครื่อง การงด shock อันตรายกว่ามาก' },
          { label: 'ต้องให้แพทย์ปิดการทำงานของ pacemaker ก่อนจึงจะ shock ได้', correct: false, feedback: 'ผิด — ไม่จำเป็นและไม่มีเวลา แค่วาง pads ให้ห่างพอก็ shock ได้ทันที' },
        ],
      },
      {
        situation: 'ขณะจะติด pad แผ่นหน้า คุณเห็นแผ่นแปะยา (transdermal patch — สงสัย nitroglycerin) ติดอยู่ตรงตำแหน่งที่ต้องวาง pad พอดี',
        question: 'ควรทำอย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: 'ดึงแผ่นแปะออกและเช็ดยาที่ผิวหนังออกก่อนติด pad (ถ้าดึงไม่ทันให้วาง pad ห่างจาก patch ≥ 2.5 ซม.)', correct: true, feedback: 'ถูกต้อง — shock ผ่าน patch อาจถูกบล็อกและทำให้ผิวหนังไหม้ ดึงและเช็ดออกก่อน หรือหลบให้ห่าง ≥ 2.5 ซม. (1 นิ้ว)' },
          { label: 'ติด pad ทับแผ่นแปะไปเลยเพื่อไม่ให้เสียเวลา', correct: false, feedback: 'ผิด — shock ผ่านแผ่นแปะจะบล็อกกระแสและเสี่ยงผิวไหม้ ต้องดึงออกหรือหลบตำแหน่ง', trap: true },
          { label: 'วาง pad ห่างจาก patch อย่างน้อย 8 ซม. เท่ากับกรณี pacemaker', correct: false, feedback: 'ไม่ตรงเกณฑ์ — ระยะสำหรับแผ่นแปะยาคือ ≥ 2.5 ซม. (1 นิ้ว) วิธีที่ดีกว่าคือดึงออกและเช็ดก่อน' },
          { label: 'รอให้ยาในแผ่นแปะซึมหมดก่อนแล้วค่อยติด pad', correct: false, feedback: 'ผิด — ไม่มีเวลารอ ต้องดึง/เช็ดออกทันทีแล้วติด pad ต่อ' },
        ],
      },
      {
        situation: 'หลังจัดการแผ่นแปะแล้ว คุณสังเกตว่าหน้าอกผู้ป่วยเปียกจากเหงื่อ (diaphoresis) และน้ำที่หกใส่',
        question: 'ก่อนติด pads ต้องทำอะไร และเพราะอะไร?',
        timeLimitSec: 20,
        options: [
          { label: 'เช็ดหน้าอกให้แห้งอย่างรวดเร็วก่อนติด pads', correct: true, feedback: 'ถูกต้อง — ผิวเปียกทำให้ pads ติดไม่แน่นและกระแสอาจ arc ข้ามผิวหนังแทนที่จะผ่านหัวใจ เช็ดแห้งเร็ว ๆ แล้วติดทันที' },
          { label: 'ติด pads บนผิวเปียกได้เลย เพราะน้ำช่วยนำไฟฟ้าให้ shock ผ่านดีขึ้น', correct: false, feedback: 'ผิด — น้ำบนผิวทำให้กระแส arc ข้ามผิวหนังและ shock ผ่านหัวใจไม่เต็มที่ ต้องเช็ดแห้งก่อน', trap: true },
          { label: 'งดใช้ AED จนกว่าผิวจะแห้งสนิทเอง', correct: false, feedback: 'ผิด — ห้ามรอ เช็ดให้แห้งเร็ว ๆ แล้วติด pads ทันที' },
          { label: 'ใส่ถุงมือเพิ่มอีกชั้นแล้วติด pads เพื่อกันไฟรั่ว', correct: false, feedback: 'ผิด — ประเด็นคือผิวผู้ป่วยเปียก ไม่ใช่เรื่องถุงมือ ต้องเช็ดหน้าอกผู้ป่วยให้แห้ง' },
        ],
      },
      {
        situation: 'ติด pads เรียบร้อย เครื่องประกาศ "Analyzing — do not touch the patient"',
        question: 'ระหว่างที่ AED กำลังวิเคราะห์จังหวะ ต้องทำอะไร?',
        timeLimitSec: 15,
        options: [
          { label: 'สั่งหยุดกด ให้ทุกคนถอยห่าง ไม่มีใครสัมผัสผู้ป่วย จนกว่าจะวิเคราะห์เสร็จ', correct: true, feedback: 'ถูกต้อง — การสัมผัส/กดระหว่างวิเคราะห์รบกวนการอ่านจังหวะ ทำให้เครื่องอาจตัดสินผิด จำกัดการหยุดกดนี้ให้ ≤ 10 วินาที' },
          { label: 'กดหน้าอกต่อไประหว่างวิเคราะห์เพื่อรักษา CCF ไม่ให้เสียเวลา', correct: false, feedback: 'ผิด — ต้องหยุดและถอยห่างระหว่างวิเคราะห์ ไม่เช่นนั้นเครื่องอ่านจังหวะผิดพลาด (นี่คือข้อยกเว้นของการหยุดกด)', trap: true },
          { label: 'คลำชีพจรไปด้วยระหว่างเครื่องวิเคราะห์เพื่อประหยัดเวลา', correct: false, feedback: 'ผิด — ห้ามสัมผัสผู้ป่วยเลยระหว่างวิเคราะห์ การคลำก็รบกวนการอ่านจังหวะ' },
          { label: 'เตรียมชาร์จพลังงานเองด้วยมือระหว่างรอผลวิเคราะห์', correct: false, feedback: 'ผิด — BLS-HCP ใช้ AED automated mode เครื่องจัดการพลังงานเอง ไม่ปรับ/ชาร์จเอง' },
        ],
      },
      {
        situation: 'เครื่องประกาศ "Shock advised" คุณเคลียร์คนรอบตัวและกดปุ่ม shock ไป 1 ครั้ง',
        question: 'ทันทีหลัง shock ต้องทำอะไร?',
        cprDrill: true,
        timeLimitSec: 15,
        options: [
          { label: 'เริ่มกดหน้าอกต่อทันที 2 นาที โดยไม่คลำชีพจรก่อน', correct: true, feedback: 'ถูกต้อง — หลัง shock ต้อง CPR ต่อทันที 2 นาที การหยุดคลำชีพจรทันทีหลัง shock ทำให้ perfusion หายและเสียเวลา เครื่องจะวิเคราะห์ซ้ำเองเมื่อครบ 2 นาที' },
          { label: 'คลำชีพจรทันทีเพื่อเช็คว่า shock ได้ผลหรือยัง', correct: false, feedback: 'ผิด — ห้ามหยุดคลำชีพจรทันทีหลัง shock แม้ shock สำเร็จ หัวใจก็มักยังไม่ปั๊มเลือดได้ทันที ต้องกดต่อ 2 นาที', trap: true },
          { label: 'รอเครื่องวิเคราะห์จังหวะซ้ำทันทีก่อนกดหน้าอก', correct: false, feedback: 'ผิด — ต้องกดหน้าอกต่อทันที 2 นาที เครื่องจะ prompt วิเคราะห์ใหม่เองเมื่อครบเวลา' },
          { label: 'ถอด pads ออกแล้วติดใหม่เพื่อให้แน่ใจว่าสัมผัสดี', correct: false, feedback: 'ผิด — ไม่จำเป็น ปล่อย pads ไว้แล้วกดหน้าอกต่อทันที' },
        ],
      },
    ],
  },

  // ===================== ด่าน 4 — One-rescuer =====================
  // เคสเดียว: คุณอยู่คนเดียว พบผู้ป่วยล้มริมถนน ตั้งแต่ต้นจนทีมมาถึง
  {
    id: 'stage-4-one-rescuer',
    chapterId: 'bls-1r',
    stageNumber: 4,
    title: 'One-rescuer CPR',
    subtitle: 'บทที่ 4 · ช่วยคนเดียวตั้งแต่ต้นจนทีมมา',
    emoji: '🏃',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเดินกลับบ้านคนเดียว พบชายคนหนึ่งทรุดล้มหมดสติริมถนน ไม่มีคนอื่นอยู่แถวนั้น คุณเช็คว่าที่เกิดเหตุปลอดภัยและปลุกแล้วไม่ตอบสนอง',
        question: 'ลำดับการช่วยเหลือที่ถูกต้องที่สุดคือ?',
        timeLimitSec: 20,
        options: [
          { label: 'เปิด speakerphone โทร 1669 ขอ EMS + AED พร้อมประเมินการหายใจ/ชีพจร แล้วเริ่ม CPR ทันทีถ้าไม่มีชีพจร', correct: true, feedback: 'ถูกต้อง — speakerphone ทำให้เรียก EMS และทำ CPR ได้พร้อมกันโดยไม่ทิ้งผู้ป่วย ประเมิน ≤ 10 วินาที ไม่มีชีพจรก็เริ่มเลย' },
          { label: 'วิ่งไปตามคนช่วยและหา AED ก่อน แล้วค่อยกลับมาเริ่ม CPR', correct: false, feedback: 'ผิด — การทิ้งผู้ป่วยไปตามคนทำให้ CPR ล่าช้า ใช้ speakerphone เรียกช่วยระหว่างทำ CPR แทน', trap: true },
          { label: 'คลำชีพจรซ้ำหลายรอบให้แน่ใจก่อนจึงโทรเรียกใคร', correct: false, feedback: 'ผิด — ประเมิน ≤ 10 วินาที ถ้าไม่แน่ใจให้เริ่ม CPR การคลำซ้ำหลายรอบชะลอทั้งการเรียกช่วยและ CPR' },
          { label: 'รอสังเกตอาการ 1–2 นาที เผื่อผู้ป่วยฟื้นเอง', correct: false, feedback: 'ผิด — ห้ามรอ ทุกวินาทีที่ชะลอ CPR ลดโอกาสรอด' },
        ],
      },
      {
        situation: 'ประเมินแล้วไม่มีชีพจร คุณโทร 1669 ผ่าน speakerphone และเริ่มกดหน้าอก',
        question: 'อัตราส่วน compression:ventilation สำหรับผู้ช่วยคนเดียวในผู้ใหญ่คือ และต่างจากกรณี 2-rescuer ในเด็กอย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: '30:2 (ผู้ช่วยคนเดียวใช้ 30:2 ทุกช่วงอายุ) — ส่วน 15:2 ใช้เฉพาะ 2-rescuer HCP ในเด็ก/ทารก', correct: true, feedback: 'ถูกต้อง — 1-rescuer = 30:2 เสมอ (ผู้ใหญ่/เด็ก/ทารก); 15:2 สงวนไว้สำหรับ 2-rescuer HCP ในเด็กและทารกเท่านั้น' },
          { label: '15:2 เพราะช่วยคนเดียวต้องเน้นการช่วยหายใจให้มากขึ้น', correct: false, feedback: 'ผิด — 15:2 ใช้กับ 2-rescuer ในเด็ก/ทารก ผู้ช่วยคนเดียวในผู้ใหญ่ใช้ 30:2', trap: true },
          { label: 'กดต่อเนื่องอย่างเดียวไม่ต้องช่วยหายใจ เพราะอยู่คนเดียว', correct: false, feedback: 'ผิด — hand-only เป็นทางเลือกของ lay rescuer เท่านั้น BLS-HCP ต้องช่วยหายใจด้วย 30:2' },
          { label: '30:2 สำหรับผู้ใหญ่ แต่ถ้าเป็นเด็กคนเดียวต้องใช้ 15:2', correct: false, feedback: 'ผิด — ผู้ช่วยคนเดียวใช้ 30:2 ทุกช่วงอายุ รวมทั้งเด็กและทารก' },
        ],
      },
      {
        situation: 'ระหว่างที่คุณกดหน้าอกอยู่คนเดียว มีคนเดินผ่านมาถือ AED มาให้พอดี',
        question: 'ควรจัดการกับ AED ที่เพิ่งมาถึงอย่างไรเพื่อลดการหยุดกด?',
        timeLimitSec: 20,
        options: [
          { label: 'ให้คนที่เดินผ่านมาช่วยติด pads ระหว่างที่คุณยังกดหน้าอกอยู่ แล้วหยุดกดเฉพาะตอนเครื่องวิเคราะห์', correct: true, feedback: 'ถูกต้อง — ติด pads ระหว่างกดลดเวลา interrupt หยุดกดเฉพาะช่วงวิเคราะห์/shock เพื่อ early defib และคง CCF สูง' },
          { label: 'กดต่ออีกจนครบ 2 นาทีก่อน แล้วค่อยหยุดเพื่อติด AED', correct: false, feedback: 'ผิด — ควรใช้ AED ทันทีที่มาถึง ไม่ต้องรอครบรอบ ทุกนาทีที่ชะลอ defib ลดโอกาสรอด', trap: true },
          { label: 'หยุด CPR ทั้งหมดเพื่อติด pads ให้เรียบร้อยก่อนแล้วค่อยกดต่อ', correct: false, feedback: 'ไม่ดีที่สุด — ควรพยายามกดต่อระหว่างติด pads เพื่อลดการหยุด การหยุดนานลด perfusion' },
          { label: 'รอให้จังหวะหัวใจกลับมาเองก่อนจึงใช้ AED', correct: false, feedback: 'ผิด — ต้องใช้ AED ทันทีเพื่อวิเคราะห์และ shock ถ้าจำเป็น ไม่มีเหตุให้รอ' },
        ],
      },
      {
        situation: 'AED วิเคราะห์และ shock ไป 1 ครั้ง คุณกดต่อจนเริ่มเหนื่อยล้ามาก แต่ยังไม่มีใครมาสลับ และ EMS ยังไม่ถึง',
        question: 'ควรทำอย่างไรต่อ?',
        cprDrill: true,
        timeLimitSec: 20,
        options: [
          { label: 'กดต่อไปแม้คุณภาพจะลดลงบ้าง จนกว่าจะมีคนมาสลับ/EMS มาถึง/หมดแรงจริง ๆ', correct: true, feedback: 'ถูกต้อง — การหยุดกดลด coronary perfusion อย่างมาก การกดต่อแม้คุณภาพลดลงยังดีกว่าการหยุด ลองกดต่อ 30 วินาที' },
          { label: 'หยุดพักเป็นช่วง ๆ ครั้งละ 10 วินาทีทุกนาทีเพื่อรักษาคุณภาพการกด', correct: false, feedback: 'ผิด — การหยุดเป็นช่วง ๆ ลด CCF และ perfusion การกดต่อเนื่องแม้เหนื่อยดีกว่า', trap: true },
          { label: 'หยุด CPR ทั้งหมดแล้วนั่งรอ EMS เพื่อสงวนแรง', correct: false, feedback: 'ผิด — การหยุดทำให้ perfusion หายไปเกือบหมด ต้องพยายามกดต่อจนมีคนมาช่วย' },
          { label: 'ลดอัตราการกดลงเหลือ 60/นาทีเพื่อให้กดได้นานขึ้น', correct: false, feedback: 'ผิด — อัตราต่ำกว่า 100/นาทีให้ flow ไม่พอ ควรรักษา 100–120/นาที และหาคนมาสลับโดยเร็ว' },
        ],
      },
    ],
  },

  // ===================== ด่าน 5 — 2-rescuer / Team Dynamics / ROSC =====================
  // เคสเดียว: code blue ในทีม ตั้งแต่ team dynamics จนผู้ป่วย ROSC
  {
    id: 'stage-5-team-rosc',
    chapterId: 'bls-4',
    stageNumber: 5,
    title: '2-rescuer, Team Dynamics, ROSC',
    subtitle: 'บทที่ 5 · ทีมทำงานจนผู้ป่วยฟื้น (ROSC)',
    emoji: '🤝',
    passScore: 80,
    steps: [
      {
        situation: 'ทีม code blue 4 คนกำลังช่วยผู้ป่วยรายนี้ หัวหน้าทีมสั่งดัง ๆ ว่า "คุณ A ขอ epinephrine 1 mg IV ตอนนี้"',
        question: 'ในฐานะ "คุณ A" ควรตอบสนองอย่างไรตามหลัก closed-loop communication?',
        timeLimitSec: 20,
        options: [
          { label: 'ทวนคำสั่งให้หัวหน้าได้ยิน → เตรียมและให้ยา → รายงานกลับเมื่อเสร็จพร้อมเวลา เช่น "ให้ epinephrine 1 mg IV แล้ว เวลา 14:32"', correct: true, feedback: 'ถูกต้อง — closed-loop: สั่ง → ทวน/ยืนยัน → ทำ → รายงานกลับ ลด miscommunication และช่วยให้ documentation ถูกต้องใน high-stress environment' },
          { label: 'เตรียมและให้ยาเงียบ ๆ อย่างรวดเร็วโดยไม่ต้องพูดเพื่อไม่รบกวนทีม', correct: false, feedback: 'ผิด — ต้องทวนคำสั่งและรายงานกลับเสมอ การทำเงียบ ๆ ทำให้หัวหน้าไม่รู้ว่ายาถูกให้แล้วหรือยัง เสี่ยงให้ซ้ำ', trap: true },
          { label: 'รอให้หัวหน้าทีมยืนยันคำสั่งซ้ำอีกครั้งก่อนจึงเริ่มทำ', correct: false, feedback: 'ผิด — ต้องตอบสนองทันทีด้วยการทวนคำสั่ง ไม่ต้องรอถามซ้ำ การรอทำให้การรักษาช้า' },
          { label: 'ให้ยาแล้วบันทึกลงเอกสารอย่างเดียว ไม่ต้องรายงานด้วยเสียง', correct: false, feedback: 'ผิด — closed-loop ต้องรายงานกลับด้วยเสียงให้ทีมรับรู้ ไม่ใช่แค่จดบันทึก' },
        ],
      },
      {
        situation: 'ผู้กดหน้าอกคนปัจจุบันทำมาเกือบ 2 นาที CPR Coach เตือนว่าความลึกเริ่มตื้นลง',
        question: 'ควรสลับคนกดเมื่อใด และการสลับ/หยุดกดแต่ละครั้งไม่ควรเกินกี่วินาทีตามแนวทาง 2025?',
        timeLimitSec: 20,
        options: [
          { label: 'สลับทุก 2 นาที หรือเร็วกว่านั้นถ้าคุณภาพเริ่มลด และจำกัดการหยุดกดทุกครั้งไม่เกิน 10 วินาที', correct: true, feedback: 'ถูกต้อง — สลับทุก 2 นาที (หรือเร็วกว่าถ้าเหนื่อย) และ formal limit ของการหยุดกดทุกประเภทคือ ≤ 10 วินาที เพื่อคง CCF > 80%' },
          { label: 'สลับทุก 2 นาที และการหยุดกดจะเกิน 10 วินาทีได้ถ้าจำเป็นต้องจัดตำแหน่งให้ดี', correct: false, feedback: 'ผิด — การหยุดกดต้องไม่เกิน 10 วินาทีเสมอ แม้ต้องจัดตำแหน่ง ให้วางแผนสลับให้ไวเพื่อไม่เกินเวลา', trap: true },
          { label: 'สลับทุก 30 วินาทีเพื่อไม่ให้ผู้กดเหนื่อยเลย', correct: false, feedback: 'ผิด — สลับถี่เกินไปเพิ่มจำนวน interruption โดยไม่จำเป็น มาตรฐานคือทุก 2 นาที' },
          { label: 'ให้คนเดิมกดยาว ๆ จนกว่าจะหมดแรง เพื่อลดจำนวนครั้งที่ต้องหยุด', correct: false, feedback: 'ผิด — คุณภาพลดลงมากก่อนหมดแรง ต้องสลับทุก 2 นาทีเพื่อรักษาความลึก/อัตรา' },
        ],
      },
      {
        situation: 'มีสมาชิกใหม่เข้ามาเสริมทีมและถามว่า "CPR Coach" ที่กำลังทำหน้าที่อยู่นั้นมีบทบาทอะไร',
        question: 'ข้อใดอธิบายบทบาทของ CPR Coach ได้ถูกต้องที่สุด?',
        timeLimitSec: 25,
        options: [
          { label: 'เฝ้าดูคุณภาพการกด (ความลึก/อัตรา/full recoil) แบบ real-time, แจ้งสลับคนเมื่อคุณภาพลด และคุมการหยุดกดให้ ≤ 10 วินาที', correct: true, feedback: 'ถูกต้อง — CPR Coach เป็นบทบาทเสริมที่ focus เฉพาะคุณภาพ CPR ไม่ได้แทน Team Leader' },
          { label: 'เข้าควบคุมและตัดสินใจแทน Team Leader ในทุกเรื่องระหว่าง code', correct: false, feedback: 'ผิด — Coach ไม่ได้ควบคุมทีมแทน Team Leader หน้าที่คือดูแลคุณภาพการกดหน้าอกโดยเฉพาะ', trap: true },
          { label: 'ตัดสินใจเลือกและสั่งยาแทนแพทย์ประจำทีม', correct: false, feedback: 'ผิด — ไม่เกี่ยวกับการสั่งยา เป็นบทบาทด้านคุณภาพ CPR ล้วน ๆ' },
          { label: 'รับผิดชอบการใส่ advanced airway และดูแลทางเดินหายใจ', correct: false, feedback: 'ผิด — airway เป็นหน้าที่ของตำแหน่ง airway ไม่ใช่ CPR Coach' },
        ],
      },
      {
        situation: 'ระหว่างกดหน้าอกรอบใหม่ ผู้ป่วยเริ่มขยับตัว มีการไอ และพยายามลืมตา',
        question: 'ควรทำอย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: 'หยุดกดสั้น ๆ แล้วคลำชีพจร/ประเมินการหายใจทันที (ไม่ต้องรอครบรอบ 2 นาที)', correct: true, feedback: 'ถูกต้อง — การขยับตัว ไอ ลืมตา เป็นสัญญาณบ่งชี้ ROSC ควรหยุดกดสั้น ๆ ตรวจทันที ถ้ามีชีพจรก็เข้าสู่การดูแลหลัง ROSC' },
          { label: 'กดหน้าอกต่อจนครบรอบ 2 นาทีก่อนแล้วค่อยประเมิน', correct: false, feedback: 'ผิด — เมื่อมีสัญญาณ ROSC ชัดเจน (ขยับ/ไอ/ลืมตา) ควรหยุดตรวจทันที ไม่ต้องรอครบรอบ การกดต่อในคนที่มีชีพจรแล้วอาจเป็นอันตราย', trap: true },
          { label: 'เพิ่มความเร็วการกดเพราะผู้ป่วยกำลังจะฟื้น', correct: false, feedback: 'ผิด — ต้องหยุดประเมินก่อน ไม่ใช่เร่งกด สัญญาณเหล่านี้บอกให้ตรวจชีพจรทันที' },
          { label: 'ให้ยา sedation เพื่อให้ผู้ป่วยนิ่งจะได้กดต่อได้', correct: false, feedback: 'ผิด — ไม่ใช่ขั้นตอนของ BLS และผิดหลักการ สัญญาณ ROSC ต้องนำไปสู่การประเมิน ไม่ใช่กดต่อ' },
        ],
      },
      {
        situation: 'ตรวจแล้วผู้ป่วยมีชีพจรและหายใจเองได้ปกติ (ROSC) แต่ยังไม่รู้สึกตัว ไม่มีประวัติอุบัติเหตุ/ตกจากที่สูง',
        question: 'ควรดูแลอย่างไรต่อ?',
        timeLimitSec: 20,
        options: [
          { label: 'จัดท่า recovery position กัน aspiration + monitor ใกล้ชิด + เรียก ALS/ICU รับช่วง โดยยังไม่ถอด pads', correct: true, feedback: 'ถูกต้อง — ROSC + หายใจปกติ + ไม่รู้สึกตัว → recovery position, เฝ้าระวัง re-arrest, คง pads ไว้เผื่อ shock ซ้ำ (ถ้าสงสัย spinal injury จึงเปิด airway ด้วย jaw-thrust แทน)' },
          { label: 'กดหน้าอกต่ออีกสักพักเพื่อความปลอดภัยไว้ก่อน', correct: false, feedback: 'ผิด — มีชีพจรและหายใจเองแล้ว การกดต่อไม่จำเป็นและอาจเป็นอันตราย', trap: true },
          { label: 'ปิดเครื่อง AED และถอด pads ออกทันทีเพราะผู้ป่วยฟื้นแล้ว', correct: false, feedback: 'ผิด — ห้ามถอด pads จนกว่าจะส่งต่อทีมเสร็จ เผื่อ re-arrest จะได้ shock ได้ทันที' },
          { label: 'ให้ผู้ป่วยนอนหงายเฉย ๆ แล้วรอ ALS โดยไม่ต้องจัดท่า', correct: false, feedback: 'ผิด — ผู้ป่วยไม่รู้สึกตัวเสี่ยงสำลัก ควรจัดท่า recovery position (เว้นแต่สงสัย spinal injury)' },
        ],
      },
    ],
  },

  // ===================== ด่าน 6 — ใน รพ. Defib AED mode =====================
  // เคสเดียว: BLS provider นำ defib/monitor ของ รพ. มาถึง จนส่งต่อ ALS
  {
    id: 'stage-6-inhospital-defib',
    chapterId: 'bls-5',
    stageNumber: 6,
    title: 'BLS ในโรงพยาบาล — Defib AED Mode',
    subtitle: 'บทที่ 6 · จากเครื่อง รพ. ถึงส่งต่อ ALS',
    emoji: '🏥',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเป็น BLS provider คนแรกที่นำเครื่อง defibrillator/monitor ของโรงพยาบาล (มีทั้ง AED mode และ Manual mode) มาถึงข้างเตียงผู้ป่วยที่กำลังทำ CPR',
        question: 'หลังเปิดเครื่อง ขั้นตอนแรกที่ถูกต้องคืออะไร?',
        timeLimitSec: 20,
        options: [
          { label: 'เลือก AED mode แล้วติด pads ให้เครื่องวิเคราะห์', correct: true, feedback: 'ถูกต้อง — BLS provider ใช้ AED mode (ไม่ได้ถูกฝึกอ่าน rhythm เอง) เลือก mode → ติด pads → ให้เครื่องวิเคราะห์อัตโนมัติ' },
          { label: 'อ่านคลื่นหัวใจบนจอ ประเมินว่าเป็น VF/pVT แล้วเลือกระดับพลังงาน (Joule) เอง', correct: false, feedback: 'ผิด — การอ่าน rhythm และเลือก Joule เองเป็นทักษะระดับ ACLS เกิน scope ของ BLS-HCP ให้ใช้ AED mode', trap: true },
          { label: 'รอ ALS team มาถึงก่อนจึงเริ่มใช้เครื่อง', correct: false, feedback: 'ผิด — BLS provider ต้องเริ่ม AED mode ทันทีที่เครื่องมาถึง early defib สำคัญ ห้ามรอ ALS' },
          { label: 'เปิดทาง IV ให้เสร็จก่อนแล้วจึงติด pads', correct: false, feedback: 'ผิด — ลำดับความสำคัญคือวิเคราะห์จังหวะและ shock ก่อน ไม่ใช่ IV' },
        ],
      },
      {
        situation: 'เพื่อนร่วมทีมถามว่าทำไมโรงพยาบาลถึงใช้เครื่อง defib/monitor ที่มี AED mode แทนที่จะใช้ AED stand-alone แบบที่วางตามที่สาธารณะ',
        question: 'ข้อใดคือเหตุผลหลักที่ถูกต้อง?',
        timeLimitSec: 25,
        options: [
          { label: 'เป็นเครื่องเดียวกับที่ ALS team ใช้ — BLS provider shock ได้ทันทีใน AED mode แล้ว ALS switch เป็น manual mode ต่อได้อย่างไร้รอยต่อ ไม่ต้องเปลี่ยนเครื่อง', correct: true, feedback: 'ถูกต้อง — ข้อดีคือความต่อเนื่องของการดูแล เครื่องเดียวใช้ได้ทั้ง BLS (AED mode) และ ALS (manual mode + monitor/pacing/sync)' },
          { label: 'เพราะ AED stand-alone ให้พลังงาน shock ต่ำเกินไปสำหรับผู้ป่วยในโรงพยาบาล', correct: false, feedback: 'ผิด — ไม่เกี่ยวกับความแรงของ shock เหตุผลคือความต่อเนื่องกับทีม ALS และความสามารถของเครื่อง', trap: true },
          { label: 'เพราะกฎหมายห้ามใช้ AED stand-alone ภายในโรงพยาบาล', correct: false, feedback: 'ผิด — ไม่ใช่เรื่องกฎหมาย เป็นเรื่องการใช้เครื่องเดียวต่อเนื่องระหว่าง BLS และ ALS' },
          { label: 'ไม่มีความแตกต่างที่มีนัยสำคัญ เลือกใช้เครื่องแบบใดก็ได้', correct: false, feedback: 'ผิด — มีเหตุผลชัดเจนที่โรงพยาบาลเลือกเครื่อง 2-mode คือความต่อเนื่องและความสามารถของเครื่อง' },
        ],
      },
      {
        situation: 'เครื่องในโหมด AED ประกาศ "Shock advised" คุณเคลียร์คนและ shock ไป 1 ครั้ง',
        question: 'ควรทำอะไรต่อทันที?',
        cprDrill: true,
        timeLimitSec: 15,
        options: [
          { label: 'เริ่ม CPR ต่อทันที 2 นาที โดยไม่ตรวจชีพจร', correct: true, feedback: 'ถูกต้อง — AED mode ใช้ flow เดียวกับ AED ปกติ หลัง shock ต้องกดหน้าอกต่อทันที เครื่องจะวิเคราะห์ใหม่เองเมื่อครบ 2 นาที' },
          { label: 'Switch เป็น manual mode เองเพื่อดู rhythm ว่า shock ได้ผลไหม', correct: false, feedback: 'ผิด — BLS provider ไม่ switch เป็น manual mode เอง (เกิน scope) และต้องกดหน้าอกต่อ ไม่ใช่หยุดดูจอ', trap: true },
          { label: 'ตรวจชีพจรทันทีหลัง shock เพื่อประเมินผล', correct: false, feedback: 'ผิด — ห้ามหยุดตรวจชีพจรทันทีหลัง shock ต้องกดหน้าอกต่อ 2 นาทีก่อน' },
          { label: 'รอเครื่องวิเคราะห์จังหวะซ้ำทันทีโดยไม่กดหน้าอก', correct: false, feedback: 'ผิด — ต้องกดหน้าอกต่อทันที เครื่องจะ prompt วิเคราะห์เองเมื่อครบ 2 นาที' },
        ],
      },
      {
        situation: 'ระหว่างที่ทีมกำลัง CPR อยู่ ALS team มาถึงพร้อมหัวหน้าทีม',
        question: 'ควรจัดการเรื่องเครื่อง defib และการส่งต่อ (hand-off) อย่างไร?',
        timeLimitSec: 25,
        options: [
          { label: 'หัวหน้า ALS switch เครื่องเป็น manual mode ต่อบน pads เดิม + รับ hand-off แบบ closed-loop (เวลาเริ่ม CPR, จำนวน/เวลา shock, rhythm ที่เห็น, ยาที่ให้)', correct: true, feedback: 'ถูกต้อง — ใช้เครื่องเดิม pads เดิม เพียง switch mode และส่ง hand-off ข้อมูลสำคัญให้ครบด้วย closed-loop' },
          { label: 'ถอด pads ออกและเปลี่ยนไปใช้เครื่อง manual ของ ALS อีกเครื่อง', correct: false, feedback: 'ผิด — ไม่ต้องถอด pads หรือเปลี่ยนเครื่อง จุดเด่นของเครื่อง 2-mode คือใช้ต่อได้เลย', trap: true },
          { label: 'BLS provider ทำ AED mode ต่อไปเรื่อย ๆ ไม่ต้องส่งต่อให้ ALS', correct: false, feedback: 'ผิด — เมื่อ ALS มาถึงควรส่งต่อให้ switch เป็น manual mode เพื่อการดูแลที่ละเอียดขึ้น' },
          { label: 'ปิดเครื่องก่อนเพื่อรีเซ็ต แล้วให้ ALS เปิดใหม่ใน manual mode', correct: false, feedback: 'ผิด — ไม่จำเป็นต้องปิดเครื่อง (เสียเวลาและ pads) สามารถ switch mode ได้ทันที' },
        ],
      },
      {
        situation: 'ALS team จะเปิดทางให้ยา และขอให้คุณช่วยเตรียม หัวหน้าถามถึงลำดับการเปิด vascular access ตามแนวทาง 2025',
        question: 'ลำดับการเปิดทางให้ยาที่ถูกต้องคือ?',
        timeLimitSec: 20,
        options: [
          { label: 'เริ่ม peripheral IV ก่อน — ถ้าไม่สำเร็จใน 1–2 ครั้งให้เปลี่ยนเป็น IO (intraosseous) ทันที', correct: true, feedback: 'ถูกต้อง — peripheral IV เป็นทางเลือกแรก ถ้าล้มเหลวเปลี่ยนเป็น IO ทันทีโดยไม่เสียเวลา' },
          { label: 'ให้ยาทาง ETT (ท่อช่วยหายใจ) เป็นทางเลือกแรกเพราะใส่ท่อไว้แล้ว', correct: false, feedback: 'ผิด — การให้ยาทาง ETT ไม่แนะนำแล้วในแนวทาง 2025 ใช้ IV แล้วต่อด้วย IO', trap: true },
          { label: 'ใส่ central line ก่อนเสมอเพื่อให้ยาเข้าถึง central circulation เร็วที่สุด', correct: false, feedback: 'ผิด — central line ไม่จำเป็นระหว่าง resuscitation เพิ่มความเสี่ยงและทำให้ CPR หยุดชะงัก' },
          { label: 'พยายามเปิด IV ต่อไปเรื่อย ๆ จนสำเร็จ ไม่ต้องใช้ IO', correct: false, feedback: 'ผิด — ถ้า IV ไม่สำเร็จใน 1–2 ครั้งต้องเปลี่ยนเป็น IO ทันที ไม่ควรพยายามซ้ำจนเสียเวลา' },
        ],
      },
    ],
  },

  // ===================== ด่าน 7 — CPR ทารก =====================
  // เคสเดียว: ทารก 3 เดือน ตั้งแต่ประเมินจนกดหน้าอก 2-rescuer
  {
    id: 'stage-7-infant-cpr',
    chapterId: 'bls-6',
    stageNumber: 7,
    title: 'CPR ในทารก (< 1 ปี)',
    subtitle: 'บทที่ 7 · ทารก 3 เดือนหนึ่งราย ตั้งแต่ประเมินจนกด',
    emoji: '👶',
    passScore: 80,
    steps: [
      {
        situation: 'ทารกอายุ 3 เดือน ถูกอุ้มมาส่งด้วยอาการตัวอ่อนปวกเปียก ไม่ตอบสนอง คุณต้องประเมินชีพจร',
        question: 'ควรตรวจชีพจรที่ตำแหน่งใด และใช้เวลานานสุดเท่าไร?',
        timeLimitSec: 20,
        options: [
          { label: 'Brachial (ต้นแขนด้านใน) หรือ femoral — ไม่เกิน 10 วินาที', correct: true, feedback: 'ถูกต้อง — brachial เป็นมาตรฐานในทารก femoral ใช้แทนได้ carotid คลำยากเพราะคอทารกสั้น ประเมิน ≤ 10 วินาที' },
          { label: 'Carotid ที่คอ เหมือนผู้ใหญ่ — ไม่เกิน 10 วินาที', correct: false, feedback: 'ผิด — carotid คลำยากในทารกเพราะคอสั้น ให้ใช้ brachial หรือ femoral แทน', trap: true },
          { label: 'Radial ที่ข้อมือ — ไม่เกิน 10 วินาที', correct: false, feedback: 'ผิด — radial ไม่ใช่ตำแหน่งมาตรฐานสำหรับประเมินภาวะหัวใจหยุดเต้นในทารก' },
          { label: 'ฟังเสียงหัวใจด้วย stethoscope แทนการคลำ', correct: false, feedback: 'ผิด — BLS ใช้การคลำชีพจรโดยตรง (brachial/femoral) ไม่ใช้การฟัง' },
        ],
      },
      {
        situation: 'คุณช่วยหายใจและให้ O₂ อย่างเพียงพอแล้ว แต่ประเมินพบอัตราการเต้นหัวใจ < 60 ครั้ง/นาที ร่วมกับ perfusion ไม่ดี (ตัวลาย ซีด)',
        question: 'ควรทำอะไรต่อ?',
        timeLimitSec: 20,
        options: [
          { label: 'เริ่มกดหน้าอกทันที', correct: true, feedback: 'ถูกต้อง — ในทารก HR < 60 ร่วมกับ poor perfusion แม้ ventilate/O₂ เพียงพอแล้ว ถือเป็นข้อบ่งชี้ให้เริ่มกดหน้าอก (ต่างจากผู้ใหญ่ที่ดูการไม่มีชีพจร)' },
          { label: 'ช่วยหายใจต่อไปอีกสักพักแล้วประเมินซ้ำ ยังไม่ต้องกดหน้าอก', correct: false, feedback: 'ผิด — เมื่อ ventilate เพียงพอแล้วแต่ HR ยัง < 60 + perfusion ไม่ดี ต้องเริ่มกดหน้าอกเลย ไม่ใช่ ventilate อย่างเดียวต่อ', trap: true },
          { label: 'ให้ยากระตุ้นหัวใจก่อนเริ่มกดหน้าอก', correct: false, feedback: 'ผิด — การให้ยาไม่ใช่ขั้นตอน BLS และไม่ใช่ลำดับที่ถูก ต้องเริ่มกดหน้าอกก่อน' },
          { label: 'รอประเมินซ้ำใน 2 นาทีก่อนตัดสินใจ', correct: false, feedback: 'ผิด — เข้าเกณฑ์กดหน้าอกแล้ว ต้องเริ่มทันที การรอทำให้ perfusion แย่ลง' },
        ],
      },
      {
        situation: 'มีผู้ช่วยเหลืออีกคน (เป็น HCP ทั้งคู่) เข้ามาช่วย พร้อมกดหน้าอกทารกแบบ 2 คน',
        question: 'เทคนิคการกดหน้าอกใดที่แนะนำสำหรับ 2-rescuer ในทารก?',
        cprDrill: true,
        timeLimitSec: 20,
        options: [
          { label: '2-thumb encircling technique — โอบรอบหน้าอกด้วยสองมือ ใช้นิ้วโป้งทั้งสองกดบน sternum ครึ่งล่าง', correct: true, feedback: 'ถูกต้อง — 2-thumb encircling ให้ output/depth ดีที่สุดใน 2-rescuer ถ้ามือเล็กโอบไม่รอบให้ใช้ heel-of-1-hand แทน ลองจับจังหวะ 30 วินาที' },
          { label: '2-finger technique — ใช้ 2 นิ้วกดบน sternum', correct: false, feedback: 'ผิด — แนวทาง 2025 เลิกใช้ 2-finger technique แล้วเพราะมักกดได้ไม่ลึกพอ', trap: true },
          { label: 'Heel of hand เต็มฝ่ามือแบบเดียวกับผู้ใหญ่', correct: false, feedback: 'ผิด — ผู้ใหญ่ใช้ประสานสองมือเต็มแรง ทารกใช้ 2-thumb encircling (หรือ heel-of-1-hand ถ้าจำเป็น)' },
          { label: 'ใช้ฝ่ามือทั้งสองข้างประกบด้านหน้า-หลังบีบหน้าอก', correct: false, feedback: 'ผิด — ไม่ใช่เทคนิคที่แนะนำ การกดหน้าอกทารกใช้ 2-thumb encircling ที่ sternum ครึ่งล่าง' },
        ],
      },
      {
        situation: 'คุณกำลังกดหน้าอกทารกด้วย 2-thumb encircling',
        question: 'ความลึกและอัตราการกดหน้าอกทารกที่ถูกต้องคือ?',
        timeLimitSec: 20,
        options: [
          { label: 'ลึกประมาณ 4 ซม. (หรือ 1/3 ของ AP diameter) อัตรา 100–120 ครั้ง/นาที', correct: true, feedback: 'ถูกต้อง — ทารกใช้เกณฑ์ 1/3 ของ AP diameter ซึ่งประมาณ 4 ซม. อัตราเท่าผู้ใหญ่คือ 100–120/นาที' },
          { label: 'ลึก 5–6 ซม. เท่าผู้ใหญ่ อัตรา 100–120 ครั้ง/นาที', correct: false, feedback: 'ผิด — 5–6 ซม. เป็นเกณฑ์ของผู้ใหญ่ ทารกตัวเล็กกว่ามาก ใช้ประมาณ 4 ซม. (1/3 AP)', trap: true },
          { label: 'ลึกประมาณ 2 ซม. อัตรา 100–120 ครั้ง/นาที', correct: false, feedback: 'ผิด — 2 ซม. ตื้นเกินไป ได้ output ไม่พอ เกณฑ์คือ ~4 ซม. (1/3 AP diameter)' },
          { label: 'ลึกเท่าที่ทำได้โดยไม่มีขีดจำกัด อัตรา 80–100 ครั้ง/นาที', correct: false, feedback: 'ผิด — มีเกณฑ์ความลึกชัดเจน (~4 ซม.) และอัตราคือ 100–120/นาที' },
        ],
      },
      {
        situation: 'ทีม 2-rescuer HCP กำลังทำ CPR ทารกร่วมกัน (ยังไม่ได้ใส่ advanced airway)',
        question: 'อัตราส่วน compression:ventilation สำหรับ 2-rescuer HCP ในทารกคือ และต่างจาก 1-rescuer อย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: '15:2 (2-rescuer HCP ในเด็ก/ทารก) — ต่างจาก 1-rescuer ที่ใช้ 30:2', correct: true, feedback: 'ถูกต้อง — 2-rescuer HCP ในเด็ก/ทารกใช้ 15:2 เพื่อเพิ่มสัดส่วนการช่วยหายใจ ส่วน 1-rescuer ใช้ 30:2 ทุกช่วงอายุ' },
          { label: '30:2 เหมือนกันทุกกรณีไม่ว่ากี่คนช่วย', correct: false, feedback: 'ผิด — 30:2 ใช้สำหรับ 1-rescuer เมื่อมี 2-rescuer HCP ในเด็ก/ทารกเปลี่ยนเป็น 15:2', trap: true },
          { label: '5:1 ตามอัตราส่วนเด็กแบบเก่า', correct: false, feedback: 'ผิด — ไม่ใช่อัตราส่วนมาตรฐานในแนวทางปัจจุบัน' },
          { label: '15:1 เพื่อเน้นการกดให้มากกว่าการช่วยหายใจ', correct: false, feedback: 'ผิด — อัตราส่วนที่ถูกคือ 15:2 (ไม่ใช่ 15:1) สำหรับ 2-rescuer HCP ในทารก' },
        ],
      },
    ],
  },

  // ===================== ด่าน 8 — FBAO / สำลัก =====================
  // เคสเดียว: ชายผู้ใหญ่สำลักอาหาร ตั้งแต่รู้สึกตัวจนหมดสติและฟื้น
  {
    id: 'stage-8-fbao',
    chapterId: 'bls-7',
    stageNumber: 8,
    title: 'ทางเดินหายใจอุดกั้น (FBAO)',
    subtitle: 'บทที่ 8 · ชายสำลักหนึ่งราย ตั้งแต่รู้ตัวจนฟื้น',
    emoji: '🫁',
    passScore: 80,
    steps: [
      {
        situation: 'ในร้านอาหาร ชายวัย 45 ปีกำลังกินอยู่ จู่ ๆ ลุกขึ้นเอามือกุมคอ หน้าเริ่มแดง พยายามไอแต่ไม่มีเสียง พูดไม่ได้ หายใจเข้าลำบาก',
        question: 'ประเมินแล้วเป็น severe obstruction ควรทำอะไรตามแนวทาง ILCOR 2025?',
        timeLimitSec: 20,
        options: [
          { label: '5 back blows (ตบกลางสะบัก) สลับกับ 5 abdominal thrusts (Heimlich) ทำซ้ำจนสิ่งของออกหรือผู้ป่วยหมดสติ', correct: true, feedback: 'ถูกต้อง — พูดไม่ได้ + ไอไม่มีเสียง = severe obstruction ในผู้ใหญ่ใช้ back blows สลับ abdominal thrusts ครั้งละ 5' },
          { label: 'กระตุ้นให้ผู้ป่วยไอแรง ๆ ต่อไป และคอยเฝ้าดูอยู่ใกล้ ๆ', correct: false, feedback: 'ผิด — การกระตุ้นให้ไอใช้กับ mild obstruction (ยังไอมีเสียง/พูดได้) เท่านั้น เคสนี้ severe ต้องลงมือช่วยทันที', trap: true },
          { label: 'ให้ผู้ป่วยดื่มน้ำเพื่อช่วยดันสิ่งของลงไป', correct: false, feedback: 'ผิด — อันตราย อาจทำให้อุดกั้นแย่ลงหรือสำลักน้ำ ไม่ใช่การรักษา FBAO' },
          { label: 'เริ่ม CPR ทันทีทั้งที่ผู้ป่วยยังรู้สึกตัวและยืนอยู่', correct: false, feedback: 'ผิด — ผู้ป่วยยังรู้สึกตัว ต้องทำ back blows/abdominal thrusts ก่อน CPR เริ่มเมื่อหมดสติ' },
        ],
      },
      {
        situation: 'คุณทำ back blows สลับ abdominal thrusts อยู่ แต่ผู้ป่วยเริ่มหมดสติและทรุดลงกับพื้น',
        question: 'ควรทำอะไรทันที?',
        cprDrill: true,
        timeLimitSec: 20,
        options: [
          { label: 'ประคองลงกับพื้น เริ่ม CPR ทันที (ไม่ต้องคลำชีพจร) และก่อนช่วยหายใจแต่ละครั้งให้ดูในปากก่อน', correct: true, feedback: 'ถูกต้อง — เมื่อหมดสติให้เปลี่ยนเป็น CPR ทันที การกดหน้าอกยังช่วยเพิ่มความดันในอกดันสิ่งของด้วย ก่อน breath ให้ดูในปาก ลองจับจังหวะกด 30 วินาที' },
          { label: 'ทำ abdominal thrusts ต่อในท่านอนราบเพราะสิ่งของยังไม่ออก', correct: false, feedback: 'ผิด — เมื่อหมดสติแล้วต้องเปลี่ยนเป็น CPR ไม่ทำ abdominal thrusts ในท่านอนต่อ', trap: true },
          { label: 'จับผู้ป่วยนั่งพิงแล้วทำ back blows ต่อ', correct: false, feedback: 'ผิด — ผู้ป่วยหมดสติต้องนอนราบและเริ่ม CPR ไม่ใช่พยุงนั่งทำ back blows' },
          { label: 'รอ EMS มาก่อนเพราะกลัวกดหน้าอกจะดันสิ่งของลึกขึ้น', correct: false, feedback: 'ผิด — ต้องเริ่ม CPR ทันที ห้ามรอ การกดหน้าอกเป็นส่วนหนึ่งของการช่วย FBAO ที่หมดสติ' },
        ],
      },
      {
        situation: 'คุณทำ CPR ผู้ป่วยรายนี้อยู่ และกำลังจะช่วยหายใจครั้งต่อไป',
        question: 'ก่อนให้ breath แต่ละครั้งควรทำอะไร และห้ามทำอะไรเด็ดขาด?',
        timeLimitSec: 20,
        options: [
          { label: 'เปิดปากดูก่อนทุกครั้ง ถ้าเห็นสิ่งของที่หยิบได้ให้เอาออก — แต่ห้าม blind finger sweep (ล้วงโดยไม่เห็น)', correct: true, feedback: 'ถูกต้อง — ดูในปากก่อนแต่ละ breath หยิบเฉพาะสิ่งที่มองเห็น การ blind finger sweep เสี่ยงดันสิ่งของลึกขึ้นหรือบาดเจ็บ ห้ามทำทุกช่วงวัย' },
          { label: 'ล้วงนิ้วกวาดในคอให้ลึกที่สุดทุกครั้งก่อน breath เพื่อให้แน่ใจว่าไม่มีสิ่งของ', correct: false, feedback: 'ผิด — นี่คือ blind finger sweep ซึ่งห้ามทำเด็ดขาด เสี่ยงดันสิ่งของเข้าลึกและบาดเจ็บ', trap: true },
          { label: 'ให้ breath ต่อไปได้เลยโดยไม่ต้องดูในปาก', correct: false, feedback: 'ผิด — ในเคส FBAO ควรดูในปากก่อนแต่ละ breath เผื่อเห็นสิ่งของที่หยิบออกได้ง่าย' },
          { label: 'ใช้เครื่องดูดเสมหะล้วงลึกในคอแทนการดูด้วยตา', correct: false, feedback: 'ผิด — หลักคือดูด้วยตาแล้วหยิบสิ่งที่เห็น การล้วง/ดูดลึกโดยไม่เห็นก็เสี่ยงดันสิ่งของลึกขึ้นเช่นกัน' },
        ],
      },
      {
        situation: 'หลัง CPR ไปได้สักพัก สิ่งของหลุดออกมา ผู้ป่วยเริ่มหายใจเองและรู้สึกตัวกลับมา',
        question: 'ควรดูแลผู้ป่วยรายนี้ต่ออย่างไร?',
        timeLimitSec: 20,
        options: [
          { label: 'ให้อยู่ในท่าที่สบาย เฝ้าสังเกตอาการ และแนะนำให้ไปพบแพทย์ประเมิน โดยเฉพาะเพราะเคยได้ abdominal thrusts (เสี่ยงบาดเจ็บอวัยวะภายใน) และเสี่ยง aspiration', correct: true, feedback: 'ถูกต้อง — หลัง FBAO ที่ได้ abdominal thrusts ควรส่งประเมินทางการแพทย์เสมอ เพราะอาจมีบาดเจ็บอวัยวะภายในหรือภาวะแทรกซ้อนจากการสำลักตามมาภายหลัง' },
          { label: 'เมื่อผู้ป่วยฟื้นและหายใจได้แล้ว ถือว่าจบ ไม่ต้องพบแพทย์', correct: false, feedback: 'ผิด — abdominal thrusts อาจทำให้บาดเจ็บอวัยวะภายใน และมีความเสี่ยง aspiration ควรได้รับการประเมินทางการแพทย์', trap: true },
          { label: 'ให้ดื่มน้ำและกินอาหารต่อได้ตามปกติทันที', correct: false, feedback: 'ผิด — ควรงดและเฝ้าสังเกตก่อน รวมถึงส่งประเมินทางการแพทย์ ไม่ใช่ให้กินต่อทันที' },
          { label: 'ทำ abdominal thrusts ซ้ำอีกครั้งเพื่อความมั่นใจว่าไม่มีสิ่งของเหลือ', correct: false, feedback: 'ผิด — สิ่งของออกและผู้ป่วยหายใจได้แล้ว การทำ thrusts ซ้ำโดยไม่จำเป็นทำให้บาดเจ็บเพิ่ม' },
        ],
      },
    ],
  },
];

// ---- Final exam: a continuous review across every case ---------------------
// Instead of shuffling questions from all stages into a random jumble, walk
// through each case in order and take its opening steps — so the exam still
// reads as one flowing scenario per case, back to back, matching the way the
// stages are meant to be experienced.

export const FINAL_EXAM_ID = 'final-exam';
const FINAL_EXAM_PER_STAGE = 2;

// Deterministic-enough shuffle for a quiz context (not crypto-grade).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildFinalExam() {
  const picked = blsScenarios.flatMap((stage) =>
    stage.steps.slice(0, FINAL_EXAM_PER_STAGE).map((s) => ({
      ...s,
      cprDrill: false,           // drills belong to the per-stage cases, not the review
      sourceStage: stage.title,
    })),
  );
  return {
    id: FINAL_EXAM_ID,
    chapterId: null,
    stageNumber: blsScenarios.length + 1,
    title: 'ข้อสอบรวม — ทบทวนทุกเคส',
    subtitle: `Final Exam · ${picked.length} ข้อ ไล่ตามลำดับทุกเคส`,
    emoji: '🏆',
    passScore: 80,
    steps: picked,
  };
}

// Shuffle each step's options so the correct answer lands in a different
// position (ข้อ ก/ข/ค/ง) across questions — the data authors the correct
// option first, but players should not be able to guess by always picking A.
// getStageById() is memoized by stageId in the game (BLSScenario), so this
// runs once per stage load and the option order stays put during play.
function shuffleOptions(step) {
  return { ...step, options: shuffle(step.options) };
}

export function getStageById(id) {
  const stage = id === FINAL_EXAM_ID
    ? buildFinalExam()
    : blsScenarios.find((s) => s.id === id);
  if (!stage) return null;
  return { ...stage, steps: stage.steps.map(shuffleOptions) };
}

// ---- Progress persistence (localStorage, same pattern as EKG_TEST_PASSED_KEY) --

const PROGRESS_KEY_PREFIX = 'bls_scenario_progress_';

export function getStageProgress(stageId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY_PREFIX + stageId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStageProgress(stageId, { pct, points, passed }) {
  try {
    const prev = getStageProgress(stageId);
    const best = prev && prev.pct > pct ? prev : { pct, points, passed };
    localStorage.setItem(PROGRESS_KEY_PREFIX + stageId, JSON.stringify(best));
  } catch {
    // localStorage unavailable — progress just won't persist
  }
}

export function isFinalExamUnlocked() {
  return blsScenarios.every((s) => getStageProgress(s.id)?.passed);
}

// Aggregate status across the whole decision game (8 stages + final exam) —
// the BLS certificate requires all of it, so the cert page and the landing
// journey cards read from one source of truth.
export function getScenarioGameStatus() {
  const stagesPassed = blsScenarios.filter((s) => getStageProgress(s.id)?.passed).length;
  const finalPassed = !!getStageProgress(FINAL_EXAM_ID)?.passed;
  return {
    done: stagesPassed + (finalPassed ? 1 : 0),
    total: blsScenarios.length + 1,
    allPassed: stagesPassed === blsScenarios.length && finalPassed,
  };
}
