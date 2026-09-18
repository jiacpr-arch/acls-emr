// Defibrillation scenario pack (สำหรับ defib.morroo.com) — resolved via the
// '@scenario-pack' Vite alias (see vite.config.js). Do not import this file
// directly — import '@scenario-pack' from codeBlueScenarios.js instead.
import { defibAedVf } from '../scenarios/defibAedVf';
import { defibAedDeviceSkin } from '../scenarios/defibAedDeviceSkin';
import { defibManualPause } from '../scenarios/defibManualPause';
import { defibManualPediatric } from '../scenarios/defibManualPediatric';
import { defibCardioversion } from '../scenarios/defibCardioversion';
import { defibTranscutaneousPacing } from '../scenarios/defibTranscutaneousPacing';

// เรียงตาม track (AED → manual → cardioversion/pacing) และในแต่ละ track เรียงง่าย → ยาก
export const allScenarios = [
  // ⚡ AED สำหรับ VF
  defibAedVf,
  defibAedDeviceSkin,
  // 🔋 Manual Defibrillator
  defibManualPause,
  defibManualPediatric,
  // 📟 Cardioversion & Pacing
  defibCardioversion,
  defibTranscutaneousPacing,
];
