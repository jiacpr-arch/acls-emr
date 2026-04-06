import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playMetronomeClick } from '../utils/sound';

export function useMetronome() {
  const intervalRef = useRef(null);
  const cprActive = useTimerStore(s => s.cprActive);
  const isRunning = useTimerStore(s => s.isRunning);
  const { metronomeEnabled, metronomeRate, soundEnabled } = useSettingsStore();

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (cprActive && isRunning && metronomeEnabled && soundEnabled) {
      const ms = Math.round(60000 / metronomeRate);
      intervalRef.current = setInterval(() => {
        playMetronomeClick();
      }, ms);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cprActive, isRunning, metronomeEnabled, metronomeRate, soundEnabled]);
}
