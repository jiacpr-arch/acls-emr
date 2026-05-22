import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  POST_TEST_LESSON_ID,
  POST_TEST_PASS_PERCENT,
  POST_TEST_QUESTION_COUNT,
  getPostTestSetById,
  pickRandomPostTestSet,
} from '../data/postTest';
import { preCourseLessons } from '../data/preCourseContent';
import { usePreCourseStore } from '../stores/preCourseStore';
import {
  getLessonProgress,
  getAttemptsForStudent,
  getAttemptCount,
  saveQuizAttempt,
} from '../db/database';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import QuizQuestion from '../components/precourse/QuizQuestion';
import {
  Award, ChevronLeft, ChevronRight, AlertTriangle,
  Send, Check, Lock, BookOpen,
} from 'lucide-react';

export default function PostTestExam() {
  const navigate = useNavigate();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const currentPostTest = usePreCourseStore(s => s.currentPostTest);
  const startPostTest = usePreCourseStore(s => s.startPostTest);
  const setPostTestIndex = usePreCourseStore(s => s.setPostTestIndex);
  const answerPostTest = usePreCourseStore(s => s.answerPostTest);
  const clearPostTest = usePreCourseStore(s => s.clearPostTest);

  const [showIdentity, setShowIdentity] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // --- Gate: all 6 chapters passed ---
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!activeStudent) { setGatePassed(false); setGateChecked(true); return; }
      const [progress, attempts] = await Promise.all([
        getLessonProgress(activeStudent.id),
        getAttemptsForStudent(activeStudent.id),
      ]);
      if (cancelled) return;
      const allPassed = preCourseLessons.every(l => {
        const best = attempts.filter(a => a.lessonId === l.id)
          .reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
        return !!best?.passed;
      });
      setGatePassed(allPassed);
      setGateChecked(true);
    }
    check();
    return () => { cancelled = true; };
  }, [activeStudent?.id]);

  // --- Initialize exam set when ready ---
  useEffect(() => {
    if (!gateChecked || !gatePassed || !activeStudent) return;
    if (!currentPostTest) {
      const picked = pickRandomPostTestSet();
      startPostTest(picked.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateChecked, gatePassed, activeStudent?.id]);

  const examSet = useMemo(
    () => currentPostTest ? getPostTestSetById(currentPostTest.setId) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPostTest?.setId],
  );

  const questions = examSet?.questions ?? [];
  const answers = currentPostTest?.answers ?? {};
  const currentIndex = currentPostTest?.currentIndex ?? 0;
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1));
  const currentQ = questions[safeIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const isLastQuestion = safeIndex === questions.length - 1;

  // --- Identity gate (no student selected) ---
  if (!activeStudent) {
    return (
      <div className="page-container space-y-4">
        <Header />
        <div className="dash-card text-center !p-6 space-y-3">
          <AlertTriangle size={32} className="mx-auto text-warning" />
          <div className="text-headline">ระบุตัวผู้เรียนก่อน</div>
          <div className="text-caption text-text-muted">เพื่อบันทึกคะแนนของคุณ</div>
          <button onClick={() => setShowIdentity(true)} className="btn btn-primary btn-md">ระบุตัวตน</button>
        </div>
        <StudentIdentityModal open={showIdentity} onClose={() => setShowIdentity(false)} onConfirm={() => setShowIdentity(false)} />
      </div>
    );
  }

  // --- Loading gate check ---
  if (!gateChecked) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6 text-text-muted text-caption">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // --- Locked: not all chapters passed ---
  if (!gatePassed) {
    return (
      <div className="page-container space-y-4">
        <Header />
        <div className="dash-card text-center !p-6 space-y-3">
          <div className="w-12 h-12 mx-auto inline-flex items-center justify-center bg-warning/15 text-warning"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Lock size={22} strokeWidth={2.4} />
          </div>
          <div className="text-headline">ยังไม่ปลดล็อก</div>
          <div className="text-caption text-text-muted">
            ต้องผ่านบทเรียน Pre-course ทั้ง 6 บท (ผ่านเกณฑ์) ก่อนเข้าทำ Post-test
          </div>
          <button onClick={() => navigate('/pre-course')} className="btn btn-primary btn-md inline-flex items-center gap-2">
            <BookOpen size={16} strokeWidth={2.4} /> กลับไปบทเรียน
          </button>
        </div>
      </div>
    );
  }

  // --- Exam not initialized yet ---
  if (!examSet || !currentQ) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6 text-text-muted text-caption">กำลังเตรียมข้อสอบ...</div>
      </div>
    );
  }

  // --- Submit ---
  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const detailed = questions.map(q => {
        const chosen = answers[q.id] || null;
        return { questionId: q.id, chosenId: chosen, correct: chosen === q.correctId };
      });
      const correct = detailed.filter(a => a.correct).length;
      const total = questions.length;
      const score = total ? Math.round((correct / total) * 100) : 0;
      const passed = score >= POST_TEST_PASS_PERCENT;
      const attemptNumber = (await getAttemptCount(activeStudent.id, POST_TEST_LESSON_ID)) + 1;

      const attemptId = await saveQuizAttempt({
        studentId: activeStudent.id,
        lessonId: POST_TEST_LESSON_ID,
        setId: examSet.id,
        score,
        totalQuestions: total,
        correctCount: correct,
        answers: detailed,
        startedAt: currentPostTest.startedAt,
        finishedAt: new Date().toISOString(),
        passed,
        attemptNumber,
      });

      clearPostTest();
      navigate(`/pre-course/results/${attemptId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container space-y-4 pb-24">
      <Header subtitle={`ชุด: ${examSet.title} · ${POST_TEST_QUESTION_COUNT} ข้อ · เกณฑ์ผ่าน ${POST_TEST_PASS_PERCENT}%`} />

      {/* Progress */}
      <div className="dash-card !py-3 space-y-2">
        <div className="flex items-center justify-between text-caption">
          <span className="text-text-secondary">ข้อ <strong className="text-text-primary">{safeIndex + 1}</strong> / {questions.length}</span>
          <span className="text-text-muted">ตอบแล้ว <strong className="text-text-primary">{answeredCount}</strong> / {questions.length}</span>
        </div>
        <div className="progress-track !h-1.5">
          <div className="progress-fill bg-info" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="dash-card space-y-3">
        <div className="text-overline text-text-muted">ข้อที่ {safeIndex + 1}</div>
        <QuizQuestion
          question={currentQ}
          chosenId={answers[currentQ.id]}
          onChoose={(cid) => answerPostTest(currentQ.id, cid)}
          locked={false}
          showCorrect={false}
        />
      </div>

      {/* Question grid navigator */}
      <div className="dash-card !p-3 space-y-2">
        <div className="text-overline text-text-muted">ไปยังข้อ</div>
        <div className="grid grid-cols-10 gap-1.5">
          {questions.map((q, i) => {
            const answered = !!answers[q.id];
            const isCurrent = i === safeIndex;
            return (
              <button key={q.id}
                onClick={() => setPostTestIndex(i)}
                className={`h-8 text-[11px] font-bold transition-colors ${
                  isCurrent ? 'bg-info text-white border border-info'
                    : answered ? 'bg-success/15 text-success border border-success/30 hover:bg-success/25'
                    : 'bg-bg-tertiary text-text-muted border border-border hover:bg-border'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer nav */}
      <div className="fixed left-0 right-0 bottom-16 bg-bg-primary/95 backdrop-blur border-t border-border px-4 py-3 z-40">
        <div className="max-w-[820px] mx-auto flex items-center gap-2">
          <button
            onClick={() => setPostTestIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            className="btn btn-ghost btn-sm inline-flex items-center gap-1 disabled:opacity-30">
            <ChevronLeft size={14} strokeWidth={2.4} /> ก่อนหน้า
          </button>
          <div className="flex-1" />
          {isLastQuestion ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={submitting}
              className="btn btn-success btn-sm inline-flex items-center gap-1 disabled:opacity-40">
              <Send size={14} strokeWidth={2.4} /> ส่งคำตอบ
            </button>
          ) : (
            <button
              onClick={() => setPostTestIndex(Math.min(questions.length - 1, safeIndex + 1))}
              className="btn btn-primary btn-sm inline-flex items-center gap-1">
              ถัดไป <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {/* Confirm submit modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmSubmit(false)}>
          <div className="dash-card max-w-sm w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="text-headline">ส่งคำตอบ?</div>
            <div className="text-caption text-text-secondary">
              คุณตอบแล้ว <strong className="text-text-primary">{answeredCount}</strong> จาก {questions.length} ข้อ
              {!allAnswered && (
                <div className="mt-2 text-warning inline-flex items-center gap-1.5">
                  <AlertTriangle size={13} strokeWidth={2.4} />
                  ยังเหลือ {questions.length - answeredCount} ข้อที่ไม่ได้ตอบ (จะนับเป็นผิด)
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-ghost btn-md flex-1">ยกเลิก</button>
              <button onClick={() => { setShowConfirmSubmit(false); handleSubmit(); }}
                disabled={submitting}
                className="btn btn-success btn-md flex-1 inline-flex items-center justify-center gap-1 disabled:opacity-40">
                <Check size={14} strokeWidth={2.4} /> ยืนยันส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 inline-flex items-center justify-center bg-warning/15 text-warning"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Award size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-title text-text-primary">Post-test Exam</h1>
        <p className="text-[11px] text-text-muted">{subtitle ?? 'ข้อสอบหลังเรียน ครอบคลุมทั้ง 6 บท'}</p>
      </div>
    </div>
  );
}
