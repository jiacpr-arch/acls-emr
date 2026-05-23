import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, Shuffle, MessageCircleQuestion } from 'lucide-react';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import StudentQuestionForm from '../components/StudentQuestionForm';

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
          className="block overflow-hidden border border-border bg-bg-secondary hover:bg-bg-tertiary/50 transition-colors"
          style={{ borderRadius: 'var(--radius-xl)' }}
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
        <div className="space-y-2">
          {featured && !query.trim() && (
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold px-1 pt-1">
              อ่านเรื่องอื่นๆ ต่อ
            </div>
          )}
          {filteredChapters.map(ch => {
            const n = counts.byChapter.get(ch.id) ?? 0;
            return (
              <Link
                key={ch.id}
                to={`/qa-acls-deep/${encodeURIComponent(ch.id)}`}
                className="dash-card !p-0 overflow-hidden flex items-center gap-3 px-4 py-3.5 hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="w-9 h-9 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <span className="text-base">{ch.icon || '📘'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-body-strong text-text-primary block truncate">{ch.title}</span>
                  <span className="text-[11px] text-text-muted">
                    {n > 0 ? `${n} คำถาม` : 'ยังไม่มีคำถาม'}
                  </span>
                </div>
                <ArrowRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
              </Link>
            );
          })}

          {counts.uncategorized > 0 && (
            <Link
              to="/qa-acls-deep/_uncategorized"
              className="dash-card !p-0 overflow-hidden flex items-center gap-3 px-4 py-3.5 hover:bg-bg-tertiary/50 transition-colors border-l-4 border-l-warning"
            >
              <div className="w-9 h-9 inline-flex items-center justify-center bg-warning/12 text-warning shrink-0"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <span className="text-base">📌</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-body-strong text-text-primary block truncate">ยังไม่จัดหมวด</span>
                <span className="text-[11px] text-text-muted">
                  {counts.uncategorized} คำถามที่ยังไม่ได้เลือกหมวด
                </span>
              </div>
              <ArrowRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
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
