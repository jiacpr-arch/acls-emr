// Cross-promo ads for sibling morroo.com tools.
// Shown as a single rotating card on non-clinical pages.
import { IS_BLS } from '../config/courseMode';

const allAds = [
  {
    id: 'morroo',
    name: 'Morroo',
    tagline: 'หมอรู้ — รวมความรู้สุขภาพและการแพทย์',
    url: 'https://www.morroo.com',
    icon: 'Hospital',
    tone: 'info',
  },
  {
    id: 'cpr',
    name: 'CPR',
    tagline: 'เรียนรู้การช่วยฟื้นคืนชีพ (CPR)',
    url: 'https://cpr.morroo.com',
    icon: 'Heart',
    tone: 'danger',
  },
  {
    id: 'bls',
    name: 'BLS',
    tagline: 'ฝึก CPR & BLS ออนไลน์ ตามแนวทางล่าสุด',
    url: 'https://bls.morroo.com',
    icon: 'HeartPulse',
    tone: 'success',
  },
  {
    id: 'acls',
    name: 'ACLS',
    tagline: 'เรียนต่อ ACLS ออนไลน์ + สอบใบประกาศนียบัตร ILCOR 2025',
    url: 'https://acls.morroo.com',
    icon: 'HeartPulse',
    tone: 'danger',
  },
  {
    id: 'emr',
    name: 'EMR',
    tagline: 'หลักสูตรผู้ปฏิบัติการฉุกเฉินการแพทย์',
    url: 'https://emr.morroo.com',
    icon: 'Stethoscope',
    tone: 'warning',
  },
  {
    id: 'firstaid',
    name: 'First Aid',
    tagline: 'เรียนรู้การปฐมพยาบาลเบื้องต้น',
    url: 'https://firstaid.morroo.com',
    icon: 'Bandage',
    tone: 'success',
  },
  {
    id: 'drug',
    name: 'Drug',
    tagline: 'ข้อมูลยาและการใช้ยา',
    url: 'https://drug.morroo.com',
    icon: 'Pill',
    tone: 'purple',
  },
  {
    id: 'pharma',
    name: 'Pharma',
    tagline: 'ความรู้เภสัชวิทยา',
    url: 'https://pharma.morroo.com',
    icon: 'TestTube',
    tone: 'info',
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
    id: 'pocket',
    name: 'Pocket',
    tagline: 'คู่มือแพทย์สรุปสั้น พกใส่มือถือ',
    url: 'https://pocket.morroo.com',
    icon: 'BookOpen',
    tone: 'purple',
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
    id: 'roodee',
    name: 'RooDee',
    tagline: 'รู้ดี — ตะลุยโจทย์ข้อสอบด้วย AI',
    url: 'https://roodee.me',
    icon: 'GraduationCap',
    tone: 'purple',
  },
];

// Never advertise the site to its own visitors — drop the ad matching the
// current build (bls.morroo.com vs acls.morroo.com).
const selfId = IS_BLS ? 'bls' : 'acls';

export const morrooAds = allAds.filter(a => a.id !== selfId);

export function pickRandomAd(exceptId) {
  const pool = exceptId ? morrooAds.filter(a => a.id !== exceptId) : morrooAds;
  return pool[Math.floor(Math.random() * pool.length)];
}
