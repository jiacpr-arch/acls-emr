import { HeartPulse, Search, Syringe, Wind, Zap } from 'lucide-react';

// ==========================================
// Recorder Hero — โคลนหน้า CPR Dashboard (ปุ่มหลักตอน arrest)
// มิเรอร์ layout จาก src/components/CPRDashboard.jsx แต่ยิง onPress(buttonId)
// ไม่มี store/timer ใดๆ — ค่าตัวเลขรับผ่าน props
// ==========================================
export default function GameCprDashboard({ onPress, highlightId, scene = {}, cycleLabel }) {
  const ring = (id) =>
    highlightId === id ? 'ring-4 ring-info ring-offset-2 animate-pulse rounded-lg' : '';

  return (
    <div className="text-center space-y-3">
      {/* Header: สรุปสถานะ (static mirror) */}
      <div className="dash-card !py-2.5 !px-4 flex items-center justify-between">
        <div className="text-left">
          <div className="text-3xs text-text-muted font-bold uppercase tracking-wider">Total Duration</div>
          <div className="text-numeric text-2xl text-text-primary tracking-tight">{cycleLabel || '--:--'}</div>
        </div>
        <div className="flex gap-2">
          <div className="stat-box !p-2 min-w-[58px]">
            <div className="stat-value text-lg text-success">{scene.etco2 ?? '--'}</div>
            <div className="stat-label">EtCO₂</div>
          </div>
          <div className="stat-box !p-2 min-w-[58px]">
            <div className="stat-value text-lg text-shock">{scene.shockCount ?? 0}</div>
            <div className="stat-label">Shocks</div>
          </div>
        </div>
      </div>

      {/* Main action row: ROSC + Check Rhythm */}
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => onPress('rosc')} className={`btn btn-outline-success btn-lg btn-block ${ring('rosc')}`}>
          <HeartPulse size={16} strokeWidth={2.4} /> ROSC
        </button>
        <button onClick={() => onPress('check_rhythm')} className={`btn btn-lg btn-block btn-ghost ${ring('check_rhythm')}`}>
          <Search size={16} strokeWidth={2.2} /> Check Rhythm
        </button>
      </div>

      {/* Shock — ปุ่มเด่น (มิเรอร์ ShockModal energy) */}
      <button onClick={() => onPress('shock')}
        className={`w-full btn-action btn-shock py-4 text-lg font-black ${scene.defibCharged ? 'animate-pulse' : ''} ${ring('shock')}`}>
        <Zap size={18} strokeWidth={2.4} className="inline align-text-bottom" /> Shock (Defibrillate)
      </button>

      {/* Secondary action row: Drug / Airway / H&T */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onPress('drug')} className={`btn btn-block btn-ghost ${ring('drug')}`}>
          <Syringe size={14} strokeWidth={2.2} /> Drug
        </button>
        <button onClick={() => onPress('airway')} className={`btn btn-ghost btn-block ${ring('airway')}`}>
          <Wind size={14} strokeWidth={2.2} /> Airway
        </button>
        <button onClick={() => onPress('ht')} className={`btn btn-ghost btn-block ${ring('ht')}`}>
          <Search size={14} strokeWidth={2.2} /> H&T
        </button>
      </div>
    </div>
  );
}
