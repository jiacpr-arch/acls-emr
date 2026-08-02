// Defibrillation scenario pack (สำหรับ defib.morroo.com) — resolved via the
// '@scenario-pack' Vite alias (see vite.config.js). Do not import this file
// directly — import '@scenario-pack' from codeBlueScenarios.js instead.
import { defibAedVf } from '../scenarios/defibAedVf';
import { defibManualPause } from '../scenarios/defibManualPause';
import { defibCardioversion } from '../scenarios/defibCardioversion';

export const allScenarios = [
  defibAedVf,
  defibManualPause,
  defibCardioversion,
];
