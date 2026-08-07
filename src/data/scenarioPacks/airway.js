// Airway scenario pack (สำหรับ airway.morroo.com) — resolved via the '@scenario-pack'
// Vite alias (see vite.config.js). Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { airwayOpaNpaBasic } from '../scenarios/airwayOpaNpaBasic';
import { airwayBvmVentilation } from '../scenarios/airwayBvmVentilation';
import { airwayAdvancedCapnography } from '../scenarios/airwayAdvancedCapnography';

export const allScenarios = [
  airwayOpaNpaBasic,
  airwayBvmVentilation,
  airwayAdvancedCapnography,
];
