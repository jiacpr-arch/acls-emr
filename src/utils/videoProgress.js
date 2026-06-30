import { videoLessonKey } from '../data/videoTopics';

// ตรรกะ "ผ่าน" ของคลิปวิดีโอ ใช้ร่วมกันระหว่างหน้าไลบรารี/รายละเอียด และเงื่อนไขใบประกาศนียบัตร
// นิยาม: ดูจบ (มีใน lessonProgress) AND (ไม่มีควิซ หรือ ผ่านควิซแล้ว)
//   progressLessonIds : Set<string> ของ lessonId ที่อ่าน/ดูแล้ว
//   passedLessonIds   : Set<string> ของ lessonId ที่มี attempt ผ่าน

export function clipWatched(clip, progressLessonIds) {
  return progressLessonIds.has(videoLessonKey(clip.id));
}

export function clipQuizPassed(clip, passedLessonIds) {
  if (!clip.quiz || clip.quiz.length === 0) return true; // ไม่มีควิซ = ผ่านอัตโนมัติ
  return passedLessonIds.has(videoLessonKey(clip.id));
}

export function clipDone(clip, progressLessonIds, passedLessonIds) {
  return clipWatched(clip, progressLessonIds) && clipQuizPassed(clip, passedLessonIds);
}

// สร้าง Set จาก progress/attempts ของ Dexie (getLessonProgress / getAttemptsForStudent)
export function buildProgressSets(progress, attempts) {
  const progressLessonIds = new Set((progress || []).map(p => p.lessonId));
  const passedLessonIds = new Set((attempts || []).filter(a => a.passed).map(a => a.lessonId));
  return { progressLessonIds, passedLessonIds };
}

// สรุปความคืบหน้าวิดีโอสำหรับใบประกาศนียบัตร — นับเฉพาะคลิป required
// คืน { total, done, allDone }
export function computeVideoCompletion(lessons, progress, attempts) {
  const required = (lessons || []).filter(l => l.required);
  const { progressLessonIds, passedLessonIds } = buildProgressSets(progress, attempts);
  const done = required.filter(c => clipDone(c, progressLessonIds, passedLessonIds)).length;
  const total = required.length;
  return { total, done, allDone: total > 0 && done === total };
}
