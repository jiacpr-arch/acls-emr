import { ShieldCheck } from 'lucide-react';

// Typographic hero for the BLS landing page (firstaid-style): eyebrow →
// display title → meta line. The active-student status lives in
// BLSProgressCard underneath, so this stays uncluttered.
export default function BLSHero() {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="text-caption text-text-muted">Basic Life Support</div>
      <h1 className="text-display text-text-primary">BLS for Healthcare Providers</h1>
      <div className="inline-flex items-center gap-1.5 text-caption text-text-muted" style={{ marginTop: 6 }}>
        <ShieldCheck size={14} strokeWidth={2.4} />
        ILCOR 2025 · ใบประกาศนียบัตรใช้ได้ 24 เดือน
      </div>
    </div>
  );
}
