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

// ---- ระบบวิดีโอบทเรียน (video_lessons) เก็บ id ไว้ในคอลัมน์ youtube_id ----
// YouTube เก็บ id 11 ตัวตามเดิม / Google Drive เก็บเป็น "drive:<file_id>" ในคอลัมน์เดียวกัน

// แปลงค่าที่เก็บใน youtube_id → { type: 'youtube'|'drive', id } หรือ null ถ้าไม่รู้จัก
export function parseStoredVideoId(stored) {
  const s = (stored || '').trim();
  if (!s) return null;
  const d = s.match(/^drive:([\w-]{10,})$/);
  if (d) return { type: 'drive', id: d[1] };
  if (/^[\w-]{11}$/.test(s)) return { type: 'youtube', id: s };
  return null;
}

// แปลง input จากแอดมิน (ลิงก์ YouTube/Drive หรือค่าที่เก็บอยู่แล้ว) → ค่าที่เก็บลง youtube_id
// คืน '' ถ้าไม่ใช่ลิงก์/รูปแบบที่รองรับ
export function toStoredVideoId(input) {
  const s = (input || '').trim();
  if (!s) return '';
  const src = getVideoSource(s);
  if (src) return src.type === 'drive' ? `drive:${src.id}` : src.id;
  return parseStoredVideoId(s) ? s : '';
}
