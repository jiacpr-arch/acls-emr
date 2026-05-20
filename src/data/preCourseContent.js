// Pre-course lessons — read first, then quiz.
// To add a new lesson, append an object below with a unique `id` and at least one quiz question.

export const preCourseLessons = [
  {
    id: 'pc1',
    title: 'บทที่ 1: ภาพรวม ALS และ Chain of Survival',
    description: 'พื้นฐาน ALS, ห่วงโซ่แห่งการรอดชีวิต และบทบาทในทีม',
    estMinutes: 10,
    passingScore: 70,
    sections: [
      {
        heading: 'ALS คืออะไร',
        body: 'Advanced Life Support (ALS) คือระบบการช่วยชีวิตขั้นสูง ครอบคลุมการจัดการทางเดินหายใจ, การให้ยา, การอ่านจังหวะหัวใจ และการ defibrillation โดยทีมแพทย์และพยาบาลที่ผ่านการฝึกอบรม',
      },
      {
        heading: 'Chain of Survival',
        body: 'ห่วงโซ่แห่งการรอดชีวิต: 1) รู้เร็ว-โทรเร็ว 2) CPR เร็ว 3) Defibrillation เร็ว 4) ALS เร็ว 5) ดูแลหลังกู้ชีพ — ทุกห่วงสำคัญเท่ากัน ขาดห่วงใดผลลัพธ์จะแย่ลงอย่างมาก',
      },
      {
        heading: 'ทีม ALS',
        body: 'ประกอบด้วย: Team Leader (สั่งการ), Airway (ดูแลทางหายใจ), Compressor (กดหน้าอก), Drug Admin (ให้ยา), Recorder (จดบันทึก) — การสื่อสารแบบ closed-loop สำคัญมาก: ผู้สั่งสั่งชัด ผู้รับทวนคำสั่ง ทำเสร็จแล้วรายงานกลับ',
      },
      {
        heading: 'CPR คุณภาพสูง',
        body: 'กดลึก 5-6 cm, อัตรา 100-120 ครั้ง/นาที, ปล่อยให้หน้าอกคืนตัวเต็มที่ (full recoil), หยุดการกดน้อยที่สุด (Chest Compression Fraction > 80%), สลับคนกดทุก 2 นาที เพื่อรักษาคุณภาพ',
      },
    ],
    quiz: [
      {
        id: 'pc1-q1',
        question: 'ในห่วงโซ่แห่งการรอดชีวิต (Chain of Survival) ข้อใดมาก่อน Defibrillation?',
        choices: [
          { id: 'a', text: 'การดูแลหลังกู้ชีพ (Post-arrest care)' },
          { id: 'b', text: 'CPR เร็ว' },
          { id: 'c', text: 'ALS เร็ว' },
          { id: 'd', text: 'การส่งต่อโรงพยาบาลเฉพาะทาง' },
        ],
        correctId: 'b',
        explanation: 'ลำดับห่วงโซ่: รู้เร็ว/โทรเร็ว → CPR เร็ว → Defibrillation เร็ว → ALS เร็ว → ดูแลหลังกู้ชีพ',
      },
      {
        id: 'pc1-q2',
        question: 'อัตราการกดหน้าอก (chest compression rate) ที่แนะนำสำหรับผู้ใหญ่ในการทำ CPR คุณภาพสูงคือเท่าใด?',
        choices: [
          { id: 'a', text: '60-80 ครั้ง/นาที' },
          { id: 'b', text: '80-100 ครั้ง/นาที' },
          { id: 'c', text: '100-120 ครั้ง/นาที' },
          { id: 'd', text: '120-150 ครั้ง/นาที' },
        ],
        correctId: 'c',
        explanation: 'อัตราที่แนะนำคือ 100-120 ครั้ง/นาที กดลึก 5-6 cm และปล่อยให้หน้าอกคืนตัวเต็มที่',
      },
      {
        id: 'pc1-q3',
        question: 'การสื่อสารแบบ closed-loop ในทีม ALS หมายถึงข้อใด?',
        choices: [
          { id: 'a', text: 'ผู้สั่งสั่งแล้วผู้รับทำเลย ไม่ต้องตอบกลับ' },
          { id: 'b', text: 'ผู้รับทวนคำสั่งและรายงานเมื่อทำเสร็จ' },
          { id: 'c', text: 'ทุกคนในทีมสามารถสั่งงานได้พร้อมกัน' },
          { id: 'd', text: 'การประชุมทีมก่อนเริ่มเคส' },
        ],
        correctId: 'b',
        explanation: 'closed-loop คือ ผู้สั่ง→ผู้รับทวนคำสั่ง→ทำ→รายงานกลับ เพื่อให้แน่ใจว่าคำสั่งถูกเข้าใจและดำเนินการครบถ้วน',
      },
      {
        id: 'pc1-q4',
        question: 'ควรสลับคนกดหน้าอก (rotate compressor) ทุกกี่นาที?',
        choices: [
          { id: 'a', text: '1 นาที' },
          { id: 'b', text: '2 นาที' },
          { id: 'c', text: '5 นาที' },
          { id: 'd', text: 'เมื่อคนกดเหนื่อยเท่านั้น' },
        ],
        correctId: 'b',
        explanation: 'สลับทุก 2 นาที (ตรงกับช่วงเช็ค rhythm) เพื่อรักษาคุณภาพการกด ก่อนที่คนกดจะล้าจนคุณภาพลดลง',
      },
      {
        id: 'pc1-q5',
        question: 'Chest Compression Fraction (CCF) คุณภาพสูงควรมีค่าอย่างน้อยเท่าใด?',
        choices: [
          { id: 'a', text: '> 50%' },
          { id: 'b', text: '> 60%' },
          { id: 'c', text: '> 80%' },
          { id: 'd', text: '> 95%' },
        ],
        correctId: 'c',
        explanation: 'CCF > 80% หมายถึงเวลาที่กดหน้าอกจริงคิดเป็นมากกว่า 80% ของเวลาทั้งหมด — หยุดน้อยที่สุดเท่าที่จำเป็น',
      },
    ],
  },
];

export function findLessonById(id) {
  return preCourseLessons.find(l => l.id === id) || null;
}
