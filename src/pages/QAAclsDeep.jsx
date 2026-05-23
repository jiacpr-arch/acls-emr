import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import QASection from '../components/QASection';
import { loadQaDeep } from '../services/qaDeepService';

export default function QAAclsDeep() {
  const [page, setPage] = useState({ title: 'Q&A ACLS เชิงลึก', intro: '', coverImage: null });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadQaDeep().then(result => {
      if (cancelled) return;
      setPage(result.page);
      setItems(result.items || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Flatten infographics into the Q&A images array so QASection renders them
  // alongside the question (cover sits above as a card header).
  const qa = items.map(it => ({
    q: it.question,
    a: it.answer,
    images: it.infographics ?? [],
  }));

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/als" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={2.2} /> คลังความรู้
        </Link>
      </div>

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

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : items.length === 0 ? (
        <div className="dash-card text-center space-y-2">
          <BookOpen size={28} strokeWidth={2.2} className="mx-auto text-text-muted" />
          <p className="text-caption text-text-muted">ยังไม่มีคำถาม-คำตอบในหมวดนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => (
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
