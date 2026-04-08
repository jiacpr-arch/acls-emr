import { useEffect } from 'react';
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
import BottomTabBar from './components/BottomTabBar';
import { FeedbackButton } from './components/FeedbackButton';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  const theme = useSettingsStore(s => s.theme);
  const location = useLocation();
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Recording page has its own nav (QuickBar + FloatingStatus)
  const isRecording = location.pathname === '/recording';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <OfflineIndicator />
      <FeedbackButton />
      <Routes>
        <Route path="/" element={<NewCase />} />
        <Route path="/recording" element={<Recording />} />
        <Route path="/history" element={<Dashboard />} />
        <Route path="/algorithm" element={<Algorithm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/scenarios" element={<ScenarioSelect />} />
        <Route path="/drug-calc" element={<DrugCalc />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/drill" element={<DrillTimer />} />
        <Route path="/compare" element={<CaseCompare />} />
        <Route path="/certification" element={<Certification />} />
      </Routes>
      {/* Bottom pill bar on all pages except recording */}
      {!isRecording && <BottomTabBar />}
    </div>
  );
}

export default App;
