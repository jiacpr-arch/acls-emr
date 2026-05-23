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
            { path: '/pre-course', Icon: GraduationCap, label: t('pre_course', lang) },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/skill-practice', Icon: HeartPulse, label: 'ฝึก CPR' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/guide', Icon: BookOpen, label: t('guide', lang) },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', Icon: Trophy, label: t('cert', lang) },
          ],
        },
      ]
    : [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course', Icon: GraduationCap, label: t('pre_course', lang) },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/als', Icon: GraduationCap, label: t('als_knowledge', lang) },
            { path: '/algorithm', Icon: BookOpen, label: t('algorithms', lang) },
            { path: '/guide', Icon: BookOpen, label: t('guide', lang) },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/scenarios', Icon: Sparkles, label: t('scenarios', lang) },
            { path: '/sim', Icon: AlertTriangle, label: t('code_sim', lang) },
            { path: '/drill', Icon: Activity, label: t('drill', lang) },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', Icon: Trophy, label: t('cert', lang) },
          ],
        },
      ];

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
          <div className="grid grid-cols-3 gap-2">
            {section.items.map(item => {
              const ItemIcon = item.Icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 py-4 transition-colors hover:bg-bg-tertiary text-text-secondary"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-bg-secondary)',
                  }}
                >
                  <span className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary"
                    style={{ borderRadius: 'var(--radius-md)' }}>
                    <ItemIcon size={20} strokeWidth={2} />
                  </span>
                  <span className="text-xs font-semibold text-center px-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
