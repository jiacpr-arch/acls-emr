import { IS_BLS } from '../config/courseMode';

// หัวข้อของ "วิดีโอบทเรียน" — คนละชุดกันระหว่าง ACLS/BLS (video_lessons แยกด้วย course_mode)
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

export const VIDEO_TOPICS = IS_BLS ? BLS_VIDEO_TOPICS : ACLS_VIDEO_TOPICS;

export const VIDEO_TOPIC_MAP = VIDEO_TOPICS.reduce((acc, tpc) => {
  acc[tpc.id] = tpc;
  return acc;
}, {});

// prefix ของ lessonId สำหรับ progress/quiz ของวิดีโอ — กันชนกับบท pre-course (pcNN)
export const VIDEO_LESSON_PREFIX = 'vidlesson:';
export const videoLessonKey = (id) => `${VIDEO_LESSON_PREFIX}${id}`;
