import { Download, ImageIcon } from 'lucide-react';
import { useLongPressDownload } from '../../hooks/useLongPressDownload';

// รูปประกอบใต้เนื้อหา read step — ใช้แพตเทิร์น Figure เดียวกับ QASection (lazy + caption + กดค้างดาวน์โหลด)
function Figure({ img, fallbackAlt }) {
  const press = useLongPressDownload(img.src, img.alt || fallbackAlt);
  const { style, ...handlers } = press;
  return (
    <figure className="m-0">
      <img
        src={img.src}
        alt={img.alt || fallbackAlt}
        loading="lazy"
        className="w-full h-auto block"
        style={{ borderRadius: 'var(--radius-sm)', ...style }}
        {...handlers}
      />
      {img.caption && (
        <figcaption className="text-[12px] text-text-muted mt-1.5 leading-relaxed italic px-1">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function LessonImages({ images, fallbackAlt }) {
  const items = (images || []).filter(i => i.src);
  if (!items.length) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-info shrink-0">
          <ImageIcon size={13} strokeWidth={2.4} /> ภาพประกอบ
        </span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-3">
        {items.map((img, j) => <Figure key={img.id ?? j} img={img} fallbackAlt={fallbackAlt} />)}
        <p className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
          <Download size={12} strokeWidth={2.2} /> กดค้างที่รูปเพื่อดาวน์โหลด
        </p>
      </div>
    </div>
  );
}
