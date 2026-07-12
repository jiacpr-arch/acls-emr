import Instructor from '../sim/Instructor';
import { Play, Star, ArrowLeft } from 'lucide-react';

// ==========================================
// Recorder Hero — การ์ดเปิดด่าน (กติกา + hi-score + เริ่ม)
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

export default function LevelIntro({ level, hiscore = 0, onStart, onBack }) {
  const rules = TYPE_RULES[level.type] || [];
  return (
    <div className="page-container space-y-3 pb-28">
      <button onClick={onBack} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> กลับ
      </button>

      <div className="text-center pt-1">
        <h1 className="text-title text-text-primary">{level.title_th}</h1>
        <p className="text-caption text-text-muted mt-1">{level.subtitle_th}</p>
      </div>

      <div className="bg-bg-secondary border-2 border-text-primary p-4 flex items-start gap-3">
        <Instructor mood="happy" />
        <div className="flex-1">
          <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-relaxed text-slate-900">
            <div className="font-black text-info mb-1">หัวหน้าทีม:</div>
            {level.intro_th || level.brief_th || 'พร้อมเริ่มฝึกบันทึกเหตุการณ์แล้วหรือยัง?'}
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-1.5">
        <div className="text-xs font-black text-text-primary">กติกา</div>
        {rules.map((r, i) => (
          <div key={i} className="flex items-start gap-1.5 text-2xs text-text-secondary">
            <span className="text-info shrink-0">•</span><span>{r}</span>
          </div>
        ))}
      </div>

      <div className="stat-box border-2 border-text-primary">
        <div className="stat-value text-warning inline-flex items-center gap-1 justify-center">
          <Star size={14} strokeWidth={2.4} fill="currentColor" /> {hiscore}
        </div>
        <div className="stat-label">Hi-Score</div>
      </div>

      <button onClick={onStart} className="w-full btn btn-danger btn-lg btn-full font-black border-2">
        <Play size={18} strokeWidth={2.4} /> เริ่มด่าน
      </button>
    </div>
  );
}
