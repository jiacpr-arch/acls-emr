import { useState } from 'react';
import { reversibleCauses } from '../data/hs-and-ts';

const algorithms = [
  {
    id: 'cardiac_arrest',
    title: 'Cardiac Arrest',
    icon: '💔',
    color: 'danger',
    sections: [
      {
        title: 'Start CPR + O₂ + Monitor',
        items: [
          'Push hard (5-6 cm), push fast (100-120/min)',
          'Allow full chest recoil',
          'Minimize interruptions (<10 sec)',
          'Attach defibrillator pads',
        ],
        color: 'danger',
      },
      {
        title: 'Check Rhythm',
        branch: true,
        left: {
          title: 'Shockable (VF / pVT)',
          color: 'shock',
          items: [
            '⚡ Defibrillation (biphasic 120-200J)',
            'Resume CPR immediately 2 min',
            'Epinephrine after 2nd shock, q3-5min',
            'Amiodarone 300mg after 3rd shock → 150mg',
          ],
        },
        right: {
          title: 'Non-Shockable (PEA / Asystole)',
          color: 'warning',
          items: [
            'CPR 2 min immediately',
            'Epinephrine ASAP → q3-5min',
            'Check rhythm every 2 min',
            'Consider H\'s and T\'s',
          ],
        },
      },
      {
        title: 'During CPR',
        items: [
          'IV/IO access',
          'Epinephrine 1 mg q3-5min',
          'Advanced airway (ETT / SGA)',
          'Waveform capnography (EtCO₂)',
          'Treat reversible causes (H\'s & T\'s)',
          'Rotate compressor q2min',
        ],
        color: 'info',
      },
    ],
  },
  {
    id: 'bradycardia',
    title: 'Bradycardia',
    icon: '🐌',
    color: 'info',
    sections: [
      {
        title: 'Assess: HR < 60 bpm',
        items: [
          'Maintain airway, breathing',
          'Cardiac monitor, IV access',
          'Identify and treat reversible causes',
          '12-Lead ECG if available',
        ],
        color: 'info',
      },
      {
        title: 'Signs of Poor Perfusion?',
        branch: true,
        left: {
          title: 'Symptomatic',
          color: 'danger',
          items: [
            'Atropine 1 mg IV q3-5min (max 3 mg)',
            'If ineffective: Transcutaneous pacing',
            'OR Dopamine 5-20 mcg/kg/min',
            'OR Epinephrine 2-10 mcg/min',
            'Consider expert consult / transvenous pacing',
          ],
        },
        right: {
          title: 'Adequate Perfusion',
          color: 'success',
          items: [
            'Monitor and observe',
            'Continue assessment',
            'No immediate treatment needed',
          ],
        },
      },
    ],
  },
  {
    id: 'tachycardia',
    title: 'Tachycardia',
    icon: '⚡',
    color: 'warning',
    sections: [
      {
        title: 'Assess: HR > 100 bpm',
        items: [
          'Maintain airway, breathing',
          'Cardiac monitor, IV access, O₂',
          'Identify QRS: Narrow (<0.12s) or Wide (≥0.12s)?',
          '12-Lead ECG if stable',
        ],
        color: 'warning',
      },
      {
        title: 'Hemodynamically Stable?',
        branch: true,
        left: {
          title: 'UNSTABLE → Cardioversion',
          color: 'danger',
          items: [
            'Sedate if conscious (midazolam/fentanyl)',
            'Synchronized cardioversion:',
            '• Narrow regular: 50-100J',
            '• Narrow irregular (AF): 120-200J',
            '• Wide regular: 100J',
            '• Wide irregular: Defibrillation (unsync)',
          ],
        },
        right: {
          title: 'STABLE → Identify Rhythm',
          color: 'info',
          items: [
            'Narrow regular (SVT): Vagal → Adenosine 6→12→12mg',
            'Narrow irregular (AF): Diltiazem / Beta-blocker',
            'Wide regular (VT): Amiodarone 150mg IV/10min',
            'Wide irregular: If polymorphic → Defib; Torsades → MgSO₄ 2g',
          ],
        },
      },
    ],
  },
  {
    id: 'post_rosc',
    title: 'Post-ROSC',
    icon: '💚',
    color: 'success',
    sections: [
      {
        title: 'Immediate Post-ROSC Care',
        items: [
          'SpO₂ 92-98% — AVOID hyperoxia',
          'EtCO₂ 35-45 mmHg — AVOID hyperventilation',
          'MAP ≥ 65 mmHg (fluids + vasopressors)',
          '12-Lead ECG — STEMI? → Cath lab',
        ],
        color: 'success',
      },
      {
        title: 'Targeted Temperature Management',
        items: [
          'TTM 32-36°C for ≥ 24 hours',
          'Avoid fever (>37.7°C)',
          'Sedation + neuromuscular blockade if shivering',
        ],
        color: 'info',
      },
      {
        title: 'Monitoring & Labs',
        items: [
          'ABG, Lactate, Troponin, Electrolytes',
          'Glucose 140-180 mg/dL (avoid hypoglycemia)',
          'Seizure precaution & EEG monitoring',
          'CT head if no clear cardiac cause',
          'Neuroprognostication ≥ 72 hrs after ROSC',
        ],
        color: 'warning',
      },
    ],
  },
];

export default function Algorithm() {
  const [selected, setSelected] = useState('cardiac_arrest');
  const [showHT, setShowHT] = useState(false);
  const algo = algorithms.find(a => a.id === selected);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 pb-8">
      <h1 className="text-2xl font-bold text-text-primary">ACLS Algorithms</h1>

      {/* Algorithm tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {algorithms.map(a => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              selected === a.id
                ? `bg-${a.color} text-white shadow-md`
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {a.icon} {a.title}
          </button>
        ))}
      </div>

      {/* Selected algorithm flowchart */}
      {algo && (
        <div className="space-y-3">
          {algo.sections.map((section, i) => (
            <div key={i}>
              {section.branch ? (
                <BranchCard section={section} index={i} />
              ) : (
                <StepSection section={section} index={i} />
              )}
              {/* Connector arrow */}
              {i < algo.sections.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-6 bg-bg-tertiary" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* H's & T's Toggle */}
      <button
        onClick={() => setShowHT(!showHT)}
        className="w-full btn-action btn-ghost py-3.5 text-sm font-bold"
      >
        {showHT ? '▼' : '▶'} H's & T's — Reversible Causes
      </button>

      {showHT && <HsAndTsSection />}
    </div>
  );
}

function StepSection({ section, index }) {
  return (
    <div className={`glass-card !p-4 border-l-4 ${
      section.color === 'danger' ? 'border-l-danger' :
      section.color === 'warning' ? 'border-l-warning' :
      section.color === 'success' ? 'border-l-success' :
      section.color === 'shock' ? 'border-l-shock' :
      'border-l-info'
    }`}>
      <h3 className="font-bold text-text-primary text-sm mb-2">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
          section.color === 'danger' ? 'bg-danger text-white' :
          section.color === 'warning' ? 'bg-warning text-black' :
          section.color === 'success' ? 'bg-success text-white' :
          'bg-info text-white'
        }`}>{index + 1}</span>
        {section.title}
      </h3>
      <ul className="space-y-1.5 ml-8">
        {section.items.map((item, j) => (
          <li key={j} className="text-xs text-text-secondary flex items-start gap-2">
            <span className="text-info mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BranchCard({ section }) {
  return (
    <div className="space-y-2">
      {/* Branch header */}
      <div className="text-center">
        <div className="inline-block glass-card !px-4 !py-2 font-bold text-sm text-text-primary">
          🔀 {section.title}
        </div>
      </div>
      {/* Branch arrow down splits */}
      <div className="flex justify-center">
        <div className="w-0.5 h-4 bg-bg-tertiary" />
      </div>
      {/* Two branches */}
      <div className="grid grid-cols-2 gap-3">
        <BranchSide side={section.left} />
        <BranchSide side={section.right} />
      </div>
    </div>
  );
}

function BranchSide({ side }) {
  return (
    <div className={`rounded-xl p-3 border ${
      side.color === 'danger' ? 'bg-danger/5 border-danger/30' :
      side.color === 'warning' ? 'bg-warning/5 border-warning/30' :
      side.color === 'success' ? 'bg-success/5 border-success/30' :
      side.color === 'shock' ? 'bg-shock/5 border-shock/30' :
      'bg-info/5 border-info/30'
    }`}>
      <h4 className={`text-xs font-bold mb-2 ${
        side.color === 'danger' ? 'text-danger' :
        side.color === 'warning' ? 'text-warning' :
        side.color === 'success' ? 'text-success' :
        side.color === 'shock' ? 'text-shock' :
        'text-info'
      }`}>{side.title}</h4>
      <ul className="space-y-1">
        {side.items.map((item, j) => (
          <li key={j} className="text-[11px] text-text-secondary leading-snug">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function HsAndTsSection() {
  return (
    <div className="glass-card !p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-bold text-info mb-2">H's</h3>
          <div className="space-y-2">
            {reversibleCauses.hs.map((cause, i) => (
              <div key={i} className="bg-bg-primary rounded-lg p-2.5">
                <div className="text-xs font-bold text-text-primary">{cause.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{cause.signs}</div>
                <div className="text-[10px] text-info mt-0.5 font-medium">Tx: {cause.treatment}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-danger mb-2">T's</h3>
          <div className="space-y-2">
            {reversibleCauses.ts.map((cause, i) => (
              <div key={i} className="bg-bg-primary rounded-lg p-2.5">
                <div className="text-xs font-bold text-text-primary">{cause.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{cause.signs}</div>
                <div className="text-[10px] text-danger mt-0.5 font-medium">Tx: {cause.treatment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
