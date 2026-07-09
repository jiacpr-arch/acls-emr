// BLS decision-game scenarios (BLS for Healthcare Providers, ILCOR 2025).
// 8 stages, one per pre-course chapter (src/courses/bls-hcp/lessons.js), plus a
// "final exam" stage that samples questions across all 8. Each step presents a
// situation + a timed multiple-choice question; the first pick locks the step
// (no retry) and reveals the explanation. Facts (rates/depths/ratios) and the
// wrong-answer "traps" are paraphrased directly from the vetted lesson content
// in src/courses/bls-hcp/lessons.js — not invented — but should still be
// sanity-checked by the course instructor before production use. No verbatim
// ILCOR tables are quoted anywhere.
//
// Step shape:
//   {
//     situation: string,
//     question: string,
//     timeLimitSec?: number,       // default DEFAULT_TIME_LIMIT_SEC if omitted
//     cprDrill?: true,              // after a correct answer, run the 30s CPR
//                                    // metronome drill before "ถัดไป" unlocks
//     options: [
//       { label, correct?: true, feedback, trap?: true }
//     ],
//   }

export const DEFAULT_TIME_LIMIT_SEC = 20;

export const blsScenarios = [
  // ===================== ด่าน 1 — Chain of Survival / IHCA =====================
  {
    id: 'stage-1-chain',
    chapterId: 'bls-1',
    stageNumber: 1,
    title: 'Chain of Survival & IHCA',
    subtitle: 'บทที่ 1 · ภาพรวม BLS',
    emoji: '⛓️',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเป็นพยาบาลเวรดึก เดินตรวจไข้ผู้ป่วยใน ward แล้วพบผู้ป่วยนอนนิ่ง ไม่ตอบสนองเมื่อเรียก',
        question: 'ขั้นตอนแรกที่ควรทำคืออะไร?',
        options: [
          { label: 'เรียก code blue / RRT ทันที พร้อมขอ defibrillator', correct: true, feedback: 'ถูกต้อง — ใน IHCA เมื่อจดจำเหตุได้ต้อง activate ทีมทันที การช่วยเหลือคนเดียวเสียเวลาโดยไม่จำเป็น' },
          { label: 'เริ่มกดหน้าอกทันทีก่อนเรียกใคร', correct: false, feedback: 'ยังไม่ใช่ลำดับแรก — ต้อง activate code blue/RRT ก่อนหรือพร้อมกัน เพื่อให้ทีมและ defibrillator มาเร็วที่สุด' },
          { label: 'ตรวจชีพจรให้แน่ใจนาน 30 วินาที', correct: false, feedback: 'ผิด — ห้ามใช้เวลาเกิน 10 วินาทีในการตรวจชีพจร ยิ่งนานยิ่งทำให้ CPR ล่าช้า', trap: true },
          { label: 'ไปตามแพทย์เวรเองก่อนทำอะไร', correct: false, feedback: 'ผิด — การไปตามคนเองทำให้เสียเวลาและทิ้งผู้ป่วยไว้ ควรเรียกทีมผ่านระบบ code blue' },
        ],
      },
      {
        situation: 'คุณ activate code blue แล้ว ทีมกำลังมา',
        question: 'Universal Chain of Survival ปี 2025 มีกี่ห่วง และห่วงสุดท้ายคืออะไร?',
        timeLimitSec: 15,
        options: [
          { label: '6 ห่วง — ห่วงสุดท้าย Recovery & Survivorship', correct: true, feedback: 'ถูกต้อง — Universal Chain 2025 มี 6 ห่วง ครอบคลุมทั้ง IHCA/OHCA ห่วงที่ 6 เน้นการฟื้นฟูระยะยาว' },
          { label: '5 ห่วง — ห่วงสุดท้าย Post-cardiac arrest care', correct: false, feedback: 'ผิด — Post-cardiac arrest care เป็นห่วงที่ 5 ไม่ใช่ห่วงสุดท้าย ยังมีห่วง Recovery & Survivorship ต่ออีก 1 ห่วง', trap: true },
          { label: '4 ห่วง — ห่วงสุดท้าย Defibrillation', correct: false, feedback: 'ผิด — Defibrillation เป็นห่วงที่ 3 เท่านั้น ยังมีอีก 3 ห่วงต่อจากนั้น' },
          { label: 'แยกกันคนละชุดตาม IHCA/OHCA', correct: false, feedback: 'ผิด — ปี 2025 ใช้ Universal Chain เดียวครอบคลุมทั้งสองบริบท ต่างกันแค่จุดเน้นบางห่วง' },
        ],
      },
      {
        situation: 'ทีมมาถึงและเริ่มประเมินผู้ป่วยพร้อมกัน',
        question: 'การตรวจชีพจรในผู้ใหญ่ที่หมดสติ ควรใช้เวลานานสุดเท่าไร?',
        timeLimitSec: 15,
        options: [
          { label: 'ไม่เกิน 10 วินาที', correct: true, feedback: 'ถูกต้อง — ตรวจชีพจร carotid ไม่เกิน 10 วินาที ถ้าไม่แน่ใจให้เริ่ม CPR ทันที' },
          { label: '15–20 วินาที', correct: false, feedback: 'นานเกินไป — เกณฑ์คือไม่เกิน 10 วินาที' },
          { label: '30 วินาที เพื่อความชัวร์', correct: false, feedback: 'นานเกินไปมาก — การรอนานทำให้ผู้ป่วยขาด perfusion โดยไม่จำเป็น', trap: true },
          { label: '1 นาที', correct: false, feedback: 'ผิดชัดเจน — เกณฑ์คือไม่เกิน 10 วินาทีเท่านั้น' },
        ],
      },
      {
        situation: 'ระหว่างประเมิน มีคนถามว่า OHCA (นอกโรงพยาบาล) กับ IHCA (ในโรงพยาบาล) ต่างกันอย่างไรในแง่การเน้นห่วงโซ่',
        question: 'ข้อใดอธิบายความแตกต่างได้ถูกต้อง?',
        options: [
          { label: 'IHCA เน้นห่วงที่ 1 (เฝ้าระวัง/RRT/code blue ก่อน arrest); OHCA เน้น bystander CPR + AED ชุมชน + EMS', correct: true, feedback: 'ถูกต้อง — Chain เดียวกันแต่บริบทเน้นต่างจุด IHCA มีสัญญาณเตือนล่วงหน้าให้ป้องกันได้ก่อน' },
          { label: 'IHCA ไม่ต้องใช้ AED เพราะมี defibrillator อยู่แล้ว', correct: false, feedback: 'ผิด — ในโรงพยาบาลก็ใช้หลักการเดียวกัน เพียงแต่เครื่องอาจเป็น defib ที่มี AED mode' },
          { label: 'OHCA ใช้ hand-only CPR เป็นมาตรฐานสำหรับทุกคนรวม HCP', correct: false, feedback: 'ผิด — Hand-only แนะนำเฉพาะ untrained bystander เท่านั้น BLS-HCP ต้องช่วยหายใจเสมอ', trap: true },
          { label: 'ทั้งสองบริบทไม่มีความแตกต่างกันเลย', correct: false, feedback: 'ผิด — แม้ใช้ Chain เดียวกัน แต่จุดเน้นและทรัพยากรที่มีต่างกันชัดเจน' },
        ],
      },
      {
        situation: 'ทีมยืนยันว่าผู้ป่วยไม่หายใจ ไม่มีชีพจร',
        question: 'ต้องทำอะไรทันที?',
        cprDrill: true,
        options: [
          { label: 'เริ่ม CPR ทันที — กดหน้าอกคุณภาพสูง ลองจับจังหวะดู 30 วินาที', correct: true, feedback: 'ถูกต้อง — Early high-quality CPR คือห่วงที่ 2 ของ Chain of Survival ต้องเริ่มทันทีไม่รอ' },
          { label: 'รอ defibrillator มาถึงก่อนเริ่ม CPR', correct: false, feedback: 'ผิด — ห้ามรอ ต้องเริ่ม CPR ทันทีระหว่างที่รอ defibrillator' },
          { label: 'ช่วยหายใจ 2 ครั้งก่อนเริ่มกด', correct: false, feedback: 'ผิด — BLS-HCP ในภาวะหัวใจหยุดเต้นเริ่มด้วยกดหน้าอกก่อนเสมอ (ไม่ใช่เป่าปากก่อน)' },
          { label: 'รอแพทย์มาสั่งการก่อน', correct: false, feedback: 'ผิด — การช่วยชีวิตเบื้องต้นไม่ต้องรอคำสั่งแพทย์ ทุกคนในทีม BLS เริ่มได้ทันที', trap: true },
        ],
      },
    ],
  },

  // ===================== ด่าน 2 — CPR คุณภาพสูงในผู้ใหญ่ =====================
  {
    id: 'stage-2-quality-cpr',
    chapterId: 'bls-2',
    stageNumber: 2,
    title: 'CPR คุณภาพสูงในผู้ใหญ่',
    subtitle: 'บทที่ 2 · อัตรา ความลึก การคืนตัว',
    emoji: '💪',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเริ่มกดหน้าอกผู้ป่วยผู้ใหญ่ที่หัวใจหยุดเต้น',
        question: 'อัตราการกดหน้าอกที่ถูกต้องตาม ILCOR 2025 คือ?',
        timeLimitSec: 15,
        options: [
          { label: '100–120 ครั้ง/นาที', correct: true, feedback: 'ถูกต้อง — กดเร็วเกินจะได้ไม่ลึกพอ กดช้าเกินจะได้ flow ไม่พอ' },
          { label: '60–80 ครั้ง/นาที', correct: false, feedback: 'ช้าเกินไป — จะได้ cardiac output ไม่พอ' },
          { label: '80–100 ครั้ง/นาที', correct: false, feedback: 'ยังต่ำกว่าเกณฑ์ — เกณฑ์เริ่มที่ 100 ครั้ง/นาที', trap: true },
          { label: 'มากกว่า 120 ครั้ง/นาที ยิ่งเร็วยิ่งดี', correct: false, feedback: 'ผิด — เร็วเกิน 120 มักทำให้กดได้ไม่ลึกพอและ recoil ไม่เต็มที่' },
        ],
      },
      {
        situation: 'เพื่อนร่วมทีมถามว่าควรกดลึกแค่ไหน',
        question: 'ความลึกที่เหมาะสมในการกดหน้าอกผู้ใหญ่คือ?',
        timeLimitSec: 15,
        options: [
          { label: '5–6 ซม. (อย่างน้อย 5 ซม. ไม่เกิน 6 ซม.)', correct: true, feedback: 'ถูกต้อง — กดตื้นเกิน output ไม่พอ กดลึกเกินเสี่ยง rib fracture' },
          { label: '2–3 ซม.', correct: false, feedback: 'ตื้นเกินไปมาก — output จะไม่พอเลี้ยงสมองและหัวใจ' },
          { label: '1/3 ของ AP diameter ของผู้ป่วยรายนี้', correct: false, feedback: 'ผิด — เกณฑ์ 1/3 AP diameter ใช้กับเด็ก/ทารกเท่านั้น ผู้ใหญ่ใช้ตัวเลขตายตัว 5–6 ซม.', trap: true },
          { label: 'มากกว่า 7 ซม. เพื่อให้ได้ผลดีที่สุด', correct: false, feedback: 'ผิด — ลึกเกิน 6 ซม. เพิ่มความเสี่ยง rib fracture และ internal injury โดยไม่ได้ผลดีขึ้น' },
        ],
      },
      {
        situation: 'คุณสังเกตว่าเพื่อนร่วมทีมกดหน้าอกแล้วไม่ยกมือให้อกคืนตัวเต็มที่ระหว่างจังหวะ',
        question: 'ทำไมต้องปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil)?',
        options: [
          { label: 'เพื่อให้เลือดไหลกลับเข้าหัวใจใน diastole (venous return)', correct: true, feedback: 'ถูกต้อง — Incomplete recoil ลด venous return ทำให้ cardiac output ของ CPR ลดลงอย่างมาก' },
          { label: 'เพื่อพักกล้ามเนื้อผู้กดหน้าอกเฉย ๆ', correct: false, feedback: 'ไม่ใช่เหตุผลหลัก — เหตุผลทางสรีรวิทยาคือเรื่อง venous return', trap: true },
          { label: 'เพื่อให้ผู้ป่วยหายใจเองระหว่างจังหวะ', correct: false, feedback: 'ผิด — full recoil ไม่เกี่ยวกับการหายใจของผู้ป่วย' },
          { label: 'ไม่มีผลทางสรีรวิทยา เป็นแค่ธรรมเนียมปฏิบัติ', correct: false, feedback: 'ผิด — มีผลชัดเจนต่อ venous return และ cardiac output' },
        ],
      },
      {
        situation: 'ทีมกำลังคุมคุณภาพ CPR ระหว่างทำ',
        question: 'Chest Compression Fraction (CCF) เป้าหมายตามแนวทาง 2025 คือเท่าไร?',
        timeLimitSec: 15,
        options: [
          { label: '> 80%', correct: true, feedback: 'ถูกต้อง — CCF > 80% คือ quality benchmark สัมพันธ์กับ ROSC และ survival ที่สูงขึ้น' },
          { label: '> 40%', correct: false, feedback: 'ต่ำเกินไป — เกณฑ์คือมากกว่า 80%' },
          { label: '> 60%', correct: false, feedback: 'ยังต่ำกว่าเกณฑ์จริง — เป้าหมายคือมากกว่า 80%', trap: true },
          { label: '100% ห้ามหยุดกดเลยแม้แต่วินาทีเดียว', correct: false, feedback: 'ผิด — 100% เป็นไปไม่ได้จริง (ต้องหยุดตอน AED วิเคราะห์ ฯลฯ) เป้าหมายที่ตั้งไว้คือ > 80%' },
        ],
      },
      {
        situation: 'อุปกรณ์ BVM (Ambu bag) พร้อม O2 high flow มาถึงแล้ว ยังไม่ได้ใส่ advanced airway',
        question: 'BLS-HCP ควรกด:ช่วยหายใจ อัตราส่วนใด และต่างจาก lay rescuer อย่างไร?',
        cprDrill: true,
        options: [
          { label: '30:2 — และต้องช่วยหายใจเสมอ (ต่างจาก lay rescuer ที่ใช้ hand-only ได้)', correct: true, feedback: 'ถูกต้อง — Hand-only CPR เป็นทางเลือกสำหรับ lay rescuer เท่านั้น BLS-HCP มีอุปกรณ์ครบต้องช่วยหายใจด้วย 30:2' },
          { label: 'Hand-only อย่างเดียวเหมือน lay rescuer เพราะเร็วกว่า', correct: false, feedback: 'ผิด — นี่เป็นกฎสำหรับ lay rescuer เท่านั้น BLS-HCP ที่มี BVM ต้องช่วยหายใจเสมอ', trap: true },
          { label: '15:2 เพราะมีคนเดียว', correct: false, feedback: 'ผิด — 15:2 ใช้ในเด็ก/ทารกกรณี 2-rescuer เท่านั้น ผู้ใหญ่ใช้ 30:2 ทั้ง 1 และ 2 คนกด' },
          { label: '5:1 ตามมาตรฐานเก่า', correct: false, feedback: 'ผิด — ไม่ใช่อัตราส่วนที่ใช้ในแนวทางปัจจุบัน' },
        ],
      },
    ],
  },

  // ===================== ด่าน 3 — AED สถานการณ์พิเศษ =====================
  {
    id: 'stage-3-aed',
    chapterId: 'bls-3',
    stageNumber: 3,
    title: 'AED — สถานการณ์พิเศษ',
    subtitle: 'บทที่ 3 · การใช้ AED',
    emoji: '⚡',
    passScore: 80,
    steps: [
      {
        situation: 'AED มาถึงและคุณกำลังจะติด pads บนผู้ป่วยที่มีก้อนแข็งใต้ผิวหนังบริเวณใต้ไหปลาร้าซ้าย (สงสัย pacemaker)',
        question: 'ควรวาง pads อย่างไร?',
        options: [
          { label: 'วางให้ห่างจากก้อนนั้นมากที่สุดเท่าที่ทำได้ (ควร ≥ 8 ซม.) ห้ามวางทับ', correct: true, feedback: 'ถูกต้อง — หลีกเลี่ยงวางทับ pacemaker/ICD เพราะกระแสอาจถูกบล็อกหรือเครื่องเสียหาย' },
          { label: 'วางตรงบนก้อนนั้นได้เลยเพื่อความง่าย', correct: false, feedback: 'ผิด — ห้ามวางทับ pacemaker เด็ดขาด อาจบล็อกกระแสไฟและทำเครื่องเสียหาย', trap: true },
          { label: 'ห้าม shock ผู้ป่วยที่มี pacemaker โดยเด็ดขาด', correct: false, feedback: 'ผิด — ยัง shock ได้ตามปกติ เพียงแค่วาง pads ให้ห่างจากตัวเครื่อง' },
          { label: 'ปิดการทำงานของ pacemaker ก่อนถึงจะ shock ได้', correct: false, feedback: 'ผิด — ไม่จำเป็นต้องปิด pacemaker ก่อน แค่วาง pads ให้ห่างพอ' },
        ],
      },
      {
        situation: 'ผู้ป่วยมีแผ่นแปะยา (transdermal patch) ติดอยู่ตรงตำแหน่งที่ควรวาง pad',
        question: 'ควรทำอย่างไร?',
        timeLimitSec: 15,
        options: [
          { label: 'ดึงแผ่นแปะออก เช็ดยาออกก่อนติด pad', correct: true, feedback: 'ถูกต้อง — ถ้าดึงไม่ทันให้วาง pad ห่างจาก patch อย่างน้อย 2.5 ซม. (1 นิ้ว)' },
          { label: 'ติด pad ทับแผ่นแปะไปเลยเพื่อความเร็ว', correct: false, feedback: 'ผิด — shock ผ่าน patch จะบล็อกกระแสไฟและอาจทำให้ผิวหนังไหม้', trap: true },
          { label: 'ห้าม shock ถ้ามีแผ่นแปะยาติดอยู่', correct: false, feedback: 'ผิด — ยัง shock ได้ตามปกติ เพียงแค่ดึงแผ่นแปะออกหรือหลีกเลี่ยงตำแหน่งนั้น' },
          { label: 'รอให้ยาซึมหมดก่อนแล้วค่อยติด pad', correct: false, feedback: 'ผิด — ไม่มีเวลารอ ต้องดึงออก/เช็ดออกทันทีแล้วติด pad เลย' },
        ],
      },
      {
        situation: 'หน้าอกผู้ป่วยเปียกน้ำจากฝนที่เพิ่งล้มลง',
        question: 'ก่อนติด AED pads ควรทำอะไรก่อน?',
        timeLimitSec: 15,
        options: [
          { label: 'เช็ดหน้าอกให้แห้งอย่างรวดเร็ว', correct: true, feedback: 'ถูกต้อง — น้ำที่ผิวหนังทำให้ pads ติดไม่แน่นและ shock ผ่านไม่เต็มที่' },
          { label: 'รอให้แห้งเอง', correct: false, feedback: 'ผิด — ห้ามรอ ต้องเช็ดให้แห้งทันทีแล้วติด pads' },
          { label: 'ห้ามใช้ AED กับผู้ป่วยที่หน้าอกเปียก', correct: false, feedback: 'ผิด — ยังใช้ได้ตามปกติ เพียงเช็ดให้แห้งก่อน', trap: true },
          { label: 'ใส่ถุงมือเพิ่มอีกชั้นแล้วติดเลย', correct: false, feedback: 'ผิด — ไม่ใช่ประเด็นเรื่องถุงมือ ต้องเช็ดหน้าอกผู้ป่วยให้แห้ง' },
        ],
      },
      {
        situation: 'ผู้ป่วยเป็นเด็กอายุ 5 ขวบ น้ำหนัก 18 กก. ไม่มี pediatric pads ในกล่อง AED ที่หยิบมาได้',
        question: 'ควรทำอย่างไร?',
        options: [
          { label: 'ใช้ pads ผู้ใหญ่แทนได้เลย — defib สำคัญกว่า ห้ามชะลอ', correct: true, feedback: 'ถูกต้อง — เด็ก < 8 ปีหรือ < 25 กก. ควรใช้ pediatric pads/attenuator ถ้ามี แต่ถ้าไม่มีให้ใช้ผู้ใหญ่แทนได้ทันที' },
          { label: 'ห้ามใช้ AED กับเด็กถ้าไม่มี pediatric pads', correct: false, feedback: 'ผิด — การไม่ shock เลยอันตรายกว่า ให้ใช้ pads ผู้ใหญ่แทนได้', trap: true },
          { label: 'รอ EMS นำ pediatric pads มาให้ก่อน', correct: false, feedback: 'ผิด — ห้ามรอ เวลาที่เสียไปลด survival chance อย่างมาก' },
          { label: 'ใช้ pads ผู้ใหญ่แต่ลดพลังงาน shock เองด้วยมือ', correct: false, feedback: 'ผิด — BLS-HCP ใช้ AED automated mode เท่านั้น ไม่ปรับพลังงานเอง เครื่องจัดการให้อัตโนมัติ' },
        ],
      },
      {
        situation: 'ติด pads ครบแล้ว AED กำลังวิเคราะห์จังหวะการเต้นของหัวใจ',
        question: 'ระหว่างที่ AED วิเคราะห์ ต้องทำอะไร?',
        timeLimitSec: 15,
        options: [
          { label: 'หยุดกด สั่งทุกคนถอยห่าง ไม่มีใครสัมผัสผู้ป่วย', correct: true, feedback: 'ถูกต้อง — การสัมผัสระหว่างวิเคราะห์จะรบกวนการอ่านจังหวะของเครื่อง' },
          { label: 'กด CPR ต่อระหว่างวิเคราะห์เพื่อไม่เสียเวลา', correct: false, feedback: 'ผิด — ต้องหยุดและถอยห่างระหว่างวิเคราะห์ ไม่เช่นนั้นเครื่องจะวิเคราะห์ผิดพลาด', trap: true },
          { label: 'ตรวจชีพจรระหว่างที่เครื่องวิเคราะห์', correct: false, feedback: 'ผิด — ห้ามสัมผัสผู้ป่วยเลยระหว่างวิเคราะห์' },
          { label: 'เตรียม epinephrine ระหว่างรอผล', correct: false, feedback: 'ไม่เกี่ยวข้อง — การให้ยาอยู่นอก scope ของ BLS และไม่ใช่สิ่งที่ต้องทำระหว่างวิเคราะห์' },
        ],
      },
      {
        situation: 'AED ประกาศ "No shock advised"',
        question: 'ขั้นตอนถัดไปคืออะไร?',
        timeLimitSec: 15,
        cprDrill: true,
        options: [
          { label: 'เริ่มกดหน้าอกต่อทันที 2 นาที แล้วให้ AED วิเคราะห์ใหม่อัตโนมัติ', correct: true, feedback: 'ถูกต้อง — "No shock advised" ยังต้อง CPR ต่อทันที 2 นาที ไม่ต้องเสียเวลาคลำชีพจรก่อน' },
          { label: 'ตรวจชีพจรนาน 30 วินาทีก่อนตัดสินใจ', correct: false, feedback: 'ผิด — ไม่ต้องตรวจชีพจรนาน ให้กดหน้าอกต่อทันที', trap: true },
          { label: 'ถอดแผ่น pads ออกแล้วใส่ใหม่', correct: false, feedback: 'ผิด — ไม่จำเป็น ปล่อย pads ไว้แล้วกดหน้าอกต่อได้เลย' },
          { label: 'รอ AED วิเคราะห์ซ้ำทันทีโดยไม่กดหน้าอก', correct: false, feedback: 'ผิด — ต้องกดหน้าอกต่อทันที 2 นาที เครื่องจะวิเคราะห์ซ้ำเองเมื่อครบเวลา' },
        ],
      },
    ],
  },

  // ===================== ด่าน 4 — One-rescuer =====================
  {
    id: 'stage-4-one-rescuer',
    chapterId: 'bls-1r',
    stageNumber: 4,
    title: 'One-rescuer CPR',
    subtitle: 'บทที่ 4 · ช่วยเหลือคนเดียว',
    emoji: '🏃',
    passScore: 80,
    steps: [
      {
        situation: 'คุณอยู่คนเดียว พบผู้ป่วยหมดสติล้มริมถนน ไม่มีใครอยู่แถวนั้น',
        question: 'ลำดับการช่วยเหลือที่ถูกต้องคือ?',
        options: [
          { label: 'ใช้ speakerphone โทร 1669 พร้อมประเมิน + เริ่ม CPR ไปด้วย', correct: true, feedback: 'ถูกต้อง — Speakerphone ทำให้เรียก EMS และทำ CPR ได้พร้อมกัน ไม่เสียเวลา' },
          { label: 'วิ่งไปตามคนช่วยก่อน แล้วค่อยกลับมาทำ CPR', correct: false, feedback: 'ผิด — การทิ้งผู้ป่วยไปตามคนทำให้เสียเวลาที่ CPR ควรเริ่มทันที', trap: true },
          { label: 'ตรวจชีพจรนาน 30 วินาทีให้แน่ใจก่อน', correct: false, feedback: 'ผิด — ต้องตรวจไม่เกิน 10 วินาที ถ้าไม่แน่ใจให้เริ่ม CPR เลย' },
          { label: 'รอรถพยาบาลมาก่อนจึงเริ่มทำอะไร', correct: false, feedback: 'ผิด — ห้ามรอ ต้องเริ่ม CPR ทันทีที่ประเมินว่าไม่มีชีพจร' },
        ],
      },
      {
        situation: 'คุณเริ่มโทร 1669 ผ่าน speakerphone และเริ่มกดหน้าอกแล้ว',
        question: 'อัตราส่วน compression:ventilation สำหรับ one-rescuer ในผู้ใหญ่คือ?',
        timeLimitSec: 15,
        options: [
          { label: '30:2', correct: true, feedback: 'ถูกต้อง — 1-rescuer ใช้ 30:2 ในทุกช่วงอายุ (ผู้ใหญ่/เด็ก/ทารก)' },
          { label: '15:2', correct: false, feedback: 'ผิด — 15:2 ใช้เฉพาะ 2-rescuer ในเด็ก/ทารกเท่านั้น', trap: true },
          { label: '50:2', correct: false, feedback: 'ผิด — ไม่ใช่อัตราส่วนมาตรฐานใด ๆ' },
          { label: 'กดต่อเนื่องอย่างเดียวไม่ต้องช่วยหายใจ', correct: false, feedback: 'ผิด — BLS-HCP ต้องช่วยหายใจเสมอ ไม่ใช่ hand-only' },
        ],
      },
      {
        situation: 'ระหว่างกด CPR อยู่คนเดียว มีคนเดินผ่านมาพร้อม AED',
        question: 'ควรทำอย่างไรกับ AED ที่เพิ่งมาถึง?',
        options: [
          { label: 'ติด pads ระหว่างที่ยังกดหน้าอกอยู่ แล้วให้ AED วิเคราะห์', correct: true, feedback: 'ถูกต้อง — ติด pads ระหว่างกดช่วยลดเวลา interrupt เพื่อ early defib' },
          { label: 'กดต่ออีก 5 นาทีก่อนค่อยหยิบ AED มาใช้', correct: false, feedback: 'ผิด — ควรใช้ AED ทันทีที่มาถึง ไม่ต้องรอ', trap: true },
          { label: 'หยุด CPR ทั้งหมดเพื่อติด pads ให้เรียบร้อยก่อน', correct: false, feedback: 'ผิด — ควรพยายามกดต่อระหว่างติด pads ให้มากที่สุด' },
          { label: 'รอให้จังหวะหัวใจกลับมาเองก่อนใช้ AED', correct: false, feedback: 'ผิด — ต้องใช้ AED ทันทีเพื่อวิเคราะห์และ shock ถ้าจำเป็น' },
        ],
      },
      {
        situation: 'AED วิเคราะห์และ shock ไปแล้ว 1 ครั้ง คุณยังอยู่คนเดียวและเริ่มเหนื่อยมาก',
        question: 'ควรทำอย่างไรต่อ?',
        timeLimitSec: 15,
        options: [
          { label: 'กดต่อแม้คุณภาพจะลดลงบ้าง — ทำจนคนช่วยมาถึงหรือหมดแรงจริง ๆ', correct: true, feedback: 'ถูกต้อง — การ interrupt CPR ลด coronary perfusion อย่างมาก กดต่อแม้คุณภาพลดยังดีกว่าหยุด' },
          { label: 'หยุดพัก 5 นาทีแล้วค่อยกลับมากดใหม่', correct: false, feedback: 'ผิด — การหยุดนานทำให้ perfusion หายไปเกือบหมด อันตรายกว่ากดต่อแบบเหนื่อย', trap: true },
          { label: 'หยุดทุกอย่างแล้วรอ EMS อย่างเดียว', correct: false, feedback: 'ผิด — ต้องพยายามกดต่อจนกว่าจะมีคนมาเปลี่ยนหรือ EMS มาถึง' },
          { label: 'เปลี่ยนไปนวดท้องแทนการกดหน้าอก', correct: false, feedback: 'ผิด — ไม่ใช่ขั้นตอนของ BLS ในสถานการณ์นี้เลย' },
        ],
      },
    ],
  },

  // ===================== ด่าน 5 — 2-rescuer / Team Dynamics / ROSC =====================
  {
    id: 'stage-5-team-rosc',
    chapterId: 'bls-4',
    stageNumber: 5,
    title: '2-rescuer, Team Dynamics, ROSC',
    subtitle: 'บทที่ 5 · ทำงานเป็นทีม',
    emoji: '🤝',
    passScore: 80,
    steps: [
      {
        situation: 'ทีม code blue 4 คนมาถึงแล้ว หัวหน้าทีมสั่ง "คุณ A ขอ epinephrine 1 mg IV ตอนนี้"',
        question: 'ผู้รับคำสั่งควรตอบสนองอย่างไรตามหลัก closed-loop communication?',
        options: [
          { label: 'ทวนคำสั่ง → ทำ → รายงานกลับเมื่อเสร็จ (เช่น "ให้ epinephrine 1 mg IV แล้ว เวลา 14:32")', correct: true, feedback: 'ถูกต้อง — Closed-loop: สั่ง → ยืนยัน/ทวน → ทำ → รายงานกลับ ลด miscommunication ใน high-stress environment' },
          { label: 'ทำตามคำสั่งเงียบ ๆ โดยไม่ต้องพูดอะไร', correct: false, feedback: 'ผิด — ต้องทวนคำสั่งและรายงานกลับเสมอ ไม่ใช่ทำเงียบ ๆ', trap: true },
          { label: 'รอให้หัวหน้าทีมถามซ้ำก่อนถึงจะตอบ', correct: false, feedback: 'ผิด — ต้องตอบสนองทันทีด้วยการทวนคำสั่ง ไม่ต้องรอถามซ้ำ' },
          { label: 'ส่งสัญญาณมือแทนการพูด', correct: false, feedback: 'ผิด — Closed-loop เน้นการสื่อสารด้วยเสียงที่ชัดเจน ระบุปริมาณ วิธีให้ และเวลา' },
        ],
      },
      {
        situation: 'ผู้กดหน้าอกเริ่มทำมาแล้วเกือบ 2 นาที',
        question: 'ควรสลับคนกดหน้าอกบ่อยแค่ไหน?',
        timeLimitSec: 15,
        options: [
          { label: 'ทุก 2 นาที หรือเร็วกว่านั้นถ้าเริ่มเหนื่อย', correct: true, feedback: 'ถูกต้อง — สลับทุก 2 นาทีเพื่อรักษาคุณภาพ การเหนื่อยมักเกิดเร็วกว่าที่คิด' },
          { label: 'ทุก 30 วินาที', correct: false, feedback: 'บ่อยเกินไป — จะทำให้เกิด interruption มากเกินความจำเป็น' },
          { label: 'ทุก 10 นาที เพื่อลดการ interrupt', correct: false, feedback: 'ผิด — นานเกินไป คุณภาพ CPR จะลดลงมากก่อนถึงเวลาสลับ', trap: true },
          { label: 'ไม่ต้องสลับ ให้คนเดิมกดไปจนจบ', correct: false, feedback: 'ผิด — คุณภาพจะลดลงอย่างมากถ้าไม่สลับคน' },
        ],
      },
      {
        situation: 'ทีมกำลังสลับคนกดหน้าอกกัน',
        question: 'การหยุดกดหน้าอกทุกประเภท (สลับคน, AED วิเคราะห์, ใส่ airway) ไม่ควรเกินกี่วินาทีตามแนวทาง 2025?',
        timeLimitSec: 15,
        options: [
          { label: '10 วินาที', correct: true, feedback: 'ถูกต้อง — แนวทาง 2025 limit interruption ทุกประเภทไม่เกิน 10 วินาที เพื่อรักษา CCF > 80%' },
          { label: '5 วินาที', correct: false, feedback: 'ใกล้เคียงแต่ไม่ใช่ตัวเลขทางการ — เป้าฝึกการสลับคนคือ 5 วินาที แต่ formal limit ตามมาตรฐานคือ 10 วินาที', trap: true },
          { label: '20 วินาที', correct: false, feedback: 'นานเกินไป — เกณฑ์คือไม่เกิน 10 วินาที' },
          { label: '30 วินาที', correct: false, feedback: 'นานเกินไปมาก — จะทำให้ CCF ตกต่ำกว่าเป้าหมาย' },
        ],
      },
      {
        situation: 'มีคนถามว่า CPR Coach ในทีมสมรรถนะสูงมีหน้าที่อะไร',
        question: 'ข้อใดอธิบาย CPR Coach ได้ถูกต้อง?',
        options: [
          { label: 'เฝ้าดูคุณภาพการกดหน้าอก (ความลึก/อัตรา/recoil) + แจ้งสลับคนเมื่อคุณภาพลด + คุม interruption ≤ 10 วิ', correct: true, feedback: 'ถูกต้อง — CPR Coach เป็นบทบาทเสริมที่ focus เฉพาะคุณภาพ CPR แบบ real-time' },
          { label: 'ควบคุมทีมแทน Team Leader ทั้งหมด', correct: false, feedback: 'ผิด — Coach ไม่ใช่ผู้ควบคุมทีมแทน Team Leader focus เฉพาะคุณภาพ CPR เท่านั้น', trap: true },
          { label: 'ตัดสินใจให้ยาแทนแพทย์', correct: false, feedback: 'ผิด — ไม่เกี่ยวกับการให้ยา เป็นบทบาทด้านคุณภาพ CPR ล้วน ๆ' },
          { label: 'ใส่ advanced airway ให้ผู้ป่วย', correct: false, feedback: 'ผิด — ไม่ใช่หน้าที่ของ CPR Coach' },
        ],
      },
      {
        situation: 'หลังทำ CPR ต่อเนื่อง ผู้ป่วยเริ่มมีชีพจรและหายใจเองได้ปกติ แต่ยังไม่รู้สึกตัว — ไม่มีประวัติอุบัติเหตุ',
        question: 'ควรทำอะไรต่อ?',
        timeLimitSec: 15,
        options: [
          { label: 'จัดท่า Recovery position + monitor ใกล้ชิด + เรียก ALS/ICU รับช่วง', correct: true, feedback: 'ถูกต้อง — ROSC + หายใจปกติ + ไม่รู้สึกตัว → recovery position ป้องกัน aspiration พร้อม monitor เพราะ re-arrest มีโอกาสสูงช่วงแรก' },
          { label: 'กดหน้าอกต่อเพื่อความปลอดภัยไว้ก่อน', correct: false, feedback: 'ผิด — เมื่อมีชีพจรและหายใจเองแล้ว (ROSC) ไม่ต้องกดหน้าอกต่อ', trap: true },
          { label: 'ปิด AED แล้วถอด pads ออกทันที', correct: false, feedback: 'ผิด — ห้ามถอด pads จนกว่าจะส่งต่อทีมเสร็จ เผื่อ re-arrest จะได้ shock ได้ทันที' },
          { label: 'ปลุกด้วยการตบหน้าและราดน้ำเย็น', correct: false, feedback: 'ผิด — ไม่ใช่วิธีที่ถูกต้อง ควรจัดท่าและ monitor แทน' },
        ],
      },
      {
        situation: 'สถานการณ์เดียวกัน แต่คราวนี้ผู้ป่วยรายนี้ตกจากที่สูงมาก่อนเกิดเหตุ (สงสัยบาดเจ็บกระดูกสันหลัง)',
        question: 'ROSC แล้ว หายใจเองปกติ ไม่รู้สึกตัว — ควรจัดท่าอย่างไร?',
        options: [
          { label: 'ห้ามจัด Recovery position — เปิดทางเดินหายใจด้วย jaw thrust แทน และ monitor ต่อ', correct: true, feedback: 'ถูกต้อง — ถ้าสงสัย spinal injury ห้ามพลิกตัวจัดท่า recovery ให้เปิด airway ด้วย jaw thrust แทนเพื่อลดการขยับกระดูกสันหลัง' },
          { label: 'จัด Recovery position ตามปกติเหมือนทุกเคส', correct: false, feedback: 'ผิด — ถ้าสงสัย spinal injury (เช่น ตกจากที่สูง) ห้ามพลิกตัวจัดท่า recovery', trap: true },
          { label: 'ปล่อยผู้ป่วยนอนหงายไว้เฉย ๆ ไม่ต้องทำอะไร', correct: false, feedback: 'ผิด — ยังต้องเปิดทางเดินหายใจให้โล่งด้วย jaw thrust ไม่ใช่ปล่อยไว้เฉย ๆ' },
          { label: 'นั่งพยุงผู้ป่วยให้ตัวตรงทันที', correct: false, feedback: 'ผิด — การขยับท่าทางที่ไม่จำเป็นเสี่ยงทำให้บาดเจ็บกระดูกสันหลังมากขึ้น' },
        ],
      },
    ],
  },

  // ===================== ด่าน 6 — ใน รพ. Defib AED mode =====================
  {
    id: 'stage-6-inhospital-defib',
    chapterId: 'bls-5',
    stageNumber: 6,
    title: 'BLS ในโรงพยาบาล — Defib AED Mode',
    subtitle: 'บทที่ 6 · ใช้ monitor/defibrillator',
    emoji: '🏥',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเป็น BLS provider คนแรกที่นำเครื่อง defibrillator/monitor ของโรงพยาบาลมาถึงเตียงผู้ป่วย',
        question: 'ขั้นตอนแรกหลังเปิดเครื่องคืออะไร?',
        options: [
          { label: 'เลือก AED mode แล้วติด pads', correct: true, feedback: 'ถูกต้อง — BLS provider ใช้ AED mode (ไม่ได้รับการสอนอ่าน rhythm เอง) เลือก mode ก่อนแล้วติด pads' },
          { label: 'อ่าน rhythm บนจอแล้วเลือก energy เอง', correct: false, feedback: 'ผิด — การอ่าน rhythm/เลือก Joule เองเป็นทักษะระดับ ACLS เกิน scope ของ BLS-HCP', trap: true },
          { label: 'รอ ALS team มาถึงก่อนจึงเริ่มทำอะไร', correct: false, feedback: 'ผิด — BLS provider ต้องเริ่ม AED mode ทันทีที่เครื่องมาถึง ห้ามรอ ALS' },
          { label: 'ใส่ IV ก่อนเปิดเครื่อง defib', correct: false, feedback: 'ผิด — ลำดับความสำคัญคือเปิดเครื่องและวิเคราะห์จังหวะก่อน' },
        ],
      },
      {
        situation: 'เครื่องในโรงพยาบาลนี้มีทั้ง AED mode และ Manual mode ให้เลือก',
        question: 'ทำไมโรงพยาบาลถึงใช้เครื่องที่มี AED mode แทน AED stand-alone แบบที่ใช้นอกโรงพยาบาล?',
        timeLimitSec: 15,
        options: [
          { label: 'เพราะเป็นเครื่องเดียวกับที่ ALS team ใช้ — BLS shock ก่อน แล้วส่งต่อ manual mode ได้เลยไม่ต้องเปลี่ยนเครื่อง', correct: true, feedback: 'ถูกต้อง — เครื่องเดียวกันทำให้ BLS provider shock ได้ทันทีที่มาถึง แล้ว ALS switch เป็น manual mode ต่อได้อย่างไร้รอยต่อ' },
          { label: 'เพราะ AED stand-alone ผิดกฎหมายในโรงพยาบาล', correct: false, feedback: 'ผิด — ไม่ใช่เรื่องกฎหมาย เป็นเรื่องความต่อเนื่องในการดูแลกับทีม ALS', trap: true },
          { label: 'เพราะ AED stand-alone shock แรงกว่า', correct: false, feedback: 'ผิด — ไม่เกี่ยวกับความแรงของ shock' },
          { label: 'ไม่มีความแตกต่างกัน เลือกใช้อันไหนก็ได้', correct: false, feedback: 'ผิด — มีเหตุผลเฉพาะที่โรงพยาบาลเลือกใช้เครื่องแบบ 2-mode นี้' },
        ],
      },
      {
        situation: 'AED mode วิเคราะห์และแนะนำ shock คุณ shock ไปแล้ว 1 ครั้ง',
        question: 'ควรทำอะไรต่อ?',
        timeLimitSec: 15,
        cprDrill: true,
        options: [
          { label: 'เริ่ม CPR ต่อทันที 2 นาที', correct: true, feedback: 'ถูกต้อง — AED mode ใช้ flow เดียวกับ AED ปกติ หลัง shock ต้องกดหน้าอกต่อทันที ห้ามตรวจชีพจรก่อน' },
          { label: 'ตรวจชีพจรทันทีหลัง shock', correct: false, feedback: 'ผิด — ห้ามหยุดเพื่อตรวจชีพจรทันทีหลัง shock', trap: true },
          { label: 'รอเครื่องวิเคราะห์ rhythm อีกครั้งก่อนทำอะไร', correct: false, feedback: 'ผิด — ต้องกดหน้าอกต่อทันที เครื่องจะวิเคราะห์เองเมื่อครบ 2 นาที' },
          { label: 'Switch ไป manual mode ทันทีด้วยตัวเอง', correct: false, feedback: 'ผิด — BLS provider ไม่ switch เป็น manual mode เอง รอ ALS team มารับช่วง' },
        ],
      },
      {
        situation: 'ALS team มาถึงระหว่างทำ CPR อยู่',
        question: 'ควรทำอย่างไรกับเครื่อง defib และการส่งต่อ?',
        options: [
          { label: 'หัวหน้า ALS switch ไป manual mode + รับ hand-off (เวลาเริ่ม CPR, จำนวน/เวลา shock, rhythm, ยาที่ให้)', correct: true, feedback: 'ถูกต้อง — Hand-off ที่ดีใช้ closed-loop รายงานข้อมูลสำคัญครบถ้วนก่อนส่งต่อ' },
          { label: 'ถอด pads ออก เปลี่ยนไปใช้เครื่องใหม่', correct: false, feedback: 'ผิด — ไม่ต้องถอด pads หรือเปลี่ยนเครื่อง ใช้เครื่องเดิมต่อได้เลย', trap: true },
          { label: 'BLS provider ทำ AED mode ต่อไปเรื่อย ๆ ไม่ต้องส่งต่อ', correct: false, feedback: 'ผิด — เมื่อ ALS team มาถึงควรส่งต่อให้ switch เป็น manual mode' },
          { label: 'ปิดเครื่องก่อนแล้วค่อยเปลี่ยน mode', correct: false, feedback: 'ผิด — ไม่จำเป็นต้องปิดเครื่อง สามารถ switch mode ได้เลย' },
        ],
      },
      {
        situation: 'ทีมกำลังจะเปิดทางให้ยาระหว่าง resuscitation',
        question: 'แนวทาง 2025 แนะนำลำดับการเปิดทางให้ยาอย่างไร?',
        timeLimitSec: 15,
        options: [
          { label: 'เริ่ม peripheral IV ก่อน — ถ้าไม่สำเร็จใน 1–2 ครั้งให้เปลี่ยนเป็น IO ทันที', correct: true, feedback: 'ถูกต้อง — Peripheral IV เป็นทางเลือกแรก ถ้าล้มเหลวเปลี่ยนเป็น intraosseous (IO) ทันทีโดยไม่เสียเวลา' },
          { label: 'ให้ยาทาง ETT (ท่อช่วยหายใจ) เป็นทางเลือกแรก', correct: false, feedback: 'ผิด — ETT route สำหรับให้ยาไม่แนะนำแล้วในแนวทาง 2025', trap: true },
          { label: 'ใส่ central line ก่อนเสมอเพื่อความแน่นอน', correct: false, feedback: 'ผิด — Central line ไม่จำเป็นระหว่าง resuscitation เพิ่มความเสี่ยงและทำให้ CPR หยุดชะงัก' },
          { label: 'รอจนกว่า IV สำเร็จเท่านั้น ไม่ใช้ IO', correct: false, feedback: 'ผิด — ถ้า IV ไม่สำเร็จภายใน 1-2 ครั้งต้องเปลี่ยนเป็น IO ทันที ไม่ควรรอ' },
        ],
      },
    ],
  },

  // ===================== ด่าน 7 — CPR ทารก =====================
  {
    id: 'stage-7-infant-cpr',
    chapterId: 'bls-6',
    stageNumber: 7,
    title: 'CPR ในทารก (< 1 ปี)',
    subtitle: 'บทที่ 7 · เทคนิคเฉพาะทารก',
    emoji: '👶',
    passScore: 80,
    steps: [
      {
        situation: 'ทารกอายุ 3 เดือน ตัวอ่อนปวกเปียก ไม่ตอบสนอง คุณต้องประเมินชีพจร',
        question: 'ควรตรวจชีพจรที่ตำแหน่งใด?',
        timeLimitSec: 15,
        options: [
          { label: 'Brachial (หรือ Femoral) — ไม่เกิน 10 วินาที', correct: true, feedback: 'ถูกต้อง — Brachial pulse เป็นมาตรฐานในทารก femoral ใช้แทนได้ carotid ยากเพราะคอทารกสั้น' },
          { label: 'Carotid เหมือนผู้ใหญ่', correct: false, feedback: 'ผิด — Carotid ตรวจยากในทารกเพราะคอสั้น ควรใช้ brachial หรือ femoral แทน', trap: true },
          { label: 'Radial ที่ข้อมือ', correct: false, feedback: 'ผิด — Radial ไม่ใช่ตำแหน่งมาตรฐานสำหรับประเมินภาวะหัวใจหยุดเต้นในทารก' },
          { label: 'ตรวจที่หน้าอกด้วยหูฟังแทนการคลำ', correct: false, feedback: 'ผิด — BLS ใช้การคลำชีพจรโดยตรง ไม่ใช้หูฟัง' },
        ],
      },
      {
        situation: 'พบว่าอัตราการเต้นของหัวใจทารก < 60 ครั้ง/นาที และมี poor perfusion แม้ให้ ventilation/O2 เพียงพอแล้ว',
        question: 'ควรทำอะไร?',
        options: [
          { label: 'เริ่มกดหน้าอกทันที', correct: true, feedback: 'ถูกต้อง — HR < 60 ร่วมกับ poor perfusion แม้ ventilate/O2 เพียงพอแล้ว ถือเป็นข้อบ่งชี้ให้เริ่มกดหน้าอก' },
          { label: 'ให้ ventilation ต่อไปอย่างเดียวโดยไม่กดหน้าอก', correct: false, feedback: 'ผิด — ในสถานการณ์นี้ต้องเริ่มกดหน้าอกร่วมด้วยแล้ว ไม่ใช่ ventilate อย่างเดียว', trap: true },
          { label: 'รอดูอาการอีก 5 นาทีก่อนตัดสินใจ', correct: false, feedback: 'ผิด — ต้องเริ่มกดหน้าอกทันที ไม่รอ' },
          { label: 'ให้ยากระตุ้นหัวใจก่อนกดหน้าอก', correct: false, feedback: 'ผิด — ไม่ใช่ขั้นตอนของ BLS และไม่ใช่ลำดับที่ถูกต้อง' },
        ],
      },
      {
        situation: 'มีผู้ช่วยเหลือ 2 คน (HCP ทั้งคู่) กำลังจะเริ่มกดหน้าอกทารก',
        question: 'เทคนิคใดที่แนะนำสำหรับ 2-rescuer ในทารก?',
        timeLimitSec: 15,
        cprDrill: true,
        options: [
          { label: '2-thumb encircling technique (โอบรอบหน้าอก ใช้นิ้วโป้งกด)', correct: true, feedback: 'ถูกต้อง — 2-thumb encircling ให้ output ดีที่สุดสำหรับ 2-rescuer ถ้ามือเล็กโอบไม่รอบให้ใช้ heel-of-1-hand แทน' },
          { label: '2-finger technique', correct: false, feedback: 'ผิด — แนวทาง 2025 เลิกใช้ 2-finger technique แล้วเพราะมักกดได้ไม่ลึกพอ', trap: true },
          { label: 'Heel of hand แบบเดียวกับผู้ใหญ่เต็มแรง', correct: false, feedback: 'ผิด — ทารกใช้เทคนิคเฉพาะ (2-thumb encircling หรือ heel-of-1-hand) ไม่ใช่แบบผู้ใหญ่' },
          { label: 'ใช้กำปั้นกดแทนฝ่ามือ', correct: false, feedback: 'ผิด — ไม่ใช่เทคนิคที่แนะนำสำหรับทารกเลย' },
        ],
      },
      {
        situation: 'กำลังกดหน้าอกทารกอยู่',
        question: 'ความลึกที่เหมาะสมในการกดหน้าอกทารกคือ?',
        timeLimitSec: 15,
        options: [
          { label: '~4 ซม. หรือ 1/3 ของ AP diameter', correct: true, feedback: 'ถูกต้อง — ทารกใช้เกณฑ์ 1/3 ของ AP diameter ซึ่งประมาณ 4 ซม.' },
          { label: '~2 ซม.', correct: false, feedback: 'ตื้นเกินไป — จะได้ output ไม่พอ' },
          { label: '5–6 ซม. เท่าผู้ใหญ่', correct: false, feedback: 'ผิด — 5-6 ซม. เป็นเกณฑ์ของผู้ใหญ่เท่านั้น ทารกตัวเล็กกว่ามากต้องกดตื้นกว่า', trap: true },
          { label: 'ลึกเท่าที่ทำได้โดยไม่มีขีดจำกัด', correct: false, feedback: 'ผิด — มีเกณฑ์ชัดเจนคือประมาณ 4 ซม. ไม่ใช่กดให้ลึกที่สุด' },
        ],
      },
      {
        situation: 'มีผู้ช่วยเหลือ 2 คน (ทั้งคู่เป็น HCP) กำลังทำ CPR ทารกร่วมกัน',
        question: 'อัตราส่วน compression:ventilation สำหรับ 2-rescuer ในทารกคือ?',
        timeLimitSec: 15,
        options: [
          { label: '15:2', correct: true, feedback: 'ถูกต้อง — 2-rescuer HCP ในเด็ก/ทารกใช้ 15:2 ต่างจาก 1-rescuer ที่ใช้ 30:2' },
          { label: '30:2', correct: false, feedback: 'ผิด — 30:2 ใช้สำหรับ 1-rescuer เท่านั้น เมื่อมี 2-rescuer HCP ในทารก/เด็กเปลี่ยนเป็น 15:2', trap: true },
          { label: '5:1', correct: false, feedback: 'ผิด — ไม่ใช่อัตราส่วนมาตรฐานที่ใช้ในแนวทางปัจจุบัน' },
          { label: '10:1', correct: false, feedback: 'ผิด — ไม่ใช่อัตราส่วนมาตรฐาน' },
        ],
      },
    ],
  },

  // ===================== ด่าน 8 — FBAO / สำลัก =====================
  {
    id: 'stage-8-fbao',
    chapterId: 'bls-7',
    stageNumber: 8,
    title: 'ทางเดินหายใจอุดกั้น (FBAO)',
    subtitle: 'บทที่ 8 · สำลักผู้ใหญ่ เด็ก ทารก',
    emoji: '🫁',
    passScore: 80,
    steps: [
      {
        situation: 'ชายวัย 40 ปี กำลังกินอาหาร จู่ ๆ จับคอตัวเอง พูดไม่ได้ ไอไม่ออก',
        question: 'ตามแนวทาง ILCOR 2025 ควรทำอะไร?',
        options: [
          { label: '5 back blows สลับกับ 5 abdominal thrusts (Heimlich) จนกว่าจะออกหรือหมดสติ', correct: true, feedback: 'ถูกต้อง — Severe FBAO ในผู้ใหญ่/เด็ก ≥ 1 ปี ใช้ back blows สลับ abdominal thrusts ครั้งละ 5' },
          { label: 'รอให้ไอเอง เพราะยังไอได้บ้าง', correct: false, feedback: 'ผิด — ในเคสนี้พูดไม่ได้ ไอไม่ออก ถือเป็น severe obstruction ต้องช่วยทันที ไม่ใช่รอ', trap: true },
          { label: 'ให้ดื่มน้ำเพื่อดันสิ่งของลงคอ', correct: false, feedback: 'ผิด — อันตรายมาก อาจทำให้อุดกั้นรุนแรงขึ้น' },
          { label: 'ฉีดอะดรีนาลีนทันที', correct: false, feedback: 'ผิด — ไม่ใช่การรักษา FBAO อะดรีนาลีนใช้ในกรณีอื่น เช่น anaphylaxis' },
        ],
      },
      {
        situation: 'คุณเริ่มทำ back blows และ abdominal thrusts สลับกัน แต่ผู้ป่วยเริ่มหมดสติกลางคัน ทรุดลงกับพื้น',
        question: 'ควรทำอะไรทันที?',
        timeLimitSec: 15,
        cprDrill: true,
        options: [
          { label: 'เริ่ม CPR ทันที (ไม่ตรวจชีพจร) และดูในปากก่อนช่วยหายใจแต่ละครั้ง', correct: true, feedback: 'ถูกต้อง — เมื่อหมดสติต้องเริ่ม CPR ทันที ก่อนให้ breath แต่ละครั้งให้ดูในปาก ถ้าเห็นสิ่งของให้เอาออก' },
          { label: 'ทำ abdominal thrusts ต่อในท่านอนราบ', correct: false, feedback: 'ผิด — เมื่อหมดสติแล้วต้องเปลี่ยนเป็น CPR ไม่ใช่ทำ abdominal thrusts ต่อ', trap: true },
          { label: 'รอ EMS มาก่อนโดยไม่ทำอะไร', correct: false, feedback: 'ผิด — ต้องเริ่ม CPR ทันที ไม่รอ' },
          { label: 'ทำ blind finger sweep ในปากทันที', correct: false, feedback: 'ผิด — ห้าม blind finger sweep ในทุกช่วงวัย เสี่ยงดันสิ่งของเข้าลึกกว่าเดิม' },
        ],
      },
      {
        situation: 'ทารกอายุ 6 เดือน สำลักนม เริ่มหน้าเขียว ยังรู้สึกตัวอยู่',
        question: 'ควรทำอะไร?',
        timeLimitSec: 15,
        options: [
          { label: 'Back blows 5 ครั้ง สลับกับ chest thrusts 5 ครั้ง', correct: true, feedback: 'ถูกต้อง — ทารกใช้ back blows + chest thrusts ห้าม abdominal thrust เพราะเสี่ยง liver injury' },
          { label: 'Abdominal thrusts 5 ครั้งเหมือนผู้ใหญ่', correct: false, feedback: 'ผิด — ห้ามทำ abdominal thrust ในทารกเด็ดขาด เสี่ยง liver injury', trap: true },
          { label: 'จับห้อยหัวลงเขย่าแรง ๆ', correct: false, feedback: 'ผิด — ไม่ใช่วิธีที่ถูกต้องและอันตรายต่อทารก' },
          { label: 'เริ่ม CPR ทันทีทั้งที่ยังรู้สึกตัวดี', correct: false, feedback: 'ผิด — ทารกยังรู้สึกตัวอยู่ ควรทำ back blows/chest thrusts ก่อน ไม่ใช่เริ่ม CPR ทันที' },
        ],
      },
      {
        situation: 'หญิงตั้งครรภ์ไตรมาส 3 (ท้องแก่ใกล้คลอด) สำลักอาหาร พูดไม่ได้ จับคอ',
        question: 'ควรทำอะไรแทน abdominal thrusts ปกติ?',
        options: [
          { label: 'Chest thrusts แทน abdominal thrusts (back blows ยังทำได้ปกติ)', correct: true, feedback: 'ถูกต้อง — ครรภ์แก่/อ้วนมาก ใช้ chest thrusts แทน abdominal thrusts เพื่อไม่กระทบมดลูก' },
          { label: 'Abdominal thrusts ตามปกติเหมือนคนทั่วไป', correct: false, feedback: 'ผิด — ในครรภ์แก่ต้องเปลี่ยนเป็น chest thrusts แทน เพื่อความปลอดภัยของทั้งแม่และทารกในครรภ์', trap: true },
          { label: 'Back blows อย่างเดียว ไม่ต้องทำอย่างอื่น', correct: false, feedback: 'ผิด — ยังต้องสลับกับ chest thrusts เหมือนปกติ เพียงเปลี่ยนจาก abdominal เป็น chest' },
          { label: 'ทำ CPR ทันทีทั้งที่ยังรู้สึกตัวดี', correct: false, feedback: 'ผิด — ยังรู้สึกตัวอยู่ ควรทำ back blows/chest thrusts ก่อน' },
        ],
      },
      {
        situation: 'ผู้ป่วย FBAO หมดสติแล้ว คุณกำลังทำ CPR และจะช่วยหายใจครั้งต่อไป',
        question: 'ก่อนให้ breath แต่ละครั้งควรทำอะไร และห้ามทำอะไร?',
        timeLimitSec: 15,
        options: [
          { label: 'ดูในปากก่อนทุกครั้ง ถ้าเห็นสิ่งของให้เอาออก — ห้าม blind finger sweep เด็ดขาด', correct: true, feedback: 'ถูกต้อง — ดูในปากก่อนแต่ละ breath ถ้าเห็นสิ่งของเอาออกได้ แต่ห้าม blind finger sweep ในทุกช่วงวัยเพราะเสี่ยงดันสิ่งของเข้าลึก' },
          { label: 'ทำ blind finger sweep ทุกครั้งก่อนให้ breath', correct: false, feedback: 'ผิด — ห้าม blind finger sweep เด็ดขาดในทุกช่วงวัย เสี่ยงดันสิ่งของเข้าลึกหรือบาดเจ็บ', trap: true },
          { label: 'ไม่ต้องดูในปากเลย ให้ breath ต่อไปได้เลย', correct: false, feedback: 'ผิด — ควรดูในปากก่อนแต่ละ breath เผื่อเห็นสิ่งของที่เอาออกได้ง่าย' },
          { label: 'ล้วงคอด้วยนิ้วให้ลึกที่สุดเพื่อความชัวร์', correct: false, feedback: 'ผิด — นี่คือ blind finger sweep ซึ่งห้ามทำเด็ดขาด' },
        ],
      },
    ],
  },
];

// ---- Final exam: sample questions across every stage ----------------------

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
  const picked = blsScenarios.flatMap((stage) => {
    const steps = shuffle(stage.steps).slice(0, FINAL_EXAM_PER_STAGE);
    return steps.map((s) => ({ ...s, cprDrill: false, sourceStage: stage.title }));
  });
  return {
    id: FINAL_EXAM_ID,
    chapterId: null,
    stageNumber: blsScenarios.length + 1,
    title: 'ข้อสอบรวม — ครบทุกบท',
    subtitle: `Final Exam · สุ่ม ${picked.length} ข้อจากทุกด่าน`,
    emoji: '🏆',
    passScore: 80,
    steps: shuffle(picked),
  };
}

export function getStageById(id) {
  if (id === FINAL_EXAM_ID) return buildFinalExam();
  return blsScenarios.find((s) => s.id === id) || null;
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
