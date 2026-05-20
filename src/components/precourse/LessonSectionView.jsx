export default function LessonSectionView({ sections }) {
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <section key={i} className="dash-card">
          <div className="text-caption font-bold text-info mb-1.5">{s.heading}</div>
          <div className="text-body text-text-secondary leading-relaxed whitespace-pre-line">
            {s.body}
          </div>
        </section>
      ))}
    </div>
  );
}
