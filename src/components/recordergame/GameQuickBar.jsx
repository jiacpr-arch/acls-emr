import { useState } from 'react';
import {
  Wind, Search, FlaskConical, Menu, Activity, TrendingUp,
  AlertCircle, HeartPulse, X, AlertTriangle,
} from '../ui/Icon';

// ==========================================
// Recorder Hero — โคลน QuickBar (แถบปุ่มล่าง) โหมด arrest + More sheet
// มิเรอร์ src/components/QuickBar.jsx เป๊ะ แต่ยิง onPress(buttonId)
// highlightId: ใส่วงแหวน pulse บนปุ่มเป้าหมาย (โหมด hunt) — เปิด More ให้ด้วยถ้าปุ่มอยู่ใน sheet
// ==========================================
const MORE_BUTTONS = ['no_pulse', 'unresponsive', 'ekg_changed', 'rosc'];

export default function GameQuickBar({ onPress, highlightId, forceMoreOpen = false }) {
  const [showMore, setShowMore] = useState(forceMoreOpen);
  const ring = (id) => (highlightId === id ? 'ring-4 ring-info animate-pulse' : '');
  const moreNeedsAttention = MORE_BUTTONS.includes(highlightId);

  return (
    <>
      {/* Main quick bar (arrest mode) */}
      <div className="bottom-pill-bar" style={{ zIndex: 30 }}>
        <QuickBtn Icon={Wind} label="Airway" onClick={() => onPress('airway')} className={ring('airway')} />
        <QuickBtn Icon={Search} label="H&T" onClick={() => onPress('ht')} className={ring('ht')} />
        <QuickBtn Icon={FlaskConical} label="Labs" onClick={() => onPress('labs')} className={ring('labs')} />
        <QuickBtn Icon={Menu} label="More" onClick={() => setShowMore(true)}
          className={moreNeedsAttention ? 'ring-4 ring-info animate-pulse' : ''} />
        <QuickBtn Icon={X} label="End" onClick={() => onPress('end_case')} danger className={ring('end_case')} />
      </div>

      {/* More menu — slide up bottom sheet */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMore(false)}>
          <div className="w-full max-w-lg bg-bg-secondary animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              borderTopLeftRadius: 'var(--radius-3xl)',
              borderTopRightRadius: 'var(--radius-3xl)',
              boxShadow: 'var(--shadow-pop)',
              maxHeight: '78vh', overflow: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom, 0)',
            }}>
            <div className="w-10 h-1 bg-bg-tertiary mx-auto mt-3 mb-1" style={{ borderRadius: 99 }} />
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <div className="text-headline">Quick actions</div>
              <button onClick={() => setShowMore(false)}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 99 }} aria-label="Close">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Status change */}
            <div className="px-4 mt-2">
              <div className="section-header">Status Change</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onPress('no_pulse'); setShowMore(false); }}
                  className={`btn btn-danger btn-sm btn-block ${ring('no_pulse')}`}>
                  <AlertCircle size={14} strokeWidth={2.4} /> No Pulse → CPR
                </button>
                <button onClick={() => { onPress('unresponsive'); setShowMore(false); }}
                  className={`btn btn-warning btn-sm btn-block ${ring('unresponsive')}`}>
                  <AlertTriangle size={14} strokeWidth={2.4} /> Unresponsive
                </button>
                <button onClick={() => { onPress('ekg_changed'); setShowMore(false); }}
                  className={`btn btn-primary btn-sm btn-block ${ring('ekg_changed')}`}>
                  <TrendingUp size={14} strokeWidth={2.4} /> EKG Changed
                </button>
                <button onClick={() => { onPress('rosc'); setShowMore(false); }}
                  className={`btn btn-success btn-sm btn-block ${ring('rosc')}`}>
                  <HeartPulse size={14} strokeWidth={2.4} /> ROSC
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="px-4 mt-4">
              <div className="section-header">Tools</div>
              <div className="grid grid-cols-4 gap-1.5 pb-6">
                {[
                  { id: 'vitals', Icon: Activity, label: 'Vitals' },
                  { id: 'ekg', Icon: TrendingUp, label: 'EKG' },
                  { id: 'labs', Icon: FlaskConical, label: 'Labs' },
                  { id: 'airway', Icon: Wind, label: 'Airway' },
                ].map((item) => {
                  const ItemIcon = item.Icon;
                  return (
                    <button key={item.id} onClick={() => { onPress(item.id); setShowMore(false); }}
                      className="flex flex-col items-center gap-1.5 py-3 hover:bg-bg-tertiary transition-colors"
                      style={{ borderRadius: 'var(--radius-md)' }}>
                      <span className="w-9 h-9 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
                        style={{ borderRadius: 'var(--radius-sm)' }}>
                        <ItemIcon size={17} strokeWidth={2} />
                      </span>
                      <span className="text-3xs font-semibold text-text-secondary">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickBtn({ Icon, label, onClick, danger, className = '' }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${danger ? '!text-danger' : ''} ${className}`}>
      <span className="tab-icon"><Icon size={20} strokeWidth={2} /></span>
      <span>{label}</span>
    </button>
  );
}
