// Code Blue Simulator — คลังโจทย์ (story-driven, Ace Attorney style)
//
// โครงนี้คือ "ข้อมูลโจทย์" ล้วนๆ — engine อยู่ที่ src/game/storyEngine.js
// ตัวละครอ้างด้วย charId จาก src/game/characters.js (who) + สีหน้า (pose)
// text อนุญาต HTML แค่ <span class="cbs-em"> สำหรับเน้นคำ
//
// แต่ละเคสมี field:
//   id, title, subtitle, level ('basic'|'intermediate'|'megacode'),
//   track (หมวดในหน้าเลือกเคส — key ของ TRACK_META, ไม่ระบุ = 'other'),
//   course ('acls'|'bls' — ไม่ระบุ = ตามได้ทั้งสองโหมด), hiddenCause, story[],
//   bg (ฉากพื้นหลังบนเวที — key ของ BACKGROUNDS, ไม่ระบุ = ห้องฉุกเฉิน er_bay)
//
// คลังกรองตาม COURSE_MODE: acls.morroo.com เห็นเคส ACLS,
// bls.morroo.com (MorRoo) เห็นเคส BLS — engine เดียวกัน คนละชุดโจทย์
//
// อนาคต: ระบบเขียนโจทย์เอง (admin editor / AI generate) จะผลิต object
// หน้าตาแบบเดียวกันนี้ลง Supabase แล้ว merge เข้าคลังได้เลย

import { COURSE_MODE } from '../config/courseMode';
// เคสของแต่ละคอร์สแยกไฟล์ต่างหากใน scenarioPacks/ แล้ว resolve ผ่าน Vite alias
// '@scenario-pack' (ดู vite.config.js) — แต่ละ build จึงมีแค่เคสของคอร์สตัวเองอยู่ใน
// module graph จริงๆ ไม่ใช่ import ทั้ง 60 ไฟล์มาแล้วค่อย .filter() ตอน runtime
// (แบบเดิม Rollup ตัดสาขาที่ไม่ใช้ทิ้งไม่ได้ เพราะทุก branch ถูกอ้างถึงใน array เดียวกัน)
import { allScenarios } from '@scenario-pack';

// เคสที่ไม่ระบุ course ถือว่าเป็น acls (ค่าเริ่มต้นเดิม)
function courseOf(s) {
  return s.course || 'acls';
}

// คลังสำหรับโหมดปัจจุบัน (build-time flag)
export const scenarios = allScenarios.filter((s) => courseOf(s) === COURSE_MODE);

// เคสเริ่มต้น (ตัวแรกของโหมด) — คงชื่อ export เดิมไว้เพื่อ backward-compat
export const scenario = scenarios[0] || allScenarios[0];

export function getScenarioById(id) {
  return scenarios.find((s) => s.id === id) || scenario;
}

// pool สำหรับเล่นจริง = built-in (ของโหมดนี้) + โจทย์ published จาก Supabase (ของโหมดนี้)
// built-in เป็น fallback ที่มีเสมอ แม้ Supabase ล่ม
export async function loadPlayableScenarios() {
  try {
    const { fetchPublishedScenarios } = await import('../services/codeBlueScenarioService');
    const published = await fetchPublishedScenarios();
    return [...scenarios, ...published];
  } catch {
    return scenarios;
  }
}

// สถานะผ่านเกม sim สำหรับเงื่อนไขใบประกาศนียบัตร BLS — นับเฉพาะเคส built-in
// ของโหมดปัจจุบัน (โจทย์ published จาก Supabase ไม่นับ ไม่งั้น admin เพิ่มโจทย์ใหม่
// แล้วใบประกาศของคนที่ผ่านครบไปแล้วจะถูกล็อกย้อนหลัง)
// หมายเหตุ: key เดียวกับ CLEARED_KEY ใน CodeBlueSim.jsx
export function simGameStatus() {
  let clearedIds = [];
  try { clearedIds = JSON.parse(localStorage.getItem('acls_codeblue_cleared')) || []; }
  catch { /* ignore */ }
  const cleared = new Set(clearedIds);
  const done = scenarios.filter((s) => cleared.has(s.id)).length;
  return { done, total: scenarios.length, allPassed: scenarios.length > 0 && done === scenarios.length };
}

// ระดับความยากของเคส — โหมด BLS ไม่มีคำว่า megacode ใช้ป้าย "ทีมกู้ชีพ" แทน (key เดิม)
// คอร์สทักษะเดี่ยว (airway/defib/iv) ก็ไม่ใช่ megacode จริง — ใช้ "ขั้นสูง" แทน
const MEGACODE_LABEL = { bls: 'ทีมกู้ชีพ', airway: 'ขั้นสูง', defib: 'ขั้นสูง', iv: 'ขั้นสูง' };
export const LEVEL_META = {
  basic: { label: 'พื้นฐาน', order: 0 },
  intermediate: { label: 'ปานกลาง', order: 1 },
  megacode: { label: MEGACODE_LABEL[COURSE_MODE] || 'Megacode', order: 2 },
};

// หมวดของเคส (track) — ACLS จัดตาม algorithm, BLS จัดตามกลุ่มผู้ป่วย/สถานการณ์
// หน้าเลือกเคสจัดกลุ่มตามนี้ แทนการกองรวมตาม level ที่ยาวเป็นเส้นเดียว
const ACLS_TRACK_META = {
  arrest: {
    label: 'Cardiac Arrest หลัก', icon: '🫀', order: 0,
    desc: 'VF/pVT · PEA/Asystole — วนลูป CPR-Shock-ยา ให้เป็นอัตโนมัติ',
  },
  brady: {
    label: 'Bradycardia', icon: '🐢', order: 1,
    desc: 'หัวใจเต้นช้า — ประเมิน stable/unstable, atropine, pacing',
  },
  tachy: {
    label: 'Tachycardia', icon: '⚡', order: 2,
    desc: 'หัวใจเต้นเร็ว — แคบ/กว้าง สม่ำเสมอ/ไม่สม่ำเสมอ, cardioversion',
  },
  acs: {
    label: 'ACS', icon: '💔', order: 3,
    desc: 'เจ็บแน่นหน้าอก — STEMI/NSTEMI, ECG 12 lead, เปิดทาง PCI',
  },
  stroke: {
    label: 'Stroke', icon: '🧠', order: 4,
    desc: 'FAST · DTX · CT · tPA window — แข่งกับเวลา ทุกนาทีคือเนื้อสมอง',
  },
  causes: {
    label: "สืบหาสาเหตุ (H's & T's)", icon: '🔍', order: 5,
    desc: 'arrest ที่ CPR อย่างเดียวไม่พอ — หาสาเหตุที่แก้ได้ให้เจอ',
  },
  special: {
    label: 'สถานการณ์พิเศษ', icon: '🚨', order: 6,
    desc: 'ตั้งครรภ์ · trauma · สำลัก — สถานการณ์ที่ algorithm ต้องปรับ',
  },
  other: { label: 'เคสอื่นๆ', icon: '📋', order: 9, desc: '' },
};

// BLS ของ MorRoo เป็นหลักสูตร "สำหรับบุคลากรทางการแพทย์" — หมวดจึงจัดตามทักษะที่ผู้ปฏิบัติ
// ระดับ BLS ต้องทำได้จริง (ประเมิน · คลำชีพจร · ช่วยหายใจ · AED · ทำงานเป็นทีม) ไม่ใช่หมวดแบบผู้พบเหตุทั่วไป
const BLS_TRACK_META = {
  adult: {
    label: 'ผู้ใหญ่: BLS Survey · CPR · AED', icon: '🫀', order: 0,
    desc: 'ประเมิน–เรียกช่วย–คลำชีพจร ≤10 วิ · กดลึก 5-6 ซม. เร็ว 100-120 · ใช้ AED ให้ไว',
  },
  breathing: {
    label: 'คลำชีพจร & ช่วยหายใจ', icon: '🫁', order: 1,
    desc: 'มีชีพจรแต่ไม่หายใจต้องทำอะไร — ผู้ใหญ่ 1 ครั้ง/6 วิ · เด็ก 1 ครั้ง/2-3 วิ · OPA + bag-mask',
  },
  child: {
    label: 'เด็กและทารก', icon: '👶', order: 2,
    desc: 'ตัวเลขคนละชุด — ลึก 1/3 อก · ทารกคลำต้นแขน เด็กคลำคอ/ขาหนีบ · ชีพจร <60 ก็เริ่มกด · 15:2 เมื่อสองคน',
  },
  choking: {
    label: 'สำลัก', icon: '🌬', order: 3,
    desc: 'ผู้ใหญ่ตบหลังสลับกระทุ้งท้อง · คนท้อง/อ้วนมากใช้กระแทกอก · ทารกตบหลัง 5 สลับกระแทกอก 5',
  },
  team: {
    label: 'ทีมในโรงพยาบาล & ขอบเขตบทบาท', icon: '🏥', order: 4,
    desc: 'Code Blue · สื่อสารแบบทวนคำสั่ง · ส่งเวรแบบ SBAR — และเส้นแบ่งว่าอะไรต้องรอทีมขั้นสูง',
  },
  special: {
    label: 'สถานการณ์พิเศษ', icon: '🚨', order: 5,
    desc: 'ตั้งครรภ์ · จมน้ำ · ยาเกินขนาด — สถานการณ์ที่ขั้นตอนพื้นฐานต้องปรับ',
  },
  other: { label: 'เคสอื่นๆ', icon: '📋', order: 9, desc: '' },
};

// คอร์สทักษะเดี่ยว — แต่ละ track ผูกตรงกับหนึ่งทักษะย่อยของคอร์สนั้น (ไม่ปนกับ track ของ ACLS/BLS)
const AIRWAY_TRACK_META = {
  basicAirway: {
    label: 'เปิดทางเดินหายใจ + OPA/NPA', icon: '🫁', order: 0,
    desc: 'head-tilt–chin-lift · เลือก OPA/NPA ตาม gag reflex · วัดขนาด · เทคนิคใส่',
  },
  ventilation: {
    label: 'Bag-Mask Ventilation', icon: '💨', order: 1,
    desc: 'E-C clamp คนเดียว · seal ที่ดี · จังหวะบีบไม่ให้ลมเข้ากระเพาะ',
  },
  advanced: {
    label: 'ทางเดินหายใจขั้นสูง', icon: '🔬', order: 2,
    desc: 'SGA ระหว่าง CPR ไม่หยุดกด · waveform capnography · จับสัญญาณ ROSC',
  },
  other: { label: 'เคสอื่นๆ', icon: '📋', order: 9, desc: '' },
};

const DEFIB_TRACK_META = {
  aed: {
    label: 'AED สำหรับ VF', icon: '⚡', order: 0,
    desc: 'เริ่ม CPR ระหว่างรอเครื่อง · แปะ pads ถูกตำแหน่ง · ช็อกอย่างปลอดภัย',
  },
  manual: {
    label: 'Manual Defibrillator', icon: '🔋', order: 1,
    desc: 'ตั้งพลังงาน · ลด peri-shock pause · ช็อกซ้ำตามรอบพร้อมยา',
  },
  electrical: {
    label: 'Cardioversion & Pacing', icon: '📟', order: 2,
    desc: 'Synchronized cardioversion สำหรับ unstable tachycardia · โหมด Sync',
  },
  other: { label: 'เคสอื่นๆ', icon: '📋', order: 9, desc: '' },
};

const IV_TRACK_META = {
  peripheral: {
    label: 'Peripheral IV', icon: '💉', order: 0,
    desc: 'เลือกเบอร์เข็ม/ตำแหน่งเส้น · ยืนยัน flashback · bolus สารน้ำ',
  },
  io: {
    label: 'Intraosseous (IO)', icon: '🦴', order: 1,
    desc: 'เปลี่ยนไป IO เมื่อ IV ล้มเหลว · ตำแหน่ง proximal tibia · ยืนยันก่อนให้ยา',
  },
  drugs: {
    label: 'ให้ยาระหว่าง CPR', icon: '💊', order: 2,
    desc: 'bolus + flush 20 mL · ยกแขน · รอบเวลาให้ยา · จัดการเส้นที่ infiltrate',
  },
  other: { label: 'เคสอื่นๆ', icon: '📋', order: 9, desc: '' },
};

const TRACK_META_BY_MODE = {
  bls: BLS_TRACK_META,
  airway: AIRWAY_TRACK_META,
  defib: DEFIB_TRACK_META,
  iv: IV_TRACK_META,
};

export const TRACK_META = TRACK_META_BY_MODE[COURSE_MODE] || ACLS_TRACK_META;

// เคสที่ไม่ระบุ track (เช่น โจทย์เก่าจาก Supabase) ตกหมวด 'other'
export function trackOf(s) {
  return TRACK_META[s.track] ? s.track : 'other';
}

// ── ฉากพื้นหลังบนเวที ──────────────────────────────────────────────────
// ไฟล์อยู่ที่ public/images/backgrounds/{key}.webp — ดูสเปกและ prompt สร้างภาพใน docs/backgrounds.md
// ฉากใช้ร่วมกันหลายเคส (ไม่ใช่ฉากละเคส) เคสที่ไม่ระบุ bg ใช้ er_bay เหมือนเดิม
export const BACKGROUNDS = {
  er_bay: 'ห้องฉุกเฉิน (ค่าเริ่มต้น)',
  ward_night: 'หอผู้ป่วยกลางดึก',
  public_indoor: 'ที่สาธารณะในร่ม (ห้าง/โรงอาหาร)',
  home_room: 'บ้าน/ห้องพัก',
  poolside: 'ริมสระว่ายน้ำ/ริมน้ำกลางแจ้ง',
  pediatric: 'ห้องตรวจกุมารเวช',
  delivery_room: 'ห้องคลอด',
  ambulance: 'ในรถกู้ชีพ',
  ct_room: 'ห้อง CT',
  cath_lab: 'ห้องสวนหัวใจ (Cath Lab)',
  outdoor_street: 'ริมถนน/หน้าตึกแถว',
};
export const DEFAULT_BACKGROUND = 'er_bay';

// URL พื้นหลังของเคส — key ที่ไม่รู้จัก (เช่นโจทย์จาก Supabase ที่พิมพ์ผิด) ตกไปใช้ค่าเริ่มต้น
// จึงไม่มีทางได้เวทีที่ภาพหาย
export function backgroundUrl(s) {
  const key = s && BACKGROUNDS[s.bg] ? s.bg : DEFAULT_BACKGROUND;
  return `/images/backgrounds/${key}.webp`;
}
