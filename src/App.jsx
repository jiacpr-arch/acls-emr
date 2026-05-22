import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { IS_BLS, IS_ACLS, courseMeta } from './config/courseMode';
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
import BLSSkillPractice from './pages/BLSSkillPractice';
import BottomTabBar from './components/BottomTabBar';
import OfflineIndicator from './components/OfflineIndicator';

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

  // Recording page has its own nav (QuickBar + FloatingStatus)
  const isRecording = location.pathname === '/recording';

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

        {/* pre-course flow — ทั้งสอง mode ใช้ (lesson content เปลี่ยนตาม mode ผ่าน activeLessons shim) */}
        <Route path="/pre-course" element={<PreCourse />} />
        <Route path="/pre-course/cohort" element={<InstructorCohort />} />
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
        {IS_ACLS && <Route path="/sim" element={<CodeBlueSim />} />}

        {IS_BLS && <Route path="/" element={<PreCourse />} />}
        {IS_BLS && <Route path="/skill-practice" element={<BLSSkillPractice />} />}
      </Routes>
      {/* Bottom pill bar on all pages except recording */}
      {!isRecording && <BottomTabBar />}
    </div>
  );
}

export default App;
