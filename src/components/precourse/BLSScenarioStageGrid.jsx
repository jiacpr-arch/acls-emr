import { useNavigate } from 'react-router-dom';
import { Check, Lock, Trophy } from 'lucide-react';
import {
  blsScenarios, FINAL_EXAM_ID, getStageProgress, isFinalExamUnlocked,
} from '../../data/blsScenarios';

// Numbered stage-select grid (1-8 chapters + locked final exam) — shared by
// the standalone hub page and embedded directly on the skill-practice page
// so students see the decision game without an extra navigation hop.
export default function BLSScenarioStageGrid() {
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
      subtitle: 'ทบทวนไล่ตามลำดับทุกเคส',
      locked: !finalUnlocked,
    },
  ];

  return (
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
  );
}
