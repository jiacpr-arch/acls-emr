// Pre-course lessons — micro-learning format.
// Each lesson has interleaved `steps`: short read → quick quiz → short read → ...
// Step shapes:
//   { type: 'read',  heading: string, body: string }
//   { type: 'quiz',  id: string, topic: string, question: string, choices: [{id,text}], correctId, explanation }
//
// `topic` on a quiz aligns with the post-test topic taxonomy in Supabase
// (acls_assessment_questions.topic). Keeping them in sync lets us compare
// pre→post performance per topic. Valid topics:
//   team · bls · airway · ekg · arrhythmia · arrest · meds · hsts · postarrest · acs · stroke
//
// To add a lesson: append an object below with a unique `id` and `steps` array.

// Supplementary video resources — opened in a new tab.
// Set `url` to empty string to hide a platform.
export const preCourseVideos = [
  {
    platform: 'youtube',
    label: 'ดูบน YouTube',
    url: 'https://youtube.com/@jia-bu8yn',
  },
  {
    platform: 'tiktok',
    label: 'ดูบน TikTok',
    url: 'https://www.tiktok.com/@jia_lucksa',
  },
];

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
      { type: 'quiz', id: 'pc1-q1', topic: 'team', question: 'ข้อใดต่อไปนี้ไม่ใช่ส่วนหนึ่งของ ALS?',
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
      { type: 'quiz', id: 'pc1-q2', topic: 'team', question: 'ในห่วงโซ่การรอดชีวิต ข้อใดมาก่อน Defibrillation?',
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
      { type: 'quiz', id: 'pc1-q3', topic: 'team', question: 'การสื่อสารแบบ closed-loop คือข้อใด?',
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
      { type: 'quiz', id: 'pc1-q4', topic: 'bls', question: 'อัตราการกดหน้าอกสำหรับผู้ใหญ่คือเท่าใด?',
        choices: [
          { id: 'a', text: '60–80 ครั้ง/นาที' },
          { id: 'b', text: '80–100 ครั้ง/นาที' },
          { id: 'c', text: '100–120 ครั้ง/นาที' },
          { id: 'd', text: '120–150 ครั้ง/นาที' },
        ],
        correctId: 'c',
        explanation: '100–120 ครั้ง/นาที — ช้ากว่านี้ perfusion ไม่พอ เร็วกว่านี้ recoil ไม่ทัน' },
      { type: 'quiz', id: 'pc1-q5', topic: 'bls', question: 'CCF คุณภาพสูงควร > เท่าใด?',
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
      { type: 'quiz', id: 'pc1-q6', topic: 'bls', question: 'ควรสลับคนกดหน้าอกทุกกี่นาที?',
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
      { type: 'quiz', id: 'pc2-q1', topic: 'bls', question: 'ตรวจ pulse นานสุดกี่วินาทีก่อนเริ่ม CPR?',
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
      { type: 'quiz', id: 'pc2-q2', topic: 'bls', question: 'ผู้ป่วยไม่มี advanced airway — ratio compression:ventilation คือ?',
        choices: [
          { id: 'a', text: '15 : 2' },
          { id: 'b', text: '30 : 2' },
          { id: 'c', text: '5 : 1' },
          { id: 'd', text: 'กดต่อเนื่อง ไม่ช่วยหายใจ' },
        ],
        correctId: 'b',
        explanation: '30:2 สำหรับผู้ใหญ่ (15:2 เป็นของเด็ก 2-rescuer)' },
      { type: 'quiz', id: 'pc2-q3', topic: 'airway', question: 'หลังใส่ ETT แล้ว ช่วยหายใจอย่างไร?',
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
      { type: 'quiz', id: 'pc2-q4', topic: 'bls', question: 'ความลึกการกดหน้าอกผู้ใหญ่คือเท่าใด?',
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
      { type: 'quiz', id: 'pc2-q5', topic: 'bls', question: 'หลังให้ shock แล้ว ทำอะไรต่อ?',
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
      { type: 'quiz', id: 'pc3-q1', topic: 'airway', question: 'ผู้ป่วย trauma สงสัยบาดเจ็บคอ — เปิด airway แบบใด?',
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
      { type: 'quiz', id: 'pc3-q2', topic: 'airway', question: 'BVM ทำคนเดียวเทียบกับ 2 คน?',
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
      { type: 'quiz', id: 'pc3-q3', topic: 'airway', question: 'OPA ใช้ไม่ได้ในผู้ป่วยกลุ่มใด?',
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
      { type: 'quiz', id: 'pc3-q4', topic: 'airway', question: 'Gold standard ในการยืนยันตำแหน่ง ETT คืออะไร?',
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
      { type: 'quiz', id: 'pc3-q5', topic: 'airway', question: 'EtCO2 < 10 mmHg ที่ 20 นาทีหลัง CPR แปลว่าอะไร?',
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
      { type: 'quiz', id: 'pc4-q1', topic: 'arrhythmia', question: 'จังหวะใดเป็น shockable rhythm?',
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
      { type: 'quiz', id: 'pc4-q2', topic: 'arrhythmia', question: 'pVT มีลักษณะอย่างไร?',
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
      { type: 'quiz', id: 'pc4-q3', topic: 'arrhythmia', question: 'PEA ตอบสนอง defibrillation หรือไม่?',
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
      { type: 'quiz', id: 'pc4-q4', topic: 'ekg', question: 'ก่อนยืนยัน asystole ควรทำอะไร?',
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
      { type: 'quiz', id: 'pc4-q5', topic: 'arrest', question: 'Defib energy ของ biphasic defibrillator ตามแนวทาง ACLS?',
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
      { type: 'quiz', id: 'pc5-q1', topic: 'meds', question: 'Dose epinephrine ใน cardiac arrest คือ?',
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
      { type: 'quiz', id: 'pc5-q2', topic: 'meds', question: 'Amiodarone ใช้ในกลุ่ม rhythm ใด?',
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
      { type: 'quiz', id: 'pc5-q3', topic: 'hsts', question: 'ผู้ป่วย arrest หลังอุบัติเหตุ มี neck vein โป่ง breath sound ข้างเดียวลดลง — H/T ตัวไหน?',
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
      { type: 'quiz', id: 'pc5-q4', topic: 'hsts', question: 'ยาตัวแรกของ symptomatic bradycardia คือ?',
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
      { type: 'quiz', id: 'pc5-q5', topic: 'hsts', question: 'ผู้ป่วย SVT แต่ unstable (BP 70/40, สับสน) ทำอะไร?',
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
      { type: 'quiz', id: 'pc6-q1', topic: 'postarrest', question: 'Target SpO2 หลัง ROSC คือเท่าใด?',
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
      { type: 'quiz', id: 'pc6-q2', topic: 'postarrest', question: 'Vasopressor first-line หลัง ROSC ที่ความดันยังต่ำคือ?',
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
      { type: 'quiz', id: 'pc6-q3', topic: 'postarrest', question: 'ผู้ป่วยหลัง ROSC พบ STEMI ใน 12-lead ECG ควรทำอย่างไร?',
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
      { type: 'quiz', id: 'pc6-q4', topic: 'postarrest', question: 'TTM target temperature คือ?',
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
      { type: 'quiz', id: 'pc6-q5', topic: 'postarrest', question: 'ข้อใดควรหลีกเลี่ยงในการดูแลหลัง ROSC?',
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

  // ===================== บทที่ 7 =====================
  {
    id: 'pc7',
    title: 'บทที่ 7: Acute Coronary Syndrome (ACS) และ STEMI',
    description: 'รู้จัก ACS, อ่าน 12-lead, time targets, ยาเริ่มต้น และเลือก PCI vs Fibrinolytic',
    estMinutes: 12,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'ACS คืออะไร',
        body: 'Acute Coronary Syndrome = กลุ่มอาการจาก plaque rupture/erosion ใน coronary artery แล้วเกิดลิ่มเลือดอุดตัน แบ่ง 3 แบบตามขนาดและระยะของการอุดตัน:\n• STEMI — ST-Elevation MI: coronary อุดตันสมบูรณ์ ต้องเปิดทาง (reperfuse) เร็วที่สุด\n• NSTEMI — กล้ามเนื้อหัวใจตายบางส่วน แต่ ST ไม่ยก\n• UA (Unstable Angina) — เจ็บอกใหม่/แย่ลง แต่ enzyme ยังไม่ขึ้น' },
      { type: 'read', heading: 'อาการที่ต้องคิดถึง ACS',
        body: 'Classic: เจ็บแน่นหน้าอกกลาง ร้าวไปแขนซ้าย/กราม/หลัง · เหงื่อแตก · คลื่นไส้ · เหนื่อย · นาน > 10–20 นาทีไม่หาย\nAtypical (พบบ่อยในผู้สูงอายุ, เบาหวาน, ผู้หญิง): เหนื่อยอย่างเดียว, จุกท้อง, อ่อนเพลีย, เป็นลม — อย่าตัดทิ้ง!' },
      { type: 'quiz', id: 'pc7-q1', topic: 'acs', question: 'ผู้หญิงอายุ 68 ปี เป็นเบาหวาน มาด้วยเหนื่อยและจุกท้องบนซ้าย 30 นาที ไม่มีเจ็บอก — ควรทำอะไรเป็นอันดับแรก?',
        choices: [
          { id: 'a', text: 'ส่งกลับบ้าน นัด follow-up' },
          { id: 'b', text: 'ทำ 12-lead ECG ภายใน 10 นาที' },
          { id: 'c', text: 'ให้ยา PPI สำหรับ dyspepsia' },
          { id: 'd', text: 'รอติดตามอาการ 2 ชั่วโมง' },
        ],
        correctId: 'b',
        explanation: 'ผู้สูงอายุ/เบาหวาน/หญิง มักมาด้วย atypical symptoms ของ ACS — 12-lead ECG ภายใน 10 นาทีของการมาถึง คือ standard care' },

      { type: 'read', heading: 'STEMI Criteria บน 12-lead ECG',
        body: 'ST elevation ≥ 1 mm ใน contiguous leads ≥ 2 leads (ใน lead V2-V3 ต้อง ≥ 2 mm ในชาย / ≥ 1.5 mm ในหญิง)\n\nLocalization:\n• Anterior: V1-V4 (LAD)\n• Inferior: II, III, aVF (RCA)\n• Lateral: I, aVL, V5-V6 (LCx)\n• Posterior: ST depression ใน V1-V3 (ดู V7-V9 ยืนยัน)\n• Right ventricle: ST elevation V4R (ทำเมื่อเจอ inferior MI)' },
      { type: 'quiz', id: 'pc7-q2', topic: 'acs', question: 'พบ ST elevation ใน lead II, III, aVF — ตำแหน่งที่เป็นไปได้และ artery ที่อุดตันคือ?',
        choices: [
          { id: 'a', text: 'Anterior MI / LAD' },
          { id: 'b', text: 'Lateral MI / LCx' },
          { id: 'c', text: 'Inferior MI / RCA' },
          { id: 'd', text: 'Posterior MI / LCx' },
        ],
        correctId: 'c',
        explanation: 'II, III, aVF = inferior wall — RCA เป็นต้นเหตุที่พบบ่อยที่สุด (80%) · พึงระวัง RV involvement และ AV block' },

      { type: 'read', heading: 'Inferior MI — ระวัง RV และ Nitrate',
        body: 'Inferior MI 30–50% มี RV involvement — RV pre-load dependent\nให้ Nitroglycerin → BP drop รุนแรง! → hypotension/shock\nกฎ: ก่อนให้ nitrate ในผู้ป่วย ACS — ตรวจ V4R ดู RV ก่อน ถ้า RV infarction → ห้าม nitrate, ให้ IV fluid' },

      { type: 'read', heading: 'Time Targets — เวลาเป็นกล้ามเนื้อหัวใจ',
        body: '"Time is muscle" — ยิ่งเปิด artery ช้า กล้ามเนื้อตายมากขึ้น\n• Door-to-ECG ≤ 10 นาที\n• Door-to-balloon (PCI) ≤ 90 นาที (ถ้าทำใน รพ. เดียวกัน)\n• Door-in-door-out (transfer ไป PCI ที่อื่น) ≤ 30 นาที\n• Door-to-needle (Fibrinolytic) ≤ 30 นาที' },
      { type: 'quiz', id: 'pc7-q3', topic: 'acs', question: 'Door-to-balloon time สำหรับ STEMI ที่ทำ PCI ในโรงพยาบาลเดียวกันคือ?',
        choices: [
          { id: 'a', text: '≤ 30 นาที' },
          { id: 'b', text: '≤ 60 นาที' },
          { id: 'c', text: '≤ 90 นาที' },
          { id: 'd', text: '≤ 120 นาที' },
        ],
        correctId: 'c',
        explanation: '≤ 90 นาที จากเข้า ER ถึงเปิดเส้นด้วย balloon — มาตรฐาน AHA · ถ้าต้อง transfer ไป รพ. อื่น เป้า ≤ 120 นาที total' },

      { type: 'read', heading: 'ยาเริ่มต้น ACS — "MONA" ที่ปรับใหม่',
        body: 'ลำดับสำคัญตามแนวทาง AHA 2020:\n• Aspirin 162–325 mg เคี้ยว ทันที (เว้นแพ้/เลือดออก)\n• Nitroglycerin SL หรือ spray — ถ้า BP ≥ 90, ไม่มี RV infarct, ไม่ใช้ PDE5 inhibitor (Viagra ใน 24 ชม.)\n• Oxygen — เฉพาะ SpO2 < 90% หรือมี respiratory distress (ไม่ใช่ทุกคน!)\n• Morphine — สำหรับ chest pain ที่ไม่ตอบสนอง nitrate (ใช้น้อยลง — อาจสัมพันธ์กับ adverse outcome)' },
      { type: 'quiz', id: 'pc7-q4', topic: 'acs', question: 'ผู้ป่วย STEMI BP 145/85, SpO2 96% — ข้อใดควรให้ทันที?',
        choices: [
          { id: 'a', text: 'Oxygen 10 L/min via mask' },
          { id: 'b', text: 'Aspirin 162–325 mg เคี้ยว' },
          { id: 'c', text: 'Morphine 5 mg IV' },
          { id: 'd', text: 'Furosemide 40 mg IV' },
        ],
        correctId: 'b',
        explanation: 'Aspirin เคี้ยว = first-line ทันทีในทุก ACS ที่ไม่แพ้ · O2 ให้เฉพาะ SpO2 < 90% (ผู้ป่วยรายนี้ 96% ไม่ต้อง) · Morphine ใช้เมื่อ pain ดื้อ nitrate' },

      { type: 'read', heading: 'P2Y12 Inhibitor (Antiplatelet ตัวที่ 2)',
        body: 'ให้ร่วมกับ Aspirin ในผู้ป่วย ACS:\n• Clopidogrel — loading 300–600 mg PO (universal)\n• Ticagrelor — loading 180 mg PO (เลือกใช้ใน STEMI/NSTE-ACS — มี mortality benefit)\n• Prasugrel — loading 60 mg PO (เฉพาะ STEMI ที่จะทำ PCI; ห้ามถ้าเคย stroke/TIA, อายุ ≥ 75, น้ำหนัก < 60 kg)\nกฎ: ดู protocol ของ รพ. คุณ' },

      { type: 'read', heading: 'Reperfusion: PCI vs Fibrinolytic',
        body: 'PCI ดีกว่า ถ้า:\n• ทำได้ภายใน 90 นาที (door-to-balloon)\n• Cardiogenic shock, severe HF\n• Contraindication ต่อ fibrinolytic\n• Time จากเริ่มอาการ > 3 ชั่วโมง\n\nFibrinolytic (เช่น Streptokinase, Alteplase) — เลือกเมื่อ:\n• ไม่มี PCI ใน 120 นาที\n• อาการ ≤ 12 ชั่วโมง\n• ไม่มี contraindication' },
      { type: 'quiz', id: 'pc7-q5', topic: 'acs', question: 'โรงพยาบาลชุมชน ผู้ป่วย STEMI มา 1 ชั่วโมงหลังเจ็บอก ส่งไป PCI ที่ รพ. ใหญ่ใช้เวลารวม 150 นาที — ทางเลือกที่ดีกว่าคือ?',
        choices: [
          { id: 'a', text: 'รอ transfer ไปทำ PCI' },
          { id: 'b', text: 'ให้ Fibrinolytic ก่อน แล้วค่อยส่ง' },
          { id: 'c', text: 'ไม่ทำอะไร รอ 24 ชม.' },
          { id: 'd', text: 'ให้ Heparin อย่างเดียว' },
        ],
        correctId: 'b',
        explanation: 'ถ้า PCI ใช้เวลา > 120 นาที total — Fibrinolytic ภายใน 30 นาทีที่ door จะ reperfuse เร็วกว่า (ถ้าไม่มี contraindication และอาการ ≤ 12 ชม.)' },

      { type: 'read', heading: 'Contraindications ต่อ Fibrinolytic — Absolute',
        body: '• เคย hemorrhagic stroke (ตลอดชีวิต)\n• Ischemic stroke ภายใน 3 เดือน (ยกเว้น 3 ชม.แรก)\n• Intracranial neoplasm / AVM / aneurysm\n• Active bleeding (ไม่นับ menstrual)\n• Suspected aortic dissection\n• Significant closed-head trauma ภายใน 3 เดือน\n• Severe uncontrolled HTN (BP > 185/110)' },
      { type: 'quiz', id: 'pc7-q6', topic: 'acs', question: 'ผู้ป่วย STEMI ใหม่ มีประวัติ ischemic stroke เมื่อ 2 เดือนก่อน — เลือก reperfusion อย่างไร?',
        choices: [
          { id: 'a', text: 'Fibrinolytic ทันที' },
          { id: 'b', text: 'PCI (Fibrinolytic contraindicated)' },
          { id: 'c', text: 'รอ 1 เดือนก่อนรักษา' },
          { id: 'd', text: 'ให้ Aspirin อย่างเดียว' },
        ],
        correctId: 'b',
        explanation: 'Recent ischemic stroke (< 3 เดือน) เป็น absolute contraindication ต่อ fibrinolytic — ต้องส่ง PCI แทน' },

      { type: 'read', heading: 'Anticoagulant',
        body: 'ให้ร่วมในทุกราย STEMI ก่อน PCI/Fibrinolytic:\n• Unfractionated Heparin (UFH) bolus + drip (most common ใน Thailand)\n• Enoxaparin (LMWH) — alternative\n• Bivalirudin — ถ้า heparin allergy / HIT' },

      { type: 'read', heading: 'Post-ACS — โรงพยาบาล',
        body: 'หลัง reperfusion ใน CCU:\n• Dual antiplatelet ต่อ ≥ 12 เดือน (ASA + P2Y12)\n• High-intensity statin (atorvastatin 40–80 mg)\n• Beta-blocker (ถ้าไม่มี contraindication — HF acute, bradycardia, shock)\n• ACE inhibitor / ARB (ถ้า LVEF < 40%, HTN, เบาหวาน)\n• Cardiac rehabilitation' },
    ],
  },

  // ===================== บทที่ 8 =====================
  {
    id: 'pc8',
    title: 'บทที่ 8: Acute Stroke',
    description: 'รู้จัก stroke, FAST/BE-FAST, 8 D\'s, NIHSS, time windows, tPA และ thrombectomy',
    estMinutes: 12,
    passingScore: 70,
    steps: [
      { type: 'read', heading: 'Stroke คืออะไร',
        body: 'การที่สมองขาดเลือดเฉียบพลัน แบ่ง 2 แบบหลัก:\n• Ischemic stroke (87%) — เส้นเลือดสมองอุดตัน (thrombus/embolus) — รักษาด้วย reperfusion: tPA หรือ thrombectomy\n• Hemorrhagic stroke (13%) — เส้นเลือดสมองแตก (ICH หรือ SAH) — ห้าม tPA, เน้นคุม BP และผ่าตัด\n\nเหตุผลที่ "Time is Brain": สมองตาย 1.9 ล้านเซลล์/นาที ที่ขาดเลือด' },
      { type: 'read', heading: 'FAST และ BE-FAST',
        body: 'FAST — สำหรับ public:\n• Face drooping — หน้าเบี้ยวข้างใดข้างหนึ่ง\n• Arm weakness — แขนข้างใดข้างหนึ่งอ่อนแรง\n• Speech difficulty — พูดไม่ชัด/ฟังไม่เข้าใจ\n• Time — รีบโทรเรียกฉุกเฉิน\n\nBE-FAST (เพิ่มสำหรับ posterior circulation strokes):\n• Balance — เสียการทรงตัวเฉียบพลัน\n• Eyes — มองเห็นผิดปกติ/ภาพซ้อน/มืดข้างหนึ่ง' },
      { type: 'quiz', id: 'pc8-q1', topic: 'stroke', question: 'ผู้ป่วยอายุ 65 ปี จู่ ๆ มีอาการเดินเซ มองภาพซ้อน ปวดศีรษะท้ายทอย — สงสัย stroke แบบใด?',
        choices: [
          { id: 'a', text: 'Anterior circulation (MCA)' },
          { id: 'b', text: 'Posterior circulation (cerebellar/brainstem)' },
          { id: 'c', text: 'Lacunar stroke' },
          { id: 'd', text: 'TIA — ไม่ต้องประเมินเร่ง' },
        ],
        correctId: 'b',
        explanation: 'Posterior circulation stroke (vertebrobasilar) อาการ: balance, dizziness, diplopia, occipital headache — ใช้ BE-FAST จับ · ห้ามทิ้งเป็น "vertigo ธรรมดา"' },

      { type: 'read', heading: '8 D\'s ของ Stroke Chain of Recovery',
        body: 'จากเริ่มอาการถึงรักษาเสร็จ:\n1) Detection — รู้เร็ว (FAST)\n2) Dispatch — โทร 1669 ทันที\n3) Delivery — EMS ส่ง รพ. ที่มี stroke unit เร็ว\n4) Door — ถึง ER\n5) Data — CT/MRI, labs\n6) Decision — เลือก tPA / thrombectomy\n7) Drug / Device — ให้ tPA / ทำ thrombectomy\n8) Disposition — admit stroke unit' },

      { type: 'read', heading: 'Time Targets ใน ER',
        body: 'ตั้งแต่ door (เข้า ER) — มาตรฐาน AHA:\n• Door-to-physician ≤ 10 นาที\n• Door-to-stroke team ≤ 15 นาที\n• Door-to-CT (เริ่มสแกน) ≤ 25 นาที\n• Door-to-CT read ≤ 45 นาที\n• Door-to-needle (tPA) ≤ 60 นาที (target 45 นาที)\n• Door-to-groin puncture (thrombectomy) ≤ 90 นาที' },
      { type: 'quiz', id: 'pc8-q2', topic: 'stroke', question: 'Door-to-needle time สำหรับให้ tPA ใน acute ischemic stroke ตามแนวทาง AHA คือ?',
        choices: [
          { id: 'a', text: '≤ 30 นาที' },
          { id: 'b', text: '≤ 60 นาที' },
          { id: 'c', text: '≤ 120 นาที' },
          { id: 'd', text: '≤ 180 นาที' },
        ],
        correctId: 'b',
        explanation: '≤ 60 นาที จากเข้า ER ถึงเริ่ม tPA infusion — target ใหม่ที่หลายศูนย์ตั้งคือ ≤ 45 นาที' },

      { type: 'read', heading: 'Time Window — tPA และ Thrombectomy',
        body: 'IV tPA (Alteplase):\n• ≤ 3 ชั่วโมงจากเริ่มอาการ (universal)\n• 3–4.5 ชั่วโมง — ในกลุ่มเลือก (อายุ ≤ 80, ไม่ใหญ่มาก, ไม่ DM + เคย stroke, NIHSS ≤ 25, ไม่กิน anticoagulant)\n\nMechanical Thrombectomy (สำหรับ LVO — Large Vessel Occlusion):\n• ≤ 6 ชั่วโมง: ทำได้ทันทีถ้ามี LVO ที่ ICA/M1\n• 6–24 ชั่วโมง: ทำได้ในผู้ป่วยที่เลือก ด้วย imaging (CT perfusion, MRI) แสดง penumbra ที่ salvageable (DAWN/DEFUSE-3 trials)' },
      { type: 'quiz', id: 'pc8-q3', topic: 'stroke', question: 'ผู้ป่วยตื่นนอนเช้าพบอ่อนแรงครึ่งซีก last known well 8 ชั่วโมงก่อน CT พบ LVO ของ MCA M1 — ทางเลือกที่ดีที่สุด?',
        choices: [
          { id: 'a', text: 'ให้ tPA ทันที' },
          { id: 'b', text: 'พิจารณา mechanical thrombectomy ถ้า imaging แสดง salvageable tissue' },
          { id: 'c', text: 'รอดูอาการ 24 ชั่วโมง' },
          { id: 'd', text: 'ให้ Aspirin อย่างเดียว' },
        ],
        correctId: 'b',
        explanation: 'เกิน window ของ tPA (4.5 ชม.) แต่ thrombectomy ทำได้ถึง 24 ชม. ใน LVO ที่มี salvageable penumbra (DAWN trial)' },

      { type: 'read', heading: 'LVO — Large Vessel Occlusion',
        body: 'สาเหตุของ disabling stroke ส่วนใหญ่ — ICA, MCA (M1/M2), basilar artery\nSigns: NIHSS สูง (≥ 6), gaze deviation, hemiparesis รุนแรง + cortical signs (aphasia/neglect)\nScales ที่ใช้ ทำนาย LVO ใน field: LAMS, RACE, FAST-ED\nLVO = ส่ง รพ. ที่ทำ thrombectomy ได้โดยตรง (ไม่ผ่าน รพ. ใกล้ที่ทำไม่ได้)' },

      { type: 'read', heading: 'การประเมิน NIHSS',
        body: 'NIH Stroke Scale — 11 ข้อ คะแนน 0–42 ประเมินความรุนแรง:\n• 0 = ไม่มี stroke\n• 1–4 = minor\n• 5–15 = moderate\n• 16–20 = moderate-severe\n• 21–42 = severe\n\nทุกศูนย์ stroke ควร NIHSS ก่อนและหลัง tPA · score > 6 มักหมายถึง LVO' },

      { type: 'read', heading: 'Imaging — CT/MRI',
        body: 'Non-contrast CT brain = first imaging — เป้าหมายหลักคือ rule out hemorrhage (ห้ามให้ tPA ถ้าเห็นเลือด)\nCT angiography (CTA) — หา LVO\nCT perfusion (CTP) / MR DWI-PWI — ดู core vs penumbra สำหรับ thrombectomy ใน extended window' },
      { type: 'quiz', id: 'pc8-q4', topic: 'stroke', question: 'ก่อนให้ tPA ใน ischemic stroke การ imaging ที่จำเป็นที่สุดคือ?',
        choices: [
          { id: 'a', text: 'MRI brain with contrast' },
          { id: 'b', text: 'Non-contrast CT brain — rule out hemorrhage' },
          { id: 'c', text: 'CT angiogram of neck' },
          { id: 'd', text: 'EEG' },
        ],
        correctId: 'b',
        explanation: 'Non-contrast CT ก่อน เพื่อ rule out hemorrhagic stroke (ถ้ามีเลือด — ห้าม tPA เด็ดขาด) · CTA/CTP ใช้เพิ่มเติมเมื่อสงสัย LVO' },

      { type: 'read', heading: 'BP Management — Ischemic Stroke',
        body: 'Ischemic stroke — ปล่อยให้ BP สูงพอควรเพื่อ perfuse penumbra:\n• ถ้า ไม่ ให้ tPA → ลด BP ก็ต่อเมื่อ > 220/120\n• ถ้า จะ ให้ tPA → ต้อง ≤ 185/110 ก่อนให้\n• หลังให้ tPA → ต้อง ≤ 180/105 × 24 ชม.\n\nยาลด BP: Labetalol, Nicardipine drip (ไม่ใช่ nifedipine SL ที่ลดเร็วเกินไป)' },
      { type: 'quiz', id: 'pc8-q5', topic: 'stroke', question: 'ผู้ป่วย ischemic stroke เข้าเกณฑ์ tPA BP 195/115 — ทำอย่างไร?',
        choices: [
          { id: 'a', text: 'ให้ tPA ทันที — BP ไม่สำคัญ' },
          { id: 'b', text: 'ลด BP ให้ ≤ 185/110 ก่อนให้ tPA (Labetalol/Nicardipine)' },
          { id: 'c', text: 'รอ 24 ชั่วโมงให้ BP ลดเอง' },
          { id: 'd', text: 'ปล่อย BP ไว้ก่อน ลดทีหลัง' },
        ],
        correctId: 'b',
        explanation: 'ก่อน tPA ต้องคุม BP ≤ 185/110 — ถ้าสูงกว่านี้แล้วให้ tPA เสี่ยง hemorrhagic transformation รุนแรง' },

      { type: 'read', heading: 'BP Management — Hemorrhagic Stroke',
        body: 'Hemorrhagic stroke (ICH) — ลด BP เร็วขึ้น เพื่อกัน hematoma ขยาย:\n• ถ้า SBP 150–220 → ลด target SBP ≤ 140 (INTERACT2, ATACH-2)\n• ถ้า SBP > 220 → ลดอย่างเข้มงวด พิจารณา drip + arterial line\n\nงดยา antiplatelet/anticoagulant ทันที + reverse ถ้าใช้ warfarin (vitamin K + 4F-PCC) หรือ DOAC (idarucizumab/andexanet)' },

      { type: 'read', heading: 'Contraindications ต่อ tPA — Absolute',
        body: '• Active internal bleeding\n• Recent ischemic stroke (< 3 เดือน — ยกเว้นเล็กมาก)\n• Recent intracranial/spinal surgery หรือ head trauma (< 3 เดือน)\n• Intracranial neoplasm, AVM, aneurysm\n• เคย intracranial hemorrhage\n• Aortic dissection\n• BP > 185/110 ที่ลดไม่ลง\n• Platelet < 100,000\n• INR > 1.7 / PT > 15 / aPTT prolonged\n• ใช้ DOAC ภายใน 48 ชม. (ยกเว้นมี normal lab)\n• Blood glucose < 50 mg/dL (แก้แล้วประเมินใหม่)' },

      { type: 'read', heading: 'Glucose และ Temperature',
        body: 'Glucose:\n• Hypoglycemia (< 60) เลียนแบบ stroke — แก้ก่อน แล้วประเมินใหม่\n• Hyperglycemia (> 180) สัมพันธ์กับ outcome แย่ — รักษาด้วย insulin\n\nTemperature: fever (> 38°C) ทำให้ outcome แย่ลง → ลดด้วย paracetamol และ cooling' },

      { type: 'read', heading: 'หลัง tPA — Monitor',
        body: '• Neuro check ทุก 15 นาที × 2 ชม. → ทุก 30 นาที × 6 ชม. → ทุก 1 ชม. × 16 ชม.\n• BP check ทุก 15 นาทีตามตาราง\n• ห้ามให้ antiplatelet/anticoagulant ใน 24 ชม.\n• Repeat CT ที่ 24 ชม. ก่อนเริ่ม antiplatelet\n• ถ้าสงสัย hemorrhage (อาการแย่ลง, ปวดศีรษะ, อาเจียน, BP พุ่ง) → หยุด tPA, CT ทันที, เตรียมแก้: cryoprecipitate ± tranexamic acid' },
      { type: 'quiz', id: 'pc8-q6', topic: 'stroke', question: 'ผู้ป่วยได้ tPA ไป 45 นาที จู่ ๆ ปวดศีรษะรุนแรง สับสน BP พุ่งจาก 150/90 เป็น 200/110 — ทำอะไรก่อน?',
        choices: [
          { id: 'a', text: 'หยุด tPA infusion ทันที + CT brain เร่งด่วน' },
          { id: 'b', text: 'เพิ่ม tPA dose' },
          { id: 'c', text: 'ให้ aspirin ทันที' },
          { id: 'd', text: 'รอประเมิน 1 ชั่วโมง' },
        ],
        correctId: 'a',
        explanation: 'อาการชี้ว่ามี symptomatic intracranial hemorrhage หลัง tPA — หยุดยา + CT ทันที + แก้ด้วย cryoprecipitate / tranexamic acid + คุม BP เข้มงวด' },
    ],
  },
];

// Derive `sections` and `quiz` from `steps` for compatibility with ResultsSummary, cohort logic, etc.
function deriveLesson(l) {
  const sections = l.steps.filter(s => s.type === 'read').map(s => ({ heading: s.heading, body: s.body }));
  const quiz = l.steps.filter(s => s.type === 'quiz').map(s => ({
    id: s.id,
    topic: s.topic,
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
