import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS, IS_ACLS } from '../config/courseMode';
import {
  GraduationCap, BookOpen, Sparkles, AlertTriangle, Activity, Trophy, HeartPulse,
} from '../components/ui/Icon';
import MorrooAdCard from '../components/MorrooAdCard';
import JiacprCourseBanner from '../components/JiacprCourseBanner';

export default function Learn() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';

  const sections = IS_BLS
    ? [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course', Icon: GraduationCap, label: t('pre_course', lang), tone: 'info' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/skill-practice', Icon: HeartPulse, label: 'ฝึก CPR', tone: 'danger' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/guide', Icon: BookOpen, label: t('guide', lang), tone: 'success' },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', Icon: Trophy, label: t('cert', lang), tone: 'warning' },
          ],
        },
      ]
    : [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course', Icon: GraduationCap, label: t('pre_course', lang), tone: 'info' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/als', Icon: GraduationCap, label: t('als_knowledge', lang), tone: 'info' },
            { path: '/algorithm', Icon: BookOpen, label: t('algorithms', lang), tone: 'purple' },
            { path: '/guide', Icon: BookOpen, label: t('guide', lang), tone: 'success' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/scenarios', Icon: Sparkles, label: t('scenarios', lang), tone: 'warning' },
            { path: '/sim', Icon: AlertTriangle, label: t('code_sim', lang), tone: 'danger' },
            { path: '/drill', Icon: Activity, label: t('drill', lang), tone: 'shock' },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', Icon: Trophy, label: t('cert', lang), tone: 'warning' },
          ],
        },
      ];

  const toneStyles = {
    info: {
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #1E40AF 100%)',
      glow:     '0 10px 22px -6px rgba(37, 99, 235, 0.55), 0 4px 8px -2px rgba(37, 99, 235, 0.32)',
      cardBg:   'linear-gradient(180deg, #F0F6FF 0%, #FFFFFF 70%)',
      ring:     'rgba(37, 99, 235, 0.18)',
      accent:   '#2563EB',
    },
    success: {
      gradient: 'linear-gradient(135deg, #34D399 0%, #059669 50%, #047857 100%)',
      glow:     '0 10px 22px -6px rgba(5, 150, 105, 0.55), 0 4px 8px -2px rgba(5, 150, 105, 0.32)',
      cardBg:   'linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 70%)',
      ring:     'rgba(5, 150, 105, 0.18)',
      accent:   '#059669',
    },
    warning: {
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #B45309 100%)',
      glow:     '0 10px 22px -6px rgba(217, 119, 6, 0.55), 0 4px 8px -2px rgba(217, 119, 6, 0.32)',
      cardBg:   'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 70%)',
      ring:     'rgba(217, 119, 6, 0.18)',
      accent:   '#D97706',
    },
    danger: {
      gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 50%, #991B1B 100%)',
      glow:     '0 10px 22px -6px rgba(220, 38, 38, 0.55), 0 4px 8px -2px rgba(220, 38, 38, 0.32)',
      cardBg:   'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 70%)',
      ring:     'rgba(220, 38, 38, 0.18)',
      accent:   '#DC2626',
    },
    purple: {
      gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #6D28D9 100%)',
      glow:     '0 10px 22px -6px rgba(124, 58, 237, 0.55), 0 4px 8px -2px rgba(124, 58, 237, 0.32)',
      cardBg:   'linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 70%)',
      ring:     'rgba(124, 58, 237, 0.18)',
      accent:   '#7C3AED',
    },
    shock: {
      gradient: 'linear-gradient(135deg, #FDBA74 0%, #F97316 50%, #C2410C 100%)',
      glow:     '0 10px 22px -6px rgba(234, 88, 12, 0.55), 0 4px 8px -2px rgba(234, 88, 12, 0.32)',
      cardBg:   'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 70%)',
      ring:     'rgba(234, 88, 12, 0.18)',
      accent:   '#EA580C',
    },
  };

  return (
    <div className="page-container space-y-6 pb-24">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
          }}>
          <GraduationCap size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">{t('learn', lang)}</h1>
        <p className="text-caption text-text-muted">{t('learn_subtitle', lang)}</p>
      </div>

      {IS_ACLS && <JiacprCourseBanner />}

      <MorrooAdCard />

      {sections.map(section => (
        <div key={section.title} className="space-y-2">
          <div className="text-overline text-text-muted px-1">{section.title}</div>
          <div className="grid grid-cols-3 gap-3">
            {section.items.map(item => {
              const ItemIcon = item.Icon;
              const tone = toneStyles[item.tone || 'info'];
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="learn-tile relative flex flex-col items-center gap-3 pt-5 pb-4 px-2 text-text-primary overflow-hidden"
                  style={{
                    borderRadius: 'var(--radius-2xl)',
                    background: tone.cardBg,
                    border: `1px solid ${tone.ring}`,
                    boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04), 0 6px 14px -8px rgba(15, 26, 46, 0.10)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: '46%',
                      height: '3px',
                      borderRadius: '0 0 999px 999px',
                      background: tone.gradient,
                      opacity: 0.85,
                    }}
                  />
                  <span
                    className="relative inline-flex items-center justify-center text-white"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: tone.gradient,
                      boxShadow: tone.glow,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0) 60%)',
                      }}
                    />
                    <ItemIcon size={24} strokeWidth={2.3} className="relative" />
                  </span>
                  <span className="text-[13px] font-semibold text-center px-1 leading-tight tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
