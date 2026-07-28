import { getYouTubeId } from './youtube';

// แยก Google Drive file id จากลิงก์ — รองรับ file/d/, open?id=, uc?id= และ /preview
export function getGoogleDriveId(url) {
  if (!url) return null;
  const m = url.match(
    /drive\.google\.com\/(?:file\/d\/([\w-]{10,})|(?:open|uc|thumbnail)\?(?:[^#\s]*&)?id=([\w-]{10,}))/
  );
  return m ? (m[1] || m[2]) : null;
}

// รวมทุกแหล่งวิดีโอที่เล่นใน lightbox ได้ → { type, id, embedUrl, thumbUrl } หรือ null ถ้าไม่รู้จัก
// Drive ต้องแชร์ไฟล์เป็น "ทุกคนที่มีลิงก์" จึงจะ embed/แสดง thumbnail ได้
export function getVideoSource(url) {
  const yt = getYouTubeId(url);
  if (yt) {
    return {
      type: 'youtube',
      id: yt,
      embedUrl: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      thumbUrl: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }
  const gd = getGoogleDriveId(url);
  if (gd) {
    return {
      type: 'drive',
      id: gd,
      embedUrl: `https://drive.google.com/file/d/${gd}/preview`,
      thumbUrl: `https://drive.google.com/thumbnail?id=${gd}&sz=w480`,
    };
  }
  return null;
}
