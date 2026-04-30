import { useState, useEffect, useRef } from 'react';
import { quizLevels, totalQuestions } from '../data/quizQuestions';

const HISCORE_KEY = 'acls_quiz_hiscore';
const TIME_PER_QUESTION = 20;

// ===== Cartoon Doctor =====
// Mood drives eyes, mouth, blush, sweat, tear
function DoctorCartoon({ mood = 'idle', size = 180 }) {
  const eyes = {
    idle:    <><circle cx="65" cy="78" r="4" fill="#1A2332" /><circle cx="95" cy="78" r="4" fill="#1A2332" /></>,
    happy:   <><path d="M60 78 Q65 73 70 78" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M90 78 Q95 73 100 78" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/></>,
    sad:     <><path d="M60 80 Q65 85 70 80" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M90 80 Q95 85 100 80" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/></>,
    shock:   <><circle cx="65" cy="78" r="6" fill="white" stroke="#1A2332" strokeWidth="2"/><circle cx="95" cy="78" r="6" fill="white" stroke="#1A2332" strokeWidth="2"/><circle cx="65" cy="78" r="2.5" fill="#1A2332"/><circle cx="95" cy="78" r="2.5" fill="#1A2332"/></>,
    think:   <><circle cx="65" cy="78" r="4" fill="#1A2332" /><path d="M90 78 Q95 73 100 78" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/></>,
    cheer:   <><path d="M60 80 Q65 70 70 80" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M90 80 Q95 70 100 80" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/></>,
  }[mood] || null;

  const mouth = {
    idle:  <path d="M75 95 Q82 99 90 95" stroke="#1A2332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    happy: <path d="M70 92 Q82 105 95 92" stroke="#1A2332" strokeWidth="3" fill="#FF6B6B" strokeLinecap="round"/>,
    sad:   <path d="M70 100 Q82 92 95 100" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/>,
    shock: <ellipse cx="82" cy="98" rx="6" ry="8" fill="#1A2332"/>,
    think: <path d="M75 95 L90 95" stroke="#1A2332" strokeWidth="2.5" strokeLinecap="round"/>,
    cheer: <path d="M68 92 Q82 110 96 92 Q82 102 68 92" fill="#FF6B6B" stroke="#1A2332" strokeWidth="2.5"/>,
  }[mood] || null;

  const showSweat = mood === 'shock' || mood === 'sad';
  const showTear = mood === 'sad';
  const showBlush = mood === 'happy' || mood === 'cheer';
  const bobClass = mood === 'cheer' ? 'animate-bounce-cute' : (mood === 'shock' ? 'animate-shake-cute' : 'animate-bob-cute');

  return (
    <svg viewBox="0 0 165 220" width={size} height={size * 220 / 165} className={bobClass}>
      {/* Coat shoulders */}
      <path d="M30 200 L30 160 Q30 130 82 130 Q135 130 135 160 L135 200 Z" fill="white" stroke="#1A2332" strokeWidth="2.5"/>
      <line x1="82" y1="130" x2="82" y2="200" stroke="#1A2332" strokeWidth="2"/>
      {/* Coat pocket */}
      <rect x="42" y="170" width="22" height="18" fill="none" stroke="#1A2332" strokeWidth="1.5"/>
      <rect x="48" y="172" width="3" height="10" fill="#2B6CB0"/>
      <rect x="54" y="172" width="3" height="10" fill="#C53030"/>
      {/* Stethoscope */}
      <path d="M65 130 Q60 155 75 165 Q90 175 95 160" stroke="#1A2332" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="95" cy="160" r="6" fill="#C0C8D2" stroke="#1A2332" strokeWidth="2"/>
      <circle cx="95" cy="160" r="2.5" fill="#1A2332"/>
      {/* Neck */}
      <rect x="72" y="120" width="20" height="15" fill="#FFD7B5" stroke="#1A2332" strokeWidth="2"/>
      {/* Face */}
      <ellipse cx="82" cy="80" rx="38" ry="42" fill="#FFD7B5" stroke="#1A2332" strokeWidth="2.5"/>
      {/* Hair */}
      <path d="M44 70 Q44 35 82 32 Q120 35 120 70 Q120 55 105 50 Q90 60 75 50 Q60 55 50 60 Q44 62 44 70 Z" fill="#1A2332"/>
      {/* Cap stripe (medical) */}
      <path d="M55 50 Q82 36 109 50 L109 56 Q82 42 55 56 Z" fill="#C53030"/>
      <rect x="80" y="42" width="4" height="10" fill="white"/>
      <rect x="77" y="45" width="10" height="4" fill="white"/>
      {/* Ears */}
      <ellipse cx="44" cy="82" rx="4" ry="6" fill="#FFD7B5" stroke="#1A2332" strokeWidth="2"/>
      <ellipse cx="120" cy="82" rx="4" ry="6" fill="#FFD7B5" stroke="#1A2332" strokeWidth="2"/>
      {/* Blush */}
      {showBlush && <>
        <ellipse cx="58" cy="92" rx="6" ry="3" fill="#FFB3B3" opacity="0.7"/>
        <ellipse cx="106" cy="92" rx="6" ry="3" fill="#FFB3B3" opacity="0.7"/>
      </>}
      {/* Eyes */}
      {eyes}
      {/* Mouth */}
      {mouth}
      {/* Sweat */}
      {showSweat && <path d="M122 60 Q126 70 122 75 Q118 70 122 60 Z" fill="#5BAEDB" stroke="#1A2332" strokeWidth="1.5"/>}
      {/* Tear */}
      {showTear && <path d="M58 92 Q56 100 58 105 Q60 100 58 92 Z" fill="#5BAEDB" stroke="#1A2332" strokeWidth="1"/>}
    </svg>
  );
}

// ===== Patient (Heart) Cartoon =====
function HeartPatient({ hp = 100, size = 80 }) {
  const isCritical = hp <= 30;
  const isDead = hp <= 0;
  const fill = isDead ? '#8896A6' : (isCritical ? '#C53030' : '#E53E3E');
  const eyeY = isDead ? 50 : 48;
  const wobble = isCritical && !isDead ? 'animate-shake-cute' : (isDead ? '' : 'animate-bob-cute');

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={wobble}>
      <path d="M50 85 C 20 65, 10 40, 30 25 C 40 18, 50 25, 50 35 C 50 25, 60 18, 70 25 C 90 40, 80 65, 50 85 Z"
            fill={fill} stroke="#1A2332" strokeWidth="2.5"/>
      {isDead ? (
        <>
          <path d="M40 45 L48 53 M48 45 L40 53" stroke="#1A2332" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 45 L63 53 M63 45 L55 53" stroke="#1A2332" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M40 65 Q50 60 60 65" stroke="#1A2332" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="42" cy={eyeY} r="3" fill="white"/>
          <circle cx="58" cy={eyeY} r="3" fill="white"/>
          <circle cx="42" cy={eyeY + 1} r="1.5" fill="#1A2332"/>
          <circle cx="58" cy={eyeY + 1} r="1.5" fill="#1A2332"/>
          {isCritical
            ? <path d="M42 65 Q50 70 58 65" stroke="#1A2332" strokeWidth="2" fill="none" strokeLinecap="round"/>
            : <path d="M42 60 Q50 68 58 60" stroke="#1A2332" strokeWidth="2" fill="none" strokeLinecap="round"/>}
        </>
      )}
    </svg>
  );
}

// ===== Speech Bubble =====
function SpeechBubble({ children, color = '#FFFFFF' }) {
  return (
    <div className="relative w-full">
      <div className="bg-white border-2 border-text-primary p-3 text-sm leading-relaxed text-text-primary"
           style={{ background: color, minHeight: 60 }}>
        {children}
      </div>
      {/* Tail pointing down-left */}
      <svg width="24" height="14" viewBox="0 0 24 14" className="absolute -bottom-3 left-8">
        <polygon points="0,0 24,0 6,14" fill={color} stroke="#1A2332" strokeWidth="2"/>
        <line x1="1" y1="1" x2="23" y2="1" stroke={color} strokeWidth="2"/>
      </svg>
    </div>
  );
}

// ===== Main game =====
export default function QuizGame() {
  const [phase, setPhase] = useState('intro'); // intro | playing | levelDone | gameOver | victory
  const [levelIdx, setLevelIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [mood, setMood] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [hiscore, setHiscore] = useState(() => Number(localStorage.getItem(HISCORE_KEY) || 0));
  const timerRef = useRef(null);
  const handleAnswerRef = useRef(null);

  const level = quizLevels[levelIdx];
  const question = level?.questions[qIdx];
  const totalAnswered = quizLevels.slice(0, levelIdx).reduce((s, l) => s + l.questions.length, 0) + qIdx;

  const handleAnswer = (idx) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setPicked(idx);
    setRevealed(true);
    const correct = idx === question.answer;
    if (correct) {
      const bonus = Math.floor(timeLeft / 4);
      const comboBonus = streak >= 2 ? 5 : 0;
      const gained = 10 + bonus + comboBonus;
      setScore(s => s + gained);
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        return ns;
      });
      setMood('happy');
    } else {
      setHp(h => Math.max(0, h - 25));
      setStreak(0);
      setMood(idx === -1 ? 'shock' : 'sad');
    }
  };

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing' || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleAnswerRef.current?.(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, revealed, qIdx, levelIdx]);

  const resetForQuestion = () => {
    setTimeLeft(TIME_PER_QUESTION);
    setMood('think');
    setPicked(null);
    setRevealed(false);
  };

  const startGame = () => {
    setLevelIdx(0); setQIdx(0); setHp(100); setScore(0);
    setStreak(0); setBestStreak(0); setPhase('playing');
    resetForQuestion();
  };

  const next = () => {
    if (hp <= 0) {
      finishGame();
      return;
    }
    if (qIdx + 1 < level.questions.length) {
      setQIdx(qIdx + 1);
      resetForQuestion();
    } else if (levelIdx + 1 < quizLevels.length) {
      setPhase('levelDone');
    } else {
      finishGame(true);
    }
  };

  const finishGame = (won = false) => {
    if (score > hiscore) {
      localStorage.setItem(HISCORE_KEY, String(score));
      setHiscore(score);
    }
    setPhase(won ? 'victory' : 'gameOver');
  };

  const nextLevel = () => {
    setLevelIdx(i => i + 1);
    setQIdx(0);
    setHp(h => Math.min(100, h + 30));
    setPhase('playing');
    resetForQuestion();
  };

  // ===== Renders =====
  if (phase === 'intro') {
    return (
      <div className="page-container space-y-4 pb-28">
        <div className="text-center space-y-2 pt-2">
          <h1 className="text-2xl font-black text-text-primary">🎮 ACLS Quiz Quest</h1>
          <p className="text-xs text-text-muted">เกมตอบคำถามฝึกทักษะ ALS · ตัวละครการ์ตูนพาเล่น</p>
        </div>
        <div className="bg-bg-secondary border-2 border-text-primary p-5 flex flex-col items-center gap-3">
          <DoctorCartoon mood="cheer" size={170} />
          <div className="w-full">
            <SpeechBubble color="#FFF8E1">
              <div className="font-bold mb-1">สวัสดีค่ะ! ฉันคือ <span className="text-info">หมอเฮีย</span></div>
              <div className="text-xs">มาช่วยกันช่วยชีวิตผู้ป่วยกันเถอะ! ตอบคำถามถูก = ผู้ป่วยปลอดภัย, ตอบผิด = HP ลดลง</div>
            </SpeechBubble>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-lg text-info">{quizLevels.length}</div>
            <div className="stat-label">Levels</div>
          </div>
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-lg text-text-primary">{totalQuestions}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-lg text-danger">100</div>
            <div className="stat-label">HP เริ่มต้น</div>
          </div>
          <div className="stat-box border-2 border-text-primary">
            <div className="stat-value text-lg text-warning">{hiscore}</div>
            <div className="stat-label">Hi-Score</div>
          </div>
        </div>

        <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2 text-xs text-text-secondary">
          <div className="font-bold text-text-primary">วิธีเล่น</div>
          <div>• ตอบถูก: +10 คะแนน + โบนัสเวลา + คอมโบ</div>
          <div>• ตอบผิด/หมดเวลา: HP -25</div>
          <div>• HP เป็น 0 = Game Over</div>
          <div>• ผ่านครบทุกเลเวล = ชนะ + ใบรับรอง 🏆</div>
        </div>

        <button onClick={startGame} className="w-full btn btn-success btn-lg btn-full font-black border-2">
          ▶️ เริ่มเล่น
        </button>
      </div>
    );
  }

  if (phase === 'levelDone') {
    return (
      <div className="page-container space-y-4 pb-28">
        <div className="bg-bg-secondary border-2 border-text-primary p-6 flex flex-col items-center gap-3 animate-slide-up">
          <DoctorCartoon mood="cheer" size={170} />
          <div className="text-center">
            <div className="text-2xl font-black text-success">ผ่านเลเวล {level.id}!</div>
            <div className="text-xs text-text-muted mt-1">{level.name} · ชนะ {level.boss}</div>
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
              <div className="stat-value text-danger">{hp}</div>
              <div className="stat-label">HP</div>
            </div>
          </div>
          <div className="text-xs text-success">+30 HP โบนัสผ่านด่าน</div>
        </div>

        <button onClick={nextLevel} className="w-full btn btn-info btn-lg btn-full font-black border-2">
          เลเวลถัดไป → {quizLevels[levelIdx + 1]?.name}
        </button>
      </div>
    );
  }

  if (phase === 'gameOver' || phase === 'victory') {
    const won = phase === 'victory';
    return (
      <div className="page-container space-y-4 pb-28">
        <div className="bg-bg-secondary border-2 border-text-primary p-6 flex flex-col items-center gap-4 animate-slide-up">
          <DoctorCartoon mood={won ? 'cheer' : 'sad'} size={180} />
          <div className="text-center">
            <div className={`text-3xl font-black ${won ? 'text-success' : 'text-danger'}`}>
              {won ? '🏆 ผ่านครบทุกเลเวล!' : '💔 Game Over'}
            </div>
            <div className="text-xs text-text-muted mt-2">
              {won ? 'คุณคือ ACLS Hero แห่งห้องฉุกเฉิน!' : 'อย่ายอมแพ้ — ลองใหม่ได้!'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-2xl text-info">{score}</div>
              <div className="stat-label">Final Score</div>
            </div>
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-2xl text-warning">{bestStreak}</div>
              <div className="stat-label">Best Combo</div>
            </div>
          </div>
          {score >= hiscore && score > 0 && (
            <div className="text-sm font-bold text-warning">⭐ New Hi-Score!</div>
          )}
          <div className="text-xs text-text-muted">Hi-Score: {hiscore}</div>
        </div>
        <button onClick={startGame} className="w-full btn btn-success btn-lg btn-full font-black border-2">
          🔁 เล่นใหม่
        </button>
      </div>
    );
  }

  // ===== PLAYING =====
  const hpPct = Math.max(0, hp);
  const timePct = (timeLeft / TIME_PER_QUESTION) * 100;
  const totalPct = ((totalAnswered) / totalQuestions) * 100;

  return (
    <div className="page-container space-y-3 pb-28">
      {/* Top stats bar */}
      <div className="bg-bg-secondary border-2 border-text-primary p-2 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-info">L{level.id} · {level.name}</span>
          <span className="ml-auto text-warning">⭐ {score}</span>
          <span className="text-purple">🔥 x{streak}</span>
        </div>
        {/* HP bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-danger w-6">HP</span>
          <div className="flex-1 h-3 bg-bg-tertiary border border-text-primary overflow-hidden">
            <div className="h-full transition-all duration-300"
                 style={{ width: `${hpPct}%`, background: hpPct > 50 ? '#276749' : (hpPct > 20 ? '#B7791F' : '#C53030') }}/>
          </div>
          <span className="text-[10px] font-bold text-text-secondary w-8 text-right">{hp}</span>
        </div>
        {/* Time bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-info w-6">⏱</span>
          <div className="flex-1 h-2 bg-bg-tertiary border border-text-primary overflow-hidden">
            <div className="h-full bg-info transition-all duration-1000 linear"
                 style={{ width: `${timePct}%` }}/>
          </div>
          <span className="text-[10px] font-mono w-8 text-right">{timeLeft}s</span>
        </div>
      </div>

      {/* Cartoon scene */}
      <div className="bg-bg-secondary border-2 border-text-primary p-3 relative">
        <div className="flex items-end gap-2">
          <DoctorCartoon mood={mood} size={130} />
          <div className="flex-1 pb-3">
            <SpeechBubble color="#FFF8E1">
              <div className="text-xs font-bold leading-snug">{question.q}</div>
            </SpeechBubble>
          </div>
        </div>
        {/* Patient lower-right */}
        <div className="absolute bottom-2 right-2 flex flex-col items-center">
          <HeartPatient hp={hp} size={60}/>
          <div className="text-[9px] text-text-muted mt-1">ผู้ป่วย</div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = revealed && i === question.answer;
          const isWrong = revealed && i === picked && i !== question.answer;
          const cls = isCorrect
            ? 'bg-success text-white border-text-primary'
            : isWrong
              ? 'bg-danger text-white border-text-primary'
              : revealed
                ? 'bg-bg-tertiary text-text-muted border-text-muted'
                : 'bg-bg-secondary text-text-primary border-text-primary hover:bg-bg-tertiary';
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
              className={`w-full p-3 text-left text-sm font-semibold border-2 transition-colors flex items-center gap-2 ${cls}`}>
              <span className="font-black w-6 text-center border-2 border-current py-0.5 text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrect && <span>✓</span>}
              {isWrong && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Reveal panel */}
      {revealed && (
        <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2 animate-slide-up">
          <div className={`text-sm font-black ${picked === question.answer ? 'text-success' : 'text-danger'}`}>
            {picked === question.answer ? '✅ ถูกต้อง!' : (picked === -1 ? '⏰ หมดเวลา!' : '❌ ผิด')}
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">💡 {question.explain}</div>
          <button onClick={next} className="w-full btn btn-info font-bold border-2 mt-1">
            ถัดไป →
          </button>
        </div>
      )}

      {/* Overall progress */}
      <div className="text-[10px] text-text-muted text-center">
        ข้อ {totalAnswered + 1} / {totalQuestions}
      </div>
      <div className="progress-track">
        <div className="progress-fill bg-info" style={{ width: `${totalPct}%` }}/>
      </div>
    </div>
  );
}
