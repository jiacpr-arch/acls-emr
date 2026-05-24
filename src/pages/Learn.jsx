import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS, IS_ACLS } from '../config/courseMode';
import {
  GraduationCap, BookOpen, Sparkles, AlertTriangle, Activity, Trophy, HeartPulse,
  FileText, Award,
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
            { path: '/pre-course',           Icon: GraduationCap, label: t('pre_course', lang), tone: 'info' },
            { path: '/pre-course/pre-test',  Icon: FileText,      label: t('pre_test', lang),   tone: 'purple' },
            { path: '/pre-course/post-test', Icon: Award,         label: t('post_test', lang),  tone: 'shock' },
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
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(96, 165, 250, 0.95) 0%, rgba(59, 130, 246, 0.55) 35%, rgba(96, 165, 250, 0) 75%)',
      ring:     'rgba(37, 99, 235, 0.35)',
    },
    success: {
      gradient: 'linear-gradient(135deg, #34D399 0%, #059669 50%, #047857 100%)',
      glow:     '0 10px 22px -6px rgba(5, 150, 105, 0.55), 0 4px 8px -2px rgba(5, 150, 105, 0.32)',
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.55) 35%, rgba(52, 211, 153, 0) 75%)',
      ring:     'rgba(5, 150, 105, 0.35)',
    },
    warning: {
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #B45309 100%)',
      glow:     '0 10px 22px -6px rgba(217, 119, 6, 0.55), 0 4px 8px -2px rgba(217, 119, 6, 0.32)',
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.55) 35%, rgba(251, 191, 36, 0) 75%)',
      ring:     'rgba(217, 119, 6, 0.35)',
    },
    danger: {
      gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 50%, #991B1B 100%)',
      glow:     '0 10px 22px -6px rgba(220, 38, 38, 0.55), 0 4px 8px -2px rgba(220, 38, 38, 0.32)',
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(248, 113, 113, 0.95) 0%, rgba(239, 68, 68, 0.55) 35%, rgba(248, 113, 113, 0) 75%)',
      ring:     'rgba(220, 38, 38, 0.35)',
    },
    purple: {
      gradient: 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #6D28D9 100%)',
      glow:     '0 10px 22px -6px rgba(124, 58, 237, 0.55), 0 4px 8px -2px rgba(124, 58, 237, 0.32)',
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(167, 139, 250, 0.95) 0%, rgba(139, 92, 246, 0.55) 35%, rgba(167, 139, 250, 0) 75%)',
      ring:     'rgba(124, 58, 237, 0.35)',
    },
    shock: {
      gradient: 'linear-gradient(135deg, #FDBA74 0%, #F97316 50%, #C2410C 100%)',
      glow:     '0 10px 22px -6px rgba(234, 88, 12, 0.55), 0 4px 8px -2px rgba(234, 88, 12, 0.32)',
      blob:     'radial-gradient(140% 90% at 30% 10%, rgba(253, 186, 116, 0.95) 0%, rgba(249, 115, 22, 0.55) 35%, rgba(253, 186, 116, 0) 75%)',
      ring:     'rgba(234, 88, 12, 0.35)',
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
                    borderRadius: '20px',
                    border: `1px solid ${tone.ring}`,
                  }}
                >
                  {/* layer 1: colored blob */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: tone.blob }}
                  />
                  {/* layer 2: frosted glass overlay */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.68) 100%)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    }}
                  />
                  {/* layer 3: top inner highlight */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{
                      height: '50%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)',
                      mixBlendMode: 'overlay',
                    }}
                  />

                  <span
                    className="relative inline-flex items-center justify-center text-white z-10"
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
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0) 60%)',
                      }}
                    />
                    <ItemIcon size={24} strokeWidth={2.3} className="relative" />
                  </span>
                  <span className="relative z-10 text-[13px] font-semibold text-center px-1 leading-tight tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
