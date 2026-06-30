import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { t } from '../utils/i18n';
import { IS_BLS, courseMeta } from '../config/courseMode';
import { GraduationCap } from '../components/ui/Icon';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import { preCourseLessons } from '../data/activeLessons';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID } from '../data/assessment';
import { EKG_TEST_PASSED_KEY } from '../data/ekgQuiz';
import { computeVideoCompletion } from '../utils/videoProgress';
import { useVideoLessons } from '../hooks/useVideoLessons';
import MorrooAdCard from '../components/MorrooAdCard';
import NewsCard from '../components/NewsCard';

export default function Learn() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [progress, setProgress] = useState([]);   // [{ lessonId, readAt }]
  const [attempts, setAttempts] = useState([]);   // [{ lessonId, score, passed, ... }]
  const { lessons: videoLessons } = useVideoLessons();

  // Reload the student's progress whenever we land on (or return to) this hub —
  // on mount, when the active student changes, and when the tab regains focus
  // after finishing a chapter elsewhere.
  useEffect(() => {
    const id = activeStudent?.id;
    if (!id) {
      Promise.resolve().then(() => { setProgress([]); setAttempts([]); });
      return;
    }
    const load = () => Promise.all([
      getLessonProgress(id),
      getAttemptsForStudent(id),
    ]).then(([p, a]) => { setProgress(p); setAttempts(a); });
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [activeStudent?.id]);

  const passedFor = (lessonId) => {
    const best = attempts
      .filter(a => a.lessonId === lessonId)
      .reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
    return best?.passed ?? false;
  };

  const totalLessons = preCourseLessons.length;
  const lessonsPassed = preCourseLessons.filter(l => passedFor(l.id)).length;
  const ekgDone = typeof localStorage !== 'undefined'
    && localStorage.getItem(EKG_TEST_PASSED_KEY) === 'true';
  const videoComp = computeVideoCompletion(videoLessons, progress, attempts);
  const certDone = (() => {
    try {
      const raw = localStorage.getItem(`${courseMeta.id}_certification`);
      return !!(raw && JSON.parse(raw).certId);
    } catch { return false; }
  })();

  // Resolve a step's completion state. Returns null when there is nothing to
  // show (no active student / key without tracking). `total` present => the step
  // is a multi-item unit and renders xx/xx while incomplete.
  const statusFor = (key) => {
    if (!key || !activeStudent) return null;
    switch (key) {
      case 'preTest':
        return { complete: passedFor(PRE_TEST_LESSON_ID) };
      case 'lessons':
        return { complete: totalLessons > 0 && lessonsPassed === totalLessons, done: lessonsPassed, total: totalLessons };
      case 'ekg':
        return { complete: ekgDone };
      case 'video':
        if (videoComp.total === 0) return { complete: false };
        return { complete: videoComp.allDone, done: videoComp.done, total: videoComp.total };
      case 'postTest':
        return { complete: passedFor(POST_TEST_LESSON_ID) };
      case 'cert':
        return { complete: certDone };
      default:
        return null;
    }
  };

  const sections = IS_BLS
    ? [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course', emoji: '🎓', label: t('pre_course', lang), subtitle: 'Pre-course', desc: t('pre_course_desc', lang), tone: 'info', progressKey: 'lessons' },
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
            { path: '/certification', emoji: '🏅', label: t('cert', lang), subtitle: 'My Records', desc: t('cert_desc', lang), tone: 'warning', progressKey: 'cert' },
          ],
        },
      ]
    : [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course/pre-test',  emoji: '📝', label: t('pre_test',   lang), subtitle: 'Knowledge Check', desc: t('pre_test_desc', lang),       tone: 'purple',  step: 1, featured: true, progressKey: 'preTest' },
            { path: '/pre-course',           emoji: '🎓', label: t('pre_course', lang), subtitle: 'บทเรียน + Quiz',  desc: t('pre_course_desc', lang),     tone: 'info',    step: 2, featured: true, progressKey: 'lessons' },
            { path: '/als?tab=ekg',          emoji: '💓', label: t('ekg_quiz', lang),       subtitle: 'EKG Quiz',        desc: t('ekg_quiz_desc', lang),       tone: 'danger',  step: 3, featured: true, progressKey: 'ekg' },
            { path: '/video-lessons',        emoji: '📹', label: t('video_lessons', lang),  subtitle: 'Video Lessons',   desc: t('video_lessons_desc', lang),  tone: 'purple',  step: 4, featured: true, progressKey: 'video' },
            { path: '/pre-course/post-test', emoji: '🏆', label: t('post_test',  lang), subtitle: 'Final Exam',      desc: t('post_test_desc', lang),      tone: 'shock',   step: 5, featured: true, progressKey: 'postTest' },
            { path: '/certification',        emoji: '🏅', label: t('cert', lang),           subtitle: 'My Records',      desc: t('cert_desc', lang),           tone: 'warning', badge: '👑', featured: true, progressKey: 'cert' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/als',           emoji: '📚', label: t('als_knowledge', lang), subtitle: 'ALS Book',    desc: t('als_knowledge_desc', lang), tone: 'info' },
            { path: '/qa-acls-deep',  emoji: '💬', label: t('qa_deep', lang),       subtitle: 'Q&A Deep',    desc: t('qa_deep_desc', lang),       tone: 'shock' },
            { path: '/algorithm',     emoji: '📋', label: t('algorithms', lang),    subtitle: 'Algorithms',  desc: t('algorithms_desc', lang),    tone: 'purple' },
            { path: '/guide',         emoji: '📖', label: t('guide', lang),         subtitle: 'Field Guide', desc: t('guide_desc', lang),         tone: 'success' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/scenarios', emoji: '🎮', label: t('scenarios', lang), subtitle: 'Scenarios',     desc: t('scenarios_desc', lang), tone: 'warning' },
            { path: '/sim',       emoji: '🚨', label: t('code_sim', lang),  subtitle: 'Code Blue Sim', desc: t('code_sim_desc', lang),  tone: 'danger' },
            { path: '/drill',     emoji: '⚡', label: t('drill', lang),     subtitle: 'Skill Drill',   desc: t('drill_desc', lang),     tone: 'shock', featured: true },
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

  // The "go here next" step: first featured prepare-path step that is tracked
  // and not yet complete. Drives the highlight ring so students see where to
  // continue when they return to this hub.
  const nextStepPath = (() => {
    const prep = sections.find(s => s.title === t('learn_prepare', lang));
    if (!prep) return null;
    for (const item of prep.items) {
      if (!item.featured && !IS_BLS) continue;
      const st = statusFor(item.progressKey);
      if (st && !st.complete) return item.path;
    }
    return null;
  })();

  // Prepare-section header progress: count completed tracked steps / total tracked.
  const prepProgress = (() => {
    const prep = sections.find(s => s.title === t('learn_prepare', lang));
    if (!prep) return null;
    const tracked = prep.items
      .map(i => statusFor(i.progressKey))
      .filter(Boolean);
    if (!tracked.length) return null;
    return { done: tracked.filter(s => s.complete).length, total: tracked.length };
  })();

  return (
    <div className="page-container space-y-5 pb-24">
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

      <NewsCard />

      <MorrooAdCard />

      {sections.map(section => {
        const isPrep = section.title === t('learn_prepare', lang);
        return (
          <div key={section.title} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-overline text-text-muted">{section.title}</div>
              {isPrep && prepProgress && (
                <div className={`text-overline ${prepProgress.done === prepProgress.total ? 'text-success' : 'text-text-muted'}`}>
                  {prepProgress.done}/{prepProgress.total} {t('learn_steps_done', lang)}
                </div>
              )}
            </div>
            {isPrep && !activeStudent && (
              <div className="text-caption text-text-muted px-1 -mt-1">
                {t('learn_identify_hint', lang)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {section.items.map(item => {
                const status = statusFor(item.progressKey);
                const isNext = item.path === nextStepPath;
                const color = toneColor[item.tone] || toneColor.info;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`learn-card tone-${item.tone || 'info'} relative flex flex-col items-center text-center px-3 pt-5 pb-4`}
                    /* Inline gridColumn overrides .learn-card:last-child:nth-child(odd)
                       auto-span, so we control which card spans the row */
                    style={{
                      gridColumn: item.featured ? '1 / -1' : 'auto',
                      ...(status?.complete
                        ? { boxShadow: '0 0 0 2px var(--color-success) inset' }
                        : isNext
                          ? { boxShadow: `0 0 0 2px ${color} inset` }
                          : null),
                    }}
                  >
                    {(item.step != null || item.badge) && (
                      <span
                        className="absolute top-2 left-2 inline-flex items-center justify-center w-6 h-6 text-[11px] font-extrabold text-white shadow-sm"
                        style={{
                          borderRadius: '50%',
                          background: color,
                        }}
                        aria-hidden="true"
                      >
                        {item.badge || item.step}
                      </span>
                    )}

                    {/* Top-right progress marker: green check when complete,
                        xx/xx pill while a multi-chapter unit is still incomplete. */}
                    {status?.complete ? (
                      <span
                        className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 text-white shadow-sm"
                        style={{ borderRadius: '50%', background: 'var(--color-success)' }}
                        title={t('learn_passed', lang)}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : status?.total ? (
                      <span
                        className="absolute top-2 right-2 inline-flex items-center justify-center px-1.5 h-6 text-[11px] font-extrabold text-white shadow-sm"
                        style={{ borderRadius: '999px', background: color }}
                        aria-hidden="true"
                      >
                        {status.done}/{status.total}
                      </span>
                    ) : status ? (
                      <span
                        className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 text-text-muted"
                        title={t('learn_not_started', lang)}
                      >
                        <Circle size={16} strokeWidth={2.2} />
                      </span>
                    ) : null}

                    <span className="text-[44px] leading-none mb-2" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span
                      className="text-[14px] font-bold leading-tight"
                      style={{ color }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[14px] font-semibold text-text-primary leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                    <span className="text-[12px] text-text-muted leading-snug mt-1">
                      {item.desc}
                    </span>

                    {isNext && !status?.complete && (
                      <span
                        className="text-[11px] font-bold mt-1.5 inline-flex items-center gap-1"
                        style={{ color }}
                      >
                        👉 {t('learn_continue', lang)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
