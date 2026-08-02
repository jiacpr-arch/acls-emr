// BLS scenario pack — resolved via the '@scenario-pack' Vite alias (see vite.config.js),
// so an acls/airway/defib/iv build never pulls this file (or the scenario files it
// imports) into its module graph at all. Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
//
// BLS pack (MorRoo) — เคสสำหรับ bls.morroo.com "BLS สำหรับบุคลากรทางการแพทย์"
// ผู้เล่นสวมบทพยาบาลในโรงพยาบาล / ทีมกู้ชีพนอกโรงพยาบาลที่ไม่ใช่แพทย์ / บุคลากรนอกเวร
// ขอบเขต: คลำชีพจร · CPR · ช่วยหายใจด้วย bag-mask · AED — ไม่อ่าน rhythm เอง ไม่ตั้งพลังงานเอง ไม่สั่งยาเอง
import { blsCollapse } from '../scenarios/blsCollapse';
import { blsChoking } from '../scenarios/blsChoking';
import { blsHandsOnly } from '../scenarios/blsHandsOnly';
import { blsAedWet } from '../scenarios/blsAedWet';
import { blsTeamWard } from '../scenarios/blsTeamWard';
import { blsChildDrowning } from '../scenarios/blsChildDrowning';
import { blsInfantCpr } from '../scenarios/blsInfantCpr';
import { blsInfantChoking } from '../scenarios/blsInfantChoking';
import { blsPregnantChoking } from '../scenarios/blsPregnantChoking';
import { blsOpioid } from '../scenarios/blsOpioid';
import { blsRespiratoryArrest } from '../scenarios/blsRespiratoryArrest';
import { blsBvmTwoRescuer } from '../scenarios/blsBvmTwoRescuer';
import { blsMonitorAlarmScope } from '../scenarios/blsMonitorAlarmScope';
import { blsEmsConfinedSpace } from '../scenarios/blsEmsConfinedSpace';
import { blsChildRespiratory } from '../scenarios/blsChildRespiratory';
import { blsPregnantArrest } from '../scenarios/blsPregnantArrest';

export const allScenarios = [
  // ── BLS (MorRoo) ── จัดเรียงตามหมวด BLS และในหมวดเรียงง่าย→ยาก
  // 🫀 ผู้ใหญ่: BLS Survey · CPR · AED
  blsCollapse,
  blsHandsOnly,
  blsAedWet,
  // 🫁 คลำชีพจร & ช่วยหายใจ
  blsOpioid,
  blsRespiratoryArrest,
  blsBvmTwoRescuer,
  // 👶 เด็กและทารก
  blsChildDrowning,
  blsInfantCpr,
  blsChildRespiratory,
  // 🌬 สำลัก
  blsChoking,
  blsInfantChoking,
  blsPregnantChoking,
  // 🏥 ทีมในโรงพยาบาล & ขอบเขตบทบาท
  blsTeamWard,
  blsMonitorAlarmScope,
  blsEmsConfinedSpace,
  // 🚨 สถานการณ์พิเศษ
  blsPregnantArrest,
];
