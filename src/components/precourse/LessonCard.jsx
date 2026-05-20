import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, Lock, ChevronRight, Clock } from 'lucide-react';

export default function LessonCard({ lesson, read, bestScore, passed }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;
  const quizDisabled = !read;

  return (
    <div className="dash-card !p-0 overflow-hidden">
      <button
        onClick={() => navigate(`/pre-course/${lesson.id}`)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors">
        <div className="w-10 h-10 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">{lesson.title}</div>
          <div className="text-[11px] text-text-muted inline-flex items-center gap-2 mt-0.5">
            <Clock size={11} strokeWidth={2.2} /> ~{lesson.estMinutes} นาที
            <span className="text-text-muted">·</span>
            <span>{lesson.quiz.length} ข้อ</span>
            <span className="text-text-muted">·</span>
            <span>เกณฑ์ {lesson.passingScore}%</span>
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </button>

      <div className="px-4 pb-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 ${
          read ? 'bg-success/12 text-success' : 'bg-bg-tertiary text-text-muted'
        }`} style={{ borderRadius: 99 }}>
          {read ? <Check size={11} strokeWidth={2.4} /> : <BookOpen size={11} strokeWidth={2.2} />}
          {read ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}
        </span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 ${
          passed ? 'bg-success/12 text-success'
            : hasAttempt ? 'bg-warning/12 text-warning'
            : 'bg-bg-tertiary text-text-muted'
        }`} style={{ borderRadius: 99 }}>
          {passed
            ? <><Check size={11} strokeWidth={2.4} /> ผ่าน {bestScore}%</>
            : hasAttempt
              ? <>ยังไม่ผ่าน · {bestScore}%</>
              : <>ยังไม่ทำ Quiz</>
          }
        </span>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); if (!quizDisabled) navigate(`/pre-course/${lesson.id}/quiz`); }}
          disabled={quizDisabled}
          className={`text-[11px] font-bold px-3 py-1.5 inline-flex items-center gap-1 ${
            quizDisabled ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:opacity-90'
          }`}
          style={{ borderRadius: 99 }}
          title={quizDisabled ? 'ต้องอ่านบทเรียนให้จบก่อน' : 'เริ่มทำ Quiz'}>
          {quizDisabled ? <><Lock size={11} strokeWidth={2.4} /> Quiz</> : <>เริ่ม Quiz</>}
        </button>
      </div>
    </div>
  );
}
