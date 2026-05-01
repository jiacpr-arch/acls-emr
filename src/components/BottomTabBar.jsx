import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';

// Bottom Tab Bar — 5 main tabs + More
export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useSettingsStore(s => s.language) || 'en';
  const [showMore, setShowMore] = useState(false);

  const tabs = [
    { path: '/', icon: '🫀', label: 'Home' },
    { path: '/history', icon: '📋', label: t('history', lang) },
    { path: '/scenarios', icon: '🎮', label: t('scenarios', lang) },
    { path: '/drug-calc', icon: '💊', label: t('drugs', lang) },
    { key: 'more', icon: '≡', label: 'More' },
  ];

  const moreItems = [
    { path: '/statistics', icon: '📊', label: t('statistics', lang) },
    { path: '/drill', icon: '🏋️', label: t('drill', lang) },
    { path: '/sim', icon: '🚨', label: 'Code Sim' },
    { path: '/certification', icon: '🏆', label: t('cert', lang) },
    { path: '/compare', icon: '📊', label: 'Compare' },
    { path: '/algorithm', icon: '📖', label: t('algorithms', lang) },
    { path: '/als', icon: '📚', label: t('als_knowledge', lang) },
    { path: '/guide', icon: '📗', label: t('guide', lang) },
    { path: '/feedback', icon: '💬', label: t('feedback', lang) },
    { path: '/settings', icon: '⚙️', label: t('settings', lang) },
  ];

  return (
    <>
      <div className="bottom-pill-bar">
        {tabs.map((tab) => {
          if (tab.key === 'more') {
            return (
              <button key="more" onClick={() => setShowMore(true)} className={showMore ? 'active' : ''}>
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          }
          const isActive = location.pathname === tab.path;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className={isActive ? 'active' : ''}>
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* More menu */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowMore(false)}>
          <div className="w-full max-w-lg bg-bg-secondary rounded-t-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
            <div className="w-10 h-1 bg-bg-tertiary rounded-full mx-auto mt-2 mb-3" />
            <div className="grid grid-cols-3 gap-1 px-4 pb-6">
              {moreItems.map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setShowMore(false); }}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-xl transition-colors ${
                    location.pathname === item.path ? 'bg-info/10 text-info' : 'hover:bg-bg-primary text-text-secondary'
                  }`}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
