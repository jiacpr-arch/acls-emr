import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import {
  HeartPulse, FileText, Sparkles, Pill, Menu,
  BarChart3, Activity, AlertTriangle, Trophy, BookOpen, GraduationCap,
  MessageSquare, Settings, X,
} from './ui/Icon';

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useSettingsStore(s => s.language) || 'en';
  const [showMore, setShowMore] = useState(false);

  const tabs = [
    { path: '/', Icon: HeartPulse, label: 'Home' },
    { path: '/history', Icon: FileText, label: t('history', lang) },
    { path: '/scenarios', Icon: Sparkles, label: t('scenarios', lang) },
    { path: '/drug-calc', Icon: Pill, label: t('drugs', lang) },
    { key: 'more', Icon: Menu, label: 'More' },
  ];

  const moreItems = [
    { path: '/statistics', Icon: BarChart3, label: t('statistics', lang) },
    { path: '/drill', Icon: Activity, label: t('drill', lang) },
    { path: '/sim', Icon: AlertTriangle, label: 'Code Sim' },
    { path: '/certification', Icon: Trophy, label: t('cert', lang) },
    { path: '/compare', Icon: BarChart3, label: 'Compare' },
    { path: '/algorithm', Icon: BookOpen, label: t('algorithms', lang) },
    { path: '/als', Icon: GraduationCap, label: t('als_knowledge', lang) },
    { path: '/guide', Icon: BookOpen, label: t('guide', lang) },
    { path: '/feedback', Icon: MessageSquare, label: t('feedback', lang) },
    { path: '/settings', Icon: Settings, label: t('settings', lang) },
  ];

  return (
    <>
      <div className="bottom-pill-bar">
        {tabs.map((tab) => {
          if (tab.key === 'more') {
            const TabIcon = tab.Icon;
            return (
              <button key="more" onClick={() => setShowMore(true)} className={showMore ? 'active' : ''}>
                <span className="tab-icon"><TabIcon size={20} strokeWidth={2} /></span>
                <span>{tab.label}</span>
              </button>
            );
          }
          const isActive = location.pathname === tab.path;
          const TabIcon = tab.Icon;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className={isActive ? 'active' : ''}>
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
            className="w-full max-w-lg bg-bg-secondary animate-slide-up"
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
              <div className="text-headline">More</div>
              <button onClick={() => setShowMore(false)}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 'var(--radius-full)' }}
                aria-label="Close">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-6 pt-2">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
