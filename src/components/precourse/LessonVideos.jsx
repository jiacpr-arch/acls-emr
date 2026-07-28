import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import VideoLightbox from './VideoLightbox';
import { getVideoSource } from '../../utils/videoSource';

// การ์ด thumbnail เล็ก — คลิกเพื่อเปิด lightbox (ไม่ embed inline เพื่อไม่ดันเลย์เอาต์ให้ยาว)
function VideoCard({ thumb, label, orientation, onPlay }) {
  const isPortrait = orientation === 'portrait';
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group relative overflow-hidden shrink-0 cursor-pointer"
      style={{
        width: isPortrait ? 132 : 200,
        aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
        borderRadius: 'var(--radius-lg)',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%), url(${thumb})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={`เล่นวีดีโอ ${label}`}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-11 h-11 inline-flex items-center justify-center bg-white/95 group-hover:scale-110 transition-transform"
          style={{ borderRadius: '50%', boxShadow: '0 6px 18px rgba(0,0,0,0.32)' }}>
          <Play size={20} strokeWidth={2.4} className="text-danger ml-0.5" />
        </span>
      </span>
      <span className="absolute left-2 right-2 bottom-1.5 block text-white text-2xs font-bold leading-tight drop-shadow line-clamp-2">
        {label}
      </span>
    </button>
  );
}

export default function LessonVideos({ videos, title = 'วิดีโอประกอบบทนี้', onPlay }) {
  const items = (videos || []).filter(v => v.url);
  const [active, setActive] = useState(null);
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Play size={14} strokeWidth={2.4} className="text-info" />
        <span className="text-overline text-text-muted">{title}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((v, i) => {
          const source = getVideoSource(v.url);
          if (source) {
            return (
              <VideoCard
                key={`${v.url}-${i}`}
                thumb={source.thumbUrl}
                label={v.label}
                orientation={v.orientation}
                onPlay={() => { setActive({ embedUrl: source.embedUrl, label: v.label, orientation: v.orientation }); onPlay?.(v, i); }}
              />
            );
          }
          // ไม่ใช่ลิงก์ YouTube / Google Drive → fallback เป็นลิงก์ภายนอก
          return (
            <a key={`${v.url}-${i}`} href={v.url} target="_blank" rel="noopener noreferrer"
              className="dash-card flex items-center gap-2 hover:bg-bg-tertiary/50 transition-colors">
              <ExternalLink size={14} strokeWidth={2.2} className="text-info shrink-0" />
              <span className="text-caption font-bold text-text-primary truncate">{v.label}</span>
            </a>
          );
        })}
      </div>

      <VideoLightbox
        open={!!active}
        onClose={() => setActive(null)}
        embedUrl={active?.embedUrl}
        orientation={active?.orientation}
        label={active?.label}
      />
    </div>
  );
}
