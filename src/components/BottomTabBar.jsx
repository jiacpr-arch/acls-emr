import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import { IS_ACLS, IS_BLS, IS_SKILL_COURSE } from '../config/courseMode';
import {
  HeartPulse, FileText, Pill, Menu,
  BarChart3, GraduationCap, Users,
  MessageSquare, Settings, X, Award, Bell, Play,
  GitBranch, Zap, Wind, Brain, Gamepad2,
} from './ui/Icon';

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useSettingsStore(s => s.language) || 'en';
  const [showMore, setShowMore] = useState(false);
  const barRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const closeMenuRef = useRef(null);

  useLayoutEffect(() => {
    if (!(IS_ACLS || IS_BLS) || !showMore) return;
    const trigger = moreTriggerRef.current;
    closeMenuRef.current?.focus();
    return () => trigger?.focus();
  }, [showMore]);

  // รายงานความสูงจริงของ tab bar ผ่าน --tab-bar-h ให้ .above-tab-bar ใช้ยึดตำแหน่ง
  // ความสูงจริงต่างกันตามเครื่อง (font scale, safe-area, ป้ายไทยตัดบรรทัด) —
  // ค่า hard-code 68px เคยทำให้แถบปุ่ม "ถัดไป" ซ้อนทับปุ่ม More บนบางเครื่อง
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--tab-bar-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    // ต้อง border-box: safe-area inset มากับ padding ของ bar ซึ่ง content-box มองไม่เห็น
    ro.observe(el, { box: 'border-box' });
    return () => { ro.disconnect(); root.style.removeProperty('--tab-bar-h'); };
  }, []);

  const tabs = IS_ACLS
    ? [
        { path: '/', Icon: HeartPulse, label: 'หน้าแรก' },
        { path: '/learn', Icon: GraduationCap, label: 'เรียน' },
        { path: '/games', Icon: Gamepad2, label: 'ฝึก' },
        { path: '/history', Icon: FileText, label: 'ประวัติ' },
        { key: 'more', Icon: Menu, label: 'เมนู' },
      ]
    : IS_BLS
    ? [
        { path: '/', Icon: HeartPulse, label: 'หน้าแรก' },
        { path: '/learn', Icon: GraduationCap, label: 'เรียน' },
        { path: '/games', Icon: Gamepad2, label: 'ฝึกและเกม' },
        { path: '/history', Icon: FileText, label: 'ประวัติ' },
        { key: 'more', Icon: Menu, label: 'เมนู' },
      ]
    : IS_SKILL_COURSE
    ? [
        { path: '/', Icon: GraduationCap, label: 'เรียน' },
        { path: '/knowledge', Icon: Brain, label: 'คลังความรู้' },
        { path: '/scenario', Icon: Gamepad2, label: 'เกม' },
        { path: '/certification', Icon: Award, label: 'ใบเซอร์' },
        { key: 'more', Icon: Menu, label: 'More' },
      ]
    : [
        { path: '/', Icon: HeartPulse, label: 'Home' },
        { path: '/history', Icon: FileText, label: t('history', lang) },
        { path: '/learn', Icon: GraduationCap, label: t('learn', lang) },
        { path: '/games', Icon: Gamepad2, label: t('games', lang) },
        { key: 'more', Icon: Menu, label: 'More' },
      ];

  const moreItems = IS_ACLS
    ? [
        { group: 'เรียนรู้', path: '/learn', Icon: GraduationCap, label: 'เส้นทางเรียน' },
        { group: 'เรียนรู้', path: '/video-lessons', Icon: Play, label: 'วิดีโอบทเรียน' },
        { group: 'เรียนรู้', path: '/qa-acls-deep', Icon: MessageSquare, label: 'Q&A เชิงลึก' },
        { group: 'เรียนรู้', path: '/certification', Icon: Award, label: 'ใบประกาศ' },
        { group: 'ฝึกทักษะ', path: '/sim', Icon: HeartPulse, label: 'Code Blue Sim' },
        { group: 'ฝึกทักษะ', path: '/recorder-game', Icon: FileText, label: 'ซ้อมบันทึก' },
        { group: 'ฝึกทักษะ', path: '/scenarios', Icon: Brain, label: 'สอบสนามจริง' },
        { group: 'ฝึกทักษะ', path: '/drill', Icon: Zap, label: 'Drill Timer' },
        { group: 'เครื่องมือ', path: '/algorithm', Icon: GitBranch, label: 'Algorithms' },
        { group: 'เครื่องมือ', path: '/drug-calc', Icon: Pill, label: 'คำนวณยา' },
        { group: 'เครื่องมือ', path: '/statistics', Icon: BarChart3, label: 'สถิติเคส' },
        { group: 'เครื่องมือ', path: '/compare', Icon: BarChart3, label: 'เปรียบเทียบเคส' },
        { group: 'จัดการ', path: '/pre-course/cohort', Icon: Users, label: 'สำหรับอาจารย์' },
        { group: 'จัดการ', path: '/guide', Icon: FileText, label: 'คู่มือ' },
        { group: 'จัดการ', path: '/news', Icon: Bell, label: 'ข่าวสาร' },
        { group: 'จัดการ', path: '/settings', Icon: Settings, label: 'ตั้งค่า' },
        { group: 'จัดการ', path: '/feedback', Icon: MessageSquare, label: 'ความคิดเห็น' },
      ]
    : IS_BLS
    ? [
        { group: 'เรียนรู้', path: '/learn', Icon: GraduationCap, label: 'เส้นทางเรียน' },
        { group: 'เรียนรู้', path: '/pre-course', Icon: GraduationCap, label: 'บทเรียน BLS' },
        { group: 'เรียนรู้', path: '/video-lessons', Icon: Play, label: 'วิดีโอบทเรียน' },
        { group: 'เรียนรู้', path: '/bls/knowledge', Icon: Brain, label: 'คลังความรู้ BLS' },
        { group: 'เรียนรู้', path: '/qa-deep', Icon: MessageSquare, label: 'ถามตอบเชิงลึก' },
        { group: 'เรียนรู้', path: '/certification', Icon: Award, label: 'ใบประกาศนียบัตร' },
        { group: 'ฝึกทักษะ', path: '/games', Icon: Gamepad2, label: 'รวมการฝึกและเกม' },
        { group: 'ฝึกทักษะ', path: '/skill-practice', Icon: HeartPulse, label: 'ฝึก CPR' },
        { group: 'ฝึกทักษะ', path: '/bls/scenario', Icon: Brain, label: 'เกมลำดับขั้น' },
        { group: 'ฝึกทักษะ', path: '/recorder-game', Icon: FileText, label: 'ฝึกบันทึกเคส' },
        { group: 'ฝึกทักษะ', path: '/scenarios', Icon: FileText, label: 'สอบสนามจริง' },
        { group: 'เครื่องมือ', path: '/bls/algorithm', Icon: GitBranch, label: 'ผังช่วยชีวิต' },
        { group: 'เครื่องมือ', path: '/bls/aed', Icon: Zap, label: 'การใช้ AED' },
        { group: 'เครื่องมือ', path: '/bls/choking', Icon: Wind, label: 'ช่วยผู้สำลัก' },
        { group: 'เครื่องมือ', path: '/drill', Icon: Zap, label: 'จับเวลาฝึก' },
        { group: 'เครื่องมือ', path: '/statistics', Icon: BarChart3, label: 'สถิติเคส' },
        { group: 'เครื่องมือ', path: '/compare', Icon: BarChart3, label: 'เปรียบเทียบเคส' },
        { group: 'จัดการ', path: '/pre-course/cohort', Icon: Users, label: 'สำหรับอาจารย์' },
        { group: 'จัดการ', path: '/guide', Icon: FileText, label: 'คู่มือใช้งาน' },
        { group: 'จัดการ', path: '/news', Icon: Bell, label: 'ข่าวสาร' },
        { group: 'จัดการ', path: '/feedback', Icon: MessageSquare, label: 'ความคิดเห็น' },
        { group: 'จัดการ', path: '/settings', Icon: Settings, label: 'ตั้งค่า' },
      ]
    : IS_SKILL_COURSE
    ? [
        { path: '/learn', Icon: GraduationCap, label: t('learn', lang) },
        { path: '/pre-course/cohort', Icon: Users, label: 'สำหรับอาจารย์' },
        { path: '/guide', Icon: FileText, label: t('guide', lang) },
        { path: '/news', Icon: Bell, label: 'ข่าว' },
        { path: '/feedback', Icon: MessageSquare, label: t('feedback', lang) },
        { path: '/settings', Icon: Settings, label: t('settings', lang) },
      ]
    : [
        { path: '/drug-calc', Icon: Pill, label: 'คำนวณยา' },
        { path: '/pre-course/cohort', Icon: Users, label: 'สำหรับอาจารย์' },
        { path: '/statistics', Icon: BarChart3, label: t('statistics', lang) },
        { path: '/compare', Icon: BarChart3, label: 'Compare' },
        { path: '/news', Icon: Bell, label: 'ข่าว' },
        { path: '/feedback', Icon: MessageSquare, label: t('feedback', lang) },
        { path: '/settings', Icon: Settings, label: t('settings', lang) },
      ];

  return (
    <>
      <div className="bottom-pill-bar" ref={barRef}>
        {tabs.map((tab) => {
          if (tab.key === 'more') {
            const TabIcon = tab.Icon;
            return (
              <button key="more" ref={moreTriggerRef} aria-expanded={showMore} onClick={() => setShowMore(true)} className={showMore ? 'active' : ''}>
                <span className="tab-icon"><TabIcon size={20} strokeWidth={2} /></span>
                <span>{tab.label}</span>
              </button>
            );
          }
          const path = location.pathname;
          const isActive = path === tab.path || (IS_BLS && (
            (tab.path === '/learn' && ['/pre-course', '/video-lessons', '/qa-deep', '/certification', '/bls/knowledge'].some(prefix => path === prefix || path.startsWith(prefix + '/'))) ||
            (tab.path === '/games' && ['/skill-practice', '/bls/scenario', '/recorder-game', '/scenarios', '/drill', '/sim-board'].some(prefix => path === prefix || path.startsWith(prefix + '/')))
          ));
          const TabIcon = tab.Icon;
          return (
            <button key={tab.path} aria-current={isActive ? 'page' : undefined} onClick={() => navigate(tab.path)} className={isActive ? 'active' : ''}>
              <span className="tab-icon"><TabIcon size={20} strokeWidth={isActive ? 2.4 : 2} /></span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* More menu */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMore(false)}>
          <div
            className={`w-full max-w-lg bg-bg-secondary animate-slide-up ${IS_ACLS ? 'acls-more-sheet' : IS_BLS ? 'bls-more-sheet' : ''}`}
            role={IS_ACLS || IS_BLS ? 'dialog' : undefined}
            aria-modal={IS_ACLS || IS_BLS ? true : undefined}
            aria-labelledby={IS_ACLS || IS_BLS ? 'acls-menu-title' : undefined}
            onKeyDown={IS_ACLS || IS_BLS ? e => {
              if (e.key === 'Escape') { e.preventDefault(); setShowMore(false); }
              if (e.key === 'Tab') {
                const buttons = e.currentTarget.querySelectorAll('button:not([disabled])');
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
              }
            } : undefined}
            onClick={e => e.stopPropagation()}
            style={{
              borderTopLeftRadius: 'var(--radius-3xl)',
              borderTopRightRadius: 'var(--radius-3xl)',
              boxShadow: 'var(--shadow-pop)',
              paddingBottom: 'env(safe-area-inset-bottom, 0)',
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-bg-tertiary mx-auto mt-3 mb-1" style={{ borderRadius: 99 }} />
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div id="acls-menu-title" className="text-headline">{IS_ACLS ? 'เมนู ACLS' : IS_BLS ? 'เมนู BLS' : 'More'}</div>
              <button ref={closeMenuRef} onClick={() => setShowMore(false)}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 'var(--radius-full)' }}
                aria-label="Close">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            {IS_ACLS || IS_BLS ? (
              <div className="acls-more-body">
                {['เรียนรู้', 'ฝึกทักษะ', 'เครื่องมือ', 'จัดการ'].map(group => (
                  <section key={group} className="acls-menu-group" aria-label={group}>
                    <h2>{group}</h2>
                    <div>
                      {moreItems.filter(item => item.group === group).map(item => {
                        const ItemIcon = item.Icon;
                        return <button key={item.path} onClick={() => { navigate(item.path); setShowMore(false); }} className={location.pathname === item.path ? 'is-active' : ''}><ItemIcon size={18} /><span>{item.label}</span></button>;
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : <div className="grid grid-cols-3 gap-2 px-4 pb-6 pt-2">
              {moreItems.map(item => {
                const ItemIcon = item.Icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowMore(false); }}
                    className={`flex flex-col items-center gap-2 py-4 transition-colors ${
                      active
                        ? 'bg-info/10 text-info'
                        : 'hover:bg-bg-tertiary text-text-secondary'
                    }`}
                    style={{ borderRadius: 'var(--radius-lg)' }}
                  >
                    <span className={`w-10 h-10 inline-flex items-center justify-center ${
                      active ? 'bg-info/15' : 'bg-bg-tertiary'
                    }`} style={{ borderRadius: 'var(--radius-md)' }}>
                      <ItemIcon size={20} strokeWidth={2} />
                    </span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>}
          </div>
        </div>
      )}
    </>
  );
}
