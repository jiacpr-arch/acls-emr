// Defibrillation & Electrical Therapy — pre-course lessons (ILCOR ACLS 2025 principles)
// ใช้ schema เดียวกับ src/data/preCourseContent.js / bls-hcp/lessons.js เพื่อให้ LessonReader engine ใช้ได้เลย
//
// IMPORTANT: เนื้อหาในไฟล์นี้เป็น draft ที่ paraphrase จากแนวทาง ILCOR 2025
// ต้องผ่าน medical review โดยแพทย์ EM/ICU/หทัยวิทยาก่อนปล่อย production
// ระวังลิขสิทธิ์ ILCOR 2025 — ห้าม quote algorithm table ตรง ๆ ใช้ paraphrase เท่านั้น

import { buildLessons } from '../shared/deriveLesson';

export const preCourseVideos = [
  { platform: 'youtube', label: 'ดูบน YouTube', url: 'https://youtube.com/@jia-bu8yn' },
  { platform: 'tiktok', label: 'ดูบน TikTok', url: 'https://www.tiktok.com/@jia_lucksa' },
];

const lessonDefs = [
  // ===================== บทที่ 1 =====================
  {
    id: 'df-1',
    title: 'บทที่ 1: หลักการช็อกไฟฟ้าหัวใจ',
    description: 'Shockable vs non-shockable · biphasic/monophasic · ระดับพลังงาน',
    estMinutes: 12,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'Defibrillation ทำงานอย่างไร',
        body: 'การช็อกไฟฟ้าปล่อยกระแสไฟผ่านกล้ามเนื้อหัวใจพร้อมกันทั้งดวง (mass depolarization) เพื่อ "รีเซ็ต" จังหวะหัวใจที่วุ่นวายไร้ระเบียบ ให้เซลล์กล้ามเนื้อหัวใจกลับมาพักตัวพร้อมกัน แล้วเปิดโอกาสให้ pacemaker ธรรมชาติ (SA node) กลับมาควบคุมจังหวะได้อีกครั้ง' },
      { type: 'read', heading: 'จังหวะที่ Shock ได้ (Shockable Rhythms)',
        body: '• Ventricular Fibrillation (VF) — หัวใจสั่นพลิ้วไม่มีการบีบตัวที่มีประสิทธิภาพเลย เป็นจังหวะที่พบบ่อยที่สุดในภาวะหัวใจหยุดเต้นเฉียบพลันช่วงแรก\n• Pulseless Ventricular Tachycardia (pVT) — หัวใจเต้นเร็วผิดปกติจาก ventricle แต่ไม่มีชีพจร (คลำไม่ได้)\nทั้งสองจังหวะนี้ต้อง defibrillation โดยเร็วที่สุด — ทุก 1 นาทีที่ล่าช้าโอกาสรอดลดลงอย่างมีนัยสำคัญ' },
      { type: 'read', heading: 'จังหวะที่ Shock ไม่ได้ (Non-shockable Rhythms)',
        body: '• Asystole — เส้นตรงราบ ไม่มีกิจกรรมไฟฟ้าเลย\n• Pulseless Electrical Activity (PEA) — มีกิจกรรมไฟฟ้าที่ดูเหมือนปกติหรือผิดปกติบนจอ แต่คลำชีพจรไม่ได้\nทั้งสองจังหวะนี้ห้าม shock เพราะไม่ใช่ปัญหาไฟฟ้าที่วุ่นวายแบบ VF/pVT การรักษาหลักคือ CPR คุณภาพสูงต่อเนื่อง + หาสาเหตุที่แก้ไขได้ (H\'s and T\'s) + ยา' },
      { type: 'read', heading: 'Biphasic vs Monophasic',
        body: 'เครื่อง defibrillator ปัจจุบันเกือบทั้งหมดเป็น biphasic (กระแสไฟไหลสองทิศทางสลับกัน) ซึ่งมีประสิทธิภาพสูงกว่าที่พลังงานต่ำกว่าเครื่อง monophasic รุ่นเก่า (กระแสไหลทิศทางเดียว) — พลังงานที่แนะนำจึงต่างกันตามชนิดเครื่อง ต้องดูคู่มือเครื่องที่ใช้จริงเป็นหลัก' },
      { type: 'read', heading: 'ระดับพลังงานเบื้องต้น',
        body: 'หลักการทั่วไป (biphasic): shock ครั้งแรกที่ระดับพลังงานตามคำแนะนำผู้ผลิตเครื่อง (มักอยู่ในช่วง 120–200 J) หากไม่ทราบค่าที่แนะนำ ให้ใช้ค่าสูงสุดของเครื่องนั้นได้ ครั้งถัดไปอาจใช้พลังงานเท่าเดิมหรือเพิ่มขึ้น (escalating) ตามคู่มือเครื่อง — เครื่อง monophasic ใช้ 360 J ทุกครั้ง' },
      { type: 'quiz', id: 'df-1-q1',
        question: 'จังหวะใดต่อไปนี้เป็น shockable rhythm?',
        choices: [
          { id: 'a', text: 'Asystole' },
          { id: 'b', text: 'Pulseless VT' },
          { id: 'c', text: 'PEA' },
          { id: 'd', text: 'Sinus rhythm ปกติ' },
        ],
        correctId: 'b', explanation: 'VF และ pulseless VT เป็น shockable rhythms ที่ต้อง defibrillation ทันที' },
      { type: 'quiz', id: 'df-1-q2',
        question: 'ทำไม PEA จึงห้าม shock?',
        choices: [
          { id: 'a', text: 'เพราะเป็นจังหวะที่หัวใจหยุดสนิท ไม่มีไฟฟ้าเลย' },
          { id: 'b', text: 'เพราะมีกิจกรรมไฟฟ้าอยู่แต่คลำชีพจรไม่ได้ — ไม่ใช่ปัญหาไฟฟ้าวุ่นวายแบบ VF' },
          { id: 'c', text: 'เพราะพลังงานไม่พอ' },
          { id: 'd', text: 'PEA shock ได้เสมอ' },
        ],
        correctId: 'b', explanation: 'PEA มีกิจกรรมไฟฟ้าบนจอแต่ไม่มีการบีบตัวที่มีประสิทธิภาพ การรักษาหลักคือ CPR + หาสาเหตุ ไม่ใช่ shock' },
      { type: 'quiz', id: 'df-1-q3',
        question: 'เครื่อง defibrillator แบบ biphasic มีข้อดีอย่างไรเทียบกับ monophasic?',
        choices: [
          { id: 'a', text: 'มีประสิทธิภาพสูงกว่าที่พลังงานต่ำกว่า' },
          { id: 'b', text: 'ราคาถูกกว่าเสมอ' },
          { id: 'c', text: 'ไม่ต้องใช้ pads' },
          { id: 'd', text: 'ใช้ได้เฉพาะเด็กเท่านั้น' },
        ],
        correctId: 'a', explanation: 'Biphasic ใช้กระแสไฟสองทิศทาง มีประสิทธิภาพสูงกว่าที่ระดับพลังงานต่ำกว่า monophasic' },
    ],
  },

  // ===================== บทที่ 2 =====================
  {
    id: 'df-2',
    title: 'บทที่ 2: AED และ Manual Defibrillation',
    description: 'ลำดับขั้น · ตำแหน่ง pads · ความปลอดภัย',
    estMinutes: 12,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'AED — หลักการทำงาน',
        body: 'AED (Automated External Defibrillator) วิเคราะห์จังหวะหัวใจอัตโนมัติและสั่ง shock เฉพาะจังหวะที่ shock ได้เท่านั้น — ผู้ใช้ไม่ต้องอ่าน rhythm เอง เหมาะสำหรับผู้ไม่ชำนาญ ทำตามเสียง/ภาพแนะนำของเครื่องเป็นหลัก' },
      { type: 'read', heading: 'ลำดับขั้นการใช้ AED',
        body: '1) เปิดเครื่อง ทำตามคำแนะนำเสียง\n2) เปิดหน้าอกเปล่า (ถอด/ตัดเสื้อผ้า เช็ดเหงื่อ/น้ำให้แห้ง) ติด pads ตามตำแหน่งบนแผ่น\n3) เครื่องวิเคราะห์จังหวะ — ทุกคนต้องห่างตัวผู้ป่วย ไม่แตะต้องระหว่างวิเคราะห์\n4) ถ้าแนะนำ shock — ตะโกนเคลียร์ ("ถอย! กำลังช็อก") ตรวจสอบว่าไม่มีใครสัมผัสตัวผู้ป่วย แล้วกดปุ่ม shock\n5) หลัง shock กดหน้าอกต่อทันที ไม่ต้องตรวจชีพจรก่อน' },
      { type: 'read', heading: 'ตำแหน่ง Pads มาตรฐาน และเหตุผลเชิงไฟฟ้า',
        body: `เป้าหมายคือให้กระแส **"หนีบหัวใจไว้ระหว่าง pad"** เพื่อให้ไหลผ่าน myocardium มากที่สุด

| ตำแหน่ง | วางอย่างไร | ใช้เมื่อ |
|---|---|---|
| **Anterior-lateral** | ใต้ไหปลาร้า**ขวา** + ชายโครง**ซ้าย**แนวรักแร้กลาง | นิยมที่สุด |
| **Anterior-posterior** | หน้าอก + กลางหลัง | เด็กเล็ก, cardioversion/pacing |

**ตัวเลขเชิงปฏิบัติ:**
- pad ผู้ใหญ่เส้นผ่านศูนย์กลาง ~**8–12 ซม.**
- pad ทั้งสอง **ต้องไม่แตะกัน** (เว้น ≥ ~2.5 ซม.) ไม่งั้นกระแสลัดตามผิว (arcing) ช็อกไม่ได้ผล
- ถ้ามี **ICD/pacemaker** ฝัง วาง pad ห่างตัวเครื่อง ≥ ~2.5 ซม. (บางแนวทางใช้ ~8 ซม.) ไม่วางทับ` },
      { type: 'read', heading: 'ความปลอดภัยและข้อควรระวัง',
        body: '• ตัวเปียก/อยู่ในน้ำ — เคลื่อนย้ายพ้นน้ำก่อน เช็ดหน้าอกให้แห้งก่อนติด pads\n• ขนหน้าอกดกมาก — กดแผ่นให้แนบแน่น หรือโกนอย่างรวดเร็วเฉพาะจุดติดถ้ามีมีดโกนพร้อม\n• มี pacemaker/ICD (ก้อนนูนใต้ผิวหนัง) — ห้ามวาง pad ทับก้อนอุปกรณ์โดยตรง ให้เว้นระยะห่างจากตัวเครื่องอย่างน้อยราว 8 ซม.\n• แผ่นแปะยาที่หน้าอก (nitroglycerin patch ฯลฯ) — ลอกออกและเช็ดก่อนติด pad เพื่อป้องกันไฟไหม้ผิวหนังและลดประสิทธิภาพการนำไฟฟ้า' },
      { type: 'read', heading: 'Manual Defibrillation — ต่างจาก AED อย่างไร',
        body: 'Manual defibrillator ให้ผู้ใช้ (แพทย์/บุคลากรที่ผ่านการฝึก ACLS) อ่านจังหวะเองและเลือกระดับพลังงาน/กด charge/shock เอง — เร็วกว่า AED เพราะข้ามขั้นตอนวิเคราะห์อัตโนมัติ แต่ต้องมีความชำนาญในการอ่าน rhythm ที่ถูกต้อง ใช้ในโรงพยาบาลหรือทีมกู้ชีพขั้นสูงเป็นหลัก' },
      { type: 'quiz', id: 'df-2-q1',
        question: 'หลัง AED shock แล้ว ควรทำอย่างไรต่อทันที?',
        choices: [
          { id: 'a', text: 'ตรวจชีพจรก่อนเสมอ' },
          { id: 'b', text: 'กดหน้าอกต่อทันที' },
          { id: 'c', text: 'ปิดเครื่อง' },
          { id: 'd', text: 'รอ 1 นาทีก่อนทำอะไร' },
        ],
        correctId: 'b', explanation: 'แม้ shock สำเร็จ หัวใจมักยังบีบตัวอ่อนช่วงแรก การหยุดตรวจชีพจรเป็น interruption ที่ไม่จำเป็น' },
      { type: 'quiz', id: 'df-2-q2',
        question: 'ผู้ป่วยมี pacemaker ฝังอยู่ใต้ผิวหนังบริเวณใต้ไหปลาร้า ควรวาง pad อย่างไร?',
        choices: [
          { id: 'a', text: 'วางทับก้อนอุปกรณ์ได้เลย' },
          { id: 'b', text: 'เว้นระยะห่างจากตัวเครื่องอย่างน้อยราว 8 ซม.' },
          { id: 'c', text: 'ห้าม shock ผู้ป่วยที่มี pacemaker เด็ดขาด' },
          { id: 'd', text: 'ต้องถอด pacemaker ออกก่อน' },
        ],
        correctId: 'b', explanation: 'เว้นระยะห่างจากตัวเครื่อง ไม่วาง pad ทับโดยตรง เพื่อลดการรบกวนอุปกรณ์และประสิทธิภาพ shock' },
      { type: 'quiz', id: 'df-2-q3',
        question: 'ระหว่างที่ AED กำลังวิเคราะห์จังหวะหัวใจ ทุกคนควรทำอะไร?',
        choices: [
          { id: 'a', text: 'กดหน้าอกต่อไปตามปกติ' },
          { id: 'b', text: 'ห่างตัวผู้ป่วย ไม่แตะต้อง' },
          { id: 'c', text: 'จับชีพจรพร้อมกัน' },
          { id: 'd', text: 'เขย่าตัวผู้ป่วยเบา ๆ' },
        ],
        correctId: 'b', explanation: 'การเคลื่อนไหว/สัมผัสระหว่างวิเคราะห์รบกวนการอ่านจังหวะของเครื่อง ทำให้วิเคราะห์ผิดพลาดได้' },
    ],
  },

  // ===================== บทที่ 3 =====================
  {
    id: 'df-3',
    title: 'บทที่ 3: ลด Peri-shock Pause',
    description: 'CPR คุณภาพสูงรอบการช็อก · Chest Compression Fraction',
    estMinutes: 10,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'Peri-shock Pause คืออะไร',
        body: 'คือช่วงเวลาที่หยุดกดหน้าอกก่อนและหลัง shock (pre-shock pause + post-shock pause) ยิ่งช่วงนี้นานเท่าไร โอกาสสำเร็จของการ shock และการรอดชีวิตยิ่งลดลง เพราะ coronary perfusion pressure ที่สร้างจากการกดหน้าอกจะลดลงอย่างรวดเร็วเมื่อหยุดกด และต้องใช้เวลาสร้างขึ้นใหม่หลายรอบการกดกว่าจะกลับมาสูงเท่าเดิม' },
      { type: 'read', heading: 'เป้าหมาย Pre-shock Pause',
        body: 'ลด pre-shock pause ให้สั้นที่สุดโดยเตรียมทุกอย่างล่วงหน้าระหว่างที่ยังกดหน้าอกอยู่: ชาร์จเครื่องล่วงหน้าก่อนหยุดกด, เตรียมทีมให้พร้อมสลับ, ประกาศ "ชาร์จแล้ว หยุดกด" แล้วช็อกทันที — เป้าหมายคือหยุดกดให้สั้นที่สุดเท่าที่เป็นไปได้ในทางปฏิบัติ' },
      { type: 'read', heading: 'เป้าหมาย Post-shock Pause',
        body: 'กลับมากดหน้าอกทันทีหลัง shock โดยไม่หยุดตรวจชีพจรหรือดู rhythm บนจอก่อน — ให้กด CPR ต่อเนื่องอย่างน้อย 2 นาทีเต็มก่อนจะหยุดประเมิน rhythm ครั้งถัดไป (ยกเว้นเห็นสัญญาณชัดเจนว่าผู้ป่วยฟื้น เช่น ขยับตัว หายใจปกติ)' },
      { type: 'read', heading: 'Chest Compression Fraction (CCF)',
        body: 'CCF คือสัดส่วนเวลาที่มือกำลังกดหน้าอกจริงต่อเวลารวมทั้งหมดของการช่วยชีวิต เป้าหมายตามแนวทาง 2025 คือ CCF มากกว่า 80% — วิธีเพิ่ม CCF ที่ได้ผลที่สุดคือลด peri-shock pause เพราะเป็นช่วงที่มักหยุดกดนานที่สุดในรอบการช่วยชีวิตที่มี shockable rhythm' },
      { type: 'read', heading: 'บทบาทของทีมในการลด Pause',
        body: 'กำหนดบทบาทชัดเจนล่วงหน้า: คนหนึ่งเตรียม/ชาร์จเครื่อง คนหนึ่งเตรียมสลับกดหน้าอก คนหนึ่งประกาศนับถอยหลังและสั่งเคลียร์ — การซ้อมบทบาทล่วงหน้าเป็นทีมช่วยลด pause ได้มากกว่าการพึ่งพาความเร็วของคนคนเดียว' },
      { type: 'quiz', id: 'df-3-q1',
        question: 'ทำไม peri-shock pause ที่ยาวจึงลดโอกาสสำเร็จของการ shock?',
        choices: [
          { id: 'a', text: 'เครื่องจะร้อนเกินไป' },
          { id: 'b', text: 'Coronary perfusion pressure ลดลงเร็วเมื่อหยุดกด และต้องใช้เวลาสร้างใหม่' },
          { id: 'c', text: 'แบตเตอรี่เครื่องหมด' },
          { id: 'd', text: 'ไม่มีผลต่อโอกาสสำเร็จ' },
        ],
        correctId: 'b', explanation: 'การหยุดกดทำให้ความดันเลือดที่ไปเลี้ยงหัวใจลดลงอย่างรวดเร็ว ลดโอกาสที่ shock จะทำให้จังหวะกลับมาเป็นปกติได้ผล' },
      { type: 'quiz', id: 'df-3-q2',
        question: 'CCF เป้าหมายตามแนวทาง 2025 คือเท่าไร?',
        choices: [
          { id: 'a', text: '> 40%' },
          { id: 'b', text: '> 60%' },
          { id: 'c', text: '> 80%' },
          { id: 'd', text: '100%' },
        ],
        correctId: 'c', explanation: 'CCF > 80% เป็น quality benchmark — สัมพันธ์กับโอกาส ROSC และการรอดชีวิตที่ดีกว่า' },
      { type: 'quiz', id: 'df-3-q3',
        question: 'วิธีลด pre-shock pause ที่ได้ผลที่สุดคืออะไร?',
        choices: [
          { id: 'a', text: 'ชาร์จเครื่องล่วงหน้าระหว่างยังกดหน้าอกอยู่' },
          { id: 'b', text: 'หยุดกดก่อนแล้วค่อยเริ่มชาร์จ' },
          { id: 'c', text: 'รอให้ทีมพร้อมทุกคนก่อนเริ่มชาร์จ' },
          { id: 'd', text: 'ไม่ต้องชาร์จล่วงหน้า' },
        ],
        correctId: 'a', explanation: 'เตรียม/ชาร์จเครื่องล่วงหน้าระหว่างยังกดหน้าอกอยู่ ทำให้หยุดกดสั้นที่สุดเมื่อถึงเวลา shock จริง' },
    ],
  },

  // ===================== บทที่ 4 =====================
  {
    id: 'df-4',
    title: 'บทที่ 4: Synchronized Cardioversion',
    description: 'ต่างจาก defibrillation อย่างไร · ข้อบ่งชี้ · sedation',
    estMinutes: 12,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'Synchronized Cardioversion คืออะไร',
        body: 'เป็นการช็อกไฟฟ้าที่เครื่อง "sync" กับคลื่น R บน EKG ของผู้ป่วย เพื่อปล่อยกระแสไฟตรง QRS complex เท่านั้น หลีกเลี่ยงการปล่อยไฟฟ้าตรงช่วง T wave ซึ่งเป็นช่วงหัวใจไวต่อการกระตุ้นสูง (relative refractory period) — ถ้าช็อกโดนช่วง T wave อาจทำให้เกิด VF ได้ (R-on-T phenomenon)' },
      { type: 'read', heading: 'ข้อบ่งชี้ของ Synchronized Cardioversion',
        body: 'ใช้กับ tachyarrhythmia ที่ยังมีชีพจรและมีอาการไม่คงที่ (unstable) เช่น ความดันต่ำ เจ็บหน้าอก หมดสติ/ซึม หัวใจล้มเหลวเฉียบพลัน — เช่น unstable SVT, unstable atrial fibrillation/flutter, unstable monomorphic VT ที่ยังมีชีพจร\nข้อสำคัญ: ต้อง "มีชีพจร" เสมอ ถ้าผู้ป่วยไม่มีชีพจรต้องใช้ defibrillation (unsynchronized) แทน ไม่ใช่ cardioversion' },
      { type: 'read', heading: 'ข้อแตกต่างจาก Defibrillation',
        body: '• Defibrillation — ใช้กับผู้ป่วยไม่มีชีพจร (VF/pVT) ปล่อยไฟทันทีไม่รอ sync กับจังหวะใด ๆ เพราะไม่มีจังหวะที่เป็นระเบียบให้ sync\n• Synchronized cardioversion — ใช้กับผู้ป่วยมีชีพจรแต่ไม่คงที่ เครื่อง "รอ" จังหวะ R wave แล้วจึงปล่อยไฟ ต้องเปิดโหมด "SYNC" บนเครื่องทุกครั้งก่อนช็อก และเปิดใหม่ทุกครั้งหลัง shock แต่ละครั้ง เพราะเครื่องส่วนใหญ่จะปิดโหมด sync อัตโนมัติหลัง shock' },
      { type: 'read', heading: 'ระดับพลังงานเบื้องต้น',
        body: 'ขึ้นกับชนิดจังหวะและเครื่อง (biphasic โดยทั่วไป):\n• Narrow regular (เช่น SVT, atrial flutter) — เริ่มที่พลังงานต่ำกว่า มักในช่วง 50–100 J\n• Narrow irregular (atrial fibrillation) หรือ wide regular (monomorphic VT) — มักเริ่มที่ระดับสูงกว่า เช่น 120–200 J\nค่าที่แน่นอนให้ยึดตามคู่มือเครื่องและแนวทางล่าสุดของสถาบันเสมอ ถ้าไม่ได้ผลให้เพิ่มพลังงานตามลำดับขั้น (escalating)' },
      { type: 'read', heading: 'Sedation ก่อน Cardioversion',
        body: 'ผู้ป่วยที่รู้สึกตัวควรได้รับยาระงับประสาท/ยาแก้ปวดระยะสั้นก่อน (ถ้าเวลาและอาการอนุญาต) เนื่องจากกระบวนการนี้เจ็บปวดมาก อย่างไรก็ตามในผู้ป่วยที่ไม่คงที่รุนแรงมาก (peri-arrest) ห้ามให้การรักษาล่าช้าเพื่อรอ sedation — ความปลอดภัยของผู้ป่วยจากภาวะ unstable สำคัญกว่าความสุขสบาย' },
      { type: 'quiz', id: 'df-4-q1',
        question: 'ทำไมเครื่องต้อง "sync" กับ R wave ก่อนปล่อยไฟใน cardioversion?',
        choices: [
          { id: 'a', text: 'เพื่อประหยัดแบตเตอรี่' },
          { id: 'b', text: 'เพื่อหลีกเลี่ยงปล่อยไฟตรงช่วง T wave ซึ่งเสี่ยงกระตุ้นให้เกิด VF (R-on-T)' },
          { id: 'c', text: 'เพื่อให้ช็อกแรงขึ้น' },
          { id: 'd', text: 'ไม่มีเหตุผลพิเศษ' },
        ],
        correctId: 'b', explanation: 'ช่วง T wave หัวใจไวต่อการกระตุ้นสูง ปล่อยไฟตรงช่วงนี้เสี่ยงทำให้เกิด VF' },
      { type: 'quiz', id: 'df-4-q2',
        question: 'ข้อใดคือความแตกต่างสำคัญระหว่าง defibrillation กับ synchronized cardioversion?',
        choices: [
          { id: 'a', text: 'ใช้เครื่องคนละชนิดกันเสมอ' },
          { id: 'b', text: 'Defibrillation ใช้กับผู้ป่วยไม่มีชีพจร ส่วน cardioversion ใช้กับผู้ป่วยมีชีพจรแต่ไม่คงที่' },
          { id: 'c', text: 'Cardioversion ใช้พลังงานสูงกว่าเสมอ' },
          { id: 'd', text: 'ไม่มีความแตกต่าง' },
        ],
        correctId: 'b', explanation: 'Defibrillation สำหรับ VF/pVT (ไม่มีชีพจร) ปล่อยไฟทันที ส่วน cardioversion sync กับ R wave สำหรับผู้ป่วยที่ยังมีชีพจรแต่ไม่คงที่' },
      { type: 'quiz', id: 'df-4-q3',
        question: 'หลัง cardioversion แต่ละครั้ง ก่อนช็อกครั้งถัดไปต้องทำอะไร?',
        choices: [
          { id: 'a', text: 'ไม่ต้องทำอะไรเพิ่ม' },
          { id: 'b', text: 'เปิดโหมด SYNC ใหม่ทุกครั้ง เพราะเครื่องมักปิดโหมดนี้อัตโนมัติหลัง shock' },
          { id: 'c', text: 'ปิดเครื่องแล้วเปิดใหม่' },
          { id: 'd', text: 'เปลี่ยนตำแหน่ง pads' },
        ],
        correctId: 'b', explanation: 'เครื่องส่วนใหญ่ปิดโหมด sync อัตโนมัติหลัง shock แต่ละครั้ง ต้องเปิดใหม่ทุกครั้งก่อนช็อกซ้ำ' },
    ],
  },

  // ===================== บทที่ 5 =====================
  {
    id: 'df-5',
    title: 'บทที่ 5: Transcutaneous Pacing และทบทวนรวม',
    description: 'Capture · ข้อบ่งชี้ · ทบทวนภาพรวมทั้งหลักสูตร',
    estMinutes: 12,
    passingScore: 75,
    steps: [
      { type: 'read', heading: 'Transcutaneous Pacing (TCP) คืออะไร',
        body: 'เป็นการกระตุ้นหัวใจด้วยไฟฟ้าผ่าน pads ที่ติดบนผิวหนัง (คนละหลักการกับ defibrillation) เพื่อบังคับให้หัวใจบีบตัวในจังหวะที่ตั้งไว้ ใช้ชั่วคราวระหว่างรอใส่ transvenous pacemaker หรือรอแก้สาเหตุที่ทำให้หัวใจเต้นช้าเกินไป' },
      { type: 'read', heading: 'ข้อบ่งชี้',
        body: 'ใช้ในผู้ป่วย bradycardia ที่มีอาการไม่คงที่ (unstable) และไม่ตอบสนองต่อยา (เช่น atropine) — โดยเฉพาะ high-degree AV block (เช่น complete heart block) ที่เสี่ยงหัวใจหยุดเต้นได้ทุกเมื่อ' },
      { type: 'read', heading: 'การติดตั้งและตั้งค่าเบื้องต้น',
        body: 'ติด pads ตำแหน่ง anterior-posterior เป็นที่นิยม (แผ่นหน้าอกซ้าย + แผ่นกลางหลัง) ตั้งอัตรา pacing เริ่มต้นตามอาการผู้ป่วย (มักเริ่มราว 60–80 ครั้ง/นาที) แล้วค่อย ๆ เพิ่มกระแสไฟ (mA) จากต่ำขึ้นไปทีละน้อยจนกว่าจะเห็น capture บน monitor' },
      { type: 'read', heading: 'การยืนยัน Electrical และ Mechanical Capture',
        body: '• Electrical capture — เห็น pacing spike ตามด้วย QRS complex กว้างบน EKG monitor ในจังหวะที่ตั้งไว้\n• Mechanical capture — คลำชีพจร (เช่น femoral) ให้ตรงกับอัตราที่ตั้งไว้ เพื่อยืนยันว่าไฟฟ้าที่ capture นั้นทำให้หัวใจบีบตัวจริงและมีเลือดไหลเวียนจริง ไม่ใช่แค่สัญญาณไฟฟ้าบนจอ\nต้องยืนยันทั้งสองอย่างเสมอ เพราะบางครั้งเห็น electrical capture บนจอแต่คลำชีพจรไม่ได้ (ไม่มี mechanical capture จริง)' },
      { type: 'read', heading: 'ทบทวนภาพรวม: Defibrillation → Cardioversion → Pacing',
        body: 'สามเทคนิคไฟฟ้ารักษาปัญหาต่างกัน:\n• Defibrillation — ไม่มีชีพจร จังหวะ shockable (VF/pVT) ปล่อยไฟทันทีไม่รอ sync\n• Synchronized cardioversion — มีชีพจรแต่ไม่คงที่ จังหวะเต้นเร็วผิดปกติ (tachyarrhythmia) เครื่อง sync กับ R wave ก่อนปล่อยไฟ\n• Transcutaneous pacing — มีชีพจรแต่ไม่คงที่ จังหวะเต้นช้าผิดปกติ (bradyarrhythmia) กระตุ้นให้หัวใจบีบตัวในจังหวะที่ตั้งไว้\nเลือกเทคนิคให้ตรงกับปัญหา — สับสนกันจะทำให้การรักษาไม่ได้ผลหรืออันตรายกว่าเดิม' },
      { type: 'quiz', id: 'df-5-q1',
        question: 'สิ่งใดยืนยันว่าเกิด "mechanical capture" จริงระหว่าง transcutaneous pacing?',
        choices: [
          { id: 'a', text: 'เห็น pacing spike บนจอ' },
          { id: 'b', text: 'คลำชีพจรได้ตรงกับอัตราที่ตั้งไว้' },
          { id: 'c', text: 'ผู้ป่วยพูดได้' },
          { id: 'd', text: 'ความดันโลหิตปกติเสมอ' },
        ],
        correctId: 'b', explanation: 'Electrical capture เห็นได้บนจอ แต่ mechanical capture ต้องคลำชีพจรยืนยันว่าหัวใจบีบตัวและมีเลือดไหลเวียนจริง' },
      { type: 'quiz', id: 'df-5-q2',
        question: 'Transcutaneous pacing ใช้ในผู้ป่วยกลุ่มใด?',
        choices: [
          { id: 'a', text: 'Tachycardia ที่ไม่คงที่' },
          { id: 'b', text: 'Bradycardia ที่ไม่คงที่และไม่ตอบสนองต่อยา' },
          { id: 'c', text: 'VF/pVT ที่ไม่มีชีพจร' },
          { id: 'd', text: 'ผู้ป่วยหัวใจปกติทุกราย' },
        ],
        correctId: 'b', explanation: 'TCP ใช้กับ bradycardia ที่มีอาการไม่คงที่และยาไม่ได้ผล โดยเฉพาะ high-degree AV block' },
      { type: 'quiz', id: 'df-5-q3',
        question: 'ข้อใดจับคู่เทคนิคกับสถานการณ์ได้ถูกต้อง?',
        choices: [
          { id: 'a', text: 'Defibrillation ใช้กับผู้ป่วยมีชีพจรที่เต้นช้าผิดปกติ' },
          { id: 'b', text: 'Synchronized cardioversion ใช้กับผู้ป่วยมีชีพจรที่เต้นเร็วผิดปกติและไม่คงที่' },
          { id: 'c', text: 'Pacing ใช้กับผู้ป่วยไม่มีชีพจรที่เป็น VF' },
          { id: 'd', text: 'ทั้งสามเทคนิคใช้แทนกันได้เสมอ' },
        ],
        correctId: 'b', explanation: 'Cardioversion ใช้กับ tachyarrhythmia ที่มีชีพจรแต่ไม่คงที่ — sync กับ R wave ก่อนปล่อยไฟ' },
    ],
  },
];

const lessonVideos = {};

export const { preCourseLessons, findLessonById, getLessonStepCount, getLessonQuizCount } = buildLessons(lessonDefs, lessonVideos);
