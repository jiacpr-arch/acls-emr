import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Check, X, RotateCcw, Play, Pause, ChevronLeft,
} from 'lucide-react';
import EKGWaveform from '../components/EKGWaveform';
import PageHero from '../components/PageHero';
import {
  rhythmQuizQuestions, DECISION_LABELS, DECISION_OPTIONS,
  RHYTHM_QUIZ_PASS_PERCENT, RHYTHM_QUIZ_PASSED_KEY,
} from '../data/rhythmDecisionQuiz';

// Adapted from ALSKnowledge.jsx's EKG-quiz tab (ACLS) — same waveform component,
// but the question is "what electrical treatment does this rhythm need?" instead
// of "name this rhythm" (see rhythmDecisionQuiz.js for why category filtering
// was dropped: the 4 topic buckets here ARE the answer choices, so filtering by
// one would give the answer away).
export default function RhythmQuiz() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [seed] = useState(() => Date.now() % 100000);
  const [live, setLive] = useState(true);

  const order = useMemo(() => {
    const arr = rhythmQuizQuestions.map((_, i) => i);
    let s = seed || 1;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [seed]);

  const total = rhythmQuizQuestions.length;
  const q = rhythmQuizQuestions[order[idx]];
  const done = idx >= total;

  const handleAnswer = (opt) => {
    if (choice) return;
    setChoice(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  };
  const handleNext = () => {
    if (idx + 1 >= total) {
      const pct = Math.round((score / Math.max(total, 1)) * 100);
      if (pct >= RHYTHM_QUIZ_PASS_PERCENT) localStorage.setItem(RHYTHM_QUIZ_PASSED_KEY, 'true');
    }
    setChoice(null);
    setIdx((i) => i + 1);
  };
  const reset = () => { setIdx(0); setChoice(null); setScore(0); };

  const passed = (score / Math.max(total, 1)) * 100 >= RHYTHM_QUIZ_PASS_PERCENT;

  return (
    <div className="page-container space-y-4 pb-24">
      <button onClick={() => navigate('/learn')} className="btn btn-ghost btn-sm inline-flex items-center gap-1.5">
        <ChevronLeft size={14} strokeWidth={2.4} /> กลับ
      </button>
      <PageHero
        eyebrow="Defibrillation & Electrical Therapy"
        title="Rhythm Decision Quiz"
        desc="ดูจังหวะบนจอมอนิเตอร์ แล้วเลือกว่าต้องทำหัตถการไฟฟ้าอะไร — ช็อกทันที, cardioversion, pacing, หรือไม่ต้องทำอะไรเลย"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-caption">
          <span className="text-text-muted">
            ข้อ <span className="text-text-primary font-bold">{Math.min(idx + 1, total)}</span> / {total}
          </span>
          <span className="text-text-muted">
            คะแนน: <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{score}</span>
          </span>
        </div>
        <div className="progress-track !h-1.5">
          <div className="progress-fill" style={{ width: `${(Math.min(idx, total) / Math.max(total, 1)) * 100}%`, background: 'var(--color-accent)' }} />
        </div>

        {!done && q && (
          <div className="dash-card space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-overline inline-flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                <Activity size={12} strokeWidth={2.2} /> จังหวะนี้ต้องทำอะไร?
              </div>
              {q.pulse === 'none' && (
                <span className="px-2 py-0.5 text-2xs font-bold bg-danger/15 text-danger border border-danger/40" style={{ borderRadius: 99 }}>
                  คลำชีพจรไม่ได้ · NO PULSE
                </span>
              )}
              {q.pulse === 'present' && (
                <span className="px-2 py-0.5 text-2xs font-bold bg-success/15 text-success border border-success/40" style={{ borderRadius: 99 }}>
                  มีชีพจร · PULSE PRESENT
                </span>
              )}
            </div>
            <div className="overflow-hidden border border-border" style={{ borderRadius: 'var(--radius-sm)' }}>
              <EKGWaveform rhythmId={q.rhythmId} variant={live ? 'monitor' : 'paper'} animate={live} />
            </div>
            <button onClick={() => setLive((v) => !v)} className="btn btn-ghost btn-sm w-full">
              {live ? (<><Pause size={13} strokeWidth={2.2} /> หยุดคลื่น — ดูแบบกระดาษ EKG</>) : (<><Play size={13} strokeWidth={2.2} /> ให้คลื่นวิ่งแบบจอมอนิเตอร์</>)}
            </button>
            <div className="grid gap-2">
              {DECISION_OPTIONS.map((opt) => {
                const isAnswered = choice !== null;
                const isCorrect = opt === q.answer;
                const isPicked = opt === choice;
                let cls = 'bg-bg-secondary border-border text-text-primary hover:bg-bg-tertiary';
                if (isAnswered) {
                  if (isCorrect) cls = 'bg-success/15 border-success/50 text-success';
                  else if (isPicked) cls = 'bg-danger/15 border-danger/50 text-danger';
                  else cls = 'bg-bg-secondary border-border text-text-muted opacity-60';
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={isAnswered}
                    className={`px-3 py-2.5 border text-caption font-bold transition-colors text-left inline-flex items-center justify-between gap-2 ${cls}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <span>{DECISION_LABELS[opt]}</span>
                    {isAnswered && isCorrect && <Check size={14} strokeWidth={2.4} />}
                    {isAnswered && isPicked && !isCorrect && <X size={14} strokeWidth={2.4} />}
                  </button>
                );
              })}
            </div>
            {choice && (
              <div className="animate-slide-up space-y-2">
                <div className={`p-3 border-l-4 ${choice === q.answer ? 'bg-success/8 border-l-success' : 'bg-warning/8 border-l-warning'}`}
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <div className={`text-caption font-bold mb-1 ${choice === q.answer ? 'text-success' : 'text-warning'}`}>
                    {choice === q.answer ? 'ถูกต้อง!' : `เฉลย: ${DECISION_LABELS[q.answer]}`}
                  </div>
                  <div className="text-caption text-text-secondary leading-relaxed">{q.hint}</div>
                </div>
                <button onClick={handleNext} className="btn btn-primary btn-block">
                  {idx + 1 >= total ? 'ดูสรุปคะแนน' : 'ข้อถัดไป'}
                </button>
              </div>
            )}
          </div>
        )}

        {done && (
          <div className="dash-card text-center space-y-3 animate-slide-up">
            <div className={`text-numeric text-5xl ${score / total >= 0.8 ? 'text-success' : score / total >= 0.5 ? 'text-warning' : 'text-danger'}`}>
              {score}<span className="text-2xl text-text-muted">/{total}</span>
            </div>
            <div className="text-caption text-text-muted">
              {score / total >= 0.8 ? 'เยี่ยมมาก! ตัดสินใจแม่นยำ' : score / total >= 0.5 ? 'ผ่านได้ ลองฝึกซ้ำเพื่อแม่นขึ้น' : 'ทบทวนบทเรียนแล้วลองใหม่ครับ'}
            </div>
            {passed && (
              <div className="text-caption text-success font-bold inline-flex items-center justify-center gap-1.5 w-full">
                <Check size={14} strokeWidth={2.6} /> ผ่าน Rhythm Quiz (เกณฑ์ {RHYTHM_QUIZ_PASS_PERCENT}%) — นับเป็นเงื่อนไข Certification
              </div>
            )}
            <button onClick={reset} className="btn btn-primary btn-block">
              <RotateCcw size={14} strokeWidth={2.2} /> เริ่มใหม่
            </button>
          </div>
        )}

        <div className="text-2xs text-text-muted text-center">
          ภาพ EKG เป็นภาพประกอบเพื่อการเรียนรู้ — การตัดสินใจจริงต้องดูอาการผู้ป่วยประกอบเสมอ ไม่ใช่ดูจอมอนิเตอร์อย่างเดียว
        </div>
      </div>
    </div>
  );
}
