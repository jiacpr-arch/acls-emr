import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';

// Quick Action Bar — pill style + More menu with status buttons
export default function QuickBar({
  onPatient, onTeam, onVitals, onLabs, onEKG, onVent, onAirway, onCheatSheet,
  onSBAR, onComm, onIncident, onPhotoNote, onDebrief, onEndCase,
  // Status actions (merged from FloatingStatus)
  onNoPulse, onUnresponsive, onEKGChanged, onROSC, isArrest,
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
        <QuickBtn icon="🫁" label={t('airway', lang)} onClick={onAirway} />
        <QuickBtn icon="≡" label="More" onClick={() => setShowMore(true)} />
        <QuickBtn icon="🏁" label={t('end', lang)} onClick={onEndCase} danger />
      </div>

      {/* More menu — slide up */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowMore(false)}>
          <div className="w-full max-w-lg bg-bg-secondary rounded-t-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '70vh', overflow: 'auto' }}>
            <div className="w-10 h-1 bg-bg-tertiary rounded-full mx-auto mt-2 mb-3" />

            {/* Emergency status buttons */}
            <div className="px-4 mb-3">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Status Change</div>
              <div className="grid grid-cols-2 gap-2">
                {!isArrest && onNoPulse && (
                  <button onClick={() => { onNoPulse(); setShowMore(false); }}
                    className="btn btn-danger btn-sm btn-block">🔴 No Pulse → CPR</button>
                )}
                {onUnresponsive && (
                  <button onClick={() => { onUnresponsive(); setShowMore(false); }}
                    className="btn btn-warning btn-sm btn-block">😵 Unresponsive</button>
                )}
                {onEKGChanged && (
                  <button onClick={() => { onEKGChanged(); setShowMore(false); }}
                    className="btn btn-primary btn-sm btn-block">📈 EKG Changed</button>
                )}
                {isArrest && onROSC && (
                  <button onClick={() => { onROSC(); setShowMore(false); }}
                    className="btn btn-success btn-sm btn-block">💚 ROSC</button>
                )}
              </div>
            </div>

            {/* Tools */}
            <div className="px-4 mb-2">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Tools</div>
            </div>
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
