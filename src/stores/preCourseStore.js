import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePreCourseStore = create(
  persist(
    (set) => ({
      activeStudent: null,        // { id, studentId, name }
      currentAttempt: null,       // { lessonId, answers: {qId: choiceId}, stepIndex, startedAt }

      setActiveStudent: (student) => set({ activeStudent: student }),
      clearActiveStudent: () => set({ activeStudent: null, currentAttempt: null }),

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
    }),
    { name: 'acls-precourse-session' }
  )
);
