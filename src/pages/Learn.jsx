import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronRight, ClipboardList, GraduationCap, Play,
  HeartPulse, BookOpen, Compass, Award, Brain, Trophy, Activity,
  MessageCircle, GitBranch, Target, Hospital, Zap, Siren,
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_BLS, IS_SKILL_COURSE, courseMeta } from '../config/courseMode';
import PageHero from '../components/PageHero';
import GameHighlightCard from '../components/GameHighlightCard';
import { useLearnPath } from '../hooks/useLearnPath';

export default function Learn() {
  const navigate = useNavigate();
  const lang = useSettingsStore(s => s.language) || 'en';
  // Progress logic ทั้งหมดอยู่ใน hook เดียวกับการ์ด "เรียนต่อ" บนหน้าแรก
  const { activeStudent, statusFor, next, done, total } = useLearnPath();

  // color: hex เดี่ยวต่อรายการ — น้ำเงินเป็นค่าหลัก, แดงเฉพาะ CPR/กู้ชีพ,
  // เหลืองทองเฉพาะรางวัล/ใบเซอร์; game: true = การ์ดไฮไลต์เกมพื้นเข้ม
  const sections = IS_BLS
    ? [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course/pre-test', Icon: ClipboardList, label: 'Pre-test', desc: 'วัดพื้นฐานก่อนเริ่มเรียน', color: '#7C3AED' },
            { path: '/pre-course', Icon: GraduationCap, label: t('pre_course', lang), desc: t('pre_course_desc', lang), color: '#2563EB', progressKey: 'lessons' },
            { path: '/video-lessons', Icon: Play, label: 'วิดีโอบทเรียน', desc: 'คลิปสั้น + สรุป + ควิซ', color: '#7C3AED', progressKey: 'video' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/skill-practice', Icon: HeartPulse, label: t('cpr_drill', lang), desc: t('cpr_drill_desc', lang), color: '#DC2626' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/bls/knowledge', Icon: BookOpen, label: 'คลังความรู้ BLS', desc: 'หนังสือ + Q&A เชิงลึก + AI Tips', color: '#2563EB' },
            { path: '/guide', Icon: Compass, label: t('guide', lang), desc: t('guide_desc', lang), color: '#059669' },
          ],
        },
        {
          title: t('learn_progress', lang),
          items: [
            { path: '/certification', Icon: Award, label: t('cert', lang), desc: t('cert_desc', lang), color: '#D97706', progressKey: 'cert' },
          ],
        },
      ]
    : IS_SKILL_COURSE
    ? [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course/pre-test',  Icon: ClipboardList, label: t('pre_test', lang), desc: t('pre_test_desc', lang), color: '#7C3AED', step: 1, featured: true, progressKey: 'preTest' },
            { path: '/pre-course',           Icon: GraduationCap, label: t('pre_course', lang), desc: t('pre_course_desc', lang), color: '#2563EB', step: 2, featured: true, progressKey: 'lessons' },
            { path: '/scenario',             Icon: Brain, label: 'เกมลำดับขั้น', desc: 'เดินตามลำดับขั้นตัดสินใจแบบมีเวลา', color: '#DC2626', step: 3, featured: true, progressKey: 'scenario' },
            { path: '/pre-course/post-test', Icon: Trophy, label: t('post_test', lang), desc: t('post_test_desc', lang), color: '#EA580C', step: 4, featured: true, progressKey: 'postTest' },
            { path: '/certification',        Icon: Award, label: t('cert', lang), desc: t('cert_desc', lang), color: '#D97706', featured: true, progressKey: 'cert' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/knowledge', Icon: BookOpen, label: `คลังความรู้ ${courseMeta.shortName}`, desc: 'หนังสือ + Q&A เชิงลึก', color: '#2563EB' },
            { path: '/guide',     Icon: Compass, label: t('guide', lang), desc: t('guide_desc', lang), color: '#059669' },
          ],
        },
      ]
    : [
        {
          title: t('learn_prepare', lang),
          items: [
            { path: '/pre-course/pre-test',  Icon: ClipboardList, label: t('pre_test', lang), desc: t('pre_test_desc', lang), color: '#7C3AED', step: 1, featured: true, progressKey: 'preTest' },
            { path: '/pre-course',           Icon: GraduationCap, label: t('pre_course', lang), desc: t('pre_course_desc', lang), color: '#2563EB', step: 2, featured: true, progressKey: 'lessons' },
            { path: '/als?tab=ekg',          Icon: Activity, label: t('ekg_quiz', lang), desc: t('ekg_quiz_desc', lang), color: '#DC2626', step: 3, featured: true, progressKey: 'ekg' },
            { path: '/video-lessons',        Icon: Play, label: t('video_lessons', lang), desc: t('video_lessons_desc', lang), color: '#7C3AED', step: 4, featured: true, progressKey: 'video' },
            { path: '/pre-course/post-test', Icon: Trophy, label: t('post_test', lang), desc: t('post_test_desc', lang), color: '#EA580C', step: 5, featured: true, progressKey: 'postTest' },
            { path: '/certification',        Icon: Award, label: t('cert', lang), desc: t('cert_desc', lang), color: '#D97706', featured: true, progressKey: 'cert' },
          ],
        },
        {
          title: t('learn_reference', lang),
          items: [
            { path: '/als',           Icon: BookOpen, label: t('als_knowledge', lang), desc: t('als_knowledge_desc', lang), color: '#2563EB' },
            { path: '/qa-acls-deep',  Icon: MessageCircle, label: t('qa_deep', lang), desc: t('qa_deep_desc', lang), color: '#0284C7' },
            { path: '/algorithm',     Icon: GitBranch, label: t('algorithms', lang), desc: t('algorithms_desc', lang), color: '#7C3AED' },
            { path: '/guide',         Icon: Compass, label: t('guide', lang), desc: t('guide_desc', lang), color: '#059669' },
          ],
        },
        {
          title: t('learn_practice', lang),
          items: [
            { path: '/sim',           Icon: Siren, label: t('code_sim', lang), desc: t('code_sim_desc', lang), color: '#DC2626', game: true },
            // เส้นทางผู้บันทึก: ขั้น 1 (ปุ่มจำลอง) มาก่อนขั้น 2 (หน้า Recording จริง)
            { path: '/recorder-game', Icon: Target, label: t('recorder_game', lang), desc: t('recorder_game_desc', lang), color: '#2563EB', game: true },
            { path: '/scenarios',     Icon: Hospital, label: t('scenarios', lang), desc: t('scenarios_desc', lang), color: '#D97706' },
            { path: '/drill',         Icon: Zap, label: t('drill', lang), desc: t('drill_desc', lang), color: '#EA580C' },
          ],
        },
      ];

  // ขั้นถัดไป + progress ของเส้นทางหลัก มาจาก hook (แชร์กับการ์ดเรียนต่อหน้าแรก)
  const nextStepPath = next?.path ?? null;
  const prepProgress = total > 0 ? { done, total } : null;

  return (
    <div className="page-container flex flex-col gap-4 pb-24">
      <PageHero title={t('learn', lang)} desc={t('learn_subtitle', lang)} />

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
            <div className="grid gap-2.5">
              {section.items.map(item => {
                const status = statusFor(item.progressKey);
                const isNext = item.path === nextStepPath;
                const { Icon, color } = item;

                // ทางเข้าเกม — การ์ดไฮไลต์พื้นเข้ม โดดจากการ์ดขาวรอบตัว
                if (item.game) {
                  return (
                    <GameHighlightCard
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      desc={item.desc}
                      Icon={Icon}
                    />
                  );
                }

                // สถานะฝั่งขวา: ผ่าน = เช็คเขียว, หน่วยหลายบท = ตัวนับ, มี tracking = วงกลมจาง
                const rightStatus = status?.complete ? (
                  <CheckCircle2 size={20} color="var(--color-success)" className="shrink-0" title={t('learn_passed', lang)} />
                ) : status?.total ? (
                  <span
                    className="text-2xs font-bold text-info bg-info/10 px-2 py-1 shrink-0"
                    style={{ borderRadius: 99 }}
                    aria-hidden="true"
                  >
                    {status.done}/{status.total}
                  </span>
                ) : status ? (
                  <Circle size={16} strokeWidth={2.2} className="text-text-muted shrink-0" title={t('learn_not_started', lang)} />
                ) : (
                  <ChevronRight size={18} className="text-text-muted shrink-0" />
                );

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="card card-hover w-full flex items-center gap-3.5"
                    style={{
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      ...(isNext && !status?.complete
                        ? { border: `1.5px solid ${color}`, boxShadow: `0 0 0 3px ${color}20` }
                        : null),
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, color }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-headline text-text-primary">
                        {item.step != null ? `${item.step}. ` : ''}{item.label}
                      </div>
                      <div className="text-caption text-text-muted">
                        {item.desc}
                        {isNext && !status?.complete && (
                          <span className="font-bold ml-1" style={{ color }}>
                            · {t('learn_continue', lang)}
                          </span>
                        )}
                      </div>
                    </div>
                    {rightStatus}
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
