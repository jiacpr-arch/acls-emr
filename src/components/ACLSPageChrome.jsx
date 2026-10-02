import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft } from 'lucide-react';

// A compact shared masthead for ACLS tools, learning and admin pages.
// Fullscreen clinical/simulation screens keep their dedicated controls.
export default function ACLSPageChrome() {
  return (
    <header className="acls-page-chrome">
      <div>
        <Link to="/" className="acls-page-brand"><HeartPulse size={21} /><strong>ACLS <span>by MorRoo</span></strong></Link>
        <Link to="/" className="acls-page-home"><ArrowLeft size={15} /> หน้าแรก</Link>
      </div>
    </header>
  );
}
