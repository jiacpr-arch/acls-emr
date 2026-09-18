// Hero มาตรฐานแบบ firstaid: eyebrow เล็ก → ชื่อหน้าตัวใหญ่ → คำอธิบาย/บรรทัด meta
// ใช้แทน hero แบบ icon-tile gradient เดิมของทุกหน้า
export default function PageHero({ eyebrow, title, desc, meta, style }) {
  return (
    <div style={{ marginTop: 8, marginBottom: 8, ...style }}>
      {eyebrow && <div className="text-caption text-text-muted">{eyebrow}</div>}
      <h1 className="text-display text-text-primary">{title}</h1>
      {desc && (
        <div className="text-body text-text-muted" style={{ marginTop: 4 }}>{desc}</div>
      )}
      {meta && (
        <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 6 }}>{meta}</div>
      )}
    </div>
  );
}
