import { useState, useEffect } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

// Scenario Engine — overlays on Recording UI
// Shows scenario text progressively, checks correct actions, tracks score
export default function ScenarioEngine({ scenario, mode, onComplete, onStaffTakeover }) {
  // mode: 'learning' | 'exam'
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0, reactions: [] });
  const [wrongCount, setWrongCount] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(null); // { correct, message }
  const [completed, setCompleted] = useState(false);

  const currentStep = scenario.steps[currentStepIdx];
  const isLearning = mode === 'learning';
  const maxWrong = 4; // staff takeover after 4 wrong

  // Listen for events to detect correct/wrong actions
  const events = useCaseStore(s => s.events);
  const lastEvent = events[0]; // newest first

  useEffect(() => {
    if (!currentStep || completed) return;
    if (!lastEvent) return;

    // Check if the last event matches any correct action
    const eventType = lastEvent.type?.toLowerCase() || '';
    const eventCategory = lastEvent.category || '';

    const isCorrect = currentStep.correctActions?.some(action => {
      const a = action.toLowerCase();
      if (a === 'scene_safety' && eventType.includes('scene safe')) return true;
      if (a === 'check_response' && (eventType.includes('unresponsive') || eventType.includes('responsive'))) return true;
      if (a === 'call_for_help' && eventType.includes('help activated')) return true;
      if (a === 'start_cpr' && eventType.includes('cpr started')) return true;
      if (a === 'defib_200j' && eventCategory === 'shock') return true;
      if (a === 'defib' && eventCategory === 'shock') return true;
      if (a === 'epi_1mg' && eventType.includes('epinephrine')) return true;
      if (a === 'epi_repeat' && eventType.includes('epinephrine')) return true;
      if (a === 'resume_cpr' && eventType.includes('cpr')) return true;
      if (a === 'check_pulse' && (eventType.includes('pulse') || eventType.includes('rhythm check'))) return true;
      if (a === 'rosc' && eventType.includes('rosc')) return true;
      if (a === 'amiodarone' && eventType.includes('amiodarone')) return true;
      if (a === 'atropine_1mg' && eventType.includes('atropine')) return true;
      if (a === 'vagal_maneuver' && eventType.includes('vagal')) return true;
      if (a === 'adenosine_6mg' && eventType.includes('adenosine 6')) return true;
      if (a === 'adenosine_12mg' && eventType.includes('adenosine 12')) return true;
      if (a === 'monitor' && (eventType.includes('monitor') || eventType.includes('assessment'))) return true;
      if (a === 'find_cause' && (eventType.includes('suspected cause') || eventType.includes('h&t'))) return true;
      if (a === 'find_cause_hyperk' && eventType.includes('hyperkal')) return true;
      if (a === 'assess_stable' && (eventType.includes('stable') || eventType.includes('unstable'))) return true;
      if (a === 'assess_symptomatic' && eventType.includes('symptomatic')) return true;
      if (a === 'assess_acs' && eventType.includes('acs')) return true;
      if (a === 'fast_assessment' && eventType.includes('fast')) return true;
      if (a === 'nihss' && eventType.includes('nihss')) return true;
      if (a === 'ct_brain' && eventType.includes('ct')) return true;
      if (a === 'tpa_criteria' && eventType.includes('tpa')) return true;
      if (a === 'give_tpa' && eventType.includes('alteplase')) return true;
      if (a === 'mona_protocol' && (eventType.includes('aspirin') || eventType.includes('ntg'))) return true;
      if (a === 'activate_cath' && eventType.includes('cath')) return true;
      if (a === 'antiplatelet' && (eventType.includes('clopidogrel') || eventType.includes('ticagrelor'))) return true;
      if (a === 'heparin' && eventType.includes('heparin')) return true;
      if (a === 'post_rosc_checklist' && eventType.includes('post-rosc')) return true;
      if (a === 'continue_stemi' && eventType.includes('stemi')) return true;
      return false;
    });

    if (isCorrect) {
      const reactionTime = (Date.now() - stepStartTime) / 1000;
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
        reactions: [...prev.reactions, reactionTime],
      }));

      if (isLearning) {
        setShowFeedback({ correct: true, message: 'Correct!' });
        setTimeout(() => setShowFeedback(null), 1500);
      }

      // Advance to next step
      if (currentStepIdx < scenario.steps.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
        setStepStartTime(Date.now());
      } else {
        setCompleted(true);
        onComplete(score);
      }
    }
  }, [events.length]);

  // Handle wrong action (called from outside or detected)
  const handleWrong = (action) => {
    const newWrong = wrongCount + 1;
    setWrongCount(newWrong);
    setScore(prev => ({ ...prev, wrong: prev.wrong + 1, total: prev.total + 1 }));

    if (isLearning) {
      const wrongHint = currentStep.wrongActions?.[action] || currentStep.hint_th || 'Try again';
      setShowFeedback({ correct: false, message: wrongHint });
      setTimeout(() => setShowFeedback(null), 3000);
    }

    if (newWrong >= maxWrong) {
      onStaffTakeover(score);
    }
  };

  if (!currentStep) return null;

  return (
    <div className="shrink-0 z-40">
      {/* Scenario bar — large and visible on mobile */}
      <div className={`px-4 py-3 ${isLearning ? 'bg-blue-600' : 'bg-purple'} text-white`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">
            {isLearning ? '📚 LEARNING' : '📝 EXAM'} — {scenario.title_th}
          </span>
          <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
            {currentStepIdx + 1}/{scenario.steps.length}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
          {currentStep.scenario_th}
        </div>

        {/* EKG indicator */}
        {currentStep.ekg && (
          <div className="mt-2 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-bold">
            📈 EKG: {currentStep.ekg.toUpperCase()}
          </div>
        )}

        {/* Learning hint */}
        {isLearning && currentStep.hint_th && (
          <div className="mt-2 px-3 py-1.5 bg-white/15 rounded-lg text-xs">
            💡 {currentStep.hint_th}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1 mt-2">
          {scenario.steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${
              i < currentStepIdx ? 'bg-white' : i === currentStepIdx ? 'bg-white/60 animate-pulse' : 'bg-white/20'
            }`} />
          ))}
        </div>
      </div>

      {/* Feedback popup */}
      {showFeedback && (
        <div className={`px-4 py-2 text-center text-sm font-bold ${
          showFeedback.correct ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {showFeedback.correct ? '✅ ' : '❌ '}{showFeedback.message}
        </div>
      )}

      {/* Score (learning mode only) */}
      {isLearning && (
        <div className="flex items-center justify-center gap-4 px-4 py-1 bg-bg-tertiary/50 text-[10px] text-text-muted">
          <span>✅ {score.correct}</span>
          <span>❌ {score.wrong}</span>
          <span>Avg: {score.reactions.length > 0 ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1) : '-'}s</span>
        </div>
      )}
    </div>
  );
}

// Staff Takeover screen
export function StaffTakeover({ scenario, score, onRetry, onViewAnswer, onNext }) {
  const avgReaction = score.reactions?.length > 0
    ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1)
    : '-';
  const total = score.correct + score.wrong;
  const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const gradeColor = { A: 'text-success', B: 'text-info', C: 'text-warning', D: 'text-danger', F: 'text-danger' };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 bg-bg-primary">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="text-5xl">🏥</div>
        <h1 className="text-xl font-black text-text-primary">Senior Staff Arrived</h1>
        <p className="text-sm text-text-secondary">The senior team has taken over patient care.</p>

        {/* Score summary */}
        <div className="glass-card !p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-semibold">Performance</span>
            <span className={`text-3xl font-black ${gradeColor[grade]}`}>{grade}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg-primary rounded-lg p-2 text-center">
              <div className="text-lg font-mono font-black text-success">{score.correct}</div>
              <div className="text-[9px] text-text-muted">Correct</div>
            </div>
            <div className="bg-bg-primary rounded-lg p-2 text-center">
              <div className="text-lg font-mono font-black text-danger">{score.wrong}</div>
              <div className="text-[9px] text-text-muted">Wrong</div>
            </div>
            <div className="bg-bg-primary rounded-lg p-2 text-center">
              <div className="text-lg font-mono font-black text-text-primary">{avgReaction}s</div>
              <div className="text-[9px] text-text-muted">Avg Time</div>
            </div>
          </div>
        </div>

        {/* Areas to improve */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs font-bold text-text-muted uppercase mb-2">Review these topics:</div>
          {scenario.steps.map((step, i) => (
            <div key={i} className="text-[10px] text-text-secondary mb-1">
              {i + 1}. {step.hint_th || step.correctActions?.join(', ')}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button onClick={onRetry} className="w-full btn-action btn-info py-3.5 text-sm font-bold">
            🔄 Try Again
          </button>
          <button onClick={onNext} className="w-full btn-action btn-ghost py-3 text-sm">
            Next Scenario →
          </button>
        </div>
      </div>
    </div>
  );
}

// Scenario Complete screen
export function ScenarioComplete({ scenario, score, mode, onRetry, onNext, onDashboard }) {
  const avgReaction = score.reactions?.length > 0
    ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1)
    : '-';
  const total = score.correct + score.wrong;
  const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const gradeColor = { A: 'text-success', B: 'text-info', C: 'text-warning', D: 'text-danger', F: 'text-danger' };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 bg-bg-primary">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="text-5xl">{grade === 'A' || grade === 'B' ? '🎉' : '📝'}</div>
        <h1 className="text-xl font-black text-text-primary">Scenario Complete!</h1>
        <p className="text-sm text-text-secondary">{scenario.title_th}</p>

        <div className="glass-card !p-4">
          <div className={`text-5xl font-black ${gradeColor[grade]}`}>{grade}</div>
          <div className="text-sm text-text-muted mt-1">{pct}% correct</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card !p-2 text-center">
            <div className="text-lg font-mono font-black text-success">{score.correct}</div>
            <div className="text-[9px] text-text-muted">Correct</div>
          </div>
          <div className="glass-card !p-2 text-center">
            <div className="text-lg font-mono font-black text-danger">{score.wrong}</div>
            <div className="text-[9px] text-text-muted">Wrong</div>
          </div>
          <div className="glass-card !p-2 text-center">
            <div className="text-lg font-mono font-black text-text-primary">{avgReaction}s</div>
            <div className="text-[9px] text-text-muted">Avg Reaction</div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={onRetry} className="w-full btn-action btn-info py-3.5 text-sm font-bold">
            🔄 Try Again
          </button>
          <button onClick={onNext} className="w-full btn-action btn-success py-3 text-sm font-bold">
            Next Scenario →
          </button>
          <button onClick={onDashboard} className="w-full btn-action btn-ghost py-3 text-sm">
            ← Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
