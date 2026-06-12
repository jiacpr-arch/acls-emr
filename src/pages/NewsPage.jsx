import { useEffect, useMemo, useState } from 'react';
import { fetchNews, fetchJiaAedNews } from '../services/newsService';
import { Bell, Search, ChevronRight } from '../components/ui/Icon';
import { IS_BLS } from '../config/courseMode';
import PushToggle from '../components/PushToggle';

const COURSE_LABEL = { acls: 'ACLS', bls: 'BLS', both: 'ทั่วไป' };

const FILTERS = IS_BLS
  ? [
      { id: null, label: 'ทั้งหมด' },
      { id: 'bls', label: 'BLS' },
      { id: 'both', label: 'ทั่วไป' },
    ]
  : [
      { id: null, label: 'ทั้งหมด' },
      { id: 'acls', label: 'ACLS' },
      { id: 'both', label: 'ทั่วไป' },
    ];

export default function NewsPage() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const load = (showLoading = false) => {
      if (showLoading) setItems(null);
      fetchNews({ limit: 50, course: filter, search: debouncedSearch || null }).then(rows => {
        if (!cancelled) setItems(rows);
      });
    };
    // Show the loading skeleton on filter/search change; silent on background refresh.
    load(true);
    // Refresh silently when the user returns to the tab so the feed reflects the
    // latest daily fetch without a full reload.
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    const onFocus = () => load();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [filter, debouncedSearch]);

  const [jiaItems, setJiaItems] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetchJiaAedNews(5).then(rows => { if (!cancelled) setJiaItems(rows); });
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => groupByDate(items || []), [items]);

  return (
    <div className="page-container space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 inline-flex items-center justify-center shrink-0"
          style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', borderRadius: 'var(--radius)' }}>
          <Bell size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">ข่าวสาร</h1>
          <p className="text-caption text-text-muted mt-0.5">
            ข่าว CPR / ACLS / BLS / AED อัปเดตอัตโนมัติทุกวัน
          </p>
        </div>
      </div>

      <PushToggle />

      <div className="dash-card flex items-center gap-2 px-3 py-2">
        <Search size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาข่าว…"
          className="flex-1 bg-transparent border-0 outline-none text-body text-text-primary placeholder-text-muted"
        />
      </div>

      <div className="tab-group">
        {FILTERS.map(f => (
          <button key={f.label} onClick={() => setFilter(f.id)}
            className={`tab-item ${filter === f.id ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="text-center py-10 text-text-muted text-caption">กำลังโหลด…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-3 inline-flex items-center justify-center bg-bg-tertiary text-text-muted"
            style={{ borderRadius: 'var(--radius-full)' }}>
            <Bell size={26} strokeWidth={1.6} />
          </div>
          <div className="text-body text-text-muted">
            {debouncedSearch ? 'ไม่พบข่าวตามคำค้น' : 'ยังไม่มีข่าว'}
          </div>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.key} className="space-y-2">
            <div className="text-overline text-text-muted px-1">{group.label}</div>
            {group.items.map(item => <NewsItem key={item.id} item={item} />)}
          </div>
        ))
      )}

      {/* ฟีดจาก jiaaed.com — โชว์เฉพาะตอนไม่ได้ค้นหา เพราะ search ไม่ครอบคลุมฟีดนี้ */}
      {!debouncedSearch && jiaItems.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-overline text-text-muted px-1">ข่าวสุขภาพ & AED จาก JiaAED</div>
          {jiaItems.map((item, i) => <NewsItem key={item.source_url || i} item={item} />)}
          <div className="text-caption text-text-muted text-center pt-1">
            ฟีดข่าวจาก{' '}
            <a href="https://jiaaed.com" target="_blank" rel="noopener noreferrer" className="underline">
              jiaaed.com
            </a>{' '}
            — แตะข่าวเพื่ออ่านต้นฉบับ
          </div>
        </div>
      )}
    </div>
  );
}

function NewsItem({ item }) {
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
      style={{ textDecoration: 'none' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {courseLabel && <span className={`badge ${courseBadgeCls}`}>{courseLabel}</span>}
          {item.source_name && (
            <span className="text-overline text-text-muted">{item.source_name}</span>
          )}
          {item.language === 'en' && (
            <span className="text-overline text-text-muted opacity-60">· EN</span>
          )}
        </div>
        <div className="text-body-strong text-text-primary mt-1">{item.title}</div>
        <div className="text-caption text-text-muted mt-1 leading-relaxed">{item.summary}</div>
        {item.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.topics.map(t => (
              <span key={t} className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
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

// Fixed display order: fresh news bucketed by date first, then evergreen
// reference material (guidelines / landmark research) always last so it never
// buries genuinely fresh news.
const GROUP_ORDER = ['today', 'yesterday', 'week', 'month', 'older', 'reference'];
const GROUP_LABEL = {
  today: 'วันนี้',
  yesterday: 'เมื่อวาน',
  week: 'สัปดาห์นี้',
  month: 'เดือนนี้',
  older: 'ก่อนหน้านี้',
  reference: 'อ้างอิง / ไกด์ไลน์สำคัญ',
};

function groupByDate(items) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const groups = new Map();
  for (const item of items) {
    let key;
    if (item.is_evergreen) {
      key = 'reference';
    } else {
      const d = new Date(item.published_at);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) key = 'today';
      else if (diffDays === 1) key = 'yesterday';
      else if (diffDays < 7) key = 'week';
      else if (diffDays < 30) key = 'month';
      else key = 'older';
    }

    if (!groups.has(key)) groups.set(key, { key, label: GROUP_LABEL[key], items: [] });
    groups.get(key).items.push(item);
  }
  return GROUP_ORDER.filter(k => groups.has(k)).map(k => groups.get(k));
}
