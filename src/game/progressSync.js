// กู้ความคืบหน้าเกม Code Blue จาก cloud ลง localStorage ของเครื่องนี้
//
// ฝั่งเขียนยังเป็น best-effort ทางเดียวเหมือนเดิม (rpcSubmitCodeBlueResult ตอน
// จบเคส) — ไฟล์นี้คือ "ขากลับ" ที่หายไป: ตอนนักเรียนระบุตัวบนเครื่องใหม่
// ดึงสรุปจากผลที่เคยส่งขึ้นไป (get_my_codeblue_progress) มา MERGE กับของ
// ในเครื่อง ไม่ทับ เพราะเครื่องอาจมีผลที่ยังไม่เคยถูกส่งขึ้น (เล่นออฟไลน์/ส่งพลาด)
//
// key ตรงกับ CodeBlueSim.jsx + achievements.js:
//   acls_codeblue_cleared        — union
//   acls_codeblue_grades         — เกรดดีกว่าชนะ (ผ่าน recordGrade เดิม)
//   acls_codeblue_hiscore_<diff> — ค่ามากกว่าชนะ
// เหรียญ (awards) ไม่แตะที่นี่ — ผู้เรียกคำนวณใหม่ด้วย syncAwards(pool, ...)
// เพราะต้องรู้คลังเคสปัจจุบัน

import { rpcGetMyCodeBlueProgress, rpcGetMyRecorderProgress } from '../services/cohortSync';
import { mergeCloudProgress } from '../utils/recorderGameProgress';
import { recordGrade } from './achievements';

const CLEARED_KEY = 'acls_codeblue_cleared';
const HISCORE_PREFIX = 'acls_codeblue_hiscore';

export async function restoreCodeBlueProgress(studentPk) {
  const { data, error } = await rpcGetMyCodeBlueProgress({ studentPk });
  if (error || !data) return false;

  let restored = false;

  const cloudCleared = Array.isArray(data.cleared) ? data.cleared : [];
  if (cloudCleared.length > 0) {
    let local = [];
    try { local = JSON.parse(localStorage.getItem(CLEARED_KEY)) || []; } catch { /* พังก็เริ่มว่าง */ }
    const union = new Set([...local, ...cloudCleared]);
    if (union.size > local.length) {
      try {
        localStorage.setItem(CLEARED_KEY, JSON.stringify([...union]));
        restored = true;
      } catch { /* storage เต็ม — ข้าม */ }
    }
  }

  // recordGrade เก็บเฉพาะตัวที่ดีกว่าเดิมอยู่แล้ว (เกรด > โหมดยาก > fast sticky)
  const grades = data.grades && typeof data.grades === 'object' ? data.grades : {};
  for (const [scId, g] of Object.entries(grades)) {
    if (g?.grade) recordGrade(scId, g.grade, g.diff, !!g.fast);
  }

  const hiscores = data.hiscores && typeof data.hiscores === 'object' ? data.hiscores : {};
  for (const [diff, score] of Object.entries(hiscores)) {
    const key = `${HISCORE_PREFIX}_${diff}`;
    if (Number(score) > Number(localStorage.getItem(key) || 0)) {
      try {
        localStorage.setItem(key, String(score));
        restored = true;
      } catch { /* storage เต็ม — ข้าม */ }
    }
  }

  return restored;
}

// Recorder Hero — ขาลงแบบเดียวกัน แต่โมเดลง่ายกว่า (ไม่มีเหรียญให้คำนวณใหม่)
// merge logic อยู่ใน utils/recorderGameProgress.js เพราะที่นั่นเป็นเจ้าของคีย์
// localStorage ทั้งสองตัว (acls_recgame_progress / acls_recgame_endless)
export async function restoreRecorderProgress(studentPk) {
  const { data, error } = await rpcGetMyRecorderProgress({ studentPk });
  if (error || !data) return false;
  return mergeCloudProgress({
    levels: data.levels && typeof data.levels === 'object' ? data.levels : {},
    endless: data.endless && typeof data.endless === 'object' ? data.endless : {},
  });
}
