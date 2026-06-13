import { useEffect } from 'react';
import { X } from 'lucide-react';

// Modal เล่นวิดีโอ YouTube — รองรับทั้งแนวตั้ง (9:16 / Shorts) และแนวนอน (16:9)
// pattern เดียวกับ StudentIdentityModal / ClassGateModal (props open/onClose, fixed inset-0 z-50)
export default function VideoLightbox({ open, onClose, videoId, orientation = 'landscape', label }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !videoId) return null;

  const isPortrait = orientation === 'portrait';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const frameStyle = isPortrait
    ? { height: 'min(85vh, 760px)', aspectRatio: '9 / 16' }
    : { width: 'min(92vw, 900px)', aspectRatio: '16 / 9' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label || 'วิดีโอ'}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white transition-colors"
        style={{ borderRadius: '50%' }}
        aria-label="ปิด"
      >
        <X size={20} strokeWidth={2.4} />
      </button>
      <div
        className="relative max-w-full max-h-full overflow-hidden animate-slide-up"
        style={{ ...frameStyle, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-pop)' }}
        onClick={e => e.stopPropagation()}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title={label || 'วิดีโอ'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
