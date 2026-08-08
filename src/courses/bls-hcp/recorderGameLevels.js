// ==========================================
// Recorder Hero — ด่าน BLS (campaign LEVELS)
// สร้างจาก CASES ของ ./recorderCases.js ตรง ๆ ผ่าน caseToLevel() (ไม่ก็อปเนื้อหาซ้ำ)
//
// ERROR_TYPES/GAME_BUTTONS/ฯลฯ ก็อปมาจาก src/data/recorderGameLevels.js (ค่าคงที่
// เดียวกัน) แทนที่จะ import/re-export ข้ามไปไฟล์ ACLS โดยตรง — ถ้า import ข้ามไฟล์
// (แม้จะหยิบมาแค่ property เล็กๆ) esbuild/Rollup จะดึงทั้งโมดูล ACLS (รวม LEVELS
// ก้อนใหญ่ของ ACLS) ติดเข้ามาในบันเดิลของ BLS ด้วย เพราะ static import สร้าง edge
// ในกราฟโมดูลไม่ว่าปลายทางจะ tree-shake ออกไปได้แค่ไหนก็ตาม — คงค่าเหล่านี้ให้ตรงกับ
// ไฟล์ ACLS ถ้าจะแก้ต้องแก้คู่กันทั้งสองที่
//
// v1: ทุกด่านเป็น type:'live' ล้วน (ไม่มี hunt/audit — สองแบบนั้นผูกกับ UI
// dashboard/timeline แบบ ACLS โดยเฉพาะ ทำ mock UI เวอร์ชัน BLS เป็น follow-up)
// ==========================================
import { CASES, caseToLevel } from './recorderCases';

export const ERROR_TYPES = {
  MISSED: 'missed',
  WRONG_BUTTON: 'wrong_button',
  UI_LOST: 'ui_lost',
  WRONG_DATA: 'wrong_data',
};

export const ERROR_TYPE_META = {
  [ERROR_TYPES.MISSED]: {
    label_th: 'ลืมกด / กดช้า', icon: '⏰', color: 'text-warning',
    tip_th: 'บันทึกทันทีที่เหตุการณ์เกิด — อย่ารอจนจบรอบ CPR เวลาจะคลาดเคลื่อน',
  },
  [ERROR_TYPES.WRONG_BUTTON]: {
    label_th: 'กดผิดปุ่ม / ผิดลำดับ', icon: '🔀', color: 'text-danger',
    tip_th: 'ทบทวนลำดับ BLS survey → CPR → AED ให้แม่น',
  },
  [ERROR_TYPES.UI_LOST]: {
    label_th: 'หาปุ่มไม่เจอ / ไม่คุ้น UI', icon: '🧭', color: 'text-info',
    tip_th: 'จำตำแหน่งปุ่มหลักบน action pad ให้คุ้นเคย',
  },
  [ERROR_TYPES.WRONG_DATA]: {
    label_th: 'บันทึกข้อมูลผิด', icon: '💊', color: 'text-purple',
    tip_th: 'ตรวจซ้ำก่อนกดยืนยัน: ระดับความรุนแรง/ผลวิเคราะห์ AED ให้ตรงกับสถานการณ์',
  },
};

export const GAME_BUTTONS = {};
export const ENERGY_CHOICES = [];

// คะแนนเต็มของด่าน live = ผลรวม points ทุก event
export function getLiveMaxScore(level) {
  if (level.type !== 'live') return 0;
  return level.events.reduce((sum, e) => sum + (e.points || 0), 0);
}

export function getAuditErrorCount(level) {
  if (level.type !== 'audit') return 0;
  const logErrors = level.log.filter(l => l.error).length;
  const missing = (level.missing || []).length;
  return logErrors + missing;
}

const ORDER = [
  { caseId: 'rcase_bls_vf_01', subtitle_th: 'AED เบื้องต้น — Shock Advised', targetError: ERROR_TYPES.MISSED },
  { caseId: 'rcase_bls_noshock_01', subtitle_th: 'AED No-Shock — CPR ต่อเนื่อง', targetError: ERROR_TYPES.WRONG_BUTTON },
  { caseId: 'rcase_bls_choking_adult_01', subtitle_th: 'สำลักผู้ใหญ่ — back blows / abdominal thrust', targetError: ERROR_TYPES.WRONG_DATA },
  { caseId: 'rcase_bls_infant_choking_01', subtitle_th: 'สำลักทารก — back blows / chest thrust', targetError: ERROR_TYPES.WRONG_DATA },
  { caseId: 'rcase_bls_team_switch_01', subtitle_th: 'Two-rescuer CPR — สลับคนกด + AED', targetError: ERROR_TYPES.MISSED },
  { caseId: 'rcase_bls_opioid_01', subtitle_th: 'Opioid Overdose — ช่วยหายใจ + Naloxone', targetError: ERROR_TYPES.MISSED },
];

export const LEVELS = ORDER.map(({ caseId, subtitle_th, targetError }, i) => {
  const c = CASES.find(cs => cs.id === caseId);
  const level = caseToLevel(c);
  return {
    ...level,
    order: i + 1,
    title_th: `ด่าน ${i + 1} · ${c.title_th}`,
    subtitle_th,
    targetError,
    speed: 1,
  };
});

export function getLevelById(id) {
  return LEVELS.find(l => l.id === id);
}
