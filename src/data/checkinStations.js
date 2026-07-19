// ชุดฐานมาตรฐานต่อ course mode — ปุ่ม "เพิ่มฐานมาตรฐาน" ในหน้าจัดการฐาน
// อาจารย์แก้ชื่อ/ลบ/เพิ่มเองได้ทั้งหมด นี่เป็นแค่จุดเริ่มต้นให้ไม่ต้องพิมพ์เอง
export const DEFAULT_STATIONS = {
  acls: [
    { name: 'ฐาน 1: Airway & Breathing', kind: 'practice' },
    { name: 'ฐาน 2: BLS + FBAO Removal', kind: 'practice' },
    { name: 'ฐาน 3: Electrical Therapy + AED', kind: 'practice' },
    { name: 'จุด A: VF/pVT + PEA/Asystole', kind: 'practice' },
    { name: 'จุด B: Bradycardia + Tachycardia', kind: 'practice' },
    { name: 'Megacode จุด A (สอบ)', kind: 'exam' },
    { name: 'Megacode จุด B (สอบ)', kind: 'exam' },
  ],
  bls: [
    { name: 'ฐาน CPR ผู้ใหญ่', kind: 'practice' },
    { name: 'ฐาน CPR เด็ก/ทารก', kind: 'practice' },
    { name: 'ฐาน AED', kind: 'practice' },
    { name: 'ฐานสอบปฏิบัติ', kind: 'exam' },
  ],
};

export const STATION_KIND_META = {
  practice: { label: 'เช็คชื่อ' },
  exam: { label: 'สอบ' },
};
