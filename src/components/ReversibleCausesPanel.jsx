import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { reversibleCauses } from '../data/hs-and-ts';

// Enhanced H's & T's panel — with treatment recommendations + correction tracking
// Available from ALL pathways
export default function ReversibleCausesPanel({ onClose, onOpenAirway, onOpenLabs }) {
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

            {/* Quick correction buttons — each logs + does the action */}
            <div className="space-y-2">
              {getCorrectionActions(selectedCause.name).map((action, i) => (
                <button key={i} onClick={() => handleCorrection(selectedCause, action.label)}
                  className="w-full btn-action btn-success py-3 text-sm text-left px-4">
                  ✅ {action.label}
                  {action.detail && <div className="text-[10px] font-normal opacity-80 mt-0.5">{action.detail}</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Open relevant panel */}
          {selectedCause.name === 'Hypoxia' && onOpenAirway && (
            <button onClick={onOpenAirway} className="w-full btn-action btn-info py-3 text-sm font-bold">
              🫁 Open Airway Panel → Fix Now
            </button>
          )}
          {(selectedCause.name === 'Hypo/Hyperkalemia' || selectedCause.name === 'Hydrogen ion (Acidosis)') && onOpenLabs && (
            <button onClick={onOpenLabs} className="w-full btn-action btn-info py-3 text-sm font-bold">
              🔬 Open Labs Panel → Check Values
            </button>
          )}

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
    'Hypovolemia': [
      { label: 'IV Fluid Bolus (NSS 1000ml)', detail: 'Wide open IV → reassess after 500ml' },
      { label: 'Blood Transfusion', detail: 'Type & cross → pRBC if Hb low' },
      { label: 'Control Bleeding', detail: 'Direct pressure / tourniquet / surgery' },
    ],
    'Hypoxia': [
      { label: 'BVM + O₂ 100%', detail: 'Bag-valve-mask with 15L O₂' },
      { label: 'Intubation (ETT/SGA)', detail: 'Secure airway → confirm with EtCO₂' },
      { label: 'Check ETT position', detail: 'May be displaced → auscultate both lungs' },
    ],
    'Hydrogen ion (Acidosis)': [
      { label: 'NaHCO₃ 1mEq/kg IV', detail: 'Slow push. Flush before/after Ca' },
      { label: 'Increase Ventilation', detail: 'Increase RR to blow off CO₂' },
    ],
    'Hypo/Hyperkalemia': [
      { label: 'Ca Gluconate 10% 10-20ml IV', detail: 'Slow 2-5min + ECG monitoring. Stabilize membrane' },
      { label: 'NaHCO₃ 1mEq/kg IV', detail: 'Shift K+ intracellular' },
      { label: 'Glucose 50% 50ml + RI 10u IV', detail: 'Shift K+ intracellular' },
      { label: 'K Replacement (if hypo)', detail: 'KCl 10-20 mEq/hr IV. Max 40mEq/hr via central' },
    ],
    'Hypothermia': [
      { label: 'Warm IV Fluid (38-42°C)', detail: 'NSS/LR warmed' },
      { label: 'Warm Blanket / Bair Hugger', detail: 'Active external rewarming' },
      { label: 'Active Core Rewarming', detail: 'Warm lavage / ECMO if severe' },
    ],
    'Tension Pneumothorax': [
      { label: 'Needle Decompression', detail: '14G needle, 2nd ICS midclavicular line' },
      { label: 'Chest Tube (after needle)', detail: '28-32 Fr, 5th ICS anterior axillary line' },
    ],
    'Tamponade': [
      { label: 'Pericardiocentesis', detail: 'Subxiphoid approach under ultrasound' },
      { label: 'Echo/Ultrasound', detail: 'Confirm pericardial effusion' },
      { label: 'IV Fluid Bolus', detail: 'Temporary bridge — increase preload' },
    ],
    'Toxins/OD': [
      { label: 'Naloxone 0.4-2mg IV (Opioid)', detail: 'Titrate to breathing. May need repeat' },
      { label: 'NaHCO₃ (TCA overdose)', detail: '1-2 mEq/kg IV bolus. Target pH 7.45-7.55' },
      { label: 'Lipid Emulsion 20%', detail: '1.5 ml/kg IV bolus → 0.25 ml/kg/min infusion' },
    ],
    'Thrombosis (PE/MI)': [
      { label: 'Heparin bolus 80u/kg', detail: 'Anticoagulation for PE' },
      { label: 'tPA (Alteplase) for PE', detail: '50-100mg IV. Consider in massive PE during CPR' },
      { label: 'Activate Cath Lab (MI)', detail: 'PCI for STEMI' },
    ],
  };
  return actions[causeName] || [{ label: 'Treated — specific intervention', detail: '' }];
}
