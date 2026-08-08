// Build-time course mode flag. Set VITE_COURSE_MODE=<mode> on each Vercel project
// (acls.morroo.com, bls.morroo.com, airway.morroo.com, defib.morroo.com, iv.morroo.com).
// Defaults to 'acls' so the existing acls.morroo.com deploy keeps working unchanged.
export const COURSE_MODES = ['acls', 'bls', 'airway', 'defib', 'iv'];

// Written as a chained ternary of literal string comparisons — NOT
// `COURSE_MODES.includes(raw)` — because Vite/esbuild only constant-folds
// (and therefore tree-shakes the other courses' bundles out of) this kind
// of expression when it collapses to a compile-time literal. `Array#includes`
// is a method call esbuild's minifier does not evaluate, so using it here
// would make every build ship all five courses' content.
const raw = import.meta.env.VITE_COURSE_MODE;
const MODE = raw === 'bls' ? 'bls'
  : raw === 'airway' ? 'airway'
  : raw === 'defib' ? 'defib'
  : raw === 'iv' ? 'iv'
  : 'acls';

export const COURSE_MODE = MODE;
export const IS_BLS = MODE === 'bls';
export const IS_ACLS = MODE === 'acls';
export const IS_AIRWAY = MODE === 'airway';
export const IS_DEFIB = MODE === 'defib';
export const IS_IV = MODE === 'iv';
// The three single-topic skill courses (airway / defib / iv) share the same
// shape — one lesson track, one pre/post test, one knowledge base, one
// scenario set — so most call sites only need "is this a skill course?"
// rather than checking each of the three separately.
export const IS_SKILL_COURSE = IS_AIRWAY || IS_DEFIB || IS_IV;

const COURSE_META = {
  bls: {
    id: 'bls-hcp',
    title: 'BLS for Healthcare Providers',
    titleTh: 'BLS สำหรับบุคลากรทางการแพทย์',
    shortName: 'BLS',
    standard: 'ILCOR-BLS-2025',
    themeColor: '#0EA5E9',
    themeColorDark: '#0284C7',
    passingScore: { lesson: 75, postTest: 84 },
    certTemplate: 'bls-hcp-ilcor-2025',
    certIdPrefix: 'JIA-BLS',
    certValidityMonths: 24,
    featuredVideo: {
      platform: 'youtube',
      videoId: 'g3_0kTW6Me8',
      title: 'BLS for Healthcare Providers — วิดีโอเต็มหลักสูตร',
      description: 'ดูวิดีโอนี้ก่อนเริ่มอ่านบทเรียน',
    },
  },
  acls: {
    id: 'als',
    title: 'ACLS Provider',
    titleTh: 'หลักสูตร ACLS',
    shortName: 'ACLS',
    standard: 'ILCOR-ACLS-2025',
    themeColor: '#DC2626',
    themeColorDark: '#B91C1C',
    passingScore: { lesson: 70, postTest: 85 },
    certTemplate: 'acls-ilcor-2025',
    certIdPrefix: 'JIA-ACLS',
    certValidityMonths: 24,
    featuredVideo: null,
  },
  airway: {
    id: 'airway-skills',
    title: 'Airway Management',
    titleTh: 'หลักสูตรการจัดการทางเดินหายใจ',
    shortName: 'Airway',
    standard: 'ILCOR-ACLS-2025',
    themeColor: '#059669',
    themeColorDark: '#047857',
    passingScore: { lesson: 75, postTest: 80 },
    certTemplate: 'airway-skills-2025',
    certIdPrefix: 'JIA-AW',
    certValidityMonths: 24,
    featuredVideo: null,
    theoryOnly: true,
  },
  defib: {
    id: 'defib-skills',
    title: 'Defibrillation & Electrical Therapy',
    titleTh: 'หลักสูตรการช็อกไฟฟ้าหัวใจ',
    shortName: 'Defib',
    standard: 'ILCOR-ACLS-2025',
    themeColor: '#D97706',
    themeColorDark: '#B45309',
    passingScore: { lesson: 75, postTest: 80 },
    certTemplate: 'defib-skills-2025',
    certIdPrefix: 'JIA-DF',
    certValidityMonths: 24,
    featuredVideo: null,
    theoryOnly: true,
  },
  iv: {
    id: 'iv-io-skills',
    title: 'IV / IO Access & Drug Delivery',
    titleTh: 'หลักสูตรการเปิดเส้นและให้ยา IV/IO',
    shortName: 'IV/IO',
    standard: 'ILCOR-ACLS-2025',
    themeColor: '#7C3AED',
    themeColorDark: '#6D28D9',
    passingScore: { lesson: 75, postTest: 80 },
    certTemplate: 'iv-io-skills-2025',
    certIdPrefix: 'JIA-IV',
    certValidityMonths: 24,
    featuredVideo: null,
    theoryOnly: true,
  },
};

export const courseMeta = COURSE_META[MODE];

// เส้นทางหน้า Q&A เชิงลึก — /qa-acls-deep (ACLS, path เดิม) กับ /qa-deep (BLS,
// เนื้อหา static — ดู src/services/qaDeepService.js) เป็นคนละ route กัน
export const QA_DEEP_PATH = IS_BLS ? '/qa-deep' : '/qa-acls-deep';

// Explicit N-way switch — used at new call sites instead of chained ternaries.
// Throws at build/run time if a branch is missing, instead of silently
// falling through to the ACLS branch the way `IS_BLS ? x : y` does.
export function byCourse(map) {
  if (!(MODE in map)) throw new Error(`byCourse: missing branch for course mode "${MODE}"`);
  return map[MODE];
}
