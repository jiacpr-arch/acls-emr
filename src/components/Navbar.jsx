import { Link, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { useCaseStore } from '../stores/caseStore';

export default function Navbar() {
  const location = useLocation();
  const mode = useSettingsStore(s => s.mode);
  const currentCase = useCaseStore(s => s.currentCase);

  const links = [
    { to: '/', label: 'New Case', icon: '🚨' },
    { to: '/history', label: 'History', icon: '📋' },
    { to: '/algorithm', label: 'Algorithm', icon: '📖' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-bg-secondary border-b border-bg-tertiary px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-danger font-bold text-xl">🫀</span>
        <span className="font-bold text-lg text-text-primary">ACLS EMR</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          mode === 'clinical' ? 'bg-danger/20 text-danger' : 'bg-info/20 text-info'
        }`}>
          {mode === 'clinical' ? 'CLINICAL' : 'TRAINING'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {currentCase && currentCase.outcome === 'ongoing' && (
          <Link to="/recording"
            className="flex items-center gap-1 px-3 py-1.5 bg-danger text-white rounded-lg text-sm font-semibold animate-pulse-red mr-2">
            <span className="w-2 h-2 bg-white rounded-full" />
            ACTIVE
          </Link>
        )}

        {links.map(link => (
          <Link key={link.to} to={link.to}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              location.pathname === link.to
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
            }`}>
            <span>{link.icon}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
