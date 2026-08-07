import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useSettingsStore } from './stores/settingsStore';
import { IS_BLS, IS_ACLS, IS_SKILL_COURSE, IS_DEFIB, courseMeta } from './config/courseMode';
import { useCourseModeInit } from './hooks/useCourseModeInit';
import Dashboard from './pages/Dashboard';
import NewCase from './pages/NewCase';
import Recording from './pages/Recording';
import Algorithm from './pages/Algorithm';
import Settings from './pages/Settings';
import ScenarioSelect from './pages/ScenarioSelect';
import DrugCalc from './pages/DrugCalc';
import Statistics from './pages/Statistics';
import DrillTimer from './pages/DrillTimer';
import CaseCompare from './pages/CaseCompare';
import Certification from './pages/Certification';
import UserGuide from './pages/UserGuide';
import Feedback from './pages/Feedback';
import ALSKnowledge from './pages/ALSKnowledge';
import QAAclsDeep from './pages/QAAclsDeep';
import QAAclsDeepCategory from './pages/QAAclsDeepCategory';
import QAAclsDeepQuestion from './pages/QAAclsDeepQuestion';
import CodeBlueSim from './pages/CodeBlueSim';
import CodeBlueLeaderboard from './pages/CodeBlueLeaderboard';
import RecorderGameHub from './pages/RecorderGameHub';
import RecorderGamePlay from './pages/RecorderGamePlay';
import RecorderEndless from './pages/RecorderEndless';
import GamesHub from './pages/GamesHub';
import PreCourse from './pages/PreCourse';
import Learn from './pages/Learn';
import VideoLessons from './pages/VideoLessons';
import VideoLessonDetail from './pages/VideoLessonDetail';
import LessonReader from './pages/LessonReader';
import QuizResults from './pages/QuizResults';
import InstructorCohort from './pages/InstructorCohort';
import InstructorCheckin from './pages/InstructorCheckin';
import StudentQrCard from './pages/StudentQrCard';
import PostTestExam from './pages/PostTestExam';
import PreTestExam from './pages/PreTestExam';
import BLSSkillPractice from './pages/BLSSkillPractice';
import BLSScenario from './pages/BLSScenario';
import BLSScenarioHub from './pages/BLSScenarioHub';
import BLSAlgorithm from './pages/BLSAlgorithm';
import BLSAedGuide from './pages/BLSAedGuide';
import BLSChokingRelief from './pages/BLSChokingRelief';
import BLSKnowledge from './pages/BLSKnowledge';
import SkillKnowledge from './pages/SkillKnowledge';
import RhythmQuiz from './pages/RhythmQuiz';
import SkillScenarioHub from './pages/SkillScenarioHub';
import SkillScenario from './pages/SkillScenario';
import NewsPage from './pages/NewsPage';
import RequireAdmin from './components/RequireAdmin';
import BottomTabBar from './components/BottomTabBar';
import SiteFooter from './components/SiteFooter';
import LineFloatButton from './components/LineFloatButton';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import InAppBrowserGuard from './components/InAppBrowserGuard';
import MetaPixel from './components/MetaPixel';
import { useSyncEngine } from './services/syncEngine';
import { usePullEngine } from './services/progressPull';

// Admin pages are code-split — keep the main bundle below the workbox precache limit
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminChapters = lazy(() => import('./pages/AdminChapters'));
const AdminPreCourseImages = lazy(() => import('./pages/AdminPreCourseImages'));
const AdminBlsGuideMedia = lazy(() => import('./pages/AdminBlsGuideMedia'));
const AdminBlsKnowledgeMedia = lazy(() => import('./pages/AdminBlsKnowledgeMedia'));
const AdminQADeep = lazy(() => import('./pages/AdminQADeep'));
const AdminQADeepPosted = lazy(() => import('./pages/AdminQADeepPosted'));
const AdminStudentQuestions = lazy(() => import('./pages/AdminStudentQuestions'));
const AdminStats = lazy(() => import('./pages/AdminStats'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const AdminClasses = lazy(() => import('./pages/AdminClasses'));
const AdminVideoLessons = lazy(() => import('./pages/AdminVideoLessons'));
const AdminRecorderCases = lazy(() => import('./pages/AdminRecorderCases'));
const AdminCodeBlueScenarios = lazy(() => import('./pages/AdminCodeBlueScenarios'));
const AdminCodeBlueCharacters = lazy(() => import('./pages/AdminCodeBlueCharacters'));

const AdminFallback = () => (
  <div className="page-container py-12 text-center text-caption text-text-muted">
    กำลังโหลด admin…
  </div>
);

function App() {
  const theme = useSettingsStore(s => s.theme);
  const location = useLocation();
  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark) => root.classList.toggle('dark', isDark);
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const onChange = (e) => apply(e.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    apply(theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.title = courseMeta.title;
  }, []);

  useCourseModeInit();
  useSyncEngine();   // ขาขึ้น: ผลในเครื่อง → cloud
  usePullEngine();   // ขาลง: cloud → เครื่องนี้ (เล่นหลายเครื่องแล้วตามกันทัน)

  // Recording page has its own nav (QuickBar + FloatingStatus)
  // Admin pages also hide the bottom tab bar
  // /sim (Code Blue game) is full-screen — has its own กลับหน้าแรก button
  const isRecording = location.pathname === '/recording'
    || location.pathname === '/sim';
  const isAdmin = location.pathname.startsWith('/admin');
  // หน้าเล่นเกม Recorder ใช้ GameQuickBar (bottom-pill-bar) ตำแหน่งเดียวกับ BottomTabBar
  // จึงต้องซ่อน tab bar เฉพาะหน้าเล่นด่าน (ไม่ใช่หน้า hub)
  const isRecorderGamePlay = /^\/recorder-game\/.+/.test(location.pathname);
  // หน้าที่นักเรียน "กำลังเรียน/สอบจริง" (อ่านบทเรียน + ทำข้อสอบ pre/post) —
  // ไม่โชว์ปุ่ม LINE ลอย + footer โฆษณา เพื่อไม่รบกวนระหว่างเรียน
  // ครอบคลุม /pre-course/<lessonId>[/quiz], /pre-course/pre-test, /pre-course/post-test
  // และ /video-lessons/<clipId> (หน้าเรียนวิดีโอทีละสเต็ป — มีแถบปุ่มติดขอบล่างอยู่แล้ว)
  // ไม่รวมหน้า landing (/pre-course, /), ไลบรารีวิดีโอ (/video-lessons),
  // หน้าผลสอบ (/results), หน้าอาจารย์ (/cohort)
  const isStudying = (/^\/pre-course\/[^/]+(\/quiz)?$/.test(location.pathname)
    && location.pathname !== '/pre-course/cohort')
    || /^\/video-lessons\/.+/.test(location.pathname);
  // หน้าฝึก CPR + เกมสถานการณ์ตัดสินใจ — เป็นเครื่องมือฝึกจริง ไม่ใช่หน้าขายคอร์ส
  // ปุ่ม LINE ลอยจะไปบังคำอธิบาย/ปุ่มควบคุมพอดี จึงซ่อนไว้เฉพาะหน้านี้
  const isPractice = location.pathname === '/skill-practice'
    || /^\/bls\/scenario\/.+/.test(location.pathname)
    || /^\/scenario\/.+/.test(location.pathname);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <OfflineIndicator />
      <InAppBrowserGuard />
      <ErrorBoundary>
      <Routes>
        {/* shared across both course modes */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/certification" element={<Certification />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/news" element={<NewsPage />} />

        {/* pre-course flow — ทั้งสอง mode ใช้ (lesson content เปลี่ยนตาม mode ผ่าน activeLessons shim) */}
        <Route path="/pre-course" element={<PreCourse />} />
        <Route path="/pre-course/cohort" element={<InstructorCohort />} />
        <Route path="/pre-course/checkin" element={<InstructorCheckin />} />
        <Route path="/pre-course/my-qr" element={<StudentQrCard />} />
        <Route path="/pre-course/pre-test" element={<PreTestExam />} />
        <Route path="/pre-course/post-test" element={<PostTestExam />} />
        <Route path="/pre-course/results/:attemptId" element={<QuizResults />} />
        <Route path="/pre-course/:lessonId" element={<LessonReader />} />
        <Route path="/pre-course/:lessonId/quiz" element={<LessonReader />} />

        {IS_ACLS && <Route path="/" element={<NewCase />} />}
        {IS_ACLS && <Route path="/recording" element={<Recording />} />}
        {IS_ACLS && <Route path="/history" element={<Dashboard />} />}
        {IS_ACLS && <Route path="/algorithm" element={<Algorithm />} />}
        {IS_ACLS && <Route path="/scenarios" element={<ScenarioSelect />} />}
        {IS_ACLS && <Route path="/drug-calc" element={<DrugCalc />} />}
        {IS_ACLS && <Route path="/statistics" element={<Statistics />} />}
        {IS_ACLS && <Route path="/drill" element={<DrillTimer />} />}
        {IS_ACLS && <Route path="/compare" element={<CaseCompare />} />}
        {IS_ACLS && <Route path="/als" element={<ALSKnowledge />} />}
        {IS_ACLS && <Route path="/qa-acls-deep" element={<QAAclsDeep />} />}
        {IS_ACLS && <Route path="/qa-acls-deep/:chapterId" element={<QAAclsDeepCategory />} />}
        {IS_ACLS && <Route path="/qa-acls-deep/:chapterId/:qNum" element={<QAAclsDeepQuestion />} />}
        {/* เกม Code Blue เปิดทั้ง ACLS และ BLS/MorRoo — คลังโจทย์กรองตามโหมดเอง */}
        <Route path="/sim" element={<CodeBlueSim />} />
        <Route path="/sim-board" element={<CodeBlueLeaderboard />} />
        {IS_ACLS && <Route path="/games" element={<GamesHub />} />}
        {IS_ACLS && <Route path="/recorder-game" element={<RecorderGameHub />} />}
        {IS_ACLS && <Route path="/recorder-game/endless" element={<RecorderEndless />} />}
        {IS_ACLS && <Route path="/recorder-game/:levelId" element={<RecorderGamePlay />} />}
        {(IS_ACLS || IS_BLS || IS_SKILL_COURSE) && <Route path="/video-lessons" element={<VideoLessons />} />}
        {(IS_ACLS || IS_BLS || IS_SKILL_COURSE) && <Route path="/video-lessons/:id" element={<VideoLessonDetail />} />}

        {/* Airway / Defibrillation / IV·IO skill courses — theory-only, one
            lesson track + knowledge base + scenario game each (see plan). */}
        {IS_SKILL_COURSE && <Route path="/" element={<PreCourse />} />}
        {IS_SKILL_COURSE && <Route path="/knowledge" element={<SkillKnowledge />} />}
        {IS_DEFIB && <Route path="/rhythm-quiz" element={<RhythmQuiz />} />}
        {IS_SKILL_COURSE && <Route path="/scenario" element={<SkillScenarioHub />} />}
        {IS_SKILL_COURSE && <Route path="/scenario/:stageId" element={<SkillScenario />} />}
        {/* เข้าถึงได้ทั้ง ACLS/BLS — เมนูใน AdminDashboard กรองตามโหมดเอง */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            </Suspense>
          }
        />
        {IS_ACLS && (
          <Route
            path="/admin/chapters"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminChapters />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {/* เข้าถึงได้ทั้ง ACLS/BLS — preCourseLessons ใน activeLessons.js สลับตามโหมดเอง */}
        <Route
          path="/admin/precourse-images"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminPreCourseImages />
              </RequireAdmin>
            </Suspense>
          }
        />
        {IS_ACLS && (
          <Route
            path="/admin/qa-deep"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminQADeep />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/qa-deep/posted"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminQADeepPosted />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/student-questions"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminStudentQuestions />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/stats"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminStats />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/students"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminStudents />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/classes"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminClasses />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {(IS_ACLS || IS_BLS || IS_SKILL_COURSE) && (
          <Route
            path="/admin/video-lessons"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminVideoLessons />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
          <Route
            path="/admin/recorder-cases"
            element={
              <Suspense fallback={<AdminFallback />}>
                <RequireAdmin>
                  <AdminRecorderCases />
                </RequireAdmin>
              </Suspense>
            }
          />
        )}
        {/* จัดการโจทย์เกม Code Blue — เปิดทั้ง ACLS/BLS (โจทย์กรองตามโหมด) */}
        <Route
          path="/admin/code-blue-scenarios"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminCodeBlueScenarios />
              </RequireAdmin>
            </Suspense>
          }
        />
        <Route
          path="/admin/code-blue-characters"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminCodeBlueCharacters />
              </RequireAdmin>
            </Suspense>
          }
        />
        {/* สื่อประกอบหน้า Guide BLS — เปิดทั้ง ACLS/BLS (ใช้จริงเฉพาะ build BLS) */}
        <Route
          path="/admin/bls-guide-media"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminBlsGuideMedia />
              </RequireAdmin>
            </Suspense>
          }
        />
        {/* สื่อประกอบคลังความรู้ BLS — เปิดทั้ง ACLS/BLS (ใช้จริงเฉพาะ build BLS) */}
        <Route
          path="/admin/bls-knowledge-media"
          element={
            <Suspense fallback={<AdminFallback />}>
              <RequireAdmin>
                <AdminBlsKnowledgeMedia />
              </RequireAdmin>
            </Suspense>
          }
        />

        {IS_BLS && <Route path="/" element={<PreCourse />} />}
        {IS_BLS && <Route path="/new-case" element={<NewCase />} />}
        {IS_BLS && <Route path="/recording" element={<Recording />} />}
        {IS_BLS && <Route path="/history" element={<Dashboard />} />}
        {IS_BLS && <Route path="/skill-practice" element={<BLSSkillPractice />} />}
        {IS_BLS && <Route path="/bls/scenario" element={<BLSScenarioHub />} />}
        {IS_BLS && <Route path="/bls/scenario/:stageId" element={<BLSScenario />} />}
        {IS_BLS && <Route path="/bls/algorithm" element={<BLSAlgorithm />} />}
        {IS_BLS && <Route path="/bls/aed" element={<BLSAedGuide />} />}
        {IS_BLS && <Route path="/bls/choking" element={<BLSChokingRelief />} />}
        {IS_BLS && <Route path="/bls/knowledge" element={<BLSKnowledge />} />}

        {/* unknown paths (including the other course mode's routes) go home
            instead of rendering an empty page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
      {/* "เว็บในเครือเรา" footer — sibling morroo.com sites, like morroo.com */}
      {!isRecording && !isAdmin && !isStudying && !isRecorderGamePlay && <SiteFooter />}
      {/* Bottom pill bar on all pages except recording + admin + recorder-game play */}
      {!isRecording && !isAdmin && !isRecorderGamePlay && <BottomTabBar />}
      {!isRecording && !isAdmin && !isStudying && !isRecorderGamePlay && !isPractice && <LineFloatButton />}
      <Analytics />
      <MetaPixel />
    </div>
  );
}

export default App;
