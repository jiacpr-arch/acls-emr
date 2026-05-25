import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ListOrdered } from 'lucide-react';
import QASection from '../components/QASection';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import {
  chapterPaletteAt,
  parseChapterTitle,
  UNCATEGORIZED_PALETTE,
} from '../utils/qaChapters';

const UNCATEGORIZED = '_uncategorized';

export default function QAAclsDeepCategory() {
  const { chapterId } = useParams();
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadQaDeep(), loadQaDeepChapters()]).then(([deep, chs]) => {
      if (cancelled) return;
      setItems(deep.items || []);
      setChapters(chs || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const chapter = useMemo(
    () => chapters.find(c => c.id === chapterId),
    [chapters, chapterId]
  );

  const categoryItems = useMemo(() => {
    if (chapterId === UNCATEGORIZED) {
      return items.filter(it => !it.chapterId);
    }
    return items.filter(it => it.chapterId === chapterId);
  }, [items, chapterId]);

  const { num, name } = useMemo(() => {
    if (chapterId === UNCATEGORIZED) return { num: null, name: 'ยังไม่จัดหมวด' };
    if (!chapter) return { num: null, name: loading ? '' : 'หมวดที่ไม่พบ' };
    return parseChapterTitle(chapter.title);
  }, [chapter, chapterId, loading]);
  const icon = chapterId === UNCATEGORIZED ? '📌' : (chapter?.icon || '📘');

  const palette = useMemo(() => {
    if (chapterId === UNCATEGORIZED) return UNCATEGORIZED_PALETTE;
    return chapterPaletteAt(chapters.findIndex(c => c.id === chapterId));
  }, [chapters, chapterId]);

  // Map Q&A items into QASection prop shape (cover + infographics → images)
  const qa = categoryItems.map(it => ({
    q: it.question,
    a: it.answer,
    cover: it.cover ?? null,
    images: it.infographics ?? [],
  }));

  const handleJump = (idx) => (e) => {
    e.preventDefault();
    const el = document.getElementById(`qa-${idx + 1}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/qa-acls-deep" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={2.2} /> ทุกหมวด
        </Link>
      </div>

      <header
        className="relative overflow-hidden text-white"
        style={{
          borderRadius: 'var(--radius-3xl)',
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
          boxShadow: `0 1px 2px rgba(15, 26, 46, 0.04), 0 14px 30px -14px ${palette.accent}88`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 26% 16%, rgba(255,255,255,0.30) 0%, transparent 56%)' }}
        />
        <div className="relative flex items-center gap-4 px-5 py-5">
          <span
            className="leading-none shrink-0"
            style={{ fontSize: 52, filter: 'drop-shadow(0 6px 10px rgba(0, 0, 0, 0.28))' }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            {num && (
              <span
                className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  borderRadius: 999,
                  border: '1px solid rgba(255, 255, 255, 0.32)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                }}
              >
                บทที่ {num}
              </span>
            )}
            <h1
              className="text-[20px] font-extrabold leading-tight"
              style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.22)' }}
            >
              {name || ' '}
            </h1>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1"
              style={{
                background: 'rgba(255, 255, 255, 0.20)',
                borderRadius: 999,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              <BookOpen size={12} strokeWidth={2.4} />
              {loading ? 'กำลังโหลด…' : `${categoryItems.length} คำถามในหมวดนี้`}
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : categoryItems.length === 0 ? (
        <div className="dash-card text-center space-y-2 py-6">
          <BookOpen size={28} strokeWidth={2.2} className="mx-auto text-text-muted" />
          <p className="text-caption text-text-muted">ยังไม่มีคำถามในหมวดนี้</p>
        </div>
      ) : (
        <>
          {/* Quick TOC: jump to any question */}
          {categoryItems.length > 1 && (
            <nav
              aria-label="สารบัญคำถาม"
              className="bg-bg-secondary border border-border"
              style={{
                '--qa-accent': palette.accent,
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04)',
                borderLeft: `3px solid ${palette.accent}`,
              }}
            >
              <div
                className="flex items-center gap-1.5 mb-2"
                style={{ color: palette.accent }}
              >
                <ListOrdered size={14} strokeWidth={2.4} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  สารบัญคำถาม
                </span>
              </div>
              <ol className="space-y-1.5 list-none m-0 p-0">
                {categoryItems.map((it, idx) => (
                  <li key={it.id || idx}>
                    <a
                      href={`#qa-${idx + 1}`}
                      onClick={handleJump(idx)}
                      className="flex items-start gap-2.5 text-[13.5px] text-text-secondary hover:text-[var(--qa-accent)] transition-colors py-1 leading-snug"
                    >
                      <span
                        className="inline-flex items-center justify-center shrink-0 font-bold text-[11px]"
                        style={{
                          minWidth: 26,
                          height: 22,
                          padding: '0 6px',
                          background: palette.tint,
                          color: palette.accent,
                          borderRadius: 999,
                          marginTop: 1,
                          letterSpacing: '0.02em',
                        }}
                      >
                        Q{idx + 1}
                      </span>
                      <span className="line-clamp-2">{it.question}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <QASection qa={qa} accent={palette.accent} />
        </>
      )}
    </div>
  );
}
