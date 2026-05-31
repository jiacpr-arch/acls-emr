import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Home } from 'lucide-react';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
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

  const listBase = `/qa-acls-deep/${encodeURIComponent(chapterId)}`;

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
        <span className="text-text-secondary font-bold truncate max-w-[60vw]">
          {num ? `บทที่ ${num}` : 'หมวด'}
        </span>
      </nav>

      <JiacprCourseBanner />

      {/* Article-style header: chapter pill + page title */}
      <header className="space-y-3">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1"
          style={{
            background: `color-mix(in srgb, ${palette.accent} 12%, transparent)`,
            color: palette.accent,
            borderRadius: 999,
          }}
        >
          <span className="text-[13px] leading-none">{icon}</span>
          {num ? `บทที่ ${num}` : 'หมวดคำถาม'}
        </span>
        <h1 className="text-[24px] sm:text-[26px] font-extrabold text-text-primary leading-tight">
          {name || ' '}
        </h1>
        <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <BookOpen size={12} strokeWidth={2.4} />
          {loading ? 'กำลังโหลด…' : `${categoryItems.length} คำถามในหมวดนี้`}
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
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold px-1 pt-1">
            เลือกคำถามที่ต้องการอ่าน
          </div>
          {categoryItems.map((it, idx) => (
            <Link
              key={it.id ?? idx}
              to={`${listBase}/${idx + 1}`}
              className="dash-card !p-0 flex items-start gap-3 px-4 py-3 hover:bg-bg-tertiary/50 transition-colors text-left"
            >
              <span
                className="inline-flex items-center justify-center shrink-0 font-extrabold text-white text-[12px]"
                style={{
                  minWidth: 32,
                  height: 28,
                  padding: '0 8px',
                  background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
                  borderRadius: 999,
                  letterSpacing: '0.02em',
                  marginTop: 1,
                }}
              >
                Q{idx + 1}
              </span>
              <span className="flex-1 min-w-0 text-body-strong text-text-primary leading-snug">
                {it.question}
              </span>
              <ChevronRight size={16} strokeWidth={2.4} className="text-text-muted shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
