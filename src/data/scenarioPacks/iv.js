// IV/IO scenario pack (สำหรับ iv.morroo.com) — resolved via the '@scenario-pack'
// Vite alias (see vite.config.js). Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { ivPeripheralAccess } from '../scenarios/ivPeripheralAccess';
import { ivIoAccess } from '../scenarios/ivIoAccess';
import { ivDrugDelivery } from '../scenarios/ivDrugDelivery';

export const allScenarios = [
  ivPeripheralAccess,
  ivIoAccess,
  ivDrugDelivery,
];
