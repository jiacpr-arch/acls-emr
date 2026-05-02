import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../utils/i18n';
import {
  Wind, Search, FlaskConical, Menu, Activity, BarChart3,
  TrendingUp, AlertCircle, HeartPulse, X, User, Users,
  FileText, Phone, Camera, BookOpen, Stethoscope, AlertTriangle,
} from './ui/Icon';

export default function QuickBar({
  onPatient, onTeam, onVitals, onLabs, onEKG, onVent, onAirway, onHT, onCheatSheet,
  onSBAR, onComm, onIncident, onPhotoNote, onDebrief, onEndCase,
  onNoPulse, onUnresponsive, onEKGChanged, onROSC, isArrest, isPostROSC,
}) {
  const [showMore, setShowMore] = useState(false);
  const lang = useSettingsStore(s => s.language) || 'en';

  const moreItems = [
    { Icon: User, label: t('patient', lang), action: onPatient },
    { Icon: Users, label: t('team', lang), action: onTeam },
    { Icon: FlaskConical, label: t('labs', lang), action: onLabs },
    { Icon: Stethoscope, label: t('vent', lang), action: onVent },
    { Icon: BookOpen, label: t('ref', lang), action: onCheatSheet },
    { Icon: FileText, label: t('sbar', lang), action: onSBAR },
    { Icon: Phone, label: t('comm', lang), action: onComm },
    { Icon: FileText, label: t('report', lang), action: onIncident },
    { Icon: Camera, label: t('note', lang), action: onPhotoNote },
    { Icon: BarChart3, label: t('debrief', lang), action: onDebrief },
  ];

  return (
    <>
      {/* Main quick bar */}
      <div className="bottom-pill-bar" style={{ zIndex: 30 }}>
        {isArrest ? (
          <>
            <QuickBtn Icon={Wind} label={t('airway', lang)} onClick={onAirway} />
            <QuickBtn Icon={Search} label="H&T" onClick={onHT} />
            <QuickBtn Icon={FlaskConical} label={t('labs', lang)} onClick={onLabs} />
            <QuickBtn Icon={Menu} label="More" onClick={() => setShowMore(true)} />
            <QuickBtn Icon={X} label={t('end', lang)} onClick={onEndCase} danger />
          </>
        ) : isPostROSC ? (
          <>
            <QuickBtn Icon={Activity} label={t('vitals', lang)} onClick={onVitals} />
            <QuickBtn Icon={TrendingUp} label={t('ekg', lang)} onClick={onEKG} />
            <QuickBtn Icon={Stethoscope} label={t('vent', lang)} onClick={onVent} />
            <QuickBtn Icon={Menu} label="More" onClick={() => setShowMore(true)} />
            <QuickBtn Icon={X} label={t('end', lang)} onClick={onEndCase} danger />
          </>
        ) : (
          <>
            <QuickBtn Icon={Activity} label={t('vitals', lang)} onClick={onVitals} />
            <QuickBtn Icon={TrendingUp} label={t('ekg', lang)} onClick={onEKG} />
            <QuickBtn Icon={Wind} label={t('airway', lang)} onClick={onAirway} />
            <QuickBtn Icon={Menu} label="More" onClick={() => setShowMore(true)} />
            <QuickBtn Icon={X} label={t('end', lang)} onClick={onEndCase} danger />
          </>
        )}
      </div>

      {/* More menu — slide up bottom sheet */}
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
              maxHeight: '78vh',
              overflow: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom, 0)',
            }}
          >
            <div className="w-10 h-1 bg-bg-tertiary mx-auto mt-3 mb-1" style={{ borderRadius: 99 }} />
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <div className="text-headline">Quick actions</div>
              <button onClick={() => setShowMore(false)}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 99 }}
                aria-label="Close">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Status change */}
            <div className="px-4 mt-2">
              <div className="section-header">Status Change</div>
              <div className="grid grid-cols-2 gap-2">
                {!isArrest && onNoPulse && (
                  <button onClick={() => { onNoPulse(); setShowMore(false); }}
                    className="btn btn-danger btn-sm btn-block">
                    <AlertCircle size={14} strokeWidth={2.4} /> No Pulse → CPR
                  </button>
                )}
                {onUnresponsive && (
                  <button onClick={() => { onUnresponsive(); setShowMore(false); }}
                    className="btn btn-warning btn-sm btn-block">
                    <AlertTriangle size={14} strokeWidth={2.4} /> Unresponsive
                  </button>
                )}
                {onEKGChanged && (
                  <button onClick={() => { onEKGChanged(); setShowMore(false); }}
                    className="btn btn-primary btn-sm btn-block">
                    <TrendingUp size={14} strokeWidth={2.4} /> EKG Changed
                  </button>
                )}
                {isArrest && onROSC && (
                  <button onClick={() => { onROSC(); setShowMore(false); }}
                    className="btn btn-success btn-sm btn-block">
                    <HeartPulse size={14} strokeWidth={2.4} /> ROSC
                  </button>
                )}
              </div>
            </div>

            {/* Tools */}
            <div className="px-4 mt-4">
              <div className="section-header">Tools</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 px-4 pb-6">
              {moreItems.map((item, i) => {
                const ItemIcon = item.Icon;
                return (
                  <button key={i} onClick={() => { item.action(); setShowMore(false); }}
                    className="flex flex-col items-center gap-1.5 py-3 hover:bg-bg-tertiary transition-colors"
                    style={{ borderRadius: 'var(--radius-md)' }}>
                    <span className="w-9 h-9 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      <ItemIcon size={17} strokeWidth={2} />
                    </span>
                    <span className="text-[10px] font-semibold text-text-secondary">{item.label}</span>
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

function QuickBtn({ Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${danger ? '!text-danger' : ''}`}>
      <span className="tab-icon"><Icon size={20} strokeWidth={2} /></span>
      <span>{label}</span>
    </button>
  );
}
