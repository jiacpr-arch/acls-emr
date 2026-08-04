// IV/IO decision-game scenarios — one continuous case per stage, built on the
// shared engine in src/courses/shared/scenarioEngine.js. Facts/traps
// paraphrased from the vetted lesson content in ./lessons.js — should still
// be sanity-checked by the course instructor before production use.

import { createScenarioEngine } from '../shared/scenarioEngine';

export const DEFAULT_TIME_LIMIT_SEC = 20;

const stages = [
  {
    id: 'iv-stage-1', chapterId: 'iv-1', stageNumber: 1,
    title: 'Peripheral IV ในภาวะวิกฤต', subtitle: 'บทที่ 1 · ผู้ป่วย trauma เสียเลือด',
    emoji: '💉', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยชายอายุ 28 ปี อุบัติเหตุรถจักรยานยนต์ มีแผลฉีกขาดที่ขา เสียเลือดมาก ความดันเริ่มต่ำ',
        question: 'ควรเลือกขนาดสาย IV เท่าไร?',
        options: [
          { label: '14–16G (large-bore)', correct: true, feedback: 'ถูกต้อง — สายยิ่งใหญ่ (เลขเกจน้อย) ยิ่งให้เลือด/สารน้ำได้เร็วมาก เพราะอัตราไหลแปรผันตามรัศมียกกำลังสี่ ผู้ป่วยเสียเลือดมากจึงเปิดใหญ่ที่สุดเท่าที่ทำได้' },
          { label: '22G เพราะเจ็บน้อยกว่า', correct: false, feedback: '22G เล็กเกินไป อัตราไหลต่ำมาก ให้เลือด/สารน้ำปริมาณมากไม่ทันในภาวะช็อกจากการเสียเลือด', trap: true },
          { label: 'ไม่ต้องเปิด IV เลย', correct: false, feedback: 'ผู้ป่วยเสียเลือดมากต้องการ IV access ด่วนเพื่อทดแทนปริมาตร' },
          { label: 'ใช้เข็มฉีดยาธรรมดาแทนสาย IV', correct: false, feedback: 'ต้องใช้ IV catheter ที่คาไว้ให้สารน้ำต่อเนื่องได้ ไม่ใช่เข็มฉีดยาชั่วคราว' },
        ] },
      { situation: 'คุณเลือก antecubital fossa เป็นตำแหน่งแทง',
        question: 'ทำไมจึงเลือกตำแหน่งนี้เป็นอันดับแรก?',
        options: [
          { label: 'เส้นใหญ่ ใส่ง่าย ให้ยา/สารน้ำไหลเร็ว', correct: true, feedback: 'ถูกต้อง — antecubital fossa เส้นใหญ่ ตำแหน่งชัด แทงง่ายและรองรับอัตราไหลสูง จึงเป็นตัวเลือกแรกในภาวะฉุกเฉิน' },
          { label: 'เพราะใกล้หัวใจที่สุดในร่างกาย', correct: false, feedback: 'ไม่ใช่เหตุผลหลัก เหตุผลคือเส้นใหญ่ อัตราไหลสูง และแทงง่าย ไม่ใช่ระยะทางถึงหัวใจ', trap: true },
          { label: 'เพราะเจ็บน้อยที่สุดเสมอ', correct: false, feedback: 'ความเจ็บไม่ใช่เกณฑ์หลักในการเลือกตำแหน่งในภาวะฉุกเฉิน' },
          { label: 'ไม่มีเหตุผลพิเศษ สุ่มเลือก', correct: false, feedback: 'มีเหตุผลทางคลินิกชัดเจน ไม่ใช่การสุ่มเลือก' },
        ] },
      { situation: '10 นาทีต่อมา บริเวณรอบจุดแทง IV เริ่มบวมและเย็น ขณะให้สารน้ำ',
        question: 'สิ่งนี้บ่งบอกภาวะแทรกซ้อนใด และควรทำอย่างไร?',
        options: [
          { label: 'Infiltration — หยุดให้สารน้ำทางสายนี้และเปิดเส้นใหม่', correct: true, feedback: 'ถูกต้อง — บวมและเย็นขณะให้สารน้ำบ่งว่าสายเลื่อนออกนอกเส้นเลือด สารน้ำรั่วเข้าเนื้อเยื่อ ต้องหยุดสายนี้และเปิดเส้นใหม่' },
          { label: 'ปกติดี ให้สารน้ำต่อไปตามเดิม', correct: false, feedback: 'บวม/เย็นไม่ปกติ เป็น infiltration ที่สารน้ำรั่วเข้าเนื้อเยื่อ ต้องหยุดใช้สายนี้', trap: true },
          { label: 'เพิ่มอัตราการให้สารน้ำให้เร็วขึ้น', correct: false, feedback: 'จะยิ่งดันสารน้ำเข้าเนื้อเยื่อมากขึ้นและบวมมากขึ้น' },
          { label: 'รอดูอาการอีก 30 นาที', correct: false, feedback: 'ควรแก้ไขทันที การรอทำให้เนื้อเยื่อบวมและอาจบาดเจ็บมากขึ้น' },
        ] },
    ],
  },
  {
    id: 'iv-stage-2', chapterId: 'iv-2', stageNumber: 2,
    title: 'IO Access', subtitle: 'บทที่ 2 · เปิด IV ไม่สำเร็จ',
    emoji: '🦴', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วย cardiac arrest ทีมพยายามเปิด peripheral IV มา 90 วินาทีแล้วยังไม่สำเร็จ',
        question: 'ควรทำอย่างไรต่อ?',
        options: [
          { label: 'เปลี่ยนไปใช้ IO ทันที', correct: true, feedback: 'ถูกต้อง — ในภาวะวิกฤตถ้าเปิด IV ไม่ได้ในเวลาสั้น ๆ ให้เปลี่ยนไป IO ทันที เพื่อไม่ให้การให้ยาที่จำเป็นล่าช้า' },
          { label: 'พยายาม IV ต่อไปเรื่อย ๆ', correct: false, feedback: 'การพยายาม IV ต่อเรื่อย ๆ ทำให้ยาที่จำเป็น (เช่น epinephrine) ล่าช้า ควรเปลี่ยนเส้นทางเป็น IO', trap: true },
          { label: 'หยุดให้ยาไปเลย', correct: false, feedback: 'ยังต้องหาทางให้ยาต่อ เพียงแต่เปลี่ยนเส้นทางเป็น IO' },
          { label: 'ให้ยาทาง ETT แทน', correct: false, feedback: 'ปัจจุบันไม่แนะนำ route ทาง ETT แล้ว เพราะดูดซึมคาดเดาไม่ได้' },
        ] },
      { situation: 'คุณเลือกตำแหน่ง proximal tibia และเริ่มใส่เข็ม IO ด้วย driver',
        question: 'สัญญาณใดบ่งบอกว่าเข็มถึงโพรงไขกระดูกแล้ว?',
        options: [
          { label: 'รู้สึก "pop" หรือแรงต้านลดลงกะทันหัน', correct: true, feedback: 'ถูกต้อง — แรงต้านที่ลดลงกะทันหัน (pop) บ่งว่าเข็มทะลุชั้น cortex เข้าสู่โพรงไขกระดูกแล้ว จากนั้นจึงยืนยันว่าเข็มตั้งมั่นและ flush ได้' },
          { label: 'ผู้ป่วยหยุดปวดทันที', correct: false, feedback: 'ผู้ป่วย cardiac arrest ไม่รู้สึกตัว การหยุดปวดจึงไม่ใช่สัญญาณที่เชื่อถือได้', trap: true },
          { label: 'ผิวหนังเปลี่ยนสี', correct: false, feedback: 'สีผิวไม่บ่งบอกตำแหน่งปลายเข็ม IO' },
          { label: 'ไม่มีสัญญาณใดบอกได้', correct: false, feedback: 'มีสัญญาณทางกายภาพชัดเจน คือแรงต้านที่ลดลงกะทันหัน' },
        ] },
      { situation: 'คุณตรวจดูประวัติผู้ป่วยพบว่าเพิ่งใส่ IO ที่ tibia ข้างเดียวกันเมื่อ 12 ชั่วโมงก่อน',
        question: 'ควรทำอย่างไร?',
        options: [
          { label: 'เลี่ยงไปใส่ที่ตำแหน่งอื่นหรือกระดูกอื่น (เช่น proximal humerus หรือ tibia อีกข้าง)', correct: true, feedback: 'ถูกต้อง — ห้ามใส่ IO ซ้ำกระดูกเดิมภายใน 24–48 ชั่วโมง เพราะยา/สารน้ำจะรั่วออกทางรูเจาะเดิมที่ยังไม่ปิด ควรใช้กระดูกอื่น' },
          { label: 'ใส่ที่ตำแหน่งเดิมได้เลยไม่มีปัญหา', correct: false, feedback: 'รูเจาะเดิมยังไม่ปิด ยา/สารน้ำจะรั่วออกและได้ผลไม่เต็มที่ ต้องเลี่ยงไปกระดูกอื่น', trap: true },
          { label: 'ไม่ใส่ IO เลย รอ IV อย่างเดียว', correct: false, feedback: 'ยังมีตำแหน่ง/กระดูกอื่นที่ใช้ได้ ไม่ควรงดเส้นทาง IO ทั้งหมด' },
          { label: 'ใส่ที่ตำแหน่งเดิมแต่ลึกกว่าเดิม', correct: false, feedback: 'ไม่แก้ปัญหารูเจาะเดิมที่ยังเปิดอยู่ ยายังรั่วออกได้' },
        ] },
    ],
  },
  {
    id: 'iv-stage-3', chapterId: 'iv-3', stageNumber: 3,
    title: 'การให้ยาระหว่าง CPR', subtitle: 'บทที่ 3 · ทีมช่วยชีวิตให้ epinephrine',
    emoji: '💊', passScore: 80,
    steps: [
      { situation: 'แพทย์สั่งให้ epinephrine ทาง IV ระหว่างที่ทีมกำลังกดหน้าอกต่อเนื่อง',
        question: 'ควรให้ยาอย่างไร?',
        options: [
          { label: 'ฉีด bolus แล้วตามด้วย flush ทันที โดยไม่หยุดกดหน้าอก', correct: true, feedback: 'ถูกต้อง — การให้ยาไม่ต้องหยุดกดหน้าอก ให้ผู้ช่วยแยกคนฉีด bolus แล้ว flush ทันทีขณะอีกคนกดต่อเนื่อง เพื่อคง CCF' },
          { label: 'หยุดกดหน้าอกก่อนแล้วค่อยฉีดยา', correct: false, feedback: 'การให้ยาต่างจาก rhythm check ไม่จำเป็นต้องหยุดกดหน้าอก การหยุดเพื่อฉีดยาลด CCF โดยไม่จำเป็น', trap: true },
          { label: 'หยดยาช้า ๆ ตลอด 5 นาที', correct: false, feedback: 'ควรให้แบบ bolus เพื่อให้ยาถึงหัวใจเร็ว การหยดช้าออกฤทธิ์ไม่ทันในภาวะหัวใจหยุดเต้น' },
          { label: 'รอให้ CPR จบรอบก่อนจึงให้ยา', correct: false, feedback: 'ควรให้ยาทันทีโดยไม่รบกวนการกดหน้าอก ไม่ต้องรอจบรอบ' },
        ] },
      { situation: 'หลังฉีด epinephrine แล้ว คุณกำลังจะ flush',
        question: 'ควร flush ด้วยอะไรและปริมาณเท่าไร?',
        options: [
          { label: 'Normal saline ประมาณ 20 mL', correct: true, feedback: 'ถูกต้อง — flush ด้วย normal saline ~20 mL ในผู้ใหญ่ ช่วยดันยาจากสาย peripheral เข้าสู่ระบบไหลเวียนกลาง' },
          { label: 'น้ำเปล่า 5 mL', correct: false, feedback: 'ต้องใช้ normal saline ปริมาณมาตรฐาน (~20 mL) ไม่ใช่น้ำเปล่า และ 5 mL น้อยเกินไปที่จะดันยาเข้าระบบกลาง', trap: true },
          { label: 'ไม่ต้อง flush เลย', correct: false, feedback: 'ถ้าไม่ flush ยาจะค้างในสาย ไม่ถึงระบบไหลเวียนกลาง การ flush จึงจำเป็นเสมอ' },
          { label: 'เลือด 20 mL', correct: false, feedback: 'ใช้ normal saline ในการ flush ยา ไม่ใช่เลือด' },
        ] },
      { situation: 'พยาบาลอีกคนเสนอให้ยกแขนข้างที่ให้ยาขึ้นหลัง flush',
        question: 'ควรทำตามหรือไม่ และทำไม?',
        options: [
          { label: 'ควรทำ — ยกแขนสูงกว่าหัวใจ 10–20 วินาที ช่วยให้ยาไหลเข้าระบบไหลเวียนกลางเร็วขึ้น', correct: true, feedback: 'ถูกต้อง — ยกแขนข้างที่ให้ยาสูงกว่าหัวใจ 10–20 วินาที ใช้แรงโน้มถ่วงช่วยพายาเข้าสู่ระบบไหลเวียนกลางเร็วขึ้น (เฉพาะ peripheral IV ที่แขน)' },
          { label: 'ไม่ควร ไม่มีประโยชน์ใด', correct: false, feedback: 'การยกแขนช่วยด้วยแรงโน้มถ่วงจริงและมีหลักฐานสนับสนุน ไม่ใช่ไร้ประโยชน์', trap: true },
          { label: 'ควรยกขาแทนแขน', correct: false, feedback: 'ต้องยกแขนข้างที่ให้ยา ไม่ใช่ขา เพราะยาเข้าทางเส้นที่แขน' },
          { label: 'ต้องยกแขนค้างไว้ตลอดการช่วยชีวิต', correct: false, feedback: 'ยกเพียง 10–20 วินาทีหลัง flush ก็พอ ไม่ต้องค้างไว้ตลอด' },
        ] },
    ],
  },
  {
    id: 'iv-stage-4', chapterId: 'iv-4', stageNumber: 4,
    title: 'Route ที่ให้ยาได้', subtitle: 'บทที่ 4 · เลือก route ให้ถูกต้อง',
    emoji: '🧪', passScore: 80,
    steps: [
      { situation: 'ทีมกำลังถกเถียงว่าจะให้ epinephrine ทาง IO ได้หรือไม่ เพราะเพิ่งใส่ IO แทน IV ที่ไม่สำเร็จ',
        question: 'คำตอบที่ถูกต้องคือ?',
        options: [
          { label: 'ให้ได้ — ยาที่ให้ IV ได้เกือบทั้งหมดให้ IO ได้เช่นกัน', correct: true, feedback: 'ถูกต้อง — IO เข้าสู่โพรงไขกระดูกที่ต่อกับระบบไหลเวียนกลางโดยตรง ยาที่ให้ IV ได้เกือบทั้งหมดจึงให้ IO ได้และดูดซึมใกล้เคียงกัน' },
          { label: 'ให้ไม่ได้ ต้องรอ IV เท่านั้น', correct: false, feedback: 'IO เป็นเส้นทางที่ให้ยาได้เทียบเท่า IV ในสถานการณ์ฉุกเฉิน ไม่ต้องรอ IV', trap: true },
          { label: 'ให้ได้เฉพาะยาแก้ปวดเท่านั้น', correct: false, feedback: 'IO ให้ยาที่ใช้ระหว่าง CPR ได้เกือบทุกชนิด ไม่จำกัดแค่ยาแก้ปวด' },
          { label: 'ต้องลดขนาดยาลงครึ่งหนึ่งเมื่อให้ทาง IO', correct: false, feedback: 'โดยทั่วไปใช้ขนาดเดียวกับ IV ตามคำสั่งแพทย์ ไม่ต้องลดครึ่ง' },
        ] },
      { situation: 'สมาชิกทีมใหม่เสนอให้ยาผ่านท่อ ETT ที่ใส่ไว้แล้ว เพราะเคยเรียนมาแบบนั้น',
        question: 'ควรตอบสนองอย่างไร?',
        options: [
          { label: 'อธิบายว่าปัจจุบันไม่แนะนำ route ทาง ETT แล้ว เพราะดูดซึมคาดเดาไม่ได้', correct: true, feedback: 'ถูกต้อง — แนวทางปัจจุบันไม่แนะนำ route ทาง ETT เพราะการดูดซึมผ่านปอดคาดเดาไม่ได้ ควรใช้ IV/IO เป็นหลักเสมอ' },
          { label: 'เห็นด้วยและให้ยาทาง ETT ทันที', correct: false, feedback: 'แนวทางปัจจุบันไม่แนะนำการให้ยาทาง ETT แล้ว เพราะระดับยาในเลือดคาดเดาไม่ได้', trap: true },
          { label: 'ไม่ตอบอะไร ปล่อยให้ทำไปตามที่เสนอ', correct: false, feedback: 'ควรแก้ไขให้ถูกต้องเพื่อความปลอดภัยผู้ป่วย ไม่ปล่อยให้ทำผิดแนวทาง' },
          { label: 'บอกว่า ETT ให้ยาไม่ได้เลยทุกกรณี', correct: false, feedback: 'ในอดีตทำได้แต่ปัจจุบันไม่แนะนำเพราะผลไม่แน่นอน ไม่ใช่ว่าทำไม่ได้เลยทางเทคนิค' },
        ] },
      { situation: 'ผู้ป่วยอีกรายในห้องฉุกเฉินมีปฏิกิริยาแพ้รุนแรง (anaphylaxis) แต่ยังไม่มี IV',
        question: 'เส้นทางใดเหมาะกับการให้ epinephrine เร่งด่วนในบริบทนี้ (ไม่ใช่ cardiac arrest)?',
        options: [
          { label: 'Intramuscular (IM) เป็นทางเลือกที่เหมาะสมสำหรับ anaphylaxis', correct: true, feedback: 'ถูกต้อง — anaphylaxis ที่ยังไม่มี IV ให้ epinephrine IM ที่ต้นขาด้านนอกได้ทันที ดูดซึมเร็วพอและไม่เสียเวลารอเปิดเส้น (ต่างจาก cardiac arrest ที่ใช้ IV/IO)' },
          { label: 'Oral เท่านั้น', correct: false, feedback: 'ยากินดูดซึมช้าเกินไปสำหรับ anaphylaxis ที่ต้องออกฤทธิ์ภายในไม่กี่นาที', trap: true },
          { label: 'ต้องรอเปิด IV ก่อนเท่านั้น ห้ามใช้ทางอื่น', correct: false, feedback: 'IM epinephrine เป็นการรักษาแรกของ anaphylaxis ให้ได้ทันทีโดยไม่ต้องรอ IV' },
          { label: 'ไม่มีทางเลือกใดที่เหมาะสม', correct: false, feedback: 'IM เป็นทางเลือกมาตรฐานและเหมาะสมสำหรับ anaphylaxis' },
        ] },
    ],
  },
  {
    id: 'iv-stage-5', chapterId: 'iv-5', stageNumber: 5,
    title: 'สารน้ำและ Hypovolemic Shock', subtitle: 'บทที่ 5 · ผู้ป่วยเลือดออกในทางเดินอาหาร',
    emoji: '🩸', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยหญิง 55 ปี อาเจียนเป็นเลือดปริมาณมาก ความดัน 78/50 ชีพจรเบาเร็ว 128/min ทีมเพิ่งเปิด IV 16G สำเร็จที่แขนซ้าย',
        question: 'ควรเริ่มให้สารน้ำชนิดใดก่อนระหว่างรอเลือด?',
        options: [
          { label: 'Balanced crystalloid (เช่น Lactated Ringer\'s) หรือ Normal saline', correct: true, feedback: 'ถูกต้อง — crystalloid เป็นสารน้ำ isotonic ที่ให้ได้ทันทีเพื่อพยุงปริมาตรระหว่างเตรียม blood products' },
          { label: 'น้ำเปล่าทาง IV', correct: false, feedback: 'น้ำเปล่าไม่ isotonic เมื่อเข้าเส้นเลือดจะทำให้เม็ดเลือดแดงแตก (hemolysis) ห้ามให้ทาง IV', trap: true },
          { label: 'สารน้ำที่มีน้ำตาลเข้มข้นสูง (D50)', correct: false, feedback: 'D50 ใช้แก้ภาวะน้ำตาลต่ำ ไม่ใช่สารน้ำสำหรับ resuscitation ปริมาตร' },
          { label: 'ไม่ต้องให้สารน้ำใด ๆ รอเลือดอย่างเดียว', correct: false, feedback: 'ควรเริ่ม crystalloid ทันทีระหว่างรอเลือด ไม่ควรปล่อยให้ช็อกแย่ลง' },
        ] },
      { situation: 'ให้ crystalloid ไปแล้ว 1 ลิตร ความดันยังต่ำอยู่ที่ 82/55 ทีมกำลังพิจารณาเปิดสายเพิ่ม',
        question: 'ทำไมจึงควรเปิดสาย IV ขนาดใหญ่เส้นที่สอง แทนที่จะเร่งอัตราไหลของเส้นเดิมอย่างเดียว?',
        options: [
          { label: 'สองสายให้อัตราการไหลรวมสูงกว่าสายเดียว และสำรองเส้นทางไว้กรณีสายแรกมีปัญหา', correct: true, feedback: 'ถูกต้อง — สองสายใหญ่ให้อัตราไหลรวมสูงกว่าสายเดียว และมีเส้นสำรองไว้กรณีสายแรกมีปัญหา จำเป็นในเลือดออกรุนแรง' },
          { label: 'ไม่มีประโยชน์ สายเดียวก็เพียงพอเสมอ', correct: false, feedback: 'ในเลือดออกรุนแรง สายเดียวอาจให้สารน้ำ/เลือดได้ไม่เร็วพอ การเปิดเส้นที่สองเพิ่มอัตราไหลรวม', trap: true },
          { label: 'เพื่อให้ผู้ป่วยเจ็บมากขึ้นโดยเจตนา', correct: false, feedback: 'ไม่ใช่เหตุผลทางคลินิก' },
          { label: 'เพราะสายเดิมต้องถอดออกเสมอหลังใช้ 1 ลิตร', correct: false, feedback: 'ไม่มีกฎเช่นนี้ สายเดิมยังใช้ต่อได้ถ้าทำงานปกติ' },
        ] },
      { situation: 'ผลตรวจยืนยันเลือดออกในทางเดินอาหารส่วนบนรุนแรง เลือดที่จองไว้มาถึงห้องฉุกเฉินแล้ว',
        question: 'เมื่อเลือดออกรุนแรงเช่นนี้ ควรให้ความสำคัญกับอะไรมากกว่าการให้ crystalloid ปริมาณมากต่อไปเรื่อย ๆ?',
        options: [
          { label: 'ให้เลือด/ส่วนประกอบของเลือดโดยเร็ว แทนการทุ่ม crystalloid ปริมาณมาก', correct: true, feedback: 'ถูกต้อง — hemorrhagic shock ต้องการเลือดทดแทนสิ่งที่เสียไป; การทุ่ม crystalloid มากเกินจะเจือจางเม็ดเลือดแดง (ลดการนำออกซิเจน) และปัจจัยการแข็งตัวของเลือด' },
          { label: 'ให้ crystalloid ปริมาณมากต่อไปโดยไม่ต้องให้เลือดเลย', correct: false, feedback: 'crystalloid ปริมาณมากเกินไปเจือจางเลือดและปัจจัยการแข็งตัว และไม่ทดแทนความสามารถในการนำออกซิเจน ต้องให้เลือด', trap: true },
          { label: 'หยุดให้สารน้ำทั้งหมดทันที', correct: false, feedback: 'ยังต้องรักษาการไหลเวียนต่อเนื่อง เพียงแต่เปลี่ยนมาเน้นเลือด' },
          { label: 'รอผลตรวจเพิ่มเติมก่อนโดยไม่ให้อะไรเลย', correct: false, feedback: 'ควรให้เลือดทันทีเมื่อพร้อม ไม่ควรรอโดยไม่จำเป็น' },
        ] },
    ],
  },
  {
    id: 'iv-stage-6', chapterId: 'iv-6', stageNumber: 6,
    title: 'Vasopressor รั่วจากเส้นส่วนปลาย', subtitle: 'บทที่ 6 · Extravasation',
    emoji: '🧯', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วยช็อกได้ norepinephrine ทาง peripheral IV ที่หลังมือ พยาบาลสังเกตว่ารอบจุดแทงเริ่มซีดขาวและบวม ผู้ป่วยบ่นปวด',
        question: 'สิ่งแรกที่ควรทำคืออะไร?',
        options: [
          { label: 'หยุดการให้ยาทางสายนั้นทันที แต่คาเข็มไว้ก่อนเพื่อพยายามดูดยาที่รั่วออก', correct: true, feedback: 'ถูกต้อง — extravasation ของ vasopressor เสี่ยงเนื้อตาย ต้องหยุดยาทันที และคาเข็มไว้ดูดสารที่ค้างออกก่อนถอด' },
          { label: 'ปรับเพิ่มอัตราการให้ยาเพื่อดันให้เข้าเส้น', correct: false, feedback: 'ยิ่งดันยา vasopressor เข้าเนื้อเยื่อมากขึ้น ยิ่งเสี่ยงเนื้อตายรุนแรง', trap: true },
          { label: 'ถอดเข็มออกทันทีแล้วกดแรง ๆ', correct: false, feedback: 'ควรพยายามดูดยาที่รั่วออกก่อนถอด และไม่กดแรงจนยากระจายในเนื้อเยื่อ' },
          { label: 'ไม่ต้องทำอะไร รอดูอาการ', correct: false, feedback: 'extravasation ของ vasopressor เป็นภาวะเร่งด่วน ปล่อยไว้เสี่ยงเนื้อตาย' },
        ] },
      { situation: 'หยุดยาและดูดออกแล้ว ทีมประเมินการดูแลบริเวณที่รั่วต่อ',
        question: 'การดูแลต่อที่เหมาะสมคืออะไร?',
        options: [
          { label: 'ยกแขนสูง เฝ้าดูผิวหนัง และพิจารณา antidote (เช่น phentolamine) ตาม protocol', correct: true, feedback: 'ถูกต้อง — การยกแขน เฝ้าติดตาม และให้ antidote ตามแนวทางช่วยลดความเสียหายของเนื้อเยื่อจาก vasopressor' },
          { label: 'ประคบร้อนจัดและนวดแรง ๆ บริเวณที่รั่ว', correct: false, feedback: 'การนวดแรงทำให้ยากระจายและบาดเจ็บมากขึ้น ควรทำตาม protocol ของยานั้น ๆ', trap: true },
          { label: 'ให้ norepinephrine ซ้ำทางเส้นเดิมทันที', correct: false, feedback: 'เส้นเดิมมีปัญหา ต้องเปิดเส้นใหม่ (ควรเป็น central สำหรับ vasopressor) ไม่ใช้เส้นที่รั่ว' },
          { label: 'เพิกเฉยเพราะยาหยุดแล้ว', correct: false, feedback: 'ยาที่รั่วไปแล้วยังทำอันตรายต่อเนื้อเยื่อ ต้องดูแลและติดตามต่อ' },
        ] },
      { situation: 'ผู้ป่วยยังต้องการ vasopressor ต่อเนื่องเพื่อพยุงความดัน',
        question: 'เส้นทางที่เหมาะสมสำหรับให้ vasopressor ต่อเนื่องคืออะไร?',
        options: [
          { label: 'เปิด central line เมื่อทำได้ เพราะเจือจางยาในเลือดไหลเร็ว ลดเสี่ยง extravasation', correct: true, feedback: 'ถูกต้อง — vasopressor เข้มข้นควรให้ทาง central line เมื่อเป็นไปได้ ส่วนปลาย/IO ใช้ชั่วคราวโดยเฝ้าจุดแทงใกล้ชิด' },
          { label: 'ให้ทางเส้นส่วนปลายเล็ก ๆ ที่หลังมืออีกข้างต่อไปเรื่อย ๆ', correct: false, feedback: 'เส้นส่วนปลายเล็กเสี่ยง extravasation ซ้ำ ควรใช้ central line สำหรับ vasopressor ต่อเนื่อง', trap: true },
          { label: 'หยุด vasopressor ทั้งหมดถาวร', correct: false, feedback: 'ผู้ป่วยยังช็อกและต้องการยาพยุงความดัน การหยุดถาวรอันตราย' },
          { label: 'ให้ vasopressor ทางปากแทน', correct: false, feedback: 'vasopressor ไม่ให้ทางปาก ต้องให้ทางหลอดเลือด' },
        ] },
    ],
  },
  {
    id: 'iv-stage-7', chapterId: 'iv-7', stageNumber: 7,
    title: 'เปิดเส้นไม่ได้ในผู้ป่วยรู้สึกตัว', subtitle: 'บทที่ 7 · IO ในผู้ป่วยตื่น',
    emoji: '🦵', passScore: 80,
    steps: [
      { situation: 'ผู้ป่วย sepsis รุนแรง ความดันต่ำ ยังรู้สึกตัว แต่แทง IV หลายครั้งไม่สำเร็จ (เส้นแฟบ) ต้องให้สารน้ำ/ยาด่วน',
        question: 'ทางเลือกที่เหมาะสมคืออะไร?',
        options: [
          { label: 'เปิด IO เพราะเชื่อถือได้แม้เส้นส่วนปลายแฟบจากช็อก', correct: true, feedback: 'ถูกต้อง — โพรงไขกระดูกไม่ยุบตัวตามภาวะช็อก IO จึงเปิดได้เร็วและเชื่อถือได้เมื่อ IV ล้มเหลว' },
          { label: 'พยายามแทง IV ที่เดิมซ้ำไปเรื่อย ๆ จนกว่าจะได้', correct: false, feedback: 'เส้นแฟบจากช็อกทำให้ IV ยาก การแทงซ้ำเสียเวลาให้การรักษาที่จำเป็น ควรเปลี่ยนไป IO', trap: true },
          { label: 'ให้สารน้ำทางปาก', correct: false, feedback: 'ผู้ป่วยช็อกรุนแรงต้องการสารน้ำเข้าหลอดเลือดเร็ว ทางปากช้าเกินและเสี่ยงสำลัก' },
          { label: 'รอเปิด central line อย่างเดียวโดยไม่ทำ IO', correct: false, feedback: 'central line ใช้เวลานาน IO เร็วกว่าและเหมาะเป็นสะพานระหว่างรอ' },
        ] },
      { situation: 'คุณใส่ IO ที่ proximal tibia สำเร็จ แต่ผู้ป่วยรู้สึกตัวและจะเจ็บมากตอนให้สารน้ำ',
        question: 'ควรทำอย่างไรก่อน flush/ให้สารน้ำ?',
        options: [
          { label: 'ให้ lidocaine (ชนิดเหมาะสม) ทาง IO ช้า ๆ ก่อนเพื่อลดปวด', correct: true, feedback: 'ถูกต้อง — การให้สารน้ำเข้าโพรงไขกระดูกเจ็บมากในผู้ที่รู้สึกตัว lidocaine ทาง IO ช่วยลดปวดได้ชัดก่อน flush' },
          { label: 'flush เร็ว ๆ แรง ๆ ให้จบไปโดยไม่สนใจความเจ็บ', correct: false, feedback: 'การ flush แรงโดยไม่ลดปวดทำให้ผู้ป่วยทรมานและอาจดิ้นจน IO เลื่อน ควรให้ lidocaine ก่อน', trap: true },
          { label: 'ถอด IO ออกเพราะผู้ป่วยเจ็บ', correct: false, feedback: 'IO ยังจำเป็น การถอดทำให้เสียเส้นทางที่ได้มายาก ควรจัดการความปวดแทน' },
          { label: 'ให้ยาแก้ปวดทางปากแล้วรอ 30 นาที', correct: false, feedback: 'ช้าเกินไปสำหรับภาวะช็อก และผู้ป่วยต้องการสารน้ำด่วน' },
        ] },
      { situation: 'ระหว่างให้สารน้ำ คุณเฝ้าติดตามตำแหน่งเข็ม IO ที่น่อง',
        question: 'สัญญาณใดบ่งว่า IO อาจหลุดออกนอกโพรงและต้องหยุด?',
        options: [
          { label: 'บริเวณน่องบวมตึงขึ้น flush ฝืด และสารน้ำไหลไม่ดี', correct: true, feedback: 'ถูกต้อง — บวม/flush ฝืดบ่งว่าเข็มไม่อยู่ในโพรง (extravasation) เสี่ยง compartment syndrome ต้องหยุดและหาทางใหม่' },
          { label: 'ผู้ป่วยบ่นเจ็บตอน flush เท่านั้น', correct: false, feedback: 'ความเจ็บตอน flush พบได้ปกติในผู้ที่รู้สึกตัว ไม่ใช่สัญญาณหลุดเสมอ ต่างจากการบวม/ไหลไม่ดี', trap: true },
          { label: 'สารน้ำไหลได้ดีและไม่บวม', correct: false, feedback: 'นั่นคือสัญญาณว่า IO อยู่ในโพรงดี ไม่ใช่สัญญาณให้หยุด' },
          { label: 'เข็มตั้งมั่นไม่โยก', correct: false, feedback: 'เข็มมั่นคงเป็นสัญญาณที่ดี ไม่ใช่เหตุให้หยุด' },
        ] },
    ],
  },
];

const engine = createScenarioEngine(stages, {
  progressKeyPrefix: 'iv_scenario_progress_',
  finalExamTitle: 'ข้อสอบรวม — ทบทวนทุกเคส IV/IO',
});

export const scenarios = stages;
export const {
  FINAL_EXAM_ID, buildFinalExam, getStageById, getStageProgress,
  saveStageProgress, isFinalExamUnlocked, getScenarioGameStatus,
} = engine;
