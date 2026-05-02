import { useState } from 'react';
import { reversibleCauses } from '../data/hs-and-ts';
import {
  Heart, TrendingDown, Zap, HeartPulse, ChevronDown, ChevronRight,
  GitBranch, Wind,
} from 'lucide-react';

const algorithms = [
  {
    id: 'cardiac_arrest',
    title: 'Cardiac Arrest',
    Icon: Heart,
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
            'Defibrillation (biphasic 120-200J)',
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
            "Consider H's and T's",
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
          "Treat reversible causes (H's & T's)",
          'Rotate compressor q2min',
        ],
        color: 'info',
      },
    ],
  },
  {
    id: 'bradycardia',
    title: 'Bradycardia',
    Icon: TrendingDown,
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
    Icon: Zap,
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
    Icon: HeartPulse,
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

const colorMap = {
  danger:  { bg: 'bg-danger', text: 'text-danger', soft: 'bg-danger/8 border-danger/30', borderL: 'border-l-danger' },
  warning: { bg: 'bg-warning', text: 'text-warning', soft: 'bg-warning/8 border-warning/30', borderL: 'border-l-warning' },
  success: { bg: 'bg-success', text: 'text-success', soft: 'bg-success/8 border-success/30', borderL: 'border-l-success' },
  info:    { bg: 'bg-info', text: 'text-info', soft: 'bg-info/8 border-info/30', borderL: 'border-l-info' },
  shock:   { bg: 'bg-shock', text: 'text-shock', soft: 'bg-shock/8 border-shock/30', borderL: 'border-l-shock' },
};

export default function Algorithm() {
  const [selected, setSelected] = useState('cardiac_arrest');
  const [showHT, setShowHT] = useState(false);
  const algo = algorithms.find(a => a.id === selected);

  return (
    <div className="page-container space-y-4">
      <div>
        <h1 className="text-title text-text-primary">ACLS Algorithms</h1>
        <p className="text-caption text-text-muted mt-0.5">Evidence-based decision flowcharts</p>
      </div>

      {/* Algorithm tabs — pill row */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {algorithms.map(a => {
          const tone = colorMap[a.color];
          const active = selected === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm whitespace-nowrap transition-all ${
                active
                  ? `${tone.bg} text-white`
                  : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-tertiary'
              }`}
              style={{ borderRadius: 'var(--radius-md)', boxShadow: active ? 'var(--shadow-2)' : 'var(--shadow-1)' }}
            >
              <a.Icon size={16} strokeWidth={2.2} />
              {a.title}
            </button>
          );
        })}
      </div>

      {/* Selected algorithm flowchart */}
      {algo && (
        <div className="space-y-3">
          {algo.sections.map((section, i) => (
            <div key={i}>
              {section.branch ? (
                <BranchCard section={section} />
              ) : (
                <StepSection section={section} index={i} />
              )}
              {i < algo.sections.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown size={20} strokeWidth={2} className="text-text-muted" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* H's & T's Toggle */}
      <button
        onClick={() => setShowHT(!showHT)}
        className="w-full btn btn-ghost btn-lg btn-block"
      >
        {showHT ? <ChevronDown size={16} strokeWidth={2.2} /> : <ChevronRight size={16} strokeWidth={2.2} />}
        H's & T's — Reversible Causes
      </button>

      {showHT && <HsAndTsSection />}
    </div>
  );
}

function StepSection({ section, index }) {
  const tone = colorMap[section.color] || colorMap.info;
  return (
    <div className={`dash-card border-l-4 ${tone.borderL}`}>
      <h3 className="text-body-strong text-text-primary flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${tone.bg} text-white shrink-0`}
          style={{ borderRadius: 99 }}>
          {index + 1}
        </span>
        {section.title}
      </h3>
      <ul className="space-y-1.5 ml-8">
        {section.items.map((item, j) => (
          <li key={j} className="text-caption text-text-secondary flex items-start gap-2">
            <span className={`mt-1.5 w-1 h-1 ${tone.bg} shrink-0`} style={{ borderRadius: 99 }} />
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
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border text-body-strong text-text-primary"
          style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-1)' }}>
          <GitBranch size={14} strokeWidth={2.2} className="text-text-muted" />
          {section.title}
        </div>
      </div>
      <div className="flex justify-center">
        <ChevronDown size={18} strokeWidth={2} className="text-text-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <BranchSide side={section.left} />
        <BranchSide side={section.right} />
      </div>
    </div>
  );
}

function BranchSide({ side }) {
  const tone = colorMap[side.color] || colorMap.info;
  return (
    <div className={`p-3 border ${tone.soft}`} style={{ borderRadius: 'var(--radius-md)' }}>
      <h4 className={`text-caption font-bold mb-2 ${tone.text}`}>{side.title}</h4>
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
    <div className="dash-card">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-body-strong text-info mb-2 flex items-center gap-1.5">
            <Wind size={14} strokeWidth={2.2} /> H's
          </h3>
          <div className="space-y-2">
            {reversibleCauses.hs.map((cause, i) => (
              <div key={i} className="bg-bg-primary p-2.5 border border-border" style={{ borderRadius: 'var(--radius)' }}>
                <div className="text-caption font-bold text-text-primary">{cause.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{cause.signs}</div>
                <div className="text-[10px] text-info mt-0.5 font-medium">Tx: {cause.treatment}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-body-strong text-danger mb-2 flex items-center gap-1.5">
            <Heart size={14} strokeWidth={2.2} /> T's
          </h3>
          <div className="space-y-2">
            {reversibleCauses.ts.map((cause, i) => (
              <div key={i} className="bg-bg-primary p-2.5 border border-border" style={{ borderRadius: 'var(--radius)' }}>
                <div className="text-caption font-bold text-text-primary">{cause.name}</div>
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
