import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findLessonById } from '../data/preCourseContent';
import { usePreCourseStore } from '../stores/preCourseStore';
import { markLessonRead, hasReadLesson } from '../db/database';
import LessonSectionView from '../components/precourse/LessonSectionView';
import ReadCompleteButton from '../components/precourse/ReadCompleteButton';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import { ChevronLeft, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function LessonReader() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const lesson = findLessonById(lessonId);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [alreadyRead, setAlreadyRead] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (activeStudent && lesson) {
        const read = await hasReadLesson(activeStudent.id, lesson.id);
        if (!cancelled) setAlreadyRead(read);
      } else {
        setAlreadyRead(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeStudent?.id, lesson?.id]);

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

  const handleComplete = async () => {
    if (!activeStudent) { setShowIdentity(true); return; }
    await markLessonRead(activeStudent.id, lesson.id);
    setAlreadyRead(true);
    navigate(`/pre-course/${lesson.id}/quiz`);
  };

  return (
    <div className="page-container space-y-4">
      <button onClick={() => navigate('/pre-course')}
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไปรายการบทเรียน
      </button>

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-title text-text-primary">{lesson.title}</h1>
          <div className="text-[11px] text-text-muted inline-flex items-center gap-2 mt-1">
            <Clock size={11} strokeWidth={2.2} /> ~{lesson.estMinutes} นาที
            <span>·</span>
            <span>{lesson.quiz.length} ข้อ · เกณฑ์ {lesson.passingScore}%</span>
          </div>
        </div>
      </div>

      <LessonSectionView sections={lesson.sections} />

      <ReadCompleteButton
        alreadyRead={alreadyRead}
        onComplete={handleComplete}
      />

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={async (s) => {
          setShowIdentity(false);
          await markLessonRead(s.id, lesson.id);
          setAlreadyRead(true);
          navigate(`/pre-course/${lesson.id}/quiz`);
        }}
      />
    </div>
  );
}
