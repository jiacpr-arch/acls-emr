import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useClassStore } from '../stores/classStore';
import { t } from '../utils/i18n';
import { Gamepad2, User } from '../components/ui/Icon';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';

// รวมเกม/แบบฝึกทั้งหมดไว้จุดเดียว — เข้าจากแท็บ "เกมส์" บนแถบเมนูล่าง
export default function GamesHub() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const classCode = useClassStore(s => s.classCode);
  const [showIdentity, setShowIdentity] = useState(false);

  const games = [
    { path: '/sim',           emoji: '🚨', label: t('code_sim', lang),      subtitle: 'Code Blue Sim', desc: t('code_sim_desc', lang),      tone: 'danger', badge: '🏅', featured: true },
    { path: '/recorder-game', emoji: '🎯', label: t('recorder_game', lang), subtitle: 'Recorder Hero', desc: t('recorder_game_desc', lang), tone: 'purple' },
    { path: '/scenarios',     emoji: '🎮', label: t('scenarios', lang),     subtitle: 'Scenarios',     desc: t('scenarios_desc', lang),     tone: 'warning' },
    { path: '/drill',         emoji: '⚡', label: t('drill', lang),         subtitle: 'Skill Drill',   desc: t('drill_desc', lang),         tone: 'shock' },
    { path: '/sim-board',     emoji: '🏆', label: t('leaderboard', lang),   subtitle: 'Leaderboard',   desc: t('leaderboard_desc', lang),   tone: 'success' },
  ];

  const toneColor = {
    info:    'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger:  'var(--color-danger)',
    purple:  'var(--color-purple)',
    shock:   'var(--color-shock)',
  };

  return (
    <div className="page-container space-y-5 pb-24">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-danger) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(147, 51, 234, 0.28)',
          }}>
          <Gamepad2 size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">{t('games', lang)}</h1>
        <p className="text-caption text-text-muted">{t('games_subtitle', lang)}</p>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        {games.map(item => {
          const color = toneColor[item.tone] || toneColor.info;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`learn-card tone-${item.tone || 'info'} relative flex flex-col items-center text-center px-3 pt-5 pb-4`}
              /* Inline gridColumn overrides .learn-card:last-child:nth-child(odd)
                 auto-span, so we control which card spans the row */
              style={{ gridColumn: item.featured ? '1 / -1' : 'auto' }}
            >
              {item.badge && (
                <span
                  className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 text-2xs font-extrabold text-white shadow-sm"
                  style={{ borderRadius: '50%', background: color }}
                  aria-hidden="true"
                >
                  {item.badge}
                </span>
              )}
              <span className="text-[44px] leading-none mb-2" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-sm font-bold leading-tight" style={{ color }}>
                {item.label}
              </span>
              <span className="text-sm font-semibold text-text-primary leading-tight mt-0.5">
                {item.subtitle}
              </span>
              <span className="text-xs text-text-muted leading-snug mt-1">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
