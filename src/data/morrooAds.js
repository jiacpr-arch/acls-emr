// Cross-promo ads for sibling morroo.com tools.
// Shown as a single rotating card on non-clinical pages.

export const morrooAds = [
  {
    id: 'morroo',
    name: 'Morroo Suite',
    tagline: 'ระบบ EMR + AI ครบจบ สำหรับคลินิก',
    url: 'https://www.morroo.com',
    icon: 'Hospital',
    tone: 'info',
  },
  {
    id: 'pocket',
    name: 'Pocket',
    tagline: 'คู่มือแพทย์สรุปสั้น พกใส่มือถือ',
    url: 'https://pocket.morroo.com',
    icon: 'BookOpen',
    tone: 'purple',
  },
  {
    id: 'lab',
    name: 'Lab',
    tagline: 'แปลผล lab ด้วย AI ภาษาไทย',
    url: 'https://lab.morroo.com',
    icon: 'FlaskConical',
    tone: 'success',
  },
  {
    id: 'icd10',
    name: 'ICD-10',
    tagline: 'ค้นรหัสโรคไทย-อังกฤษ เร็วทันใจ',
    url: 'https://icd10.morroo.com',
    icon: 'FileText',
    tone: 'warning',
  },
  {
    id: 'advice',
    name: 'Advice',
    tagline: 'AI ปรึกษาสุขภาพภาษาไทย',
    url: 'https://advice.morroo.com',
    icon: 'MessageSquare',
    tone: 'shock',
  },
];

export function pickRandomAd(exceptId) {
  const pool = exceptId ? morrooAds.filter(a => a.id !== exceptId) : morrooAds;
  return pool[Math.floor(Math.random() * pool.length)];
}
