// BLS-HCP Post-test set A — placeholder ตัวอย่าง 3 ข้อ
// TODO (PR3): เติมให้ครบ 25 ข้อ ครอบคลุม high-quality CPR, AED, peds, infant, choking, opioid, team dynamics
// ต้องผ่าน medical review

export const setA = {
  id: 'bls-set-a',
  title: 'ชุด A',
  questions: [
    {
      id: 'bls-a-1',
      topic: 'high-quality-cpr',
      question: 'อัตราการกดหน้าอกในผู้ใหญ่ตาม AHA 2020 คือเท่าไร?',
      choices: [
        { id: 'a', text: '60–80 ครั้ง/นาที' },
        { id: 'b', text: '80–100 ครั้ง/นาที' },
        { id: 'c', text: '100–120 ครั้ง/นาที' },
        { id: 'd', text: 'มากกว่า 120 ครั้ง/นาที' },
      ],
      correctId: 'c',
      explanation: '100–120 ครั้ง/นาที',
    },
    {
      id: 'bls-a-2',
      topic: 'aed',
      question: 'ใช้ AED ในเด็กอายุน้อยกว่า 8 ปี ควรใช้อะไร?',
      choices: [
        { id: 'a', text: 'ใช้ pads ผู้ใหญ่ตามปกติ' },
        { id: 'b', text: 'ใช้ pads เด็ก หรือ pediatric dose attenuator ถ้ามี' },
        { id: 'c', text: 'ห้ามใช้ AED ในเด็กทุกกรณี' },
        { id: 'd', text: 'ใช้ pads ผู้ใหญ่แต่ลดพลังงานครึ่งหนึ่ง' },
      ],
      correctId: 'b',
      explanation: 'เด็ก < 8 ปี ใช้ pediatric pads / dose attenuator ถ้าไม่มีให้ใช้ผู้ใหญ่ได้',
    },
    {
      id: 'bls-a-3',
      topic: 'choking',
      question: 'ทารก (< 1 ปี) ที่สำลักสิ่งแปลกปลอม รู้สึกตัว ควรช่วยเหลืออย่างไร?',
      choices: [
        { id: 'a', text: 'Abdominal thrust 5 ครั้ง' },
        { id: 'b', text: 'Back blows 5 ครั้ง สลับ chest thrusts 5 ครั้ง' },
        { id: 'c', text: 'เริ่ม CPR ทันที' },
        { id: 'd', text: 'พลิกตัวคว่ำหน้าให้แรง' },
      ],
      correctId: 'b',
      explanation: 'ทารกใช้ back blows 5 ครั้ง + chest thrusts 5 ครั้ง (ห้าม abdominal thrust ในทารก)',
    },
  ],
};
