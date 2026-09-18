import { IS_BLS, IS_AIRWAY, IS_DEFIB, IS_IV } from '../config/courseMode';

// หัวข้อของ "วิดีโอบทเรียน" — คนละชุดกันระหว่างคอร์ส (video_lessons แยกด้วย course_mode)
// ใช้ร่วมกันระหว่างหน้าไลบรารี, หน้าแอดมิน และเงื่อนไขใบประกาศนียบัตร
// id ต้องเสถียร (ใช้เป็น topic ในตาราง video_lessons) — ห้ามแก้ภายหลังโดยไม่ migrate ข้อมูล
const ACLS_VIDEO_TOPICS = [
  { id: 'airway',     emoji: '💨', label: 'ทางเดินหายใจ',        en: 'Airway' },
  { id: 'ekg',        emoji: '📈', label: 'การอ่าน EKG',          en: 'EKG / Rhythm' },
  { id: 'defib',      emoji: '⚡', label: 'การช็อกไฟฟ้า',         en: 'Defibrillation' },
  { id: 'brady',      emoji: '🐢', label: 'หัวใจเต้นช้า',          en: 'Bradycardia' },
  { id: 'tachy',      emoji: '🏃', label: 'หัวใจเต้นเร็ว',          en: 'Tachycardia' },
  { id: 'arrest',     emoji: '🫀', label: 'ภาวะหัวใจหยุดเต้น',      en: 'Cardiac Arrest' },
  { id: 'iv',         emoji: '💉', label: 'ยา (IV)',               en: 'IV Drugs' },
  { id: 'postarrest', emoji: '💗', label: 'ดูแลหลังหัวใจหยุดเต้น',  en: 'Post-ROSC' },
  { id: 'bls',        emoji: '🆘', label: 'CPR/BLS พื้นฐาน',       en: 'BLS / CPR' },
];

const BLS_VIDEO_TOPICS = [
  { id: 'chain',      emoji: '⛓️', label: 'Chain of Survival',       en: 'Chain of Survival' },
  { id: 'cpr-adult',  emoji: '💗', label: 'CPR ผู้ใหญ่คุณภาพสูง',    en: 'Adult CPR' },
  { id: 'aed',        emoji: '⚡', label: 'การใช้ AED',              en: 'AED' },
  { id: 'team',       emoji: '👥', label: '2-rescuer และ Team',      en: '2-Rescuer & Team' },
  { id: 'inhospital', emoji: '🏥', label: 'BLS ในโรงพยาบาล',         en: 'In-Hospital BLS' },
  { id: 'pediatric',  emoji: '👶', label: 'CPR เด็ก/ทารก',           en: 'Pediatric / Infant CPR' },
  { id: 'choking',    emoji: '🫁', label: 'ทางเดินหายใจอุดกั้น',      en: 'Choking / FBAO' },
  { id: 'special',    emoji: '🚨', label: 'สถานการณ์พิเศษ',          en: 'Special Situations' },
];

const AIRWAY_VIDEO_TOPICS = [
  { id: 'assess',    emoji: '🫁', label: 'ประเมิน/เปิดทางเดินหายใจ', en: 'Assess & Open Airway' },
  { id: 'opa-npa',   emoji: '🧰', label: 'OPA / NPA',                 en: 'OPA / NPA' },
  { id: 'bvm',       emoji: '👝', label: 'Bag-Mask Ventilation',      en: 'Bag-Mask Ventilation' },
  { id: 'advanced',  emoji: '📈', label: 'Advanced Airway & Capnography', en: 'Advanced Airway' },
  { id: 'fbao',      emoji: '🆘', label: 'ทางเดินหายใจอุดกั้น',       en: 'Choking / FBAO' },
];

const DEFIB_VIDEO_TOPICS = [
  { id: 'principles', emoji: '⚡', label: 'หลักการช็อกไฟฟ้า',        en: 'Defib Principles' },
  { id: 'aed-manual', emoji: '🧰', label: 'AED & Manual Defib',       en: 'AED & Manual Defib' },
  { id: 'ccf',        emoji: '⏱️', label: 'ลด Peri-shock Pause',      en: 'Peri-shock Pause' },
  { id: 'cardioversion', emoji: '🔄', label: 'Synchronized Cardioversion', en: 'Cardioversion' },
  { id: 'pacing',     emoji: '🫀', label: 'Transcutaneous Pacing',    en: 'Pacing' },
];

const IV_VIDEO_TOPICS = [
  { id: 'peripheral', emoji: '💉', label: 'Peripheral IV',            en: 'Peripheral IV' },
  { id: 'io',         emoji: '🦴', label: 'Intraosseous Access',      en: 'IO Access' },
  { id: 'drugs-cpr',  emoji: '💊', label: 'ให้ยาระหว่าง CPR',         en: 'Drugs During CPR' },
  { id: 'routes',     emoji: '🧪', label: 'ยาและ Route',              en: 'Drugs & Routes' },
  { id: 'fluids',     emoji: '🩸', label: 'สารน้ำและ Hypovolemia',    en: 'Fluids & Hypovolemia' },
];

export const VIDEO_TOPICS = IS_BLS ? BLS_VIDEO_TOPICS
  : IS_AIRWAY ? AIRWAY_VIDEO_TOPICS
  : IS_DEFIB ? DEFIB_VIDEO_TOPICS
  : IS_IV ? IV_VIDEO_TOPICS
  : ACLS_VIDEO_TOPICS;

export const VIDEO_TOPIC_MAP = VIDEO_TOPICS.reduce((acc, tpc) => {
  acc[tpc.id] = tpc;
  return acc;
}, {});

// prefix ของ lessonId สำหรับ progress/quiz ของวิดีโอ — กันชนกับบท pre-course (pcNN)
export const VIDEO_LESSON_PREFIX = 'vidlesson:';
export const videoLessonKey = (id) => `${VIDEO_LESSON_PREFIX}${id}`;
