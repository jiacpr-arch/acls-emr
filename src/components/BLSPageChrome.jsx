import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft } from 'lucide-react';

export default function BLSPageChrome() {
  return (
    <header className="bls-page-chrome">
      <div>
        <Link to="/" className="bls-page-brand"><HeartPulse size={23} /><strong>BLS <span>by MorRoo</span></strong></Link>
        <Link to="/" className="bls-page-home"><ArrowLeft size={16} /> หน้าแรก</Link>
      </div>
    </header>
  );
}
