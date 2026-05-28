import { useEffect, useMemo, useState } from 'react';
import EKGWaveform from './EKGWaveform';
import { ekgQuestions, rhythmLabels } from '../data/ekgQuiz';
import { Sparkles, Check, X } from './ui/Icon';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministic per-day index: same question all day, rotates daily.
function pickIndexForDate(dateStr, length) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

const STORAGE_PREFIX = 'daily-quiz:';

export default function DailyQuiz() {
  const dateStr = todayKey();
  const storageKey = STORAGE_PREFIX + dateStr;

  const question = useMemo(() => {
    const idx = pickIndexForDate(dateStr, ekgQuestions.length);
    return ekgQuestions[idx];
  }, [dateStr]);

  const [answered, setAnswered] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswered(JSON.parse(raw));
    } catch { /* noop */ }
  }, [storageKey]);

  const handleAnswer = (option) => {
    if (answered) return;
    const result = { option, correct: option === question.answer };
    setAnswered(result);
    try {
      localStorage.setItem(storageKey, JSON.stringify(result));
    } catch { /* noop */ }
  };

  if (!question) return null;

  return (
    <div className="dash-card" style={{ borderLeft: '4px solid #7C3AED' }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 inline-flex items-center justify-center shrink-0"
          style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', borderRadius: 'var(--radius)' }}
        >
          <Sparkles size={14} strokeWidth={2.2} />
        </div>
        <h2 className="text-headline text-text-primary">Quiz of the day</h2>
        <span className="ml-auto text-overline text-text-muted">EKG</span>
      </div>

      <div className="text-caption text-text-muted mb-2">
        จังหวะหัวใจนี้คืออะไร?
      </div>

      <div className="mb-3 bg-bg-primary p-2" style={{ borderRadius: 'var(--radius-md)' }}>
        {question.imageUrl ? (
          <img src={question.imageUrl} alt="EKG" className="w-full" />
        ) : (
          <EKGWaveform rhythmId={question.rhythmId} variant="paper" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {question.options.map(opt => {
          const isPicked = answered?.option === opt;
          const isCorrect = opt === question.answer;
          let cls = 'btn btn-ghost btn-sm text-left justify-start';
          if (answered) {
            if (isCorrect) cls = 'btn btn-success btn-sm text-left justify-start';
            else if (isPicked) cls = 'btn btn-danger btn-sm text-left justify-start';
            else cls = 'btn btn-ghost btn-sm text-left justify-start opacity-50';
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered}
              className={cls}
            >
              {answered && isCorrect && <Check size={14} strokeWidth={2.4} />}
              {answered && isPicked && !isCorrect && <X size={14} strokeWidth={2.4} />}
              <span className="truncate">{rhythmLabels[opt] || opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className="mt-3 p-3 text-caption"
          style={{
            background: answered.correct ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            color: answered.correct ? '#059669' : '#DC2626',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="text-body-strong mb-1">
            {answered.correct ? '🎉 ถูกต้อง!' : `คำตอบที่ถูกคือ ${rhythmLabels[question.answer] || question.answer}`}
          </div>
          {question.hint && <div className="opacity-90">{question.hint}</div>}
          <div className="mt-2 text-overline text-text-muted">
            ข้อใหม่จะปลดล็อกอีกครั้งพรุ่งนี้
          </div>
        </div>
      )}
    </div>
  );
}
