import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { getActiveSession, clearActiveSession } from '../stores/caseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS } from '../config/courseMode';
import CourseSplash from '../components/newcase/CourseSplash';
import CourseHero from '../components/newcase/CourseHero';
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
  const [activeSession, setActiveSession] = useState(null);
  const [showSplash, setShowSplash] = useState(!homeSplashSeen);
  // เส้นทางเรียนของนักเรียน (logic เดียวกับหน้า Learn) — ใช้กับการ์ด "เรียนต่อ"
  const learnPath = useLearnPath();

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

  // ===== ACLS — new "wow" landing =====
  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {showSplash && (
        <CourseSplash
          onDismiss={() => { homeSplashSeen = true; setShowSplash(false); }}
        />
      )}

      <div
        className="page-container pb-28 flex flex-col gap-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <CourseHero isClinical={isClinical} />

        <EmergencyCTA
          Icon={Hospital}
          title="CODE BLUE / CODE 8"
          desc="MET / RRT Team · เริ่มบันทึกเหตุการณ์ทันที"
          hint="แตะแล้วนาฬิกาเริ่มนับทันที"
          onClick={() => handleStart('rrt')}
          disabled={loading}
        />

        {/* การ์ดนำทางนักเรียน — บอกขั้นถัดไปที่ต้องเรียน (สีน้ำเงิน = โหมดเรียนต่อ) */}
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
            title="เริ่มเรียน ACLS — 6 ขั้นสู่ใบประกาศนียบัตร"
            desc="เริ่มจาก Pre-test · ระบุตัวผู้เรียนเพื่อบันทึกผล"
            cta="เริ่ม Pre-test"
            onClick={() => navigate('/learn')}
          />
        )}

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

        {/* Main menu — การ์ดสีประจำโหมด (เขียว=เรียน, ม่วง=วิดีโอ, ฟ้า=Q&A)
            ตาม mapping สีของดีไซน์เดิม; Sim ใช้การ์ดเกมพื้นเข้มให้เด่นสุด */}
        <div className="grid gap-2.5">
          <GameHighlightCard
            to="/sim"
            title={t('code_sim', lang)}
            desc={t('code_sim_desc', lang)}
            Icon={Gamepad2}
          />
          <MenuList title="เรียนรู้" items={[

            { Icon: GraduationCap, to: '/learn', label: 'โหมดเรียน', desc: 'บทเรียน · scenarios · ใบประกาศนียบัตร' },

            { Icon: Play, to: '/video-lessons', label: 'วิดีโอบทเรียน', desc: 'คลิปสอนเชิงลึกทุกหัวข้อ' },

            { Icon: HelpCircle, to: '/qa-acls-deep', label: 'Q&A ACLS เชิงลึก', desc: '13 หมวด พร้อม infographic' },

          ]} />
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
