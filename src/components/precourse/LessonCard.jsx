import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, ChevronRight, Clock, Play } from 'lucide-react';

export default function LessonCard({ lesson, read, bestScore, passed, inProgress }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;
  const stepCount = lesson.steps?.length ?? 0;
  const go = () => navigate(`/pre-course/${lesson.id}`);

  return (
    <div className="dash-card !p-0 overflow-hidden">
      <button
        onClick={go}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-tertiary/50 transition-colors"
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
        <div className="w-10 h-10 inline-flex items-center justify-center shrink-0 bg-info/12 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">{lesson.title}</div>
          <div className="text-2xs text-text-muted inline-flex items-center gap-2 mt-0.5">
            <Clock size={11} strokeWidth={2.2} /> ~{lesson.estMinutes} นาที
            <span className="text-text-muted">·</span>
            <span>{stepCount} ขั้น · {lesson.quiz.length} ข้อ</span>
            <span className="text-text-muted">·</span>
            <span>เกณฑ์ {lesson.passingScore}%</span>
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </button>

      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-1 ${
          passed ? 'bg-success/12 text-success'
            : hasAttempt ? 'bg-warning/12 text-warning'
            : inProgress ? 'bg-info/12 text-info'
            : read ? 'bg-success/12 text-success'
            : 'bg-bg-tertiary text-text-muted'
        }`} style={{ borderRadius: 99 }}>
          {passed ? <><Check size={11} strokeWidth={2.4} /> ผ่าน {bestScore}%</>
            : hasAttempt ? <>ยังไม่ผ่าน · {bestScore}%</>
            : inProgress ? <><Play size={11} strokeWidth={2.4} /> เรียนค้างไว้</>
            : read ? <><Check size={11} strokeWidth={2.4} /> อ่านครบ</>
            : <>ยังไม่เริ่ม</>}
        </span>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className="text-2xs font-bold px-3 py-1.5 inline-flex items-center gap-1 text-white hover:opacity-90"
          style={{ borderRadius: 99, background: 'var(--color-info)' }}>
          {inProgress ? 'เรียนต่อ' : hasAttempt ? 'ทำใหม่' : 'เริ่มเรียน'}
        </button>
      </div>
    </div>
  );
}
