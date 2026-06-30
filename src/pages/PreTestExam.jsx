import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PRE_TEST_BANK_ID,
  PRE_TEST_LESSON_ID,
  PRE_TEST_PASS_PERCENT,
  PRE_TEST_QUESTION_COUNT,
} from '../data/assessment';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getAttemptCount, saveQuizAttempt } from '../db/database';
import { scheduleFlush } from '../services/syncEngine';
import { track } from '../services/analytics';
import {
  loadExamForBank,
  submitAttempt as submitRemoteAttempt,
} from '../services/assessmentService';
import { IS_ACLS } from '../config/courseMode';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import QuizQuestion from '../components/precourse/QuizQuestion';
import {
  Sparkles, ChevronLeft, ChevronRight, AlertTriangle,
  Send, Check,
} from 'lucide-react';

export default function PreTestExam() {
  const navigate = useNavigate();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const currentPreTest = usePreCourseStore(s => s.currentPreTest);
  const startPreTest = usePreCourseStore(s => s.startPreTest);
  const setPreTestIndex = usePreCourseStore(s => s.setPreTestIndex);
  const answerPreTest = usePreCourseStore(s => s.answerPreTest);
  const clearPreTest = usePreCourseStore(s => s.clearPreTest);

  const [showIdentity, setShowIdentity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [exam, setExam] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!activeStudent) return;
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadExamForBank(PRE_TEST_BANK_ID);
        if (cancelled) return;
        setExam(loaded);
        if (!currentPreTest || currentPreTest.setId !== loaded.set.id) {
          startPreTest(loaded.set.id);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'โหลดข้อสอบไม่สำเร็จ');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudent?.id]);

  const questions = exam?.questions ?? [];
  const answers = currentPreTest?.answers ?? {};
  const currentIndex = currentPreTest?.currentIndex ?? 0;
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1));
  const currentQ = questions[safeIndex];
  const answeredCount = useMemo(
    () => questions.reduce((n, q) => n + (answers[q.id] ? 1 : 0), 0),
    [questions, answers],
  );
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const isLastQuestion = safeIndex === questions.length - 1;

  if (!IS_ACLS) {
    return (
      <div className="page-container space-y-5">
        <Header />
        <div className="dash-card text-center !p-6 space-y-3">
          <AlertTriangle size={32} className="mx-auto text-warning" />
          <div className="text-headline">ยังไม่เปิดใช้สำหรับหลักสูตรนี้</div>
          <div className="text-caption text-text-muted">Pre-test มีเฉพาะหลักสูตร ACLS</div>
          <button onClick={() => navigate('/pre-course')} className="btn btn-primary btn-md">กลับ Pre-course</button>
        </div>
      </div>
    );
  }

  if (!activeStudent) {
    return (
      <div className="page-container space-y-5">
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

  if (loadError) {
    return (
      <div className="page-container space-y-5">
        <Header />
        <div className="dash-card text-center !p-6 space-y-2">
          <AlertTriangle size={28} className="mx-auto text-danger" />
          <div className="text-body text-danger">โหลดข้อสอบไม่สำเร็จ</div>
          <div className="text-caption text-text-muted">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!exam || !currentQ) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6 text-text-muted text-caption">กำลังเตรียมข้อสอบ...</div>
      </div>
    );
  }

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
      const passPercent = exam.bank?.pass_percent ?? PRE_TEST_PASS_PERCENT;
      const passed = score >= passPercent;
      const attemptNumber = (await getAttemptCount(activeStudent.id, PRE_TEST_LESSON_ID)) + 1;
      const startedAt = currentPreTest?.startedAt ?? new Date().toISOString();
      const finishedAt = new Date().toISOString();
      const durationSec = Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 1000));

      const questionSnapshot = questions.map(q => ({
        id: q.id, question: q.question, choices: q.choices,
        correctId: q.correctId, explanation: q.explanation, topic: q.topic,
      }));

      const attemptId = await saveQuizAttempt({
        studentId: activeStudent.id,
        lessonId: PRE_TEST_LESSON_ID,
        bankId: PRE_TEST_BANK_ID,
        setId: exam.set.id,
        setTitle: exam.set.title,
        score,
        totalQuestions: total,
        correctCount: correct,
        answers: detailed,
        questionSnapshot,
        startedAt,
        finishedAt,
        passed,
        attemptNumber,
        passPercent,
      });
      scheduleFlush();
      track('pre_test_completed', {
        props: { score, passed, attempt_number: attemptNumber },
      });

      submitRemoteAttempt({
        studentLocalId: activeStudent.id,
        studentCode: activeStudent.studentId,
        studentName: activeStudent.name,
        studentPhone: activeStudent.phone,
        studentEmail: activeStudent.email,
        bankId: PRE_TEST_BANK_ID,
        setId: exam.set.id,
        score, totalQuestions: total, correctCount: correct, passed,
        durationSeconds: durationSec,
        answers: detailed,
        startedAt, finishedAt,
      }).catch(() => {});

      clearPreTest();
      navigate(`/pre-course/results/${attemptId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container space-y-5 pb-24">
      <Header subtitle={`Pre-test · ${questions.length} ข้อ · ก่อนเริ่มเรียน`} />

      <div className="dash-card !py-3 space-y-2">
        <div className="flex items-center justify-between text-caption">
          <span className="text-text-secondary">ข้อ <strong className="text-text-primary">{safeIndex + 1}</strong> / {questions.length}</span>
          <span className="text-text-muted">ตอบแล้ว <strong className="text-text-primary">{answeredCount}</strong> / {questions.length}</span>
        </div>
        <div className="progress-track !h-1.5">
          <div className="progress-fill bg-info" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="dash-card space-y-3">
        <div className="text-overline text-text-muted">ข้อที่ {safeIndex + 1}</div>
        <QuizQuestion
          question={currentQ}
          chosenId={answers[currentQ.id]}
          onChoose={(cid) => answerPreTest(currentQ.id, cid)}
          locked={false}
          showCorrect={false}
        />
      </div>

      <div className="dash-card !p-3 space-y-2">
        <div className="text-overline text-text-muted">ไปยังข้อ</div>
        <div className="grid grid-cols-10 gap-1.5">
          {questions.map((q, i) => {
            const answered = !!answers[q.id];
            const isCurrent = i === safeIndex;
            return (
              <button key={q.id}
                onClick={() => setPreTestIndex(i)}
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

      <div className="fixed left-0 right-0 bottom-16 bg-bg-primary/95 backdrop-blur border-t border-border px-4 py-3 z-40">
        <div className="max-w-[820px] mx-auto flex items-center gap-2">
          <button
            onClick={() => setPreTestIndex(Math.max(0, safeIndex - 1))}
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
              onClick={() => setPreTestIndex(Math.min(questions.length - 1, safeIndex + 1))}
              className="btn btn-primary btn-sm inline-flex items-center gap-1">
              ถัดไป <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

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
      <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Sparkles size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-title text-text-primary">Pre-test ACLS</h1>
        <p className="text-[11px] text-text-muted">{subtitle ?? `${PRE_TEST_QUESTION_COUNT} ข้อ · ทดสอบความรู้พื้นฐาน`}</p>
      </div>
    </div>
  );
}
