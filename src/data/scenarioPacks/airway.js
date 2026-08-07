// Airway scenario pack (สำหรับ airway.morroo.com) — resolved via the '@scenario-pack'
// Vite alias (see vite.config.js). Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { airwayOpaNpaBasic } from '../scenarios/airwayOpaNpaBasic';
import { airwayNpaTrismus } from '../scenarios/airwayNpaTrismus';
import { airwayBvmVentilation } from '../scenarios/airwayBvmVentilation';
import { airwayBvmTwoPerson } from '../scenarios/airwayBvmTwoPerson';
import { airwayAdvancedCapnography } from '../scenarios/airwayAdvancedCapnography';
import { airwayDopeCapnoDrop } from '../scenarios/airwayDopeCapnoDrop';

// เรียงตาม track (พื้นฐาน → ช่วยหายใจ → ขั้นสูง) และในแต่ละ track เรียงง่าย → ยาก
export const allScenarios = [
  // 🫁 เปิดทางเดินหายใจ + OPA/NPA
  airwayOpaNpaBasic,
  airwayNpaTrismus,
  // 💨 Bag-Mask Ventilation
  airwayBvmVentilation,
  airwayBvmTwoPerson,
  // 🔬 ทางเดินหายใจขั้นสูง
  airwayAdvancedCapnography,
  airwayDopeCapnoDrop,
];
