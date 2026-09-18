import { useEffect, useState } from 'react';
import { usePreCourseStore } from '../stores/preCourseStore';
import { IS_BLS, IS_SKILL_COURSE, IS_DEFIB, courseMeta } from '../config/courseMode';
import { getLessonProgress, getAttemptsForStudent } from '../db/database';
import { subscribeToPull } from '../services/progressPull';
import { preCourseLessons } from '../data/activeLessons';
import { POST_TEST_LESSON_ID } from '../data/activePostTest';
import { PRE_TEST_LESSON_ID } from '../data/activePreTest';
import { EKG_TEST_PASSED_KEY } from '../data/ekgQuiz';
import { RHYTHM_QUIZ_PASSED_KEY } from '../data/rhythmDecisionQuiz';
import { getScenarioGameStatus as getSkillScenarioGameStatus } from '../data/activeSkillContent';
import { computeVideoCompletion } from '../utils/videoProgress';
import { useVideoLessons } from './useVideoLessons';

// เส้นทางเรียนหลักของแต่ละ course mode — ใช้ทั้งหน้า Learn (ไฮไลต์ขั้นถัดไป)
// และการ์ด "เรียนต่อ" บนหน้าแรก (NewCase) จะได้ไม่มี logic ซ้ำสองที่
const PATH_STEPS = IS_BLS
  ? [
      { key: 'preTest', path: '/pre-course/pre-test', label: 'Pre-test' },
      { key: 'lessons', path: '/pre-course', label: 'บทเรียน + Quiz' },
      { key: 'video', path: '/video-lessons', label: 'วิดีโอบทเรียน' },
      { key: 'postTest', path: '/pre-course/post-test', label: 'Post-test' },
      { key: 'cert', path: '/certification', label: 'รับใบประกาศนียบัตร' },
    ]
  : IS_SKILL_COURSE
  ? [
      { key: 'preTest', path: '/pre-course/pre-test', label: 'Pre-test' },
      { key: 'lessons', path: '/pre-course', label: 'บทเรียน + Quiz' },
      ...(IS_DEFIB ? [{ key: 'rhythmQuiz', path: '/rhythm-quiz', label: 'Rhythm Quiz' }] : []),
      { key: 'scenario', path: '/scenario', label: 'เกมลำดับขั้น' },
      { key: 'postTest', path: '/pre-course/post-test', label: 'Post-test' },
      { key: 'cert', path: '/certification', label: 'รับใบประกาศนียบัตร' },
    ]
  : [
      { key: 'preTest', path: '/pre-course/pre-test', label: 'Pre-test' },
      { key: 'lessons', path: '/pre-course', label: 'บทเรียน + Quiz' },
      { key: 'ekg', path: '/als?tab=ekg', label: 'EKG Quiz' },
      { key: 'video', path: '/video-lessons', label: 'วิดีโอบทเรียน' },
      { key: 'postTest', path: '/pre-course/post-test', label: 'Post-test' },
      { key: 'cert', path: '/certification', label: 'รับใบประกาศนียบัตร' },
    ];

export function useLearnPath() {
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [progress, setProgress] = useState([]);   // [{ lessonId, readAt }]
  const [attempts, setAttempts] = useState([]);   // [{ lessonId, score, passed, ... }]
  const { lessons: videoLessons } = useVideoLessons();

  // Reload the student's progress whenever the caller page mounts, the active
  // student changes, or the tab regains focus after finishing a chapter elsewhere.
  // The focus listener alone isn't enough for another *device*: the pull engine's
  // fetch lands after focus, so subscribe to it too.
  useEffect(() => {
    const id = activeStudent?.id;
    if (!id) {
      Promise.resolve().then(() => { setProgress([]); setAttempts([]); });
      return;
    }
    const load = () => Promise.all([
      getLessonProgress(id),
      getAttemptsForStudent(id),
    ]).then(([p, a]) => { setProgress(p); setAttempts(a); });
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const unsubscribe = subscribeToPull(load);
    return () => {
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, [activeStudent?.id]);

  const passedFor = (lessonId) => {
    const best = attempts
      .filter(a => a.lessonId === lessonId)
      .reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
    return best?.passed ?? false;
  };

  const totalLessons = preCourseLessons.length;
  const lessonsPassed = preCourseLessons.filter(l => passedFor(l.id)).length;
  const ekgDone = typeof localStorage !== 'undefined'
    && localStorage.getItem(EKG_TEST_PASSED_KEY) === 'true';
  const rhythmQuizDone = typeof localStorage !== 'undefined'
    && localStorage.getItem(RHYTHM_QUIZ_PASSED_KEY) === 'true';
  const videoComp = computeVideoCompletion(videoLessons, progress, attempts);
  const certDone = (() => {
    try {
      const raw = localStorage.getItem(`${courseMeta.id}_certification`);
      return !!(raw && JSON.parse(raw).certId);
    } catch { return false; }
  })();

  // Resolve a step's completion state. Returns null when there is nothing to
  // show (no active student / key without tracking). `total` present => the step
  // is a multi-item unit and renders xx/xx while incomplete.
  const statusFor = (key) => {
    if (!key || !activeStudent) return null;
    switch (key) {
      case 'preTest':
        return { complete: passedFor(PRE_TEST_LESSON_ID) };
      case 'lessons':
        return { complete: totalLessons > 0 && lessonsPassed === totalLessons, done: lessonsPassed, total: totalLessons };
      case 'ekg':
        return { complete: ekgDone };
      case 'rhythmQuiz':
        return { complete: rhythmQuizDone };
      case 'video':
        if (videoComp.total === 0) return { complete: false };
        return { complete: videoComp.allDone, done: videoComp.done, total: videoComp.total };
      case 'postTest':
        return { complete: passedFor(POST_TEST_LESSON_ID) };
      case 'scenario': {
        const s = getSkillScenarioGameStatus();
        return { complete: s.allPassed, done: s.done, total: s.total };
      }
      case 'cert':
        return { complete: certDone };
      default:
        return null;
    }
  };

  const steps = PATH_STEPS.map((s, i) => ({ ...s, index: i + 1, status: statusFor(s.key) }));
  const tracked = steps.filter(s => s.status);
  const done = tracked.filter(s => s.status.complete).length;
  const next = tracked.find(s => !s.status.complete) ?? null;

  return {
    activeStudent,
    statusFor,
    steps,
    next,          // ขั้นแรกที่ยังไม่ผ่าน (null เมื่อยังไม่ระบุตัว หรือครบหมด)
    done,
    total: tracked.length,
  };
}
