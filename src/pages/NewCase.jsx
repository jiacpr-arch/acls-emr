import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS } from '../config/courseMode';
import CourseSplash from '../components/newcase/CourseSplash';
import CourseHero from '../components/newcase/CourseHero';
import ACLSLandingHero from '../components/newcase/ACLSLandingHero';
import './aclsHome.css';
import ACLSQuickActions from '../components/newcase/ACLSQuickActions';
import BLSHomeQuickActions from '../components/newcase/BLSHomeQuickActions';
import MorrooAdCard from '../components/MorrooAdCard';
import NewsCard from '../components/NewsCard';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import {
  AlertTriangle, Hospital,
  BookOpen, MessageSquare, Play, GraduationCap,
  Gamepad2, HelpCircle,
} from '../components/ui/Icon';
import GameHighlightCard from '../components/GameHighlightCard';
import { EmergencyCTA, LearnPathCard, MenuList } from '../components/newcase/HomeBlocks';
import { useLearnPath } from '../hooks/useLearnPath';

// Module-level flag — splash shows once per full page load, not on every
// in-app navigation back to /. Resets when the user reloads the tab.
// Shared by both ACLS and BLS builds (each build only ever renders one branch).
let homeSplashSeen = false;

export default function NewCase() {
  const navigate = useNavigate();
  const createCase = useCaseStore(s => s.createCase);
  const restoreSession = useCaseStore(s => s.restoreSession);
  const mode = useSettingsStore(s => s.mode);
  const lang = useSettingsStore(s => s.language) || 'en';
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(() => getActiveSession());
  const [showSplash, setShowSplash] = useState(!homeSplashSeen);
  // เส้นทางเรียนของนักเรียน (logic เดียวกับหน้า Learn) — ใช้กับการ์ด "เรียนต่อ"
  const learnPath = useLearnPath();

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

  // ===== BLS — home ลอกโครง ACLS (Phase B) สีเปลี่ยนเป็นฟ้า Sky ผ่าน accent token =====
  if (IS_BLS) {
    return (
      <div className="min-h-[100dvh] bg-bg-primary">
        {showSplash && (
          <CourseSplash
            onDismiss={() => { homeSplashSeen = true; setShowSplash(false); }}
            palette={{ from: '#7DD3FC', mid: '#0EA5E9', to: '#0C4A6E' }}
            eyebrow="Basic Life Support"
            wordmark="BLS"
            tagline="CPR + AED สำหรับบุคลากรทางการแพทย์"
            badge="ILCOR 2025"
          />
        )}

        <div
          className="page-container pb-28 flex flex-col gap-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <CourseHero
            isClinical={isClinical}
            eyebrow="Basic Life Support"
            title="BLS Rescue"
            meta="ILCOR 2025 · CPR + AED Recording"
          />

          <EmergencyCTA
            Icon={AlertTriangle}
            title="พบคนหมดสติ — เริ่มบันทึกทันที"
            desc="BLS First Responder · CPR + AED"
            hint="แตะแล้วนาฬิกาเริ่มนับทันที"
            onClick={() => handleStart('bls')}
            disabled={loading}
          />

          {/* การ์ดนำทางนักเรียน — โครง/ตรรกะเดียวกับ ACLS (useLearnPath) */}
          {learnPath.next ? (
          <LearnPathCard
            done={learnPath.done}
            total={learnPath.total}
            title={`เรียนต่อ — ขั้นที่ ${learnPath.next.index}: ${learnPath.next.label}`}
            cta={`ไปที่ ${learnPath.next.label}`}
            onClick={() => navigate(learnPath.next.path)}
          />
        ) : learnPath.activeStudent && learnPath.total > 0 ? (
          <LearnPathCard
            done={learnPath.total}
            total={learnPath.total}
            title="เรียนครบทุกขั้นแล้ว"
            desc="ใบประกาศนียบัตรของคุณพร้อมแล้ว"
            cta="ดูใบประกาศนียบัตร"
            onClick={() => navigate('/certification')}
          />
        ) : (
          <LearnPathCard
            done={0}
            total={learnPath.total}
            title="เริ่มเรียน BLS — 5 ขั้นสู่ใบประกาศนียบัตร"
            desc="เริ่มจาก Pre-test · ระบุตัวผู้เรียนเพื่อบันทึกผล"
            cta="เริ่ม Pre-test"
            onClick={() => navigate('/learn')}
          />
        )}

          {/* Resume active session */}
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

          {/* Main menu */}
          <div className="grid gap-2.5">
            <GameHighlightCard
              to="/sim"
              title={t('code_sim', lang)}
              desc={t('code_sim_desc', lang)}
              Icon={Gamepad2}
            />
            <MenuList title="เรียนรู้" items={[

              { Icon: GraduationCap, to: '/learn', label: 'โหมดเรียน', desc: 'บทเรียน · เกมลำดับขั้น · ใบประกาศนียบัตร' },

              { Icon: Play, to: '/video-lessons', label: 'วิดีโอบทเรียน', desc: 'คลิปสอนเชิงลึกทุกหัวข้อ' },

              { Icon: HelpCircle, to: '/qa-deep', label: 'Q&A BLS เชิงลึก', desc: 'คำถาม-คำตอบพร้อม infographic' },

            ]} />
          </div>

          {/* Quick-start templates */}
          <div className="space-y-3">
            <div className="text-overline text-text-muted px-1">เริ่มเร็วตาม pathway</div>
            <BLSHomeQuickActions onStart={handleStart} disabled={loading} />
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
            v2.0.0 · BLS Rescue
          </div>
        </div>
      </div>
    );
  }

  // ===== ACLS home =====
  return (
    <div className="acls-home min-h-[100dvh]">
      <div
        className="acls-home-container page-container pb-28 flex flex-col gap-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <ACLSLandingHero isClinical={isClinical} learnPath={learnPath} onStart={handleStart} loading={loading} />

        {/* การ์ดนำทางนักเรียน — บอกขั้นถัดไปที่ต้องเรียน (สีน้ำเงิน = โหมดเรียนต่อ) */}
        {learnPath.next ? (
          <button onClick={() => navigate(learnPath.next.path)}
            className="card card-hover w-full flex items-center gap-3"
            style={{ background: 'var(--acls-brand-soft)', border: '1.5px solid #F1C9CD', textAlign: 'left', justifyContent: 'flex-start' }}>
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 48, height: 48, borderRadius: 12, background: '#D7192020', color: '#D71920' }}>
              <BookOpen size={22} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-headline" style={{ color: '#AD1017' }}>
                เรียนต่อ — ขั้นที่ {learnPath.next.index}: {learnPath.next.label}
              </div>
              <div className="text-caption" style={{ color: '#862029', marginBottom: 6 }}>
                ผ่านแล้ว {learnPath.done}/{learnPath.total} ขั้น
              </div>
              <div style={{ height: 5, borderRadius: 99, background: '#F1C9CD', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${learnPath.total ? Math.round((learnPath.done / learnPath.total) * 100) : 0}%`,
                  background: '#D71920',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#D71920' }} className="shrink-0" />
          </button>
        ) : learnPath.activeStudent && learnPath.total > 0 ? (
          <button onClick={() => navigate('/certification')}
            className="card card-hover w-full flex items-center gap-3"
            style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', textAlign: 'left', justifyContent: 'flex-start' }}>
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 48, height: 48, borderRadius: 12, background: '#05966920', color: '#059669' }}>
              <Award size={22} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-headline" style={{ color: '#047857' }}>เรียนครบทุกขั้นแล้ว 🎓</div>
              <div className="text-caption" style={{ color: '#065F46' }}>ดูใบประกาศนียบัตรของคุณ</div>
            </div>
            <ChevronRight size={18} style={{ color: '#059669' }} className="shrink-0" />
          </button>
        ) : null}

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

        <details className="acls-home-more">
          <summary>ทางลัดเพิ่มเติม <ChevronRight size={17} /></summary>
          <div className="acls-home-links">
            {[
              ['/video-lessons', 'วิดีโอบทเรียน'], ['/qa-acls-deep', 'Q&A เชิงลึก'],
              ['/games', 'เกมฝึกทักษะ'], ['/algorithm', 'Algorithms'],
              ['/drug-calc', 'คำนวณยา'], ['/history', 'ประวัติเคส'],
              ['/certification', 'ใบประกาศนียบัตร'], ['/guide', 'คู่มือ'],
              ['/feedback', 'Feedback'], ['/news', 'ข่าวสาร'],
            ].map(([path, label]) => <button key={path} onClick={() => navigate(path)} className="btn btn-ghost">{label}</button>)}
          </div>
          <div className="acls-home-pathways"><p>เริ่มบันทึกตามสถานการณ์</p><ACLSQuickActions onStart={handleStart} disabled={loading} /></div>
        </details>
        <p className="acls-home-footnote">ACLS by MorRoo · เรียนรู้และฝึกทักษะในที่เดียว</p>
      </div>
    </div>
  );
}
