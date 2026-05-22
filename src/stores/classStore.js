import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Holds the cohort/class context for cloud sync.
// classCode acts as a bearer secret — server-side RPCs validate it on every call.
export const useClassStore = create(
  persist(
    (set) => ({
      classId: null,
      classCode: null,
      className: null,
      courseMode: null,    // 'bls' | 'acls'
      syncDisabled: false, // true = user opted into pure offline mode

      setClass: ({ classId, classCode, className, courseMode }) => set({
        classId, classCode, className, courseMode, syncDisabled: false,
      }),
      clearClass: () => set({
        classId: null, classCode: null, className: null, courseMode: null,
      }),
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
    className: s.className,
    courseMode: s.courseMode,
    syncDisabled: s.syncDisabled,
  };
};
