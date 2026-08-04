import CharacterSprite from '../../game/CharacterSprite';
import { Play, Star, ArrowLeft } from 'lucide-react';
import GameRulesCard from './GameRulesCard';

// ==========================================
// Recorder Hero — การ์ดเปิดด่าน (กติกา + hi-score + เริ่ม)
// ==========================================
export default function LevelIntro({ level, hiscore = 0, onStart, onBack }) {
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
        <div style={{ width: 60 }}><CharacterSprite charId="att_dech" pose="happy" /></div>
        <div className="flex-1">
          <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-relaxed text-slate-900">
            <div className="font-black text-info mb-1">หัวหน้าทีม:</div>
            {level.intro_th || level.brief_th || 'พร้อมเริ่มฝึกบันทึกเหตุการณ์แล้วหรือยัง?'}
          </div>
        </div>
      </div>

      <GameRulesCard type={level.type} />

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
