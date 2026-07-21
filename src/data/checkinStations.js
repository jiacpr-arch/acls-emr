// ชุดฐานมาตรฐานต่อ course mode — ปุ่ม "เพิ่มฐานมาตรฐาน" ในหน้าจัดการฐาน
// อาจารย์แก้ชื่อ/ลบ/เพิ่มเองได้ทั้งหมด นี่เป็นแค่จุดเริ่มต้นให้ไม่ต้องพิมพ์เอง
//
// checklistId / checklistOptions / checklistPool เป็นแค่ "คำแนะนำ" เช็คลิสต์
// เริ่มต้นให้ ChecklistGrader จับคู่ตามชื่อฐาน (ดู resolveChecklistForStation) —
// ไม่ได้เก็บลง cohort_stations เลย อาจารย์เปลี่ยน checklist ที่ใช้จริงตอนให้
// คะแนนแต่ละครั้งได้เสมอผ่าน dropdown เต็มรายการ
export const DEFAULT_STATIONS = {
  acls: [
    { name: 'ฐาน 1: Airway & Breathing', kind: 'practice', checklistId: 'airway' },
    { name: 'ฐาน 2: BLS + FBAO Removal', kind: 'practice', checklistId: 'bls2rescuer' },
    { name: 'ฐาน 3: Electrical Therapy + AED', kind: 'practice', checklistId: 'electricalTherapy' },
    { name: 'จุด A: VF/pVT + PEA/Asystole', kind: 'practice', checklistId: 'megacodeCardiacArrest' },
    { name: 'จุด B: Bradycardia + Tachycardia', kind: 'practice', checklistOptions: ['megacodeBradycardia', 'megacodeTachycardia'] },
    { name: 'Megacode จุด A (สอบ)', kind: 'exam', checklistPool: 'megacodeCases' },
    { name: 'Megacode จุด B (สอบ)', kind: 'exam', checklistPool: 'megacodeCases' },
    // ฐานสอบแบบสุ่มข้อสอบ: สแกน QR ปุ๊บระบบสุ่มเคสแล้ว "ล็อก" เคสนั้นกับนักเรียน
    // (บันทึกลง cloud — สแกนซ้ำ/เปิดใหม่/เครื่องอาจารย์อื่นได้โจทย์เดิม)
    // ต่างจากจุด A/B ที่สุ่มใหม่ทุกครั้งที่เปิดใบประเมิน ยังมีปุ่ม "สุ่มใหม่" เผื่อไว้
    // ธนาคารข้อสอบ = เคสจากเกม Code Blue Sim ตัด ACS/Stroke (ตามคำสั่งอาจารย์
    // "โจทย์สอบเหมือนตอนเล่นเกม") — ดู codeBlueExamCases.js
    { name: 'สอบ Megacode (สุ่มข้อสอบ)', kind: 'exam', checklistPool: 'codeBlueGame', poolAssign: 'fixed' },
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

// จับคู่ชื่อฐาน (ที่สร้างจาก DEFAULT_STATIONS) กับคำแนะนำ checklist — คืน null
// ถ้าเป็นฐานที่ตั้งชื่อเอง/เปลี่ยนชื่อแล้วจำไม่ได้ (ผู้ใช้เลือกจาก dropdown เต็ม
// รายการแทนได้เสมอ ไม่ใช่ทางเดียว)
export function resolveChecklistForStation(stationName) {
  const all = [...DEFAULT_STATIONS.acls, ...DEFAULT_STATIONS.bls];
  const match = all.find((s) => s.name === stationName);
  if (!match) return null;
  return {
    checklistId: match.checklistId ?? null,
    checklistOptions: match.checklistOptions ?? null,
    checklistPool: match.checklistPool ?? null,
    // 'fixed' = เคสที่สุ่มได้ถูกล็อกกับนักเรียน (ดู assign_exam_case) —
    // null = สุ่มใหม่ทุกครั้งที่เปิดใบประเมินแบบเดิม
    poolAssign: match.poolAssign ?? null,
  };
}
