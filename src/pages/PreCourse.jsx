import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { preCourseLessons, preCourseVideos } from '../data/activeLessons';
import { usePreCourseStore } from '../stores/preCourseStore';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import LessonCard from '../components/precourse/LessonCard';
import PostTestCard from '../components/precourse/PostTestCard';
import PreTestCard from '../components/precourse/PreTestCard';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import ClassGateModal from '../components/precourse/ClassGateModal';
import VoucherModal from '../components/precourse/VoucherModal';
import VoucherCard from '../components/precourse/VoucherCard';
import VideoLinksPanel from '../components/precourse/VideoLinksPanel';
import { useClassStore } from '../stores/classStore';
import { useVoucherStore } from '../stores/voucherStore';
import { validateVoucher } from '../config/vouchers';
import { track } from '../services/analytics';
import FeaturedVideo from '../components/precourse/FeaturedVideo';
import MyScoreCard from '../components/precourse/MyScoreCard';
import BLSHero from '../components/precourse/BLSHero';
import BLSProgressCard from '../components/precourse/BLSProgressCard';
import BLSQuickActions from '../components/precourse/BLSQuickActions';
import BLSSplash from '../components/precourse/BLSSplash';
import ACLSProgressCard from '../components/precourse/ACLSProgressCard';
import NewsCard from '../components/NewsCard';
import StreakBadge from '../components/StreakBadge';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID } from '../data/activePreTest';
import { IS_BLS, courseMeta } from '../config/courseMode';
import {
  GraduationCap, Users, FileText,
  Cloud, CloudOff, ChevronDown, QrCode,
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
  // When the identity modal is opened from the "start Pre-test" CTA, drop the
  // student straight into the exam once they've entered their name — removes the
  // extra tap that used to sit between registering and actually starting.
  const [identityNext, setIdentityNext] = useState(null); // 'pretest' | null
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(IS_BLS && !blsSplashSeen);
  const lessonsRef = useRef(null);
  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);
  const clearClass = useClassStore(s => s.clearClass);
  // /pre-course?join=K7M2QX — students arriving from the instructor's QR /
  // shared link land straight on the join form with the code prefilled.
  const [searchParams] = useSearchParams();
  const joinParam = (searchParams.get('join') || '').trim().toUpperCase();
  const [showClassGate, setShowClassGate] = useState(() => {
    const s = useClassStore.getState();
    if (joinParam && s.classCode !== joinParam) return true;
    return !s.classCode && !s.syncDisabled;
  });
  const gateInitialMode = joinParam && classCode !== joinParam ? 'join' : 'home';

  // Voucher: unlocks the Post-test without requiring every lesson to be passed.
  const voucherActive = useVoucherStore(s => !!(s.voucher?.lineConfirmed && validateVoucher(s.voucher.code)));
  const redeemVoucher = useVoucherStore(s => s.redeemVoucher);
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherInitialCode, setVoucherInitialCode] = useState('');
  // /pre-course?voucher=ACLS2025 — a share-only link for people who already
  // have the code. Valid → redeem silently; invalid → open the modal prefilled
  // so they can see/retype it. Mirrors the ?join= class-link pattern.
  const voucherParam = (searchParams.get('voucher') || '').trim().toUpperCase();
  useEffect(() => {
    if (!voucherParam) return;
    const v = validateVoucher(voucherParam);
    if (v) {
      redeemVoucher(v);
      track('voucher_redeemed', { props: { code: v.code, via: 'link' } });
    } else {
      // Invalid link code — open the modal prefilled so the user can see/retype
      // it. Deferred to a microtask to avoid a synchronous setState-in-effect.
      Promise.resolve().then(() => {
        setVoucherInitialCode(voucherParam);
        setShowVoucher(true);
      });
    }
  }, [voucherParam, redeemVoucher]);

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
  const postTestUnlocked = !!activeStudent && (allLessonsPassed || voucherActive);
  const postTestPassed = postBest?.passed ?? false;

  const nextLesson = (() => {
    const found = preCourseLessons.find(l => !lessonState(l.id).passed);
    if (!found) return null;
    return { id: found.id, shortTitle: shortenLessonTitle(found.title) };
  })();

  const startPretest = () => { setIdentityNext('pretest'); setShowIdentity(true); };
  const confirmIdentity = () => {
    setShowIdentity(false);
    const next = identityNext;
    setIdentityNext(null);
    if (next === 'pretest') navigate('/pre-course/pre-test');
  };
  const closeIdentity = () => { setIdentityNext(null); setShowIdentity(false); };

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
            <div className="text-2xs text-text-muted font-mono">รหัสคลาส: {classCode}</div>
          </div>
          {/* บัตร QR เช็คชื่อเข้าฐาน — โชว์เมื่อลงชื่อนักเรียนแล้วเท่านั้น
              (QR ต้องผูกกับ student_pk ของคนที่ลงชื่อ) */}
          {activeStudent && (
            <button onClick={() => navigate('/pre-course/my-qr')}
              className="btn btn-ghost btn-sm">
              <QrCode size={14} strokeWidth={2.2} /> บัตร QR
            </button>
          )}
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
            <div className="text-2xs text-text-muted">ข้อมูลเก็บในเครื่องนี้เท่านั้น</div>
          </div>
          <button onClick={() => setShowClassGate(true)} className="btn btn-ghost btn-sm">
            เชื่อมต่อคลาส
          </button>
        </>
      )}
    </div>
  );

  // Pre-test / post-test best scores (ใช้ทั้งสองโหมด — BLS ใช้ชุดข้อสอบในไฟล์)
  const preTestAttempts = attempts.filter(a => a.lessonId === PRE_TEST_LESSON_ID);
  const preTestBest = preTestAttempts.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
  const preTestPassed = preTestBest?.passed ?? false;
  const preTestAttempted = preTestAttempts.length > 0;

  if (IS_BLS) {
    return (
      <div className="page-container flex flex-col gap-4">
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

        <VoucherCard onOpen={() => setShowVoucher(true)} />

        {/* คะแนนของฉัน — นักเรียนเห็นผลตัวเองครบในที่เดียว (แสดงเมื่อลงชื่อแล้ว) */}
        {activeStudent && <MyScoreCard student={activeStudent} />}

        <BLSQuickActions
          lessonsPassed={lessonsPassed}
          totalLessons={totalLessons}
          postTestPassed={postTestPassed}
          postTestUnlocked={postTestUnlocked}
          onScrollToLessons={scrollToLessons}
        />

        {courseMeta.featuredVideo && <FeaturedVideo video={courseMeta.featuredVideo} />}

        {/* Pre-test — แบบวัดพื้นฐานก่อนเริ่มอ่านบทเรียน (ไม่ใช่เงื่อนไขใบประกาศ) */}
        <div className="space-y-2">
          <div className="text-overline text-text-muted px-1">ข้อสอบก่อนเรียน</div>
          <PreTestCard
            bestScore={preTestBest?.score ?? null}
            passed={preTestPassed}
            attemptCount={preTestAttempts.length}
          />
        </div>

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

        <VideoLinksPanel videos={preCourseVideos} />

        <div className="flex justify-end px-1 pt-1">
          <button onClick={() => navigate('/pre-course/cohort')}
            className="btn btn-ghost btn-sm">
            <Users size={14} strokeWidth={2.4} /> สำหรับอาจารย์
          </button>
        </div>

        <ClassGateModal
          open={showClassGate}
          initialMode={gateInitialMode}
          initialCode={joinParam}
          onClose={() => setShowClassGate(false)}
        />

        <StudentIdentityModal
          open={showIdentity}
          onClose={() => setShowIdentity(false)}
          onConfirm={() => setShowIdentity(false)}
        />

        <VoucherModal
          open={showVoucher}
          initialCode={voucherInitialCode}
          onClose={() => { setShowVoucher(false); setVoucherInitialCode(''); }}
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px color-mix(in srgb, var(--color-accent) 28%, transparent)',
          }}>
          <GraduationCap size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">บทเรียน {courseMeta.shortName}</h1>
        <p className="text-caption text-text-muted">3 ขั้นตอน: Pre-test → บทเรียน → Post-test</p>
      </div>

      {/* Hero: progress + smart next-step CTA. Replaces the previous
          stand-alone active-student banner because identity is shown inside. */}
      <ACLSProgressCard
        activeStudent={activeStudent}
        preTestPassed={preTestPassed}
        preTestAttempted={preTestAttempted}
        lessonsPassed={lessonsPassed}
        totalLessons={totalLessons}
        nextLesson={nextLesson}
        postTestPassed={postTestPassed}
        postTestUnlocked={postTestUnlocked}
        onIdentify={() => setShowIdentity(true)}
        onStartPretest={startPretest}
        onChangeStudent={() => { clearActiveStudent(); setShowIdentity(true); }}
      />

      {classBanner}

      <VoucherCard onOpen={() => setShowVoucher(true)} />

      {/* คะแนนของฉัน — นักเรียนเห็นผลตัวเองครบในที่เดียว (แสดงเมื่อลงชื่อแล้ว) */}
      {activeStudent && <MyScoreCard student={activeStudent} />}

      {/* Step 1 — Pre-test */}
      {activeStudent && (
        <div className="space-y-2">
          <div className="text-overline text-text-muted px-1 flex items-center gap-2">
            <StepNumber n={1} />
            ข้อสอบก่อนเรียน
          </div>
          <PreTestCard
            bestScore={preTestBest?.score ?? null}
            passed={preTestPassed}
            attemptCount={preTestAttempts.length}
          />
        </div>
      )}

      {/* Step 2 — Lessons */}
      <div className="space-y-2" id="acls-lessons">
        <div className="flex items-center justify-between px-1">
          <div className="text-overline text-text-muted flex items-center gap-2">
            <StepNumber n={2} />
            บทเรียน · {lessonsPassed}/{totalLessons} ผ่าน
          </div>
          <div className="flex items-center gap-1">
            <a
              href={`${import.meta.env.BASE_URL}student-precourse-guide.pdf`}
              target="_blank" rel="noopener noreferrer" download
              className="btn btn-ghost btn-sm">
              <FileText size={14} strokeWidth={2.4} /> คู่มือ (PDF)
            </a>
            <button onClick={() => navigate('/pre-course/cohort')}
              className="btn btn-ghost btn-sm">
              <Users size={14} strokeWidth={2.4} /> สำหรับอาจารย์
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {preCourseLessons.map(l => {
            const st = lessonState(l.id);
            return <LessonCard key={l.id} lesson={l} {...st} />;
          })}
        </div>
      </div>

      {/* Step 3 — Post-test */}
      <div className="space-y-2">
        <div className="text-overline text-text-muted px-1 flex items-center gap-2">
          <StepNumber n={3} />
          ข้อสอบหลังเรียน
        </div>
        <PostTestCard
          unlocked={postTestUnlocked}
          bestScore={postBest?.score ?? null}
          passed={postTestPassed}
          attemptCount={postAttempts.length}
          lessonCount={totalLessons}
        />
      </div>

      {/* Supplementary content — pushed below the main flow so it does not
          bury the lesson list */}
      <StreakBadge />
      <NewsCard />
      {courseMeta.featuredVideo && <FeaturedVideo video={courseMeta.featuredVideo} />}
      <VideoLinksPanel videos={preCourseVideos} />

      <ClassGateModal
        open={showClassGate}
        initialMode={gateInitialMode}
        initialCode={joinParam}
        onClose={() => setShowClassGate(false)}
      />

      <StudentIdentityModal
        open={showIdentity}
        onClose={closeIdentity}
        onConfirm={confirmIdentity}
      />

      <VoucherModal
        open={showVoucher}
        initialCode={voucherInitialCode}
        onClose={() => { setShowVoucher(false); setVoucherInitialCode(''); }}
      />
    </div>
  );
}

function StepNumber({ n }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 bg-info text-white text-2xs font-extrabold shrink-0"
      style={{ borderRadius: '50%' }}
    >
      {n}
    </span>
  );
}

function shortenLessonTitle(title) {
  if (!title) return '';
  // "บทที่ 1: ภาพรวม BLS …" → "บทที่ 1"
  const m = title.match(/^(บทที่\s*\d+)/);
  if (m) return m[1];
  return title.length > 18 ? title.slice(0, 18) + '…' : title;
}
