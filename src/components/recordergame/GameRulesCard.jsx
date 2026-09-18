// ==========================================
// Recorder Hero — การ์ดกติกา (ใช้ร่วมกันทุกทางเข้า: แคมเปญ/Case Pack/Endless)
// แยกออกมาจาก LevelIntro เพื่อให้ Pack/Endless ที่มีหน้า intro เป็นของตัวเอง
// โชว์กติกาก่อนเริ่มได้เหมือนกัน
// ==========================================
const TYPE_RULES = {
  hunt: [
    'หาปุ่มที่โจทย์บอกให้เจอ แล้วกดให้ทันเวลา',
    'หาไม่เจอ/กดผิด 2 ครั้ง = ระบบจะไฮไลต์ให้ (นับเป็นข้อผิดพลาด "หาปุ่มไม่เจอ")',
    'ยิ่งกดเร็ว ยิ่งได้คะแนนเยอะ',
  ],
  live: [
    'เหตุการณ์เล่นตามเวลาจริง — กดปุ่มบันทึกให้ตรงจังหวะ',
    'เร็ว = Perfect, ช้าหน่อย = ดี/ช้า, ไม่กด = พลาด',
    'บางเหตุการณ์ต้องกรอกข้อมูล (ยา/พลังงาน/จังหวะ) ให้ถูก',
    'กดผิดปุ่มหรือกดมั่ว จะโดนหักคะแนน',
  ],
  audit: [
    'ดู log ที่ผู้บันทึกทำไว้ — หาบรรทัดที่ผิด',
    'แตะบรรทัด แล้วเลือกว่าผิดประเภทไหน',
    'กล่าวหาผิดบรรทัดจะถูกหักคะแนน — ดูให้ดีก่อนกด',
  ],
};

export default function GameRulesCard({ type, extra = [] }) {
  const rules = [...(TYPE_RULES[type] || []), ...extra];
  return (
    <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-1.5">
      <div className="text-xs font-black text-text-primary">กติกา</div>
      {rules.map((r, i) => (
        <div key={i} className="flex items-start gap-1.5 text-2xs text-text-secondary">
          <span className="text-info shrink-0">•</span><span>{r}</span>
        </div>
      ))}
    </div>
  );
}
