import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttemptById, db } from '../db/database';
import { findLessonById } from '../data/preCourseContent';
import {
  PRE_TEST_LESSON_ID,
  POST_TEST_LESSON_ID,
  PRE_TEST_PASS_PERCENT,
  POST_TEST_PASS_PERCENT,
} from '../data/assessment';
import ResultsSummary from '../components/precourse/ResultsSummary';
import { exportStudentResultPDF } from '../utils/exportPreCourse';
import { ChevronLeft, Download, RotateCcw, Trophy, AlertCircle } from 'lucide-react';

export default function QuizResults() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const a = await getAttemptById(attemptId);
      if (cancelled) return;
      setAttempt(a || null);
      if (a) {
        const s = await db.students.get(a.studentId);
        if (!cancelled) setStudent(s || null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [attemptId]);

  if (loading) {
    return <div className="page-container text-center text-text-muted text-caption py-10">กำลังโหลด…</div>;
  }
  if (!attempt) {
    return (
      <div className="page-container">
        <div className="dash-card text-center !p-6">
          <AlertCircle size={28} strokeWidth={2.2} className="mx-auto text-warning" />
          <div className="text-body mt-2">ไม่พบผลการทำ Quiz</div>
          <button onClick={() => navigate('/pre-course')} className="btn btn-primary btn-sm mt-3">
            กลับไปรายการบทเรียน
          </button>
        </div>
      </div>
    );
  }

  const isPreTest = attempt.lessonId === PRE_TEST_LESSON_ID;
  const isPostTest = attempt.lessonId === POST_TEST_LESSON_ID;
  const isAssessment = isPreTest || isPostTest;

  // For assessment attempts: render from snapshot stored on the attempt itself.
  // For lesson quizzes: fall back to the static lesson definition.
  const lesson = isAssessment
    ? {
        id: attempt.lessonId,
        title: isPreTest
          ? `Pre-test · ${attempt.setTitle || ''}`.trim()
          : `Post-test Exam · ${attempt.setTitle || ''}`.trim(),
        quiz: attempt.questionSnapshot || [],
        passingScore: attempt.passPercent
          ?? (isPreTest ? PRE_TEST_PASS_PERCENT : POST_TEST_PASS_PERCENT),
      }
    : findLessonById(attempt.lessonId);

  const retakePath = isPreTest
    ? '/pre-course/pre-test'
    : isPostTest
      ? '/pre-course/post-test'
      : `/pre-course/${attempt.lessonId}/quiz`;

  const heading = isPreTest
    ? 'ผล Pre-test'
    : isPostTest
      ? 'ผล Post-test Exam'
      : 'ผลการทำ Quiz';

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course')}
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไปรายการบทเรียน
      </button>

      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 inline-flex items-center justify-center ${
          isPostTest ? 'bg-warning/15 text-warning'
            : isPreTest ? 'bg-info/15 text-info'
            : 'bg-info/15 text-info'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          <Trophy size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">{heading}</h1>
          <p className="text-caption text-text-muted">
            ครั้งที่ {attempt.attemptNumber} · {new Date(attempt.finishedAt).toLocaleString('th-TH')}
          </p>
        </div>
      </div>

      <ResultsSummary attempt={attempt} lesson={lesson} student={student} />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate(retakePath)}
          className="btn btn-ghost btn-block">
          <RotateCcw size={14} strokeWidth={2.2} /> ทำใหม่
        </button>
        <button
          onClick={() => exportStudentResultPDF({ student, attempt, lesson })}
          className="btn btn-primary btn-block">
          <Download size={14} strokeWidth={2.2} /> Export PDF
        </button>
      </div>

      <button onClick={() => navigate('/certification')}
        className="btn btn-ghost btn-block">
        ดูสถานะใบรับรอง
      </button>
    </div>
  );
}
