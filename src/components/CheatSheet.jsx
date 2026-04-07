import { useState } from 'react';

// Quick Reference Cheat Sheet — accessible anytime via 📖 button
export default function CheatSheet({ onClose }) {
  const [tab, setTab] = useState('drugs');

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">📖 Quick Reference</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
      </div>

      <div className="tab-group mx-3 mt-2">
        {['drugs', 'energy', 'airway', 'ht'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-item ${tab === t ? 'active' : ''}`}>
            {t === 'drugs' ? '💊 Drugs' : t === 'energy' ? '⚡ Energy' : t === 'airway' ? '🫁 Airway' : '🔍 H&T'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'drugs' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Cardiac Arrest</div>
            <DrugRow name="Epinephrine" dose="1mg IV" note="q3-5min. Dilute 1:1000→1:10,000. Push fast + flush 20ml" />
            <DrugRow name="Amiodarone 1st" dose="300mg IV" note="After 3rd shock. +D5W 4ml push 1-3min. NO NSS!" />
            <DrugRow name="Amiodarone 2nd" dose="150mg IV" note="+D5W. Can repeat once" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Bradycardia</div>
            <DrugRow name="Atropine" dose="1mg IV" note="Push fast <1min. q3-5min. Max 3mg. NO slow push!" />
            <DrugRow name="Dopamine" dose="5-20 mcg/kg/min" note="400mg + NSS 250ml" />
            <DrugRow name="Epi infusion" dose="2-10 mcg/min" note="1mg + NSS 250ml" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Tachycardia</div>
            <DrugRow name="Adenosine 1st" dose="6mg IV" note="RAPID push + flush 20ml via 3-way. Half-life 6s!" />
            <DrugRow name="Adenosine 2nd" dose="12mg IV" note="Same technique. May repeat x1" />
            <DrugRow name="Diltiazem" dose="15-20mg IV" note="Over 2 min. For AF rate control" />
            <DrugRow name="Amiodarone (VT)" dose="150mg IV" note="+D5W 100ml drip 10min. NOT rapid push!" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">ACS</div>
            <DrugRow name="Aspirin" dose="325mg" note="CHEW & swallow" />
            <DrugRow name="NTG" dose="0.4mg SL" note="q5min x3. CI: SBP<90, PDE5i" />
            <DrugRow name="Heparin" dose="60u/kg bolus" note="Max 4000u. Then 12u/kg/hr" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Other</div>
            <DrugRow name="NaHCO₃" dose="1mEq/kg IV" note="Slow push. Flush before/after Ca" />
            <DrugRow name="Ca Gluconate" dose="10% 10-20ml" note="Slow 2-5min. CI: Digoxin" />
            <DrugRow name="MgSO₄" dose="2g IV" note="Push 1-2min (arrest) / drip 5-20min" />
            <DrugRow name="Naloxone" dose="0.4-2mg IV" note="Titrate to breathing" />
          </div>
        )}

        {tab === 'energy' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Defibrillation (Unsynchronized)</div>
            <EnergyRow rhythm="VF / pVT" energy="200J" note="Biphasic. Max energy if refractory" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Synchronized Cardioversion</div>
            <EnergyRow rhythm="SVT (Narrow Regular)" energy="100J" note="Sync mode ON" />
            <EnergyRow rhythm="AF / Aflutter" energy="200J" note="Sync mode ON" />
            <EnergyRow rhythm="VT mono (pulse)" energy="100J" note="Sync mode ON" />
            <EnergyRow rhythm="VT poly (pulse)" energy="Defib!" note="Unsync — treat as VF" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">TCP</div>
            <EnergyRow rhythm="Transcutaneous Pacing" energy="Start 0mA" note="Increase by 5-10mA until capture. Safety margin +10mA" />
          </div>
        )}

        {tab === 'airway' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1">ETT Size (Adult)</div>
            <AirwayRow label="Male" value="7.5 - 8.0" />
            <AirwayRow label="Female" value="7.0 - 7.5" />
            <AirwayRow label="Depth (oral)" value="21-23 cm (3x tube size)" />
            <AirwayRow label="Cuff pressure" value="20-30 cmH₂O" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Ventilation</div>
            <AirwayRow label="No advanced airway" value="30:2 ratio" />
            <AirwayRow label="Advanced airway" value="1 breath q6s (10/min) + continuous CPR" />
            <AirwayRow label="Post-ROSC" value="10-12 breaths/min. EtCO₂ 35-45" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">O₂ Devices</div>
            <AirwayRow label="Nasal Cannula" value="1-6 L/min → FiO₂ 24-44%" />
            <AirwayRow label="Simple Mask" value="6-10 L/min → FiO₂ 40-60%" />
            <AirwayRow label="NRB" value="10-15 L/min → FiO₂ 60-95%" />
            <AirwayRow label="BVM + O₂" value="15 L/min → FiO₂ ~100%" />

            <div className="text-[10px] font-bold text-text-muted uppercase mb-1 mt-3">Lung Protective</div>
            <AirwayRow label="TV" value="6-8 ml/kg IBW" />
            <AirwayRow label="PEEP" value="≥5 cmH₂O" />
            <AirwayRow label="SpO₂ target" value="92-98% (post-ROSC)" />
          </div>
        )}

        {tab === 'ht' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-info uppercase mb-1">H's</div>
            <HTRow cause="Hypovolemia" treatment="IV Fluid / Blood" />
            <HTRow cause="Hypoxia" treatment="O₂ 100% / Intubation" />
            <HTRow cause="H+ (Acidosis)" treatment="NaHCO₃ 1mEq/kg" />
            <HTRow cause="Hypo/Hyperkalemia" treatment="Ca Gluc + NaHCO₃ + Glucose+RI / K replacement" />
            <HTRow cause="Hypothermia" treatment="Warm fluid + blanket" />

            <div className="text-[10px] font-bold text-danger uppercase mb-1 mt-3">T's</div>
            <HTRow cause="Tension Pneumothorax" treatment="Needle decompression 2nd ICS MCL" />
            <HTRow cause="Tamponade" treatment="Pericardiocentesis / Echo" />
            <HTRow cause="Toxins/OD" treatment="Naloxone / NaHCO₃ / Lipid / Antidote" />
            <HTRow cause="Thrombosis (PE)" treatment="Anticoag / tPA / Thrombectomy" />
            <HTRow cause="Thrombosis (MI)" treatment="PCI / Fibrinolytic" />
          </div>
        )}
      </div>
    </div>
  );
}

function DrugRow({ name, dose, note }) {
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 bg-bg-primary rounded-lg">
      <div className="min-w-[80px]"><span className="text-[10px] font-bold text-text-primary">{name}</span></div>
      <div className="min-w-[70px]"><span className="text-[10px] font-mono font-bold text-info">{dose}</span></div>
      <div className="flex-1"><span className="text-[9px] text-text-muted">{note}</span></div>
    </div>
  );
}

function EnergyRow({ rhythm, energy, note }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-primary rounded-lg">
      <div className="min-w-[120px]"><span className="text-[10px] font-bold text-text-primary">{rhythm}</span></div>
      <div className="min-w-[50px]"><span className="text-[10px] font-mono font-bold text-shock">{energy}</span></div>
      <div className="flex-1"><span className="text-[9px] text-text-muted">{note}</span></div>
    </div>
  );
}

function AirwayRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-bg-primary rounded-lg">
      <span className="text-[10px] font-bold text-text-primary">{label}</span>
      <span className="text-[10px] font-mono text-info">{value}</span>
    </div>
  );
}

function HTRow({ cause, treatment }) {
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 bg-bg-primary rounded-lg">
      <div className="min-w-[110px]"><span className="text-[10px] font-bold text-text-primary">{cause}</span></div>
      <div className="flex-1"><span className="text-[9px] text-success font-semibold">→ {treatment}</span></div>
    </div>
  );
}
