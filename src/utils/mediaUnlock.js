// เก็บสถานะ "เปิดวิดีโอขั้นนี้แล้ว" ต่อหน้า ใช้ปลดล็อกกล่องวิดีโอขั้นถัดไป
// (pattern เดียวกับ scenarioProgress.js — try/catch JSON ใน localStorage key เดียว)
const KEY = 'bls_media_unlock_v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function getOpenedMap(pageKey) {
  return readAll()[pageKey] || {};
}

export function markVideoOpened(pageKey, stepKey) {
  try {
    const all = readAll();
    all[pageKey] = { ...(all[pageKey] || {}), [stepKey]: true };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // localStorage เต็ม/ปิดใช้งาน — ข้ามได้ ไม่กระทบการเรียน
  }
}
