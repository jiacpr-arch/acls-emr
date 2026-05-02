import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import BottomTabBar from '../components/BottomTabBar';
import {
  HeartPulse, AlertTriangle, Hospital, TrendingDown, TrendingUp, Brain,
  Sparkles, BookOpen, MessageSquare, Play, Activity,
} from '../components/ui/Icon';

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

  const isClinical = mode === 'clinical';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Logo / hero */}
        <div className="text-center mb-8 animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-5 inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 12px 28px rgba(220, 38, 38, 0.32), 0 4px 12px rgba(220, 38, 38, 0.18)',
            }}
          >
            <HeartPulse size={38} strokeWidth={2.4} className="text-white" />
          </div>
          <h1 className="text-display text-text-primary">ACLS EMR</h1>
          <p className="text-caption text-text-muted mt-1.5 tracking-wide">Advanced Cardiac Life Support Recording</p>
          <p className="text-text-muted text-[10px] font-mono mt-1 opacity-60">v2.0.0</p>
          <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 text-[11px] font-bold ${
            isClinical ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
          }`}
          style={{ borderRadius: 'var(--radius-full)' }}>
            <span className={`w-1.5 h-1.5 ${isClinical ? 'bg-danger' : 'bg-info'} ${isClinical ? 'animate-pulse' : ''}`}
              style={{ borderRadius: 99 }} />
            {isClinical ? 'CLINICAL' : 'TRAINING'}
          </div>
        </div>

        {/* Resume active session */}
        {activeSession && (
          <div className="w-full max-w-sm mb-5 animate-slide-up">
            <div className="dash-card border-l-4 border-l-warning"
              style={{ boxShadow: 'var(--shadow-2)' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 inline-flex items-center justify-center bg-warning/15 text-warning shrink-0"
                  style={{ borderRadius: 'var(--radius)' }}>
                  <Play size={18} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-overline text-warning">Active Case Found</div>
                  <div className="text-headline text-text-primary truncate mt-0.5">#{activeSession.currentCase?.id}</div>
                  <div className="text-caption text-text-muted">
                    {activeSession.patient?.name || 'No patient info'} · {activeSession.events?.length || 0} events
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleResume} className="flex-1 btn btn-warning">
                  <Play size={16} strokeWidth={2.4} /> Resume Case
                </button>
                <button onClick={handleDismissSession} className="btn btn-ghost">
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start buttons */}
        <div className="w-full max-w-sm space-y-3 animate-slide-up">
          <button onClick={() => handleStart('bls')} disabled={loading}
            className="btn btn-danger btn-xl btn-block animate-pulse-red disabled:opacity-50">
            <AlertTriangle size={20} strokeWidth={2.4} /> BLS — First Responder
          </button>

          <button onClick={() => handleStart('rrt')} disabled={loading}
            className="btn btn-primary btn-xl btn-block disabled:opacity-50">
            <Hospital size={20} strokeWidth={2.4} /> RRT / MET Team
          </button>

          {/* Quick Start Templates */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { Icon: HeartPulse, label: 'Cardiac Arrest', start: 'bls' },
              { Icon: TrendingDown, label: 'Bradycardia', start: 'rrt' },
              { Icon: TrendingUp, label: 'Tachycardia', start: 'rrt' },
              { Icon: Brain, label: 'Stroke', start: 'rrt' },
            ].map(item => {
              const ItemIcon = item.Icon;
              return (
                <button key={item.label} onClick={() => handleStart(item.start)} disabled={loading}
                  className="btn btn-ghost btn-lg btn-block disabled:opacity-50">
                  <ItemIcon size={18} strokeWidth={2} /> {item.label}
                </button>
              );
            })}
          </div>

          {/* Training scenarios */}
          <button onClick={() => navigate('/scenarios')}
            className="btn btn-purple btn-lg btn-block">
            <Sparkles size={18} strokeWidth={2.4} /> Training Scenarios
          </button>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => navigate('/guide')}
              className="btn btn-ghost btn-lg btn-block">
              <BookOpen size={18} strokeWidth={2} /> คู่มือ
            </button>
            <button onClick={() => navigate('/feedback')}
              className="btn btn-ghost btn-lg btn-block">
              <MessageSquare size={18} strokeWidth={2} /> Feedback
            </button>
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
