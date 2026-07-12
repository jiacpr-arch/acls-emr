// ==========================================
// Recorder Hero — persistence (localStorage)
// key เดียว: acls_recgame_progress → { [levelId]: { stars, hiscore, completedAt } }
// ตาม pattern ของ acls_codeblue_hiscore
// ==========================================
const KEY = 'acls_recgame_progress';

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
