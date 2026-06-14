import { useRef } from 'react';

export function guessFilename(src, alt) {
  try {
    const url = new URL(src, window.location.href);
    const last = url.pathname.split('/').pop();
    if (last && /\.[a-z0-9]+$/i.test(last)) return decodeURIComponent(last);
  } catch { /* ignore */ }
  const base = (alt || 'infographic')
    .replace(/[^\w฀-๿-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'infographic';
  return `${base}.png`;
}

// Fetch the image as a blob so the browser saves it instead of navigating.
// A plain <a download> is ignored for cross-origin (Supabase storage) URLs.
export async function downloadImage(src, alt) {
  const filename = guessFilename(src, alt);
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    window.open(src, '_blank', 'noopener');
  }
}

// Long-press an image to download it. On touch devices we also suppress the
// native "save image" callout so the press triggers our download instead.
export function useLongPressDownload(src, alt, delay = 500) {
  const timer = useRef(null);
  const start = useRef(null);
  const touched = useRef(false);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onTouchStart = (e) => {
    touched.current = true;
    const t = e.touches?.[0];
    start.current = t ? { x: t.clientX, y: t.clientY } : null;
    clear();
    timer.current = setTimeout(() => downloadImage(src, alt), delay);
  };

  const onTouchMove = (e) => {
    if (!start.current) return;
    const t = e.touches?.[0];
    if (!t) return;
    if (Math.abs(t.clientX - start.current.x) > 12 || Math.abs(t.clientY - start.current.y) > 12) {
      clear();
    }
  };

  const onContextMenu = (e) => {
    if (touched.current) e.preventDefault();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onContextMenu,
    style: { WebkitTouchCallout: 'none', userSelect: 'none' },
    draggable: false,
  };
}
