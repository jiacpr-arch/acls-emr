// BLS-HCP Pre-test Set B — 20 questions (BLS per ILCOR 2025 + TRC)
// พิมพ์เขียวเดียวกับชุด A: chain 2, HQ-CPR 5, AED 3, one/2-rescuer + team 3,
// in-hospital 2, infant 3, choking 2 — คนละโจทย์กับชุด A ทั้งหมด
// ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อนปล่อย production

export const setB = {
  id: 'bls-pre-set-b',
  title: 'ชุด B',
  questions: [
    // ---- Chain of Survival / recognition (2) ----
    { id: 'bls-preb-1', topic: 'chain',
      question: 'ผู้ป่วยหมดสติ ไม่ตอบสนอง แต่ยังหายใจ "เฮือก" เป็นพัก ๆ เสียงครืดคราด ควรแปลผลว่าอย่างไร?',
      choices: [
        { id: 'a', text: 'ยังหายใจอยู่ — จัดท่านอนตะแคงแล้วเฝ้าดู' },
        { id: 'b', text: 'เป็น agonal gasping — ถือว่าหัวใจหยุดเต้น เริ่ม CPR ทันที' },
        { id: 'c', text: 'เป็นการนอนกรน ปลุกต่อไปเรื่อย ๆ' },
        { id: 'd', text: 'รอดูอีก 1 นาทีว่าหายใจดีขึ้นไหม' },
      ],
      correctId: 'b',
      explanation: 'หมดสติ + agonal gasping = cardiac arrest — อย่ารอ ให้เรียกคนช่วย/ขอ AED และเริ่มกดหน้าอกทันที' },
    { id: 'bls-preb-2', topic: 'chain',
      question: 'ห่วงโซ่แห่งการรอดชีวิตนอกโรงพยาบาล (OHCA) เรียงลำดับ 3 ห่วงแรกที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'CPR → โทรแจ้ง → AED' },
        { id: 'b', text: 'โทรแจ้งเร็ว → CPR เร็ว → Defibrillation เร็ว' },
        { id: 'c', text: 'AED → CPR → โทรแจ้ง' },
        { id: 'd', text: 'รอทีมกู้ชีพ → CPR → AED' },
      ],
      correctId: 'b',
      explanation: 'รู้เร็ว-โทรเร็ว (1669) → CPR โดยผู้พบเห็นทันที → ใช้ AED ให้เร็วที่สุด' },

    // ---- High-Quality CPR (5) ----
    { id: 'bls-preb-3', topic: 'high-quality-cpr',
      question: 'ข้อใดคือชุดตัวเลข CPR คุณภาพสูงในผู้ใหญ่ที่ถูกต้องทั้งหมด?',
      choices: [
        { id: 'a', text: 'กด 80/นาที ลึก 4 ซม.' },
        { id: 'b', text: 'กด 100–120/นาที ลึก 5–6 ซม.' },
        { id: 'c', text: 'กด 120–140/นาที ลึก 6–7 ซม.' },
        { id: 'd', text: 'กดเร็วสุด ลึกสุดเท่าที่ทำได้' },
      ],
      correctId: 'b', explanation: 'ILCOR 2025: 100–120 ครั้ง/นาที ลึกอย่างน้อย 5 ซม. ไม่เกิน 6 ซม.' },
    { id: 'bls-preb-4', topic: 'high-quality-cpr',
      question: 'การ "พิงมือ" ค้างบนหน้าอกระหว่างจังหวะปล่อย (leaning) ส่งผลเสียอย่างไร?',
      choices: [
        { id: 'a', text: 'ไม่มีผล ถ้ายังกดลึกพอ' },
        { id: 'b', text: 'หน้าอกคืนตัวไม่เต็มที่ → เลือดไหลกลับหัวใจน้อยลง' },
        { id: 'c', text: 'ทำให้กดเร็วเกินไป' },
        { id: 'd', text: 'ผู้กดเหนื่อยช้าลง' },
      ],
      correctId: 'b', explanation: 'Incomplete recoil เพิ่มความดันในทรวงอก ลด venous return → cardiac output ตก' },
    { id: 'bls-preb-5', topic: 'high-quality-cpr',
      question: 'ผู้ป่วยนอนบนที่นอนนุ่ม ควรทำอย่างไรเพื่อให้การกดหน้าอกได้ผล?',
      choices: [
        { id: 'a', text: 'กดแรงขึ้นกว่าปกติมาก ๆ' },
        { id: 'b', text: 'ย้ายลงพื้นแข็ง หรือสอด backboard ใต้ตัว' },
        { id: 'c', text: 'กดที่เดิมได้เลย ที่นอนไม่มีผล' },
        { id: 'd', text: 'เปลี่ยนไปกดที่หน้าท้องแทน' },
      ],
      correctId: 'b', explanation: 'พื้นนุ่มดูดซับแรงกด ความลึกจริงหายไป — ต้องมีพื้นแข็งรองรับ' },
    { id: 'bls-preb-6', topic: 'high-quality-cpr',
      question: 'เมื่อผู้ป่วยมี advanced airway (เช่น ท่อช่วยหายใจ) แล้ว รูปแบบ CPR เปลี่ยนเป็นอย่างไร?',
      choices: [
        { id: 'a', text: 'ยังคง 30:2 เหมือนเดิม' },
        { id: 'b', text: 'กดหน้าอกต่อเนื่อง + ช่วยหายใจ 1 ครั้งทุก 6 วินาที' },
        { id: 'c', text: 'หยุดกด เน้นช่วยหายใจอย่างเดียว' },
        { id: 'd', text: 'กด 15:2' },
      ],
      correctId: 'b', explanation: 'มี advanced airway: ไม่ต้องหยุดกดเพื่อเป่า — กดต่อเนื่อง 100–120/นาที + ventilate 10 ครั้ง/นาที' },
    { id: 'bls-preb-7', topic: 'high-quality-cpr',
      question: 'เป้าหมายการหยุดกดหน้าอก (interruption) แต่ละครั้งตามแนวทาง 2025 คือ?',
      choices: [
        { id: 'a', text: 'ไม่เกิน 10 วินาที' }, { id: 'b', text: 'ไม่เกิน 30 วินาที' },
        { id: 'c', text: 'ไม่เกิน 1 นาที' }, { id: 'd', text: 'หยุดได้ตามต้องการ' },
      ],
      correctId: 'a', explanation: 'จำกัดทุก interruption < 10 วินาที เพื่อรักษา CCF > 80%' },

    // ---- AED (3) ----
    { id: 'bls-preb-8', topic: 'aed',
      question: 'ผู้ป่วยตัวเปียกฝนนอนอยู่บนพื้นแฉะ ก่อนใช้ AED ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ติด pads ได้เลย น้ำไม่มีผล' },
        { id: 'b', text: 'ย้ายพ้นแอ่งน้ำ เช็ดหน้าอกให้แห้ง แล้วติด pads' },
        { id: 'c', text: 'ห้ามใช้ AED กับคนตัวเปียกเด็ดขาด' },
        { id: 'd', text: 'รอตัวแห้งเองก่อนค่อยใช้' },
      ],
      correctId: 'b', explanation: 'น้ำบนหน้าอกทำให้กระแสไหลผ่านผิวหนัง — ย้ายพ้นน้ำ เช็ดแห้ง แล้วใช้ได้ปกติ' },
    { id: 'bls-preb-9', topic: 'aed',
      question: 'พบผู้ใหญ่หมดสติมีเครื่อง AED อยู่ข้างตัวพอดี ยังไม่ได้เริ่มกดหน้าอก ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'กดหน้าอกให้ครบ 5 รอบ (2 นาที) ก่อนเสมอ' },
        { id: 'b', text: 'เปิด AED ใช้ทันที — defib เร็วที่สุดคือหัวใจของการรอด' },
        { id: 'c', text: 'เป่าปาก 2 ครั้งก่อนเปิดเครื่อง' },
        { id: 'd', text: 'โทร 1669 รอสายก่อนใช้เครื่อง' },
      ],
      correctId: 'b', explanation: 'AED พร้อมใช้ = ใช้ทันที (ระหว่างรอคนอื่นโทรแจ้ง) — อย่าชะลอการ shock' },
    { id: 'bls-preb-10', topic: 'aed',
      question: 'ผู้ป่วยติดแผ่นยาแปะอก (transdermal patch) ตรงตำแหน่งที่จะติด pads ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ติด pads ทับไปเลย' },
        { id: 'b', text: 'ลอกแผ่นยาออก เช็ดผิว แล้วติด pads' },
        { id: 'c', text: 'งดใช้ AED' },
        { id: 'd', text: 'ลดพลังงาน shock ลงครึ่งหนึ่ง' },
      ],
      correctId: 'b', explanation: 'แผ่นยาขวางการนำไฟฟ้าและอาจไหม้ผิว — ลอกออกและเช็ดก่อนติด pads' },

    // ---- One-rescuer / 2-rescuer / Team (3) ----
    { id: 'bls-preb-11', topic: 'team',
      question: 'อยู่คนเดียวพบ "เด็ก" จมน้ำ หมดสติ ไม่มีโทรศัพท์ ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'วิ่งไปหาโทรศัพท์ก่อนเสมอ' },
        { id: 'b', text: 'ทำ CPR ~2 นาทีก่อน แล้วจึงไปขอความช่วยเหลือ' },
        { id: 'c', text: 'อุ้มเด็กวิ่งหาคนช่วยโดยไม่ทำอะไร' },
        { id: 'd', text: 'ทำแต่การกดหน้าอก ห้ามเป่าปาก' },
      ],
      correctId: 'b', explanation: 'เด็ก/จมน้ำ = asphyxial arrest — CPR (พร้อมช่วยหายใจ) 2 นาทีก่อน แล้วค่อยไปโทร — ต่างจากผู้ใหญ่ที่ "โทรก่อน"' },
    { id: 'bls-preb-12', topic: 'team',
      question: 'หัวหน้าทีมสั่ง "ขอ adrenaline" โดยไม่ระบุชื่อคน ผลที่มักเกิดคืออะไร และควรสั่งอย่างไร?',
      choices: [
        { id: 'a', text: 'ทุกคนทำพร้อมกัน — ดีแล้ว' },
        { id: 'b', text: 'ไม่มีใครทำเพราะคิดว่าคนอื่นรับไปแล้ว — ควรระบุชื่อผู้รับคำสั่งและให้ทวนคำสั่ง' },
        { id: 'c', text: 'คนใกล้สุดต้องทำเสมอ ไม่ต้องเปลี่ยนวิธีสั่ง' },
        { id: 'd', text: 'ต้องเขียนคำสั่งเป็นลายลักษณ์อักษร' },
      ],
      correctId: 'b', explanation: 'Closed-loop communication: สั่งระบุตัวคน → ผู้รับทวนคำสั่ง → รายงานเมื่อทำเสร็จ' },
    { id: 'bls-preb-13', topic: 'team',
      question: 'ขณะ 2-rescuer CPR การสลับบทบาทผู้กด-ผู้ช่วยหายใจ ควรทำเมื่อใดจึงเสีย CCF น้อยที่สุด?',
      choices: [
        { id: 'a', text: 'ตอนใดก็ได้ที่ผู้กดอยากพัก' },
        { id: 'b', text: 'ช่วงที่ AED กำลังวิเคราะห์จังหวะ (ทุก ~2 นาที)' },
        { id: 'c', text: 'ทุก 30 วินาที' },
        { id: 'd', text: 'หลัง shock ทันทีก่อนเริ่มกด' },
      ],
      correctId: 'b', explanation: 'สลับตอนเครื่องวิเคราะห์ rhythm ซึ่งต้องหยุดกดอยู่แล้ว — ไม่เพิ่ม interruption ใหม่' },

    // ---- In-hospital BLS (2) ----
    { id: 'bls-preb-14', topic: 'in-hospital',
      question: 'พยาบาลพบผู้ป่วยหัวใจหยุดเต้นใน ward ระหว่างรอทีม code blue หน้าที่สำคัญที่สุดคือ?',
      choices: [
        { id: 'a', text: 'เขียนบันทึกเหตุการณ์ให้ครบ' },
        { id: 'b', text: 'กดหน้าอกคุณภาพสูงต่อเนื่อง + เตรียม defibrillator ที่มาถึง' },
        { id: 'c', text: 'ใส่สายน้ำเกลือให้ได้ก่อน' },
        { id: 'd', text: 'ตามญาติมาเซ็นยินยอม' },
      ],
      correctId: 'b', explanation: 'BLS ที่ไม่สะดุดคือรากฐานของทีมกู้ชีพ — กดต่อเนื่อง สลับคน ใช้ defib ให้เร็ว' },
    { id: 'bls-preb-15', topic: 'in-hospital',
      question: 'การใช้ defibrillator แบบ manual ใน "AED mode" ต่างจาก AED ทั่วไปอย่างไร?',
      choices: [
        { id: 'a', text: 'ต้องอ่าน EKG เองเสมอ' },
        { id: 'b', text: 'เครื่องวิเคราะห์และแนะนำ shock ให้เหมือน AED — ใช้ได้แม้ยังไม่ชำนาญการอ่านจังหวะ' },
        { id: 'c', text: 'ใช้ไม่ได้กับผู้ป่วยหัวใจหยุดเต้น' },
        { id: 'd', text: 'พลังงานต่ำกว่า AED ปกติ' },
      ],
      correctId: 'b', explanation: 'AED mode ให้เครื่องวิเคราะห์อัตโนมัติ — บุคลากร BLS ใช้ defib ของ ward ได้โดยไม่ต้องรอคนอ่าน EKG' },

    // ---- Infant / child (3) ----
    { id: 'bls-preb-16', topic: 'infant',
      question: 'สัดส่วนกดหน้าอก : ช่วยหายใจ ในทารก เมื่อมีผู้ช่วยเหลือ 2 คน คือ?',
      choices: [
        { id: 'a', text: '30:2' }, { id: 'b', text: '15:2' },
        { id: 'c', text: '5:1' }, { id: 'd', text: 'กดอย่างเดียวไม่ต้องเป่า' },
      ],
      correctId: 'b', explanation: 'เด็ก/ทารก 2 ผู้ช่วย: 15:2 (คนเดียว 30:2) — arrest เด็กมักเกิดจากขาดออกซิเจน จึงต้องช่วยหายใจถี่ขึ้น' },
    { id: 'bls-preb-17', topic: 'infant',
      question: 'การกดหน้าอกทารกเมื่ออยู่ "คนเดียว" ใช้เทคนิคใด?',
      choices: [
        { id: 'a', text: '2 นิ้ว (นิ้วชี้-กลาง) กึ่งกลางอกใต้แนวหัวนม' },
        { id: 'b', text: 'ส้นมือข้างเดียว (heel of 1 hand) หรือ 2-thumb encircling' },
        { id: 'c', text: 'สองมือประสานเหมือนผู้ใหญ่' },
        { id: 'd', text: 'บีบทรวงอกจากด้านข้าง' },
      ],
      correctId: 'b', explanation: 'แนวทาง 2025 เลิกใช้ 2-finger (มักกดได้ไม่ลึกพอ) — คนเดียวใช้ heel-of-1-hand หรือ 2-thumb encircling; 2 คน (HCP) ใช้ 2-thumb encircling' },
    { id: 'bls-preb-18', topic: 'infant',
      question: 'ทารกมีชีพจร 80/นาที หายใจเองไม่ได้ ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'เริ่มกดหน้าอกทันที' },
        { id: 'b', text: 'ช่วยหายใจ (rescue breathing) โดยยังไม่กดหน้าอก และประเมินซ้ำ' },
        { id: 'c', text: 'ใช้ AED ทันที' },
        { id: 'd', text: 'ไม่ต้องทำอะไรเพราะยังมีชีพจร' },
      ],
      correctId: 'b', explanation: 'มีชีพจร ≥ 60 แต่ไม่หายใจ → ช่วยหายใจอย่างเดียว — จะกดหน้าอกเมื่อไม่มีชีพจร หรือ HR < 60 + perfusion แย่' },

    // ---- Choking / FBAO (2) ----
    { id: 'bls-preb-19', topic: 'choking',
      question: 'ผู้ป่วยสำลักแต่ยัง "ไอได้เสียงดัง พูดได้" ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'ทำ abdominal thrust ทันที' },
        { id: 'b', text: 'กระตุ้นให้ไอต่อ เฝ้าดูใกล้ ๆ — ยังไม่ต้อง thrust' },
        { id: 'c', text: 'ตบหลังแรง ๆ 5 ครั้ง' },
        { id: 'd', text: 'ล้วงคอหาสิ่งแปลกปลอม' },
      ],
      correctId: 'b', explanation: 'อุดกั้นเล็กน้อย (ไอมีเสียง): การไอคือกลไกขับที่ดีที่สุด — เข้าไปแทรกแซงอาจทำให้วัตถุเลื่อนไปอุดสนิท' },
    { id: 'bls-preb-20', topic: 'choking',
      question: 'หญิงตั้งครรภ์ครรภ์ใหญ่สำลักรุนแรง (พูด/ไอไม่ได้) ควรช่วยด้วยวิธีใด?',
      choices: [
        { id: 'a', text: 'Abdominal thrust ตามปกติ' },
        { id: 'b', text: 'Chest thrust (กระตุกที่กลางหน้าอก) แทน abdominal thrust' },
        { id: 'c', text: 'ให้นั่งพักดื่มน้ำ' },
        { id: 'd', text: 'ตบหลังเท่านั้น ห้าม thrust ทุกชนิด' },
      ],
      correctId: 'b', explanation: 'ตั้งครรภ์/อ้วนมาก: ใช้ chest thrust ตำแหน่งเดียวกับการกดหน้าอก — หลีกเลี่ยงแรงกระแทกที่มดลูก' },
  ],
};
