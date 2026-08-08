import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Siren, Zap, Trophy, User, ChevronRight, Target, Hospital, Stethoscope } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useClassStore } from '../stores/classStore';
import { t } from '../utils/i18n';
import { IS_BLS } from '../config/courseMode';
import PageHero from '../components/PageHero';
import GameHighlightCard from '../components/GameHighlightCard';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';

// รวมเกม/แบบฝึกทั้งหมดไว้จุดเดียว — เข้าจากแท็บ "เกมส์" บนแถบเมนูล่าง
export default function GamesHub() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const classCode = useClassStore(s => s.classCode);
  const [showIdentity, setShowIdentity] = useState(false);

  // เกมผู้บันทึกสองตัวใช้เคสชุดเดียวกัน ต่างแค่ระดับความจริง (ปุ่มจำลอง vs หน้า
  // Recording จริง) — จัดเป็นการ์ดเส้นทางเดียว 2 ขั้น แทนสองการ์ดที่ดูเป็นเกมซ้ำกัน
  const recorderSteps = [
    { path: '/recorder-game', Icon: Target, step: 1, label: t('recorder_game', lang), desc: t('recorder_game_desc', lang) },
    { path: '/scenarios',     Icon: Hospital, step: 2, label: t('scenarios', lang), desc: t('scenarios_desc', lang) },
  ];

  return (
    <div className="page-container flex flex-col gap-4 pb-24">
      <PageHero title={t('games', lang)} desc={IS_BLS ? 'เรียน BLS แบบสนุก — เล่นเกม ฝึกซ้อม แข่งอันดับ' : t('games_subtitle', lang)} />

      {/* อยู่ในคลาส: บอกว่ากำลังบันทึกผลในชื่อใคร — เกมนอกคลาสไม่มี leaderboard ให้บันทึก
          จึงไม่ต้องกวนนักเรียนที่เล่นเดี่ยว/ออฟไลน์ให้ลงทะเบียน */}
      {classCode && (
        <div className={`flex items-center justify-between gap-2 px-3 py-2.5 text-caption ${
          activeStudent ? 'bg-bg-tertiary' : 'bg-warning/8 border border-warning/30'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <User size={14} strokeWidth={2.4} className={activeStudent ? 'text-text-muted shrink-0' : 'text-warning shrink-0'} />
            <span className="truncate">
              {activeStudent
                ? <>บันทึกผลในชื่อ <b className="text-text-primary">{activeStudent.name}</b></>
                : 'ยังไม่ได้ลงทะเบียน — จะถูกขอชื่อก่อนเริ่มเล่น'}
            </span>
          </span>
          <button onClick={() => setShowIdentity(true)}
            className="btn btn-ghost btn-sm shrink-0">
            {activeStudent ? 'เปลี่ยน' : 'ลงทะเบียน'}
          </button>
        </div>
      )}

      {/* เกมเรือธง — การ์ดไฮไลต์พื้นเข้ม โดดจากการ์ดขาวรอบตัว */}
      <GameHighlightCard
        to="/sim"
        title={t('code_sim', lang)}
        desc={t('code_sim_desc', lang)}
        Icon={Siren}
      />

      <button onClick={() => navigate('/drill')}
        className="card card-hover w-full flex items-center gap-3.5"
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 12, background: '#EA580C15', color: '#EA580C' }}>
          <Zap size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-headline text-text-primary">{t('drill', lang)}</div>
          <div className="text-caption text-text-muted">{t('drill_desc', lang)}</div>
        </div>
        <ChevronRight size={18} className="text-text-muted shrink-0" />
      </button>

      <button onClick={() => navigate('/sim-board')}
        className="card card-hover w-full flex items-center gap-3.5"
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 12, background: '#05966915', color: 'var(--color-success)' }}>
          <Trophy size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-headline text-text-primary">{t('leaderboard', lang)}</div>
          <div className="text-caption text-text-muted">{t('leaderboard_desc', lang)}</div>
        </div>
        <ChevronRight size={18} className="text-text-muted shrink-0" />
      </button>

      {/* เส้นทางผู้บันทึก — การ์ดขาวใบเดียว 2 ขั้น */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope size={18} strokeWidth={2.2} className="text-info" />
          <div className="text-headline text-text-primary">{t('recorder_path', lang)}</div>
        </div>
        <div className="text-caption text-text-muted" style={{ marginBottom: 10 }}>
          {t('recorder_path_desc', lang)}
        </div>
        <div className="flex flex-col gap-1.5">
          {recorderSteps.map(s => {
            const StepIcon = s.Icon;
            return (
              <button key={s.path} onClick={() => navigate(s.path)}
                className="w-full flex items-center gap-3 p-2.5 transition-colors hover:bg-bg-tertiary/60"
                style={{ borderRadius: 10, textAlign: 'left', justifyContent: 'flex-start' }}>
                <span
                  className="shrink-0 inline-flex items-center justify-center"
                  style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB15' }}
                >
                  <span className="font-bold text-info">{s.step}</span>
                </span>
                <StepIcon size={20} strokeWidth={2.2} className="text-info shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-body-strong text-text-primary">{s.label}</span>
                  <span className="block text-caption text-text-muted">{s.desc}</span>
                </span>
                <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
