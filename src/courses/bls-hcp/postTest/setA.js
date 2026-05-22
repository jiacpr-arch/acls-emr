// BLS-HCP Post-test Set A — 25 questions (AHA BLS-HCP 2020 + TRC)
// Distribution: HQ-CPR 5, AED 3, team/2-rescuer 3, peds 4, infant 4, choking 3, opioid 2, chain 1
// ต้องผ่าน medical review โดยแพทย์ EM/ICU ก่อนปล่อย production

export const setA = {
  id: 'bls-set-a',
  title: 'ชุด A',
  questions: [
    // ---- Chain of Survival / recognition ----
    { id: 'bls-a-1', topic: 'chain',
      question: 'พบผู้ป่วยใน ward หมดสติ ไม่ตอบสนอง ขั้นตอนแรกที่ถูกต้องคือ?',
      choices: [
        { id: 'a', text: 'เริ่มกดหน้าอกทันที' },
        { id: 'b', text: 'เรียก code blue/RRT พร้อมขอ defibrillator' },
        { id: 'c', text: 'ตรวจชีพจร 30 วินาที' },
        { id: 'd', text: 'ไปตามแพทย์เวรเอง' },
      ],
      correctId: 'b',
      explanation: 'IHCA: activate code blue/RRT พร้อมขอ defib ทันที' },

    // ---- High-Quality CPR (5) ----
    { id: 'bls-a-2', topic: 'high-quality-cpr',
      question: 'อัตราการกดหน้าอกในผู้ใหญ่ตาม AHA 2020 คือเท่าไร?',
      choices: [
        { id: 'a', text: '60–80/min' }, { id: 'b', text: '80–100/min' },
        { id: 'c', text: '100–120/min' }, { id: 'd', text: '>120/min' },
      ],
      correctId: 'c', explanation: '100–120 ครั้ง/นาที' },
    { id: 'bls-a-3', topic: 'high-quality-cpr',
      question: 'ความลึกการกดหน้าอกผู้ใหญ่ที่เหมาะสมคือ?',
      choices: [
        { id: 'a', text: '2–3 ซม.' }, { id: 'b', text: '3–4 ซม.' },
        { id: 'c', text: '5–6 ซม.' }, { id: 'd', text: '>7 ซม.' },
      ],
      correctId: 'c', explanation: '5–6 ซม. หรือ ≥ 1/3 AP diameter' },
    { id: 'bls-a-4', topic: 'high-quality-cpr',
      question: 'Chest Compression Fraction (CCF) ควร ≥ เท่าไร?',
      choices: [
        { id: 'a', text: '40%' }, { id: 'b', text: '60%' },
        { id: 'c', text: '80%' }, { id: 'd', text: '100%' },
      ],
      correctId: 'b', explanation: 'CCF ≥ 60% (เป้า 80%)' },
    { id: 'bls-a-5', topic: 'high-quality-cpr',
      question: 'ทำไมต้องปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil)?',
      choices: [
        { id: 'a', text: 'เพื่อพักกล้ามเนื้อผู้กด' },
        { id: 'b', text: 'เพิ่ม venous return ใน diastole' },
        { id: 'c', text: 'ให้ผู้ป่วยหายใจเอง' },
        { id: 'd', text: 'ลดอัตราการกด' },
      ],
      correctId: 'b', explanation: 'Incomplete recoil ลด venous return → ลด cardiac output' },
    { id: 'bls-a-6', topic: 'high-quality-cpr',
      question: 'การหยุดกดหน้าอกเพื่อสลับคน ไม่ควรเกินกี่วินาที?',
      choices: [
        { id: 'a', text: '5 วินาที' }, { id: 'b', text: '10 วินาที' },
        { id: 'c', text: '20 วินาที' }, { id: 'd', text: '30 วินาที' },
      ],
      correctId: 'a', explanation: 'หยุด > 5 วินาทีลด coronary perfusion อย่างมาก' },

    // ---- AED (3) ----
    { id: 'bls-a-7', topic: 'aed',
      question: 'ทันทีหลัง AED shock ควรทำอะไร?',
      choices: [
        { id: 'a', text: 'ตรวจชีพจรทันที' },
        { id: 'b', text: 'เริ่มกดหน้าอกต่อ 2 นาที' },
        { id: 'c', text: 'รอวิเคราะห์ rhythm ซ้ำ' },
        { id: 'd', text: 'ใส่ ETT' },
      ],
      correctId: 'b', explanation: 'หลัง shock → CPR ต่อ 2 นาที ห้ามตรวจ pulse' },
    { id: 'bls-a-8', topic: 'aed',
      question: 'AED ในเด็ก < 8 ปี ควรใช้อย่างไรถ้าไม่มี pediatric pads?',
      choices: [
        { id: 'a', text: 'ห้ามใช้' },
        { id: 'b', text: 'ใช้ผู้ใหญ่ได้ defib เป็นชีวิต' },
        { id: 'c', text: 'รอ EMS' },
        { id: 'd', text: 'ใช้ครึ่งพลังงาน' },
      ],
      correctId: 'b', explanation: 'ถ้าไม่มี peds pads ใช้ adult pads ได้ — ห้ามชะลอ defib' },
    { id: 'bls-a-9', topic: 'aed',
      question: 'ผู้ป่วยมี pacemaker ตำแหน่งวาง pads ควรเป็นอย่างไร?',
      choices: [
        { id: 'a', text: 'วางบน pacemaker เลย' },
        { id: 'b', text: 'ห่างจาก pacemaker ≥ 2.5 ซม.' },
        { id: 'c', text: 'ไม่ shock' },
        { id: 'd', text: 'ปิด pacemaker ก่อน' },
      ],
      correctId: 'b', explanation: 'ห่างจาก pacemaker ≥ 2.5 ซม.' },

    // ---- Team dynamics / 2-rescuer (3) ----
    { id: 'bls-a-10', topic: 'team',
      question: 'ใส่ advanced airway แล้ว ventilate อย่างไร?',
      choices: [
        { id: 'a', text: '30:2 ตามปกติ' },
        { id: 'b', text: '1 ครั้ง/6 วินาที (10/min) + continuous compressions' },
        { id: 'c', text: '1 ครั้ง/3 วินาที' },
        { id: 'd', text: 'ไม่ ventilate' },
      ],
      correctId: 'b', explanation: 'หลัง advanced airway: continuous compressions + 10 breaths/min' },
    { id: 'bls-a-11', topic: 'team',
      question: 'ควรสลับคนกดทุกกี่นาที?',
      choices: [
        { id: 'a', text: 'ทุก 30 วินาที' }, { id: 'b', text: 'ทุก 2 นาที' },
        { id: 'c', text: 'ทุก 10 นาที' }, { id: 'd', text: 'ไม่ต้องสลับ' },
      ],
      correctId: 'b', explanation: 'ทุก 2 นาที เพื่อรักษาคุณภาพ' },
    { id: 'bls-a-12', topic: 'team',
      question: 'Closed-loop communication คืออะไร?',
      choices: [
        { id: 'a', text: 'การสั่งงานต่อกันเป็นทอด ๆ' },
        { id: 'b', text: 'Leader สั่ง → ผู้รับยืนยัน → ทำเสร็จรายงานกลับ' },
        { id: 'c', text: 'ปิดประตูห้อง' },
        { id: 'd', text: 'ส่งสัญญาณมือ' },
      ],
      correctId: 'b', explanation: 'Closed-loop ลด error ใน high-stress' },

    // ---- Pediatric 1-8 (4) ----
    { id: 'bls-a-13', topic: 'pediatric',
      question: 'อัตราส่วน C:V ในเด็ก 2-rescuer คือ?',
      choices: [
        { id: 'a', text: '30:2' }, { id: 'b', text: '15:2' },
        { id: 'c', text: '5:1' }, { id: 'd', text: '10:2' },
      ],
      correctId: 'b', explanation: '2-rescuer ในเด็ก: 15:2 (1-rescuer 30:2)' },
    { id: 'bls-a-14', topic: 'pediatric',
      question: 'เด็ก HR 50 + poor perfusion ควรทำอย่างไร?',
      choices: [
        { id: 'a', text: 'รอดูอาการ' },
        { id: 'b', text: 'ให้ O2 อย่างเดียว' },
        { id: 'c', text: 'เริ่มกดหน้าอกทันที' },
        { id: 'd', text: 'ฉีด atropine' },
      ],
      correctId: 'c', explanation: 'HR<60 + poor perfusion → start compressions' },
    { id: 'bls-a-15', topic: 'pediatric',
      question: 'ความลึกการกดในเด็กคือ?',
      choices: [
        { id: 'a', text: '2–3 ซม.' }, { id: 'b', text: '~5 ซม. หรือ 1/3 AP' },
        { id: 'c', text: '6–7 ซม.' }, { id: 'd', text: 'เท่าผู้ใหญ่ทุกอย่าง' },
      ],
      correctId: 'b', explanation: '1/3 AP diameter ~ 5 ซม.' },
    { id: 'bls-a-16', topic: 'pediatric',
      question: 'สาเหตุหลักของ cardiac arrest ในเด็กคือ?',
      choices: [
        { id: 'a', text: 'Primary cardiac (VF/VT)' },
        { id: 'b', text: 'Respiratory cause (asphyxia)' },
        { id: 'c', text: 'Trauma' },
        { id: 'd', text: 'ยาเกินขนาด' },
      ],
      correctId: 'b', explanation: 'เด็กส่วนใหญ่ arrest จาก respiratory cause → เน้น ventilation' },

    // ---- Infant <1 yr (4) ----
    { id: 'bls-a-17', topic: 'infant',
      question: 'ตรวจชีพจรในทารกใช้ตำแหน่งใด?',
      choices: [
        { id: 'a', text: 'Carotid' }, { id: 'b', text: 'Radial' },
        { id: 'c', text: 'Brachial หรือ Femoral' }, { id: 'd', text: 'Popliteal' },
      ],
      correctId: 'c', explanation: 'Brachial หรือ femoral — carotid ยากในทารก' },
    { id: 'bls-a-18', topic: 'infant',
      question: '2-rescuer CPR ในทารก เทคนิคไหนแนะนำ?',
      choices: [
        { id: 'a', text: '1-hand technique' },
        { id: 'b', text: '2-finger technique' },
        { id: 'c', text: '2-thumb encircling' },
        { id: 'd', text: 'Heel of hand' },
      ],
      correctId: 'c', explanation: '2-thumb encircling ให้ output ดีกว่า' },
    { id: 'bls-a-19', topic: 'infant',
      question: 'ความลึกการกดในทารกคือ?',
      choices: [
        { id: 'a', text: '~2 ซม.' }, { id: 'b', text: '~4 ซม. หรือ 1/3 AP' },
        { id: 'c', text: '~5–6 ซม.' }, { id: 'd', text: 'เท่าผู้ใหญ่' },
      ],
      correctId: 'b', explanation: '1/3 AP ~ 4 ซม.' },
    { id: 'bls-a-20', topic: 'infant',
      question: 'อัตราการกดหน้าอกในทารกคือ?',
      choices: [
        { id: 'a', text: '60–80/min' }, { id: 'b', text: '80–100/min' },
        { id: 'c', text: '100–120/min' }, { id: 'd', text: '>120/min' },
      ],
      correctId: 'c', explanation: '100–120/min เหมือนผู้ใหญ่' },

    // ---- Choking (3) ----
    { id: 'bls-a-21', topic: 'choking',
      question: 'ทารกสำลัก รู้สึกตัว ทำอะไร?',
      choices: [
        { id: 'a', text: 'Abdominal thrust 5 ครั้ง' },
        { id: 'b', text: 'Back blows 5 + chest thrusts 5' },
        { id: 'c', text: 'เริ่ม CPR' },
        { id: 'd', text: 'ฉีดน้ำเข้าจมูก' },
      ],
      correctId: 'b', explanation: 'ทารกใช้ back blows + chest thrusts (ห้าม abdominal)' },
    { id: 'bls-a-22', topic: 'choking',
      question: 'ผู้ป่วย FBAO หมดสติแล้ว ทำอะไรต่อ?',
      choices: [
        { id: 'a', text: 'Abdominal thrusts ต่อ' },
        { id: 'b', text: 'เริ่ม CPR + ดูในปากก่อนแต่ละ breath' },
        { id: 'c', text: 'รอ EMS' },
        { id: 'd', text: 'Blind finger sweep' },
      ],
      correctId: 'b', explanation: 'หมดสติ → CPR; ดูในปากก่อน breath ห้าม blind sweep' },
    { id: 'bls-a-23', topic: 'choking',
      question: 'หญิงตั้งครรภ์ไตรมาส 3 สำลัก ใช้อะไรแทน abdominal thrust?',
      choices: [
        { id: 'a', text: 'Chest thrusts' },
        { id: 'b', text: 'Back blows อย่างเดียว' },
        { id: 'c', text: 'CPR' },
        { id: 'd', text: 'รอ EMS' },
      ],
      correctId: 'a', explanation: 'ครรภ์แก่/อ้วนมาก: chest thrusts' },

    // ---- Opioid (2) ----
    { id: 'bls-a-24', topic: 'opioid',
      question: 'ขนาด naloxone IM/IN ผู้ใหญ่ในกรณี opioid OD คือ?',
      choices: [
        { id: 'a', text: '0.04 mg' }, { id: 'b', text: '0.4–2 mg' },
        { id: 'c', text: '5 mg' }, { id: 'd', text: '10 mg' },
      ],
      correctId: 'b', explanation: 'Naloxone 0.4–2 mg IM/IN ทุก 2–3 นาที' },
    { id: 'bls-a-25', topic: 'opioid',
      question: 'ทำไมต้อง observe ผู้ป่วย 2–4 ชั่วโมงหลังให้ naloxone?',
      choices: [
        { id: 'a', text: 'เพื่อให้ฤทธิ์ opioid หายหมด' },
        { id: 'b', text: 'Naloxone half-life สั้นกว่า opioid อาจ re-narcotize' },
        { id: 'c', text: 'เพื่อจ่ายค่ารักษา' },
        { id: 'd', text: 'ตามกฎหมาย' },
      ],
      correctId: 'b', explanation: 'Naloxone half-life 60–90 นาที สั้นกว่า heroin/fentanyl' },
  ],
};
