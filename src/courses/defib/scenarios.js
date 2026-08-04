// Defibrillation decision-game scenarios — one continuous case per stage,
// built on the shared engine in src/courses/shared/scenarioEngine.js.
// Facts/traps paraphrased from the vetted lesson content in ./lessons.js —
// should still be sanity-checked by the course instructor before production use.

import { createScenarioEngine } from '../shared/scenarioEngine';

export const DEFAULT_TIME_LIMIT_SEC = 20;

const stages = [
  {
    id: 'df-stage-1', chapterId: 'df-1', stageNumber: 1,
    title: 'หลักการช็อกไฟฟ้า', subtitle: 'บทที่ 1 · อ่านจังหวะก่อนตัดสินใจ',
    emoji: '⚡', passScore: 80,
    steps: [
      { situation: 'Monitor แสดงจังหวะสั่นพลิ้วไม่มีระเบียบ ผู้ป่วยไม่ตอบสนอง คลำชีพจรไม่ได้',
        question: 'จังหวะนี้น่าจะเป็นอะไรและควรทำอย่างไร?',
        options: [
          { label: 'VF — เตรียม defibrillation ทันที', correct: true, feedback: 'ถูกต้อง — VF คือกล้ามเนื้อหัวใจสั่นพลิ้วไร้ระเบียบจนปั๊มเลือดไม่ได้; การ defibrillation รีเซ็ตเซลล์พร้อมกันให้จังหวะปกติกลับมาคุม ยิ่งเร็วยิ่งรอด' },
          { label: 'PEA — ห้าม shock ให้ CPR อย่างเดียว', correct: false, feedback: 'PEA คือมีคลื่นไฟฟ้าเป็นระเบียบแต่ไม่มีชีพจร ต่างจากภาพสั่นพลิ้วไร้ระเบียบ (VF) ที่บรรยาย ซึ่ง VF ต้อง shock', trap: true },
          { label: 'Sinus rhythm ปกติ ไม่ต้องทำอะไร', correct: false, feedback: 'ผู้ป่วยไม่มีชีพจรและจังหวะผิดปกติชัดเจน ไม่ใช่ sinus rhythm' },
          { label: 'รอดูอาการอีก 5 นาที', correct: false, feedback: 'VF ทุกนาทีที่ผ่านไปโอกาสรอดลดลงมาก ต้อง defibrillation ทันที ไม่รอ' },
        ] },
      { situation: 'Monitor อีกเครื่องแสดงเส้นตรงราบสนิท ไม่มีกิจกรรมไฟฟ้าเลย',
        question: 'จังหวะนี้ควร shock หรือไม่?',
        options: [
          { label: 'ไม่ shock — เป็น asystole ให้ CPR + หาสาเหตุ + ยา', correct: true, feedback: 'ถูกต้อง — asystole ไม่มีกิจกรรมไฟฟ้าให้ shock รีเซ็ต; ให้ CPR คุณภาพสูงพร้อมหาและแก้สาเหตุที่รักษาได้ (กลุ่ม H และ T) และให้ยา' },
          { label: 'Shock ทันทีด้วยพลังงานสูงสุด', correct: false, feedback: 'Asystole ห้าม shock เพราะไม่มีอะไรให้รีเซ็ต การ shock ยังทำให้กล้ามเนื้อหัวใจบาดเจ็บและเสียเวลากดหน้าอก', trap: true },
          { label: 'รอเครื่องวิเคราะห์ซ้ำอีกครั้งโดยไม่ทำอะไร', correct: false, feedback: 'ควรเริ่ม CPR ทันทีระหว่างหาสาเหตุ ไม่รอเฉย ๆ' },
          { label: 'ให้ synchronized cardioversion', correct: false, feedback: 'ไม่มีจังหวะที่เป็นระเบียบให้เครื่อง sync และผู้ป่วยไม่มีชีพจร' },
        ] },
      { situation: 'เพื่อนร่วมทีมถามว่าทำไมเครื่อง biphasic ใช้พลังงานเริ่มต้นต่ำกว่า monophasic',
        question: 'คำตอบที่ถูกต้องคือ?',
        options: [
          { label: 'Biphasic ใช้กระแสไฟสองทิศทาง มีประสิทธิภาพสูงกว่าที่พลังงานต่ำกว่า', correct: true, feedback: 'ถูกต้อง — biphasic ปล่อยกระแสสองทิศทาง ทำ defibrillation สำเร็จได้ที่พลังงานต่ำกว่า จึงลดการบาดเจ็บของกล้ามเนื้อหัวใจ เครื่องรุ่นใหม่จึงเป็น biphasic เกือบทั้งหมด' },
          { label: 'Biphasic แพงกว่าจึงใช้พลังงานน้อยกว่า', correct: false, feedback: 'ไม่เกี่ยวกับราคา แต่เกี่ยวกับกลไกการปล่อยกระแสสองทิศทางที่มีประสิทธิภาพกว่า', trap: true },
          { label: 'ไม่มีความแตกต่างจริง', correct: false, feedback: 'มีความแตกต่างทางเทคนิคชัดเจนทั้งรูปคลื่นและพลังงานที่ใช้' },
          { label: 'Monophasic ปลอดภัยกว่าเสมอ', correct: false, feedback: 'ทั้งสองปลอดภัยเมื่อใช้ถูกวิธี biphasic เพียงได้ผลที่พลังงานต่ำกว่า' },
        ] },
    ],
  },
  {
    id: 'df-stage-2', chapterId: 'df-2', stageNumber: 2,
    title: 'AED และความปลอดภัย', subtitle: 'บทที่ 2 · ใช้ AED ในสถานการณ์จริง',
    emoji: '🧰', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยหัวใจหยุดเต้นในสระว่ายน้ำ เพื่อนช่วยลากตัวขึ้นมาบนขอบสระได้แล้ว ตัวยังเปียกอยู่',
        question: 'ก่อนติด AED pads ควรทำอย่างไรก่อน?',
        options: [
          { label: 'เช็ดหน้าอกให้แห้งก่อนติด pads', correct: true, feedback: 'ถูกต้อง — น้ำบนผิวเป็นตัวนำไฟฟ้า กระแสจะลัดไหลตามผิวหนังแทนที่จะผ่านหัวใจ ต้องเช็ดหน้าอกแห้งก่อนติด pads เสมอ' },
          { label: 'ติด pads ได้เลยไม่ต้องเช็ด', correct: false, feedback: 'หน้าอกเปียกทำให้กระแสลัดไหลตามผิว shock ไม่ได้ผลเต็มที่และเสี่ยงลวกผิว ต้องเช็ดแห้งก่อน', trap: true },
          { label: 'รอให้แห้งเองก่อน 10 นาที', correct: false, feedback: 'รอ 10 นาทีล่าช้าเกินไป ให้เช็ดแห้งอย่างเร็วแล้วรีบใช้เครื่อง' },
          { label: 'ไม่ใช้ AED เลยเพราะเปียกน้ำ', correct: false, feedback: 'ใช้ได้ตามปกติหลังเช็ดหน้าอกแห้งแล้ว ไม่ใช่ข้อห้าม' },
        ] },
      { situation: 'ติด pads เรียบร้อยแล้ว เครื่องกำลังวิเคราะห์จังหวะ',
        question: 'ระหว่างนี้ทีมควรทำอย่างไร?',
        options: [
          { label: 'ห่างตัวผู้ป่วย ไม่แตะต้อง', correct: true, feedback: 'ถูกต้อง — การสัมผัสตัวผู้ป่วยสร้างสัญญาณรบกวน ทำให้เครื่องอ่านจังหวะผิดพลาด ต้องห่างตัวช่วงวิเคราะห์' },
          { label: 'กดหน้าอกต่อไปเลย', correct: false, feedback: 'การกดหน้าอกสร้าง artifact รบกวนการอ่านจังหวะ อาจทำให้เครื่องวิเคราะห์ผิด ต้องหยุดและห่างตัวช่วงวิเคราะห์', trap: true },
          { label: 'คลำชีพจรพร้อมกัน', correct: false, feedback: 'การสัมผัสตัวรบกวนการวิเคราะห์ ต้องห่างตัวผู้ป่วยทั้งหมด' },
          { label: 'เขย่าตัวผู้ป่วยเบา ๆ ดูปฏิกิริยา', correct: false, feedback: 'ไม่ควรสัมผัสตัวผู้ป่วยระหว่างวิเคราะห์เพราะรบกวนสัญญาณ' },
        ] },
      { situation: 'เครื่องแนะนำ shock คุณตะโกนเคลียร์และตรวจดูรอบตัวผู้ป่วยแล้ว กดปุ่ม shock สำเร็จ',
        question: 'ขั้นตอนต่อไปทันทีคืออะไร?',
        options: [
          { label: 'กดหน้าอกต่อทันที ไม่ต้องตรวจชีพจรก่อน', correct: true, feedback: 'ถูกต้อง — หลัง shock หัวใจมักยังบีบตัวอ่อนหรือยังไม่มีชีพจร การกดต่อทันทีช่วยเลือดไหลเวียนโดยไม่เสียเวลาคลำชีพจร' },
          { label: 'ตรวจชีพจรก่อนเสมอ', correct: false, feedback: 'การหยุดคลำชีพจรหลัง shock ทุกครั้งเป็น interruption ที่ไม่จำเป็น ลด CCF ให้กด CPR ต่อทันที', trap: true },
          { label: 'ปิดเครื่องแล้วเริ่มใหม่', correct: false, feedback: 'ไม่จำเป็นต้องปิดเครื่อง เสียเวลาโดยเปล่าประโยชน์' },
          { label: 'รอดูจอ monitor 1 นาทีก่อนทำอะไร', correct: false, feedback: 'ควรกดหน้าอกต่อทันที การรอดูจอทำให้เลือดหยุดไหลเวียน' },
        ] },
    ],
  },
  {
    id: 'df-stage-3', chapterId: 'df-3', stageNumber: 3,
    title: 'ลด Peri-shock Pause', subtitle: 'บทที่ 3 · ทีมช่วยชีวิตทำงานร่วมกัน',
    emoji: '⏱️', passScore: 80,
    steps: [
      { situation: 'ทีมกำลังกดหน้าอกอยู่ และเตรียมจะ shock รอบถัดไปในอีกไม่กี่วินาที',
        question: 'ควรเริ่มชาร์จเครื่องเมื่อไร?',
        options: [
          { label: 'ชาร์จล่วงหน้าระหว่างยังกดหน้าอกอยู่', correct: true, feedback: 'ถูกต้อง — ชาร์จระหว่างยังกดหน้าอกอยู่ทำให้ pre-shock pause สั้นที่สุด พอชาร์จเสร็จหยุดกดแล้ว shock ได้ทันที' },
          { label: 'หยุดกดก่อนแล้วค่อยเริ่มชาร์จ', correct: false, feedback: 'การหยุดกดเพื่อรอชาร์จทำให้ pause ยาวขึ้นโดยไม่จำเป็น ลด CCF และการไหลเวียน', trap: true },
          { label: 'รอให้ทีมทุกคนพร้อมก่อนเริ่มชาร์จ', correct: false, feedback: 'ควรชาร์จล่วงหน้าไปพร้อมกับเตรียมทีม ไม่ต้องรอ' },
          { label: 'ไม่ต้องชาร์จล่วงหน้า ทำตามลำดับปกติ', correct: false, feedback: 'การชาร์จล่วงหน้าเป็นเทคนิคสำคัญในการลด pause อย่ามองข้าม' },
        ] },
      { situation: 'Shock ครั้งที่ 2 เสร็จแล้ว ทีมสงสัยว่าจะตรวจ rhythm ทันทีหรือกด CPR ต่อก่อน',
        question: 'ควรทำอย่างไร?',
        options: [
          { label: 'กด CPR ต่อเนื่องอย่างน้อย 2 นาทีก่อนประเมิน rhythm ครั้งถัดไป', correct: true, feedback: 'ถูกต้อง — กด CPR ต่อ 2 นาทีให้เลือดไปเลี้ยงหัวใจก่อนประเมินซ้ำ ยกเว้นเห็นสัญญาณฟื้นชัด การประเมินบ่อยเกินไปแค่เพิ่ม pause' },
          { label: 'ตรวจ rhythm ทันทีหลัง shock ทุกครั้ง', correct: false, feedback: 'การตรวจ rhythm หลัง shock ทุกครั้งเป็นการหยุดกดที่ไม่จำเป็น เพิ่ม pause โดยเปล่าประโยชน์', trap: true },
          { label: 'หยุดกดรอดูอาการ 30 วินาที', correct: false, feedback: 'ควรกด CPR ต่อเนื่องแทนการหยุดรอเฉย ๆ ที่ทำให้เลือดหยุดไหล' },
          { label: 'เปลี่ยนไปทำ synchronized cardioversion แทน', correct: false, feedback: 'ผู้ป่วยยังไม่มีชีพจร ไม่ใช่สถานการณ์สำหรับ cardioversion' },
        ] },
      { situation: 'หัวหน้าทีมสังเกตว่า CCF ของรอบนี้อยู่ที่ 55% ต่ำกว่าเป้าหมาย',
        question: 'สาเหตุที่เป็นไปได้มากที่สุดและวิธีแก้คืออะไร?',
        options: [
          { label: 'Peri-shock pause นานเกินไป — ซ้อมบทบาททีมและชาร์จล่วงหน้า', correct: true, feedback: 'ถูกต้อง — CCF ต่ำในรอบที่มี shock มักมาจาก peri-shock pause นานเกิน แก้ด้วยการซ้อมบทบาททีมและชาร์จล่วงหน้าเพื่อลดช่วงหยุดกด' },
          { label: 'เครื่อง defibrillator เสีย', correct: false, feedback: 'CCF วัดสัดส่วนเวลาที่กดหน้าอกจริงต่อเวลาทั้งหมด ไม่เกี่ยวกับเครื่อง defibrillator เสีย', trap: true },
          { label: 'CCF 55% เป็นค่าที่ดีอยู่แล้ว', correct: false, feedback: 'เป้าหมาย CCF คือมากกว่า 80%; 55% ต่ำเกินไป' },
          { label: 'ไม่มีวิธีปรับปรุง CCF', correct: false, feedback: 'ปรับ CCF ได้ผ่านการเตรียมทีมและชาร์จล่วงหน้าเพื่อลด pause' },
        ] },
    ],
  },
  {
    id: 'df-stage-4', chapterId: 'df-4', stageNumber: 4,
    title: 'Synchronized Cardioversion', subtitle: 'บทที่ 4 · ผู้ป่วย SVT ไม่คงที่',
    emoji: '🔄', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยหญิง 30 ปี ใจสั่น ความดัน 78/50 ซึมลง EKG แสดง narrow complex tachycardia อัตรา 190 ยังคลำชีพจรได้',
        question: 'การรักษาที่เหมาะสมคืออะไร?',
        options: [
          { label: 'Synchronized cardioversion', correct: true, feedback: 'ถูกต้อง — unstable SVT ที่ยังมีชีพจรรักษาด้วย synchronized cardioversion ซึ่งปล่อยไฟให้ตรงกับ R wave หลีกเลี่ยงช่วงเสี่ยง' },
          { label: 'Defibrillation (unsynchronized) ทันที', correct: false, feedback: 'ผู้ป่วยยังมีชีพจร การปล่อยไฟแบบไม่ sync อาจตกช่วง T wave กระตุ้นให้เกิด VF (R-on-T) ต้อง sync กับ R wave ก่อนเสมอ', trap: true },
          { label: 'Transcutaneous pacing', correct: false, feedback: 'Pacing ใช้กับหัวใจเต้นช้า ไม่ใช่เต้นเร็ว' },
          { label: 'ไม่ต้องรักษา รอดูอาการ', correct: false, feedback: 'ผู้ป่วยไม่คงที่ (ความดันต่ำ ซึมลง) ต้องรักษาโดยเร็ว' },
        ] },
      { situation: 'ก่อนกดปุ่ม shock คุณตรวจเครื่องแล้วพบว่ายังไม่ได้เปิดโหมด SYNC',
        question: 'ควรทำอย่างไร?',
        options: [
          { label: 'เปิดโหมด SYNC ก่อนกด shock ทุกครั้ง', correct: true, feedback: 'ถูกต้อง — โหมด SYNC ให้เครื่องปล่อยไฟตรงกับ R wave หลีกเลี่ยงช่วง T wave จึงต้องเปิดก่อนกด shock ทุกครั้ง' },
          { label: 'กด shock ไปได้เลยไม่ต้องรอ', correct: false, feedback: 'ถ้าไม่เปิด SYNC ไฟอาจตกช่วง T wave เกิด R-on-T phenomenon กระตุ้นให้เกิด VF ได้', trap: true },
          { label: 'ไม่จำเป็นต้องมีโหมด sync', correct: false, feedback: 'โหมด sync สำคัญมากสำหรับ cardioversion ในผู้ป่วยที่มีชีพจร' },
          { label: 'เปลี่ยนไปทำ defibrillation แทน', correct: false, feedback: 'ผู้ป่วยยังมีชีพจร ไม่ใช่สถานการณ์ defibrillation' },
        ] },
      { situation: 'Shock ครั้งแรกไม่ได้ผล จังหวะยังเป็น SVT อยู่ ทีมเตรียม shock ครั้งที่ 2',
        question: 'ก่อนกด shock ครั้งที่ 2 ต้องตรวจสอบอะไรเป็นพิเศษ?',
        options: [
          { label: 'ตรวจว่าเปิดโหมด SYNC ใหม่อีกครั้ง เพราะเครื่องมักปิดอัตโนมัติหลัง shock', correct: true, feedback: 'ถูกต้อง — เครื่องส่วนใหญ่ปิดโหมด SYNC อัตโนมัติหลัง shock แต่ละครั้ง จึงต้องเปิดใหม่ก่อนช็อกซ้ำทุกครั้ง' },
          { label: 'ไม่ต้องตรวจอะไรเพิ่ม ใช้การตั้งค่าเดิม', correct: false, feedback: 'เครื่องส่วนใหญ่ปิดโหมด sync อัตโนมัติหลัง shock ถ้าไม่เปิดใหม่ครั้งต่อไปจะกลายเป็น unsync เสี่ยง R-on-T', trap: true },
          { label: 'เปลี่ยนตำแหน่ง pads', correct: false, feedback: 'ไม่จำเป็นต้องเปลี่ยนตำแหน่ง pads ในขั้นนี้' },
          { label: 'ลดพลังงานลงเสมอ', correct: false, feedback: 'ถ้าครั้งแรกไม่ได้ผลมักเพิ่มพลังงานตามลำดับขั้น ไม่ใช่ลด' },
        ] },
    ],
  },
  {
    id: 'df-stage-5', chapterId: 'df-5', stageNumber: 5,
    title: 'Transcutaneous Pacing', subtitle: 'บทที่ 5 · Complete Heart Block',
    emoji: '🫀', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยชาย 70 ปี หน้ามืด ความดันต่ำ EKG แสดง complete heart block อัตราหัวใจ 32 ครั้ง/นาที ให้ atropine แล้วไม่ตอบสนอง',
        question: 'ขั้นตอนถัดไปที่เหมาะสมคือ?',
        options: [
          { label: 'เตรียม transcutaneous pacing', correct: true, feedback: 'ถูกต้อง — bradycardia ไม่คงที่ (ความดันต่ำ หน้ามืด) ที่ไม่ตอบสนองต่อ atropine เป็นข้อบ่งชี้ของ transcutaneous pacing' },
          { label: 'Synchronized cardioversion', correct: false, feedback: 'Cardioversion ใช้กับหัวใจเต้นเร็ว ไม่ใช่ complete heart block ที่เต้นช้า', trap: true },
          { label: 'Defibrillation ทันที', correct: false, feedback: 'ผู้ป่วยมีชีพจร ไม่ใช่สถานการณ์ defibrillation' },
          { label: 'ให้ atropine ซ้ำไปเรื่อย ๆ โดยไม่ทำอะไรเพิ่ม', correct: false, feedback: 'atropine ไม่ได้ผลแล้ว (complete heart block มัก block ใต้ AV node) ควรเริ่ม pacing' },
        ] },
      { situation: 'ติด pacing pads และเริ่มเพิ่มกระแสไฟ (mA) จากต่ำขึ้นไปทีละน้อย',
        question: 'จอ EKG เริ่มเห็น pacing spike ตามด้วย QRS กว้างตรงตามอัตราที่ตั้งไว้ — นี่คือสัญญาณของอะไร และต้องตรวจอะไรเพิ่ม?',
        options: [
          { label: 'Electrical capture — ต้องคลำชีพจรยืนยัน mechanical capture ด้วย', correct: true, feedback: 'ถูกต้อง — spike ตามด้วย QRS กว้างตรงอัตราคือ electrical capture; แต่ยังต้องคลำชีพจรยืนยัน mechanical capture ว่าหัวใจบีบตัวจริง' },
          { label: 'Mechanical capture สมบูรณ์แล้ว ไม่ต้องตรวจเพิ่ม', correct: false, feedback: 'สิ่งที่เห็นบนจอเป็นเพียง electrical capture ยังไม่รู้ว่าหัวใจบีบตัวจริงหรือไม่ ต้องคลำชีพจรยืนยันด้วย', trap: true },
          { label: 'เครื่องทำงานผิดพลาด', correct: false, feedback: 'นี่คือสัญญาณที่ถูกต้องของ electrical capture ไม่ใช่เครื่องผิด' },
          { label: 'ควรหยุด pacing ทันที', correct: false, feedback: 'ควรดำเนินการต่อและยืนยัน mechanical capture ไม่ใช่หยุด' },
        ] },
      { situation: 'คลำชีพจร femoral ได้ตรงกับอัตราที่ตั้งไว้พอดี ผู้ป่วยเริ่มรู้สึกตัวดีขึ้น',
        question: 'สิ่งนี้ยืนยันอะไร?',
        options: [
          { label: 'Mechanical capture สำเร็จ — หัวใจบีบตัวและมีเลือดไหลเวียนจริง', correct: true, feedback: 'ถูกต้อง — คลำชีพจรได้ตรงอัตราที่ตั้งไว้คือหลักฐานว่าหัวใจบีบตัวและมีเลือดไหลเวียนจริง (mechanical capture) สอดคล้องกับอาการที่ดีขึ้น' },
          { label: 'ไม่มีความหมายพิเศษ', correct: false, feedback: 'เป็นสัญญาณสำคัญที่ยืนยัน mechanical capture ต้องบันทึกและติดตามต่อ', trap: true },
          { label: 'เครื่อง pacing ทำงานผิดพลาด', correct: false, feedback: 'ตรงข้าม — นี่คือสัญญาณว่า pacing ได้ผลดี' },
          { label: 'ต้องหยุด pacing ทันทีเพราะอันตราย', correct: false, feedback: 'ควร pacing ต่อและติดตามอาการ ไม่ใช่หยุดทันที' },
        ] },
    ],
  },
  {
    id: 'df-stage-6', chapterId: 'df-6', stageNumber: 6,
    title: 'VF ที่ดื้อต่อการช็อก', subtitle: 'บทที่ 6 · Refractory VF',
    emoji: '🔁', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วย cardiac arrest เป็น VF ช็อกไปแล้ว 3 ครั้ง ให้ epinephrine แล้ว แต่จอยังแสดง VF อยู่',
        question: 'ขั้นตอนสำคัญถัดไปที่ควรทำคืออะไร?',
        options: [
          { label: 'ให้ยา antiarrhythmic (amiodarone หรือ lidocaine) พร้อมคง CPR คุณภาพสูง', correct: true, feedback: 'ถูกต้อง — VF ที่ยังดื้อหลังช็อก + epinephrine เป็นข้อบ่งชี้ของ antiarrhythmic ซึ่งยืด refractory period ให้ช็อกครั้งถัดไปสำเร็จง่ายขึ้น' },
          { label: 'หยุด CPR เพื่อรอดูว่า VF จะหายเอง', correct: false, feedback: 'VF ไม่หายเอง การหยุด CPR ตัดการไหลเวียนไปเลี้ยงหัวใจ ยิ่งลดโอกาสสำเร็จ', trap: true },
          { label: 'ลดพลังงานช็อกลงครึ่งหนึ่ง', correct: false, feedback: 'ควรใช้พลังงานเท่าเดิมหรือเพิ่มขึ้น การลดพลังงานลดโอกาส defibrillate สำเร็จ' },
          { label: 'เปลี่ยนไปทำ synchronized cardioversion', correct: false, feedback: 'ผู้ป่วยไม่มีชีพจร (VF) ต้องช็อกแบบ unsynchronized ไม่ใช่ cardioversion' },
        ] },
      { situation: 'ให้ amiodarone แล้ว ช็อกอีกครั้งยังไม่หาย ทีมทบทวนคุณภาพการกดและตำแหน่ง pad',
        question: 'มาตรการใดที่อาจช่วยใน refractory VF?',
        options: [
          { label: 'ยกระดับคุณภาพ CPR และพิจารณาเปลี่ยนตำแหน่ง pad เป็น anterior-posterior', correct: true, feedback: 'ถูกต้อง — CPR ที่ดีขึ้นและการเปลี่ยนแนวกระแส (AP) อาจทำให้กระแสผ่าน myocardium ต่างออกไปและช็อกสำเร็จ' },
          { label: 'ช็อกถี่ ๆ ติดกันโดยไม่กดหน้าอกคั่น', correct: false, feedback: 'การช็อกโดยไม่กดคั่นทำลาย coronary perfusion ที่สร้างจากการกด ยิ่งลดโอกาสสำเร็จ', trap: true },
          { label: 'ถอด pad ออกเพื่อรีเซ็ตเครื่อง', correct: false, feedback: 'ไม่ช่วยอะไรและทำให้เสียเวลา/หยุดการรักษา' },
          { label: 'หยุดการช่วยชีวิตทันที', correct: false, feedback: 'ยังไม่ถึงเกณฑ์ยุติ ควรดำเนินการต่ออย่างเป็นระบบ' },
        ] },
      { situation: 'ระหว่างนั้นทีมไล่ทบทวนสาเหตุที่แก้ไขได้ควบคู่ไปกับการช่วยชีวิต',
        question: 'สิ่งใดที่ต้องไม่ลืมใน refractory VF/arrest ทุกครั้ง?',
        options: [
          { label: 'ไล่หาและแก้สาเหตุที่แก้ได้ (กลุ่ม H และ T) เช่น hypoxia, โพแทสเซียมผิดปกติ, acidosis', correct: true, feedback: 'ถูกต้อง — arrest ที่ดื้อมักมีสาเหตุเบื้องหลัง การแก้สาเหตุ (เช่นโพแทสเซียมผิดปกติ, hypoxia) เป็นกุญแจให้กลับมาได้' },
          { label: 'มั่นใจว่าไม่มีสาเหตุอื่น ช็อกอย่างเดียวพอ', correct: false, feedback: 'การช็อกอย่างเดียวไม่แก้สาเหตุเบื้องหลัง เช่นโพแทสเซียมสูงหรือ hypoxia ต้องไล่หาและแก้ควบคู่', trap: true },
          { label: 'ให้ epinephrine ถี่ทุก 1 นาที', correct: false, feedback: 'epinephrine ให้ทุก ~3–5 นาที การให้ถี่เกินไม่มีประโยชน์เพิ่มและอาจมีโทษ' },
          { label: 'ยุติการช่วยชีวิตเพราะช็อกหลายครั้งแล้ว', correct: false, feedback: 'จำนวนครั้งที่ช็อกไม่ใช่เกณฑ์ยุติเดี่ยว ๆ ควรพิจารณาปัจจัยรวมและแก้สาเหตุต่อ' },
        ] },
    ],
  },
  {
    id: 'df-stage-7', chapterId: 'df-7', stageNumber: 7,
    title: 'Defibrillation ในเด็ก', subtitle: 'บทที่ 7 · พลังงานตามน้ำหนัก',
    emoji: '🧒', passScore: 80,
    steps: [
      { situation: 'เด็กชายน้ำหนักประมาณ 20 กก. หัวใจหยุดเต้น จอ monitor แสดง VF',
        question: 'ควรตั้งพลังงาน defibrillation ครั้งแรกเท่าไร?',
        options: [
          { label: 'ประมาณ 2 J/kg (≈ 40 J สำหรับเด็ก 20 กก.)', correct: true, feedback: 'ถูกต้อง — เด็กใช้พลังงานตามน้ำหนัก เริ่ม ~2 J/kg เพราะมวลกล้ามเนื้อหัวใจเล็กกว่าผู้ใหญ่' },
          { label: '360 J เท่าผู้ใหญ่', correct: false, feedback: 'มากเกินไปสำหรับเด็ก ควรคำนวณตามน้ำหนัก (~2 J/kg ครั้งแรก)', trap: true },
          { label: '10 J คงที่', correct: false, feedback: 'ต่ำเกินไป ไม่พอ defibrillate ตามน้ำหนักเด็กรายนี้' },
          { label: 'ไม่ต้อง defibrillate เด็ก', correct: false, feedback: 'เด็กที่เป็น VF/pVT ต้อง defibrillate เช่นกัน' },
        ] },
      { situation: 'ช็อก 2 J/kg แล้วยังเป็น VF ต่อ ทีมเตรียมช็อกครั้งถัดไป',
        question: 'ควรปรับพลังงานอย่างไรในครั้งถัดไป?',
        options: [
          { label: 'เพิ่มเป็น ~4 J/kg (เพิ่มขึ้นตามน้ำหนัก ไม่เกินขนาดผู้ใหญ่)', correct: true, feedback: 'ถูกต้อง — เด็กเพิ่มเป็น ~4 J/kg ในครั้งถัด ๆ ไป (อาจถึง ~10 J/kg แต่ไม่เกินขนาดผู้ใหญ่)' },
          { label: 'ลดลงเหลือ 1 J/kg', correct: false, feedback: 'การลดพลังงานลดโอกาสสำเร็จ ควรเพิ่มขึ้นเมื่อครั้งแรกไม่ได้ผล', trap: true },
          { label: 'ใช้ 2 J/kg เท่าเดิมตลอด', correct: false, feedback: 'แนวทางแนะนำให้เพิ่มพลังงานเมื่อครั้งแรกไม่สำเร็จ' },
          { label: 'หยุดช็อกและ CPR', correct: false, feedback: 'ยังเป็น shockable rhythm ต้องช็อกต่อพร้อม CPR คุณภาพสูง' },
        ] },
      { situation: 'พยาบาลหยิบ pad ผู้ใหญ่มา แต่หน้าอกเด็กเล็กจน pad เกือบชนกัน',
        question: 'เรื่อง pad ในเด็กควรคำนึงถึงอะไร?',
        options: [
          { label: 'ใช้ pad ขนาดเหมาะกับเด็ก และวางไม่ให้ pad สองแผ่นสัมผัสกัน (เด็กเล็กอาจใช้ AP)', correct: true, feedback: 'ถูกต้อง — pad ต้องไม่ทับ/สัมผัสกันเพื่อไม่ให้กระแสลัด; เด็กเล็ก/ทารกอาจวาง anterior-posterior' },
          { label: 'วาง pad ผู้ใหญ่สองแผ่นชิดกันบนหน้าอกเล็ก', correct: false, feedback: 'ถ้า pad สัมผัสกันกระแสจะลัดไม่ผ่านหัวใจ ต้องเว้นระยะหรือใช้ AP', trap: true },
          { label: 'ไม่ต้องสนใจขนาด/ตำแหน่ง pad', correct: false, feedback: 'ขนาด/ตำแหน่ง pad มีผลต่อการนำกระแสผ่านหัวใจ โดยเฉพาะในเด็กตัวเล็ก' },
          { label: 'งดช็อกเพราะไม่มี pad เด็ก', correct: false, feedback: 'ถ้าไม่มี pad เด็กจริง ๆ ใช้ pad ผู้ใหญ่แบบวางไม่ให้สัมผัสกัน (เช่น AP) ยังดีกว่างดช็อกใน shockable rhythm' },
        ] },
    ],
  },
];

const engine = createScenarioEngine(stages, {
  progressKeyPrefix: 'df_scenario_progress_',
  finalExamTitle: 'ข้อสอบรวม — ทบทวนทุกเคส Defibrillation',
});

export const scenarios = stages;
export const {
  FINAL_EXAM_ID, buildFinalExam, getStageById, getStageProgress,
  saveStageProgress, isFinalExamUnlocked, getScenarioGameStatus,
} = engine;
