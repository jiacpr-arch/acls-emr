// เรนเดอร์เนื้อหา read step (แปลง bullet/numbered/ข้อความ) — แยกออกมาเพื่อใช้ร่วม
// ระหว่างหน้านักเรียน (LessonReader) และหน้าแอดมินจัดการสื่อ (AdminPreCourseImages)
// ให้เห็นเนื้อหาเหมือนกันเป๊ะ
export default function ReadBody({ body }) {
  const lines = (body ?? '').split('\n').map(l => l.trim()).filter(Boolean);

  const items = lines.map((line) => {
    const bullet = line.match(/^([•\-*])\s+(.*)$/);
    if (bullet) return { kind: 'bullet', marker: '•', text: bullet[2] };
    const numbered = line.match(/^(\d+)[).]\s+(.*)$/);
    if (numbered) return { kind: 'numbered', marker: `${numbered[1]}.`, text: numbered[2] };
    return { kind: 'text', text: line };
  });

  return (
    <div
      className="text-text-secondary"
      style={{ fontSize: '16px', lineHeight: 1.7 }}
    >
      {items.map((it, i) => {
        if (it.kind === 'text') {
          return (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>
              {it.text}
            </p>
          );
        }
        const isNumbered = it.kind === 'numbered';
        return (
          <div
            key={i}
            className={i > 0 ? 'mt-2.5' : ''}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
          >
            <span
              className={isNumbered ? 'text-info font-bold' : 'text-info'}
              style={{
                flexShrink: 0,
                minWidth: isNumbered ? '22px' : '14px',
                fontSize: isNumbered ? '16px' : '18px',
                lineHeight: 1.55,
              }}
            >
              {it.marker}
            </span>
            <span style={{ flex: 1 }}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
}
