import { ShieldCheck } from 'lucide-react';

// Typographic hero for the home landing page (firstaid-style): eyebrow →
// display title → meta line. The clinical/training pill is the only stateful
// element carried over from the old gradient banner. Generalized from the
// original ACLS-only ACLSHero so the same layout works for every course —
// only the copy is per-course; the clinical/training pill colors stay
// semantic (danger/info), not brand-tinted.
export default function CourseHero({
  isClinical,
  eyebrow = 'Advanced Cardiac Life Support',
  title = 'ACLS EMR',
  meta = 'ILCOR 2025 · Code Blue Recording',
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="text-caption text-text-muted">{eyebrow}</div>
      <h1 className="text-display text-text-primary">{title}</h1>
      <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 6 }}>
        <span className="inline-flex items-center gap-1.5 text-caption text-text-muted">
          <ShieldCheck size={14} strokeWidth={2.4} />
          {meta}
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
