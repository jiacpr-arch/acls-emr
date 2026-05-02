import { useState, useEffect } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import {
  GraduationCap, Edit, Activity, Lightbulb, Check, X, Trophy,
  Hospital, RefreshCw, ChevronRight, ChevronLeft, PartyPopper,
} from 'lucide-react';

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
      <div className={`px-4 py-3 text-white ${isLearning ? '' : ''}`}
        style={{
          background: isLearning
            ? 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%)'
            : 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-purple-dark) 100%)',
        }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-overline inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {isLearning ? <GraduationCap size={11} strokeWidth={2.4} /> : <Edit size={11} strokeWidth={2.4} />}
            {isLearning ? 'LEARNING' : 'EXAM'} · {scenario.title_th}
          </span>
          <span className="text-[11px] font-mono font-bold bg-white/20 px-2 py-0.5"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            {currentStepIdx + 1}/{scenario.steps.length}
          </span>
        </div>
        <div className="text-caption leading-relaxed whitespace-pre-line font-medium">
          {currentStep.scenario_th}
        </div>

        {/* EKG indicator */}
        {currentStep.ekg && (
          <div className="mt-2 px-3 py-1.5 bg-white/20 inline-flex items-center gap-1.5 text-[12px] font-bold"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            <Activity size={13} strokeWidth={2.4} /> EKG: {currentStep.ekg.toUpperCase()}
          </div>
        )}

        {/* Learning hint */}
        {isLearning && currentStep.hint_th && (
          <div className="mt-2 px-3 py-1.5 bg-white/15 inline-flex items-start gap-1.5 text-[11px] w-full"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            <Lightbulb size={12} strokeWidth={2.2} className="shrink-0 mt-0.5" /> {currentStep.hint_th}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1 mt-2.5">
          {scenario.steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 ${
              i < currentStepIdx ? 'bg-white' : i === currentStepIdx ? 'bg-white/60 animate-pulse' : 'bg-white/25'
            }`} style={{ borderRadius: 99 }} />
          ))}
        </div>
      </div>

      {/* Feedback popup */}
      {showFeedback && (
        <div className={`px-4 py-2 text-center text-body-strong inline-flex items-center justify-center gap-2 w-full ${
          showFeedback.correct ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {showFeedback.correct ? <Check size={14} strokeWidth={2.4} /> : <X size={14} strokeWidth={2.4} />}
          {showFeedback.message}
        </div>
      )}

      {/* Score (learning mode only) */}
      {isLearning && (
        <div className="flex items-center justify-center gap-4 px-4 py-1.5 bg-bg-tertiary/50 text-[11px] text-text-muted font-mono">
          <span className="inline-flex items-center gap-1"><Check size={11} strokeWidth={2.4} className="text-success" /> {score.correct}</span>
          <span className="inline-flex items-center gap-1"><X size={11} strokeWidth={2.4} className="text-danger" /> {score.wrong}</span>
          <span>Avg: {score.reactions.length > 0 ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1) : '—'}s</span>
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 bg-bg-primary">
      <div className="w-full max-w-md space-y-4 text-center animate-fade-in">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(217, 119, 6, 0.32)',
          }}
        >
          <Hospital size={28} strokeWidth={2.4} className="text-white" />
        </div>
        <div>
          <h1 className="text-title text-text-primary">Senior Staff Arrived</h1>
          <p className="text-caption text-text-secondary mt-1">The senior team has taken over patient care.</p>
        </div>

        {/* Score summary */}
        <div className="dash-card space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-overline">Performance</span>
            <span className={`text-numeric text-4xl ${gradeColor[grade]}`}>{grade}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ScoreTile value={score.correct} label="Correct" tone="success" />
            <ScoreTile value={score.wrong} label="Wrong" tone="danger" />
            <ScoreTile value={`${avgReaction}s`} label="Avg Time" />
          </div>
        </div>

        {/* Areas to improve */}
        <div className="dash-card !p-3 text-left">
          <div className="section-header">Review these topics</div>
          {scenario.steps.map((step, i) => (
            <div key={i} className="text-[11px] text-text-secondary mb-1">
              {i + 1}. {step.hint_th || step.correctActions?.join(', ')}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button onClick={onRetry} className="btn btn-info btn-lg btn-block">
            <RefreshCw size={16} strokeWidth={2.2} /> Try Again
          </button>
          <button onClick={onNext} className="btn btn-ghost btn-block">
            Next Scenario <ChevronRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreTile({ value, label, tone }) {
  const valueClass =
    tone === 'success' ? 'text-success' :
    tone === 'danger' ? 'text-danger' :
    'text-text-primary';
  return (
    <div className="bg-bg-primary p-2 text-center border border-border" style={{ borderRadius: 'var(--radius-sm)' }}>
      <div className={`text-numeric text-lg ${valueClass}`}>{value}</div>
      <div className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">{label}</div>
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

  const isCelebrate = grade === 'A' || grade === 'B';
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 bg-bg-primary">
      <div className="w-full max-w-md space-y-4 text-center animate-fade-in">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: isCelebrate
              ? 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%)'
              : 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: isCelebrate ? '0 8px 20px rgba(5, 150, 105, 0.32)' : '0 8px 20px rgba(37, 99, 235, 0.32)',
          }}
        >
          {isCelebrate ? <PartyPopper size={28} strokeWidth={2.4} className="text-white" />
                       : <Edit size={28} strokeWidth={2.4} className="text-white" />}
        </div>
        <div>
          <h1 className="text-title text-text-primary">Scenario Complete!</h1>
          <p className="text-caption text-text-secondary mt-1">{scenario.title_th}</p>
        </div>

        <div className="dash-card !p-5">
          <div className={`text-numeric text-6xl ${gradeColor[grade]}`}>{grade}</div>
          <div className="text-caption text-text-muted mt-1">{pct}% correct</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ScoreTile value={score.correct} label="Correct" tone="success" />
          <ScoreTile value={score.wrong} label="Wrong" tone="danger" />
          <ScoreTile value={`${avgReaction}s`} label="Avg Reaction" />
        </div>

        <div className="space-y-2">
          <button onClick={onRetry} className="btn btn-info btn-lg btn-block">
            <RefreshCw size={16} strokeWidth={2.2} /> Try Again
          </button>
          <button onClick={onNext} className="btn btn-success btn-lg btn-block">
            Next Scenario <ChevronRight size={14} strokeWidth={2.2} />
          </button>
          <button onClick={onDashboard} className="btn btn-ghost btn-block">
            <ChevronLeft size={14} strokeWidth={2.2} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
