// IV/IO scenario pack (สำหรับ iv.morroo.com) — resolved via the '@scenario-pack'
// Vite alias (see vite.config.js). Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { ivPeripheralAccess } from '../scenarios/ivPeripheralAccess';
import { ivLargeBoreShock } from '../scenarios/ivLargeBoreShock';
import { ivDripRateCalc } from '../scenarios/ivDripRateCalc';
import { ivFluidOverload } from '../scenarios/ivFluidOverload';
import { ivSixRights } from '../scenarios/ivSixRights';
import { ivReconstitution } from '../scenarios/ivReconstitution';
import { ivPhlebitis } from '../scenarios/ivPhlebitis';
import { ivAnaphylaxis } from '../scenarios/ivAnaphylaxis';
import { ivIoAccess } from '../scenarios/ivIoAccess';
import { ivIoAdultSiteChoice } from '../scenarios/ivIoAdultSiteChoice';
import { ivDrugDelivery } from '../scenarios/ivDrugDelivery';
import { ivExtravasationEpi } from '../scenarios/ivExtravasationEpi';

// เรียงตาม track — จากงานประจำวันบนหอผู้ป่วยไปหางานฉุกเฉิน
// และในแต่ละ track เรียงง่าย → ยาก
export const allScenarios = [
  // 💉 Peripheral IV
  ivPeripheralAccess,
  ivLargeBoreShock,
  // 💧 สารน้ำและอัตราการหยด
  ivDripRateCalc,
  ivFluidOverload,
  // 🧪 เตรียมและบริหารยา
  ivSixRights,
  ivReconstitution,
  // 🛡 ภาวะแทรกซ้อนและความปลอดภัย
  ivPhlebitis,
  ivAnaphylaxis,
  // 🦴 Intraosseous (IO)
  ivIoAccess,
  ivIoAdultSiteChoice,
  // 💊 ให้ยาระหว่าง CPR
  ivDrugDelivery,
  ivExtravasationEpi,
];
