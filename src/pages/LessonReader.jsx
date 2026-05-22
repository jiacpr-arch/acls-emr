import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findLessonById } from '../data/activeLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import {
  markLessonRead,
  saveQuizAttempt,
  getAttemptCount,
} from '../db/database';
import QuizQuestion from '../components/precourse/QuizQuestion';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import LessonVideos from '../components/precourse/LessonVideos';
import {
  ChevronLeft, ChevronRight, BookOpen, AlertCircle,
  Check, Send,
} from 'lucide-react';

export default function LessonReader() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const lesson = findLessonById(lessonId);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const currentAttempt = usePreCourseStore(s => s.currentAttempt);
  const startAttempt = usePreCourseStore(s => s.startAttempt);
  const setStepIndex = usePreCourseStore(s => s.setStepIndex);
  const answerQuestion = usePreCourseStore(s => s.answerQuestion);
  const clearAttempt = usePreCourseStore(s => s.clearAttempt);

  const [showIdentity, setShowIdentity] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize / resume attempt for this lesson
  useEffect(() => {
    if (!lesson) return;
    if (!currentAttempt || currentAttempt.lessonId !== lesson.id) {
      startAttempt(lesson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const stepIndex = currentAttempt?.lessonId === lesson?.id
    ? (currentAttempt?.stepIndex ?? 0)
    : 0;
  const answers = useMemo(
    () => currentAttempt?.lessonId === lesson?.id
      ? (currentAttempt?.answers ?? {})
      : {},
    [currentAttempt, lesson?.id],
  );

  const totalSteps = lesson?.steps?.length ?? 0;
  const totalQuiz = lesson?.quiz?.length ?? 0;
  const safeIndex = Math.min(stepIndex, totalSteps);
  const isOnSummary = safeIndex >= totalSteps;
  const step = !isOnSummary ? lesson?.steps?.[safeIndex] : null;

  // Score running total
  const { correctSoFar, answeredQuizCount } = useMemo(() => {
    if (!lesson) return { correctSoFar: 0, answeredQuizCount: 0 };
    let correct = 0, answered = 0;
    for (const s of lesson.steps) {
      if (s.type !== 'quiz') continue;
      const chosen = answers[s.id];
      if (chosen) {
        answered += 1;
        if (chosen === s.correctId) correct += 1;
      }
    }
    return { correctSoFar: correct, answeredQuizCount: answered };
  }, [lesson, answers]);

  if (!lesson) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6">
          <AlertCircle size={28} strokeWidth={2.2} className="mx-auto text-warning" />
          <div className="text-body mt-2">ไม่พบบทเรียน</div>
          <button onClick={() => navigate('/pre-course')} className="btn btn-primary btn-sm mt-3">
            กลับไปรายการบทเรียน
          </button>
        </div>
      </div>
    );
  }

  const requireIdentity = () => {
    if (!activeStudent) { setShowIdentity(true); return false; }
    return true;
  };

  const goNext = () => {
    if (!requireIdentity()) return;
    setStepIndex(Math.min(totalSteps, safeIndex + 1));
  };

  const goPrev = () => {
    setStepIndex(Math.max(0, safeIndex - 1));
  };

  const submitAttempt = async () => {
    if (submitting || !activeStudent) return;
    setSubmitting(true);
    try {
      await markLessonRead(activeStudent.id, lesson.id);

      const detailed = lesson.quiz.map(qq => {
        const chosen = answers[qq.id] || null;
        return { questionId: qq.id, chosenId: chosen, correct: chosen === qq.correctId };
      });
      const correctCount = detailed.filter(a => a.correct).length;
      const score = totalQuiz ? Math.round((correctCount / totalQuiz) * 100) : 0;
      const passed = score >= lesson.passingScore;
      const prevCount = await getAttemptCount(activeStudent.id, lesson.id);

      const attempt = {
        studentId: activeStudent.id,
        lessonId: lesson.id,
        score,
        totalQuestions: totalQuiz,
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
    } finally {
      setSubmitting(false);
    }
  };

  const restartFromBeginning = () => {
    startAttempt(lesson.id);
  };

  // Progress %
  const progressPct = totalSteps === 0
    ? 0
    : Math.round((Math.min(safeIndex, totalSteps) / totalSteps) * 100);

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course')}
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไปรายการบทเรียน
      </button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-title text-text-primary">{lesson.title}</h1>
          <div className="text-[11px] text-text-muted mt-1">
            {totalQuiz} ข้อสอบ · เกณฑ์ผ่าน {lesson.passingScore}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="dash-card !p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-muted font-bold">
            {isOnSummary ? 'พร้อมส่ง' : `ขั้นที่ ${safeIndex + 1} / ${totalSteps}`}
          </span>
          <span className="text-text-secondary">
            ตอบถูก <span className="text-success font-bold">{correctSoFar}</span>
            {answeredQuizCount > 0 && <span className="text-text-muted"> / {answeredQuizCount} ที่ตอบ</span>}
            <span className="text-text-muted"> (จาก {totalQuiz} ข้อ)</span>
          </span>
        </div>
        <div className="progress-track !h-2">
          <div className="progress-fill bg-info" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Current step */}
      {!isOnSummary && step?.type === 'read' && (
        <section className="dash-card space-y-3 !p-5">
          <div className="text-headline text-info">{step.heading}</div>
          <ReadBody body={step.body} />
        </section>
      )}

      {!isOnSummary && step?.type === 'quiz' && (
        <QuizStep
          step={step}
          chosenId={answers[step.id]}
          onChoose={(cid) => {
            if (!requireIdentity()) return;
            answerQuestion(step.id, cid);
          }}
        />
      )}

      {/* Summary (final step) */}
      {isOnSummary && (
        <section className="dash-card text-center space-y-3 !p-5">
          <div className="w-12 h-12 mx-auto inline-flex items-center justify-center bg-info/15 text-info"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Check size={22} strokeWidth={2.4} />
          </div>
          <div className="text-headline text-text-primary">เรียนจบบทแล้ว</div>
          <div className="text-body text-text-secondary">
            ตอบถูก <span className="text-success font-bold">{correctSoFar}</span>
            {' / '}{totalQuiz} ข้อ
          </div>
          {answeredQuizCount < totalQuiz && (
            <div className="text-caption text-warning inline-flex items-center justify-center gap-1">
              <AlertCircle size={13} strokeWidth={2.2} />
              ยังมี {totalQuiz - answeredQuizCount} ข้อที่ไม่ได้ตอบ จะนับเป็นข้อผิด
            </div>
          )}
        </section>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={goPrev}
          disabled={safeIndex === 0}
          className="btn btn-ghost btn-sm disabled:opacity-40">
          <ChevronLeft size={14} strokeWidth={2.2} /> ก่อนหน้า
        </button>
        <div className="flex-1" />
        {!isOnSummary ? (
          <button
            onClick={goNext}
            disabled={step?.type === 'quiz' && !answers[step.id]}
            className="btn btn-primary btn-sm disabled:opacity-40">
            {step?.type === 'quiz' && !answers[step.id] ? 'เลือกคำตอบก่อน' : 'ถัดไป'}
            <ChevronRight size={14} strokeWidth={2.2} />
          </button>
        ) : (
          <>
            <button onClick={restartFromBeginning} className="btn btn-ghost btn-sm">
              เริ่มใหม่
            </button>
            <button
              onClick={submitAttempt}
              disabled={submitting}
              className="btn btn-success btn-sm">
              <Send size={14} strokeWidth={2.2} />
              {submitting ? 'กำลังบันทึก...' : 'ส่งคำตอบ'}
            </button>
          </>
        )}
      </div>

      {/* วิดีโอประกอบของบทนี้ (ใช้พื้นที่ว่างใต้ปุ่ม navigation) */}
      {lesson.videos?.length > 0 && (
        <div className="pt-2">
          <LessonVideos videos={lesson.videos} />
        </div>
      )}

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}

function ReadBody({ body }) {
  const lines = (body ?? '').split('\n').map(l => l.trim()).filter(Boolean);

  const items = lines.map((line) => {
    const bullet = line.match(/^([•\-*])\s+(.*)$/);
    if (bullet) return { kind: 'bullet', marker: '•', text: bullet[2] };
    const numbered = line.match(/^(\d+)[).]\s+(.*)$/);
    if (numbered) return { kind: 'numbered', marker: `${numbered[1]}.`, text: numbered[2] };
    return { kind: 'text', text: line };
  });

  return (
    <div
      className="text-text-secondary"
      style={{ fontSize: '16px', lineHeight: 1.7 }}
    >
      {items.map((it, i) => {
        if (it.kind === 'text') {
          return (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>
              {it.text}
            </p>
          );
        }
        const isNumbered = it.kind === 'numbered';
        return (
          <div
            key={i}
            className={i > 0 ? 'mt-2.5' : ''}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
          >
            <span
              className={isNumbered ? 'text-info font-bold' : 'text-info'}
              style={{
                flexShrink: 0,
                minWidth: isNumbered ? '22px' : '14px',
                fontSize: isNumbered ? '16px' : '18px',
                lineHeight: 1.55,
              }}
            >
              {it.marker}
            </span>
            <span style={{ flex: 1 }}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuizStep({ step, chosenId, onChoose }) {
  const answered = !!chosenId;
  const correct = answered && chosenId === step.correctId;

  return (
    <section className="space-y-3">
      <div className="text-overline text-text-muted px-1">คำถาม</div>
      <QuizQuestion
        question={step}
        chosenId={chosenId}
        onChoose={onChoose}
        locked={answered}
        showCorrect={answered}
      />
      {answered && (
        <div className={`dash-card !p-3 border ${correct ? 'border-success/40 bg-success/8' : 'border-warning/40 bg-warning/8'}`}>
          <div className={`text-caption font-bold mb-1 ${correct ? 'text-success' : 'text-warning'}`}>
            {correct ? 'ถูกต้อง' : 'ผิด — มาดูเฉลย'}
          </div>
          <div className="text-caption text-text-secondary leading-relaxed">
            {step.explanation}
          </div>
        </div>
      )}
    </section>
  );
}
