import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewCase from './pages/NewCase';
import Recording from './pages/Recording';
import Algorithm from './pages/Algorithm';
import Settings from './pages/Settings';
import ScenarioSelect from './pages/ScenarioSelect';
import DrugCalc from './pages/DrugCalc';
import Statistics from './pages/Statistics';
import DrillTimer from './pages/DrillTimer';

function App() {
  const theme = useSettingsStore(s => s.theme);
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Routes>
        {/* Home = New Case (start immediately) */}
        <Route path="/" element={<NewCase />} />
        {/* Recording = ACLS step-by-step (no navbar) */}
        <Route path="/recording" element={<Recording />} />
        {/* Other pages have navbar */}
        <Route path="/history" element={<><Navbar /><Dashboard /></>} />
        <Route path="/algorithm" element={<><Navbar /><Algorithm /></>} />
        <Route path="/settings" element={<><Navbar /><Settings /></>} />
        <Route path="/scenarios" element={<><Navbar /><ScenarioSelect /></>} />
        <Route path="/drug-calc" element={<><Navbar /><DrugCalc /></>} />
        <Route path="/statistics" element={<><Navbar /><Statistics /></>} />
        <Route path="/drill" element={<><Navbar /><DrillTimer /></>} />
      </Routes>
    </div>
  );
}

export default App;
