import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import BottomTabBar from '../components/BottomTabBar';

export default function NewCase() {
  const navigate = useNavigate();
  const { createCase, restoreSession } = useCaseStore();
  const mode = useSettingsStore(s => s.mode);
  const lang = useSettingsStore(s => s.language) || 'en';
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
            className="btn btn-danger btn-xl btn-block animate-pulse-red disabled:opacity-50">
            🚨 BLS — First Responder
          </button>

          <button onClick={() => handleStart('rrt')} disabled={loading}
            className="btn btn-primary btn-xl btn-block disabled:opacity-50">
            🏥 RRT / MET Team
          </button>

          {/* Quick Start Templates */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🫀', label: 'Cardiac Arrest', start: 'bls' },
              { icon: '🐢', label: 'Bradycardia', start: 'rrt' },
              { icon: '🐇', label: 'Tachycardia', start: 'rrt' },
              { icon: '🧠', label: 'Stroke', start: 'rrt' },
            ].map(t => (
              <button key={t.label} onClick={() => handleStart(t.start)} disabled={loading}
                className="btn btn-ghost btn-lg btn-block disabled:opacity-50">
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Training scenarios */}
          <button onClick={() => navigate('/scenarios')}
            className="btn btn-purple btn-lg btn-block">
            🎮 Training Scenarios
          </button>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={() => navigate('/guide')}
              className="btn btn-ghost btn-lg btn-block">
              📗 คู่มือใช้งาน
            </button>
            <button onClick={() => navigate('/feedback')}
              className="btn btn-ghost btn-lg btn-block">
              💬 ส่ง Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}

