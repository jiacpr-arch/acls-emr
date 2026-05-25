// Cross-promo ads for sibling morroo.com tools.
// Shown as a single rotating card on non-clinical pages.
import { IS_BLS } from '../config/courseMode';

const baseAds = [
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
  {
    id: 'bls',
    name: 'BLS',
    tagline: 'ฝึก CPR & BLS ออนไลน์ ตามแนวทางล่าสุด',
    url: 'https://bls.morroo.com',
    icon: 'HeartPulse',
    tone: 'success',
  },
];

// Promote the sibling ACLS course only on the BLS build — on acls.morroo.com
// itself this would advertise the site to its own visitors.
const aclsAd = {
  id: 'acls',
  name: 'ACLS',
  tagline: 'เรียนต่อ ACLS ออนไลน์ + สอบใบประกาศ ILCOR 2025',
  url: 'https://acls.morroo.com',
  icon: 'HeartPulse',
  tone: 'danger',
};

export const morrooAds = IS_BLS ? [aclsAd, ...baseAds] : baseAds;

export function pickRandomAd(exceptId) {
  const pool = exceptId ? morrooAds.filter(a => a.id !== exceptId) : morrooAds;
  return pool[Math.floor(Math.random() * pool.length)];
}
