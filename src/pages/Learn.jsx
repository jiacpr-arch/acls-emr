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

  const toneGradients = {
    info:    'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    danger:  'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    purple:  'linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)',
    shock:   'linear-gradient(135deg, #FB923C 0%, #C2410C 100%)',
  };
  const toneShadows = {
    info:    '0 6px 14px rgba(37, 99, 235, 0.28)',
    success: '0 6px 14px rgba(5, 150, 105, 0.28)',
    warning: '0 6px 14px rgba(217, 119, 6, 0.28)',
    danger:  '0 6px 14px rgba(220, 38, 38, 0.28)',
    purple:  '0 6px 14px rgba(124, 58, 237, 0.28)',
    shock:   '0 6px 14px rgba(234, 88, 12, 0.28)',
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
              const tone = item.tone || 'info';
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="learn-tile flex flex-col items-center gap-2.5 py-4 px-2 text-text-primary"
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-1)',
                  }}
                >
                  <span
                    className="w-12 h-12 inline-flex items-center justify-center text-white"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      background: toneGradients[tone],
                      boxShadow: toneShadows[tone],
                    }}
                  >
                    <ItemIcon size={22} strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-semibold text-center px-1 leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
