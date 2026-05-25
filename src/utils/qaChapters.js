// Shared chapter visuals for the Q&A ACLS เชิงลึก pages.
// The landing grid (QAAclsDeep) and the per-category reader
// (QAAclsDeepCategory) both colour-code chapters from this palette so the
// card you tap expands into a header in the same colour.

export const CHAPTER_PALETTE = [
  { from: '#3B82F6', to: '#1D4ED8', tint: 'rgba(59, 130, 246, 0.14)', accent: '#2563EB' },
  { from: '#06B6D4', to: '#0E7490', tint: 'rgba(6, 182, 212, 0.14)', accent: '#0891B2' },
  { from: '#F43F5E', to: '#BE123C', tint: 'rgba(244, 63, 94, 0.14)', accent: '#E11D48' },
  { from: '#EF4444', to: '#B91C1C', tint: 'rgba(239, 68, 68, 0.14)', accent: '#DC2626' },
  { from: '#A855F7', to: '#6D28D9', tint: 'rgba(168, 85, 247, 0.14)', accent: '#7C3AED' },
  { from: '#F59E0B', to: '#B45309', tint: 'rgba(245, 158, 11, 0.14)', accent: '#D97706' },
  { from: '#FB923C', to: '#C2410C', tint: 'rgba(251, 146, 60, 0.14)', accent: '#EA580C' },
  { from: '#6366F1', to: '#4338CA', tint: 'rgba(99, 102, 241, 0.14)', accent: '#4F46E5' },
  { from: '#22D3EE', to: '#0369A1', tint: 'rgba(34, 211, 238, 0.14)', accent: '#0EA5E9' },
  { from: '#FACC15', to: '#A16207', tint: 'rgba(250, 204, 21, 0.16)', accent: '#CA8A04' },
  { from: '#64748B', to: '#334155', tint: 'rgba(100, 116, 139, 0.16)', accent: '#475569' },
  { from: '#10B981', to: '#047857', tint: 'rgba(16, 185, 129, 0.14)', accent: '#059669' },
  { from: '#C084FC', to: '#7E22CE', tint: 'rgba(192, 132, 252, 0.14)', accent: '#9333EA' },
];

// Amber palette for the "ยังไม่จัดหมวด" bucket — mirrors the uncategorised
// card on the landing page.
export const UNCATEGORIZED_PALETTE = {
  from: '#F59E0B', to: '#B45309', tint: 'rgba(245, 158, 11, 0.14)', accent: '#D97706',
};

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
