import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { reversibleCauses } from '../data/hs-and-ts';
import PanelWrapper from './PanelWrapper';

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

  // Treatment detail view — enhanced with protocol + key points
  if (selectedCause) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="w-full max-w-lg h-full max-h-[100dvh] flex flex-col bg-bg-secondary animate-slide-up md:h-auto md:max-h-[85vh] md:rounded-2xl md:shadow-2xl md:m-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary shrink-0">
            <span className="font-bold text-text-primary">🔍 {selectedCause.name}</span>
            <button onClick={() => setSelectedCause(null)} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">← Back</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Signs & Symptoms */}
            <div className="glass-card !p-3">
              <div className="text-xs font-bold text-text-primary mb-1">Signs & Symptoms</div>
              <div className="text-xs text-text-secondary">{selectedCause.signs}</div>
            </div>

            {/* When to Suspect — checklist */}
            {selectedCause.whenToSuspect && (
              <div className="glass-card !p-3">
                <div className="text-xs font-bold text-warning mb-2">When to Suspect</div>
                <div className="space-y-1">
                  {selectedCause.whenToSuspect.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <span className="text-warning shrink-0 mt-0.5">!</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-step Protocol */}
            {selectedCause.protocol && (
              <div className="glass-card !p-3">
                <div className="text-xs font-bold text-success mb-2">Treatment Protocol</div>
                <div className="space-y-1.5">
                  {selectedCause.protocol.map((step, i) => {
                    const isSubStep = step.startsWith('  ');
                    return (
                      <div key={i} className={`flex items-start gap-2 text-[11px] ${isSubStep ? 'ml-4' : ''}`}>
                        {!isSubStep && (
                          <span className="w-5 h-5 rounded-full bg-success/15 text-success text-[9px] font-bold flex items-center justify-center shrink-0">
                            {i + 1 - selectedCause.protocol.slice(0, i).filter(s => s.startsWith('  ')).length}
                          </span>
                        )}
                        {isSubStep && <span className="text-success/50 shrink-0 ml-1">→</span>}
                        <span className={`text-text-primary ${isSubStep ? 'text-text-secondary' : 'font-medium'}`}>
                          {isSubStep ? step.trim() : step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Points */}
            {selectedCause.keyPoints && (
              <div className="glass-card !p-3 border-l-2 border-info">
                <div className="text-xs font-bold text-info mb-2">Key Points</div>
                <div className="space-y-1.5">
                  {selectedCause.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <span className="text-info shrink-0">*</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Labs/Diagnostics Needed */}
            {selectedCause.labsNeeded && (
              <div className="glass-card !p-3">
                <div className="text-xs font-bold text-purple mb-2">Labs / Diagnostics</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCause.labsNeeded.map((lab, i) => (
                    <span key={i} className="text-[10px] font-medium bg-purple/10 text-purple px-2 py-1 rounded-lg">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick correction buttons */}
            <div className="glass-card !p-3">
              <div className="text-xs font-bold text-success mb-2">Quick Correction Actions</div>
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
      </div>
    );
  }

  return (
    <PanelWrapper title="Reversible Causes" icon="🔍" onClose={onClose}>
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
    </PanelWrapper>
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
    'Tamponade (Cardiac)': [
      { label: 'Pericardiocentesis', detail: 'Subxiphoid approach under ultrasound' },
      { label: 'Echo/Ultrasound', detail: 'Confirm pericardial effusion' },
      { label: 'IV Fluid Bolus', detail: 'Temporary bridge — increase preload' },
    ],
    'Toxins / OD': [
      { label: 'Naloxone 0.4-2mg IV (Opioid)', detail: 'Titrate to breathing. May need repeat' },
      { label: 'NaHCO₃ (TCA overdose)', detail: '1-2 mEq/kg IV bolus. Target pH 7.45-7.55' },
      { label: 'Lipid Emulsion 20%', detail: '1.5 ml/kg IV bolus → 0.25 ml/kg/min infusion' },
      { label: 'Glucagon 3-5mg IV (Beta-blocker)', detail: 'Follow with infusion 3-5 mg/hr' },
    ],
    'Thrombosis — PE': [
      { label: 'Alteplase 50mg IV (PE)', detail: 'Massive PE → continue CPR 60-90 min after' },
      { label: 'Heparin bolus 80u/kg', detail: 'Anticoagulation for PE' },
    ],
    'Thrombosis — MI': [
      { label: 'Activate Cath Lab (MI)', detail: 'PCI for STEMI — call early!' },
      { label: 'Aspirin 325mg + P2Y12', detail: 'Ticagrelor 180mg or Clopidogrel 600mg' },
      { label: 'Heparin 60u/kg IV (MI)', detail: 'Max 4000u bolus' },
    ],
  };
  return actions[causeName] || [{ label: 'Treated — specific intervention', detail: '' }];
}
