// Shared lesson-derivation helper — extracted from src/courses/bls-hcp/lessons.js
// so the airway / defib / iv skill courses (and any future course) don't each
// re-implement the same read/quiz-step bookkeeping.
//
// Input: a lessonDef `{id, title, description, estMinutes, passingScore, steps}`
// where each step is `{type:'read', heading, body, id?}` or
// `{type:'quiz', id, question, choices, correctId, explanation}`.
// Output: the same object plus `sections` (read steps) and `quiz` (quiz steps)
// derived arrays that LessonReader.jsx and PreCourse.jsx consume, and
// `videos` attached from an optional per-lesson video map.

export function deriveLesson(l, lessonVideos = {}) {
  // ใส่ id ให้ read step ที่ยังไม่มี (pattern <courseId>-rN) — จำเป็นสำหรับผูก
  // รูป/วิดีโอรายขั้น (imagesByStep/videosByStep คีย์ด้วย step.id)
  let readIdx = 0;
  const steps = l.steps.map(s =>
    s.type === 'read' ? { ...s, id: s.id ?? `${l.id}-r${readIdx++}` } : s
  );
  const sections = steps.filter(s => s.type === 'read').map(s => ({ id: s.id, heading: s.heading, body: s.body }));
  const quiz = steps.filter(s => s.type === 'quiz').map(s => ({
    id: s.id,
    question: s.question,
    choices: s.choices,
    correctId: s.correctId,
    explanation: s.explanation,
  }));
  return { ...l, steps, sections, quiz, videos: lessonVideos[l.id] ?? [] };
}

// Builds the standard lesson-package exports (preCourseLessons,
// findLessonById, getLessonStepCount, getLessonQuizCount) from a list of
// lessonDefs — the shape every course/<mode>/lessons.js re-exports.
export function buildLessons(lessonDefs, lessonVideos = {}) {
  const preCourseLessons = lessonDefs.map(l => deriveLesson(l, lessonVideos));

  function findLessonById(id) {
    return preCourseLessons.find(l => l.id === id) || null;
  }

  function getLessonStepCount(lesson) {
    return lesson?.steps?.length ?? 0;
  }

  function getLessonQuizCount(lesson) {
    return lesson?.quiz?.length ?? 0;
  }

  return { preCourseLessons, findLessonById, getLessonStepCount, getLessonQuizCount };
}
