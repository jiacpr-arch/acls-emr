import { useState, useEffect, useRef } from 'react';
import { scenario } from '../data/codeBlueScenarios';
import {
  AlertTriangle, RefreshCw, Star, Flame, Timer, Check, X,
  PartyPopper, Heart, ChevronRight, Trophy,
} from 'lucide-react';

const HISCORE_KEY = 'acls_codeblue_hiscore';
const TIME_PER_DECISION = 25;

// ============ ECG MONITOR ============
function EcgMonitor({ rhythm, hr, bp, spo2, etco2 }) {
  // Path generators per rhythm — repeated 3x to fill the strip
  const paths = {
    flat: 'M0 30 L600 30',
    vf:   'M0 30 ' + Array.from({ length: 60 }).map((_, i) => {
      const x = i * 10;
      // deterministic chaotic-ish pattern (no Math.random — pure for SSR/render safety)
      const y = 30 + (Math.sin(i * 1.7) * 14) + (Math.cos(i * 2.9) * 10) + ((i * 7) % 13 - 6);
      return `L${x} ${y}`;
    }).join(' '),
    vt:   'M0 30 ' + Array.from({ length: 12 }).map((_, i) => {
      const x = i * 50;
      return `L${x} 30 L${x + 8} 5 L${x + 16} 55 L${x + 24} 30 L${x + 50} 30`;
    }).join(' '),
    nsr:  'M0 30 ' + Array.from({ length: 4 }).map((_, i) => {
      const x = i * 150;
      return `L${x + 20} 30 L${x + 25} 26 L${x + 30} 30 L${x + 60} 30 L${x + 65} 5 L${x + 70} 55 L${x + 75} 30 L${x + 110} 30 L${x + 120} 22 L${x + 130} 30 L${x + 150} 30`;
    }).join(' '),
  };
  const color = rhythm === 'vf' || rhythm === 'vt' ? '#FF4444' : (rhythm === 'flat' ? '#8896A6' : '#22DD66');

  return (
    <div className="bg-black border-2 border-text-primary p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] font-mono text-green-400 font-bold">ECG · {rhythm.toUpperCase()}</div>
        <div className="text-[9px] font-mono text-green-400">PT MONITOR</div>
      </div>
      <svg viewBox="0 0 600 60" className="w-full" style={{ height: 50, background: '#040810' }}>
        <path d={paths[rhythm] || paths.flat} fill="none" stroke={color} strokeWidth="1.8"
              className={rhythm !== 'flat' ? 'animate-ecg-scroll' : ''}/>
      </svg>
      <div className="grid grid-cols-4 gap-1 mt-2">
        <Vital label="HR" value={hr || '--'} unit="" color="text-green-400"/>
        <Vital label="BP" value={bp || '--/--'} unit="" color="text-yellow-300"/>
        <Vital label="SpO₂" value={spo2 ? `${spo2}` : '--'} unit="%" color="text-cyan-300"/>
        <Vital label="EtCO₂" value={etco2 || '--'} unit="" color="text-orange-300"/>
      </div>
    </div>
  );
}
function Vital({ label, value, unit, color }) {
  return (
    <div className="bg-black/60 border border-gray-700 px-1 py-0.5 text-center">
      <div className="text-[9px] text-gray-400 font-bold">{label}</div>
      <div className={`font-mono font-black text-sm ${color}`}>{value}<span className="text-[9px]">{unit}</span></div>
    </div>
  );
}

// ============ TEAM MEMBER CHARACTERS ============
function TeamMember({ role, active, label, status }) {
  const colors = {
    compressor: { coat: '#2B6CB0', accent: '#1e4e8c' },
    airway:     { coat: '#6B46C1', accent: '#553399' },
    drug:       { coat: '#276749', accent: '#1c4d35' },
    defib:      { coat: '#C05621', accent: '#923f18' },
    leader:     { coat: '#C53030', accent: '#9B2C2C' },
  }[role];

  const animClass = active ? {
    compressor: 'animate-pump',
    airway: 'animate-bag',
    drug: 'animate-inject',
    defib: 'animate-zap',
    leader: 'animate-bob-cute',
  }[role] : '';

  return (
    <div className={`flex flex-col items-center gap-0.5 transition-all ${active ? 'scale-110' : ''}`}>
      <div className={`${animClass} ${active ? 'drop-shadow-[0_0_6px_rgba(43,108,176,0.55)]' : ''}`}>
        <svg viewBox="0 0 60 80" width="56" height="74">
          {/* Active highlight ring */}
          {active && <rect x="2" y="2" width="56" height="76" fill="none" stroke={colors.coat} strokeWidth="2" strokeDasharray="3 2"/>}
          {/* Head */}
          <ellipse cx="30" cy="18" rx="14" ry="15" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1.8"/>
          {/* Hair */}
          <path d="M16 18 Q16 4 30 4 Q44 4 44 18 Q44 12 36 11 Q30 14 24 11 Q16 12 16 18 Z" fill="#1A2332"/>
          {/* Cap */}
          {role === 'leader' && <path d="M18 12 Q30 5 42 12 L42 16 Q30 9 18 16 Z" fill="#C53030"/>}
          {/* Eyes */}
          <circle cx="25" cy="18" r="1.5" fill="#1A2332"/>
          <circle cx="35" cy="18" r="1.5" fill="#1A2332"/>
          {/* Mouth */}
          <path d="M27 24 Q30 26 33 24" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          {/* Body / Coat */}
          <path d="M14 75 L14 45 Q14 33 30 33 Q46 33 46 45 L46 75 Z" fill={colors.coat} stroke={colors.accent} strokeWidth="1.5"/>
          {/* Stethoscope (leader) */}
          {role === 'leader' && <>
            <path d="M22 33 Q18 45 26 50 Q34 55 38 48" stroke="#1A2332" strokeWidth="1.5" fill="none"/>
            <circle cx="38" cy="48" r="2.5" fill="#888"/>
          </>}
          {/* Hands holding tool */}
          {role === 'compressor' && <>
            <rect x="22" y="40" width="16" height="6" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
            <rect x="24" y="46" width="12" height="4" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
          </>}
          {role === 'airway' && <>
            <ellipse cx="30" cy="48" rx="8" ry="5" fill="#5BAEDB" stroke="#1A2332" strokeWidth="1.2"/>
            <rect x="28" y="42" width="4" height="6" fill="#222"/>
          </>}
          {role === 'drug' && <>
            <rect x="38" y="38" width="14" height="3" fill="#E8ECF1" stroke="#1A2332" strokeWidth="1"/>
            <rect x="34" y="38.5" width="4" height="2" fill="#FFD7B5"/>
            <line x1="52" y1="39.5" x2="58" y2="39.5" stroke="#1A2332" strokeWidth="1"/>
          </>}
          {role === 'defib' && <>
            <rect x="36" y="40" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1.2"/>
            <text x="43" y="48" textAnchor="middle" fontSize="8" fontWeight="bold">⚡</text>
          </>}
        </svg>
      </div>
      <div className={`text-[10px] font-black px-1 ${active ? 'bg-info text-white' : 'text-text-primary'}`}>{label}</div>
      {status && <div className="text-[9px] font-mono font-bold text-success bg-success/10 px-1 border border-success">{status}</div>}
    </div>
  );
}

// ============ PATIENT ON BED ============
function Patient({ state }) {
  const isROSC = state.consciousness === 'rosc';
  const skinColor = isROSC ? '#FFD7B5' : (state.consciousness === 'unresponsive' ? '#C8C0B5' : '#FFD7B5');
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 90" width="200" height="90">
        {/* Bed */}
        <rect x="5" y="55" width="190" height="28" fill="#E8ECF1" stroke="#1A2332" strokeWidth="2"/>
        <rect x="0" y="70" width="200" height="14" fill="#8896A6" stroke="#1A2332" strokeWidth="2"/>
        <rect x="2" y="60" width="6" height="20" fill="#1A2332"/>
        <rect x="192" y="60" width="6" height="20" fill="#1A2332"/>
        {/* Pillow */}
        <ellipse cx="30" cy="55" rx="20" ry="6" fill="white" stroke="#1A2332" strokeWidth="1.5"/>
        {/* Body (sheet covered) */}
        <path d="M50 55 L180 55 Q185 55 185 60 L185 65 Q120 70 50 65 Z" fill="#5BAEDB" stroke="#1A2332" strokeWidth="2"/>
        <path d="M155 55 L180 55 L180 65 L155 65 Z" fill="white" stroke="#1A2332" strokeWidth="1.5"/>
        {/* Feet */}
        <path d="M178 55 L185 50 L186 60 Z" fill={skinColor} stroke="#1A2332" strokeWidth="1.2"/>
        {/* Head */}
        <ellipse cx="30" cy="48" rx="14" ry="13" fill={skinColor} stroke="#1A2332" strokeWidth="2"/>
        {/* Hair */}
        <path d="M17 48 Q17 36 30 35 Q43 36 43 48 Q43 42 36 41 Q30 44 24 41 Q17 42 17 48 Z" fill="#1A2332"/>
        {/* Face */}
        {isROSC ? <>
          <path d="M25 48 Q26 46 27 48" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          <path d="M33 48 Q34 46 35 48" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          <path d="M27 53 Q30 56 33 53" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
        </> : <>
          <path d="M24 48 L28 50 M28 48 L24 50" stroke="#1A2332" strokeWidth="1.2"/>
          <path d="M32 48 L36 50 M36 48 L32 50" stroke="#1A2332" strokeWidth="1.2"/>
          <line x1="27" y1="54" x2="33" y2="54" stroke="#1A2332" strokeWidth="1.2"/>
        </>}
        {/* IV line */}
        {state.ivAccess && <>
          <line x1="50" y1="58" x2="60" y2="40" stroke="#5BAEDB" strokeWidth="1.5"/>
          <rect x="56" y="32" width="10" height="14" fill="#E8ECF1" stroke="#1A2332" strokeWidth="1"/>
          <text x="61" y="42" textAnchor="middle" fontSize="6" fill="#1A2332">IV</text>
        </>}
        {/* CPR indicator (hands on chest) */}
        {state.compressorActive && <g className="animate-pump-hands">
          <ellipse cx="100" cy="50" rx="6" ry="3" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
        </g>}
        {/* BVM mask */}
        {state.airwayActive && <ellipse cx="30" cy="48" rx="10" ry="6" fill="#5BAEDB" fillOpacity="0.6" stroke="#1A2332" strokeWidth="1.2"/>}
        {/* Defib pads */}
        {state.defibCharged && <>
          <rect x="80" y="48" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1"/>
          <rect x="115" y="48" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1"/>
        </>}
      </svg>
    </div>
  );
}

// ============ DOCTOR INSTRUCTOR ============
function Instructor({ mood = 'idle' }) {
  const eye = mood === 'happy'
    ? <><path d="M28 32 Q31 29 34 32" stroke="#1A2332" strokeWidth="1.8" fill="none"/><path d="M40 32 Q43 29 46 32" stroke="#1A2332" strokeWidth="1.8" fill="none"/></>
    : <><circle cx="31" cy="32" r="2" fill="#1A2332"/><circle cx="43" cy="32" r="2" fill="#1A2332"/></>;
  const mouth = mood === 'happy'
    ? <path d="M30 40 Q37 46 44 40" stroke="#1A2332" strokeWidth="1.8" fill="#FF6B6B"/>
    : mood === 'sad'
      ? <path d="M30 44 Q37 38 44 44" stroke="#1A2332" strokeWidth="1.8" fill="none"/>
      : <path d="M32 41 Q37 44 42 41" stroke="#1A2332" strokeWidth="1.5" fill="none"/>;
  return (
    <svg viewBox="0 0 75 80" width="60" height="64" className="animate-bob-cute">
      <path d="M12 78 L12 60 Q12 48 37 48 Q62 48 62 60 L62 78 Z" fill="white" stroke="#1A2332" strokeWidth="1.8"/>
      <ellipse cx="37" cy="35" rx="18" ry="20" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1.8"/>
      <path d="M19 28 Q19 8 37 7 Q55 8 55 28 Q55 18 47 16 Q37 22 27 16 Q19 18 19 28 Z" fill="#1A2332"/>
      <path d="M22 18 Q37 8 52 18 L52 22 Q37 12 22 22 Z" fill="#C53030"/>
      <rect x="35" y="13" width="3" height="7" fill="white"/>
      <rect x="33" y="15" width="7" height="3" fill="white"/>
      {eye}
      {mouth}
      <path d="M28 48 Q24 60 33 65" stroke="#1A2332" strokeWidth="1.5" fill="none"/>
      <circle cx="33" cy="65" r="3" fill="#888"/>
    </svg>
  );
}

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
            <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-relaxed text-text-primary">
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
          <div className="text-[11px] text-text-secondary leading-relaxed pt-2 border-t border-text-primary space-y-0.5">
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
      <div className="bg-bg-secondary border-2 border-text-primary p-2 flex items-center gap-2 text-[11px] font-bold">
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
          <div className="bg-yellow-50 border-2 border-text-primary p-2 text-xs leading-snug text-text-primary">
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
              <span className="text-[10px] font-black px-1.5 py-0.5 border-2 border-current inline-flex items-center gap-1"
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
