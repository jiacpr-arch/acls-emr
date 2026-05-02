import { useState } from 'react';
import ScrollPicker from '../components/ScrollPicker';
import { Pill, Calculator, AlertTriangle } from 'lucide-react';

export default function DrugCalc() {
  const [weight, setWeight] = useState(70);

  const calcs = [
    { name: 'Epinephrine (arrest)', dose: '1mg', note: 'Fixed dose. Dilute 1:1000 1ml + NSS 9ml', calc: false },
    { name: 'Amiodarone 1st', dose: '300mg', note: 'Fixed dose. +D5W 4ml', calc: false },
    { name: 'Amiodarone 2nd', dose: '150mg', note: 'Fixed dose. +D5W', calc: false },
    { name: 'Atropine', dose: '1mg', note: 'Fixed dose. Push fast', calc: false },
    { name: 'Heparin bolus', dose: `${Math.round(weight * 60)}u`, note: `60u/kg (max 4000u) = ${Math.min(Math.round(weight * 60), 4000)}u`, calc: true },
    { name: 'Heparin drip', dose: `${Math.round(weight * 12)}u/hr`, note: `12u/kg/hr (max 1000u/hr) = ${Math.min(Math.round(weight * 12), 1000)}u/hr`, calc: true },
    { name: 'tPA (Alteplase)', dose: `${Math.min(weight * 0.9, 90).toFixed(1)}mg`, note: `0.9mg/kg (max 90mg). Bolus: ${(Math.min(weight * 0.9, 90) * 0.1).toFixed(1)}mg. Drip: ${(Math.min(weight * 0.9, 90) * 0.9).toFixed(1)}mg/60min`, calc: true },
    { name: 'NaHCO₃', dose: `${weight}mEq`, note: `1mEq/kg`, calc: true },
    { name: 'Tidal Volume', dose: `${Math.round(weight * 6)}-${Math.round(weight * 8)}ml`, note: '6-8 ml/kg', calc: true },
    { name: 'Dopamine', dose: '5-20 mcg/kg/min', note: `Start: ${(weight * 5 * 60 / 1600).toFixed(1)} ml/hr (400mg/250ml)`, calc: true },
    { name: 'Norepinephrine', dose: '0.1-0.5 mcg/kg/min', note: `Start: ${(weight * 0.1 * 60 / 16).toFixed(1)} ml/hr (4mg/250ml)`, calc: true },
    { name: 'Defibrillation (peds)', dose: `${weight * 2}-${weight * 4}J`, note: '2-4 J/kg', calc: true },
  ];

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Pill size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">Drug Calculator</h1>
          <p className="text-caption text-text-muted">Weight-based dosing reference</p>
        </div>
      </div>

      <div className="dash-card">
        <ScrollPicker label="Patient Weight" value={weight} onChange={setWeight}
          min={3} max={150} step={1} unit="kg" />
      </div>

      <div className="space-y-1.5">
        {calcs.map((c, i) => (
          <div key={i} className="dash-card !p-3 flex items-start gap-3">
            <div className="w-8 h-8 inline-flex items-center justify-center bg-bg-tertiary shrink-0"
              style={{ borderRadius: 'var(--radius-sm)' }}>
              {c.calc ? (
                <Calculator size={14} strokeWidth={2} className="text-info" />
              ) : (
                <Pill size={14} strokeWidth={2} className="text-text-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-caption font-bold text-text-primary">{c.name}</div>
              <div className="text-[10px] text-text-muted leading-relaxed">{c.note}</div>
            </div>
            <div className={`text-numeric text-base shrink-0 ${c.calc ? 'text-info' : 'text-text-primary'}`}>
              {c.dose}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 bg-warning/8 border border-warning/30"
        style={{ borderRadius: 'var(--radius-md)' }}>
        <AlertTriangle size={14} strokeWidth={2.2} className="text-warning shrink-0 mt-0.5" />
        <div className="text-[11px] text-text-secondary leading-relaxed">
          Drip calculations based on standard mixing. <span className="font-bold text-text-primary">Verify before administration.</span>
        </div>
      </div>
    </div>
  );
}
