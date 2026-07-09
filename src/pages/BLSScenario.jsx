import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, RotateCcw, ArrowRight, HeartPulse, Trophy } from 'lucide-react';
import { playMetronomeClick, playBeep, initAudio } from '../utils/sound';
import { blsScenarios } from '../data/blsScenarios';

const CPR_DRILL_SEC = 30;
const CPR_BPM = 110;

export default function BLSScenario() {
  const navigate = useNavigate();
  const scenario = blsScenarios[0];   // MVP: single scenario
  const steps = scenario.steps;

  const [stepIdx, setStepIdx] = useState(0);
  const [picked, setPicked] = useState(null);      // index of the option shown
  const [locked, setLocked] = useState(false);     // correct answer chosen → step done
  const [stepWrong, setStepWrong] = useState(false);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  // Embedded CPR metronome drill
  const [drillActive, setDrillActive] = useState(false);
  const [drillDone, setDrillDone] = useState(false);
  const [drillLeft, setDrillLeft] = useState(CPR_DRILL_SEC);
  const [pulse, setPulse] = useState(false);
  const beatRef = useRef(null);
  const countRef = useRef(null);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  // Metronome + countdown while the CPR drill is running
  useEffect(() => {
    if (!drillActive) return;
    initAudio();
    beatRef.current = setInterval(() => {
      playMetronomeClick();
      setPulse((p) => !p);
    }, 60000 / CPR_BPM);
    countRef.current = setInterval(() => {
      setDrillLeft((s) => {
        if (s <= 1) {
          clearInterval(beatRef.current);
          clearInterval(countRef.current);
          playBeep(660, 0.25, 0.3);
          setDrillActive(false);
          setDrillDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(beatRef.current);
      clearInterval(countRef.current);
    };
  }, [drillActive]);

  const pickOption = (i) => {
    if (locked) return;
    const opt = step.options[i];
    setPicked(i);
    if (opt.correct) {
      setLocked(true);
      if (!stepWrong) setCorrectFirstTry((c) => c + 1);
      if (step.cprDrill) {
        setDrillLeft(CPR_DRILL_SEC);
        setDrillDone(false);
        setDrillActive(true);
      }
    } else {
      setStepWrong(true);
    }
  };

  const skipDrill = () => {
    clearInterval(beatRef.current);
    clearInterval(countRef.current);
    setDrillActive(false);
    setDrillDone(true);
  };

  const nextStep = () => {
    if (isLast) { setFinished(true); return; }
    setStepIdx((i) => i + 1);
    setPicked(null);
    setLocked(false);
    setStepWrong(false);
    setDrillActive(false);
    setDrillDone(false);
    setDrillLeft(CPR_DRILL_SEC);
  };

  const restart = () => {
    setStepIdx(0);
    setPicked(null);
    setLocked(false);
    setStepWrong(false);
    setCorrectFirstTry(0);
    setFinished(false);
    setDrillActive(false);
    setDrillDone(false);
    setDrillLeft(CPR_DRILL_SEC);
  };

  // Waiting for the CPR drill to finish before "ถัดไป" appears
  const drillPending = locked && step.cprDrill && !drillDone;

  if (finished) {
    const total = steps.length;
    const pct = Math.round((correctFirstTry / total) * 100);
    const passed = pct >= scenario.passScore;
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

          <div className="dash-card">
            <div className="text-overline text-text-muted mb-1">ทำถูกตั้งแต่ครั้งแรก</div>
            <div className={`text-numeric text-5xl font-bold ${passed ? 'text-success' : 'text-warning'}`}>
              {correctFirstTry}/{total}
            </div>
            <div className="text-sm text-text-muted mt-1">{pct}% (เกณฑ์ผ่าน {scenario.passScore}%)</div>
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
            <button onClick={() => navigate('/skill-practice')} className="btn btn-ghost btn-block">
              กลับหน้าฝึก CPR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur border-b border-bg-tertiary">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 inline-flex items-center justify-center hover:bg-bg-tertiary"
            style={{ borderRadius: 'var(--radius-full)' }} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="text-headline flex items-center gap-2">
            <HeartPulse size={20} className="text-info" />
            เกมลำดับขั้น BLS
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-bg-tertiary">
          <div className="h-full bg-info transition-all"
            style={{ width: `${((stepIdx + (locked ? 1 : 0)) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="text-overline text-text-muted">
          ขั้นที่ {stepIdx + 1} / {steps.length} · {scenario.subtitle}
        </div>

        {/* Situation */}
        <div className="dash-card">
          <div className="text-sm text-text-secondary leading-relaxed">{step.situation}</div>
          <div className="text-base font-bold text-text-primary mt-3">{step.question}</div>
        </div>

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
                  {isPicked && (
                    <span className={`block text-xs mt-1 leading-snug ${opt.correct ? 'text-success' : 'text-danger'}`}>
                      {opt.feedback}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Embedded CPR metronome drill */}
        {drillPending && (
          <div className="dash-card text-center space-y-3" style={{ background: 'color-mix(in srgb, var(--color-danger) 8%, var(--color-bg-secondary))' }}>
            <div className="text-sm font-bold text-danger">🫀 กดหน้าอกตามจังหวะ — {CPR_BPM}/นาที</div>
            <div
              className="w-24 h-24 mx-auto inline-flex items-center justify-center text-white transition-transform"
              style={{
                background: 'linear-gradient(135deg, var(--color-danger), #B91C1C)',
                borderRadius: '50%',
                transform: pulse ? 'scale(1.12)' : 'scale(0.96)',
                boxShadow: '0 6px 18px rgba(220,38,38,0.35)',
              }}
            >
              <span className="text-3xl font-bold tabular-nums">{drillLeft}</span>
            </div>
            <div className="text-xs text-text-muted">กดลึก 5–6 ซม. ปล่อยให้อกคืนตัวสุด</div>
            <button onClick={skipDrill} className="btn btn-ghost btn-sm">ข้าม</button>
          </div>
        )}

        {/* Next */}
        {locked && !drillPending && (
          <button onClick={nextStep} className="btn btn-info btn-lg btn-block">
            {isLast ? 'ดูผลสรุป' : 'ถัดไป'} <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
}
