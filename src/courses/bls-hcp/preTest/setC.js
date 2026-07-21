// BLS-HCP Pre-test Set C — 20 questions (BLS per ILCOR 2025 + TRC)
// พิมพ์เขียวเดียวกับชุด A/B: chain 2, HQ-CPR 5, AED 3, team 3,
// in-hospital 2, infant 3, choking 2 — โจทย์ไม่ซ้ำชุดอื่น
// ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อนปล่อย production

export const setC = {
  id: 'bls-pre-set-c',
  title: 'ชุด C',
  questions: [
    // ---- Chain of Survival / recognition (2) ----
    { id: 'bls-prec-1', topic: 'chain',
      question: 'ห่วงแรกของ Chain of Survival "ในโรงพยาบาล" (IHCA) คืออะไร?',
      choices: [
        { id: 'a', text: 'Defibrillation เร็ว' },
        { id: 'b', text: 'การเฝ้าระวังและป้องกันก่อนหัวใจหยุด (จับสัญญาณเตือน เรียก RRT)' },
        { id: 'c', text: 'การใส่ท่อช่วยหายใจ' },
        { id: 'd', text: 'การให้ยากระตุ้นหัวใจ' },
      ],
      correctId: 'b',
      explanation: 'IHCA เริ่มที่ "เฝ้าระวัง-ป้องกัน" — จับ early warning signs แล้วเรียกทีมก่อนที่หัวใจจะหยุดจริง' },
    { id: 'bls-prec-2', topic: 'chain',
      question: 'พบคนล้มหมดสติกลางถนน สิ่งแรกที่ต้องทำก่อนเข้าไปช่วยคือ?',
      choices: [
        { id: 'a', text: 'วิ่งเข้าไปกดหน้าอกทันที' },
        { id: 'b', text: 'ประเมินความปลอดภัยของที่เกิดเหตุ (รถ ไฟฟ้า ฯลฯ) ก่อนเข้าช่วย' },
        { id: 'c', text: 'ถ่ายรูปแจ้งตำรวจ' },
        { id: 'd', text: 'ยกผู้ป่วยขึ้นรถไปโรงพยาบาลเอง' },
      ],
      correctId: 'b',
      explanation: 'Scene safety มาก่อนเสมอ — ผู้ช่วยที่บาดเจ็บเองจะกลายเป็นผู้ป่วยรายที่สอง' },

    // ---- High-Quality CPR (5) ----
    { id: 'bls-prec-3', topic: 'high-quality-cpr',
      question: 'Chest Compression Fraction (CCF) เป้าหมายตามแนวทาง 2025 คือ?',
      choices: [
        { id: 'a', text: '> 40%' }, { id: 'b', text: '> 60%' },
        { id: 'c', text: '> 80%' }, { id: 'd', text: 'ไม่มีการกำหนด' },
      ],
      correctId: 'c', explanation: 'CCF > 80% — สัดส่วนเวลาที่มือกำลังกดหน้าอกต่อเวลากู้ชีพทั้งหมด สัมพันธ์กับการรอดชีวิต' },
    { id: 'bls-prec-4', topic: 'high-quality-cpr',
      question: 'ตำแหน่งใดที่ "ห้าม" กดขณะทำ CPR ผู้ใหญ่?',
      choices: [
        { id: 'a', text: 'ครึ่งล่างของกระดูก sternum' },
        { id: 'b', text: 'ปลายกระดูกลิ้นปี่ (xiphoid) และชายโครง' },
        { id: 'c', text: 'กึ่งกลางหน้าอกระดับหัวนม' },
        { id: 'd', text: 'แนวกึ่งกลางลำตัว' },
      ],
      correctId: 'b', explanation: 'กดที่ xiphoid/ชายโครงเสี่ยงตับ-ม้ามฉีกและซี่โครงหัก — ต้องกดครึ่งล่างของ sternum เท่านั้น' },
    { id: 'bls-prec-5', topic: 'high-quality-cpr',
      question: 'ท่าทางผู้กดหน้าอกที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'งอศอก ใช้แรงแขนกด' },
        { id: 'b', text: 'แขนเหยียดตรง ไหล่อยู่เหนือมือ ใช้น้ำหนักตัวกดลงตรง ๆ' },
        { id: 'c', text: 'นั่งห่างตัวผู้ป่วย เอื้อมมือกด' },
        { id: 'd', text: 'ยืนก้มตัวกดจากด้านศีรษะ' },
      ],
      correctId: 'b', explanation: 'แขนตรง-ไหล่เหนือมือ ใช้น้ำหนักตัว — ได้ความลึกสม่ำเสมอและผู้กดล้าช้าลง' },
    { id: 'bls-prec-6', topic: 'high-quality-cpr',
      question: 'คนทั่วไปที่ไม่เคยฝึกช่วยหายใจ พบผู้ใหญ่หัวใจหยุดเต้น ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'รอคนที่ฝึกมาแล้วเท่านั้น' },
        { id: 'b', text: 'กดหน้าอกอย่างเดียวต่อเนื่อง (hands-only CPR) 100–120/นาที' },
        { id: 'c', text: 'เป่าปากอย่างเดียวไม่ต้องกด' },
        { id: 'd', text: 'จับชีพจรซ้ำ ๆ จนกว่ารถพยาบาลมา' },
      ],
      correctId: 'b', explanation: 'Hands-only CPR ได้ผลดีในนาทีแรก ๆ ของผู้ใหญ่ และดีกว่าไม่ทำอะไรมาก' },
    { id: 'bls-prec-7', topic: 'high-quality-cpr',
      question: 'เป่าปากครั้งแรกแล้วหน้าอก "ไม่ยก" ควรทำอย่างไรก่อนเป่าครั้งที่สอง?',
      choices: [
        { id: 'a', text: 'เป่าแรงขึ้นสองเท่า' },
        { id: 'b', text: 'จัดท่าเปิดทางเดินหายใจใหม่ (head tilt–chin lift) แล้วเป่าอีกครั้ง' },
        { id: 'c', text: 'ข้ามการเป่าไปเลยตลอดการกู้ชีพ' },
        { id: 'd', text: 'เขย่าตัวผู้ป่วย' },
      ],
      correctId: 'b', explanation: 'สาเหตุที่พบบ่อยที่สุดคือเปิด airway ไม่ดี — จัดท่าใหม่ก่อน แล้วรีบกลับไปกดหน้าอก (เป่ารวมไม่เกิน 2 ครั้งต่อรอบ)' },

    // ---- AED (3) ----
    { id: 'bls-prec-8', topic: 'aed',
      question: 'ตำแหน่งติด AED pads ในผู้ใหญ่แบบ anterior-lateral คือ?',
      choices: [
        { id: 'a', text: 'กลางหน้าอก 2 แผ่นซ้อนกัน' },
        { id: 'b', text: 'ใต้ไหปลาร้าขวา + ชายโครงซ้ายแนวรักแร้' },
        { id: 'c', text: 'หน้าท้องซ้าย-ขวา' },
        { id: 'd', text: 'ไหล่ซ้าย + ไหล่ขวา' },
      ],
      correctId: 'b', explanation: 'แผ่นหนึ่งใต้ไหปลาร้าขวา อีกแผ่นชายโครงซ้ายแนว mid-axillary — ให้กระแสผ่านหัวใจ' },
    { id: 'bls-prec-9', topic: 'aed',
      question: 'เด็กอายุ 5 ปีหัวใจหยุดเต้น มีแต่ adult pads ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ห้ามใช้ AED รอทีมกู้ชีพ' },
        { id: 'b', text: 'ใช้ adult pads ได้ (ระวังไม่ให้แผ่นแตะกัน) — ห้ามชะลอการ shock' },
        { id: 'c', text: 'ตัดแผ่นให้เล็กลงครึ่งหนึ่ง' },
        { id: 'd', text: 'ติดแผ่นเดียวพอ' },
      ],
      correctId: 'b', explanation: 'ควรใช้ peds pads/attenuator ถ้ามี — ไม่มีให้ใช้ adult pads ได้ (อาจติดหน้าอก-กลางหลัง) ดีกว่าไม่ shock' },
    { id: 'bls-prec-10', topic: 'aed',
      question: 'AED แจ้ง "no shock advised" แต่ผู้ป่วยยังไม่ตอบสนอง ไม่หายใจปกติ ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ถอด pads เก็บเครื่อง' },
        { id: 'b', text: 'กดหน้าอกต่อทันที — จังหวะอาจเป็น PEA/asystole ซึ่งยังคือหัวใจหยุดเต้น' },
        { id: 'c', text: 'รอเครื่องวิเคราะห์ใหม่โดยไม่ทำอะไร' },
        { id: 'd', text: 'จัดท่านอนตะแคง' },
      ],
      correctId: 'b', explanation: '"no shock advised" ≠ หายแล้ว — ถ้ายังไม่ตื่น/ไม่หายใจปกติ ให้ CPR ต่อจนทีมมาถึง' },

    // ---- Team (3) ----
    { id: 'bls-prec-11', topic: 'team',
      question: 'เห็นเพื่อนร่วมทีมกดหน้าอกตื้นเกินไป ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'เงียบไว้ เดี๋ยวหัวหน้าทีมเห็นเอง' },
        { id: 'b', text: 'บอกอย่างสุภาพทันที เช่น "กดลึกอีกนิดครับ" (constructive intervention)' },
        { id: 'c', text: 'ตำหนิเสียงดังให้ทุกคนได้ยิน' },
        { id: 'd', text: 'รอจบเคสค่อยบอก' },
      ],
      correctId: 'b', explanation: 'สมาชิกทุกคนมีหน้าที่ท้วงติงอย่างสร้างสรรค์ทันทีเมื่อเห็นสิ่งที่กระทบคุณภาพการกู้ชีพ' },
    { id: 'bls-prec-12', topic: 'team',
      question: 'ผู้ใหญ่หัวใจหยุดเต้น มีผู้ช่วยเหลือ 2 คน สัดส่วนกด:เป่า คือ?',
      choices: [
        { id: 'a', text: '15:2' }, { id: 'b', text: '30:2' },
        { id: 'c', text: '50:2' }, { id: 'd', text: 'กดอย่างเดียว' },
      ],
      correctId: 'b', explanation: 'ผู้ใหญ่ใช้ 30:2 เสมอไม่ว่ากี่ผู้ช่วย — 15:2 ใช้เฉพาะเด็ก/ทารกเมื่อมี 2 ผู้ช่วย' },
    { id: 'bls-prec-13', topic: 'team',
      question: 'เทคนิคจับ mask ของ bag-mask ให้แนบสนิทด้วยมือเดียวคือ?',
      choices: [
        { id: 'a', text: 'กำ mask ไว้กลางฝ่ามือ' },
        { id: 'b', text: 'EC-clamp: นิ้วโป้ง-ชี้ทำตัว C กด mask, สามนิ้วที่เหลือทำตัว E ยกขากรรไกร' },
        { id: 'c', text: 'ใช้ศอกทับ mask ไว้' },
        { id: 'd', text: 'วาง mask เฉย ๆ ไม่ต้องกด' },
      ],
      correctId: 'b', explanation: 'EC-clamp ปิดรั่วรอบ mask พร้อมเปิด airway — ถ้ามีคนพอ ให้ใช้ 2 มือประคอง mask แล้วอีกคนบีบ bag' },

    // ---- In-hospital BLS (2) ----
    { id: 'bls-prec-14', topic: 'in-hospital',
      question: 'ทำ CPR บนเตียงลมในโรงพยาบาล ควรทำอย่างไรให้การกดได้ผล?',
      choices: [
        { id: 'a', text: 'ย้ายผู้ป่วยลงพื้นทันทีทุกราย' },
        { id: 'b', text: 'กดปุ่ม CPR mode ของเตียง หรือสอด backboard ใต้ตัวผู้ป่วย' },
        { id: 'c', text: 'กดเบาลงเพื่อไม่ให้เตียงยุบ' },
        { id: 'd', text: 'หยุดรอเปลี่ยนเตียงก่อน' },
      ],
      correctId: 'b', explanation: 'เตียงนุ่มดูดซับแรงกด — ใช้ CPR mode/backboard โดยไม่เสียเวลาย้ายผู้ป่วย' },
    { id: 'bls-prec-15', topic: 'in-hospital',
      question: 'ผู้ป่วยกลับมามีชีพจรและหายใจได้เอง (ROSC) ระหว่างรอทีม ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ปล่อยนอนหงายแล้วออกไปทำงานอื่น' },
        { id: 'b', text: 'เฝ้าติดตามใกล้ชิด ประเมิน ABC ซ้ำ ให้ออกซิเจน — พร้อมเริ่ม CPR ใหม่ถ้าทรุด' },
        { id: 'c', text: 'ให้ดื่มน้ำทันที' },
        { id: 'd', text: 'ปลุกให้ลุกนั่งเพื่อทดสอบ' },
      ],
      correctId: 'b', explanation: 'หลัง ROSC ผู้ป่วยทรุดซ้ำได้ทุกเมื่อ — เฝ้าประเมิน ABC ต่อเนื่องจนส่งต่อทีมดูแลขั้นสูง' },

    // ---- Infant / child (3) ----
    { id: 'bls-prec-16', topic: 'infant',
      question: 'อัตราการกดหน้าอกในทารกและเด็กคือ?',
      choices: [
        { id: 'a', text: '60–80/นาที' }, { id: 'b', text: '80–100/นาที' },
        { id: 'c', text: '100–120/นาที เท่าผู้ใหญ่' }, { id: 'd', text: '140–160/นาที' },
      ],
      correctId: 'c', explanation: 'อัตรากดเท่ากันทุกวัย: 100–120 ครั้ง/นาที — ที่ต่างคือความลึกและเทคนิคมือ' },
    { id: 'bls-prec-17', topic: 'infant',
      question: 'การกดหน้าอก "เด็กโต" (1 ปี–วัยรุ่น) ใช้เทคนิคใด?',
      choices: [
        { id: 'a', text: '2 นิ้วเหมือนทารกเสมอ' },
        { id: 'b', text: 'ส้นมือ 1 หรือ 2 ข้าง กดลึก 1/3 ของความหนาทรวงอก (~5 ซม.)' },
        { id: 'c', text: 'กดเบา ๆ 2 ซม. พอ' },
        { id: 'd', text: 'บีบจากด้านข้างลำตัว' },
      ],
      correctId: 'b', explanation: 'เด็ก: ส้นมือข้างเดียวหรือสองข้างตามขนาดตัว ลึก 1/3 AP diameter (~5 ซม.)' },
    { id: 'bls-prec-18', topic: 'infant',
      question: 'เด็ก/ทารกที่ "ยังมีชีพจร" ควรเริ่มกดหน้าอกเมื่อใด?',
      choices: [
        { id: 'a', text: 'ไม่ต้องกดเลยถ้ายังมีชีพจร' },
        { id: 'b', text: 'HR < 60/นาที ร่วมกับ perfusion แย่ (ซีด ลาย ซึม) แม้ยังมีชีพจร' },
        { id: 'c', text: 'HR < 100/นาที ทุกราย' },
        { id: 'd', text: 'เมื่อผู้ปกครองอนุญาต' },
      ],
      correctId: 'b', explanation: 'เด็ก HR < 60 + perfusion แย่ = กำลังจะ arrest — เริ่ม CPR พร้อมช่วยหายใจ อย่ารอชีพจรเป็นศูนย์' },

    // ---- Choking / FBAO (2) ----
    { id: 'bls-prec-19', topic: 'choking',
      question: 'ผู้ป่วยสำลักจน "หมดสติ" ล้มลง ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ทำ abdominal thrust ต่อในท่านอน' },
        { id: 'b', text: 'ประคองลงพื้น เรียกทีม/1669 แล้วเริ่ม CPR — ก่อนเป่าแต่ละรอบเปิดปากมองหาสิ่งแปลกปลอม' },
        { id: 'c', text: 'ล้วงคอแบบกวาดนิ้วทันที' },
        { id: 'd', text: 'จับห้อยหัวตบหลัง' },
      ],
      correctId: 'b', explanation: 'สำลักจนหมดสติ → เข้าโหมด CPR (การกดหน้าอกช่วยดันวัตถุออกด้วย) — หยิบเฉพาะที่มองเห็นชัด ห้าม blind sweep' },
    { id: 'bls-prec-20', topic: 'choking',
      question: 'อยู่คนเดียวแล้วสำลักเอง พูด/ไอไม่ได้ ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'นอนรอให้หายเอง' },
        { id: 'b', text: 'ทำ abdominal thrust กับตัวเอง หรือกระแทกท้องกับพนักเก้าอี้/ขอบโต๊ะ' },
        { id: 'c', text: 'ดื่มน้ำมาก ๆ' },
        { id: 'd', text: 'วิ่งหาคนช่วยอย่างเดียวโดยไม่ทำอะไร' },
      ],
      correctId: 'b', explanation: 'Self-Heimlich: กำหมัดกระตุกเหนือสะดือ หรือใช้ขอบพนักเก้าอี้ช่วยกระแทก — พร้อมพยายามขอความช่วยเหลือ' },
  ],
};
