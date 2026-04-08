import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';

// Quick Action Bar — 5 main buttons + More menu
// Replaces the 13-button floating bar
export default function QuickBar({
  onPatient, onTeam, onVitals, onLabs, onEKG, onVent, onCheatSheet,
  onSBAR, onComm, onIncident, onPhotoNote, onDebrief, onEndCase,
}) {
  const [showMore, setShowMore] = useState(false);
  const lang = useSettingsStore(s => s.language) || 'en';

  const moreItems = [
    { icon: '👤', label: t('patient', lang), action: onPatient },
    { icon: '👥', label: t('team', lang), action: onTeam },
    { icon: '🔬', label: t('labs', lang), action: onLabs },
    { icon: '🖥️', label: t('vent', lang), action: onVent },
    { icon: '📖', label: t('ref', lang), action: onCheatSheet },
    { icon: '📋', label: t('sbar', lang), action: onSBAR },
    { icon: '📞', label: t('comm', lang), action: onComm },
    { icon: '📄', label: t('report', lang), action: onIncident },
    { icon: '📸', label: t('note', lang), action: onPhotoNote },
    { icon: '📊', label: t('debrief', lang), action: onDebrief },
  ];

  return (
    <>
      {/* Main quick bar — pill style */}
      <div className="bottom-pill-bar" style={{ zIndex: 30 }}>
        <QuickBtn icon="📊" label={t('vitals', lang)} onClick={onVitals} />
        <QuickBtn icon="📈" label={t('ekg', lang)} onClick={onEKG} />
        <QuickBtn icon="🫁" label={t('airway', lang)} onClick={() => { /* handled via pathway */ }} />
        <QuickBtn icon="≡" label="More" onClick={() => setShowMore(true)} />
        <QuickBtn icon="🏁" label={t('end', lang)} onClick={onEndCase} danger />
      </div>

      {/* More menu — slide up */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowMore(false)}>
          <div className="w-full max-w-lg bg-bg-secondary rounded-t-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '60vh' }}>
            <div className="w-10 h-1 bg-bg-tertiary rounded-full mx-auto mt-2 mb-3" />
            <div className="grid grid-cols-4 gap-1 px-4 pb-6">
              {moreItems.map((item, i) => (
                <button key={i} onClick={() => { item.action(); setShowMore(false); }}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl hover:bg-bg-primary active:bg-bg-tertiary/50 transition-colors">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-semibold text-text-secondary">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${
        danger ? '!text-red-400' : ''
      }`}>
      <span className="tab-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
