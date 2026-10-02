import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Holds the cohort/class context for cloud sync.
// classCode is the student join code — server-side RPCs validate it on every
// sync call. instructorCode (new-style classes only) is the instructor's
// secret: required for the cohort summary and destructive RPCs. Legacy
// classes have no instructorCode; their classCode still grants everything.
export const useClassStore = create(
  persist(
    (set) => ({
      classId: null,
      classCode: null,
      instructorCode: null,
      className: null,
      courseMode: null,    // 'bls' | 'acls'
      syncDisabled: false, // true = user opted into pure offline mode
      // Teacher's rule "log in with the JIA account before the exam" — last value read from the
      // server (hooks/useHubLoginGate.js), kept here so it still applies offline.
      requireHubLogin: false,

      setClass: ({ classId, classCode, instructorCode = null, className, courseMode }) => set({
        classId, classCode, instructorCode, className, courseMode, syncDisabled: false, requireHubLogin: false,
      }),
      clearClass: () => set({
        classId: null, classCode: null, instructorCode: null, className: null, courseMode: null, requireHubLogin: false,
      }),
      setRequireHubLogin: (requireHubLogin) => set({ requireHubLogin: !!requireHubLogin }),
      setInstructorCode: (instructorCode) => set({ instructorCode }),
      disableSync: () => set({ syncDisabled: true }),
      enableSync: () => set({ syncDisabled: false }),
    }),
    { name: 'acls-class-context' }
  )
);

export const getClassContext = () => {
  const s = useClassStore.getState();
  return {
    classId: s.classId,
    classCode: s.classCode,
    instructorCode: s.instructorCode,
    className: s.className,
    courseMode: s.courseMode,
    syncDisabled: s.syncDisabled,
  };
};
