import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { PRE_TEST_PASS_PERCENT, PRE_TEST_QUESTION_COUNT } from '../../data/assessment';

export default function PreTestCard({ bestScore, passed, attemptCount }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;

  return (
    <div className="dash-card !p-0 overflow-hidden">
      <button
        onClick={() => navigate('/pre-course/pre-test')}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors">
        <div className="w-10 h-10 inline-flex items-center justify-center shrink-0 bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Sparkles size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">Pre-test ACLS</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {PRE_TEST_QUESTION_COUNT} ข้อ · เกณฑ์ {PRE_TEST_PASS_PERCENT}% · ทำก่อนเริ่มเรียน
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </button>

      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 ${
          passed ? 'bg-success/12 text-success'
            : hasAttempt ? 'bg-warning/12 text-warning'
            : 'bg-info/12 text-info'
        }`} style={{ borderRadius: 99 }}>
          {passed ? <><Check size={11} strokeWidth={2.4} /> ผ่าน {bestScore}%</>
            : hasAttempt ? <><RotateCcw size={11} strokeWidth={2.4} /> {bestScore}%</>
            : <>เริ่มได้เลย</>}
          {hasAttempt && attemptCount > 1 && (
            <span className="text-text-muted font-normal">· พยายาม {attemptCount} ครั้ง</span>
          )}
        </span>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/pre-course/pre-test'); }}
          className="text-[11px] font-bold px-3 py-1.5 inline-flex items-center gap-1 bg-info text-white hover:opacity-90"
          style={{ borderRadius: 99 }}>
          {hasAttempt ? 'ทำใหม่' : 'เริ่มทำ'}
        </button>
      </div>
    </div>
  );
}
