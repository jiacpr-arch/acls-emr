import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preCourseLessons, preCourseVideos } from '../data/activeLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import LessonCard from '../components/precourse/LessonCard';
import PostTestCard from '../components/precourse/PostTestCard';
import PreTestCard from '../components/precourse/PreTestCard';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import ClassGateModal from '../components/precourse/ClassGateModal';
import VideoLinksPanel from '../components/precourse/VideoLinksPanel';
import { useClassStore } from '../stores/classStore';
import FeaturedVideo from '../components/precourse/FeaturedVideo';
import BLSHero from '../components/precourse/BLSHero';
import BLSProgressCard from '../components/precourse/BLSProgressCard';
import BLSQuickActions from '../components/precourse/BLSQuickActions';
import BLSSplash from '../components/precourse/BLSSplash';
import BLSCourseUpsellCard from '../components/precourse/BLSCourseUpsellCard';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID } from '../data/assessment';
import { IS_ACLS, IS_BLS, courseMeta } from '../config/courseMode';
import {
  GraduationCap, User, UserCheck, Users, RefreshCw,
  Cloud, CloudOff, ChevronDown,
} from 'lucide-react';

// Module-level flag — splash shows once per full page load, not on every
// in-app navigation back to /. Resets when the user reloads the tab.
let blsSplashSeen = false;

export default function PreCourse() {
  const navigate = useNavigate();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const clearActiveStudent = usePreCourseStore(s => s.clearActiveStudent);
  const currentAttempt = usePreCourseStore(s => s.currentAttempt);
  const [progress, setProgress] = useState([]);     // [{studentId, lessonId, readAt}]
  const [attempts, setAttempts] = useState([]);     // [{...}]
  const [showIdentity, setShowIdentity] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(IS_BLS && !blsSplashSeen);
  const lessonsRef = useRef(null);
  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);
  const clearClass = useClassStore(s => s.clearClass);
  const [showClassGate, setShowClassGate] = useState(() => {
    const s = useClassStore.getState();
    return !s.classCode && !s.syncDisabled;
  });

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

  const lessonsPassed = preCourseLessons.filter(l => lessonState(l.id).passed).length;
  const totalLessons = preCourseLessons.length;
  const allLessonsPassed = lessonsPassed === totalLessons && totalLessons > 0;
  const postAttempts = attempts.filter(a => a.lessonId === POST_TEST_LESSON_ID);
  const postBest = postAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
  const postTestUnlocked = !!activeStudent && allLessonsPassed;
  const postTestPassed = postBest?.passed ?? false;

  const nextLesson = (() => {
    const found = preCourseLessons.find(l => !lessonState(l.id).passed);
    if (!found) return null;
    return { id: found.id, shortTitle: shortenLessonTitle(found.title) };
  })();

  const scrollToLessons = () => {
    setLessonsOpen(true);
    requestAnimationFrame(() => {
      lessonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const classBanner = (
    <div className="dash-card flex items-center gap-3">
      {classCode ? (
        <>
          <div className="w-10 h-10 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Cloud size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-strong text-text-primary truncate">
              คลาส: {className || '—'}
            </div>
            <div className="text-[11px] text-text-muted font-mono">รหัสคลาส: {classCode}</div>
          </div>
          <button onClick={() => { clearClass(); setShowClassGate(true); }}
            className="btn btn-ghost btn-sm">
            เปลี่ยนคลาส
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary text-text-muted shrink-0"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <CloudOff size={18} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-strong text-text-primary">โหมด offline</div>
            <div className="text-[11px] text-text-muted">ข้อมูลเก็บในเครื่องนี้เท่านั้น</div>
          </div>
          <button onClick={() => setShowClassGate(true)} className="btn btn-ghost btn-sm">
            เชื่อมต่อคลาส
          </button>
        </>
      )}
    </div>
  );

  if (IS_BLS) {
    return (
      <div className="page-container flex flex-col gap-8">
        {showSplash && (
          <BLSSplash
            onDismiss={() => { blsSplashSeen = true; setShowSplash(false); }}
          />
        )}
        <BLSHero />

        <BLSProgressCard
          activeStudent={activeStudent}
          lessonsPassed={lessonsPassed}
          totalLessons={totalLessons}
          nextLesson={nextLesson}
          postTestPassed={postTestPassed}
          postTestUnlocked={postTestUnlocked}
          onIdentify={() => setShowIdentity(true)}
          onChangeStudent={() => { clearActiveStudent(); setShowIdentity(true); }}
        />

        {classBanner}

        <BLSQuickActions
          lessonsPassed={lessonsPassed}
          totalLessons={totalLessons}
          postTestPassed={postTestPassed}
          postTestUnlocked={postTestUnlocked}
          onScrollToLessons={scrollToLessons}
        />

        {courseMeta.featuredVideo && <FeaturedVideo video={courseMeta.featuredVideo} />}

        {/* Collapsible lessons section */}
        <div ref={lessonsRef}>
          <button
            onClick={() => setLessonsOpen(o => !o)}
            className="w-full flex items-center justify-between px-1 py-2 text-left"
          >
            <div className="text-overline text-text-muted">
              บทเรียนทั้งหมด · {lessonsPassed}/{totalLessons} ผ่าน
            </div>
            <ChevronDown
              size={16}
              strokeWidth={2.4}
              className="text-text-muted transition-transform"
              style={{ transform: lessonsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {lessonsOpen && (
            <div className="space-y-3 mt-3 animate-slide-up">
              {preCourseLessons.map(l => {
                const st = lessonState(l.id);
                return <LessonCard key={l.id} lesson={l} {...st} />;
              })}
            </div>
          )}
        </div>

        {/* Post-test card — visible so students always see the goal */}
        <div className="space-y-2">
          <div className="text-overline text-text-muted px-1">ข้อสอบหลังเรียน</div>
          <PostTestCard
            unlocked={postTestUnlocked}
            bestScore={postBest?.score ?? null}
            passed={postTestPassed}
            attemptCount={postAttempts.length}
            lessonCount={totalLessons}
          />
        </div>

        <BLSCourseUpsellCard />

        <VideoLinksPanel videos={preCourseVideos} />

        <div className="flex justify-end px-1 pt-1">
          <button onClick={() => navigate('/pre-course/cohort')}
            className="text-[11px] font-bold inline-flex items-center gap-1 text-info hover:underline">
            <Users size={12} strokeWidth={2.4} /> สำหรับอาจารย์
          </button>
        </div>

        <ClassGateModal
          open={showClassGate}
          onClose={() => setShowClassGate(false)}
        />

        <StudentIdentityModal
          open={showIdentity}
          onClose={() => setShowIdentity(false)}
          onConfirm={() => setShowIdentity(false)}
        />
      </div>
    );
  }

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

      {classBanner}

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
        const lessonsPassedAll = preCourseLessons.every(l => lessonState(l.id).passed);
        const ptAttempts = attempts.filter(a => a.lessonId === POST_TEST_LESSON_ID);
        const ptBest = ptAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
        return (
          <>
            <div className="text-overline text-text-muted px-1 pt-1">ข้อสอบหลังเรียน</div>
            <PostTestCard
              unlocked={!!activeStudent && lessonsPassedAll}
              bestScore={ptBest?.score ?? null}
              passed={ptBest?.passed ?? false}
              attemptCount={ptAttempts.length}
              lessonCount={preCourseLessons.length}
            />
          </>
        );
      })()}

      <ClassGateModal
        open={showClassGate}
        onClose={() => setShowClassGate(false)}
      />

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}

function shortenLessonTitle(title) {
  if (!title) return '';
  // "บทที่ 1: ภาพรวม BLS …" → "บทที่ 1"
  const m = title.match(/^(บทที่\s*\d+)/);
  if (m) return m[1];
  return title.length > 18 ? title.slice(0, 18) + '…' : title;
}
