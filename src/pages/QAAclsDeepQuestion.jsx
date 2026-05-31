import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Home } from 'lucide-react';
import QASection from '../components/QASection';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import {
  chapterPaletteAt,
  parseChapterTitle,
  UNCATEGORIZED_PALETTE,
} from '../utils/qaChapters';

const UNCATEGORIZED = '_uncategorized';

export default function QAAclsDeepQuestion() {
  const { chapterId, qNum } = useParams();
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

  const total = categoryItems.length;
  const idx = Math.floor(Number(qNum)) - 1;
  const item = Number.isInteger(idx) && idx >= 0 ? categoryItems[idx] : undefined;

  // Reset scroll when navigating between questions.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [chapterId, qNum]);

  const listHref = `/qa-acls-deep/${encodeURIComponent(chapterId)}`;
  const qa = item
    ? [{ q: item.question, a: item.answer, cover: item.cover ?? null, images: item.infographics ?? [] }]
    : [];
  const chapterLabel = num ? `บทที่ ${num}: ${name}` : (name || 'หมวดคำถาม');

  return (
    <div className="page-container space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-[12px] text-text-muted"
        aria-label="เส้นทางหน้า"
      >
        <Link to="/qa-acls-deep" className="inline-flex items-center gap-1 hover:text-info">
          <Home size={12} strokeWidth={2.4} />
          หน้าแรก Q&A
        </Link>
        <span className="text-text-muted/60">/</span>
        <Link to={listHref} className="hover:text-info truncate max-w-[60vw]">
          {chapterLabel}
        </Link>
        {item && (
          <>
            <span className="text-text-muted/60">/</span>
            <span className="text-text-secondary font-bold">
              คำถามที่ {idx + 1}
            </span>
          </>
        )}
      </nav>

      <JiacprCourseBanner />

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : !item ? (
        <div className="dash-card text-center space-y-3 py-6">
          <BookOpen size={28} strokeWidth={2.2} className="mx-auto text-text-muted" />
          <p className="text-caption text-text-muted">ไม่พบคำถามนี้ในหมวด</p>
          <Link to={listHref} className="btn btn-primary btn-sm">
            <ChevronLeft size={14} strokeWidth={2.2} /> กลับไปรายการคำถาม
          </Link>
        </div>
      ) : (
        <>
          {/* Article header: chapter pill + question as page title */}
          <header className="space-y-3">
            <Link
              to={listHref}
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 hover:opacity-85 transition-opacity"
              style={{
                background: `color-mix(in srgb, ${palette.accent} 12%, transparent)`,
                color: palette.accent,
                borderRadius: 999,
              }}
            >
              <span className="text-[13px] leading-none">{icon}</span>
              {chapterLabel}
            </Link>
            <h1 className="text-[24px] sm:text-[26px] font-extrabold text-text-primary leading-tight">
              {item.q}
            </h1>
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <BookOpen size={12} strokeWidth={2.4} />
              คำถามที่ {idx + 1} จาก {total}
            </div>
          </header>

          {/* Cover image (rounded, full-width) */}
          {item.cover && (
            <figure className="m-0">
              <img
                src={item.cover.src}
                alt={item.cover.alt || item.question}
                loading="eager"
                className="w-full h-auto block"
                style={{ borderRadius: 'var(--radius-2xl)' }}
              />
              {item.cover.caption && (
                <figcaption className="text-[12px] text-text-muted italic mt-2 px-1 leading-relaxed">
                  {item.cover.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article body — pass cover=null so QASection doesn't render it again */}
          <QASection
            qa={[{ ...qa[0], cover: null }]}
            startIndex={idx}
            accent={palette.accent}
            variant="article"
          />

          {/* Footer: back to category + prev/next */}
          <div
            className="mt-2 pt-5 space-y-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <Link
              to={listHref}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold hover:opacity-80"
              style={{ color: palette.accent }}
            >
              <ChevronLeft size={14} strokeWidth={2.4} />
              กลับไปดูคำถามทั้งหมดในหมวด
            </Link>

            <nav className="flex items-center justify-between gap-2" aria-label="คำถามก่อนหน้า/ถัดไป">
              {idx > 0 ? (
                <Link to={`${listHref}/${idx}`} className="btn btn-outline btn-sm">
                  <ChevronLeft size={14} strokeWidth={2.4} /> ก่อนหน้า
                </Link>
              ) : (
                <span className="btn btn-outline btn-sm invisible pointer-events-none" aria-hidden>
                  <ChevronLeft size={14} strokeWidth={2.4} /> ก่อนหน้า
                </span>
              )}

              <span className="text-caption text-text-muted font-bold shrink-0">
                {idx + 1} / {total}
              </span>

              {idx < total - 1 ? (
                <Link to={`${listHref}/${idx + 2}`} className="btn btn-outline btn-sm">
                  ถัดไป <ChevronRight size={14} strokeWidth={2.4} />
                </Link>
              ) : (
                <span className="btn btn-outline btn-sm invisible pointer-events-none" aria-hidden>
                  ถัดไป <ChevronRight size={14} strokeWidth={2.4} />
                </span>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
