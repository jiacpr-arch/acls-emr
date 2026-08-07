// ==========================================
// Recorder Hero — persistence (localStorage)
// สองคีย์:
//   acls_recgame_progress → { [levelId]: { stars, hiscore, completedAt } }  ด่าน/case pack
//   acls_recgame_endless  → { [category]: hiscore }                          Endless Shuffle
// ตาม pattern ของ acls_codeblue_hiscore
// ==========================================
const KEY = 'acls_recgame_progress';
const ENDLESS_KEY = 'acls_recgame_endless';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// บันทึกผล: เก็บดาว/คะแนนสูงสุดเท่าที่เคยทำได้
export function saveResult(levelId, { stars = 0, score = 0 } = {}) {
  const progress = loadProgress();
  const prev = progress[levelId] || { stars: 0, hiscore: 0 };
  progress[levelId] = {
    stars: Math.max(prev.stars, stars),
    hiscore: Math.max(prev.hiscore, score),
    completedAt: Date.now(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage full/unavailable — เกมยังเล่นต่อได้ */
  }
  return progress[levelId];
}

// ด่านแรกปลดล็อกเสมอ; ด่านถัดไปปลดเมื่อด่านก่อนหน้าได้ ≥1 ดาว
export function isUnlocked(level, levels, progress = loadProgress()) {
  if (level.order <= 1) return true;
  const prev = levels.find(l => l.order === level.order - 1);
  if (!prev) return true;
  return (progress[prev.id]?.stars || 0) >= 1;
}

export function getTotalStars(progress = loadProgress()) {
  return Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0);
}

// ===== Endless Shuffle — hi-score แยกตามหมวด =====
// เคยอยู่ใน RecorderEndless.jsx ย้ายมาไว้ที่เดียวกับ progress ของด่าน เพราะ
// ขา restore จาก cloud (game/progressSync.js) ต้องเขียนคีย์เดียวกันนี้ด้วย
export function loadEndlessHiscores() {
  try { return JSON.parse(localStorage.getItem(ENDLESS_KEY) || '{}'); }
  catch { return {}; }
}

export function saveEndlessHiscore(cat, score) {
  const all = loadEndlessHiscores();
  if (score > (all[cat] || 0)) {
    all[cat] = score;
    try { localStorage.setItem(ENDLESS_KEY, JSON.stringify(all)); } catch { /* full */ }
  }
  return all[cat] || 0;
}

// ===== merge ของจาก cloud =====
// ค่ามากกว่าชนะทุกช่อง (ดาวกับคะแนนคิดแยกกัน ตามที่ saveResult ทำอยู่แล้ว) —
// ไม่ทับของในเครื่อง เพราะเครื่องอาจมีผลที่ยังส่งขึ้นไปไม่สำเร็จ
// คืน true เมื่อมีอะไรเปลี่ยนจริง เพื่อให้ผู้เรียกรู้ว่าต้อง re-render
export function mergeCloudProgress({ levels = {}, endless = {} } = {}) {
  let changed = false;

  const progress = loadProgress();
  for (const [levelId, row] of Object.entries(levels)) {
    const prev = progress[levelId] || { stars: 0, hiscore: 0 };
    const stars = Math.max(prev.stars || 0, Number(row?.stars) || 0);
    const hiscore = Math.max(prev.hiscore || 0, Number(row?.hiscore) || 0);
    if (stars === (prev.stars || 0) && hiscore === (prev.hiscore || 0)) continue;
    progress[levelId] = { ...prev, stars, hiscore };
    changed = true;
  }
  if (changed) {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); }
    catch { return false; /* storage เต็ม — ถือว่าไม่ได้กู้ */ }
  }

  for (const [cat, score] of Object.entries(endless)) {
    const before = loadEndlessHiscores()[cat] || 0;
    if (saveEndlessHiscore(cat, Number(score) || 0) > before) changed = true;
  }

  return changed;
}
