// Shared chapter visuals for the Q&A ACLS เชิงลึก pages.
// The landing grid (QAAclsDeep) and the per-category reader
// (QAAclsDeepCategory) both colour-code chapters from this palette so the
// card you tap expands into a header in the same colour.
//
// เดิมเป็น gradient รุ้ง 13 สี — ตัดเหลือ accent แบนวนซ้ำ 3 สี (น้ำเงิน/แดง/เขียว)
// ให้ยังแยกบทได้ด้วยตาแต่ไม่หลุดจานสีจำกัดของทั้งแอป
export const CHAPTER_PALETTE = [
  { accent: '#2563EB' },
  { accent: '#DC2626' },
  { accent: '#059669' },
].map((p) => ({ ...p, tint: `${p.accent}18` }));

// Amber accent สำหรับ bucket "ยังไม่จัดหมวด" — เหลือง = สถานะ ไม่ใช่ธีมบท
export const UNCATEGORIZED_PALETTE = { accent: '#D97706', tint: '#D9770618' };

export function chapterPaletteAt(index) {
  if (index == null || index < 0) return CHAPTER_PALETTE[0];
  return CHAPTER_PALETTE[index % CHAPTER_PALETTE.length];
}

// Split a "บทที่ N: ชื่อบท" title into its number and name parts.
export function parseChapterTitle(title) {
  const m = (title || '').match(/^บทที่\s*(\d+)\s*:?\s*(.*)$/);
  if (m) return { num: m[1], name: m[2].trim() || title };
  return { num: null, name: title };
}
