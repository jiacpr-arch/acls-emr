// BLS-HCP Pre-test Set A — 20 questions (BLS per ILCOR 2025 + TRC)
// วัดพื้นฐานก่อนเรียน ครอบคลุมทั้ง 8 บท: chain 2, HQ-CPR 5, AED 3,
// one/2-rescuer + team 3, in-hospital 2, infant 3, choking 2
// ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อนปล่อย production

export const setA = {
  id: 'bls-pre-set-a',
  title: 'ชุด A',
  questions: [
    // ---- Chain of Survival / recognition (2) ----
    { id: 'bls-pre-1', topic: 'chain',
      question: 'พบคนล้มหมดสตินอกโรงพยาบาล ไม่ตอบสนอง ไม่หายใจ สิ่งแรกที่ควรทำหลังประเมินความปลอดภัยคือ?',
      choices: [
        { id: 'a', text: 'เริ่มกดหน้าอกทันทีโดยไม่ต้องขอความช่วยเหลือ' },
        { id: 'b', text: 'โทร 1669 / ตะโกนขอความช่วยเหลือ พร้อมขอ AED' },
        { id: 'c', text: 'เป่าปาก 2 ครั้งก่อน' },
        { id: 'd', text: 'จับชีพจร 30 วินาทีให้แน่ใจ' },
      ],
      correctId: 'b',
      explanation: 'OHCA: เรียกระบบฉุกเฉิน (1669) และขอ AED ก่อน แล้วจึงเริ่ม CPR — ห่วงโซ่แห่งการรอดชีวิตเริ่มที่ "รู้เร็ว-โทรเร็ว"' },
    { id: 'bls-pre-2', topic: 'chain',
      question: 'การตรวจชีพจร (พร้อมกับดูการหายใจ) ในผู้ป่วยหมดสติ ควรใช้เวลาไม่เกินกี่วินาที?',
      choices: [
        { id: 'a', text: '5 วินาที' }, { id: 'b', text: '10 วินาที' },
        { id: 'c', text: '20 วินาที' }, { id: 'd', text: '30 วินาที' },
      ],
      correctId: 'b',
      explanation: 'ตรวจชีพจรพร้อมประเมินการหายใจไม่เกิน 10 วินาที — ไม่แน่ใจให้ถือว่าไม่มีชีพจรและเริ่ม CPR' },

    // ---- High-Quality CPR (5) ----
    { id: 'bls-pre-3', topic: 'high-quality-cpr',
      question: 'อัตราการกดหน้าอกที่ถูกต้องในผู้ใหญ่คือ?',
      choices: [
        { id: 'a', text: '60–80 ครั้ง/นาที' }, { id: 'b', text: '80–100 ครั้ง/นาที' },
        { id: 'c', text: '100–120 ครั้ง/นาที' }, { id: 'd', text: 'เร็วที่สุดเท่าที่ทำได้' },
      ],
      correctId: 'c', explanation: 'ILCOR 2025: กด 100–120 ครั้ง/นาที' },
    { id: 'bls-pre-4', topic: 'high-quality-cpr',
      question: 'ความลึกการกดหน้าอกในผู้ใหญ่คือ?',
      choices: [
        { id: 'a', text: '2–3 ซม.' }, { id: 'b', text: '3–4 ซม.' },
        { id: 'c', text: '5–6 ซม.' }, { id: 'd', text: 'ยิ่งลึกยิ่งดี' },
      ],
      correctId: 'c', explanation: 'อย่างน้อย 5 ซม. แต่ไม่เกิน 6 ซม.' },
    { id: 'bls-pre-5', topic: 'high-quality-cpr',
      question: 'ตำแหน่งวางมือกดหน้าอกผู้ใหญ่ที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'ครึ่งล่างของกระดูก sternum' },
        { id: 'b', text: 'เหนือลิ้นปี่' },
        { id: 'c', text: 'ครึ่งบนของกระดูก sternum' },
        { id: 'd', text: 'ชายโครงซ้าย' },
      ],
      correctId: 'a', explanation: 'วางส้นมือบนครึ่งล่างของ sternum (กึ่งกลางหน้าอก ระดับหัวนม)' },
    { id: 'bls-pre-6', topic: 'high-quality-cpr',
      question: 'สัดส่วนการกดหน้าอกต่อการช่วยหายใจในผู้ใหญ่ (ยังไม่มีท่อช่วยหายใจ) คือ?',
      choices: [
        { id: 'a', text: '15:2' }, { id: 'b', text: '30:2' },
        { id: 'c', text: '30:1' }, { id: 'd', text: '5:1' },
      ],
      correctId: 'b', explanation: 'ผู้ใหญ่ใช้ 30:2 ทุกกรณี (15:2 ใช้ในเด็ก/ทารกเมื่อมีผู้ช่วย 2 คน)' },
    { id: 'bls-pre-7', topic: 'high-quality-cpr',
      question: 'ควรสลับผู้กดหน้าอกทุกกี่นาที (หรือเมื่อใด)?',
      choices: [
        { id: 'a', text: 'ทุก 5 นาที' },
        { id: 'b', text: 'ทุก 2 นาที หรือเมื่อผู้กดล้า' },
        { id: 'c', text: 'ไม่ต้องสลับถ้ายังไหว' },
        { id: 'd', text: 'ทุก 10 รอบ' },
      ],
      correctId: 'b', explanation: 'สลับทุก ~2 นาที (พร้อมจังหวะวิเคราะห์ rhythm) เพื่อคงคุณภาพการกด — ใช้เวลาสลับให้น้อยที่สุด' },

    // ---- AED (3) ----
    { id: 'bls-pre-8', topic: 'aed',
      question: 'เมื่อ AED มาถึงระหว่างทำ CPR ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ทำ CPR ต่อจนครบ 5 รอบก่อนค่อยเปิด AED' },
        { id: 'b', text: 'เปิดเครื่องและติด pads ทันที ทำตามคำแนะนำของเครื่อง' },
        { id: 'c', text: 'รอเจ้าหน้าที่กู้ชีพมาใช้ให้' },
        { id: 'd', text: 'ใช้ได้เฉพาะเมื่อผู้ป่วยไม่มีชีพจรเกิน 10 นาที' },
      ],
      correctId: 'b', explanation: 'ใช้ AED ให้เร็วที่สุด — เปิดเครื่อง ติด pads แล้วทำตามเสียงแนะนำ โดยหยุดกดหน้าอกให้น้อยที่สุด' },
    { id: 'bls-pre-9', topic: 'aed',
      question: 'ขณะ AED กำลังวิเคราะห์จังหวะหัวใจ ต้องทำอย่างไร?',
      choices: [
        { id: 'a', text: 'กดหน้าอกต่อเนื่อง' },
        { id: 'b', text: 'ห้ามสัมผัสตัวผู้ป่วย' },
        { id: 'c', text: 'เป่าปากช่วยหายใจ' },
        { id: 'd', text: 'จับชีพจรไปพร้อมกัน' },
      ],
      correctId: 'b', explanation: 'ช่วงวิเคราะห์และช่วง shock ห้ามแตะตัวผู้ป่วย (Clear!) เพื่อไม่ให้สัญญาณรบกวนและเพื่อความปลอดภัย' },
    { id: 'bls-pre-10', topic: 'aed',
      question: 'หลังเครื่อง AED สั่ง shock และกดปุ่ม shock แล้ว ขั้นตอนถัดไปคือ?',
      choices: [
        { id: 'a', text: 'ตรวจชีพจรทันที' },
        { id: 'b', text: 'เริ่มกดหน้าอกต่อทันที 2 นาที' },
        { id: 'c', text: 'รอเครื่องวิเคราะห์ซ้ำ' },
        { id: 'd', text: 'ถอด pads ออก' },
      ],
      correctId: 'b', explanation: 'หลัง shock → CPR ต่อทันที 2 นาที แล้วเครื่องจะวิเคราะห์ซ้ำเอง' },

    // ---- One-rescuer / 2-rescuer / Team (3) ----
    { id: 'bls-pre-11', topic: 'team',
      question: 'อยู่คนเดียวพบผู้ใหญ่หมดสติ ไม่มีโทรศัพท์ใกล้ตัว ลำดับที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'ทำ CPR 2 นาทีก่อน แล้วค่อยไปตามคน/โทรแจ้ง' },
        { id: 'b', text: 'ไปตามคน/โทรแจ้งและเอา AED ก่อน แล้วกลับมาเริ่ม CPR' },
        { id: 'c', text: 'ทำ CPR ไปเรื่อย ๆ จนกว่าจะมีคนผ่านมา' },
        { id: 'd', text: 'อุ้มผู้ป่วยไปโรงพยาบาลเอง' },
      ],
      correctId: 'b', explanation: 'ผู้ใหญ่ (สาเหตุมักเป็นหัวใจ): activate EMS + เอา AED ก่อน แล้วจึง CPR — ต่างจากเด็ก/จมน้ำที่ให้ CPR 2 นาทีก่อนถ้าอยู่คนเดียว' },
    { id: 'bls-pre-12', topic: 'team',
      question: 'การช่วยหายใจด้วย bag-mask ที่ถูกต้อง ให้บีบ bag อย่างไร?',
      choices: [
        { id: 'a', text: 'บีบเร็วและแรงที่สุดให้ปอดพองเต็มที่' },
        { id: 'b', text: 'บีบ ~1 วินาที ให้เห็นหน้าอกยกขึ้น' },
        { id: 'c', text: 'บีบ 3–4 วินาทีต่อครั้ง' },
        { id: 'd', text: 'บีบพร้อมกับจังหวะกดหน้าอก' },
      ],
      correctId: 'b', explanation: 'เป่า/บีบช้า ๆ ~1 วินาที พอเห็นหน้าอกยก — หลีกเลี่ยง over-ventilation ซึ่งลด venous return' },
    { id: 'bls-pre-13', topic: 'team',
      question: 'หลักการสื่อสารแบบ closed-loop ในทีมกู้ชีพคือ?',
      choices: [
        { id: 'a', text: 'หัวหน้าทีมพูดคนเดียว สมาชิกห้ามพูด' },
        { id: 'b', text: 'ผู้รับคำสั่งทวนคำสั่ง และรายงานเมื่อทำเสร็จ' },
        { id: 'c', text: 'ทุกคนทำงานเงียบ ๆ ไม่ต้องพูด' },
        { id: 'd', text: 'สั่งงานผ่านวิทยุเท่านั้น' },
      ],
      correctId: 'b', explanation: 'Closed-loop: สั่งชัดเจน-ระบุตัวคน → ผู้รับทวนคำสั่ง → รายงานผลเมื่อทำเสร็จ' },

    // ---- In-hospital BLS (2) ----
    { id: 'bls-pre-14', topic: 'in-hospital',
      question: 'พบผู้ป่วยใน ward หัวใจหยุดเต้น สิ่งที่ต้องทำพร้อมกับเริ่ม CPR คือ?',
      choices: [
        { id: 'a', text: 'โทรตามญาติ' },
        { id: 'b', text: 'เรียก code blue/ทีมกู้ชีพ พร้อมขอ defibrillator/AED' },
        { id: 'c', text: 'เข็นผู้ป่วยไป ER ก่อน' },
        { id: 'd', text: 'รอแพทย์เวรมาถึงก่อนเริ่มกด' },
      ],
      correctId: 'b', explanation: 'IHCA: activate code blue และขอ defibrillator ทันที — ห้ามรอ ให้เริ่มกดหน้าอกเลย' },
    { id: 'bls-pre-15', topic: 'in-hospital',
      question: 'ก่อนกดปุ่ม shock ด้วย defibrillator/AED ในโรงพยาบาล ต้องทำอะไรเสมอ?',
      choices: [
        { id: 'a', text: 'ปิดออกซิเจนไหลอิสระ + ประกาศ "Clear" ดูให้ไม่มีใครแตะผู้ป่วย' },
        { id: 'b', text: 'ตรวจชีพจรก่อน shock' },
        { id: 'c', text: 'ถอดเสื้อผู้ป่วยออกทั้งหมดทุกครั้ง' },
        { id: 'd', text: 'ฉีด adrenaline ก่อน' },
      ],
      correctId: 'a', explanation: 'ความปลอดภัยก่อน shock: เอา O2 ไหลอิสระออกจากบริเวณหน้าอก + Clear ทีมทุกคน' },

    // ---- Infant / child (3) ----
    { id: 'bls-pre-16', topic: 'infant',
      question: 'ตำแหน่งคลำชีพจรในทารก (< 1 ปี) คือ?',
      choices: [
        { id: 'a', text: 'Carotid ที่คอ' }, { id: 'b', text: 'Brachial ที่ต้นแขน' },
        { id: 'c', text: 'Radial ที่ข้อมือ' }, { id: 'd', text: 'Femoral เท่านั้น' },
      ],
      correctId: 'b', explanation: 'ทารกใช้ brachial pulse (คอทารกสั้น คลำ carotid ยาก)' },
    { id: 'bls-pre-17', topic: 'infant',
      question: 'การกดหน้าอกทารกเมื่อมีผู้ช่วยเหลือ 2 คน แนะนำเทคนิคใด?',
      choices: [
        { id: 'a', text: 'ใช้ส้นมือ 2 ข้าง' },
        { id: 'b', text: 'ใช้ 2 นิ้วชี้-กลาง มือเดียว' },
        { id: 'c', text: 'ใช้นิ้วหัวแม่มือ 2 ข้างโอบรอบทรวงอก (two thumb–encircling hands)' },
        { id: 'd', text: 'กดด้วยข้อศอก' },
      ],
      correctId: 'c', explanation: '2 ผู้ช่วย: two thumb–encircling hands ได้ความลึก/คุณภาพดีกว่า — ใช้อัตราส่วน 15:2' },
    { id: 'bls-pre-18', topic: 'infant',
      question: 'ความลึกการกดหน้าอกในทารกคือ?',
      choices: [
        { id: 'a', text: '1/3 ของความหนาทรวงอก (~4 ซม.)' },
        { id: 'b', text: '5–6 ซม. เท่าผู้ใหญ่' },
        { id: 'c', text: '1 ซม. พอ' },
        { id: 'd', text: 'ครึ่งหนึ่งของความหนาทรวงอก' },
      ],
      correctId: 'a', explanation: 'ทารก: กดลึก 1/3 ของ AP diameter (~4 ซม.)' },

    // ---- Choking / FBAO (2) ----
    { id: 'bls-pre-19', topic: 'choking',
      question: 'ผู้ใหญ่สำลักอาหาร พูดไม่ได้ ไอไม่ออก มือกุมคอ ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ให้ดื่มน้ำ' },
        { id: 'b', text: 'ทำ abdominal thrust (Heimlich) จนสิ่งแปลกปลอมหลุดหรือหมดสติ' },
        { id: 'c', text: 'ล้วงคอทันที' },
        { id: 'd', text: 'รอดูอาการก่อน' },
      ],
      correctId: 'b', explanation: 'อุดกั้นรุนแรง (พูด/ไอไม่ได้): abdominal thrust ซ้ำ ๆ — ถ้าหมดสติให้เริ่ม CPR และโทรแจ้ง 1669' },
    { id: 'bls-pre-20', topic: 'choking',
      question: 'ทารกสำลักสิ่งแปลกปลอม ยังรู้สึกตัวแต่ไอไม่ออก วิธีช่วยที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'Abdominal thrust เหมือนผู้ใหญ่' },
        { id: 'b', text: 'ตบหลัง 5 ครั้ง สลับกดหน้าอก 5 ครั้ง' },
        { id: 'c', text: 'จับห้อยหัวเขย่า' },
        { id: 'd', text: 'ล้วงคอแบบ blind sweep' },
      ],
      correctId: 'b', explanation: 'ทารก: back blows 5 ครั้ง สลับ chest thrusts 5 ครั้ง — ห้าม abdominal thrust และห้าม blind finger sweep' },
  ],
};
