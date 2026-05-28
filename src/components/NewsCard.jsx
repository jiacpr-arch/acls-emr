import { useEffect, useState } from 'react';
import { fetchNews } from '../services/newsService';
import { Bell, ChevronRight } from './ui/Icon';

const COURSE_LABEL = { acls: 'ACLS', bls: 'BLS', both: 'ทั่วไป' };

export default function NewsCard() {
  const [items, setItems] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNews({ limit: 5 }).then(rows => {
      if (!cancelled) setItems(rows);
    });
    return () => { cancelled = true; };
  }, []);

  if (items === null) return null;
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 inline-flex items-center justify-center shrink-0"
            style={{ background: 'rgba(220, 38, 38, 0.10)', color: '#DC2626', borderRadius: 'var(--radius)' }}
          >
            <Bell size={14} strokeWidth={2.2} />
          </div>
          <h2 className="text-headline text-text-primary">ข่าวล่าสุด</h2>
        </div>
        <span className="text-caption text-text-muted">{items.length} ข่าว</span>
      </div>

      <div className="space-y-2.5">
        {visible.map(n => <NewsItem key={n.id} item={n} />)}
      </div>

      {items.length > 3 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="btn btn-ghost btn-sm w-full mt-3"
        >
          {expanded ? 'ย่อรายการ' : `ดูข่าวอีก ${items.length - 3} ข่าว`}
          <ChevronRight
            size={14}
            strokeWidth={2.2}
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }}
          />
        </button>
      )}
    </div>
  );
}

function NewsItem({ item }) {
  const date = formatDate(item.published_at);
  const courseLabel = COURSE_LABEL[item.course] || '';
  const body = (
    <>
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        {courseLabel && (
          <span className={`badge ${item.course === 'bls' ? 'bg-info/15 text-info' : item.course === 'acls' ? 'bg-danger/15 text-danger' : 'bg-bg-tertiary text-text-muted'}`}>
            {courseLabel}
          </span>
        )}
        {item.source_name && (
          <span className="text-overline text-text-muted">{item.source_name}</span>
        )}
        <span className="text-overline text-text-muted opacity-60">·</span>
        <span className="text-overline text-text-muted">{date}</span>
        {item.language === 'en' && (
          <span className="text-overline text-text-muted opacity-60">· EN</span>
        )}
      </div>
      <div className="text-body-strong text-text-primary">{item.title}</div>
      <div className="text-caption text-text-muted mt-1 leading-relaxed">{item.summary}</div>
      {item.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.topics.map(t => (
            <span key={t} className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5"
              style={{ borderRadius: 'var(--radius-sm)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const className = "block p-3 bg-bg-primary border border-transparent hover:bg-bg-tertiary transition-colors no-underline";
  const style = { borderRadius: 'var(--radius-md)', textDecoration: 'none' };

  if (item.source_url) {
    return (
      <a href={item.source_url} target="_blank" rel="noopener noreferrer"
        className={className} style={style}>
        {body}
      </a>
    );
  }
  return <div className={className} style={style}>{body}</div>;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (hrs < 1) return 'เพิ่งเข้ามา';
      return `${hrs} ชม.ที่แล้ว`;
    }
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
