import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
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
    <div className="page-container space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/qa-acls-deep" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={2.2} /> ทุกหมวด
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
