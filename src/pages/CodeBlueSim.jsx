import { useState, useEffect, useRef } from 'react';
import { scenario } from '../data/codeBlueScenarios';
import {
  AlertTriangle, RefreshCw, Star, Flame, Timer, Check, X,
  PartyPopper, Heart, ChevronRight, Trophy,
} from 'lucide-react';
import EcgMonitor from '../components/sim/EcgMonitor';
import TeamMember from '../components/sim/TeamMember';
import Patient from '../components/sim/Patient';
import Instructor from '../components/sim/Instructor';

const HISCORE_KEY = 'acls_codeblue_hiscore';
const TIME_PER_DECISION = 25;
// Presentational sim components (EcgMonitor, TeamMember, Patient, Instructor)
// live in src/components/sim/* so the Recorder game can reuse them.

// ============ MAIN COMPONENT ============
export default function CodeBlueSim() {
  const [phase, setPhase] = useState('intro'); // intro | playing | done
  const [stepIdx, setStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [mood, setMood] = useState('idle');
  const [feedback, setFeedback] = useState(null); // { ok, text, target }
  const [activeTarget, setActiveTarget] = useState(null);
  const [state, setState] = useState(scenario.initialState);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_DECISION);
  const [hiscore, setHiscore] = useState(() => Number(localStorage.getItem(HISCORE_KEY) || 0));
  const timerRef = useRef(null);
  const handleAnswerRef = useRef(null);

  const step = scenario.steps[stepIdx];
  const isLast = step?.finalStep;
  const isOver = phase === 'done';

  const handlePick = (cmd) => {
    if (feedback) return;
    clearInterval(timerRef.current);
    setActiveTarget(cmd.target);
    if (cmd.correct) {
      const bonus = Math.floor(timeLeft / 3);
      const comboBonus = streak >= 2 ? 8 : 0;
      const gained = 15 + bonus + comboBonus;
      setScore(s => s + gained);
      setStreak(s => {
        const n = s + 1;
        setBestStreak(b => Math.max(b, n));
        return n;
      });
      setMood('happy');
      setFeedback({ ok: true, text: cmd.feedback, target: cmd.target });
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
      setWrongCount(w => w + 1);
      setMood('sad');
      setFeedback({ ok: false, text: cmd.feedback, target: cmd.target });
    }
  };

  useEffect(() => { handleAnswerRef.current = handlePick; });

  // Decision timer (no setState in effect body — only inside the interval callback)
  useEffect(() => {
    if (phase !== 'playing' || feedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswerRef.current?.({ correct: false, feedback: '⏰ หมดเวลา! ใน arrest ทุกวินาทีสำคัญ', target: null });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, feedback, stepIdx]);

  const startGame = () => {
    setPhase('playing');
    setStepIdx(0);
    setScore(0); setStreak(0); setBestStreak(0); setWrongCount(0);
    setState(scenario.initialState);
    setMood('idle');
    setFeedback(null);
    setActiveTarget(null);
    setTimeLeft(TIME_PER_DECISION);
  };

  const advance = () => {
    if (feedback?.ok && step.effect) {
      if (step.effect.state) setState(s => ({ ...s, ...step.effect.state }));
    }
    setActiveTarget(null);
    setFeedback(null);
    setMood('idle');
    setTimeLeft(TIME_PER_DECISION);
    if (isLast || stepIdx + 1 >= scenario.steps.length) {
      finalize();
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const finalize = () => {
    if (score > hiscore) {
      localStorage.setItem(HISCORE_KEY, String(score));
      setHiscore(score);
    }
    setPhase('done');
  };

  // ============ INTRO ============
  if (phase === 'intro') {
    return (
      <div className="page-container space-y-3 pb-28">
        <div className="text-center pt-2 flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.32)',
            }}
          >
            <AlertTriangle size={26} strokeWidth={2.4} className="text-white" />
          </div>
          <h1 className="text-title text-text-primary">Code Blue Simulator</h1>
          <p className="text-caption text-text-muted">จำลอง resuscitation จริง · คุณคือ Team Leader</p>
        </div>

        <div className="bg-bg-secondary border-2 border-text-primary p-4 flex items-start gap-3">
          <Instructor mood="happy"/>
          <div className="flex-1">
            <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-relaxed text-slate-900">
              <div className="font-black text-info mb-1">Dr. หมอเฮีย:</div>
              {scenario.intro}
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2">
          <div className="text-xs font-black text-text-primary">ทีม resuscitation ของคุณ</div>
          <div className="grid grid-cols-5 gap-1">
            <TeamMember role="compressor" active={false} label="Compressor"/>
            <TeamMember role="airway" active={false} label="Airway"/>
            <TeamMember role="drug" active={false} label="Drug"/>
            <TeamMember role="defib" active={false} label="Defib"/>
            <TeamMember role="leader" active={false} label="You (Leader)"/>
          </div>
          <div className="text-2xs text-text-secondary leading-relaxed pt-2 border-t border-text-primary space-y-0.5">
            <div className="flex items-start gap-1.5"><span className="text-info shrink-0">•</span><span>เลือกคำสั่งให้ทีมทำ — แต่ละคำสั่งมีตำแหน่งเป้าหมาย</span></div>
            <div className="flex items-start gap-1.5"><span className="text-info shrink-0">•</span><span>ตอบถูก: +15 <Star size={10} strokeWidth={2.4} className="inline align-text-bottom text-warning" fill="currentColor" /> (โบนัสเวลา + คอมโบ)</span></div>
            <div className="flex items-start gap-1.5"><span className="text-info shrink-0">•</span><span>ตอบผิด/หมดเวลา: -5 <Star size={10} strokeWidth={2.4} className="inline align-text-bottom text-warning" fill="currentColor" /> และผู้ป่วยอาจแย่ลง</span></div>
            <div className="flex items-start gap-1.5"><span className="text-info shrink-0">•</span><span>ทำให้ครบ algorithm จนคนไข้ ROSC</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-info">{scenario.steps.length}</div>
            <div className="stat-label">ขั้นตัดสินใจ</div>
          </div>
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-warning">{hiscore}</div>
            <div className="stat-label">Hi-Score</div>
          </div>
        </div>

        <button onClick={startGame} className="w-full btn btn-danger btn-lg btn-full font-black border-2">
          <AlertTriangle size={18} strokeWidth={2.4} /> เริ่มสถานการณ์
        </button>
      </div>
    );
  }

  // ============ DONE ============
  if (isOver) {
    const won = state.consciousness === 'rosc';
    return (
      <div className="page-container space-y-3 pb-28">
        <div className="bg-bg-secondary border-2 border-text-primary p-5 flex flex-col items-center gap-3">
          <Instructor mood={won ? 'happy' : 'sad'}/>
          <div className="text-center">
            <div className={`text-title font-black inline-flex items-center justify-center gap-2 w-full ${won ? 'text-success' : 'text-danger'}`}>
              {won ? <PartyPopper size={22} strokeWidth={2.4} /> : <Heart size={22} strokeWidth={2.4} />}
              {won ? 'ROSC สำเร็จ!' : 'Resuscitation ไม่สำเร็จ'}
            </div>
            <div className="text-caption text-text-muted mt-1">
              {won ? 'ผู้ป่วยปลอดภัย — ส่งต่อ ICU ทำ post-arrest care' : 'ลองใหม่ — ทบทวน algorithm อีกครั้ง'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-info">{score}</div>
              <div className="stat-label">Score</div>
            </div>
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-warning">{bestStreak}</div>
              <div className="stat-label">Best Combo</div>
            </div>
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-danger">{wrongCount}</div>
              <div className="stat-label">Errors</div>
            </div>
          </div>
          {score >= hiscore && score > 0 && (
            <div className="text-body-strong text-warning inline-flex items-center gap-1.5">
              <Trophy size={14} strokeWidth={2.4} /> New Hi-Score!
            </div>
          )}
        </div>
        <button onClick={startGame} className="w-full btn btn-success btn-lg btn-full font-black border-2">
          <RefreshCw size={18} strokeWidth={2.4} /> เล่นใหม่
        </button>
      </div>
    );
  }

  // ============ PLAYING ============
  const timePct = (timeLeft / TIME_PER_DECISION) * 100;
  const progressPct = ((stepIdx + (feedback ? 1 : 0)) / scenario.steps.length) * 100;

  return (
    <div className="page-container space-y-2 pb-28">
      {/* Top bar */}
      <div className="bg-bg-secondary border-2 border-text-primary p-2 flex items-center gap-2 text-2xs font-bold">
        <span className="text-info">Step {stepIdx + 1}/{scenario.steps.length}</span>
        <span className="text-warning ml-auto inline-flex items-center gap-1">
          <Star size={11} strokeWidth={2.4} fill="currentColor" /> {score}
        </span>
        <span className="text-purple inline-flex items-center gap-1">
          <Flame size={11} strokeWidth={2.4} /> x{streak}
        </span>
        <span className={`font-mono inline-flex items-center gap-1 ${timeLeft <= 5 ? 'text-danger' : 'text-text-secondary'}`}>
          <Timer size={11} strokeWidth={2.4} /> {timeLeft}s
        </span>
      </div>
      {/* Time bar */}
      <div className="h-1.5 bg-bg-tertiary border border-text-primary overflow-hidden">
        <div className="h-full bg-info linear" style={{ width: `${timePct}%`, transition: 'width 1s linear' }}/>
      </div>

      {/* ECG Monitor */}
      <EcgMonitor rhythm={state.rhythm} hr={state.hr} bp={state.bp} spo2={state.spo2} etco2={state.etco2}/>

      {/* Resus scene */}
      <div className="bg-gradient-to-b from-blue-50 to-bg-secondary border-2 border-text-primary p-2">
        {/* Top: Airway position */}
        <div className="flex justify-center mb-1">
          <TeamMember role="airway"
            active={state.airwayActive || activeTarget === 'airway'}
            label="Airway"
            status={state.airwayActive ? 'BAGGING' : ''}/>
        </div>
        {/* Middle: Drug — Patient — Defib */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-1 items-center">
          <TeamMember role="drug"
            active={activeTarget === 'drug'}
            label="Drug"
            status={state.epiGiven > 0 ? `Epi×${state.epiGiven}` : (state.ivAccess ? 'IV ready' : '')}/>
          <Patient state={state}/>
          <TeamMember role="defib"
            active={activeTarget === 'defib' || state.defibCharged}
            label="Defib"
            status={state.defibCharged ? '⚡ CHARGED' : ''}/>
        </div>
        {/* Bottom: Compressor + Leader */}
        <div className="flex justify-center gap-6 mt-1">
          <TeamMember role="compressor"
            active={state.compressorActive || activeTarget === 'compressor'}
            label="Compressor"
            status={state.compressorActive ? 'CPR ON' : ''}/>
          <TeamMember role="leader"
            active={activeTarget === 'leader'}
            label="You (Leader)"/>
        </div>
      </div>

      {/* Instructor narration */}
      <div className="bg-bg-secondary border-2 border-text-primary p-2 flex items-start gap-2">
        <Instructor mood={mood}/>
        <div className="flex-1">
          <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-snug text-slate-900">
            <span className="font-black text-info">หมอเฮีย: </span>
            {feedback ? feedback.text : step.narration}
          </div>
        </div>
      </div>

      {/* Action menu OR feedback */}
      {!feedback ? (
        <div className="space-y-1.5">
          <div className="text-overline">เลือกคำสั่งสั่งทีม</div>
          {step.commands.map((cmd, i) => (
            <button key={i} onClick={() => handlePick(cmd)}
              className="w-full p-2 text-left border-2 border-text-primary bg-bg-secondary hover:bg-bg-tertiary flex items-center gap-2 transition-colors">
              <span className="text-3xs font-black px-1.5 py-0.5 border-2 border-current inline-flex items-center gap-1"
                    style={{ color: roleColor(cmd.target) }}>
                <ChevronRight size={10} strokeWidth={2.6} /> {roleLabel(cmd.target)}
              </span>
              <span className="text-caption font-semibold flex-1">{cmd.label}</span>
              <ChevronRight size={14} strokeWidth={2} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2 animate-slide-up">
          <div className={`p-3 border-2 border-text-primary ${feedback.ok ? 'bg-success/10' : 'bg-danger/10'}`}>
            <div className={`text-body-strong font-black inline-flex items-center gap-2 ${feedback.ok ? 'text-success' : 'text-danger'}`}>
              {feedback.ok ? <Check size={16} strokeWidth={2.6} /> : <X size={16} strokeWidth={2.6} />}
              {feedback.ok ? 'ตัดสินใจถูก!' : 'ผิด — เรียนรู้แล้วไปต่อ'}
            </div>
            {feedback.ok && step.effect?.narration && (
              <div className="text-caption text-text-secondary mt-1 italic">
                {step.effect.narration}
              </div>
            )}
          </div>
          <button onClick={advance} className={`w-full btn ${feedback.ok ? 'btn-success' : 'btn-info'} btn-full font-bold border-2`}>
            {isLast || stepIdx + 1 >= scenario.steps.length ? 'จบสถานการณ์' : 'ขั้นต่อไป'}
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      )}

      <div className="progress-track mt-1">
        <div className="progress-fill bg-info" style={{ width: `${progressPct}%` }}/>
      </div>
    </div>
  );
}

function roleColor(target) {
  return {
    compressor: '#2B6CB0',
    airway: '#6B46C1',
    drug: '#276749',
    defib: '#C05621',
    leader: '#C53030',
    monitor: '#1A2332',
  }[target] || '#1A2332';
}
function roleLabel(target) {
  return {
    compressor: 'COMPRESSOR',
    airway: 'AIRWAY',
    drug: 'DRUG',
    defib: 'DEFIB',
    leader: 'YOU',
    monitor: 'MONITOR',
  }[target] || target?.toUpperCase() || '—';
}
