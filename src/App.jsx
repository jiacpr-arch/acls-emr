import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
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
import CodeBlueSim from './pages/CodeBlueSim';
import PreCourse from './pages/PreCourse';
import Learn from './pages/Learn';
import LessonReader from './pages/LessonReader';
import QuizResults from './pages/QuizResults';
import InstructorCohort from './pages/InstructorCohort';
import PostTestExam from './pages/PostTestExam';
import PreTestExam from './pages/PreTestExam';
import RequireAdmin from './components/RequireAdmin';
import BottomTabBar from './components/BottomTabBar';
import OfflineIndicator from './components/OfflineIndicator';

// Admin pages are code-split — keep the main bundle below the workbox precache limit
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminChapters = lazy(() => import('./pages/AdminChapters'));

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

  // Recording page has its own nav (QuickBar + FloatingStatus)
  // Admin pages also hide the bottom tab bar
  const isRecording = location.pathname === '/recording';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <OfflineIndicator />
      <Routes>
        <Route path="/" element={<NewCase />} />
        <Route path="/recording" element={<Recording />} />
        <Route path="/history" element={<Dashboard />} />
        <Route path="/algorithm" element={<Algorithm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/scenarios" element={<ScenarioSelect />} />
        <Route path="/drug-calc" element={<DrugCalc />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/drill" element={<DrillTimer />} />
        <Route path="/compare" element={<CaseCompare />} />
        <Route path="/certification" element={<Certification />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/als" element={<ALSKnowledge />} />
        <Route path="/sim" element={<CodeBlueSim />} />
        <Route path="/pre-course" element={<PreCourse />} />
        <Route path="/pre-course/cohort" element={<InstructorCohort />} />
        <Route path="/pre-course/pre-test" element={<PreTestExam />} />
        <Route path="/pre-course/post-test" element={<PostTestExam />} />
        <Route path="/pre-course/results/:attemptId" element={<QuizResults />} />
        <Route path="/pre-course/:lessonId" element={<LessonReader />} />
        <Route path="/pre-course/:lessonId/quiz" element={<LessonReader />} />
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
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
      </Routes>
      {/* Bottom pill bar on all pages except recording + admin */}
      {!isRecording && !isAdmin && <BottomTabBar />}
    </div>
  );
}

export default App;
