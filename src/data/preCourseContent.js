// Pre-course lessons — micro-learning format.
// Each lesson has interleaved `steps`: short read → quick quiz → short read → ...
// Step shapes:
//   { type: 'read',  heading: string, body: string }
//   { type: 'quiz',  id: string, question: string, choices: [{id,text}], correctId, explanation }
//
// To add a lesson: append an object below with a unique `id` and `steps` array.

const lessonDefs = [
  // ===================== บทที่ 1 =====================
  {
    id: 'pc1',
    title: 'บทที่ 1: ภาพรวม ALS และ Chain of Survival',
    description: 'ทำความรู้จัก ALS, ห่วงโซ่การรอดชีวิต และบทบาทในทีม',
    estMinutes: 8,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'ALS คืออะไร',
        body: 'Advanced Life Support (ALS) คือระบบการช่วยชีวิตขั้นสูง ครอบคลุม 4 ส่วนหลัก: การจัดการทางเดินหายใจ (Airway), การช่วยหายใจ/ออกซิเจน (Breathing), การไหลเวียนเลือด (Circulation) และการให้ยา/Defibrillation (Drug & Defib)' },
      { type: 'read', heading: 'ใครทำ ALS ได้',
        body: 'ทีมแพทย์/พยาบาลที่ผ่านการฝึกอบรม ใช้อุปกรณ์เฉพาะ (monitor, defibrillator, IV/IO, advanced airway) — ต่างจาก BLS ที่ใครก็ทำได้ด้วยการกดหน้าอก + AED' },
      { type: 'quiz', id: 'pc1-q1', question: 'ข้อใดต่อไปนี้ไม่ใช่ส่วนหนึ่งของ ALS?',
        choices: [
          { id: 'a', text: 'การใส่ท่อช่วยหายใจ (advanced airway)' },
          { id: 'b', text: 'การให้ยา epinephrine' },
          { id: 'c', text: 'การกดหน้าอกอย่างเดียวโดยคนทั่วไป' },
          { id: 'd', text: 'การ defibrillation' },
        ],
        correctId: 'c',
        explanation: 'การกดหน้าอกเป็น BLS ใครก็ทำได้ — ALS ต้องใช้ทีมและอุปกรณ์เฉพาะ' },

      { type: 'read', heading: 'Chain of Survival',
        body: 'ห่วงโซ่การรอดชีวิต 5 ห่วง: 1) รู้เร็ว–โทรเร็ว 2) CPR เร็ว 3) Defibrillation เร็ว 4) ALS เร็ว 5) ดูแลหลังกู้ชีพ — ทุกห่วงสำคัญเท่ากัน ขาดห่วงใดผลลัพธ์แย่ลงทันที' },
      { type: 'quiz', id: 'pc1-q2', question: 'ในห่วงโซ่การรอดชีวิต ข้อใดมาก่อน Defibrillation?',
        choices: [
          { id: 'a', text: 'การดูแลหลังกู้ชีพ' },
          { id: 'b', text: 'CPR เร็ว' },
          { id: 'c', text: 'ALS เร็ว' },
          { id: 'd', text: 'การส่งต่อโรงพยาบาล' },
        ],
        correctId: 'b',
        explanation: 'ลำดับ: รู้เร็ว/โทรเร็ว → CPR เร็ว → Defibrillation เร็ว → ALS → ดูแลหลังกู้ชีพ' },

      { type: 'read', heading: 'บทบาทในทีม ALS',
        body: 'Team Leader สั่งการ · Airway ดูแลทางหายใจ · Compressor กดหน้าอก · Drug Admin ให้ยา · Recorder จดบันทึก — ทุกคนสวมหมวกตามบทบาทที่กำหนด' },
      { type: 'read', heading: 'Closed-loop communication',
        body: 'หัวใจของการสื่อสารในทีม: ผู้สั่งสั่งให้ชัดเจน → ผู้รับทวนคำสั่ง → ทำ → รายงานกลับเมื่อเสร็จ การทวนคำสั่งช่วยป้องกันการเข้าใจผิดที่อันตรายในภาวะเครียดสูง' },
      { type: 'quiz', id: 'pc1-q3', question: 'การสื่อสารแบบ closed-loop คือข้อใด?',
        choices: [
          { id: 'a', text: 'ผู้สั่งสั่งแล้วผู้รับทำเลยโดยไม่ตอบกลับ' },
          { id: 'b', text: 'ผู้รับทวนคำสั่งและรายงานเมื่อทำเสร็จ' },
          { id: 'c', text: 'ทุกคนสามารถสั่งงานได้พร้อมกัน' },
          { id: 'd', text: 'การประชุมทีมก่อนเริ่มเคส' },
        ],
        correctId: 'b',
        explanation: 'closed-loop = ผู้สั่ง→ทวน→ทำ→รายงานกลับ ครบรอบ' },

      { type: 'read', heading: 'CPR คุณภาพสูง — 4 ตัวเลขสำคัญ',
        body: 'อัตรา 100–120 ครั้ง/นาที · ลึก 5–6 cm · ปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil) · หยุดกดให้น้อยที่สุด Chest Compression Fraction (CCF) > 80%' },
      { type: 'quiz', id: 'pc1-q4', question: 'อัตราการกดหน้าอกสำหรับผู้ใหญ่คือเท่าใด?',
        choices: [
          { id: 'a', text: '60–80 ครั้ง/นาที' },
          { id: 'b', text: '80–100 ครั้ง/นาที' },
          { id: 'c', text: '100–120 ครั้ง/นาที' },
          { id: 'd', text: '120–150 ครั้ง/นาที' },
        ],
        correctId: 'c',
        explanation: '100–120 ครั้ง/นาที — ช้ากว่านี้ perfusion ไม่พอ เร็วกว่านี้ recoil ไม่ทัน' },
      { type: 'quiz', id: 'pc1-q5', question: 'CCF คุณภาพสูงควร > เท่าใด?',
        choices: [
          { id: 'a', text: '> 50%' },
          { id: 'b', text: '> 60%' },
          { id: 'c', text: '> 80%' },
          { id: 'd', text: '> 95%' },
        ],
        correctId: 'c',
        explanation: 'CCF > 80% = เวลากดจริงเกิน 80% ของเวลาทั้งหมด หยุดให้น้อยที่สุด' },

      { type: 'read', heading: 'สลับคนกด',
        body: 'สลับ compressor ทุก 2 นาที (ตรงกับช่วงเช็ค rhythm) ก่อนที่ความเหนื่อยจะทำให้คุณภาพลด แม้ผู้กดจะรู้สึกว่ายังไหวอยู่ก็ตาม' },
      { type: 'quiz', id: 'pc1-q6', question: 'ควรสลับคนกดหน้าอกทุกกี่นาที?',
        choices: [
          { id: 'a', text: '1 นาที' },
          { id: 'b', text: '2 นาที' },
          { id: 'c', text: '5 นาที' },
          { id: 'd', text: 'เมื่อรู้สึกเหนื่อยเท่านั้น' },
        ],
        correctId: 'b',
        explanation: 'ทุก 2 นาที ตรงกับช่วงเช็ค rhythm พอดี ป้องกัน fatigue แอบเข้ามา' },
    ],
  },

  // ===================== บทที่ 2 =====================
  {
    id: 'pc2',
    title: 'บทที่ 2: BLS และ CPR คุณภาพสูง',
    description: 'เริ่มต้นจาก BLS — ทักษะพื้นฐานที่ทุก ALS ต้องทำให้ดีก่อน',
    estMinutes: 9,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'ลำดับเริ่มต้น',
        body: 'พบผู้หมดสติ → ตรวจสอบความปลอดภัย → กระตุ้นและเรียก → ขอความช่วยเหลือ/เรียกทีม (Code Blue / โทร 1669) → นำ AED มา' },
      { type: 'read', heading: 'ตรวจชีพจรและการหายใจ',
        body: 'คลำ carotid pulse พร้อมดูการหายใจ ไม่เกิน 10 วินาที — ถ้าไม่มี pulse หรือไม่แน่ใจ ให้เริ่ม CPR ทันที (อย่ารอนาน)' },
      { type: 'quiz', id: 'pc2-q1', question: 'ตรวจ pulse นานสุดกี่วินาทีก่อนเริ่ม CPR?',
        choices: [
          { id: 'a', text: '5 วินาที' },
          { id: 'b', text: '10 วินาที' },
          { id: 'c', text: '20 วินาที' },
          { id: 'd', text: '30 วินาที' },
        ],
        correctId: 'b',
        explanation: 'ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจให้ถือว่าไม่มี pulse และเริ่ม CPR' },

      { type: 'read', heading: 'อัตราส่วน Compression : Ventilation',
        body: 'ยังไม่มี advanced airway → 30 กด : 2 ช่วยหายใจ (1 หรือ 2 rescuer ในผู้ใหญ่)' },
      { type: 'read', heading: 'เมื่อมี advanced airway',
        body: 'กดต่อเนื่องโดยไม่หยุด + ช่วยหายใจ 1 ครั้ง ทุก 6 วินาที (= 10 ครั้ง/นาที) — ไม่ต้องประสานเป็น cycle อีกแล้ว' },
      { type: 'quiz', id: 'pc2-q2', question: 'ผู้ป่วยไม่มี advanced airway — ratio compression:ventilation คือ?',
        choices: [
          { id: 'a', text: '15 : 2' },
          { id: 'b', text: '30 : 2' },
          { id: 'c', text: '5 : 1' },
          { id: 'd', text: 'กดต่อเนื่อง ไม่ช่วยหายใจ' },
        ],
        correctId: 'b',
        explanation: '30:2 สำหรับผู้ใหญ่ (15:2 เป็นของเด็ก 2-rescuer)' },
      { type: 'quiz', id: 'pc2-q3', question: 'หลังใส่ ETT แล้ว ช่วยหายใจอย่างไร?',
        choices: [
          { id: 'a', text: '1 ครั้งทุก 6 วินาที (10/min)' },
          { id: 'b', text: '1 ครั้งทุก 3 วินาที (20/min)' },
          { id: 'c', text: '2 ครั้งทุก 30 กด' },
          { id: 'd', text: 'ตามจังหวะ compression' },
        ],
        correctId: 'a',
        explanation: '1/6 sec = 10 ครั้ง/นาที — เร็วกว่านี้จะ over-ventilate ลด venous return' },

      { type: 'read', heading: 'ตำแหน่งและเทคนิคกด',
        body: 'กลางหน้าอก ครึ่งล่างของกระดูก sternum · ลึก 5–6 cm · ปล่อยให้คืนตัวเต็มที่ระหว่างกด · มือเหยียดตรง ใช้น้ำหนักตัว ไม่ใช้แรงแขน' },
      { type: 'quiz', id: 'pc2-q4', question: 'ความลึกการกดหน้าอกผู้ใหญ่คือเท่าใด?',
        choices: [
          { id: 'a', text: '2–3 cm' },
          { id: 'b', text: '3–4 cm' },
          { id: 'c', text: '5–6 cm' },
          { id: 'd', text: '7–8 cm' },
        ],
        correctId: 'c',
        explanation: '5–6 cm — ตื้นกว่าไม่ perfuse, ลึกกว่าเสี่ยงกระดูก/อวัยวะภายในบาดเจ็บ' },

      { type: 'read', heading: 'หลีกเลี่ยง Over-ventilation',
        body: 'ช่วยหายใจเร็วเกินไปทำให้ intrathoracic pressure สูง → ลด venous return → cardiac output ลด → ผลแย่ลง — กฎ: ค่อย ๆ บีบ ดูหน้าอกขึ้น พอ' },

      { type: 'read', heading: 'AED',
        body: 'นำมาให้เร็วที่สุด เปิดเครื่อง ฟังคำสั่ง ติด pad → เครื่องวิเคราะห์ → ถ้า "shock advised" หลีกให้ทุกคนพ้น และกดปุ่ม shock → กลับมา CPR ต่อทันที 2 นาที' },
      { type: 'quiz', id: 'pc2-q5', question: 'หลังให้ shock แล้ว ทำอะไรต่อ?',
        choices: [
          { id: 'a', text: 'คลำ pulse 30 วินาที' },
          { id: 'b', text: 'กลับมา CPR ต่อทันที 2 นาที' },
          { id: 'c', text: 'รอ AED วิเคราะห์อีกครั้ง' },
          { id: 'd', text: 'ใส่ ETT ก่อน CPR' },
        ],
        correctId: 'b',
        explanation: 'CPR ต่อทันทีหลัง shock 2 นาที แล้วค่อยเช็ค rhythm/pulse — ไม่หยุดเพื่อคลำ' },
    ],
  },

  // ===================== บทที่ 3 =====================
  {
    id: 'pc3',
    title: 'บทที่ 3: Airway Management',
    description: 'เปิด airway, BVM, OPA/NPA, advanced airway และการยืนยันตำแหน่ง',
    estMinutes: 10,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'เปิด airway',
        body: 'Head-tilt chin-lift = วิธีมาตรฐาน · Jaw-thrust = ใช้เมื่อสงสัย cervical spine injury (อุบัติเหตุ ตกที่สูง) เพราะไม่ทำให้คอเคลื่อน' },
      { type: 'quiz', id: 'pc3-q1', question: 'ผู้ป่วย trauma สงสัยบาดเจ็บคอ — เปิด airway แบบใด?',
        choices: [
          { id: 'a', text: 'Head-tilt chin-lift' },
          { id: 'b', text: 'Jaw-thrust' },
          { id: 'c', text: 'นั่งตัวตรง' },
          { id: 'd', text: 'ใส่ ETT ทันที' },
        ],
        correctId: 'b',
        explanation: 'Jaw-thrust ไม่ทำให้คอเคลื่อน เหมาะกับสงสัย C-spine injury' },

      { type: 'read', heading: 'BVM (Bag-Valve-Mask)',
        body: 'ใช้ 2 คนได้ผลดีกว่า 1 คน (คนหนึ่งจับ mask seal สองมือ E-C technique, อีกคนบีบถุง) · ขนาด mask ต้องครอบจมูก-คาง พอดี · บีบเบา ๆ พอเห็นหน้าอกขึ้น' },
      { type: 'quiz', id: 'pc3-q2', question: 'BVM ทำคนเดียวเทียบกับ 2 คน?',
        choices: [
          { id: 'a', text: 'คนเดียวดีกว่า เพราะคล่องตัว' },
          { id: 'b', text: 'เท่ากัน' },
          { id: 'c', text: '2 คนดีกว่า เพราะ seal ดีและบีบได้พอดี' },
          { id: 'd', text: 'ห้ามทำคนเดียว' },
        ],
        correctId: 'c',
        explanation: '2 คนทำให้ mask seal ดีกว่ามาก ลด leak และให้ tidal volume เพียงพอ' },

      { type: 'read', heading: 'OPA (Oropharyngeal Airway)',
        body: 'ท่อพลาสติกใส่ในปาก ช่วยกัน tongue blocking — ใช้เฉพาะผู้ป่วยไม่รู้สึกตัวและไม่มี gag reflex (ถ้ามี gag reflex จะอาเจียน → สำลัก)' },
      { type: 'read', heading: 'NPA (Nasopharyngeal Airway)',
        body: 'ท่อใส่ทางจมูก ทนต่อ gag reflex ได้ — แต่ห้ามใช้ในผู้สงสัย basal skull fracture (เสี่ยงทะลุเข้าสมอง)' },
      { type: 'quiz', id: 'pc3-q3', question: 'OPA ใช้ไม่ได้ในผู้ป่วยกลุ่มใด?',
        choices: [
          { id: 'a', text: 'ผู้ป่วยที่ยังมี gag reflex' },
          { id: 'b', text: 'ผู้ป่วยที่ไม่รู้สึกตัว' },
          { id: 'c', text: 'ผู้ป่วยที่ใส่ ETT แล้ว' },
          { id: 'd', text: 'ผู้ป่วยที่ใช้ BVM' },
        ],
        correctId: 'a',
        explanation: 'OPA จะกระตุ้น gag reflex → อาเจียน → สำลัก ห้ามใช้ถ้ายังมี gag' },

      { type: 'read', heading: 'Advanced Airway',
        body: 'Endotracheal tube (ETT) = gold standard · Supraglottic devices: LMA, i-gel, King LT — ใส่ง่ายกว่า ไม่ต้องเห็น vocal cord — ทางเลือกที่ดีถ้า intubate ยาก' },
      { type: 'read', heading: 'ยืนยันตำแหน่ง ETT',
        body: 'Waveform capnography = gold standard (ดู EtCO2 waveform หลายรอบ) · ฟัง breath sound 5 ตำแหน่ง · ดูหน้าอกขึ้นเท่ากัน · CXR ทีหลังเพื่อดูตำแหน่ง' },
      { type: 'quiz', id: 'pc3-q4', question: 'Gold standard ในการยืนยันตำแหน่ง ETT คืออะไร?',
        choices: [
          { id: 'a', text: 'ฟัง breath sound' },
          { id: 'b', text: 'CXR' },
          { id: 'c', text: 'Waveform capnography' },
          { id: 'd', text: 'SpO2' },
        ],
        correctId: 'c',
        explanation: 'Waveform capnography ยืนยัน real-time ว่าอยู่ใน trachea จริง — ฟัง/CXR เสริมเท่านั้น' },

      { type: 'read', heading: 'EtCO2 ในระหว่าง CPR',
        body: 'ระหว่าง CPR ค่า EtCO2 บอกคุณภาพการกดและ prognosis: < 10 mmHg หลัง 20 นาที = พยากรณ์แย่ · ค่าพุ่งขึ้นทันที = อาจ ROSC' },
      { type: 'quiz', id: 'pc3-q5', question: 'EtCO2 < 10 mmHg ที่ 20 นาทีหลัง CPR แปลว่าอะไร?',
        choices: [
          { id: 'a', text: 'CPR คุณภาพดี' },
          { id: 'b', text: 'พยากรณ์โรคแย่' },
          { id: 'c', text: 'ผู้ป่วยใกล้ ROSC' },
          { id: 'd', text: 'ETT อยู่ในตำแหน่งถูกต้อง' },
        ],
        correctId: 'b',
        explanation: 'EtCO2 ต่ำต่อเนื่อง = perfusion ไม่กลับมา prognosis แย่' },
    ],
  },

  // ===================== บทที่ 4 =====================
  {
    id: 'pc4',
    title: 'บทที่ 4: การอ่านจังหวะหัวใจ (Rhythm Recognition)',
    description: 'แยก VF / pVT / PEA / Asystole — Shockable vs Non-shockable',
    estMinutes: 10,
    passingScore: 70,
    steps: [
      { type: 'read', heading: '4 จังหวะของ Cardiac Arrest',
        body: 'แบ่ง 2 กลุ่ม:\n• Shockable (ตอบสนอง defib): VF, Pulseless VT\n• Non-shockable (ไม่ตอบสนอง defib): PEA, Asystole' },
      { type: 'quiz', id: 'pc4-q1', question: 'จังหวะใดเป็น shockable rhythm?',
        choices: [
          { id: 'a', text: 'Asystole' },
          { id: 'b', text: 'PEA' },
          { id: 'c', text: 'Ventricular Fibrillation (VF)' },
          { id: 'd', text: 'Sinus bradycardia' },
        ],
        correctId: 'c',
        explanation: 'Shockable = VF + pVT — ส่วน asystole/PEA ไม่ตอบสนอง defib' },

      { type: 'read', heading: 'Ventricular Fibrillation (VF)',
        body: 'ลักษณะ chaotic ไม่เห็น QRS ชัด · irregular · amplitude แบ่งเป็น coarse VF (รอด-เปอร์เซ็นต์สูงกว่า) และ fine VF · ต้อง defib ทันที' },
      { type: 'read', heading: 'Pulseless VT (pVT)',
        body: 'wide QRS · regular · rate เร็ว 150–250 · ไม่มี pulse คลำได้ → จัดการเหมือน VF: defib ทันที + CPR' },
      { type: 'quiz', id: 'pc4-q2', question: 'pVT มีลักษณะอย่างไร?',
        choices: [
          { id: 'a', text: 'Narrow QRS, regular, มี pulse' },
          { id: 'b', text: 'Wide QRS, regular, ไม่มี pulse' },
          { id: 'c', text: 'Flat line' },
          { id: 'd', text: 'Chaotic ไม่มี QRS' },
        ],
        correctId: 'b',
        explanation: 'pVT = wide QRS regular fast แต่ไม่มี pulse → defib + CPR เหมือน VF' },

      { type: 'read', heading: 'Pulseless Electrical Activity (PEA)',
        body: 'มี organized rhythm บน monitor (อาจดูคล้ายปกติ) แต่คลำ pulse ไม่ได้ — หัวใจมีไฟฟ้าแต่ไม่บีบเอาเลือดออก · เป้าหมาย: หาสาเหตุ (H&Ts) + epinephrine + CPR' },
      { type: 'quiz', id: 'pc4-q3', question: 'PEA ตอบสนอง defibrillation หรือไม่?',
        choices: [
          { id: 'a', text: 'ตอบสนองดี' },
          { id: 'b', text: 'ไม่ตอบสนอง — ไม่ shock' },
          { id: 'c', text: 'ตอบสนองถ้า shock 2 ครั้ง' },
          { id: 'd', text: 'ตอบสนองถ้าใช้ AED' },
        ],
        correctId: 'b',
        explanation: 'PEA non-shockable — defib ไม่ช่วย ต้องหาและแก้สาเหตุ (H&Ts)' },

      { type: 'read', heading: 'Asystole',
        body: 'flat line ไม่มีไฟฟ้า · ก่อนยืนยัน — ต้องเช็คก่อน: lead หลุดไหม, gain (amplitude) ต่ำไป, การเชื่อมต่อ → ตรวจอย่างน้อย 2 leads · จัดการ: CPR + epinephrine + หา H&Ts (ห้าม shock asystole)' },
      { type: 'quiz', id: 'pc4-q4', question: 'ก่อนยืนยัน asystole ควรทำอะไร?',
        choices: [
          { id: 'a', text: 'shock 1 ครั้งทดสอบ' },
          { id: 'b', text: 'เช็ค lead, gain, และดู 2 leads' },
          { id: 'c', text: 'ฉีด atropine ก่อน' },
          { id: 'd', text: 'รอ 2 นาที' },
        ],
        correctId: 'b',
        explanation: 'fine VF ดูคล้าย asystole — ต้องเช็ค lead/gain/2 leads ก่อนยืนยัน' },

      { type: 'read', heading: 'Defibrillation Energy',
        body: 'Biphasic (เครื่องสมัยใหม่): 120–200 J ตาม manufacturer (ถ้าไม่รู้ใช้ 200 J) · Monophasic (เก่า): 360 J ทุกครั้ง · ครั้งถัดไปใช้พลังงานเท่าเดิมหรือเพิ่มขึ้น' },
      { type: 'quiz', id: 'pc4-q5', question: 'Defib energy ของ biphasic defibrillator ตามแนวทาง ACLS?',
        choices: [
          { id: 'a', text: '50–100 J' },
          { id: 'b', text: '120–200 J' },
          { id: 'c', text: '360 J เท่านั้น' },
          { id: 'd', text: '500 J' },
        ],
        correctId: 'b',
        explanation: 'Biphasic 120–200 J ตาม manufacturer (ถ้าไม่แน่ใจ 200 J)' },

      { type: 'read', heading: 'ก่อนกดปุ่ม Shock',
        body: 'เรียก "Clear!" ตรวจให้แน่ใจไม่มีใครสัมผัสผู้ป่วย/เตียง/อุปกรณ์ — มองรอบเตียง ก่อนกด เพื่อความปลอดภัยของทีม' },
    ],
  },

  // ===================== บทที่ 5 =====================
  {
    id: 'pc5',
    title: 'บทที่ 5: ยาและ Algorithm สำคัญ',
    description: 'Epinephrine, Amiodarone, H&Ts, Bradycardia / Tachycardia algorithm',
    estMinutes: 11,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'Epinephrine — ยาเสาหลักของ arrest',
        body: '1 mg IV/IO ทุก 3–5 นาที (ใช้ใน rhythm ทุกชนิดของ arrest) · ออกฤทธิ์ vasoconstriction → เพิ่ม coronary และ cerebral perfusion ระหว่าง CPR' },
      { type: 'quiz', id: 'pc5-q1', question: 'Dose epinephrine ใน cardiac arrest คือ?',
        choices: [
          { id: 'a', text: '0.1 mg IV ทุก 1 นาที' },
          { id: 'b', text: '1 mg IV/IO ทุก 3–5 นาที' },
          { id: 'c', text: '10 mg IV ครั้งเดียว' },
          { id: 'd', text: '1 mg IM ทุก 5 นาที' },
        ],
        correctId: 'b',
        explanation: '1 mg IV/IO ทุก 3–5 นาที — ทั้ง VF/pVT/PEA/Asystole' },

      { type: 'read', heading: 'Amiodarone — สำหรับ VF/pVT ที่ดื้อ',
        body: 'ให้หลังจาก shock 3 ครั้งแล้วยังเป็น VF/pVT · Dose: 300 mg IV bolus → ถ้ายังไม่หายให้ 150 mg อีกครั้ง · เป็น antiarrhythmic หลักของ shockable rhythm' },
      { type: 'read', heading: 'Lidocaine — ทางเลือก',
        body: 'ใช้แทน amiodarone ได้ถ้าไม่มี · Dose 1–1.5 mg/kg IV bolus · ครั้งถัดไป 0.5–0.75 mg/kg ทุก 5–10 นาที (max 3 mg/kg)' },
      { type: 'quiz', id: 'pc5-q2', question: 'Amiodarone ใช้ในกลุ่ม rhythm ใด?',
        choices: [
          { id: 'a', text: 'Asystole' },
          { id: 'b', text: 'PEA' },
          { id: 'c', text: 'VF/pVT ที่ไม่ตอบสนอง shock' },
          { id: 'd', text: 'Sinus tachycardia' },
        ],
        correctId: 'c',
        explanation: 'Amiodarone สำหรับ shockable rhythm ที่ดื้อ — ไม่ใช้ใน asystole/PEA' },

      { type: 'read', heading: 'ทางเข้ายา',
        body: 'IV เป็นทางเลือกแรก (peripheral ก็พอ ส่วนกลางใช้เวลา) · IO (intraosseous) ใช้แทนได้ทันที ถ้าเปิดเส้นไม่ได้ในเวลาอันสั้น · ETT route ไม่แนะนำแล้ว' },

      { type: 'read', heading: 'H&Ts — 10 สาเหตุที่แก้ได้',
        body: 'หาเสมอ โดยเฉพาะใน PEA/Asystole:\nH: Hypoxia · Hypovolemia · H+ (acidosis) · Hypo/Hyperkalemia · Hypothermia\nT: Tension pneumothorax · Tamponade · Toxins · Thrombosis pulmonary (PE) · Thrombosis coronary (MI)' },
      { type: 'quiz', id: 'pc5-q3', question: 'ผู้ป่วย arrest หลังอุบัติเหตุ มี neck vein โป่ง breath sound ข้างเดียวลดลง — H/T ตัวไหน?',
        choices: [
          { id: 'a', text: 'Hypovolemia' },
          { id: 'b', text: 'Tension pneumothorax' },
          { id: 'c', text: 'Tamponade' },
          { id: 'd', text: 'Toxins' },
        ],
        correctId: 'b',
        explanation: 'Tension PTX → JVD + tracheal deviation + breath sound ลดข้างเดียว — ต้อง needle decompress' },

      { type: 'read', heading: 'Bradycardia Algorithm',
        body: 'Heart rate < 50 และมี symptoms (chest pain, SOB, altered LOC, hypotension):\n1) Atropine 1 mg IV ซ้ำได้ทุก 3–5 นาที (max 3 mg)\n2) ถ้าไม่ดีขึ้น → Transcutaneous Pacing (TCP) หรือ Dopamine/Epinephrine drip' },
      { type: 'quiz', id: 'pc5-q4', question: 'ยาตัวแรกของ symptomatic bradycardia คือ?',
        choices: [
          { id: 'a', text: 'Adenosine' },
          { id: 'b', text: 'Atropine 1 mg' },
          { id: 'c', text: 'Amiodarone' },
          { id: 'd', text: 'Epinephrine 1 mg' },
        ],
        correctId: 'b',
        explanation: 'Atropine 1 mg IV เป็น first-line ของ symptomatic bradycardia (max 3 mg)' },

      { type: 'read', heading: 'Tachycardia Algorithm — Stable',
        body: 'ผู้ป่วยมี pulse, ไม่มี hypotension/chest pain/altered LOC/HF:\n• Narrow + regular → vagal manoeuvres → Adenosine 6 mg IV push เร็ว → ถ้าไม่หาย 12 mg\n• Wide → ส่ง consult, อาจใช้ amiodarone' },
      { type: 'read', heading: 'Tachycardia Algorithm — Unstable',
        body: 'มี hypotension/chest pain/altered LOC/shock → Synchronized cardioversion ทันที ไม่ต้องรอ\nEnergy: narrow regular 50–100 J, narrow irregular 120–200 J, wide regular 100 J, wide irregular = defib (unsync)' },
      { type: 'quiz', id: 'pc5-q5', question: 'ผู้ป่วย SVT แต่ unstable (BP 70/40, สับสน) ทำอะไร?',
        choices: [
          { id: 'a', text: 'Adenosine 6 mg' },
          { id: 'b', text: 'Synchronized cardioversion' },
          { id: 'c', text: 'Amiodarone IV drip' },
          { id: 'd', text: 'Atropine 1 mg' },
        ],
        correctId: 'b',
        explanation: 'Unstable tachycardia ใด ๆ → Synchronized cardioversion ทันที (ไม่รอยา)' },
    ],
  },

  // ===================== บทที่ 6 =====================
  {
    id: 'pc6',
    title: 'บทที่ 6: การดูแลหลังกู้ชีพ (Post-Cardiac Arrest Care)',
    description: 'หลัง ROSC — Airway, Oxygen, Hemodynamics, ECG, TTM',
    estMinutes: 9,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'ROSC คืออะไร',
        body: 'Return of Spontaneous Circulation = pulse กลับมาคลำได้ + BP measurable — แต่ยังไม่ปลอดภัย: ผู้ป่วยเสี่ยง re-arrest สูงใน 24 ชั่วโมงแรก' },
      { type: 'read', heading: '5 ลำดับสำคัญหลัง ROSC',
        body: '1) ดูแล Airway/Breathing ต่อ\n2) Oxygenation — SpO2 เป้า 92–98%\n3) Hemodynamics — MAP > 65\n4) 12-lead ECG หา STEMI\n5) Targeted Temperature Management (TTM)' },
      { type: 'quiz', id: 'pc6-q1', question: 'Target SpO2 หลัง ROSC คือเท่าใด?',
        choices: [
          { id: 'a', text: '85–90%' },
          { id: 'b', text: '92–98%' },
          { id: 'c', text: '100%' },
          { id: 'd', text: '> 99%' },
        ],
        correctId: 'b',
        explanation: '92–98% — หลีกเลี่ยง hyperoxia (SpO2 100%) เพราะ free radical ทำลายสมอง' },

      { type: 'read', heading: 'Hemodynamics หลัง ROSC',
        body: 'BP target: MAP ≥ 65 (หรือ SBP ≥ 90) · ถ้าต่ำ → IV fluid bolus 1–2 L (ถ้าไม่ contraindicated) → ถ้ายัง: Norepinephrine drip เป็นตัวแรก' },
      { type: 'quiz', id: 'pc6-q2', question: 'Vasopressor first-line หลัง ROSC ที่ความดันยังต่ำคือ?',
        choices: [
          { id: 'a', text: 'Dopamine' },
          { id: 'b', text: 'Epinephrine drip' },
          { id: 'c', text: 'Norepinephrine' },
          { id: 'd', text: 'Phenylephrine' },
        ],
        correctId: 'c',
        explanation: 'Norepinephrine เป็น first-line vasopressor หลัง ROSC' },

      { type: 'read', heading: '12-lead ECG',
        body: 'ทำทันทีหลัง stable เพื่อหา STEMI — ถ้าพบ → ส่ง cath lab (PCI) ทันที · ผู้ป่วยหลัง arrest ที่เป็น STEMI ได้ประโยชน์จาก revascularization' },
      { type: 'quiz', id: 'pc6-q3', question: 'ผู้ป่วยหลัง ROSC พบ STEMI ใน 12-lead ECG ควรทำอย่างไร?',
        choices: [
          { id: 'a', text: 'รอ 24 ชั่วโมงค่อยพิจารณา PCI' },
          { id: 'b', text: 'ส่ง cath lab ทำ PCI ทันที' },
          { id: 'c', text: 'ให้ thrombolytic ทันทีโดยไม่ต้องทำอะไรเพิ่ม' },
          { id: 'd', text: 'หยุดการรักษา' },
        ],
        correctId: 'b',
        explanation: 'STEMI หลัง ROSC → PCI ทันที (ถ้าทำได้) — เพิ่ม survival และ neurological outcome' },

      { type: 'read', heading: 'Targeted Temperature Management (TTM)',
        body: 'ผู้ป่วย comatose หลัง ROSC: ควบคุมอุณหภูมิ 32–36 °C × 24 ชั่วโมง — ลด neurological injury จาก reperfusion · ใช้ cooling blanket / ice pack / cold saline' },
      { type: 'quiz', id: 'pc6-q4', question: 'TTM target temperature คือ?',
        choices: [
          { id: 'a', text: '28–30 °C' },
          { id: 'b', text: '32–36 °C' },
          { id: 'c', text: '37–38 °C' },
          { id: 'd', text: '39–40 °C' },
        ],
        correctId: 'b',
        explanation: 'TTM 32–36 °C นาน 24 ชั่วโมง สำหรับ comatose post-ROSC' },

      { type: 'read', heading: 'สิ่งที่ต้องหลีกเลี่ยง',
        body: 'หลัง ROSC อย่าทำสิ่งเหล่านี้:\n• Hyperventilation (PaCO2 ต่ำเกินไป → cerebral vasoconstriction)\n• Hyperoxia (SpO2 100% ต่อเนื่อง → free radical injury)\n• Hyperthermia (> 37.7 °C ใน 72 ชั่วโมงแรก)\n• Hypoglycemia (glucose < 80 mg/dL)' },
      { type: 'quiz', id: 'pc6-q5', question: 'ข้อใดควรหลีกเลี่ยงในการดูแลหลัง ROSC?',
        choices: [
          { id: 'a', text: 'SpO2 92–98%' },
          { id: 'b', text: 'MAP ≥ 65' },
          { id: 'c', text: 'Hyperventilation (PaCO2 ต่ำมาก)' },
          { id: 'd', text: 'หา STEMI ด้วย 12-lead ECG' },
        ],
        correctId: 'c',
        explanation: 'Hyperventilation ลด cerebral perfusion — ตั้ง ventilator ที่ PaCO2 35–45 ปกติ' },
    ],
  },
];

// Derive `sections` and `quiz` from `steps` for compatibility with ResultsSummary, cohort logic, etc.
function deriveLesson(l) {
  const sections = l.steps.filter(s => s.type === 'read').map(s => ({ heading: s.heading, body: s.body }));
  const quiz = l.steps.filter(s => s.type === 'quiz').map(s => ({
    id: s.id,
    question: s.question,
    choices: s.choices,
    correctId: s.correctId,
    explanation: s.explanation,
  }));
  return { ...l, sections, quiz };
}

export const preCourseLessons = lessonDefs.map(deriveLesson);

export function findLessonById(id) {
  return preCourseLessons.find(l => l.id === id) || null;
}

export function getLessonStepCount(lesson) {
  return lesson?.steps?.length ?? 0;
}

export function getLessonQuizCount(lesson) {
  return lesson?.quiz?.length ?? 0;
}
