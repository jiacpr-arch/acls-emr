// ==========================================
// Recorder Hero — pure scoring helpers
// ไม่มี side-effect / ไม่แตะ store — ทดสอบง่าย
// ==========================================
import { ERROR_TYPES } from '../data/recorderGameLevels';

export const RATINGS = {
  PERFECT: 'perfect',
  GOOD: 'good',
  LATE: 'late',
  MISS: 'miss',
};

export const RATING_META = {
  [RATINGS.PERFECT]: { label_th: 'PERFECT!', mult: 1.0, color: 'text-success' },
  [RATINGS.GOOD]:    { label_th: 'ดี', mult: 0.7, color: 'text-info' },
  [RATINGS.LATE]:    { label_th: 'ช้า', mult: 0.4, color: 'text-warning' },
  [RATINGS.MISS]:    { label_th: 'พลาด!', mult: 0, color: 'text-danger' },
};

// dt = เวลาที่กด (วินาที) - เวลาที่เหตุการณ์ครบกำหนด (event.t)
// คืน rating ตาม window ของ event
export function ratingForDelay(dt, window) {
  const w = window || { perfect: 3, good: 6, late: 11 };
  if (dt <= w.perfect) return RATINGS.PERFECT;
  if (dt <= w.good) return RATINGS.GOOD;
  if (dt <= w.late) return RATINGS.LATE;
  return RATINGS.MISS;
}

// ให้คะแนนจาก rating + combo (streak ≥3 → คูณ 1.5)
export function pointsForRating(rating, basePoints, streak = 0) {
  const mult = RATING_META[rating]?.mult ?? 0;
  const combo = streak >= 3 ? 1.5 : 1;
  return Math.round(basePoints * mult * combo);
}

// ตรวจข้อมูลที่กรอก (dose/energy/rhythm) ตรงกับที่คาดหวังไหม
export function isDataCorrect(expectData, enteredData) {
  if (!expectData) return true;
  return Object.keys(expectData).every(k => String(expectData[k]) === String(enteredData?.[k]));
}

// คำนวณดาว 0-3 จาก % คะแนน + จำนวน miss
export function computeStars(score, maxScore, missCount = 0) {
  if (maxScore <= 0) return score > 0 ? 3 : 0;
  const pct = score / maxScore;
  if (pct >= 0.9 && missCount === 0) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

// จัดกลุ่ม results ตาม 4 ประเภทข้อผิดพลาด
// results: [{ errorType }] — errorType เป็นค่าใน ERROR_TYPES หรือ null (ทำถูก)
export function groupErrorsByType(results) {
  const groups = {
    [ERROR_TYPES.MISSED]: [],
    [ERROR_TYPES.WRONG_BUTTON]: [],
    [ERROR_TYPES.UI_LOST]: [],
    [ERROR_TYPES.WRONG_DATA]: [],
  };
  results.forEach(r => {
    if (r.errorType && groups[r.errorType]) groups[r.errorType].push(r);
  });
  return groups;
}
