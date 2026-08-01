import { HeartPulse, Activity, Heart, Brain } from 'lucide-react';

// 2x2 quick-start grid for the ACLS landing (firstaid-style white cards with
// tinted icon tiles). Red is reserved for cardiac arrest; the other pathways
// share the blue action tint. Tapping launches the recording flow on the
// right path.
const TILES = [
  {
    key: 'arrest',
    Icon: HeartPulse,
    label: 'Cardiac Arrest',
    sub: 'VF / pVT / Asystole / PEA',
    color: '#DC2626',
  },
  {
    key: 'pulse',
    Icon: Activity,
    label: 'Brady / Tachy',
    sub: 'Pulse + arrhythmia',
    color: '#2563EB',
  },
  {
    key: 'mi',
    Icon: Heart,
    label: 'MI / ACS',
    sub: 'STEMI · NSTE-ACS',
    color: '#2563EB',
  },
  {
    key: 'stroke',
    Icon: Brain,
    label: 'Stroke',
    sub: 'NIHSS · Door-to-CT',
    color: '#2563EB',
  },
];

export default function ACLSQuickActions({ onStart, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TILES.map((t) => {
        const Icon = t.Icon;
        return (
          <button
            key={t.key}
            onClick={() => onStart(t.key)}
            disabled={disabled}
            className="card card-hover disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              // ชนะ button reset (unlayered) ที่บังคับ inline-flex + center
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <div
              className="inline-flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${t.color}15`,
                color: t.color,
              }}
            >
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <div className="text-headline text-text-primary mt-3 leading-tight">
              {t.label}
            </div>
            <div className="text-caption text-text-muted mt-0.5">{t.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
