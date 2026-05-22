// BLS-HCP Post-test set B — placeholder
// TODO (PR3): เติมให้ครบ 25 ข้อ

export const setB = {
  id: 'bls-set-b',
  title: 'ชุด B',
  questions: [
    {
      id: 'bls-b-1',
      topic: 'high-quality-cpr',
      question: 'ความลึกในการกดหน้าอกในผู้ใหญ่ที่เหมาะสมคือ?',
      choices: [
        { id: 'a', text: '2–3 ซม.' },
        { id: 'b', text: '3–4 ซม.' },
        { id: 'c', text: '5–6 ซม.' },
        { id: 'd', text: 'มากกว่า 7 ซม.' },
      ],
      correctId: 'c',
      explanation: '5–6 ซม. หรืออย่างน้อย 1/3 ของ AP diameter',
    },
    {
      id: 'bls-b-2',
      topic: 'team-dynamics',
      question: 'ในการทำ 2-rescuer CPR สำหรับผู้ใหญ่ที่ใส่ advanced airway แล้ว ควร ventilate อย่างไร?',
      choices: [
        { id: 'a', text: '30:2 ตามปกติ' },
        { id: 'b', text: '1 ครั้งทุก 6 วินาที (10 ครั้ง/นาที)' },
        { id: 'c', text: '1 ครั้งทุก 3 วินาที' },
        { id: 'd', text: 'ไม่ต้อง ventilate' },
      ],
      correctId: 'b',
      explanation: 'หลังใส่ advanced airway: continuous compressions + 1 breath ทุก 6 วินาที (10/min)',
    },
    {
      id: 'bls-b-3',
      topic: 'opioid',
      question: 'ขนาด naloxone IM/IN สำหรับ opioid emergency คือเท่าไร?',
      choices: [
        { id: 'a', text: '0.1 mg' },
        { id: 'b', text: '0.4–2 mg' },
        { id: 'c', text: '5 mg' },
        { id: 'd', text: '10 mg' },
      ],
      correctId: 'b',
      explanation: 'Naloxone 0.4–2 mg IM/IN ทุก 4 นาที จนกว่าจะตอบสนอง',
    },
  ],
};
