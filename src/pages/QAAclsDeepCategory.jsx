import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
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

  // Map Q&A items into QASection prop shape (infographics → images array)
  const qa = categoryItems.map(it => ({
    q: it.question,
    a: it.answer,
    images: it.infographics ?? [],
  }));

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
        <div className="space-y-4">
          {categoryItems.map((it, idx) => (
            <div key={it.id || idx} className="space-y-2">
              {it.cover && (
                <figure className="m-0">
                  <img
                    src={it.cover.src}
                    alt={it.cover.alt || it.question}
                    loading="lazy"
                    className="w-full h-auto block border border-border"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  />
                  {it.cover.caption && (
                    <figcaption className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      {it.cover.caption}
                    </figcaption>
                  )}
                </figure>
              )}
              <QASection qa={[qa[idx]]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
