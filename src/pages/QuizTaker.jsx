import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findLessonById } from '../data/preCourseContent';
import { usePreCourseStore } from '../stores/preCourseStore';
import {
  hasReadLesson, saveQuizAttempt, getAttemptCount,
} from '../db/database';
import QuizQuestion from '../components/precourse/QuizQuestion';
import QuizProgress from '../components/precourse/QuizProgress';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import { ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';

export default function QuizTaker() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const lesson = findLessonById(lessonId);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const currentAttempt = usePreCourseStore(s => s.currentAttempt);
  const startAttempt = usePreCourseStore(s => s.startAttempt);
  const answerQuestion = usePreCourseStore(s => s.answerQuestion);
  const clearAttempt = usePreCourseStore(s => s.clearAttempt);

  const [idx, setIdx] = useState(0);
  const [showIdentity, setShowIdentity] = useState(!activeStudent);
  const [readOk, setReadOk] = useState(null);   // null = loading, bool when known
  const [submitting, setSubmitting] = useState(false);

  // Initialize attempt for this lesson (or reuse one in progress for the same lesson)
  useEffect(() => {
    if (!lesson) return;
    if (!currentAttempt || currentAttempt.lessonId !== lesson.id) {
      startAttempt(lesson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  // Read-gate check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeStudent || !lesson) { setReadOk(null); return; }
      const ok = await hasReadLesson(activeStudent.id, lesson.id);
      if (!cancelled) setReadOk(ok);
    })();
    return () => { cancelled = true; };
  }, [activeStudent?.id, lesson?.id]);

  const answers = currentAttempt?.answers || {};
  const totalQ = lesson?.quiz.length || 0;
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );
  const allAnswered = answeredCount === totalQ;

  if (!lesson) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6">
          <AlertCircle size={28} strokeWidth={2.2} className="mx-auto text-warning" />
          <div className="text-body mt-2">ไม่พบ Quiz ของบทเรียนนี้</div>
        </div>
      </div>
    );
  }

  // Identity gate
  if (!activeStudent) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6 space-y-3">
          <div className="text-body">กรุณาระบุตัวผู้เรียนก่อนเริ่ม Quiz</div>
          <button onClick={() => setShowIdentity(true)} className="btn btn-primary btn-block">
            ระบุชื่อ-รหัสนักเรียน
          </button>
        </div>
        <StudentIdentityModal
          open={showIdentity}
          onClose={() => navigate(`/pre-course/${lesson.id}`)}
          onConfirm={() => setShowIdentity(false)}
        />
      </div>
    );
  }

  // Read gate
  if (readOk === false) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6 space-y-3">
          <AlertCircle size={28} strokeWidth={2.2} className="mx-auto text-warning" />
          <div className="text-body">ต้องอ่านบทเรียนให้จบก่อนทำ Quiz</div>
          <button onClick={() => navigate(`/pre-course/${lesson.id}`)} className="btn btn-primary btn-block">
            ไปอ่านบทเรียน
          </button>
        </div>
      </div>
    );
  }

  const q = lesson.quiz[idx];
  const chosenId = answers[q.id];

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const detailed = lesson.quiz.map(qq => {
      const chosen = answers[qq.id] || null;
      return {
        questionId: qq.id,
        chosenId: chosen,
        correct: chosen === qq.correctId,
      };
    });
    const correctCount = detailed.filter(a => a.correct).length;
    const score = Math.round((correctCount / lesson.quiz.length) * 100);
    const passed = score >= lesson.passingScore;

    const prevCount = await getAttemptCount(activeStudent.id, lesson.id);

    const attempt = {
      studentId: activeStudent.id,
      lessonId: lesson.id,
      score,
      totalQuestions: lesson.quiz.length,
      correctCount,
      answers: detailed,
      startedAt: currentAttempt?.startedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      passed,
      attemptNumber: prevCount + 1,
    };
    const autoId = await saveQuizAttempt(attempt);
    clearAttempt();
    navigate(`/pre-course/results/${autoId}`);
  };

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate(`/pre-course/${lesson.id}`)}
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไปบทเรียน
      </button>

      <div className="space-y-1">
        <div className="text-overline text-text-muted">Quiz: {lesson.title}</div>
        <QuizProgress current={idx + 1} total={totalQ} />
      </div>

      <QuizQuestion
        question={q}
        chosenId={chosenId}
        onChoose={(cid) => answerQuestion(q.id, cid)}
      />

      <div className="flex items-center gap-2 pt-2">
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
          className="btn btn-ghost btn-sm disabled:opacity-40">
          <ChevronLeft size={14} strokeWidth={2.2} /> ก่อนหน้า
        </button>
        <div className="flex-1 text-center text-[11px] text-text-muted">
          ตอบแล้ว {answeredCount} / {totalQ}
        </div>
        {idx < totalQ - 1 ? (
          <button onClick={() => setIdx(i => Math.min(totalQ - 1, i + 1))}
            disabled={!chosenId}
            className="btn btn-primary btn-sm disabled:opacity-40">
            ถัดไป <ChevronRight size={14} strokeWidth={2.2} />
          </button>
        ) : (
          <button onClick={submit} disabled={!allAnswered || submitting}
            className="btn btn-success btn-sm disabled:opacity-40">
            <Send size={14} strokeWidth={2.2} /> ส่งคำตอบ
          </button>
        )}
      </div>

      {/* Question quick-jump */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {lesson.quiz.map((qq, i) => {
          const isCurrent = i === idx;
          const isAnswered = !!answers[qq.id];
          return (
            <button key={qq.id} onClick={() => setIdx(i)}
              className={`w-7 h-7 text-[11px] font-bold border ${
                isCurrent ? 'border-info bg-info text-white'
                  : isAnswered ? 'border-success/40 bg-success/10 text-success'
                  : 'border-border bg-bg-secondary text-text-muted'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
