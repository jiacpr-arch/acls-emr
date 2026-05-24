import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, RotateCcw, ArrowRight } from 'lucide-react';
import { PRE_TEST_PASS_PERCENT, PRE_TEST_QUESTION_COUNT } from '../../data/assessment';

export default function PreTestCard({ bestScore, passed, attemptCount }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;
  const go = () => navigate('/pre-course/pre-test');

  return (
    <div className="dash-card !p-0 overflow-hidden">
      <div className="px-4 pt-3.5 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 inline-flex items-center justify-center shrink-0 bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Sparkles size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-body-strong text-text-primary truncate">Pre-test ACLS</div>
            {hasAttempt && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${
                passed ? 'bg-success/12 text-success' : 'bg-warning/12 text-warning'
              }`} style={{ borderRadius: 99 }}>
                {passed ? <Check size={10} strokeWidth={2.6} /> : <RotateCcw size={10} strokeWidth={2.6} />}
                {bestScore}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {PRE_TEST_QUESTION_COUNT} ข้อ · เกณฑ์ {PRE_TEST_PASS_PERCENT}%
            {hasAttempt && attemptCount > 1
              ? <> · พยายาม {attemptCount} ครั้ง</>
              : <> · ทำก่อนเริ่มเรียน</>}
          </div>
        </div>
      </div>

      <button
        onClick={go}
        className="w-full h-12 flex items-center justify-center gap-1.5 bg-info text-white text-sm font-bold hover:opacity-90 active:opacity-80 transition-opacity">
        {hasAttempt ? 'ทำใหม่อีกครั้ง' : 'เริ่มทำ Pre-test'}
        <ArrowRight size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
