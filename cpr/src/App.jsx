import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Learn from './pages/Learn';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/learn" element={<Learn />} />
    </Routes>
  );
}
