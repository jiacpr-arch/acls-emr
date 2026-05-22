import { Play, Video, Music, ExternalLink } from 'lucide-react';

const platformMeta = {
  youtube: {
    Icon: Video,
    bg: 'bg-danger/12',
    text: 'text-danger',
    hover: 'hover:bg-danger/20',
  },
  tiktok: {
    Icon: Music,
    bg: 'bg-text-primary/10',
    text: 'text-text-primary',
    hover: 'hover:bg-text-primary/15',
  },
};

export default function VideoLinksPanel({ videos }) {
  const items = (videos || []).filter(v => v.url);
  if (!items.length) return null;

  return (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Play size={16} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">วิดีโอประกอบการเรียน</div>
          <div className="text-[11px] text-text-muted">สำหรับนักเรียนที่อยากดูเป็นวิดีโอจากอาจารย์</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((v) => {
          const meta = platformMeta[v.platform] || platformMeta.youtube;
          const { Icon } = meta;
          return (
            <a key={v.platform}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${meta.bg} ${meta.hover}`}
              style={{ borderRadius: 'var(--radius-md)' }}>
              <Icon size={18} strokeWidth={2.2} className={`${meta.text} shrink-0`} />
              <span className={`text-caption font-bold flex-1 ${meta.text}`}>{v.label}</span>
              <ExternalLink size={13} strokeWidth={2.2} className="text-text-muted shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
