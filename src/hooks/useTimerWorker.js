import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playCycleAlert, playWarningBeep, playCompressorRotateAlert } from '../utils/sound';

export function useTimerWorker() {
  const workerRef = useRef(null);
  const prevElapsedRef = useRef(0);

  useEffect(() => {
    // Create web worker
    const worker = new Worker(
      new URL('../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        const elapsed = e.data.elapsed;
        const store = useTimerStore.getState();
        const settings = useSettingsStore.getState();

        // Calculate cycle position (relative to cycleStartElapsed)
        const cycleElapsed = (elapsed - store.cycleStartElapsed) % store.cycleDuration;
        const remaining = store.cycleDuration - cycleElapsed;
        const prevCycleElapsed = (prevElapsedRef.current - store.cycleStartElapsed) % store.cycleDuration;
        const prevRemaining = store.cycleDuration - prevCycleElapsed;

        // Cycle complete — auto new cycle + alert
        if (prevElapsedRef.current > 0 && cycleElapsed < prevCycleElapsed && (elapsed - store.cycleStartElapsed) > store.cycleDuration) {
          store.newCycle();
          if (settings.soundEnabled && settings.cycleAlertEnabled) {
            playCycleAlert();
          }
        }

        // Warning at 15 sec remaining
        if (remaining <= 15 && prevRemaining > 15 && settings.soundEnabled && settings.cycleAlertEnabled) {
          playWarningBeep();
        }

        store.tick(elapsed);

        // Compressor rotation alert
        const updatedStore = useTimerStore.getState();
        if (updatedStore.compressorRotateDue && settings.soundEnabled && settings.compressorRotateAlert) {
          playCompressorRotateAlert();
        }

        prevElapsedRef.current = elapsed;
      }
    };

    useTimerStore.getState().setWorker(worker);
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  return workerRef;
}
