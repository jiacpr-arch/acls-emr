import { HeartPulse, Activity, Heart, Brain } from 'lucide-react';

// 2x2 quick-start grid for the ACLS landing. Tile gradients hint at the
// clinical pathway: cardiac arrest = red, rhythm = orange, MI = pink,
// stroke = purple. Tapping launches the recording flow on the right path.
const TILES = [
  {
    key: 'arrest',
    Icon: HeartPulse,
    label: 'Cardiac Arrest',
    sub: 'VF / pVT / Asystole / PEA',
    iconBg: 'linear-gradient(135deg, #F97316, #DC2626)',
  },
  {
    key: 'pulse',
    Icon: Activity,
    label: 'Brady / Tachy',
    sub: 'Pulse + arrhythmia',
    iconBg: 'linear-gradient(135deg, #F59E0B, #B45309)',
  },
  {
    key: 'mi',
    Icon: Heart,
    label: 'MI / ACS',
    sub: 'STEMI · NSTE-ACS',
    iconBg: 'linear-gradient(135deg, #EC4899, #BE185D)',
  },
  {
    key: 'stroke',
    Icon: Brain,
    label: 'Stroke',
    sub: 'NIHSS · Door-to-CT',
    iconBg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  },
];

export default function ACLSQuickActions({ onStart, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {TILES.map((t) => {
        const Icon = t.Icon;
        return (
          <button
            key={t.key}
            onClick={() => onStart(t.key)}
            disabled={disabled}
            className="dash-card text-left flex flex-col justify-between !p-7 min-h-[180px] transition-transform active:scale-[0.97] disabled:opacity-55 disabled:cursor-not-allowed"
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            <div
              className="w-16 h-16 inline-flex items-center justify-center text-white"
              style={{
                background: t.iconBg,
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 6px 14px rgba(220, 38, 38, 0.28)',
              }}
            >
              <Icon size={28} strokeWidth={2.4} />
            </div>
            <div className="mt-4">
              <div className="text-[16px] font-bold text-text-primary leading-tight">
                {t.label}
              </div>
              <div className="text-[12px] text-text-muted mt-2">{t.sub}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
