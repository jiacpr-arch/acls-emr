import { ShieldCheck } from 'lucide-react';

// Typographic hero for the ACLS landing page (firstaid-style): eyebrow →
// display title → meta line. The clinical/training pill is the only stateful
// element carried over from the old gradient banner.
export default function ACLSHero({ isClinical }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="text-caption text-text-muted">Advanced Cardiac Life Support</div>
      <h1 className="text-display text-text-primary">ACLS EMR</h1>
      <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 6 }}>
        <span className="inline-flex items-center gap-1.5 text-caption text-text-muted">
          <ShieldCheck size={14} strokeWidth={2.4} />
          ILCOR 2025 · Code Blue Recording
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
            isClinical ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
          }`}
          style={{ borderRadius: 99 }}
        >
          <span
            className={`w-1.5 h-1.5 ${isClinical ? 'bg-danger animate-pulse' : 'bg-info'}`}
            style={{ borderRadius: 99 }}
          />
          {isClinical ? 'Clinical' : 'Training'}
        </span>
      </div>
    </div>
  );
}
