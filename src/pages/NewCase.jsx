import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';

export default function NewCase() {
  const navigate = useNavigate();
  const { createCase } = useCaseStore();
  const mode = useSettingsStore(s => s.mode);
  const [loading, setLoading] = useState(false);

  const handleStart = async (startMode) => {
    if (loading) return;
    setLoading(true);
    await createCase(mode);
    navigate(`/recording?start=${startMode}`);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary">

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🫀</div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">ACLS EMR</h1>
          <p className="text-text-muted text-sm mt-1.5">Advanced Cardiac Life Support Recording</p>
          <span className={`badge mt-3 text-[11px] ${
            mode === 'clinical' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
          }`}>
            {mode === 'clinical' ? '🏥 CLINICAL' : '📚 TRAINING'}
          </span>
        </div>

        {/* Start buttons */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={() => handleStart('bls')}
            disabled={loading}
            className="w-full py-6 btn-action btn-danger text-lg animate-pulse-red disabled:opacity-50"
          >
            🚨 BLS — First Responder
            <div className="text-[11px] font-medium opacity-90 mt-1">
              Scene Safety → Response → Pulse → CPR
            </div>
          </button>

          <button
            onClick={() => handleStart('rrt')}
            disabled={loading}
            className="w-full py-6 btn-action btn-info text-lg disabled:opacity-50"
          >
            🏥 RRT / MET Team
            <div className="text-[11px] font-medium opacity-90 mt-1">
              Team arrived → Pulse Check → Assess
            </div>
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="shrink-0 pb-[env(safe-area-inset-bottom)] bg-white border-t border-bg-tertiary">
        <div className="flex justify-around py-2.5 max-w-sm mx-auto">
          <NavItem icon="📋" label="History" onClick={() => navigate('/history')} />
          <NavItem icon="📖" label="Algorithms" onClick={() => navigate('/algorithm')} />
          <NavItem icon="⚙️" label="Settings" onClick={() => navigate('/settings')} />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl text-text-muted hover:text-info transition-colors min-w-[72px]"
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
