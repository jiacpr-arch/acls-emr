import { create } from 'zustand';

// สถานะฉาก Training Scenario แบบ serializable — จุด publish เดียวสำหรับ
// โหมดสองจอในอนาคต (Phase: instructor screen):
//   subscribe store นี้ → broadcast snapshot ผ่าน Supabase Realtime
//   channel `scenario_stage:{sessionCode}` → จอครู render <ScenarioStage/>
// ดูสัญญา payload ใน src/components/scenario/stageState.js
export const useScenarioStageStore = create((set) => ({
  scenarioId: null,
  mode: null,          // 'learning' | 'exam'
  stepIndex: 0,
  lastResult: null,    // {kind:'correct'|'wrong', message, at}
  completed: false,

  setStage: (partial) => set(partial),
  reset: () => set({ scenarioId: null, mode: null, stepIndex: 0, lastResult: null, completed: false }),
}));
