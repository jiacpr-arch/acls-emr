// ธนาคารข้อสอบปฏิบัติจากเกม Code Blue Sim — ใช้กับฐาน "สอบ Megacode (สุ่มข้อสอบ)"
// ตามที่อาจารย์ขอ: โจทย์สอบ = โจทย์เดียวกับตอนนักเรียนเล่นเกม โดย "ไม่เอา ACS
// กับ Stroke" (ตัดทั้ง track acs/stroke และเคส arrest ที่ต้นเหตุเป็น ACS)
// และเอาเฉพาะเคสระดับ megacode — เคสระดับพื้นฐาน (basic) มีไว้ฝึกในเกม
// ไม่ใช้เป็นข้อสอบ
//
// derive อัตโนมัติจากไฟล์เคสเกม (src/data/scenarios/*.js) ตอน import:
//   - โจทย์ = subtitle ของเคส (บรีฟผู้ป่วยที่นักเรียนเห็นตอนเปิดเกม)
//   - ข้อเช็คลิสต์ = ตัวเลือกที่ถูกต้อง (ok: true) ของทุก decision point
//     ตามเส้นทางเล่นที่ถูกต้อง — แก้เนื้อหาเกมแล้วข้อสอบตามให้เอง ไม่ต้อง sync มือ
// รูปแบบ object ต่อเคสเหมือน MEGACODE_CASES (id/no/title/algorithm/scenario/items)
// และเหมือนกันตรงไม่มี passRule — ผ่าน/ไม่ผ่านเป็นดุลยพินิจอาจารย์

// ── Cardiac Arrest หลัก ──
import { pvtHandover } from '../scenarios/pvtHandover';
import { hypoxiaVf } from '../scenarios/hypoxiaVf';
// ── Bradycardia ──
import { mobitz2Vf } from '../scenarios/mobitz2Vf';
import { completeHeartBlock } from '../scenarios/completeHeartBlock';
import { bradyOverdose } from '../scenarios/bradyOverdose';
// ── Tachycardia ──
import { svtCascade } from '../scenarios/svtCascade';
// ── สืบหาสาเหตุ (H's & T's) ──
import { peaHyperK } from '../scenarios/peaHyperK';
import { alcoholHypo } from '../scenarios/alcoholHypo';
import { copdDope } from '../scenarios/copdDope';
import { tensionPneumo } from '../scenarios/tensionPneumo';
import { tamponade } from '../scenarios/tamponade';
import { pulmonaryEmbolism } from '../scenarios/pulmonaryEmbolism';
import { hypothermiaVf } from '../scenarios/hypothermiaVf';
import { aaaRupture } from '../scenarios/aaaRupture';
// ── สถานการณ์พิเศษ ──
import { fbObstruction } from '../scenarios/fbObstruction';
import { pregChoking } from '../scenarios/pregChoking';
import { preeclampsia } from '../scenarios/preeclampsia';
import { traumaArrest } from '../scenarios/traumaArrest';

// ลำดับตาม "บันได" หมวดในหน้าเลือกเคสของเกม (codeBlueScenarios.js) — ไม่รวม:
//   - track 'acs' / 'stroke' ทั้งหมด (ตามคำสั่งอาจารย์)
//   - vfPeaVfAcs / refractoryVfAcs (อยู่ track arrest แต่โจทย์เป็น ACS/STEMI)
//   - เคสระดับ basic ทั้งหมด (เอาเฉพาะ megacode — ตามคำสั่งอาจารย์)
//   - เคส BLS (คนละคอร์ส)
const GAME_SCENARIOS = [
  { s: pvtHandover, track: 'Cardiac Arrest หลัก' },
  { s: hypoxiaVf, track: 'Cardiac Arrest หลัก' },
  { s: mobitz2Vf, track: 'Bradycardia' },
  { s: completeHeartBlock, track: 'Bradycardia' },
  { s: bradyOverdose, track: 'Bradycardia' },
  { s: svtCascade, track: 'Tachycardia' },
  { s: peaHyperK, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: alcoholHypo, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: copdDope, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: tensionPneumo, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: tamponade, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: pulmonaryEmbolism, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: hypothermiaVf, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: aaaRupture, track: "สืบหาสาเหตุ (H's & T's)" },
  { s: fbObstruction, track: 'สถานการณ์พิเศษ' },
  { s: pregChoking, track: 'สถานการณ์พิเศษ' },
  { s: preeclampsia, track: 'สถานการณ์พิเศษ' },
  { s: traumaArrest, track: 'สถานการณ์พิเศษ' },
];

// label ของตัวเลือกในเกมเป็นข้อความล้วน แต่กันเหนียวไว้ (บาง scenario อาจใส่
// <span class="cbs-em"> มาเน้นคำ)
const stripHtml = (t) => String(t || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();

// เดินตามเส้นทางเล่นที่ถูกต้อง: ทุก decision point เก็บ label ของตัวเลือก ok
// ตัวแรก แล้วตามเข้าไปในฉากต่อ (then) ของตัวเลือกนั้น — เส้นทางตัวเลือกผิด
// เป็นฉากแก้ตัว/บทลงโทษ ไม่ใช่มาตรฐานการปฏิบัติ จึงไม่นับเป็นข้อสอบ
function collectOkLabels(nodes, out) {
  for (const node of nodes || []) {
    if (!node?.choice) continue;
    const okOpt = (node.choice.options || []).find((o) => o.ok);
    if (!okOpt) continue;
    const text = stripHtml(okOpt.label);
    if (text && !out.includes(text)) out.push(text);
    collectOkLabels(okOpt.then, out);
  }
}

export const CODE_BLUE_EXAM_CASES = GAME_SCENARIOS.map(({ s, track }, i) => {
  const labels = [];
  collectOkLabels(s.story, labels);
  return {
    id: s.id, // ใช้ id เดียวกับเคสเกมตรงๆ — ล็อกลง exam_case_id ได้เหมือน case-XX
    no: i + 1,
    title: s.title,
    algorithm: `${track} · ${s.level === 'megacode' ? 'Megacode' : 'พื้นฐาน'}`,
    scenario: stripHtml(s.subtitle),
    items: labels.map((text) => ({ text })),
  };
});
