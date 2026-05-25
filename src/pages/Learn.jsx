import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS } from '../config/courseMode';
import { GraduationCap } from '../components/ui/Icon';

export default function Learn() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';

  const sections = IS_BLS
    ? [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course', emoji: '🎓', label: t('pre_course', lang), subtitle: 'Pre-course', desc: t('pre_course_desc', lang), tone: 'info' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/skill-practice', emoji: '💗', label: t('cpr_drill', lang), subtitle: 'CPR Drill', desc: t('cpr_drill_desc', lang), tone: 'danger' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/guide', emoji: '📖', label: t('guide', lang), subtitle: 'Field Guide', desc: t('guide_desc', lang), tone: 'success' },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', emoji: '🏅', label: t('cert', lang), subtitle: 'My Records', desc: t('cert_desc', lang), tone: 'warning' },
          ],
        },
      ]
    : [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course',           emoji: '🎓', label: t('pre_course', lang), subtitle: 'Pre-course',      desc: t('pre_course_desc', lang), tone: 'info' },
            { path: '/pre-course/pre-test',  emoji: '📝', label: t('pre_test',   lang), subtitle: 'Knowledge Check', desc: t('pre_test_desc', lang),   tone: 'purple' },
            { path: '/pre-course/post-test', emoji: '🏆', label: t('post_test',  lang), subtitle: 'Final Exam',      desc: t('post_test_desc', lang),  tone: 'shock' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/als',       emoji: '📚', label: t('als_knowledge', lang), subtitle: 'ALS Book',    desc: t('als_knowledge_desc', lang), tone: 'info' },
            { path: '/algorithm', emoji: '📋', label: t('algorithms', lang),    subtitle: 'Algorithms',  desc: t('algorithms_desc', lang),    tone: 'purple' },
            { path: '/guide',     emoji: '📖', label: t('guide', lang),         subtitle: 'Field Guide', desc: t('guide_desc', lang),         tone: 'success' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/scenarios', emoji: '🎮', label: t('scenarios', lang), subtitle: 'Scenarios',     desc: t('scenarios_desc', lang), tone: 'warning' },
            { path: '/sim',       emoji: '🚨', label: t('code_sim', lang),  subtitle: 'Code Blue Sim', desc: t('code_sim_desc', lang),  tone: 'danger' },
            { path: '/drill',     emoji: '⚡', label: t('drill', lang),     subtitle: 'Skill Drill',   desc: t('drill_desc', lang),     tone: 'shock' },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', emoji: '🏅', label: t('cert', lang), subtitle: 'My Records', desc: t('cert_desc', lang), tone: 'warning' },
          ],
        },
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

      {sections.map(section => (
        <div key={section.title} className="space-y-2">
          <div className="text-overline text-text-muted px-1">{section.title}</div>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`learn-card tone-${item.tone || 'info'} flex flex-col items-center text-center px-3 pt-5 pb-4`}
              >
                <span className="text-[44px] leading-none mb-2" aria-hidden="true">
                  {item.emoji}
                </span>
                <span
                  className="text-[15px] font-bold leading-tight"
                  style={{ color: toneColor[item.tone] || toneColor.info }}
                >
                  {item.label}
                </span>
                <span className="text-[13px] font-semibold text-text-primary leading-tight mt-0.5">
                  {item.subtitle}
                </span>
                <span className="text-[11px] text-text-muted leading-tight mt-1.5">
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
