import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search } from 'lucide-react';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';

export default function QAAclsDeep() {
  const [page, setPage] = useState({ title: 'Q&A ACLS เชิงลึก', intro: '', coverImage: null });
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

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
