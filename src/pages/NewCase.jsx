import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';

export default function NewCase() {
  const navigate = useNavigate();
  const { createCase, restoreSession } = useCaseStore();
  const mode = useSettingsStore(s => s.mode);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const session = getActiveSession();
    if (session) setActiveSession(session);
  }, []);

  const handleStart = async (startMode) => {
    if (loading) return;
    setLoading(true);
    clearActiveSession();
    await createCase(mode);
    navigate(`/recording?start=${startMode}`);
  };

  const handleResume = () => {
    if (activeSession) {
      restoreSession(activeSession);
      navigate('/recording?start=resume');
    }
  };

  const handleDismissSession = () => {
    clearActiveSession();
    setActiveSession(null);
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
          <p className="text-text-muted text-[9px] font-mono mt-0.5">v2.0.0</p>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-bold ${
            mode === 'clinical' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
          }`}>
            <span className={`w-2 h-2 rounded-full ${mode === 'clinical' ? 'bg-danger' : 'bg-info'}`} />
            {mode === 'clinical' ? 'CLINICAL' : 'TRAINING'}
          </div>
        </div>

        {/* Resume active session */}
        {activeSession && (
          <div className="w-full max-w-sm mb-4">
            <div className="glass-card !p-4 border-2 border-warning/50">
              <div className="text-xs text-warning font-bold uppercase mb-1">Active Case Found</div>
              <div className="text-sm text-text-primary font-semibold">#{activeSession.currentCase?.id}</div>
              <div className="text-xs text-text-muted mt-0.5">
                {activeSession.patient?.name || 'No patient info'} · {activeSession.events?.length || 0} events
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleResume} className="flex-1 btn-action btn-warning py-2.5 text-xs font-bold">
                  ▶️ Resume Case
                </button>
                <button onClick={handleDismissSession} className="btn-action btn-ghost py-2.5 text-xs px-4">
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

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

          {/* Quick Start Templates */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🫀', label: 'Cardiac Arrest', sub: 'VF / Asystole', start: 'bls' },
              { icon: '🐢', label: 'Bradycardia', sub: 'HR < 50', start: 'rrt' },
              { icon: '🐇', label: 'Tachycardia', sub: 'HR > 150', start: 'rrt' },
              { icon: '🧠', label: 'Stroke', sub: 'FAST track', start: 'rrt' },
            ].map(t => (
              <button key={t.label} onClick={() => handleStart(t.start)} disabled={loading}
                className="btn-action btn-ghost py-3 text-xs disabled:opacity-50">
                <div className="text-lg">{t.icon}</div>
                {t.label}
                <div className="text-[8px] text-text-muted mt-0.5">{t.sub}</div>
              </button>
            ))}
          </div>

          {/* Training scenarios */}
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
          <NavItem icon="💊" label="Drug Calc" onClick={() => navigate('/drug-calc')} />
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
