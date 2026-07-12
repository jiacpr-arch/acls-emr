// Code Blue Simulator — คลังโจทย์ (story-driven, Ace Attorney style)
//
// โครงนี้คือ "ข้อมูลโจทย์" ล้วนๆ — engine อยู่ที่ src/game/storyEngine.js
// ตัวละครอ้างด้วย charId จาก src/game/characters.js (who) + สีหน้า (pose)
// text อนุญาต HTML แค่ <span class="cbs-em"> สำหรับเน้นคำ
//
// แต่ละเคสมี field:
//   id, title, subtitle, level ('basic'|'intermediate'|'megacode'),
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

// เคสทั้งหมดในระบบ (built-in) — เรียงจากง่ายไปยาก
const allScenarios = [
  vfArrest,
  peaHyperK,
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
