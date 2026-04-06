import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { reversibleCauses } from '../data/hs-and-ts';

// Enhanced H's & T's panel — with treatment recommendations + correction tracking
// Available from ALL pathways
export default function ReversibleCausesPanel({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [selectedCause, setSelectedCause] = useState(null);
  const [corrected, setCorrected] = useState(new Set());

  const handleSelect = (cause, category) => {
    setSelectedCause({ ...cause, category });
    addEvent({
      elapsed,
      category: 'other',
      type: `🔍 Suspected cause: ${cause.name}`,
      details: { cause: cause.name, category },
    });
  };

  const handleCorrection = (cause, treatment) => {
    setCorrected(prev => new Set(prev).add(cause.name));
    addEvent({
      elapsed,
      category: 'other',
      type: `✅ Corrected: ${cause.name} → ${treatment}`,
      details: { cause: cause.name, treatment },
    });
    setSelectedCause(null);
  };

  // Treatment detail view
  if (selectedCause) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
          <span className="font-bold text-text-primary">🔍 {selectedCause.name}</span>
          <button onClick={() => setSelectedCause(null)} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">← Back</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="glass-card !p-4">
            <div className="text-sm font-bold text-text-primary mb-1">Signs & Symptoms</div>
            <div className="text-xs text-text-secondary">{selectedCause.signs}</div>
          </div>

          <div className="glass-card !p-4">
            <div className="text-sm font-bold text-success mb-2">Recommended Treatment</div>
            <div className="text-xs text-text-primary font-medium mb-3">{selectedCause.treatment}</div>

            {/* Quick correction buttons */}
            <div className="space-y-2">
              {getCorrectionActions(selectedCause.name).map((action, i) => (
                <button key={i} onClick={() => handleCorrection(selectedCause, action)}
                  className="w-full btn-action btn-success py-3 text-sm text-left px-4">
                  ✅ {action}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setSelectedCause(null)}
            className="w-full btn-action btn-ghost py-3 text-sm">
            ← Back to H's & T's
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">🔍 Reversible Causes (H's & T's)</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* H's */}
          <div>
            <div className="text-[10px] font-bold text-info mb-2 uppercase">H's</div>
            {reversibleCauses.hs.map((c, i) => (
              <button key={i} onClick={() => handleSelect(c, 'H')}
                className={`w-full glass-card !p-3 mb-2 text-left transition-colors ${
                  corrected.has(c.name) ? '!border-success/40 bg-success/5' : ''
                }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-text-primary">{c.name}</div>
                  {corrected.has(c.name) && <span className="text-success text-xs">✅</span>}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{c.signs}</div>
                <div className="text-[10px] text-info mt-0.5 font-medium">→ {c.treatment}</div>
              </button>
            ))}
          </div>

          {/* T's */}
          <div>
            <div className="text-[10px] font-bold text-danger mb-2 uppercase">T's</div>
            {reversibleCauses.ts.map((c, i) => (
              <button key={i} onClick={() => handleSelect(c, 'T')}
                className={`w-full glass-card !p-3 mb-2 text-left transition-colors ${
                  corrected.has(c.name) ? '!border-success/40 bg-success/5' : ''
                }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-text-primary">{c.name}</div>
                  {corrected.has(c.name) && <span className="text-success text-xs">✅</span>}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{c.signs}</div>
                <div className="text-[10px] text-danger mt-0.5 font-medium">→ {c.treatment}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Correction actions per cause
function getCorrectionActions(causeName) {
  const actions = {
    'Hypovolemia': ['IV Fluid Bolus (NSS/LR)', 'Blood Transfusion', 'Control Bleeding'],
    'Hypoxia': ['Oxygen 100%', 'BVM Ventilation', 'Intubation'],
    'Hydrogen ion (Acidosis)': ['NaHCO₃ 1mEq/kg IV', 'Increase Ventilation'],
    'Hypo/Hyperkalemia': ['Ca Gluconate 10% 10ml IV', 'NaHCO₃ 1mEq/kg IV', 'Glucose + RI', 'K Replacement (if hypo)'],
    'Hypothermia': ['Warm IV Fluid', 'Warm Blanket', 'Active Rewarming'],
    'Tension Pneumothorax': ['Needle Decompression (2nd ICS MCL)', 'Chest Tube'],
    'Tamponade': ['Pericardiocentesis', 'Echo/Ultrasound', 'Thoracotomy'],
    'Toxins/OD': ['Naloxone (Opioid)', 'NaHCO₃ (TCA)', 'Lipid Emulsion', 'Specific Antidote'],
    'Thrombosis (PE/MI)': ['Anticoagulation', 'Fibrinolytic (tPA)', 'PCI/Thrombectomy'],
  };
  return actions[causeName] || ['Treated — specific intervention'];
}
