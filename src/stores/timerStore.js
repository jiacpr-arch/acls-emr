import { create } from 'zustand';

export const useTimerStore = create((set, get) => ({
  // Main timer
  elapsed: 0,
  isRunning: false,
  startedAt: null,

  // Cycle timer
  cycleElapsed: 0,
  cycleNumber: 1,
  cycleDuration: 120,  // 2 minutes

  // CPR state
  cprActive: false,
  cprStartedAt: null,
  totalCPRTime: 0,
  totalPauseTime: 0,
  currentPauseStart: null,
  pauses: [],
  lastTickTime: null,

  // Compressor rotation
  lastCompressorRotateAt: 0,
  compressorRotateDue: false,

  // Worker ref
  worker: null,
  setWorker: (worker) => set({ worker }),

  // Start case timer
  startTimer: () => {
    const state = get();
    set({ isRunning: true, startedAt: new Date(), lastTickTime: Date.now() });
    if (state.worker) {
      state.worker.postMessage({ type: 'START', payload: { elapsed: state.elapsed } });
    }
  },

  // Stop case timer
  stopTimer: () => {
    const state = get();
    set({ isRunning: false });
    if (state.worker) state.worker.postMessage({ type: 'STOP' });
  },

  // Reset everything
  resetTimer: () => {
    const state = get();
    if (state.worker) state.worker.postMessage({ type: 'RESET' });
    set({
      elapsed: 0, isRunning: false, startedAt: null,
      cycleElapsed: 0, cycleNumber: 1,
      cprActive: false, cprStartedAt: null, totalCPRTime: 0,
      totalPauseTime: 0, currentPauseStart: null, pauses: [],
      lastTickTime: null, lastCompressorRotateAt: 0, compressorRotateDue: false,
    });
  },

  // Tick from web worker
  tick: (elapsed) => {
    const state = get();
    const cycleElapsed = elapsed % state.cycleDuration;
    const now = Date.now();
    const dt = state.lastTickTime ? (now - state.lastTickTime) / 1000 : 0;

    let updates = { elapsed, cycleElapsed, lastTickTime: now };

    // Accumulate CPR time if active
    if (state.cprActive && dt > 0 && dt < 2) {
      const newCPRTime = state.totalCPRTime + dt;
      updates.totalCPRTime = newCPRTime;

      // Compressor rotation check (every 120s of CPR time)
      if (newCPRTime - state.lastCompressorRotateAt >= 120) {
        updates.compressorRotateDue = true;
        updates.lastCompressorRotateAt = newCPRTime;
      }
    }

    set(updates);
  },

  // New cycle
  newCycle: () => set((s) => ({ cycleNumber: s.cycleNumber + 1 })),

  // CPR controls
  startCPR: () => {
    const state = get();
    const updates = { cprActive: true, cprStartedAt: state.elapsed };
    if (state.currentPauseStart !== null) {
      const pauseDuration = state.elapsed - state.currentPauseStart;
      updates.totalPauseTime = state.totalPauseTime + pauseDuration;
      updates.currentPauseStart = null;
    }
    set(updates);
  },

  stopCPR: (reason = 'other') => {
    set((s) => ({
      cprActive: false,
      currentPauseStart: s.elapsed,
      pauses: [...s.pauses, { reason, startedAt: s.elapsed }]
    }));
  },

  // Dismiss compressor rotation alert
  dismissCompressorRotate: () => set({ compressorRotateDue: false }),

  // CCF calculation
  getCCF: () => {
    const { totalCPRTime, elapsed } = get();
    if (elapsed === 0) return 0;
    return Math.round((totalCPRTime / elapsed) * 100);
  },
}));
