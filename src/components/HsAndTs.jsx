import { reversibleCauses } from '../data/hs-and-ts';

export default function HsAndTs() {
  return (
    <div className="dash-card !p-3">
      <div className="section-header">H's & T's — Reversible Causes</div>

      <div className="grid grid-cols-2 gap-3">
        <Column letter="H" tone="info" causes={reversibleCauses.hs} />
        <Column letter="T" tone="danger" causes={reversibleCauses.ts} />
      </div>
    </div>
  );
}

function Column({ letter, tone, causes }) {
  const labelClass = tone === 'info' ? 'text-info' : 'text-danger';
  return (
    <div>
      <div className={`text-overline mb-2 ${labelClass}`}>{letter}'s</div>
      <div className="space-y-1.5">
        {causes.map((cause, i) => (
          <div key={i} className="bg-bg-primary border border-border p-2.5"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="text-caption font-bold text-text-primary">{cause.name}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{cause.signs}</div>
            <div className={`text-[10px] mt-0.5 font-medium ${labelClass}`}>Tx: {cause.treatment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
