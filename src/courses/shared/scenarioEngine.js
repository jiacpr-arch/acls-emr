// Shared decision-game engine — extracted from src/data/blsScenarios.js so the
// airway / defib / iv skill courses can each have their own stage set + final
// exam + localStorage progress without copy-pasting the shuffle/persistence
// logic three times. Each course calls createScenarioEngine(stages, {
// progressKeyPrefix }) once and exports the returned functions.
//
// Stage shape (same as blsScenarios.js):
//   {
//     id, chapterId, stageNumber, title, subtitle, emoji, passScore,
//     steps: [{
//       situation, question, timeLimitSec?,
//       options: [{ label, correct?: true, feedback, trap?: true }],
//     }],
//   }

const FINAL_EXAM_PER_STAGE = 2;

// Deterministic-enough shuffle for a quiz context (not crypto-grade).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(step) {
  return { ...step, options: shuffle(step.options) };
}

export function createScenarioEngine(stages, { progressKeyPrefix, finalExamTitle = 'ข้อสอบรวม — ทบทวนทุกเคส' } = {}) {
  if (!progressKeyPrefix) throw new Error('createScenarioEngine: progressKeyPrefix is required');

  const FINAL_EXAM_ID = 'final-exam';
  const DEFAULT_TIME_LIMIT_SEC = 20;

  function buildFinalExam() {
    const picked = stages.flatMap((stage) =>
      stage.steps.slice(0, FINAL_EXAM_PER_STAGE).map((s) => ({
        ...s,
        sourceStage: stage.title,
      })),
    );
    return {
      id: FINAL_EXAM_ID,
      chapterId: null,
      stageNumber: stages.length + 1,
      title: finalExamTitle,
      subtitle: `Final Exam · ${picked.length} ข้อ ไล่ตามลำดับทุกเคส`,
      emoji: '🏆',
      passScore: 80,
      steps: picked,
    };
  }

  function getStageById(id) {
    const stage = id === FINAL_EXAM_ID ? buildFinalExam() : stages.find((s) => s.id === id);
    if (!stage) return null;
    return { ...stage, steps: stage.steps.map(shuffleOptions) };
  }

  function getStageProgress(stageId) {
    try {
      const raw = localStorage.getItem(progressKeyPrefix + stageId);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveStageProgress(stageId, { pct, points, passed }) {
    try {
      const prev = getStageProgress(stageId);
      const best = prev && prev.pct > pct ? prev : { pct, points, passed };
      localStorage.setItem(progressKeyPrefix + stageId, JSON.stringify(best));
    } catch {
      // localStorage unavailable — progress just won't persist
    }
  }

  function isFinalExamUnlocked() {
    return stages.every((s) => getStageProgress(s.id)?.passed);
  }

  function getScenarioGameStatus() {
    const stagesPassed = stages.filter((s) => getStageProgress(s.id)?.passed).length;
    const finalPassed = !!getStageProgress(FINAL_EXAM_ID)?.passed;
    return {
      done: stagesPassed + (finalPassed ? 1 : 0),
      total: stages.length + 1,
      allPassed: stagesPassed === stages.length && finalPassed,
    };
  }

  return {
    stages,
    FINAL_EXAM_ID,
    DEFAULT_TIME_LIMIT_SEC,
    buildFinalExam,
    getStageById,
    getStageProgress,
    saveStageProgress,
    isFinalExamUnlocked,
    getScenarioGameStatus,
  };
}
