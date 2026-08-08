import { useNavigate } from 'react-router-dom';
import { ERROR_TYPES, ERROR_TYPE_META } from '../../data/activeRecorderLevels';
import { RATINGS, RATING_META } from '../../utils/recorderGameScore';
import CharacterSprite from '../../game/CharacterSprite';
import { Star, Trophy, RefreshCw, ChevronRight, Home } from 'lucide-react';

// ==========================================
// Recorder Hero — หน้าสรุปผล (ทั้ง live + audit)
// timeline เทียบคู่ (live) / เฉลย (audit) + สรุปข้อผิดพลาด 4 ประเภท + ดาว
// ==========================================
function StarRow({ stars }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[1, 2, 3].map(i => (
        <Star key={i} size={30} strokeWidth={2}
          className={i <= stars ? 'text-warning' : 'text-bg-tertiary'}
          fill={i <= stars ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

// รวมข้อผิดพลาดตาม 4 ประเภทจาก result
function collectErrors(mode, result) {
  const groups = {
    [ERROR_TYPES.MISSED]: [],
    [ERROR_TYPES.WRONG_BUTTON]: [],
    [ERROR_TYPES.UI_LOST]: [],
    [ERROR_TYPES.WRONG_DATA]: [],
  };
  if (mode === 'audit') {
    result.results.filter(r => !r.found).forEach(r => {
      if (groups[r.errorType]) groups[r.errorType].push(r.explain_th || r.text_th);
    });
  } else {
    result.results.forEach(r => {
      if (r.errorType && groups[r.errorType]) {
        groups[r.errorType].push(r.missFeedback_th || r.wrongDataFeedback_th || r.narration_th || '');
      }
    });
  }
  return groups;
}

export default function ResultScreen({
  level, result, mode, stars, isNewHi, hasNext,
  onRetry, onNext, onHub,
}) {
  const navigate = useNavigate();
  const groups = collectErrors(mode, result);
  const errorTypeKeys = Object.keys(groups).filter(k => groups[k].length > 0);
  const perfectRun = errorTypeKeys.length === 0;

  return (
    <div className="page-container space-y-3 pb-28">
      {/* Header */}
      <div className="bg-bg-secondary border-2 border-text-primary p-5 flex flex-col items-center gap-3">
        <div style={{ width: 76 }}><CharacterSprite charId="att_dech" pose={stars >= 2 ? 'happy' : 'stern'} /></div>
        <StarRow stars={stars} />
        <div className="text-center">
          <div className={`text-title font-black ${stars >= 2 ? 'text-success' : 'text-warning'}`}>
            {stars === 3 ? 'เยี่ยมมาก!' : stars === 2 ? 'ดี!' : stars === 1 ? 'ผ่าน' : 'ลองใหม่อีกครั้ง'}
          </div>
          <div className="text-caption text-text-muted mt-1">{level.title_th}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-info">{result.score}</div>
            <div className="stat-label">คะแนน{result.maxScore ? ` / ${result.maxScore}` : ''}</div>
          </div>
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-success">
              {mode === 'audit' ? `${result.foundCount}/${result.totalErrors}` : `${result.bestStreak ?? 0}x`}
            </div>
            <div className="stat-label">{mode === 'audit' ? 'เจอข้อผิดพลาด' : 'Best Combo'}</div>
          </div>
        </div>
        {isNewHi && (
          <div className="text-body-strong text-warning inline-flex items-center gap-1.5">
            <Trophy size={14} strokeWidth={2.4} /> New Hi-Score!
          </div>
        )}
      </div>

      {/* สรุปข้อผิดพลาดตาม 4 ประเภท */}
      <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2">
        <div className="text-xs font-black text-text-primary">สรุปข้อผิดพลาด</div>
        {perfectRun ? (
          <div className="text-caption text-success">ไม่มีข้อผิดพลาด — บันทึกได้ครบถ้วนถูกต้อง 🎉</div>
        ) : (
          errorTypeKeys.map(type => (
            <div key={type} className="border-l-4 pl-2.5 py-1" style={{ borderColor: 'currentColor' }}>
              <div className={`text-caption font-black inline-flex items-center gap-1.5 ${ERROR_TYPE_META[type].color}`}>
                <span>{ERROR_TYPE_META[type].icon}</span>
                {ERROR_TYPE_META[type].label_th}
                <span className="text-text-muted font-normal">× {groups[type].length}</span>
              </div>
              <div className="text-3xs text-text-secondary mt-0.5">{ERROR_TYPE_META[type].tip_th}</div>
              {groups[type].slice(0, 3).map((d, i) => d && (
                <div key={i} className="text-3xs text-text-muted mt-0.5">• {d}</div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Timeline (live) — เทียบสิ่งที่กด vs มาตรฐาน */}
      {mode === 'live' && (
        <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-1.5">
          <div className="text-xs font-black text-text-primary">ไทม์ไลน์การบันทึก</div>
          {result.results.map((r, i) => {
            const meta = RATING_META[r.rating] || {};
            const ok = r.rating !== RATINGS.MISS;
            return (
              <div key={i} className="flex items-start gap-2 text-2xs">
                <span className={`font-black shrink-0 w-14 ${meta.color || 'text-text-muted'}`}>
                  {meta.label_th || '—'}
                </span>
                <span className="flex-1 text-text-secondary">{r.narration_th}</span>
                {!ok && r.errorType && (
                  <span className={`shrink-0 ${ERROR_TYPE_META[r.errorType]?.color || ''}`}>
                    {ERROR_TYPE_META[r.errorType]?.icon}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onRetry} className="btn btn-ghost btn-lg btn-block font-bold border-2">
          <RefreshCw size={16} strokeWidth={2.4} /> เล่นซ้ำ
        </button>
        {hasNext && stars >= 1 ? (
          <button onClick={onNext} className="btn btn-success btn-lg btn-block font-black border-2">
            ด่านถัดไป <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        ) : (
          <button onClick={onHub} className="btn btn-primary btn-lg btn-block font-bold border-2">
            <Home size={16} strokeWidth={2.4} /> กลับหน้าเลือกด่าน
          </button>
        )}
      </div>
      {hasNext && stars >= 1 && (
        <button onClick={onHub} className="btn btn-ghost btn-sm btn-block">
          <Home size={14} strokeWidth={2.2} /> กลับหน้าเลือกด่าน
        </button>
      )}

      {/* ขั้น 2 ของเส้นทางผู้บันทึก: โจทย์บนหน้า Recording จริง */}
      {stars >= 2 && (
        <button onClick={() => navigate('/scenarios')}
          className="w-full dash-card !p-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3">
          <span className="text-2xl shrink-0">🏥</span>
          <div className="flex-1 min-w-0">
            <div className="text-body-strong text-text-primary">พร้อมของจริงแล้ว → ขั้น 2 · สอบสนามจริง</div>
            <div className="text-caption text-text-muted">ทำโจทย์เคสเดียวกันนี้บนหน้า Recording จริง — มีเกรดให้ทุกเคส</div>
          </div>
          <ChevronRight size={16} strokeWidth={2} className="text-text-muted shrink-0" />
        </button>
      )}
    </div>
  );
}
