// สื่อประกอบ 3 หน้า Guide ของ BLS (AED / Algorithm / Choking) — ที่เดียวที่ต้องแก้เมื่อมีลิงก์วิดีโอ/รูปจริง
//
//   video: { url: 'https://youtu.be/xxxx', label: 'ชื่อคลิป', orientation: 'portrait' | 'landscape' }
//   image: { src: '/images/bls/<page>/<name>.webp', alt: 'คำอธิบายรูป', caption: 'คำบรรยายใต้รูป (ถ้ามี)' }
//
// รูปให้วางไฟล์ไว้ที่ public/images/bls/<page>/ ตาม key ด้านล่าง แล้วอ้าง path แบบ /images/bls/...

// key ตรงกับ steps[].n ใน src/pages/BLSAedGuide.jsx (1–5)
export const aedStepMedia = {
  1: { videos: [/* { url: '', label: 'เปิดเครื่อง AED', orientation: 'portrait' } */], images: [] },
  2: { videos: [], images: [] },
  3: { videos: [], images: [] },
  4: { videos: [], images: [] },
  5: { videos: [], images: [] },
};

// key ตรงกับ variants[].id ใน src/pages/BLSAlgorithm.jsx
export const algorithmMedia = {
  adult: { videos: [], images: [] },
  pediatric: { videos: [], images: [] },
  infant: { videos: [], images: [] },
};

// key ตรงกับ sections[].id ใน src/pages/BLSChokingRelief.jsx
export const chokingMedia = {
  adult: { videos: [], images: [] },
  infant: { videos: [], images: [] },
  unconscious: { videos: [], images: [] },
};

function hasMedia(mediaMap) {
  return Object.values(mediaMap).some(
    m => (m.videos ?? []).some(v => v.url) || (m.images ?? []).some(i => i.src)
  );
}

export function guideHasAnyMedia(mediaMap) {
  return hasMedia(mediaMap);
}
