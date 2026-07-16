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
  // ── BLS (MorRoo) ──
  blsCollapse,
  blsChoking,
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

export const LEVEL_META = {
  basic: { label: 'พื้นฐาน', order: 0 },
  intermediate: { label: 'ปานกลาง', order: 1 },
  megacode: { label: 'Megacode', order: 2 },
};

// หมวดของเคส (track) — จัดตาม algorithm/ธีมการเรียนแบบหลักสูตร ACLS
// หน้าเลือกเคสจัดกลุ่มตามนี้ แทนการกองรวมตาม level ที่ยาวเป็นเส้นเดียว
export const TRACK_META = {
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

// เคสที่ไม่ระบุ track (เช่น โจทย์เก่าจาก Supabase) ตกหมวด 'other'
export function trackOf(s) {
  return TRACK_META[s.track] ? s.track : 'other';
}
