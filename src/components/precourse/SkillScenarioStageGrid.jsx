import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Lock, Trophy } from 'lucide-react';
import {
  scenarios, FINAL_EXAM_ID, getStageProgress, isFinalExamUnlocked,
} from '../../data/activeSkillContent';

// Numbered stage-select grid — shared by the three skill courses (airway /
// defib / iv). Modeled on BLSScenarioStageGrid.jsx but reads from the active
// course's scenario set and routes under /scenario instead of /bls/scenario.
export default function SkillScenarioStageGrid() {
  const navigate = useNavigate();
  const finalUnlocked = isFinalExamUnlocked();

  const cards = [
    ...scenarios.map((s) => ({
      id: s.id,
      step: s.stageNumber,
      title: s.title,
      subtitle: s.subtitle,
      locked: false,
    })),
    {
      id: FINAL_EXAM_ID,
      step: scenarios.length + 1,
      title: 'ข้อสอบรวม',
      subtitle: finalUnlocked ? 'ทบทวนไล่ตามลำดับทุกเคส' : `ผ่านครบ ${scenarios.length} ด่านก่อนเพื่อปลดล็อก`,
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
            onClick={() => !c.locked && navigate(`/scenario/${c.id}`)}
            disabled={c.locked}
            className="card card-hover relative flex items-center gap-3.5 px-4 py-4 disabled:opacity-55 disabled:cursor-not-allowed"
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <span
              className="w-10 h-10 shrink-0 inline-flex items-center justify-center text-white text-base font-extrabold"
              style={{ borderRadius: '50%', background: 'var(--color-info)' }}
            >
              {c.step}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-base font-bold text-text-primary leading-snug">{c.title}</span>
              <span className="block text-sm text-text-muted mt-1">{c.subtitle}</span>
            </span>
            {c.locked ? (
              <Lock size={20} className="text-text-muted shrink-0" />
            ) : progress?.passed ? (
              <span className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-success">
                <Check size={16} strokeWidth={3} /> {progress.pct}%
              </span>
            ) : progress ? (
              <span className="shrink-0 text-sm text-text-muted">{progress.pct}%</span>
            ) : c.id === FINAL_EXAM_ID ? (
              <Trophy size={20} className="text-warning shrink-0" />
            ) : null}
            {!c.locked && <ChevronRight size={20} className="text-text-muted shrink-0 -ml-1" />}
          </button>
        );
      })}
    </div>
  );
}
