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
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-danger rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">🫀</span>
          </div>
          <h1 className="text-[1.75rem] font-black text-text-primary tracking-tight leading-tight">ACLS EMR</h1>
          <p className="text-text-muted text-xs mt-1 tracking-wide">Advanced Cardiac Life Support Recording</p>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-bold ${
            mode === 'clinical' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
          }`}>
            <span className={`w-2 h-2 rounded-full ${mode === 'clinical' ? 'bg-danger' : 'bg-info'}`} />
            {mode === 'clinical' ? 'CLINICAL' : 'TRAINING'}
          </div>
        </div>

        {/* Start buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => handleStart('bls')} disabled={loading}
            className="w-full py-5 btn-action btn-danger text-base animate-pulse-red disabled:opacity-50">
            <div className="text-xl mb-0.5">🚨</div>
            BLS — First Responder
            <div className="text-[10px] font-medium opacity-80 mt-0.5">
              Scene Safety → Response → Pulse → CPR
            </div>
          </button>

          <button onClick={() => handleStart('rrt')} disabled={loading}
            className="w-full py-5 btn-action btn-info text-base disabled:opacity-50">
            <div className="text-xl mb-0.5">🏥</div>
            RRT / MET Team
            <div className="text-[10px] font-medium opacity-80 mt-0.5">
              Team Arrived → Pulse Check → Assess
            </div>
          </button>

          {/* Training scenarios — always visible */}
          <button onClick={() => navigate('/scenarios')}
            className="w-full py-4 btn-action btn-purple text-base">
            <div className="text-xl mb-0.5">🎮</div>
            Training Scenarios
            <div className="text-[10px] font-medium opacity-80 mt-0.5">
              Basic · Intermediate · Megacode
            </div>
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="shrink-0 pb-[env(safe-area-inset-bottom)] bg-white border-t border-bg-tertiary/60">
        <div className="flex justify-around py-2 max-w-md mx-auto">
          <NavItem icon="📋" label="History" onClick={() => navigate('/history')} />
          <NavItem icon="🎮" label="Scenarios" onClick={() => navigate('/scenarios')} />
          <NavItem icon="📖" label="Algorithms" onClick={() => navigate('/algorithm')} />
          <NavItem icon="⚙️" label="Settings" onClick={() => navigate('/settings')} />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-text-muted hover:text-info active:bg-bg-tertiary/30 transition-colors min-w-[64px] min-h-[44px]">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[9px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}
