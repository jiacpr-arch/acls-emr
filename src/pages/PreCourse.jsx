import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons, preCourseVideos } from '../data/activeLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import LessonCard from '../components/precourse/LessonCard';
import PostTestCard from '../components/precourse/PostTestCard';
import PreTestCard from '../components/precourse/PreTestCard';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import VideoLinksPanel from '../components/precourse/VideoLinksPanel';
import FeaturedVideo from '../components/precourse/FeaturedVideo';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID } from '../data/assessment';
import { IS_ACLS, courseMeta } from '../config/courseMode';
import { GraduationCap, User, UserCheck, Users, RefreshCw } from 'lucide-react';

export default function PreCourse() {
  const navigate = useNavigate();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const clearActiveStudent = usePreCourseStore(s => s.clearActiveStudent);
  const currentAttempt = usePreCourseStore(s => s.currentAttempt);
  const [progress, setProgress] = useState([]);     // [{studentId, lessonId, readAt}]
  const [attempts, setAttempts] = useState([]);     // [{...}]
  const [showIdentity, setShowIdentity] = useState(false);

  useEffect(() => {
    const id = activeStudent?.id;
    if (!id) {
      Promise.resolve().then(() => { setProgress([]); setAttempts([]); });
      return;
    }
    Promise.all([
      getLessonProgress(id),
      getAttemptsForStudent(id),
    ]).then(([p, a]) => { setProgress(p); setAttempts(a); });
  }, [activeStudent?.id]);

  const lessonState = (lessonId) => {
    const read = progress.some(p => p.lessonId === lessonId);
    const lessonAttempts = attempts.filter(a => a.lessonId === lessonId);
    const best = lessonAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
    const inProgress =
      currentAttempt?.lessonId === lessonId
      && (currentAttempt.stepIndex ?? 0) > 0
      && !best;
    return {
      read,
      bestScore: best?.score ?? null,
      passed: best?.passed ?? false,
      inProgress,
    };
  };

  return (
    <div className="page-container space-y-5">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
          }}>
          <GraduationCap size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">Pre-course</h1>
        <p className="text-caption text-text-muted">อ่านบทเรียนและทำ quiz ก่อนเข้าเรียนจริง</p>
      </div>

      {/* Active student banner */}
      <div className="dash-card flex items-center gap-3">
        {activeStudent ? (
          <>
            <div className="w-10 h-10 inline-flex items-center justify-center bg-success/12 text-success shrink-0"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <UserCheck size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary truncate">{activeStudent.name}</div>
              <div className="text-[11px] text-text-muted font-mono">รหัส: {activeStudent.studentId}</div>
            </div>
            <button onClick={() => { clearActiveStudent(); setShowIdentity(true); }}
              className="btn btn-ghost btn-sm">
              <RefreshCw size={13} strokeWidth={2.2} /> เปลี่ยนผู้เรียน
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary text-text-muted shrink-0"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <User size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary">ยังไม่ได้ระบุตัวผู้เรียน</div>
              <div className="text-[11px] text-text-muted">ใส่ชื่อและรหัสก่อนเริ่มเพื่อบันทึกผล</div>
            </div>
            <button onClick={() => setShowIdentity(true)} className="btn btn-primary btn-sm">
              ระบุตัวตน
            </button>
          </>
        )}
      </div>

      {courseMeta.featuredVideo && <FeaturedVideo video={courseMeta.featuredVideo} />}

      <VideoLinksPanel videos={preCourseVideos} />

      {IS_ACLS && activeStudent && (() => {
        const ptAttempts = attempts.filter(a => a.lessonId === PRE_TEST_LESSON_ID);
        const ptBest = ptAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
        return (
          <>
            <div className="text-overline text-text-muted px-1">ข้อสอบก่อนเรียน</div>
            <PreTestCard
              bestScore={ptBest?.score ?? null}
              passed={ptBest?.passed ?? false}
              attemptCount={ptAttempts.length}
            />
          </>
        );
      })()}

      <div className="flex items-center justify-between px-1">
        <div className="text-overline text-text-muted">บทเรียน</div>
        <button onClick={() => navigate('/pre-course/cohort')}
          className="text-[11px] font-bold inline-flex items-center gap-1 text-info hover:underline">
          <Users size={12} strokeWidth={2.4} /> สำหรับอาจารย์
        </button>
      </div>

      <div className="space-y-2">
        {preCourseLessons.map(l => {
          const st = lessonState(l.id);
          return <LessonCard key={l.id} lesson={l} {...st} />;
        })}
      </div>

      {(() => {
        const lessonsPassed = preCourseLessons.every(l => lessonState(l.id).passed);
        const ptAttempts = attempts.filter(a => a.lessonId === POST_TEST_LESSON_ID);
        const ptBest = ptAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
        return (
          <>
            <div className="text-overline text-text-muted px-1 pt-1">ข้อสอบหลังเรียน</div>
            <PostTestCard
              unlocked={!!activeStudent && lessonsPassed}
              bestScore={ptBest?.score ?? null}
              passed={ptBest?.passed ?? false}
              attemptCount={ptAttempts.length}
              lessonCount={preCourseLessons.length}
            />
          </>
        );
      })()}

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
