import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Lock, Trophy } from 'lucide-react';
import {
  blsScenarios, FINAL_EXAM_ID, getStageProgress, isFinalExamUnlocked,
} from '../data/blsScenarios';

// Stage-select hub — numbered cards (1-8) mirroring the learn-card style used
// on the Pre-course/Learn pages, plus a locked "final exam" card that opens
// once every stage is passed. Progress is read straight from localStorage so
// this stays a simple, static page (no store wiring needed).
export default function BLSScenarioHub() {
  const navigate = useNavigate();
  const finalUnlocked = isFinalExamUnlocked();

  const cards = [
    ...blsScenarios.map((s) => ({
      id: s.id,
      step: s.stageNumber,
      emoji: s.emoji,
      title: s.title,
      subtitle: s.subtitle,
      locked: false,
    })),
    {
      id: FINAL_EXAM_ID,
      step: blsScenarios.length + 1,
      emoji: '🏆',
      title: 'ข้อสอบรวม',
      subtitle: 'สุ่มคำถามจากทุกด่าน',
      locked: !finalUnlocked,
    },
  ];

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur border-b border-bg-tertiary">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 inline-flex items-center justify-center hover:bg-bg-tertiary"
            style={{ borderRadius: 'var(--radius-full)' }} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="text-headline">🧠 เกมลำดับขั้น BLS</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="dash-card">
          <div className="text-sm text-text-secondary leading-relaxed">
            เดินตามลำดับขั้น BLS ทีละด่าน <b>8 ด่าน ครบทุกบทเรียน</b> — เลือกคำตอบภายในเวลาที่กำหนด
            ตอบผิดแล้วแก้ใหม่ไม่ได้ ผ่านครบ 8 ด่านเพื่อปลดล็อก <b>ข้อสอบรวม</b>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {cards.map((c) => {
            const progress = c.locked ? null : getStageProgress(c.id);
            return (
              <button
                key={c.id}
                onClick={() => !c.locked && navigate(`/bls/scenario/${c.id}`)}
                disabled={c.locked}
                className="learn-card tone-info relative flex items-center gap-3 text-left px-4 py-3 disabled:opacity-55 disabled:cursor-not-allowed"
              >
                <span
                  className="w-8 h-8 shrink-0 inline-flex items-center justify-center text-white text-sm font-extrabold"
                  style={{ borderRadius: '50%', background: 'var(--color-info)' }}
                >
                  {c.step}
                </span>
                <span className="text-2xl shrink-0">{c.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-text-primary">{c.title}</span>
                  <span className="block text-xs text-text-muted mt-0.5">{c.subtitle}</span>
                </span>
                {c.locked ? (
                  <Lock size={18} className="text-text-muted shrink-0" />
                ) : progress?.passed ? (
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-success">
                    <Check size={14} strokeWidth={3} /> {progress.pct}%
                  </span>
                ) : progress ? (
                  <span className="shrink-0 text-xs text-text-muted">{progress.pct}%</span>
                ) : c.id === FINAL_EXAM_ID ? (
                  <Trophy size={18} className="text-warning shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
