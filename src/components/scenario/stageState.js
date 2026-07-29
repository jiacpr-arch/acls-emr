// ==========================================
// Training Scenario — Cinematic Stage State
//
// Pure functions only (no React, no store access). deriveStageState()
// คืน plain JSON เสมอ — นี่คือ "สัญญา" สำหรับโหมดสองจอในอนาคต:
//   - จอครู (instructor screen) จะ render <ScenarioStage stage={snapshot}/>
//     จาก snapshot ที่ broadcast ผ่าน Supabase Realtime channel
//     `scenario_stage:{sessionCode}` โดย payload = ผลลัพธ์ของฟังก์ชันนี้
//     (+ scenarioId, mode, stepIndex) ขนาด < 1KB
//   - ห้ามใส่ closure/React element/ฟังก์ชันลงใน object ที่คืนจากไฟล์นี้
// ==========================================

// แปลงค่า ekg เดิมใน scenarios.js → rhythm key ของ EcgStrip (flat|vf|nsr|brady|pacing|tachy)
// หมายเหตุทางการแพทย์: pea/stemi ไม่มี waveform เฉพาะใน EcgStrip — จงใจ map เป็น
// organized rhythm (nsr) เพราะบนจอ monitor PEA ก็แสดง organized rhythm จริงๆ
// (ป้ายชื่อบอกความจริงแทน) — อย่า "แก้" เป็น vf
export const RHYTHM_MAP = {
  vf: 'vf', pvt: 'vf', vt: 'vf', torsades: 'vf',
  asystole: 'flat', flat: 'flat',
  pea: 'nsr',
  svt: 'tachy', tachy: 'tachy', afib: 'tachy',
  brady: 'brady', sinus_brady: 'brady',
  stemi: 'nsr', nsr: 'nsr', rosc: 'nsr', sinus: 'nsr',
  pacing: 'pacing',
};

export const RHYTHM_LABEL = {
  vf: 'V-FIB ⚠', pvt: 'pVT ⚠', vt: 'VT ⚠', torsades: 'TdP ⚠',
  asystole: 'ASYSTOLE', flat: 'ASYSTOLE',
  pea: 'PEA ⚠', svt: 'SVT', tachy: 'TACHY', afib: 'AF',
  brady: 'BRADY', sinus_brady: 'SINUS BRADY',
  stemi: 'STEMI', nsr: 'SINUS', rosc: 'ROSC', sinus: 'SINUS',
  pacing: 'PACED',
};

// rhythm ที่ถือว่า "วิกฤต" → ป้ายกะพริบแดง + ฉากหมุนแดง
const CRITICAL_EKG = ['vf', 'pvt', 'vt', 'torsades', 'asystole', 'flat', 'pea'];

// เดาผู้พูดจาก correctActions ของ step (ถ้าไม่ได้ระบุ speaker เอง)
// อิงบทบาทตัวละครใน src/game/characters.js
export function autoSpeaker(step) {
  const a = (step?.correctActions?.[0] || '').toLowerCase();
  if (a.includes('defib') || a.includes('shock') || a.includes('cardiovert')) return 'fon_defib';
  if (a.includes('epi') || a.includes('amiodarone') || a.includes('atropine')
    || a.includes('adenosine') || a.includes('heparin') || a.includes('antiplatelet')
    || a.includes('mona') || a.includes('tpa')) return 'nurse_mint';
  if (a.includes('cpr')) return 'boy_compressor';
  return 'att_dech';
}

// เดาท่าทางตัวละคร: arrest → panic, จบเคส/ROSC → happy, อื่นๆ → stern
export function autoPose(step, ekgKey, vitals) {
  if ((step?.correctActions || []).some(a => a.toLowerCase().includes('rosc'))) return 'happy';
  if (ekgKey && CRITICAL_EKG.includes(ekgKey)) return 'panic';
  if ((vitals?.hr ?? null) === 0) return 'panic';
  return 'stern';
}

// หา ekg key ที่ active ของ step ปัจจุบัน: เดินย้อนจาก step ปัจจุบันขึ้นไป
// (จอ monitor ไม่ดับระหว่าง step ที่ไม่ได้ระบุ ekg ใหม่)
function activeEkgKey(scenario, stepIndex) {
  for (let i = Math.min(stepIndex, scenario.steps.length - 1); i >= 0; i--) {
    const s = scenario.steps[i];
    if (s.rhythm) return s.rhythm;
    if (s.ekg) return s.ekg;
  }
  return null;
}

// vitals ที่ active: merge จาก step แรกจนถึง step ปัจจุบัน (เหมือน setPatientVitals เดิม)
function activeVitals(scenario, stepIndex) {
  let v = {};
  for (let i = 0; i <= Math.min(stepIndex, scenario.steps.length - 1); i++) {
    if (scenario.steps[i].vitals) v = { ...v, ...scenario.steps[i].vitals };
  }
  return Object.keys(v).length ? v : null;
}

// rhythm สำรองจาก vitals เมื่อ scenario ไม่เคยระบุ ekg เลย
function rhythmFromVitals(vitals) {
  const hr = vitals?.hr;
  if (hr === undefined || hr === null) return null;
  if (hr === 0) return 'flat';
  if (hr < 50) return 'brady';
  if (hr > 150) return 'tachy';
  return 'nsr';
}

/**
 * สร้างสถานะฉากทั้งหมดจาก (scenario, stepIndex, lastResult) — deterministic + serializable
 *
 * @param {object} scenario  — จาก src/data/scenarios.js
 * @param {number} stepIndex — step ปัจจุบัน (0-based)
 * @param {object|null} lastResult — {kind:'correct'|'wrong', message, at} ผลการ record ล่าสุด
 * @param {object|null} liveVitals — vitals สดจาก engine (override ค่าที่ derive จาก data)
 * @returns plain JSON object สำหรับ <ScenarioStage stage={...}/>
 */
export function deriveStageState(scenario, stepIndex, lastResult = null, liveVitals = null) {
  const step = scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)] || {};
  const visual = scenario.visual && typeof scenario.visual === 'object' ? scenario.visual : {};

  const vitals = liveVitals || activeVitals(scenario, stepIndex);
  let ekgKey = activeEkgKey(scenario, stepIndex);
  const fromData = !!ekgKey; // scenario ระบุ ekg/rhythm เอง = "ติด monitor แล้ว" ในเนื้อเรื่อง
  let monitorOn = true;
  if (!ekgKey) {
    ekgKey = rhythmFromVitals(vitals);
    // ยังไม่เคยติด monitor เลย (ไม่มี ekg ใน data และไม่มี vitals) → จอว่าง
    if (!ekgKey) monitorOn = false;
  }
  const rhythm = RHYTHM_MAP[ekgKey] || 'flat';
  // ก่อนติด monitor (hr=0 จาก vitals แต่ data ยังไม่ประกาศ rhythm) → flatline เฉยๆ
  // ป้าย NO SIGNAL ไม่ใช่ ASYSTOLE และยังไม่เปิดโหมดวิกฤต — ดราม่าจริงเริ่มตอนเห็น rhythm
  const preMonitor = !fromData && vitals?.hr === 0;
  const critical = !preMonitor && CRITICAL_EKG.includes(ekgKey);

  // ผู้พูด + ท่าทาง: reaction ต่อผลล่าสุด (engine ส่ง message/pose ของ step ที่เพิ่งตอบมา
  // ใน lastResult — derive เองไม่ได้เพราะ stepIndex เลื่อนไปแล้ว) > explicit > derive
  let speaker = step.speaker || visual.defaultSpeaker || autoSpeaker(step);
  let pose = step.pose || autoPose(step, ekgKey, vitals);
  if (lastResult?.kind === 'wrong') {
    // ทำผิด → อ.เดช (attending) หน้าเข้ม
    speaker = 'att_dech';
    pose = 'stern';
  } else if (lastResult?.kind === 'correct') {
    // บทพูดปฏิกิริยาเป็นของ step ที่เพิ่งตอบ — ใช้ผู้พูดของ step นั้น (engine ส่งมา)
    if (lastResult.speaker) speaker = lastResult.speaker;
    pose = lastResult.pose || 'happy';
  }

  // บทพูด: ข้อความปฏิกิริยาจากผลล่าสุดก่อน แล้วค่อยเป็นโจทย์ของ step
  const narration = (lastResult && lastResult.message) ? lastResult.message : (step.scenario_th || '');

  // เอฟเฟกต์ตอนเข้า step: explicit fx หรือเดา (เพิ่งเห็น shockable rhythm ครั้งแรก → alarm)
  let entryFx = step.fx || null;
  if (!entryFx && (step.ekg || step.rhythm)) {
    const key = step.rhythm || step.ekg;
    if (CRITICAL_EKG.includes(key)) entryFx = 'alarm';
  }

  return {
    scenarioId: scenario.id,
    stepIndex,
    totalSteps: scenario.steps.length,
    sceneLabel: visual.scene_th || null,
    patientLabel: visual.patientLabel_th || null,
    speaker,
    speakerKey: `${stepIndex}-${lastResult?.at || 0}`, // key สำหรับ .cbs-pop re-entry
    pose,
    narration,
    hint: step.hint_th || null,
    ekgKey,
    rhythm,
    rhythmLabel: (monitorOn && !preMonitor)
      ? (RHYTHM_LABEL[ekgKey] || String(ekgKey || '').toUpperCase())
      : 'NO SIGNAL',
    monitorOn,
    critical,
    vitals,
    entryFx,
    lastResult: lastResult
      ? { kind: lastResult.kind, at: lastResult.at || 0, fx: lastResult.fx || null }
      : null,
    completed: stepIndex >= scenario.steps.length,
  };
}
