// IV/IO scenario pack (สำหรับ iv.morroo.com) — resolved via the '@scenario-pack'
// Vite alias (see vite.config.js). Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { ivPeripheralAccess } from '../scenarios/ivPeripheralAccess';
import { ivLargeBoreShock } from '../scenarios/ivLargeBoreShock';
import { ivIoAccess } from '../scenarios/ivIoAccess';
import { ivIoAdultSiteChoice } from '../scenarios/ivIoAdultSiteChoice';
import { ivDrugDelivery } from '../scenarios/ivDrugDelivery';
import { ivExtravasationEpi } from '../scenarios/ivExtravasationEpi';

// เรียงตาม track (peripheral → IO → ให้ยา) และในแต่ละ track เรียงง่าย → ยาก
export const allScenarios = [
  // 💉 Peripheral IV
  ivPeripheralAccess,
  ivLargeBoreShock,
  // 🦴 Intraosseous (IO)
  ivIoAccess,
  ivIoAdultSiteChoice,
  // 💊 ให้ยาระหว่าง CPR
  ivDrugDelivery,
  ivExtravasationEpi,
];
