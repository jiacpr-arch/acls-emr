// BLS decision-game scenarios (BLS for Healthcare Providers, ILCOR 2025).
// Self-contained multiple-choice branching walkthrough — each step presents a
// situation + a question, the student picks the next action, and gets instant
// feedback. Paraphrased from the public ILCOR/AHA BLS algorithm (no verbatim
// tables). Content should still be sanity-checked by the course instructor.
//
// Step shape:
//   {
//     situation: string,           // what the rescuer sees now
//     question: string,            // the decision to make
//     cprDrill?: true,             // after the correct answer, run a 30s CPR
//                                  // metronome drill before "ถัดไป" unlocks
//     options: [
//       { label, correct?: true, feedback }   // feedback explains why
//     ],
//   }

export const blsScenarios = [
  {
    id: 'adult-ohca-vf',
    title: 'ผู้ใหญ่หมดสติ นอกโรงพยาบาล (มี AED)',
    subtitle: 'Adult OHCA · Shockable',
    emoji: '🧑‍⚕️',
    passScore: 80,
    steps: [
      {
        situation: 'คุณเห็นชายวัยประมาณ 55 ปี ล้มลงหมดสติในห้างสรรพสินค้า นอนนิ่งไม่เคลื่อนไหว',
        question: 'สิ่งแรกที่ควรทำคืออะไร?',
        options: [
          { label: 'ตรวจสอบความปลอดภัยของที่เกิดเหตุ', correct: true, feedback: 'ถูกต้อง — ประเมินความปลอดภัยของที่เกิดเหตุก่อนเข้าถึงผู้ป่วยเสมอ เพื่อไม่ให้ผู้ช่วยเหลือบาดเจ็บ' },
          { label: 'วิ่งเข้าไปกดหน้าอกทันที', correct: false, feedback: 'ยังก่อน — ถ้าที่เกิดเหตุไม่ปลอดภัย ผู้ช่วยเหลืออาจเป็นเหยื่อรายต่อไป ต้องเช็คความปลอดภัยก่อน' },
          { label: 'คลำชีพจรที่คอทันที', correct: false, feedback: 'ยังก่อน — ต้องประเมินความปลอดภัยและปลุกเรียกก่อนจึงประเมินชีพจร' },
        ],
      },
      {
        situation: 'ที่เกิดเหตุปลอดภัย คุณเข้าถึงตัวผู้ป่วยได้แล้ว',
        question: 'ขั้นตอนต่อไปคือ?',
        options: [
          { label: 'ปลุกเรียก — ตบไหล่แรง ๆ พร้อมตะโกน "คุณเป็นอะไรไหม"', correct: true, feedback: 'ถูกต้อง — ประเมินการตอบสนองด้วยการตบไหล่และเรียกดัง ๆ' },
          { label: 'เป่าปากช่วยหายใจ 2 ครั้ง', correct: false, feedback: 'ยังก่อน — ต้องประเมินการตอบสนองก่อน และ BLS-HCP เริ่มด้วยกดหน้าอก ไม่ใช่เป่าปาก' },
          { label: 'ยกขาผู้ป่วยให้สูง', correct: false, feedback: 'ไม่ใช่ — การยกขาไม่ใช่ขั้นตอนของ BLS ในผู้ป่วยหมดสติ' },
        ],
      },
      {
        situation: 'ตบไหล่และเรียกแล้ว ผู้ป่วยไม่ตอบสนองใด ๆ',
        question: 'ต้องทำอะไรต่อ?',
        options: [
          { label: 'เรียกขอความช่วยเหลือ + สั่งให้คนไปเอา AED และโทร 1669', correct: true, feedback: 'ถูกต้อง — เมื่อไม่ตอบสนอง ต้องเปิดใช้ระบบฉุกเฉินและขอ AED ทันที (ชี้ตัวคนสั่งงานให้ชัดเจน)' },
          { label: 'เริ่ม CPR ก่อน แล้วค่อยเรียกช่วยทีหลัง', correct: false, feedback: 'ไม่ควร — ควรขอความช่วยเหลือและ AED ก่อน/พร้อมกัน เพื่อให้ AED มาถึงเร็วที่สุด' },
          { label: 'ค้นหากระเป๋าหายาประจำตัว', correct: false, feedback: 'ไม่ใช่ลำดับความสำคัญ — ต้องเปิดระบบฉุกเฉินและประเมินผู้ป่วยก่อน' },
        ],
      },
      {
        situation: 'มีคนไปเอา AED และโทรแจ้งแล้ว',
        question: 'จะประเมินผู้ป่วยอย่างไร?',
        options: [
          { label: 'ดูการหายใจและคลำชีพจร carotid พร้อมกัน ไม่เกิน 10 วินาที', correct: true, feedback: 'ถูกต้อง — ประเมินการหายใจและชีพจรไปพร้อมกัน ใช้เวลาไม่เกิน 10 วินาที' },
          { label: 'คลำชีพจรอย่างเดียวนาน 30 วินาทีให้แน่ใจ', correct: false, feedback: 'นานเกินไป — ห้ามใช้เวลาเกิน 10 วินาที มิฉะนั้นจะทำให้ CPR ล่าช้า' },
          { label: 'ฟังเสียงหัวใจด้วยหูฟังก่อน', correct: false, feedback: 'ไม่จำเป็นใน BLS — ประเมินการหายใจและชีพจรด้วยการดู/คลำเท่านั้น' },
        ],
      },
      {
        situation: 'ผู้ป่วยไม่หายใจ (หรือหายใจเฮือก) และคลำชีพจรไม่ได้',
        question: 'ต้องทำอะไรทันที?',
        cprDrill: true,
        options: [
          { label: 'เริ่ม CPR ทันที — กดหน้าอกลึก 5–6 ซม. เร็ว 100–120 ครั้ง/นาที ปล่อยสุด อัตรา 30:2', correct: true, feedback: 'ถูกต้อง — เริ่ม CPR คุณภาพสูงทันที กดเร็ว-ลึก ปล่อยให้อกคืนตัวเต็มที่ ลองจับจังหวะดู 30 วินาที' },
          { label: 'ช่วยหายใจ 2 ครั้งก่อนเริ่มกด', correct: false, feedback: 'ไม่ใช่ — BLS-HCP ในภาวะหัวใจหยุดเต้นเริ่มด้วยการกดหน้าอกก่อน (C-A-B)' },
          { label: 'รอ AED มาถึงก่อนค่อยเริ่ม CPR', correct: false, feedback: 'ห้ามรอ — เริ่ม CPR ทันที อย่าให้มีช่วงหยุดกดโดยไม่จำเป็น' },
        ],
      },
      {
        situation: 'AED มาถึงขณะที่คุณกำลังทำ CPR',
        question: 'ทำอย่างไรกับ AED?',
        options: [
          { label: 'เปิดเครื่อง AED แล้วติดแผ่น pad ตามรูป โดยพยายามกด CPR ต่อระหว่างติด', correct: true, feedback: 'ถูกต้อง — เปิด AED และติด pad ให้เร็ว โดยลดการหยุดกดหน้าอกให้น้อยที่สุด' },
          { label: 'หยุด CPR ทั้งหมดเพื่อรอให้ AED พร้อม', correct: false, feedback: 'ไม่ควร — พยายามกดต่อเนื่องระหว่างติด pad เพื่อรักษา CCF (สัดส่วนเวลาที่กดหน้าอก)' },
          { label: 'คลำชีพจรซ้ำก่อนติด AED', correct: false, feedback: 'ไม่จำเป็น — ติด AED ต่อได้เลย ให้เครื่องเป็นตัววิเคราะห์จังหวะ' },
        ],
      },
      {
        situation: 'AED ประกาศว่า "กำลังวิเคราะห์จังหวะการเต้นของหัวใจ อย่าสัมผัสผู้ป่วย"',
        question: 'คุณต้องทำอะไร?',
        options: [
          { label: 'หยุดกด สั่งทุกคนถอยห่าง ไม่มีใครสัมผัสผู้ป่วย', correct: true, feedback: 'ถูกต้อง — ระหว่างวิเคราะห์ ห้ามสัมผัสผู้ป่วย เพราะจะรบกวนการอ่านจังหวะ' },
          { label: 'กด CPR ต่อระหว่างที่เครื่องวิเคราะห์', correct: false, feedback: 'ไม่ได้ — การสัมผัส/กดจะทำให้ AED วิเคราะห์ผิดพลาด ต้องหยุดและถอยห่าง' },
        ],
      },
      {
        situation: 'AED ประกาศว่า "แนะนำให้ช็อก" (Shock advised)',
        question: 'ก่อนกดปุ่มช็อก ต้องทำอะไร?',
        options: [
          { label: 'ตะโกน "ถอยห่าง!" มองให้แน่ใจว่าไม่มีใครแตะผู้ป่วย แล้วจึงกดปุ่มช็อก', correct: true, feedback: 'ถูกต้อง — ต้องเคลียร์คนก่อนช็อกเสมอ เพื่อความปลอดภัยของทีม' },
          { label: 'กดปุ่มช็อกทันทีเพื่อไม่ให้เสียเวลา', correct: false, feedback: 'อันตราย — ถ้ามีคนสัมผัสผู้ป่วยขณะช็อกอาจโดนไฟฟ้า ต้องเคลียร์คนก่อน' },
          { label: 'คลำชีพจรก่อนกดช็อก', correct: false, feedback: 'ไม่ต้อง — เมื่อเครื่องแนะนำให้ช็อก ให้เคลียร์คนแล้วช็อกได้เลย' },
        ],
      },
      {
        situation: 'ช็อกไปแล้ว 1 ครั้ง',
        question: 'ทันทีหลังช็อกต้องทำอะไร?',
        options: [
          { label: 'เริ่ม CPR ต่อทันที โดยเริ่มจากกดหน้าอก ทำต่ออีก 2 นาที', correct: true, feedback: 'ถูกต้อง — หลังช็อกให้กดหน้าอกต่อทันที ไม่ต้องหยุดคลำชีพจร ทำ CPR อีก 2 นาทีแล้วให้ AED วิเคราะห์ซ้ำ' },
          { label: 'คลำชีพจรทันทีหลังช็อก', correct: false, feedback: 'ไม่ควร — การหยุดเพื่อคลำชีพจรทำให้ CCF ตก ให้กดต่อทันทีแล้วประเมินเมื่อครบรอบ' },
          { label: 'รอ AED วิเคราะห์ซ้ำก่อนกดต่อ', correct: false, feedback: 'ไม่ใช่ — กดต่อทันที เครื่องจะให้วิเคราะห์อีกครั้งเมื่อครบ 2 นาที' },
        ],
      },
    ],
  },
];

export function getBlsScenario(id) {
  return blsScenarios.find((s) => s.id === id) || blsScenarios[0];
}
