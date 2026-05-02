import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      mode: 'clinical',          // 'clinical' | 'training'
      soundEnabled: true,
      metronomeEnabled: true,
      metronomeRate: 110,         // bpm
      theme: 'system',            // 'system' | 'light' | 'dark'
      cycleAlertEnabled: true,
      drugReminderEnabled: true,
      compressorRotateAlert: true,
      language: 'en',              // 'en' | 'th'

      setMode: (mode) => set({ mode }),
      setLanguage: (lang) => set({ language: lang }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
      setMetronomeRate: (rate) => set({ metronomeRate: rate }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleCycleAlert: () => set((s) => ({ cycleAlertEnabled: !s.cycleAlertEnabled })),
      toggleDrugReminder: () => set((s) => ({ drugReminderEnabled: !s.drugReminderEnabled })),
      toggleCompressorRotateAlert: () => set((s) => ({ compressorRotateAlert: !s.compressorRotateAlert })),
    }),
    { name: 'acls-settings' }
  )
);
