import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ListOrdered } from 'lucide-react';
import QASection from '../components/QASection';
import { loadQaDeep, loadQaDeepChapters } from '../services/qaDeepService';

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

  const title = chapterId === UNCATEGORIZED
    ? 'ยังไม่จัดหมวด'
    : (chapter?.title || 'หมวดที่ไม่พบ');
  const icon = chapterId === UNCATEGORIZED ? '📌' : (chapter?.icon || '📘');

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

      <div className="text-center space-y-2">
        <div
          className="w-14 h-14 mx-auto inline-flex items-center justify-center bg-info/12 text-info"
          style={{ borderRadius: 'var(--radius-2xl)' }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        <h1 className="text-title text-text-primary">{title}</h1>
        <p className="text-caption text-text-muted">
          {loading ? 'กำลังโหลด…' : `${categoryItems.length} คำถามในหมวดนี้`}
        </p>
      </div>

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
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-2 text-info">
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
                      className="flex items-start gap-2.5 text-[13.5px] text-text-secondary hover:text-info transition-colors py-1 leading-snug"
                    >
                      <span
                        className="inline-flex items-center justify-center shrink-0 text-info font-bold text-[11px]"
                        style={{
                          minWidth: 26,
                          height: 22,
                          padding: '0 6px',
                          background: 'rgba(37, 99, 235, 0.10)',
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

          <QASection qa={qa} />
        </>
      )}
    </div>
  );
}
