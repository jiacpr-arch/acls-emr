import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      mode: 'clinical',          // 'clinical' | 'training'
      soundEnabled: true,
      metronomeEnabled: false,
      metronomeRate: 110,         // bpm
      theme: 'dark',
      cycleAlertEnabled: true,
      drugReminderEnabled: true,
      compressorRotateAlert: true,

      setMode: (mode) => set({ mode }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
      setMetronomeRate: (rate) => set({ metronomeRate: rate }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleCycleAlert: () => set((s) => ({ cycleAlertEnabled: !s.cycleAlertEnabled })),
      toggleDrugReminder: () => set((s) => ({ drugReminderEnabled: !s.drugReminderEnabled })),
      toggleCompressorRotateAlert: () => set((s) => ({ compressorRotateAlert: !s.compressorRotateAlert })),
    }),
    { name: 'acls-settings' }
  )
);
