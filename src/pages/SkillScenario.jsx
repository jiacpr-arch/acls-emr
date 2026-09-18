import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Check, X, RotateCcw, ArrowRight, HeartPulse, Trophy, Clock,
} from 'lucide-react';
import { getStageById, saveStageProgress, DEFAULT_TIME_LIMIT_SEC } from '../data/activeSkillContent';

// Scenario play page shared by the three skill courses (airway / defib / iv).
// Modeled on BLSScenario.jsx but without the embedded CPR metronome drill —
// none of the skill-course scenario steps set `cprDrill`, so that branch of
// BLSScenario.jsx never applies here and is left out for clarity.
const POINTS_CORRECT = 10;
const POINTS_SPEED_BONUS = 5;
const POINTS_WRONG = -5;
const POINTS_TIMEOUT = -5;

export default function SkillScenario() {
  const navigate = useNavigate();
  const { stageId } = useParams();
  // Memoize by stageId so the shuffled option order (and the final exam's
  // sampled steps) is computed once per stage and stays stable while the
  // student plays — re-renders on each answer must not reshuffle mid-question.
  const scenario = useMemo(() => getStageById(stageId), [stageId]);
  const steps = scenario?.steps ?? [];

  const [stepIdx, setStepIdx] = useState(0);
  const [picked, setPicked] = useState(null);        // option index the student clicked
  const [locked, setLocked] = useState(false);        // step answered (right/wrong/timeout) — no retry
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const stepTimeLimit = step?.timeLimitSec || DEFAULT_TIME_LIMIT_SEC;

  // Per-step countdown timer — starts fresh whenever stepIdx changes. Uses a
  // local counter (not React state) to decide when time's up, so a stale
  // `timeLeft` read from a prior render/step can never trigger a false
  // auto-lock — only this step's own interval can lock this step.
  useEffect(() => {
    if (!step || locked) return;
    let remaining = stepTimeLimit;
    setTimeLeft(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        setLocked(true);
        setTimedOut(true);
        setPoints((p) => p + POINTS_TIMEOUT);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const pickOption = (i) => {
    if (locked) return;
    clearInterval(timerRef.current);
    const opt = step.options[i];
    setPicked(i);
    setLocked(true);
    if (opt.correct) {
      setCorrectCount((c) => c + 1);
      const bonus = timeLeft > stepTimeLimit / 2 ? POINTS_SPEED_BONUS : 0;
      setPoints((p) => p + POINTS_CORRECT + bonus);
    } else {
      setPoints((p) => p + POINTS_WRONG);
    }
  };

  const nextStep = () => {
    if (isLast) { setFinished(true); return; }
    setStepIdx((i) => i + 1);
    setPicked(null);
    setLocked(false);
    setTimedOut(false);
  };

  const restart = () => {
    setStepIdx(0);
    setPicked(null);
    setLocked(false);
    setTimedOut(false);
    setPoints(0);
    setCorrectCount(0);
    setFinished(false);
  };

  const total = steps.length;
  const finalPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const finalPassed = finalPct >= (scenario?.passScore ?? 80);

  // Persist the result once, the moment the student reaches the score screen.
  useEffect(() => {
    if (finished && scenario) {
      saveStageProgress(scenario.id, { pct: finalPct, points, passed: finalPassed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (!scenario) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 bg-bg-primary text-center">
        <div className="text-body text-text-secondary">ไม่พบด่านนี้</div>
        <button onClick={() => navigate('/scenario')} className="btn btn-info mt-4">
          กลับไปเลือกด่าน
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = finalPct;
    const passed = finalPassed;

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 bg-bg-primary">
        <div className="w-full max-w-md space-y-5 text-center animate-fade-in">
          <div
            className="w-16 h-16 mx-auto inline-flex items-center justify-center text-white"
            style={{
              background: passed
                ? 'linear-gradient(135deg, var(--color-success), #047857)'
                : 'linear-gradient(135deg, var(--color-warning), var(--color-warning-dark))',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.28)',
            }}
          >
            <Trophy size={28} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-title text-text-primary">{passed ? 'ผ่าน! 🎉' : 'ลองอีกครั้งนะ'}</h1>
            <p className="text-caption text-text-secondary mt-1">{scenario.title}</p>
          </div>

          <div className="dash-card grid grid-cols-2 gap-3">
            <div>
              <div className="text-overline text-text-muted mb-1">ตอบถูก</div>
              <div className={`text-numeric text-4xl font-bold ${passed ? 'text-success' : 'text-warning'}`}>
                {correctCount}/{total}
              </div>
              <div className="text-xs text-text-muted mt-1">{pct}% (เกณฑ์ผ่าน {scenario.passScore}%)</div>
            </div>
            <div>
              <div className="text-overline text-text-muted mb-1">แต้มสะสม</div>
              <div className="text-numeric text-4xl font-bold text-info">{points}</div>
              <div className="text-xs text-text-muted mt-1">คะแนน</div>
            </div>
          </div>

          <div className="dash-card !p-4 text-left">
            <div className="text-overline text-text-muted mb-2">ทบทวนลำดับขั้นที่ถูกต้อง</div>
            <ol className="space-y-1.5">
              {steps.map((s, i) => {
                const right = s.options.find((o) => o.correct);
                return (
                  <li key={i} className="text-xs text-text-secondary flex gap-2">
                    <span className="text-success font-bold shrink-0">{i + 1}.</span>
                    <span>{right?.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-2">
            <button onClick={restart} className="btn btn-info btn-lg btn-block">
              <RotateCcw size={16} strokeWidth={2.2} /> เล่นอีกครั้ง
            </button>
            <button onClick={() => navigate('/scenario')} className="btn btn-ghost btn-block">
              กลับไปเลือกด่าน
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeUrgent = timeLeft <= 5;

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur border-b border-bg-tertiary">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/scenario')}
            className="w-9 h-9 inline-flex items-center justify-center hover:bg-bg-tertiary"
            style={{ borderRadius: 'var(--radius-full)' }} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="text-headline flex items-center gap-2 flex-1 min-w-0">
            <HeartPulse size={20} className="text-info shrink-0" />
            <span className="truncate">{scenario.title}</span>
          </div>
          {!locked && (
            <div className={`flex items-center gap-1 text-sm font-bold tabular-nums shrink-0 ${timeUrgent ? 'text-danger' : 'text-text-muted'}`}>
              <Clock size={16} strokeWidth={2.4} /> {timeLeft}s
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-bg-tertiary">
          <div className="h-full bg-info transition-all"
            style={{ width: `${((stepIdx + (locked ? 1 : 0)) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="text-overline text-text-muted flex items-center justify-between">
          <span>ขั้นที่ {stepIdx + 1} / {steps.length} · {scenario.subtitle}</span>
          <span className="text-info">{points} แต้ม</span>
        </div>

        {/* Situation */}
        <div className="dash-card">
          <div className="text-sm text-text-secondary leading-relaxed">{step.situation}</div>
          <div className="text-base font-bold text-text-primary mt-3">{step.question}</div>
        </div>

        {timedOut && (
          <div className="text-center text-sm font-bold text-danger py-1">⏱ หมดเวลา — ดูเฉลยด้านล่าง</div>
        )}

        {/* Options */}
        <div className="space-y-2">
          {step.options.map((opt, i) => {
            const isPicked = picked === i;
            const showState = isPicked || (locked && opt.correct);
            const tone = showState
              ? opt.correct
                ? 'ring-2 ring-success bg-success/8'
                : 'ring-2 ring-danger bg-danger/8'
              : 'hover:bg-bg-tertiary';
            return (
              <button
                key={i}
                onClick={() => pickOption(i)}
                disabled={locked}
                className={`w-full text-left dash-card !py-3 flex items-start gap-3 transition-all disabled:cursor-default ${tone}`}
              >
                <span className={`mt-0.5 w-6 h-6 shrink-0 inline-flex items-center justify-center rounded-full text-white ${
                  showState ? (opt.correct ? 'bg-success' : 'bg-danger') : 'bg-bg-tertiary'
                }`}>
                  {showState ? (
                    opt.correct ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-bold text-text-muted">{String.fromCharCode(65 + i)}</span>
                  )}
                </span>
                <span className="flex-1">
                  <span className="text-sm font-semibold text-text-primary leading-snug">{opt.label}</span>
                  {(isPicked || (locked && opt.correct)) && (
                    <span className={`block text-xs mt-1 leading-snug ${opt.correct ? 'text-success' : 'text-danger'}`}>
                      {opt.feedback}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next */}
        {locked && (
          <button onClick={nextStep} className="btn btn-info btn-lg btn-block">
            {isLast ? 'ดูผลสรุป' : 'ถัดไป'} <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
}
