// เก็บเกรดที่ดีที่สุดต่อ Training Scenario ใน localStorage
// (pattern เดียวกับ src/game/achievements.js ของ Code Blue Sim)
const KEY = 'acls_scenario_grades';

export function getScenarioGrades() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

// เก็บเฉพาะผลที่ดีกว่าเดิม (เทียบด้วย pct) — แยกจำว่าเคยผ่านโหมด exam ด้วย
export function saveScenarioGrade(scenarioId, { grade, pct, mode }) {
  if (!scenarioId || !grade) return;
  try {
    const all = getScenarioGrades();
    const prev = all[scenarioId];
    const better = !prev || (pct ?? 0) > (prev.pct ?? -1);
    all[scenarioId] = {
      grade: better ? grade : prev.grade,
      pct: better ? pct : prev.pct,
      examPassed: (prev?.examPassed || (mode === 'exam' && (pct ?? 0) >= 70)) === true,
      at: better ? Date.now() : prev.at,
    };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // localStorage เต็ม/ปิดใช้งาน — ข้ามได้ ไม่กระทบการเรียน
  }
}
