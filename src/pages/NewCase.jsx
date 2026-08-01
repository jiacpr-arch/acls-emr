import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
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
  Gamepad2, HelpCircle, ChevronRight,
} from '../components/ui/Icon';
import PageHero from '../components/PageHero';

// Module-level flag — splash shows once per full page load, not on every
// in-app navigation back to /. Resets when the user reloads the tab.
let aclsSplashSeen = false;

export default function NewCase() {
  const navigate = useNavigate();
  const createCase = useCaseStore(s => s.createCase);
  const restoreSession = useCaseStore(s => s.restoreSession);
  const mode = useSettingsStore(s => s.mode);
  const lang = useSettingsStore(s => s.language) || 'en';
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

  // ===== BLS "ฝึก code" tab =====
  if (IS_BLS) {
    return (
      <div className="page-container flex flex-col gap-4 pb-24">
        <PageHero
          title="BLS Practice"
          desc={courseMeta.titleTh}
          meta={
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                isClinical ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
              }`}
              style={{ borderRadius: 99 }}
            >
              <span className={`w-1.5 h-1.5 ${isClinical ? 'bg-danger animate-pulse' : 'bg-info'}`}
                style={{ borderRadius: 99 }} />
              {isClinical ? 'Clinical' : 'Training'}
            </span>
          }
        />

        <button onClick={() => handleStart('bls')} disabled={loading}
          className="btn btn-info btn-xl btn-block disabled:opacity-50">
          <AlertTriangle size={20} strokeWidth={2.4} /> BLS — First Responder
        </button>

        <button onClick={() => navigate('/skill-practice')}
          className="card card-hover w-full flex items-center gap-3.5"
          style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <div className="flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, borderRadius: 12, background: '#DC262615', color: 'var(--color-danger)' }}>
            <HeartPulse size={22} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-headline text-text-primary">ฝึก CPR Metronome</div>
            <div className="text-caption text-text-muted">จังหวะกดหน้าอกให้ตรงมาตรฐาน</div>
          </div>
          <ChevronRight size={18} className="text-text-muted shrink-0" />
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
        className="page-container pb-28 flex flex-col gap-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <ACLSHero isClinical={isClinical} />

        {/* Emergency action — the one red accent card (firstaid 1669-card style) */}
        <button onClick={() => handleStart('rrt')} disabled={loading}
          className="card card-hover w-full flex items-center gap-3 disabled:opacity-50"
          style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', textAlign: 'left', justifyContent: 'flex-start' }}>
          <div className="flex items-center justify-center text-white shrink-0"
            style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-danger)' }}>
            <Hospital size={22} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-headline" style={{ color: '#991B1B' }}>CODE BLUE / CODE 8</div>
            <div className="text-caption" style={{ color: '#7F1D1D' }}>MET / RRT Team · เริ่มบันทึกเหตุการณ์ทันที</div>
          </div>
          <ChevronRight size={18} style={{ color: '#991B1B' }} className="shrink-0" />
        </button>

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

        {/* Main menu — firstaid QuickMenu-style rows (red reserved for the sim) */}
        <div className="grid gap-2.5">
          {[
            { icon: Gamepad2, color: '#DC2626', label: t('code_sim', lang), desc: t('code_sim_desc', lang), to: '/sim' },
            { icon: GraduationCap, color: '#2563EB', label: 'โหมดเรียน', desc: 'บทเรียน · scenarios · ใบประกาศนียบัตร', to: '/learn' },
            { icon: Play, color: '#2563EB', label: 'วิดีโอบทเรียน', desc: 'คลิปสอนเชิงลึกทุกหัวข้อ', to: '/video-lessons' },
            { icon: HelpCircle, color: '#2563EB', label: 'Q&A ACLS เชิงลึก', desc: '13 หมวด พร้อม infographic', to: '/qa-acls-deep' },
          ].map(({ icon: RowIcon, color, label, desc, to }) => (
            <button key={to} onClick={() => navigate(to)}
              className="card card-hover w-full flex items-center gap-3.5"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
              <div className="flex items-center justify-center shrink-0"
                style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, color }}>
                <RowIcon size={22} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-headline text-text-primary">{label}</div>
                <div className="text-caption text-text-muted">{desc}</div>
              </div>
              <ChevronRight size={18} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>

        {/* Quick-start templates */}
        <div className="space-y-3">
          <div className="text-overline text-text-muted px-1">เริ่มเร็วตาม pathway</div>
          <ACLSQuickActions onStart={handleStart} disabled={loading} />
        </div>

        <NewsCard />

        <div className="grid grid-cols-2 gap-3 pt-1">
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

        <JiacprCourseBanner />

        <MorrooAdCard />

        <div className="text-center text-text-muted text-3xs font-mono opacity-60 pt-1">
          v2.0.0 · ACLS EMR
        </div>
      </div>
    </div>
  );
}
