import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
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

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-2">
        <Link to={listHref} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={2.2} />
          {name ? `ทุกคำถาม · ${name}` : 'ทุกคำถามในหมวด'}
        </Link>
      </div>

      <JiacprCourseBanner />

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
              {name || ' '}
            </h1>
            {!loading && total > 0 && (
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
                {item ? `คำถามที่ ${idx + 1} จาก ${total}` : `${total} คำถามในหมวดนี้`}
              </span>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : !item ? (
        <div className="dash-card text-center space-y-3 py-6">
          <BookOpen size={28} strokeWidth={2.2} className="mx-auto text-text-muted" />
          <p className="text-caption text-text-muted">ไม่พบคำถามนี้ในหมวด</p>
          <Link to={listHref} className="btn btn-primary btn-sm">
            <ArrowLeft size={14} strokeWidth={2.2} /> กลับไปรายการคำถาม
          </Link>
        </div>
      ) : (
        <>
          <QASection qa={qa} startIndex={idx} accent={palette.accent} />

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
        </>
      )}
    </div>
  );
}
