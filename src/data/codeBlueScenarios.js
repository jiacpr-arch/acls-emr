// Code Blue Simulator — คลังโจทย์ (story-driven, Ace Attorney style)
//
// โครงนี้คือ "ข้อมูลโจทย์" ล้วนๆ — engine อยู่ที่ src/game/storyEngine.js
// ตัวละครอ้างด้วย charId จาก src/game/characters.js (who) + สีหน้า (pose)
// text อนุญาต HTML แค่ <span class="cbs-em"> สำหรับเน้นคำ
//
// แต่ละเคสมี field:
//   id, title, subtitle, level ('basic'|'intermediate'|'megacode'),
//   track (หมวดในหน้าเลือกเคส — key ของ TRACK_META, ไม่ระบุ = 'other'),
//   course ('acls'|'bls' — ไม่ระบุ = ตามได้ทั้งสองโหมด), hiddenCause, story[]
//
// คลังกรองตาม COURSE_MODE: acls.morroo.com เห็นเคส ACLS,
// bls.morroo.com (MorRoo) เห็นเคส BLS — engine เดียวกัน คนละชุดโจทย์
//
// อนาคต: ระบบเขียนโจทย์เอง (admin editor / AI generate) จะผลิต object
// หน้าตาแบบเดียวกันนี้ลง Supabase แล้ว merge เข้าคลังได้เลย

import { COURSE_MODE } from '../config/courseMode';
import { vfArrest } from './scenarios/vfArrest';
import { peaHyperK } from './scenarios/peaHyperK';
import { blsCollapse } from './scenarios/blsCollapse';
import { blsChoking } from './scenarios/blsChoking';
// BLS pack (MorRoo) — เคสสำหรับ bls.morroo.com จัดหมวดแบบ BLS (ผู้ใหญ่/เด็ก/สำลัก/พิเศษ)
import { blsHandsOnly } from './scenarios/blsHandsOnly';
import { blsAedWet } from './scenarios/blsAedWet';
import { blsTeamWard } from './scenarios/blsTeamWard';
import { blsChildDrowning } from './scenarios/blsChildDrowning';
import { blsInfantCpr } from './scenarios/blsInfantCpr';
import { blsInfantChoking } from './scenarios/blsInfantChoking';
import { blsPregnantChoking } from './scenarios/blsPregnantChoking';
import { blsOpioid } from './scenarios/blsOpioid';
// ACLS basic pack — เคสเดี่ยว ทีละ algorithm/แขนงย่อย ให้ฝึกก่อนไป megacode
import { peaAsystoleBasic } from './scenarios/peaAsystoleBasic';
import { bradycardiaBasic } from './scenarios/bradycardiaBasic';
import { bradycardiaStableBasic } from './scenarios/bradycardiaStableBasic';
import { tachycardiaBasic } from './scenarios/tachycardiaBasic';
import { tachyAfibBasic } from './scenarios/tachyAfibBasic';
import { tachyWideVtBasic } from './scenarios/tachyWideVtBasic';
import { tachyUnstableBasic } from './scenarios/tachyUnstableBasic';
import { acsBasic } from './scenarios/acsBasic';
import { acsNstemiBasic } from './scenarios/acsNstemiBasic';
import { strokeIschemicBasic } from './scenarios/strokeIschemicBasic';
import { strokeMimicHypo } from './scenarios/strokeMimicHypo';
import { strokeHemorrhagic } from './scenarios/strokeHemorrhagic';
import { strokeTia } from './scenarios/strokeTia';
import { strokeLvoWakeup } from './scenarios/strokeLvoWakeup';
import { strokeBasilar } from './scenarios/strokeBasilar';
import { strokePostTpaIch } from './scenarios/strokePostTpaIch';
// ACLS megacode pack (ชุดโจทย์ megacode หลายสถานการณ์)
import { traumaArrest } from './scenarios/traumaArrest';
import { copdDope } from './scenarios/copdDope';
import { pregChoking } from './scenarios/pregChoking';
import { hypoxiaVf } from './scenarios/hypoxiaVf';
import { refractoryVfAcs } from './scenarios/refractoryVfAcs';
import { vfPeaVfAcs } from './scenarios/vfPeaVfAcs';
import { fbObstruction } from './scenarios/fbObstruction';
import { alcoholHypo } from './scenarios/alcoholHypo';
import { aaaRupture } from './scenarios/aaaRupture';
import { preeclampsia } from './scenarios/preeclampsia';
import { tensionPneumo } from './scenarios/tensionPneumo';
import { tamponade } from './scenarios/tamponade';
import { pulmonaryEmbolism } from './scenarios/pulmonaryEmbolism';
import { hypothermiaVf } from './scenarios/hypothermiaVf';
import { bradyOverdose } from './scenarios/bradyOverdose';
import { completeHeartBlock } from './scenarios/completeHeartBlock';
import { mobitz2Vf } from './scenarios/mobitz2Vf';
import { svtCascade } from './scenarios/svtCascade';
import { pvtHandover } from './scenarios/pvtHandover';
// Airway pack (สำหรับ airway.morroo.com) — เคสเดี่ยวต่อทักษะ ไม่ปนกับคลัง ACLS/BLS
import { airwayOpaNpaBasic } from './scenarios/airwayOpaNpaBasic';
import { airwayBvmVentilation } from './scenarios/airwayBvmVentilation';
import { airwayAdvancedCapnography } from './scenarios/airwayAdvancedCapnography';
// Defib pack (สำหรับ defib.morroo.com)
import { defibAedVf } from './scenarios/defibAedVf';
import { defibManualPause } from './scenarios/defibManualPause';
import { defibCardioversion } from './scenarios/defibCardioversion';
// IV/IO pack (สำหรับ iv.morroo.com)
import { ivPeripheralAccess } from './scenarios/ivPeripheralAccess';
import { ivIoAccess } from './scenarios/ivIoAccess';
import { ivDrugDelivery } from './scenarios/ivDrugDelivery';

// เคสทั้งหมดในระบบ (built-in) — จัดเรียงตามหมวด (track) และในหมวดเรียงง่าย→ยาก
// ลำดับในนี้คือ "บันได" ของแต่ละหมวดบนหน้าเลือกเคส + ลำดับเคสแนะนำถัดไป
const allScenarios = [
  // ── 🫀 Cardiac Arrest หลัก ── วนลูป CPR-Shock-ยา ให้เป็นอัตโนมัติ
  vfArrest,
  peaAsystoleBasic,
  vfPeaVfAcs,
  refractoryVfAcs,
  pvtHandover,
  hypoxiaVf,
  // ── 🐢 Bradycardia ──
  bradycardiaStableBasic,
  bradycardiaBasic,
  mobitz2Vf,
  completeHeartBlock,
  bradyOverdose,
  // ── ⚡ Tachycardia ──
  tachycardiaBasic,
  tachyAfibBasic,
  tachyWideVtBasic,
  tachyUnstableBasic,
  svtCascade,
  // ── 💔 ACS ──
  acsBasic,
  acsNstemiBasic,
  // ── 🧠 Stroke ── FAST · DTX · CT · tPA window — แข่งกับเวลา
  strokeIschemicBasic,
  strokeMimicHypo,
  strokeHemorrhagic,
  strokeTia,
  strokeLvoWakeup,
  strokeBasilar,
  strokePostTpaIch,
  // ── 🔍 สืบหาสาเหตุ (H's & T's) ── arrest ที่ต้องแก้สาเหตุถึงจะรอด
  peaHyperK,
  alcoholHypo,
  copdDope,
  tensionPneumo,
  tamponade,
  pulmonaryEmbolism,
  hypothermiaVf,
  aaaRupture,
  // ── 🚨 สถานการณ์พิเศษ ── ตั้งครรภ์ / trauma / สำลัก
  fbObstruction,
  pregChoking,
  preeclampsia,
  traumaArrest,
  // ── BLS (MorRoo) ── จัดเรียงตามหมวด BLS และในหมวดเรียงง่าย→ยาก
  // 🫀 ผู้ใหญ่: CPR + AED
  blsCollapse,
  blsHandsOnly,
  blsAedWet,
  blsTeamWard,
  // 👶 เด็กและทารก
  blsChildDrowning,
  blsInfantCpr,
  // 🌬 สำลัก
  blsChoking,
  blsInfantChoking,
  blsPregnantChoking,
  // 🚨 สถานการณ์พิเศษ
  blsOpioid,
  // ── Airway (สำหรับ airway.morroo.com) — เคสเดี่ยวต่อทักษะ เรียงพื้นฐาน→ขั้นสูง ──
  airwayOpaNpaBasic,
  airwayBvmVentilation,
  airwayAdvancedCapnography,
  // ── Defibrillation (สำหรับ defib.morroo.com) ──
  defibAedVf,
  defibManualPause,
  defibCardioversion,
  // ── IV/IO Access & Drug Delivery (สำหรับ iv.morroo.com) ──
  ivPeripheralAccess,
  ivIoAccess,
  ivDrugDelivery,
];

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

const BLS_TRACK_META = {
  adult: {
    label: 'ผู้ใหญ่: CPR + AED', icon: '🫀', order: 0,
    desc: 'ห่วงโซ่การรอดชีวิต — เรียกช่วย · กดหน้าอกคุณภาพสูง · ใช้ AED ให้ไว',
  },
  child: {
    label: 'เด็กและทารก', icon: '👶', order: 1,
    desc: 'เทคนิคเฉพาะวัย — ความลึก 1/3 อก, ชีพจร brachial, 15:2 เมื่อช่วยสองคน',
  },
  choking: {
    label: 'สำลัก', icon: '🌬', order: 2,
    desc: 'ผู้ใหญ่ thrust ท้อง · คนท้องกระแทกอก · ทารกตบหลัง 5 สลับกระแทกอก 5',
  },
  special: {
    label: 'สถานการณ์พิเศษ', icon: '🚨', order: 3,
    desc: 'จมน้ำ · opioid เกินขนาด — สถานการณ์ที่ขั้นตอนพื้นฐานต้องปรับ',
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
