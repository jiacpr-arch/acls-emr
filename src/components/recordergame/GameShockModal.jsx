import { playShockSound } from '../../utils/sound';
import { ENERGY_CHOICES } from '../../data/recorderGameLevels';
import { Zap, X } from 'lucide-react';

// ==========================================
// Recorder Hero — โคลน ShockModal + energy picker
// ให้ผู้เล่นเลือกพลังงานเอง (ตอบผิดได้) — onDeliver(energy)
// ==========================================
export default function GameShockModal({ onDeliver, onClose, energyChoices }) {
  const choices = energyChoices && energyChoices.length ? energyChoices : ENERGY_CHOICES;
  const fire = (energy) => {
    playShockSound();
    onDeliver(energy);
  };
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-2xl border-t border-bg-tertiary p-4 space-y-3 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary inline-flex items-center gap-2">
            <Zap size={16} strokeWidth={2.4} /> เลือกพลังงาน Shock (Biphasic)
          </span>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm"><X size={16} /></button>
        </div>
        <div className="text-2xs text-text-muted">Shock แรก 120J → ครั้งถัดไป 200J</div>
        <div className="grid grid-cols-3 gap-2">
          {choices.map(e => (
            <button key={e} onClick={() => fire(e)}
              className="btn-action btn-shock py-4 text-lg font-black">
              {e}J
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
