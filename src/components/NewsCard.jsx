import { useEffect, useState } from 'react';
import { fetchNews } from '../services/newsService';
import { Bell, ChevronRight } from './ui/Icon';

const COURSE_LABEL = { acls: 'ACLS', bls: 'BLS', both: 'ทั่วไป' };

// Only surface news from the last 30 days — older items stay on the /news page
// but never show up as "ข่าวล่าสุด" on the home/dashboard cards.
const MAX_AGE_DAYS = 30;

export default function NewsCard() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchNews({ limit: 1, maxAgeDays: MAX_AGE_DAYS, freshOnly: true }).then(rows => {
        if (!cancelled) setItem(rows[0] || null);
      });
    };
    load();
    // Refetch when the user comes back to the tab/app so a long-lived session
    // doesn't keep showing a snapshot from when it was first opened.
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', load);
    };
  }, []);

  if (!item) return null;

  const date = formatDate(item.published_at);
  const courseLabel = COURSE_LABEL[item.course] || '';
  const courseBadgeCls =
    item.course === 'bls' ? 'bg-info/15 text-info' :
    item.course === 'acls' ? 'bg-danger/15 text-danger' :
    'bg-bg-tertiary text-text-muted';

  const Wrapper = item.source_url ? 'a' : 'div';
  const linkProps = item.source_url
    ? { href: item.source_url, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="dash-card flex gap-3 hover:shadow-2 transition-shadow group no-underline"
      style={{ textDecoration: 'none', borderLeft: '4px solid #DC2626' }}
    >
      <div
        className="w-10 h-10 inline-flex items-center justify-center shrink-0"
        style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', borderRadius: 'var(--radius)' }}
      >
        <Bell size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-overline" style={{ color: '#DC2626' }}>ข่าวล่าสุด</span>
          <span className="text-overline text-text-muted opacity-50">·</span>
          {courseLabel && (
            <span className={`badge ${courseBadgeCls}`}>{courseLabel}</span>
          )}
          {item.source_name && (
            <span className="text-overline text-text-muted">{item.source_name}</span>
          )}
          <span className="text-overline text-text-muted opacity-50">·</span>
          <span className="text-overline text-text-muted">{date}</span>
        </div>
        <div className="text-body-strong text-text-primary mt-0.5">{item.title}</div>
        <div className="text-caption text-text-muted mt-1 leading-relaxed line-clamp-2">
          {item.summary}
        </div>
      </div>
      {item.source_url && (
        <ChevronRight
          size={18}
          strokeWidth={2.2}
          className="text-text-muted group-hover:text-danger shrink-0 self-center transition-colors"
        />
      )}
    </Wrapper>
  );
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
