// Story engine — ส่วน logic ล้วนของเกมตัดสินใจ (ไม่มี DOM/React)
//
// โจทย์ (story) เป็น array ของ node:
//   { say: { who, pose, text, fx? }, t? }   — บทพูด (text เป็น HTML จำกัดแค่ <span class="cbs-em">)
//   { inter: 'ข้อความ!!', drama?, green?, fx?, t? } — จังหวะตะโกนเต็มจอ
//   { skip: 'คำบรรยาย', t }                — time-skip (เช่น CPR 2 นาที)
//   { choice: { q, options: [{ tgt, label, ok, why?, worsen?, then?[] }] } }
//   { end: true }
// ตอบถูก → node ใน then ของตัวเลือกถูก run ก่อนแล้วไปข้อถัดไป
// ตอบผิด → หัก stability, เล่นจุดตัดสินใจเดิมซ้ำ (สภาพแย่ลงแล้ว)

export const DECISION_TIME = 20; // วินาทีจริงต่อการตัดสินใจ
export const MAX_HP = 5;        // Patient Stability gauge

export function createInitialState() {
  return {
    ptr: 0,
    queue: [],
    simTime: 0,
    hp: MAX_HP,
    rhythm: 'flat',
    cpr: false,
    alarm: false,
    shocks: 0,
    epis: 0,
    wrong: 0,
    firstCPRAt: -1,
    firstShockAt: -1,
    rosc: false,
    timeline: [],
  };
}

// ผลของ node ต่อสถานะผู้ป่วย/เคส (mutate state ที่ถือใน ref ของหน้าเกม)
export function applyFx(state, fx) {
  if (!fx) return;
  if (fx.alarm) state.alarm = true;
  if (fx.cpr) state.cpr = true;
  if (fx.rhythm) state.rhythm = fx.rhythm;
  if (fx.firstCPR && state.firstCPRAt < 0) state.firstCPRAt = state.simTime;
  if (fx.epi) state.epis += 1;
  if (fx.shock) {
    state.shocks += 1;
    state.cpr = false;
    if (state.firstShockAt < 0) state.firstShockAt = state.simTime;
  }
  if (fx.rosc) {
    state.rosc = true;
    state.rhythm = 'nsr';
    state.cpr = false;
    state.alarm = false;
  }
}

// ดึง node ถัดไป — queue (จาก then ของตัวเลือก) มาก่อน story หลัก
export function nextNode(state, story) {
  if (state.queue.length) return state.queue.shift();
  if (state.ptr < story.length) return story[state.ptr++];
  return null;
}

export function recordCorrect(state, option) {
  state.timeline.push({ t: state.simTime, ok: true, text: option.label });
  state.simTime += 8;
  state.queue.push(...(option.then || []));
}

export function recordWrong(state, option) {
  state.wrong += 1;
  state.hp = Math.max(0, state.hp - 1);
  state.simTime += 20; // ความผิดพลาดกินเวลาเสมอ
  state.timeline.push({
    t: state.simTime,
    ok: false,
    text: option.timeout ? '(หมดเวลา — ไม่มีคำสั่ง)' : 'สั่งผิดจังหวะ',
    note: option.why,
  });
}

export function gradeFor(state, won) {
  if (!won) return 'C';
  if (state.wrong === 0) return 'S';
  if (state.wrong === 1) return 'A';
  if (state.wrong <= 3) return 'B';
  return 'C';
}

export function fmtTime(s) {
  if (s < 0) return '--:--';
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
