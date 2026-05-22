import { useState } from 'react';
import { Play, Maximize2 } from 'lucide-react';

// Renders a featured YouTube video at the top of the pre-course landing.
// Click-to-load (no iframe until user clicks) so first paint isn't bogged
// down by the YouTube player. Lazy approach keeps Lighthouse happy.
export default function FeaturedVideo({ video }) {
  const [loaded, setLoaded] = useState(false);
  if (!video?.videoId) return null;

  const thumb = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;
  const watchUrl = `https://youtu.be/${video.videoId}`;

  return (
    <div className="dash-card !p-0 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* 16:9 aspect-ratio video frame */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        {loaded ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={video.title || 'Featured video'}
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
            aria-label="Play featured video"
          >
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 inline-flex items-center justify-center bg-white/95 group-hover:scale-110 transition-transform"
                style={{ borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.32)' }}>
                <Play size={28} strokeWidth={2.4} className="text-danger ml-1" />
              </span>
            </span>
            <span className="absolute left-3 right-3 bottom-2 text-left">
              <span className="block text-white text-sm font-bold drop-shadow">
                {video.title || 'Featured video'}
              </span>
              {video.description && (
                <span className="block text-white/85 text-[11px] mt-0.5 drop-shadow">
                  {video.description}
                </span>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Footer with open-on-YouTube link */}
      {loaded && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-bg-tertiary">
          <span className="text-[11px] text-text-muted truncate">
            {video.title || 'Featured video'}
          </span>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-info inline-flex items-center gap-1 hover:underline shrink-0"
          >
            <Maximize2 size={12} strokeWidth={2.4} /> YouTube
          </a>
        </div>
      )}
    </div>
  );
}
