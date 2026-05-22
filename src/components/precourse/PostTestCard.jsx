import { useNavigate } from 'react-router-dom';
import { Award, ChevronRight, Lock, Check, RotateCcw } from 'lucide-react';
import { POST_TEST_PASS_PERCENT, POST_TEST_QUESTION_COUNT } from '../../data/activePostTest';

export default function PostTestCard({ unlocked, bestScore, passed, attemptCount }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;

  return (
    <div className={`dash-card !p-0 overflow-hidden ${
      unlocked ? '' : 'opacity-70'
    }`}>
      <button
        onClick={() => unlocked && navigate('/pre-course/post-test')}
        disabled={!unlocked}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors disabled:cursor-not-allowed">
        <div className={`w-10 h-10 inline-flex items-center justify-center shrink-0 ${
          unlocked ? 'bg-warning/15 text-warning' : 'bg-bg-tertiary text-text-muted'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          {unlocked ? <Award size={18} strokeWidth={2.2} /> : <Lock size={16} strokeWidth={2.4} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">Post-test Exam</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {POST_TEST_QUESTION_COUNT} ข้อ · เกณฑ์ {POST_TEST_PASS_PERCENT}% · สุ่มจาก 3 ชุด
          </div>
        </div>
        {unlocked && <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />}
      </button>

      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        {!unlocked ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 99 }}>
            <Lock size={11} strokeWidth={2.4} /> ปลดล็อกเมื่อผ่านบทเรียนทั้ง 6 บท
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 ${
            passed ? 'bg-success/12 text-success'
              : hasAttempt ? 'bg-warning/12 text-warning'
              : 'bg-warning/12 text-warning'
          }`} style={{ borderRadius: 99 }}>
            {passed ? <><Check size={11} strokeWidth={2.4} /> ผ่าน {bestScore}%</>
              : hasAttempt ? <><RotateCcw size={11} strokeWidth={2.4} /> ยังไม่ผ่าน · {bestScore}%</>
              : <>พร้อมสอบ</>}
            {hasAttempt && attemptCount > 1 && (
              <span className="text-text-muted font-normal">· พยายาม {attemptCount} ครั้ง</span>
            )}
          </span>
        )}
        <div className="flex-1" />
        {unlocked && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/pre-course/post-test'); }}
            className="text-[11px] font-bold px-3 py-1.5 inline-flex items-center gap-1 bg-warning text-white hover:opacity-90"
            style={{ borderRadius: 99 }}>
            {hasAttempt ? 'ทำใหม่' : 'เริ่มสอบ'}
          </button>
        )}
      </div>
    </div>
  );
}
