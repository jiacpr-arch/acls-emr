import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, Shuffle, MessageCircleQuestion } from 'lucide-react';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import StudentQuestionForm from '../components/StudentQuestionForm';

const CHAPTER_PALETTE = [
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

function parseChapterTitle(title) {
  const m = (title || '').match(/^บทที่\s*(\d+)\s*:?\s*(.*)$/);
  if (m) return { num: m[1], name: m[2].trim() || title };
  return { num: null, name: title };
}

// Derive a short, glance-able label from a long Thai chapter name.
// Priority: (1) parenthesized English short form, (2) trailing English
// phrase like "ROSC"/"Code Blue", (3) last "/"-segment,
// (4) phrase before a Thai connector, then strip filler and cap length.
function shortChapterName(rawName) {
  const src = (rawName || '').trim();
  if (!src) return src;

  const paren = src.match(/\(([^()]+)\)/);
  if (paren) {
    const inner = paren[1].split(/[·,/]/)[0].trim();
    if (inner) return inner;
  }

  const tail = src.match(/([A-Z][A-Za-z&]+(?:\s+[A-Z][A-Za-z&]+)*)\s*$/);
  if (tail) return tail[1];

  if (src.includes('/')) {
    const parts = src.split('/').map(s => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  const beforeConj = src.split(/\s*(?:และ|หรือ|กับ|พร้อม|อย่าง|แบบ|ขั้น)\s*/)[0].trim();
  const compact = beforeConj.replace(/^(การ|ภาวะ|โรค|กลุ่มอาการ|ทีม)\s*/, '');
  if (compact.length <= 18) return compact;
  return compact.slice(0, 16) + '…';
}

export default function QAAclsDeep() {
  const [page, setPage] = useState({ title: 'Q&A ACLS เชิงลึก', intro: '', coverImage: null });
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.random());
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadQaDeep(), loadQaDeepChapters()]).then(([deep, chs]) => {
      if (cancelled) return;
      setPage(deep.page);
      setItems(deep.items || []);
      setChapters(chs || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Count Q&A per chapter (and uncategorised)
  const counts = useMemo(() => {
    const map = new Map();
    let uncategorized = 0;
    for (const it of items) {
      if (it.chapterId) {
        map.set(it.chapterId, (map.get(it.chapterId) ?? 0) + 1);
      } else {
        uncategorized += 1;
      }
    }
    return { byChapter: map, uncategorized };
  }, [items]);

  const filteredChapters = useMemo(() => {
    if (!query.trim()) return chapters;
    const q = query.trim().toLowerCase();
    return chapters.filter(c => (c.title || '').toLowerCase().includes(q));
  }, [chapters, query]);

  // Pick a random Q&A that has an infographic to feature at the top.
  const featured = useMemo(() => {
    const withImage = items.filter(it => it.cover || (it.infographics && it.infographics.length > 0));
    if (!withImage.length) return null;
    const idx = Math.floor(shuffleSeed * withImage.length) % withImage.length;
    return withImage[idx];
  }, [items, shuffleSeed]);

  const featuredImage = featured
    ? (featured.cover || featured.infographics?.[0] || null)
    : null;

  const featuredChapter = useMemo(() => {
    if (!featured?.chapterId) return null;
    return chapters.find(c => c.id === featured.chapterId) || null;
  }, [featured, chapters]);

  const featuredHref = featured
    ? `/qa-acls-deep/${encodeURIComponent(featured.chapterId || '_uncategorized')}`
    : null;

  return (
    <div className="page-container space-y-4">
      <div className="text-center space-y-2">
        {page.coverImage ? (
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full max-h-56 object-cover border border-border mx-auto"
            style={{ borderRadius: 'var(--radius-2xl)' }}
          />
        ) : (
          <div
            className="w-16 h-16 mx-auto inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
            }}
          >
            <Sparkles size={28} strokeWidth={2.2} className="text-white" />
          </div>
        )}
        <h1 className="text-title text-text-primary">{page.title}</h1>
        {page.intro && (
          <p className="text-caption text-text-muted whitespace-pre-line">{page.intro}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAskOpen(true)}
        className="dash-card !p-0 w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary/50 transition-colors text-left border-l-4 border-l-info"
      >
        <div
          className="w-9 h-9 inline-flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <MessageCircleQuestion size={18} strokeWidth={2.2} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">ถามคำถามของคุณ</div>
          <div className="text-[11px] text-text-muted">AI ตอบเชิงลึก + จัดหมวด · อาจารย์ตรวจก่อนเผยแพร่</div>
        </div>
        <ArrowRight size={16} strokeWidth={2.2} className="text-info shrink-0" />
      </button>

      {askOpen && <StudentQuestionForm onClose={() => setAskOpen(false)} />}

      {!loading && featured && featuredImage && (
        <Link
          to={featuredHref}
          className="block overflow-hidden hover:-translate-y-0.5 active:scale-[0.99] transition-all"
          style={{
            background: 'var(--color-bg-elevated)',
            borderRadius: '22px',
            border: '1px solid rgba(15, 26, 46, 0.06)',
            boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04), 0 10px 24px -12px rgba(15, 26, 46, 0.18)',
          }}
        >
          <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1">
            <div className="inline-flex items-center gap-1.5">
              <Sparkles size={12} strokeWidth={2.4} className="text-info" />
              <span className="text-[10px] uppercase tracking-wider text-info font-bold">
                สุ่มแนะนำวันนี้
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShuffleSeed(Math.random()); }}
              className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary"
            >
              <Shuffle size={11} strokeWidth={2.2} />
              สุ่มใหม่
            </button>
          </div>
          <figure className="m-0">
            <img
              src={featuredImage.src}
              alt={featuredImage.alt || featured.question}
              loading="eager"
              className="w-full h-auto block"
            />
            {featuredImage.caption && (
              <figcaption className="text-[11px] text-text-muted px-3 pt-1.5 leading-relaxed">
                {featuredImage.caption}
              </figcaption>
            )}
          </figure>
          <div className="px-3 py-2.5 space-y-1.5">
            <div className="text-body-strong font-bold text-text-primary leading-snug">
              {featured.question}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-muted truncate">
                {featuredChapter
                  ? `${featuredChapter.icon || '📘'} ${featuredChapter.title}`
                  : 'ยังไม่จัดหมวด'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-info font-bold shrink-0">
                อ่านคำตอบเต็ม
                <ArrowRight size={12} strokeWidth={2.4} />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="relative">
        <Search size={14} strokeWidth={2.2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาหมวดความรู้…"
          className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : (
        <div className="space-y-3">
          {featured && !query.trim() && (
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold px-1 pt-1">
              อ่านเรื่องอื่นๆ ต่อ
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {filteredChapters.map((ch, idx) => {
              const palette = CHAPTER_PALETTE[idx % CHAPTER_PALETTE.length];
              const n = counts.byChapter.get(ch.id) ?? 0;
              const { num, name } = parseChapterTitle(ch.title);
              const shortName = shortChapterName(name);
              return (
                <Link
                  key={ch.id}
                  to={`/qa-acls-deep/${encodeURIComponent(ch.id)}`}
                  className="group relative overflow-hidden hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderRadius: '22px',
                    minHeight: 210,
                    border: `1px solid ${palette.tint.replace(/0\.1[46]\)/, '0.35)')}`,
                    boxShadow: `0 1px 2px rgba(15, 26, 46, 0.04), 0 12px 28px -12px ${palette.accent}66`,
                  }}
                >
                  {/* Colorful hero header with chapter badge + emoji */}
                  <div
                    className="relative flex items-center justify-center overflow-hidden"
                    style={{
                      height: 92,
                      background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.28) 0%, transparent 55%)',
                      }}
                    />
                    {num && (
                      <span
                        className="absolute top-2 left-2 inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5"
                        style={{
                          background: 'rgba(255, 255, 255, 0.22)',
                          color: 'white',
                          borderRadius: '999px',
                          border: '1px solid rgba(255,255,255,0.32)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                        }}
                      >
                        บทที่ {num}
                      </span>
                    )}
                    <span
                      className="relative leading-none hover-bounce-emoji"
                      style={{
                        fontSize: 54,
                        filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.28))',
                      }}
                    >
                      {ch.icon || '📘'}
                    </span>
                  </div>

                  {/* Title + count */}
                  <div className="relative flex-1 flex flex-col items-center text-center px-3 pt-5 pb-3 gap-2">
                    <div
                      className="text-[17px] font-extrabold leading-tight line-clamp-2 px-0.5"
                      style={{ color: palette.accent }}
                      title={name}
                    >
                      {shortName}
                    </div>
                    <span
                      className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5"
                      style={{
                        background: palette.tint,
                        color: palette.accent,
                        borderRadius: '999px',
                      }}
                    >
                      {n > 0 ? `${n} คำถาม` : 'ยังไม่มีคำถาม'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {counts.uncategorized > 0 && (
            <Link
              to="/qa-acls-deep/_uncategorized"
              className="group relative overflow-hidden bg-bg-secondary hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center gap-3 px-3.5 py-3"
              style={{
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(245, 158, 11, 0.18)',
                boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04), 0 6px 16px -8px rgba(245, 158, 11, 0.45)',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(120deg, rgba(245, 158, 11, 0.14) 0%, transparent 60%)' }}
              />
              <div
                className="relative w-12 h-12 inline-flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.55)',
                }}
              >
                <span className="text-2xl leading-none drop-shadow-sm">📌</span>
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-[13px] font-bold text-text-primary">ยังไม่จัดหมวด</div>
                <div className="text-[11px] text-text-muted">
                  {counts.uncategorized} คำถามที่ยังไม่ได้เลือกหมวด
                </div>
              </div>
              <span
                className="relative inline-flex items-center justify-center w-7 h-7 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(245, 158, 11, 0.14)',
                  color: '#D97706',
                  borderRadius: '999px',
                }}
              >
                <ArrowRight size={13} strokeWidth={2.8} />
              </span>
            </Link>
          )}

          {filteredChapters.length === 0 && (
            <div className="dash-card text-center text-caption text-text-muted py-6">
              ไม่พบหมวดที่ตรงกับคำค้น
            </div>
          )}
        </div>
      )}
    </div>
  );
}
