import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLevelById, LEVELS, GAME_BUTTONS, ERROR_TYPES } from '../data/recorderGameLevels';
import { computeStars } from '../utils/recorderGameScore';
import { loadProgress, saveResult } from '../utils/recorderGameProgress';
import { useLiveLevelEngine } from '../hooks/recordergame/useLiveLevelEngine';
import LevelIntro from '../components/recordergame/LevelIntro';
import ResultScreen from '../components/recordergame/ResultScreen';
import GameStage from '../components/recordergame/GameStage';
import ScoreHUD from '../components/recordergame/ScoreHUD';
import GameCprDashboard from '../components/recordergame/GameCprDashboard';
import GameQuickBar from '../components/recordergame/GameQuickBar';
import DataEntryModal from '../components/recordergame/DataEntryModal';
import AuditBoard from '../components/recordergame/AuditBoard';
import { Target, Clock } from 'lucide-react';

// ==========================================
// Recorder Hero — หน้าเล่นด่าน (/recorder-game/:levelId)
// phase: intro | playing | done — เลือก renderer ตาม level.type
// ==========================================
export default function RecorderGamePlay() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const level = getLevelById(levelId);

  const [phase, setPhase] = useState('intro');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!level) navigate('/recorder-game', { replace: true });
  }, [level, navigate]);

  if (!level) return null;

  const hiscore = loadProgress()[level.id]?.hiscore || 0;
  const hasNext = LEVELS.some(l => l.order === level.order + 1);

  const finalize = (raw, mode) => {
    const prior = loadProgress()[level.id] || { stars: 0, hiscore: 0 };
    const missCount = mode === 'audit'
      ? Math.max(0, (raw.totalErrors || 0) - (raw.foundCount || 0))
      : (raw.missCount || 0);
    const stars = computeStars(raw.score, raw.maxScore, missCount);
    const isNewHi = raw.score > prior.hiscore;
    saveResult(level.id, { stars, score: raw.score });
    setResult({ ...raw, mode, stars, isNewHi });
    setPhase('done');
  };

  if (phase === 'intro') {
    return <LevelIntro level={level} hiscore={hiscore}
      onStart={() => setPhase('playing')} onBack={() => navigate('/recorder-game')} />;
  }

  if (phase === 'done' && result) {
    return <ResultScreen level={level} result={result} mode={result.mode} stars={result.stars}
      isNewHi={result.isNewHi} hasNext={hasNext}
      onRetry={() => { setResult(null); setPhase('playing'); }}
      onNext={() => {
        const next = LEVELS.find(l => l.order === level.order + 1);
        if (next) { setResult(null); setPhase('intro'); navigate(`/recorder-game/${next.id}`); }
      }}
      onHub={() => navigate('/recorder-game')} />;
  }

  // phase === 'playing'
  if (level.type === 'live') {
    return <LivePlay level={level} onFinish={(raw) => finalize(raw, 'live')} />;
  }
  if (level.type === 'audit') {
    return <AuditBoard level={level} onFinish={(raw) => finalize(raw, 'audit')} />;
  }
  if (level.type === 'hunt') {
    return <HuntRunner level={level} onFinish={(raw) => finalize(raw, 'hunt')} />;
  }
  return null;
}

// ================= LIVE =================
function LivePlay({ level, onFinish }) {
  const engine = useLiveLevelEngine(level, { onFinish });
  const [modal, setModal] = useState(null); // { kind, buttonId }
  const startedRef = useRef(false);

  // เริ่มเกมหลัง mount (setTimeout เพื่อไม่ setState ตรงๆ ใน effect body)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const id = setTimeout(() => engine.start(), 0);
    return () => clearTimeout(id);
  }, [engine]);

  const onPress = useCallback((buttonId) => {
    const needs = GAME_BUTTONS[buttonId]?.needsData;
    if (needs) setModal({ kind: needs, buttonId });
    else engine.handlePress(buttonId);
  }, [engine]);

  const onSubmit = (data) => {
    if (modal) engine.handlePress(modal.buttonId, data);
    setModal(null);
  };

  const secs = Math.floor(engine.elapsed || 0);
  const cycleLabel = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative bg-bg-primary">
      <div className="shrink-0 px-3 pt-2">
        <ScoreHUD score={engine.score} streak={engine.streak} elapsed={engine.elapsed}
          popup={engine.popup} durationSec={level.durationSec || 120} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        <div className="w-full max-w-md mx-auto space-y-3">
          <GameStage scene={engine.currentScene} narration={engine.narration} />
          <GameCprDashboard onPress={onPress} scene={engine.currentScene} cycleLabel={cycleLabel} />
        </div>
      </div>

      <GameQuickBar onPress={onPress} />

      {modal && <DataEntryModal kind={modal.kind} onSubmit={onSubmit} onClose={() => setModal(null)} />}
    </div>
  );
}

// ================= HUNT =================
const HUNT_POINTS = 100;

function HuntRunner({ level, onFinish }) {
  const tasks = useMemo(() => level.tasks || [], [level]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(tasks[0]?.timeLimit || 8);
  const [wrong, setWrong] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const resultsRef = useRef([]);
  const timerRef = useRef(null);
  const failRef = useRef(null);

  const task = tasks[idx];

  const nextTask = useCallback(() => {
    if (idx + 1 >= tasks.length) {
      onFinish({
        levelId: level.id,
        score: scoreRef.current,
        maxScore: tasks.length * HUNT_POINTS,
        results: resultsRef.current.slice(),
        missCount: resultsRef.current.filter(r => r.errorType).length,
      });
      return;
    }
    setIdx(i => i + 1);
    setTimeLeft(tasks[idx + 1]?.timeLimit || 8);
    setWrong(0);
    setRevealed(false);
  }, [idx, tasks, level, onFinish]);

  // fail = หมดเวลา หรือกดผิดครบ 2 ครั้ง → เฉลย + นับ UI_LOST
  const failTask = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    resultsRef.current.push({ errorType: ERROR_TYPES.UI_LOST, prompt: task?.prompt_th });
  }, [revealed, task]);
  useEffect(() => { failRef.current = failTask; });

  // countdown (setState เกิดใน callback ของ interval — lint-safe)
  useEffect(() => {
    if (revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { failRef.current?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, revealed]);

  const handlePress = (buttonId) => {
    if (revealed) return;
    if (buttonId === task.buttonId) {
      const gained = Math.max(30, HUNT_POINTS - (task.timeLimit - timeLeft) * 8);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      resultsRef.current.push({ errorType: null, prompt: task.prompt_th });
      nextTask();
    } else {
      const w = wrong + 1;
      setWrong(w);
      if (w >= 2) failTask();
    }
  };

  if (!task) return null;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden relative bg-bg-primary">
      {/* Prompt bar */}
      <div className="shrink-0 px-3 pt-2 space-y-1">
        <div className="bg-info text-white p-2.5 flex items-center gap-2"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Target size={18} strokeWidth={2.4} className="shrink-0" />
          <div className="flex-1 text-caption font-bold">{task.prompt_th}</div>
          <div className={`font-mono font-black inline-flex items-center gap-1 ${timeLeft <= 3 ? 'text-yellow-300' : ''}`}>
            <Clock size={13} strokeWidth={2.4} /> {timeLeft}s
          </div>
        </div>
        <div className="flex items-center justify-between text-3xs text-text-muted px-1">
          <span>ข้อ {idx + 1}/{tasks.length}</span>
          <span>คะแนน {score}</span>
        </div>
      </div>

      {/* Mock screen */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        <div className="w-full max-w-md mx-auto space-y-3">
          {revealed && (
            <div className="bg-success/10 border-2 border-success/50 p-2.5 text-center animate-slide-up"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-caption font-black text-success">นี่คือปุ่มที่ถูกต้อง — จำตำแหน่งไว้!</div>
              <div className="text-3xs text-text-secondary mt-0.5">{task.hint_th}</div>
              <button onClick={nextTask} className="btn btn-success btn-sm btn-block mt-2 font-bold">
                เข้าใจแล้ว → ข้อต่อไป
              </button>
            </div>
          )}
          {wrong > 0 && !revealed && (
            <div className="text-center text-3xs text-danger">ยังไม่ใช่ปุ่มนี้ — ลองอีกครั้ง ({wrong}/2)</div>
          )}
          <GameCprDashboard onPress={handlePress}
            highlightId={revealed ? task.buttonId : null}
            scene={{ etco2: '--', shockCount: 0 }} cycleLabel="02:00" />
        </div>
      </div>

      <GameQuickBar onPress={handlePress}
        highlightId={revealed ? task.buttonId : null}
        forceMoreOpen={task.screen === 'more_sheet' && revealed} />
    </div>
  );
}
