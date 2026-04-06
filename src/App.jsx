import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewCase from './pages/NewCase';
import Recording from './pages/Recording';
import Algorithm from './pages/Algorithm';
import Settings from './pages/Settings';

function App() {
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
      </Routes>
    </div>
  );
}

export default App;
