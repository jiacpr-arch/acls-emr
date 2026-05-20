import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePreCourseStore = create(
  persist(
    (set) => ({
      activeStudent: null,        // { id, studentId, name }
      currentAttempt: null,       // { lessonId, answers: {qId: choiceId}, startedAt }

      setActiveStudent: (student) => set({ activeStudent: student }),
      clearActiveStudent: () => set({ activeStudent: null, currentAttempt: null }),

      startAttempt: (lessonId) => set({
        currentAttempt: { lessonId, answers: {}, startedAt: new Date().toISOString() },
      }),
      answerQuestion: (qId, choiceId) => set(s => ({
        currentAttempt: s.currentAttempt
          ? { ...s.currentAttempt, answers: { ...s.currentAttempt.answers, [qId]: choiceId } }
          : null,
      })),
      clearAttempt: () => set({ currentAttempt: null }),
    }),
    { name: 'acls-precourse-session' }
  )
);
