// ACLS scenario pack — resolved via the '@scenario-pack' Vite alias (see vite.config.js),
// so an airway/defib/iv/bls build never pulls this file (or the scenario files it imports)
// into its module graph at all. Do not import this file directly — import
// '@scenario-pack' from codeBlueScenarios.js instead.
import { vfArrest } from '../scenarios/vfArrest';
import { peaHyperK } from '../scenarios/peaHyperK';
// ACLS basic pack — เคสเดี่ยว ทีละ algorithm/แขนงย่อย ให้ฝึกก่อนไป megacode
import { peaAsystoleBasic } from '../scenarios/peaAsystoleBasic';
import { bradycardiaBasic } from '../scenarios/bradycardiaBasic';
import { bradycardiaStableBasic } from '../scenarios/bradycardiaStableBasic';
import { tachycardiaBasic } from '../scenarios/tachycardiaBasic';
import { tachyAfibBasic } from '../scenarios/tachyAfibBasic';
import { tachyWideVtBasic } from '../scenarios/tachyWideVtBasic';
import { tachyUnstableBasic } from '../scenarios/tachyUnstableBasic';
import { acsBasic } from '../scenarios/acsBasic';
import { acsNstemiBasic } from '../scenarios/acsNstemiBasic';
import { strokeIschemicBasic } from '../scenarios/strokeIschemicBasic';
import { strokeMimicHypo } from '../scenarios/strokeMimicHypo';
import { strokeHemorrhagic } from '../scenarios/strokeHemorrhagic';
import { strokeTia } from '../scenarios/strokeTia';
import { strokeLvoWakeup } from '../scenarios/strokeLvoWakeup';
import { strokeBasilar } from '../scenarios/strokeBasilar';
import { strokePostTpaIch } from '../scenarios/strokePostTpaIch';
// ACLS megacode pack (ชุดโจทย์ megacode หลายสถานการณ์)
import { traumaArrest } from '../scenarios/traumaArrest';
import { copdDope } from '../scenarios/copdDope';
import { pregChoking } from '../scenarios/pregChoking';
import { hypoxiaVf } from '../scenarios/hypoxiaVf';
import { refractoryVfAcs } from '../scenarios/refractoryVfAcs';
import { vfPeaVfAcs } from '../scenarios/vfPeaVfAcs';
import { fbObstruction } from '../scenarios/fbObstruction';
import { alcoholHypo } from '../scenarios/alcoholHypo';
import { aaaRupture } from '../scenarios/aaaRupture';
import { preeclampsia } from '../scenarios/preeclampsia';
import { tensionPneumo } from '../scenarios/tensionPneumo';
import { tamponade } from '../scenarios/tamponade';
import { pulmonaryEmbolism } from '../scenarios/pulmonaryEmbolism';
import { hypothermiaVf } from '../scenarios/hypothermiaVf';
import { bradyOverdose } from '../scenarios/bradyOverdose';
import { completeHeartBlock } from '../scenarios/completeHeartBlock';
import { mobitz2Vf } from '../scenarios/mobitz2Vf';
import { svtCascade } from '../scenarios/svtCascade';
import { pvtHandover } from '../scenarios/pvtHandover';

export const allScenarios = [
  // ── 🫀 Cardiac Arrest หลัก ── วนลูป CPR-Shock-ยา ให้เป็นอัตโนมัติ
  vfArrest,
  peaAsystoleBasic,
  vfPeaVfAcs,
  refractoryVfAcs,
  pvtHandover,
  hypoxiaVf,
  // ── 🐢 Bradycardia ──
  bradycardiaStableBasic,
  bradycardiaBasic,
  mobitz2Vf,
  completeHeartBlock,
  bradyOverdose,
  // ── ⚡ Tachycardia ──
  tachycardiaBasic,
  tachyAfibBasic,
  tachyWideVtBasic,
  tachyUnstableBasic,
  svtCascade,
  // ── 💔 ACS ──
  acsBasic,
  acsNstemiBasic,
  // ── 🧠 Stroke ── FAST · DTX · CT · tPA window — แข่งกับเวลา
  strokeIschemicBasic,
  strokeMimicHypo,
  strokeHemorrhagic,
  strokeTia,
  strokeLvoWakeup,
  strokeBasilar,
  strokePostTpaIch,
  // ── 🔍 สืบหาสาเหตุ (H's & T's) ── arrest ที่ต้องแก้สาเหตุถึงจะรอด
  peaHyperK,
  alcoholHypo,
  copdDope,
  tensionPneumo,
  tamponade,
  pulmonaryEmbolism,
  hypothermiaVf,
  aaaRupture,
  // ── 🚨 สถานการณ์พิเศษ ── ตั้งครรภ์ / trauma / สำลัก
  fbObstruction,
  pregChoking,
  preeclampsia,
  traumaArrest,
];
