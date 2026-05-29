import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { IS_BLS, courseMeta } from '../config/courseMode';
import ACLSSplash from '../components/newcase/ACLSSplash';
import ACLSHero from '../components/newcase/ACLSHero';
import ACLSQuickActions from '../components/newcase/ACLSQuickActions';
import MorrooAdCard from '../components/MorrooAdCard';
import NewsCard from '../components/NewsCard';
import StreakBadge from '../components/StreakBadge';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import {
  HeartPulse, AlertTriangle, Hospital,
  BookOpen, MessageSquare, Play, GraduationCap,
} from '../components/ui/Icon';

// Module-level flag — splash shows once per full page load, not on every
// in-app navigation back to /. Resets when the user reloads the tab.
let aclsSplashSeen = false;

export default function NewCase() {
  const navigate = useNavigate();
  const { createCase, restoreSession } = useCaseStore();
  const mode = useSettingsStore(s => s.mode);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [showSplash, setShowSplash] = useState(!IS_BLS && !aclsSplashSeen);

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

  // ===== BLS still uses the legacy centered layout =====
  if (IS_BLS) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col bg-bg-primary"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 pb-28">
          <div className="text-center mb-8 animate-fade-in">
            <div
              className="w-20 h-20 mx-auto mb-5 inline-flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow:
                  '0 12px 28px rgba(14, 165, 233, 0.32), 0 4px 12px rgba(14, 165, 233, 0.18)',
              }}
            >
              <HeartPulse size={38} strokeWidth={2.4} className="text-white" />
            </div>
            <h1 className="text-display text-text-primary">BLS Practice</h1>
            <p className="text-caption text-text-muted mt-1.5 tracking-wide">{courseMeta.titleTh}</p>
            <p className="text-text-muted text-[10px] font-mono mt-1 opacity-60">v2.0.0</p>
            <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 text-[11px] font-bold ${
              isClinical ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
            }`}
            style={{ borderRadius: 'var(--radius-full)' }}>
              <span className={`w-1.5 h-1.5 ${isClinical ? 'bg-danger animate-pulse' : 'bg-info'}`}
                style={{ borderRadius: 99 }} />
              {isClinical ? 'CLINICAL' : 'TRAINING'}
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-6 animate-slide-up">
            <button onClick={() => handleStart('bls')} disabled={loading}
              className="btn btn-info btn-xl btn-block disabled:opacity-50">
              <AlertTriangle size={20} strokeWidth={2.4} /> BLS — First Responder
            </button>
            <button onClick={() => navigate('/skill-practice')}
              className="btn btn-ghost btn-lg btn-block">
              <HeartPulse size={18} strokeWidth={2} /> ฝึก CPR Metronome
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/guide')}
                className="btn btn-ghost btn-lg btn-block">
                <BookOpen size={18} strokeWidth={2} /> คู่มือ
              </button>
              <button onClick={() => navigate('/feedback')}
                className="btn btn-ghost btn-lg btn-block">
                <MessageSquare size={18} strokeWidth={2} /> Feedback
              </button>
            </div>
            <MorrooAdCard />
          </div>
        </div>
      </div>
    );
  }

  // ===== ACLS — new "wow" landing =====
  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {showSplash && (
        <ACLSSplash
          onDismiss={() => { aclsSplashSeen = true; setShowSplash(false); }}
        />
      )}

      <div
        className="page-container pb-28 flex flex-col gap-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <ACLSHero isClinical={isClinical} />

        <StreakBadge />

        {/* Resume active session — keeps the warning border accent */}
        {activeSession && (
          <div className="dash-card border-l-4 border-l-warning animate-slide-up"
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
        )}

        {/* Primary emergency actions — full-width red + blue stacked */}
        <div className="flex flex-col gap-4">
          <button onClick={() => handleStart('bls')} disabled={loading}
            className="btn btn-danger btn-xl btn-block animate-pulse-red disabled:opacity-50"
            style={{ height: 'auto', paddingTop: 20, paddingBottom: 20, fontSize: 19 }}>
            <AlertTriangle size={24} strokeWidth={2.4} /> BLS — First Responder
          </button>

          <button onClick={() => handleStart('rrt')} disabled={loading}
            className="btn btn-primary btn-xl btn-block disabled:opacity-50"
            style={{ height: 'auto', paddingTop: 18, paddingBottom: 18 }}>
            <Hospital size={24} strokeWidth={2.4} />
            <span className="flex flex-col items-center leading-tight">
              <span style={{ fontSize: 19 }}>CODE BLUE / CODE 8</span>
              <span className="text-[13px] font-medium opacity-80 mt-1">MET / RRT Team</span>
            </span>
          </button>
        </div>

        {/* Quick-start templates — gradient tile grid */}
        <div className="space-y-4">
          <div className="text-overline text-text-muted px-1">เริ่มเร็วตาม pathway</div>
          <ACLSQuickActions onStart={handleStart} disabled={loading} />
        </div>

        <button onClick={() => navigate('/learn')}
          className="btn btn-block text-white"
          style={{
            height: 'auto',
            paddingTop: 18,
            paddingBottom: 18,
            fontSize: 16,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.28)',
          }}>
          <GraduationCap size={20} strokeWidth={2.4} />
          <span className="flex flex-col items-center leading-tight">
            <span>โหมดเรียน</span>
            <span className="text-[12px] font-medium opacity-85 mt-0.5">
              บทเรียน · scenarios · ใบประกาศ
            </span>
          </span>
        </button>

        <button onClick={() => navigate('/qa-acls-deep')}
          className="btn btn-block text-white"
          style={{
            height: 'auto',
            paddingTop: 18,
            paddingBottom: 18,
            fontSize: 16,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
          }}>
          <BookOpen size={20} strokeWidth={2.4} />
          <span className="flex flex-col items-center leading-tight">
            <span>Q&A ACLS เชิงลึก</span>
            <span className="text-[12px] font-medium opacity-85 mt-0.5">
              13 หมวด พร้อม infographic
            </span>
          </span>
        </button>

        <div className="grid grid-cols-2 gap-6 pt-2">
          <button onClick={() => navigate('/guide')}
            className="btn btn-ghost btn-block"
            style={{ height: 'auto', paddingTop: 16, paddingBottom: 16, borderRadius: 'var(--radius-lg)' }}>
            <BookOpen size={18} strokeWidth={2} /> คู่มือ
          </button>
          <button onClick={() => navigate('/feedback')}
            className="btn btn-ghost btn-block"
            style={{ height: 'auto', paddingTop: 16, paddingBottom: 16, borderRadius: 'var(--radius-lg)' }}>
            <MessageSquare size={18} strokeWidth={2} /> Feedback
          </button>
        </div>

        <NewsCard />

        <JiacprCourseBanner />

        <MorrooAdCard />

        <div className="text-center text-text-muted text-[10px] font-mono opacity-60 pt-1">
          v2.0.0 · ACLS EMR
        </div>
      </div>
    </div>
  );
}
