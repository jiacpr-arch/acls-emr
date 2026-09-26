import { HeartPulse, Activity, Heart, Brain } from 'lucide-react';

// 2x2 quick-start grid for the ACLS landing (firstaid-style white cards with
// tinted icon tiles). แต่ละ pathway ใช้สีประจำโหมดตามดีไซน์เดิม (arrest=แดง,
// rhythm=เหลืองอำพัน, MI=ชมพู, stroke=ม่วง) เพื่อให้แยกโหมดได้ปราดเดียว.
// Tapping launches the recording flow on the right path.
const TILES = [
  {
    key: 'arrest',
    Icon: HeartPulse,
    label: 'Cardiac Arrest',
    sub: 'VF / pVT / Asystole / PEA',
    color: 'var(--color-danger)',
  },
  {
    key: 'pulse',
    Icon: Activity,
    label: 'Brady / Tachy',
    sub: 'Pulse + arrhythmia',
    color: 'var(--color-warning)',
  },
  {
    key: 'mi',
    Icon: Heart,
    label: 'MI / ACS',
    sub: 'STEMI · NSTE-ACS',
    color: '#BE185D',
  },
  {
    key: 'stroke',
    Icon: Brain,
    label: 'Stroke',
    sub: 'NIHSS · Door-to-CT',
    color: 'var(--color-purple)',
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
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--color-bg-tertiary)',
                color: t.color,
              }}
            >
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="text-body-strong text-text-primary mt-3 leading-tight">
              {t.label}
            </div>
            <div className="text-caption text-text-muted mt-0.5">{t.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
