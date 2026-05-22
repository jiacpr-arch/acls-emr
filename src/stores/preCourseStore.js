import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generic in-progress exam slot used by both pretest & posttest pages.
// shape: { bankId, setId, answers: {qId: choiceId}, currentIndex, startedAt }
const blankExam = () => null;

export const usePreCourseStore = create(
  persist(
    (set) => ({
      activeStudent: null,        // { id, studentId, name }
      currentAttempt: null,       // { lessonId, answers: {qId: choiceId}, stepIndex, startedAt }
      currentPostTest: null,      // posttest exam in progress
      currentPreTest: null,       // pretest exam in progress

      setActiveStudent: (student) => set({ activeStudent: student }),
      clearActiveStudent: () => set({
        activeStudent: null,
        currentAttempt: null,
        currentPostTest: null,
        currentPreTest: null,
      }),

      startAttempt: (lessonId) => set({
        currentAttempt: {
          lessonId,
          answers: {},
          stepIndex: 0,
          startedAt: new Date().toISOString(),
        },
      }),
      setStepIndex: (stepIndex) => set(s => ({
        currentAttempt: s.currentAttempt
          ? { ...s.currentAttempt, stepIndex }
          : null,
      })),
      answerQuestion: (qId, choiceId) => set(s => ({
        currentAttempt: s.currentAttempt
          ? { ...s.currentAttempt, answers: { ...s.currentAttempt.answers, [qId]: choiceId } }
          : null,
      })),
      clearAttempt: () => set({ currentAttempt: null }),

      // --- Posttest ---
      startPostTest: (setId) => set({
        currentPostTest: {
          setId,
          answers: {},
          currentIndex: 0,
          startedAt: new Date().toISOString(),
        },
      }),
      setPostTestIndex: (currentIndex) => set(s => ({
        currentPostTest: s.currentPostTest
          ? { ...s.currentPostTest, currentIndex }
          : null,
      })),
      answerPostTest: (qId, choiceId) => set(s => ({
        currentPostTest: s.currentPostTest
          ? { ...s.currentPostTest, answers: { ...s.currentPostTest.answers, [qId]: choiceId } }
          : null,
      })),
      clearPostTest: () => set({ currentPostTest: blankExam() }),

      // --- Pretest ---
      startPreTest: (setId) => set({
        currentPreTest: {
          setId,
          answers: {},
          currentIndex: 0,
          startedAt: new Date().toISOString(),
        },
      }),
      setPreTestIndex: (currentIndex) => set(s => ({
        currentPreTest: s.currentPreTest
          ? { ...s.currentPreTest, currentIndex }
          : null,
      })),
      answerPreTest: (qId, choiceId) => set(s => ({
        currentPreTest: s.currentPreTest
          ? { ...s.currentPreTest, answers: { ...s.currentPreTest.answers, [qId]: choiceId } }
          : null,
      })),
      clearPreTest: () => set({ currentPreTest: blankExam() }),
    }),
    { name: 'acls-precourse-session' }
  )
);
