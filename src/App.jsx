import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useSettingsStore } from './stores/settingsStore';
import { IS_BLS, IS_ACLS, courseMeta } from './config/courseMode';
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
import PreCourse from './pages/PreCourse';
import Learn from './pages/Learn';
import LessonReader from './pages/LessonReader';
import QuizResults from './pages/QuizResults';
import InstructorCohort from './pages/InstructorCohort';
import PostTestExam from './pages/PostTestExam';
import PreTestExam from './pages/PreTestExam';
import BLSSkillPractice from './pages/BLSSkillPractice';
import BLSAlgorithm from './pages/BLSAlgorithm';
import BLSAedGuide from './pages/BLSAedGuide';
import BLSChokingRelief from './pages/BLSChokingRelief';
import NewsPage from './pages/NewsPage';
import RequireAdmin from './components/RequireAdmin';
import BottomTabBar from './components/BottomTabBar';
import OfflineIndicator from './components/OfflineIndicator';
import MetaPixel from './components/MetaPixel';
import { useSyncEngine } from './services/syncEngine';

// Admin pages are code-split — keep the main bundle below the workbox precache limit
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminChapters = lazy(() => import('./pages/AdminChapters'));
const AdminQADeep = lazy(() => import('./pages/AdminQADeep'));
const AdminQADeepPosted = lazy(() => import('./pages/AdminQADeepPosted'));
const AdminStudentQuestions = lazy(() => import('./pages/AdminStudentQuestions'));

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
  useSyncEngine();

  // Recording page has its own nav (QuickBar + FloatingStatus)
  // Admin pages also hide the bottom tab bar
  const isRecording = location.pathname === '/recording';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <OfflineIndicator />
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
        {IS_ACLS && <Route path="/sim" element={<CodeBlueSim />} />}
        {IS_ACLS && (
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLogin />
              </Suspense>
            }
          />
        )}
        {IS_ACLS && (
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
        )}
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

        {IS_BLS && <Route path="/" element={<PreCourse />} />}
        {IS_BLS && <Route path="/new-case" element={<NewCase />} />}
        {IS_BLS && <Route path="/recording" element={<Recording />} />}
        {IS_BLS && <Route path="/history" element={<Dashboard />} />}
        {IS_BLS && <Route path="/skill-practice" element={<BLSSkillPractice />} />}
        {IS_BLS && <Route path="/bls/algorithm" element={<BLSAlgorithm />} />}
        {IS_BLS && <Route path="/bls/aed" element={<BLSAedGuide />} />}
        {IS_BLS && <Route path="/bls/choking" element={<BLSChokingRelief />} />}
      </Routes>
      {/* Bottom pill bar on all pages except recording + admin */}
      {!isRecording && !isAdmin && <BottomTabBar />}
      <Analytics />
      <MetaPixel />
    </div>
  );
}

export default App;
