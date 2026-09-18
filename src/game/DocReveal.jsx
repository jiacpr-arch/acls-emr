import { useEffect, useState } from 'react';

// จำผลโหลดรูปต่อ URL ไว้ทั้ง session — กัน request ซ้ำๆ ไปหาไฟล์ที่ไม่มี
const imageCache = new Map(); // url -> true | false

function probeImage(url) {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache.set(url, true); resolve(true); };
    img.onerror = () => { imageCache.set(url, false); resolve(false); };
    img.src = url;
  });
}

const FALLBACK_LABEL = { lab: 'ผลตรวจแล็บ', xray: 'ภาพเอกซเรย์' };
const FALLBACK_ICON = { lab: '🧪', xray: '🩻' };

/**
 * เผยผลแล็บ/เอกซเรย์เป็นรูปจริงกลางจอ — image-first + card placeholder fallback
 * เหมือนแนวเดียวกับ CharacterSprite: probe /images/docs/{docKey}.webp
 * ไม่มีรูป → การ์ด placeholder ที่มีแค่ caption (เกมใช้งานได้ทันทีแม้รูปยังไม่มา)
 */
export default function DocReveal({ docKey, kind = 'lab', caption }) {
  const url = `/images/docs/${docKey}.webp`;
  const [probe, setProbe] = useState({ key: null, result: null });

  useEffect(() => {
    let alive = true;
    probeImage(url).then((ok) => { if (alive) setProbe({ key: docKey, result: ok }); });
    return () => { alive = false; };
  }, [docKey, url]);

  const hasImage = probe.key === docKey && probe.result === true;

  return (
    <div className={`cbs-docframe cbs-docframe-${kind}`}>
      {hasImage ? (
        <img src={url} alt={caption || FALLBACK_LABEL[kind]} className="cbs-docframe-img" draggable="false" />
      ) : (
        <div className="cbs-docframe-placeholder">
          <span className="cbs-docframe-icon">{FALLBACK_ICON[kind]}</span>
          <span className="cbs-docframe-placeholder-text">{caption || FALLBACK_LABEL[kind]}</span>
        </div>
      )}
      {caption && <div className="cbs-docframe-caption">{caption}</div>}
    </div>
  );
}
