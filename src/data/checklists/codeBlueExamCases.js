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

// ── คู่มือคุมหุ่นสำหรับอาจารย์ (derive จากบทเกมเช่นกัน) ──────────────────────
// อาจารย์ที่คุมฐานต้องรู้ว่า "ตั้งจังหวะอะไรไว้ก่อน แล้วเปลี่ยนเป็นอะไรตอนไหน"
// บทเกมมีข้อมูลนี้อยู่แล้วในรูป fx.rhythm/fx.rosc ที่ผูกกับตัวเลือกที่ถูกต้อง —
// เดินเส้นทางเดียวกับที่ derive ข้อสอบ แล้วแปลงเป็นลำดับจังหวะ + ทริกเกอร์
// (เคสมือเขียน 15+10 เคสมีคู่มือละเอียดกว่านี้ใน manikinSetups.js)
const GAME_RHYTHM_LABELS = {
  flat: 'Asystole — เส้นแบน (non-shockable)',
  pea: 'PEA — มีจังหวะบนจอ แต่คลำชีพจรไม่ได้ (non-shockable)',
  vf: 'VF / pulseless VT — shockable',
  nsr: 'Sinus rhythm',
  afib: 'Atrial fibrillation',
  brady: 'Bradycardia — ช้าและไม่คงที่ (ยังมีชีพจร)',
  pacing: 'Paced rhythm — จับ capture ได้',
  tachy: 'Tachycardia — เร็วและไม่คงที่ (ยังมีชีพจร)',
};

// fx วางได้ทั้งใน say ({say:{fx}}) และระดับ node ({say:{}, fx}) — ตรงกับที่
// engine ของเกมอ่าน (ดู CodeBlueSim.jsx: node.say.fx || node.fx)
const nodeFx = (node) => node.say?.fx || node.fx || null;

// ทริกเกอร์ = "ตัวเลือกที่ถูก" ล่าสุดก่อนจังหวะจะเปลี่ยน — เก็บเป็นลำดับต่อเนื่อง
// (ไม่ใช่ scope ของ recursion) เพราะบางเคสเปลี่ยนจังหวะที่ node ระดับบนสุด
// หลังจบฉากของตัวเลือกไปแล้ว ถ้าใช้ scope จะได้ทริกเกอร์ค้างเป็น "เริ่มเคส"
function triggerFor(history) {
  const last = history[history.length - 1];
  // ตัวเลือกที่ตัวมันเองประกาศ ROSC (เช่น "ROSC! post-arrest care — …") เป็น
  // การกระทำ "หลัง" จังหวะเปลี่ยนแล้ว ไม่ใช่เหตุให้เปลี่ยน → ถอยไปตัวก่อนหน้า
  if (/^ROSC/i.test(last) && history.length > 1) return history[history.length - 2];
  return last;
}

function collectRhythmSteps(nodes, history, out) {
  for (const node of nodes || []) {
    const fx = nodeFx(node);
    if (fx?.rhythm) {
      const label = GAME_RHYTHM_LABELS[fx.rhythm] || fx.rhythm;
      const rhythm = fx.rhythm === 'nsr' && out.length ? `ROSC — ${label}` : label;
      const last = out[out.length - 1];
      // จังหวะเดิมซ้ำติดกัน (บทย้ำจอ) ไม่นับเป็นการเปลี่ยนจังหวะ
      if (!last || last.rhythm !== rhythm) out.push({ rhythm, next: null, trigger: triggerFor(history) });
    } else if (fx?.rosc && out.length && !out[out.length - 1].rhythm.startsWith('ROSC')) {
      out.push({ rhythm: 'ROSC — มีชีพจรกลับมา', next: null, trigger: triggerFor(history) });
    }
    if (!node.choice) continue;
    const okOpt = (node.choice.options || []).find((o) => o.ok);
    if (!okOpt) continue;
    history.push(stripHtml(okOpt.label));
    collectRhythmSteps(okOpt.then, history, out);
  }
}

// แปลง trigger ของ "จังหวะถัดไป" มาเป็นช่อง next ของจังหวะก่อนหน้า เพื่อให้อ่าน
// เป็น "อยู่จังหวะนี้ → เปลี่ยนเมื่อทีมทำ X" เหมือนเคสมือเขียน
function buildGameSetup(steps) {
  if (!steps.length) return null;
  return {
    manikin: 'เคสนี้มาจากเกม Code Blue Sim — โจทย์/ลำดับจังหวะตรงกับที่นักเรียนเคยเล่น '
      + 'ตั้งหุ่นตามโจทย์ผู้ป่วยด้านบน (ท่าทาง อุปกรณ์ที่คาอยู่ ผลตรวจที่ต้องตอบ) แล้วเดินจังหวะตามลำดับนี้',
    props: null,
    steps: steps.map((st, i) => ({
      rhythm: st.rhythm,
      vitals: null,
      cue: i === 0 ? 'ตั้งค้างไว้ตั้งแต่เริ่มเคส — ให้ทีมประเมินและอ่านจังหวะเอง' : null,
      next: steps[i + 1]
        ? `→ ${steps[i + 1].rhythm.split(' —')[0]}`
          + (steps[i + 1].trigger === 'เริ่มเคส'
            // จังหวะเปลี่ยนตามบทเอง ไม่ได้ผูกกับการกระทำของทีม (เคสที่ผู้ป่วย
            // ทรุดเองระหว่างฉาก) — บอกให้ผู้คุมหุ่นประกาศแล้วสลับจอทันที
            ? ' — บทเดินต่อเอง: ประกาศ "จังหวะเปลี่ยน!" แล้วสลับจอทันที'
            : ` เมื่อทีมทำ: ${steps[i + 1].trigger}`)
        : 'จบเคส — ให้ทีมสรุปการดูแลต่อ',
    })),
  };
}

export const CODE_BLUE_EXAM_CASES = GAME_SCENARIOS.map(({ s, track }, i) => {
  const labels = [];
  collectOkLabels(s.story, labels);
  const steps = [];
  collectRhythmSteps(s.story, ['เริ่มเคส'], steps);
  return {
    id: s.id, // ใช้ id เดียวกับเคสเกมตรงๆ — ล็อกลง exam_case_id ได้เหมือน case-XX
    no: i + 1,
    title: s.title,
    algorithm: `${track} · ${s.level === 'megacode' ? 'Megacode' : 'พื้นฐาน'}`,
    scenario: stripHtml(s.subtitle),
    items: labels.map((text) => ({ text })),
    setup: buildGameSetup(steps),
  };
});
