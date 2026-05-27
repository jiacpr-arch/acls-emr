import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, Shuffle, MessageCircleQuestion, ChevronRight } from 'lucide-react';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import StudentQuestionForm from '../components/StudentQuestionForm';
import { CHAPTER_PALETTE, UNCATEGORIZED_PALETTE, parseChapterTitle } from '../utils/qaChapters';
import JiacprCourseBanner from '../components/JiacprCourseBanner';

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

  const chapterById = useMemo(() => {
    const m = new Map();
    for (const c of chapters) m.set(c.id, c);
    return m;
  }, [chapters]);

  // Within-chapter position (1-based) for each item — used as the :qNum route
  // param so a search hit or the featured card can link to that question's page.
  // Keyed by the item object (static fallback items have no stable id).
  const itemAnchor = useMemo(() => {
    const seen = new Map();
    const m = new Map();
    for (const it of items) {
      const key = it.chapterId || '_uncategorized';
      const n = (seen.get(key) ?? 0) + 1;
      seen.set(key, n);
      m.set(it, { chapterKey: key, num: n });
    }
    return m;
  }, [items]);

  // Search now matches question + answer text + chapter title (was title-only).
  const matchedItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((it) => {
      const ch = it.chapterId ? chapterById.get(it.chapterId) : null;
      const hay = `${it.question || ''} ${it.answer || ''} ${ch?.title || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, chapterById, query]);

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
    ? (() => {
        const anchor = itemAnchor.get(featured);
        const key = anchor?.chapterKey || featured.chapterId || '_uncategorized';
        return `/qa-acls-deep/${encodeURIComponent(key)}${anchor ? `/${anchor.num}` : ''}`;
      })()
    : null;

  return (
    <div className="page-container space-y-5">
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

      <JiacprCourseBanner />

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

      {!loading && featured && featuredImage && !query.trim() && (
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
          <div className="px-3 py-2.5 space-y-2">
            <span
              className="inline-flex items-center gap-1.5 max-w-full rounded-full px-2.5 py-1 text-[12px] font-bold"
              style={
                featuredChapter
                  ? { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-info)' }
                  : { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }
              }
            >
              <span className="shrink-0 text-[14px] leading-none">
                {featuredChapter ? (featuredChapter.icon || '📘') : '📌'}
              </span>
              <span className="truncate">
                {featuredChapter ? featuredChapter.title : 'ยังไม่จัดหมวด'}
              </span>
            </span>
            <div className="text-body-strong font-bold text-text-primary leading-snug">
              {featured.question}
            </div>
            <div className="flex items-center justify-end">
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
          placeholder="ค้นหาคำถาม คำตอบ หรือหมวด…"
          className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : query.trim() ? (
        <div className="space-y-2.5">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold px-1 pt-1">
            {matchedItems.length > 0 ? `พบ ${matchedItems.length} คำถาม` : 'ผลการค้นหา'}
          </div>
          {matchedItems.map((it, idx) => {
            const anchor = itemAnchor.get(it);
            const ch = it.chapterId ? chapterById.get(it.chapterId) : null;
            const href = `/qa-acls-deep/${encodeURIComponent(anchor?.chapterKey || '_uncategorized')}${anchor ? `/${anchor.num}` : ''}`;
            return (
              <Link
                key={it.id ?? `m-${idx}`}
                to={href}
                className="dash-card !p-0 flex items-start gap-3 px-4 py-3 hover:bg-bg-tertiary/50 transition-colors text-left"
              >
                <div
                  className="w-8 h-8 inline-flex items-center justify-center shrink-0 bg-info/12 text-info"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <MessageCircleQuestion size={16} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-strong text-text-primary leading-snug line-clamp-2">
                    {it.question}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
                    <span className="shrink-0">{ch ? (ch.icon || '📘') : '📌'}</span>
                    <span className="truncate">{ch ? parseChapterTitle(ch.title).name : 'ยังไม่จัดหมวด'}</span>
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={2.4} className="text-text-muted shrink-0 mt-1" />
              </Link>
            );
          })}
          {matchedItems.length === 0 && (
            <div className="dash-card text-center text-caption text-text-muted py-6">
              ไม่พบคำถามหรือหมวดที่ตรงกับ “{query.trim()}”
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {featured && (
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold px-1 pt-1">
              อ่านเรื่องอื่นๆ ต่อ
            </div>
          )}

          <div className="space-y-2.5">
            {chapters.map((ch, idx) => {
              const palette = CHAPTER_PALETTE[idx % CHAPTER_PALETTE.length];
              const n = counts.byChapter.get(ch.id) ?? 0;
              const { num, name } = parseChapterTitle(ch.title);
              return (
                <Link
                  key={ch.id}
                  to={`/qa-acls-deep/${encodeURIComponent(ch.id)}`}
                  className="chapter-card block"
                >
                  <span
                    className="chapter-card-stripe"
                    style={{ background: `linear-gradient(180deg, ${palette.from} 0%, ${palette.to} 100%)` }}
                  />
                  <div className="chapter-card-button">
                    <div
                      className="chapter-icon-tile"
                      style={{ background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)` }}
                    >
                      <span className="leading-none" style={{ fontSize: 26 }}>{ch.icon || '📘'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {num && (
                        <div className="chapter-num-tag" style={{ color: palette.accent }}>
                          บทที่ {num}
                        </div>
                      )}
                      <span className="chapter-title">{name}</span>
                      <span
                        className="chapter-meta-pill"
                        style={{ background: `${palette.accent}18`, color: palette.accent }}
                      >
                        <MessageCircleQuestion size={11} strokeWidth={2.4} />
                        {n > 0 ? `${n} คำถาม` : 'ยังไม่มีคำถาม'}
                      </span>
                    </div>
                    <span className="chapter-chevron">
                      <ChevronRight size={16} strokeWidth={2.4} />
                    </span>
                  </div>
                </Link>
              );
            })}

            {counts.uncategorized > 0 && (
              <Link to="/qa-acls-deep/_uncategorized" className="chapter-card block">
                <span
                  className="chapter-card-stripe"
                  style={{ background: `linear-gradient(180deg, ${UNCATEGORIZED_PALETTE.from} 0%, ${UNCATEGORIZED_PALETTE.to} 100%)` }}
                />
                <div className="chapter-card-button">
                  <div
                    className="chapter-icon-tile"
                    style={{ background: `linear-gradient(135deg, ${UNCATEGORIZED_PALETTE.from} 0%, ${UNCATEGORIZED_PALETTE.to} 100%)` }}
                  >
                    <span className="leading-none" style={{ fontSize: 24 }}>📌</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="chapter-num-tag" style={{ color: UNCATEGORIZED_PALETTE.accent }}>
                      อื่นๆ
                    </div>
                    <span className="chapter-title">ยังไม่จัดหมวด</span>
                    <span
                      className="chapter-meta-pill"
                      style={{ background: `${UNCATEGORIZED_PALETTE.accent}18`, color: UNCATEGORIZED_PALETTE.accent }}
                    >
                      <MessageCircleQuestion size={11} strokeWidth={2.4} />
                      {counts.uncategorized} คำถาม
                    </span>
                  </div>
                  <span className="chapter-chevron">
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
