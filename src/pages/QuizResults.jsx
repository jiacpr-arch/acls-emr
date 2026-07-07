import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttemptById, db } from '../db/database';
import { findLessonById, preCourseLessons } from '../data/activeLessons';
import { PRE_TEST_LESSON_ID, PRE_TEST_PASS_PERCENT } from '../data/assessment';
import {
  POST_TEST_LESSON_ID,
  POST_TEST_PASS_PERCENT,
  getPostTestSetById,
} from '../data/activePostTest';
import ResultsSummary from '../components/precourse/ResultsSummary';
import { exportStudentResultPDF } from '../utils/exportPreCourse';
import { ChevronLeft, ChevronRight, Download, RotateCcw, Trophy, AlertCircle, MessageCircle } from 'lucide-react';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import { IS_BLS } from '../config/courseMode';
import BLSCourseUpsellCard from '../components/precourse/BLSCourseUpsellCard';
import { useVoucherStore } from '../stores/voucherStore';
import { validateVoucher } from '../config/vouchers';
import { jiacprCourse } from '../data/jiacprCourse';
import { track } from '../services/analytics';

export default function QuizResults() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  // Voucher holders skip every lesson, so they never reach the certificate
  // page's requirements (all lessons + EKG + video) — meaning they'd never
  // see its LINE-add gate either. Catch that lead right here instead, at the
  // moment they finish the Post-test.
  const voucherActive = useVoucherStore(s => !!(s.voucher && validateVoucher(s.voucher.code)));

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

  // ACLS attempts carry a questionSnapshot; BLS hardcoded posttests still
  // resolve the set via getPostTestSetById.
  const snapshotQuiz = attempt.questionSnapshot
    || (isPostTest ? (getPostTestSetById(attempt.setId)?.questions ?? []) : []);
  const lesson = isAssessment
    ? {
        id: attempt.lessonId,
        title: isPreTest
          ? `Pre-test · ${attempt.setTitle || ''}`.trim()
          : `Post-test Exam · ${attempt.setTitle || ''}`.trim(),
        quiz: snapshotQuiz,
        passingScore: attempt.passPercent
          ?? (isPreTest ? PRE_TEST_PASS_PERCENT : POST_TEST_PASS_PERCENT),
      }
    : findLessonById(attempt.lessonId);

  const retakePath = isPreTest
    ? '/pre-course/pre-test'
    : isPostTest
      ? '/pre-course/post-test'
      : `/pre-course/${attempt.lessonId}/quiz`;

  let nextPath = null;
  let nextLabel = null;
  if (isPreTest) {
    const firstLessonId = preCourseLessons?.[0]?.id;
    if (firstLessonId) {
      nextPath = `/pre-course/${firstLessonId}`;
      nextLabel = 'ไปบทเรียนถัดไป';
    }
  } else if (isPostTest) {
    nextPath = '/certification';
    nextLabel = 'ไปหน้าใบประกาศนียบัตร';
  } else if (!isAssessment) {
    const idx = preCourseLessons.findIndex(l => l.id === attempt.lessonId);
    const nextLesson = idx >= 0 ? preCourseLessons[idx + 1] : null;
    if (nextLesson) {
      nextPath = `/pre-course/${nextLesson.id}`;
      nextLabel = 'ไปบทเรียนถัดไป';
    } else {
      nextPath = '/pre-course/post-test';
      nextLabel = 'ไปทำ Post-test';
    }
  }

  const heading = isPreTest
    ? 'ผล Pre-test'
    : isPostTest
      ? 'ผล Post-test Exam'
      : 'ผลการทำ Quiz';

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/pre-course')}
        className="btn btn-ghost btn-sm">
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

      {isPostTest && voucherActive && (
        <a
          href={jiacprCourse.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('contact_click', {
            meta: 'Contact',
            props: { channel: 'line', source: 'quiz_results_voucher', value: 2500, currency: 'THB' },
          })}
          className="dash-card flex items-center gap-3 border border-success/30 !bg-success/8 no-underline"
        >
          <div className="w-10 h-10 inline-flex items-center justify-center bg-success/15 text-success shrink-0"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <MessageCircle size={18} strokeWidth={2.4} style={{ color: '#06C755' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-strong text-text-primary">เพิ่มเพื่อน LINE ไว้ติดต่อกลับ</div>
            <div className="text-2xs text-text-muted">รับข่าวสาร/สิทธิพิเศษคอร์สอบรม — ไม่บังคับ</div>
          </div>
        </a>
      )}

      {/* จังหวะทอง: สอบผ่าน = พร้อมต่อยอดคอร์สจริงที่สุด */}
      {attempt.passed ? (
        IS_BLS
          ? <BLSCourseUpsellCard source="quiz_results_passed" />
          : <JiacprCourseBanner courseId="acls-full" />
      ) : (
        <JiacprCourseBanner />
      )}

      {nextPath && (
        <button onClick={() => navigate(nextPath)}
          className="btn btn-primary btn-block inline-flex items-center justify-center gap-1">
          {nextLabel} <ChevronRight size={14} strokeWidth={2.2} />
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate(retakePath)}
          className="btn btn-ghost btn-block">
          <RotateCcw size={14} strokeWidth={2.2} /> ทำใหม่
        </button>
        <button
          onClick={() => exportStudentResultPDF({ student, attempt, lesson })}
          className={`btn btn-block ${nextPath ? 'btn-ghost' : 'btn-primary'}`}>
          <Download size={14} strokeWidth={2.2} /> Export PDF
        </button>
      </div>

      {!isPostTest && (
        <button onClick={() => navigate('/certification')}
          className="btn btn-ghost btn-block">
          ดูสถานะใบประกาศนียบัตร
        </button>
      )}
    </div>
  );
}
