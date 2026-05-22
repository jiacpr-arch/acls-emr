import { useState } from 'react';
import { Play, Maximize2, ExternalLink } from 'lucide-react';

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function VideoThumb({ videoId, label, watchUrl }) {
  const [loaded, setLoaded] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="dash-card !p-0 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {loaded ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full group cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%), url(${thumb})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-label={`เล่นวีดีโอ ${label}`}
          >
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 inline-flex items-center justify-center bg-white/95 group-hover:scale-110 transition-transform"
                style={{ borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.32)' }}>
                <Play size={24} strokeWidth={2.4} className="text-danger ml-1" />
              </span>
            </span>
            <span className="absolute left-3 right-3 bottom-2">
              <span className="block text-white text-sm font-bold drop-shadow">
                {label}
              </span>
            </span>
          </button>
        )}
      </div>
      {loaded && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-bg-tertiary">
          <span className="text-[11px] text-text-muted truncate">{label}</span>
          <a href={watchUrl} target="_blank" rel="noopener noreferrer"
            className="text-[11px] font-bold text-info inline-flex items-center gap-1 hover:underline shrink-0">
            <Maximize2 size={12} strokeWidth={2.4} /> YouTube
          </a>
        </div>
      )}
    </div>
  );
}

export default function LessonVideos({ videos }) {
  const items = (videos || []).filter(v => v.url);
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Play size={14} strokeWidth={2.4} className="text-info" />
        <span className="text-overline text-text-muted">วิดีโอประกอบบทนี้</span>
      </div>
      <div className={`grid gap-3 ${items.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {items.map((v, i) => {
          const id = getYouTubeId(v.url);
          if (id) {
            return (
              <VideoThumb
                key={`${v.url}-${i}`}
                videoId={id}
                label={v.label}
                watchUrl={v.url}
              />
            );
          }
          return (
            <a key={`${v.url}-${i}`} href={v.url} target="_blank" rel="noopener noreferrer"
              className="dash-card flex items-center gap-2 hover:bg-bg-tertiary/50 transition-colors">
              <ExternalLink size={14} strokeWidth={2.2} className="text-info shrink-0" />
              <span className="text-caption font-bold text-text-primary truncate">{v.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
