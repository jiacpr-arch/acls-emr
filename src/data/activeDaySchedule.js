// Active day-schedule source — switches between course packages based on
// VITE_COURSE_MODE, same pattern as activeLessons.js: literal ternary on the
// IS_* constants so Vite/esbuild tree-shakes the other course's data out of
// the production bundle.
//
// มีเฉพาะ BLS กับ ACLS ที่มีตารางวันเรียน — คอร์สทักษะเดี่ยว (airway/defib/iv)
// ไม่มี route นี้ (ดู HAS_DAY_SCHEDULE ที่ App.jsx ใช้ gate)
import { IS_BLS, IS_ACLS } from '../config/courseMode';
import * as bls from './blsDaySchedule';
import * as acls from './aclsDaySchedule';

const src = IS_BLS ? bls : acls;

export const DAY_VARIANTS = src.DAY_VARIANTS;
export const STATIONS = src.STATIONS;
export const PASS_RULES = src.PASS_RULES;
export const CONTINGENCIES = src.CONTINGENCIES;

export const HAS_DAY_SCHEDULE = IS_BLS || IS_ACLS;

// "HH:MM" → นาทีนับจากเที่ยงคืน
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// หา index ของช่วงที่ตรงกับเวลา now (นาทีจากเที่ยงคืน)
// คืน -1 ถ้ายังไม่ถึงช่วงแรกหรือเลยช่วงสุดท้ายไปแล้ว
export function findCurrentBlock(nowMinutes, blocks) {
  return blocks.findIndex(
    b => nowMinutes >= toMinutes(b.start) && nowMinutes < toMinutes(b.end),
  );
}
