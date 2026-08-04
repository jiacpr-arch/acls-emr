import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CASE_CATEGORY_META, CASES, pickRandomCase, caseToLevel,
} from '../data/recorderCases';
import { loadPlayablePool } from '../services/recorderCaseService';
import { LivePlay } from './RecorderGamePlay';
import Instructor from '../components/sim/Instructor';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getClassContext } from '../stores/classStore';
import { loadEndlessHiscores, saveEndlessHiscore } from '../utils/recorderGameProgress';
import { enqueueGameResult } from '../db/database';
import { scheduleFlush } from '../services/syncEngine';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import { Shuffle, Heart, Star, ArrowLeft, Play, Trophy, RefreshCw, Home } from 'lucide-react';

// ==========================================
// Recorder Hero — โหมด Endless Shuffle
// สุ่มเคสต่อเนื่อง เก็บคะแนน/เคสที่ผ่านสะสม จบเมื่อพลาดครบ MAX_MISSES
// hi-score แยกตามหมวดใน localStorage
// ==========================================
// hi-score อยู่ใน utils/recorderGameProgress.js (คีย์ acls_recgame_endless) —
// ขา restore จาก cloud ต้องเขียนคีย์เดียวกัน จึงเก็บไว้ที่เดียว
const MAX_MISSES = 3;

export default function RecorderEndless() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('select'); // select | playing | transition | done
  const [category, setCategory] = useState('all');
  const [current, setCurrent] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastSummary, setLastSummary] = useState(null);
  // pool เริ่มจาก built-in (มีเสมอ) แล้วผนวกเคสที่เผยแพร่จาก DB เมื่อโหลดเสร็จ
  const [fullPool, setFullPool] = useState(CASES);

  // ในคลาส: ก่อนเริ่มรอบครั้งแรกต้องรู้ว่าใครเล่น — pattern เดียวกับ RecorderGamePlay/CodeBlueSim
  const activeStudent = usePreCourseStore((s) => s.activeStudent);
  const [inClass] = useState(() => !!getClassContext().classCode);
  const [showIdentity, setShowIdentity] = useState(false);
  const startAfterIdentityRef = useRef(false);

  useEffect(() => {
    let alive = true;
    loadPlayablePool().then(p => { if (alive && p?.length) setFullPool(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const pool = category === 'all' ? fullPool : fullPool.filter(c => c.category === category);
  const hiscores = loadEndlessHiscores();

  const nextCase = useCallback((excludeId) => {
    return pickRandomCase(pool, Math.random() * 1e6, excludeId);
  }, [pool]);

  const start = () => {
    setTotalScore(0); setCleared(0); setMisses(0); setLastSummary(null);
    setCurrent(nextCase(null));
    setPhase('playing');
  };

  const requestStart = () => {
    if (inClass && !activeStudent?.id) {
      startAfterIdentityRef.current = true;
      setShowIdentity(true);
      return;
    }
    start();
  };

  const handleIdentityConfirm = () => {
    setShowIdentity(false);
    if (startAfterIdentityRef.current) {
      startAfterIdentityRef.current = false;
      start();
    }
  };

  const handleCaseFinish = useCallback((raw) => {
    const newTotal = totalScore + (raw.score || 0);
    const newMisses = misses + (raw.missCount || 0);
    const newCleared = cleared + 1;
    setTotalScore(newTotal);
    setMisses(newMisses);
    setCleared(newCleared);

    if (newMisses >= MAX_MISSES) {
      saveEndlessHiscore(category, newTotal);
      // เข้าคิวแล้วให้ syncEngine ส่งพร้อม retry — เดิมยิงตรงแล้ว .catch() ทิ้ง
      if (activeStudent?.id) {
        enqueueGameResult({
          kind: 'recorder',
          studentId: activeStudent.id,
          refId: `endless:${category}`,
          payload: {
            mode: 'endless', score: newTotal, maxScore: null, stars: null, missCount: newMisses,
            finishedAt: new Date().toISOString(),
          },
        });
        scheduleFlush();
      }
      setPhase('done');
      return;
    }
    setLastSummary({ title: current?.title_th, score: raw.score || 0, missCount: raw.missCount || 0 });
    setPhase('transition');
    const nxt = nextCase(current?.id);
    setTimeout(() => {
      setCurrent(nxt);
      setPhase('playing');
    }, 1400);
  }, [totalScore, misses, cleared, category, current, nextCase, activeStudent]);

  // ---------- SELECT ----------
  if (phase === 'select') {
    const cats = ['all', ...Object.keys(CASE_CATEGORY_META)];
    return (
      <div className="page-container space-y-3 pb-28">
        <button onClick={() => navigate('/recorder-game')} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} strokeWidth={2.4} /> กลับ
        </button>
        <div className="text-center pt-1 flex flex-col items-center gap-2">
          <div className="w-14 h-14 inline-flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-shock) 0%, var(--color-danger) 100%)', borderRadius: 'var(--radius-2xl)', boxShadow: '0 8px 20px rgba(220,38,38,0.3)' }}>
            <Shuffle size={26} strokeWidth={2.4} className="text-white" />
          </div>
          <h1 className="text-title text-text-primary">Endless Shuffle</h1>
          <p className="text-caption text-text-muted">สุ่มเคสต่อเนื่อง — บันทึกให้ถูก ให้ทัน เก็บคะแนนให้ได้มากที่สุด</p>
          <div className="text-2xs text-text-muted inline-flex items-center gap-1">
            <Heart size={12} strokeWidth={2.4} className="text-danger" fill="currentColor" /> พลาดได้ {MAX_MISSES} ครั้ง
          </div>
        </div>

        <div className="text-overline">เลือกหมวดเคส</div>
        <div className="grid grid-cols-2 gap-2">
          {cats.map(c => {
            const meta = c === 'all' ? { label_th: 'ทุกหมวด (สุ่มทั้งหมด)', icon: '🎲', color: 'text-text-primary' } : CASE_CATEGORY_META[c];
            const active = category === c;
            const hi = hiscores[c] || 0;
            return (
              <button key={c} onClick={() => setCategory(c)}
                className={`dash-card !p-3 text-left transition-all ${active ? 'ring-2 ring-info' : ''}`}>
                <div className={`text-caption font-black ${meta.color}`}>{meta.icon} {meta.label_th}</div>
                {hi > 0 && <div className="text-3xs text-text-muted mt-0.5 inline-flex items-center gap-1"><Star size={10} fill="currentColor" className="text-warning" /> Hi {hi}</div>}
              </button>
            );
          })}
        </div>

        <button onClick={requestStart} className="w-full btn btn-danger btn-lg btn-full font-black border-2">
          <Play size={18} strokeWidth={2.4} /> เริ่ม Endless
        </button>

        <StudentIdentityModal
          open={showIdentity}
          onClose={() => { setShowIdentity(false); startAfterIdentityRef.current = false; }}
          onConfirm={handleIdentityConfirm}
        />
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === 'done') {
    const hi = hiscores[category] || 0;
    const isNewHi = totalScore >= hi && totalScore > 0;
    return (
      <div className="page-container space-y-3 pb-28">
        <div className="bg-bg-secondary border-2 border-text-primary p-5 flex flex-col items-center gap-3">
          <Instructor mood={cleared >= 3 ? 'happy' : 'sad'} />
          <div className="text-title font-black text-info">จบรอบ!</div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-info">{totalScore}</div>
              <div className="stat-label">คะแนนรวม</div>
            </div>
            <div className="stat-box border-2 border-text-primary">
              <div className="stat-value text-success">{cleared}</div>
              <div className="stat-label">เคสที่ผ่าน</div>
            </div>
          </div>
          {isNewHi && (
            <div className="text-body-strong text-warning inline-flex items-center gap-1.5">
              <Trophy size={14} strokeWidth={2.4} /> New Hi-Score!
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={start} className="btn btn-success btn-lg btn-block font-black border-2">
            <RefreshCw size={16} strokeWidth={2.4} /> เล่นอีกรอบ
          </button>
          <button onClick={() => navigate('/recorder-game')} className="btn btn-primary btn-lg btn-block font-bold border-2">
            <Home size={16} strokeWidth={2.4} /> กลับ Hub
          </button>
        </div>
      </div>
    );
  }

  // ---------- TRANSITION ----------
  if (phase === 'transition') {
    const livesLeft = MAX_MISSES - misses;
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 bg-bg-primary px-6 text-center animate-fade-in">
        <Instructor mood={lastSummary?.missCount ? 'idle' : 'happy'} />
        <div className="text-title font-black text-success">{lastSummary?.title} ✓</div>
        <div className="text-body text-text-secondary">+{lastSummary?.score} คะแนน · รวม {totalScore}</div>
        <div className="inline-flex items-center gap-1">
          {Array.from({ length: MAX_MISSES }).map((_, i) => (
            <Heart key={i} size={20} strokeWidth={2.4}
              className={i < livesLeft ? 'text-danger' : 'text-bg-tertiary'}
              fill={i < livesLeft ? 'currentColor' : 'none'} />
          ))}
        </div>
        <div className="text-caption text-text-muted animate-pulse">เคสต่อไป…</div>
      </div>
    );
  }

  // ---------- PLAYING ----------
  if (!current) return null;
  const livesLeft = MAX_MISSES - misses;
  return (
    <div className="relative">
      <LivePlay key={current.id} level={caseToLevel(current)} onFinish={handleCaseFinish}
        hudLabel={`เคส ${cleared + 1} · ❤×${livesLeft}`} />
    </div>
  );
}
