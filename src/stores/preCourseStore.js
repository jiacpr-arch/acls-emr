import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePreCourseStore = create(
  persist(
    (set) => ({
      activeStudent: null,        // { id, studentId, name }
      currentAttempt: null,       // { lessonId, answers: {qId: choiceId}, stepIndex, startedAt }
      currentPostTest: null,      // { setId, answers: {qId: choiceId}, currentIndex, startedAt }

      setActiveStudent: (student) => set({ activeStudent: student }),
      clearActiveStudent: () => set({ activeStudent: null, currentAttempt: null, currentPostTest: null }),

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
      clearPostTest: () => set({ currentPostTest: null }),
    }),
    { name: 'acls-precourse-session' }
  )
);
