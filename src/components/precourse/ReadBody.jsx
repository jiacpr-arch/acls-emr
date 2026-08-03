import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { mdComponents } from '../markdownComponents';

// เรนเดอร์เนื้อหา read step — แยกออกมาเพื่อใช้ร่วมระหว่างหน้านักเรียน (LessonReader)
// และหน้าแอดมินจัดการสื่อ (AdminPreCourseImages) ให้เห็นเนื้อหาเหมือนกันเป๊ะ
//
// Hybrid: ถ้า body มี "block-level markdown" ที่ตัว parser เดิมทำไม่ได้
// (ตาราง | , หัวข้อ #, blockquote >) → render ผ่าน Markdown เต็ม (สำหรับบทเรียน
// เชิงลึกที่เขียนใหม่). ถ้าไม่มี → ใช้ parser บรรทัดต่อบรรทัดแบบเดิมทุกประการ
// (ย่อหน้า + bullet/เลขข้อ) เพื่อ "ไม่ regress" เนื้อหา legacy ของทุกคอร์ส
// (ตรวจแล้วว่าเนื้อหาเดิมไม่มี table/heading/blockquote — ดู verify ใน PR)
const BLOCK_MD = /(?:^|\n)\s*(?:\|[^\n]*\||#{1,6}\s|>\s)/;

// ในโหมด markdown แปลง bullet `•`/`·` (ที่ markdown ไม่รู้จัก) เป็น `- ` เพื่อให้
// ยังขึ้นเป็น list ถูกต้อง (safety net; เนื้อหาใหม่จะเขียน `-` อยู่แล้ว)
function normalizeLessonMarkdown(body) {
  return body.replace(/^(\s*)[•·]\s+/gm, '$1- ');
}

export default function ReadBody({ body }) {
  const raw = body ?? '';

  if (BLOCK_MD.test(raw)) {
    return (
      <div className="als-section-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {normalizeLessonMarkdown(raw)}
        </ReactMarkdown>
      </div>
    );
  }

  // ── โหมด legacy (เดิม): แยกบรรทัด แปลง bullet/numbered/ข้อความ ──
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

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
