import { useEffect } from 'react';
import { IS_BLS } from '../config/courseMode';
import { useSettingsStore } from '../stores/settingsStore';

// One-shot initialization for BLS mode:
// force training mode so recording shows hints and never enters "clinical" flow.
export function useCourseModeInit() {
  useEffect(() => {
    if (!IS_BLS) return;
    const current = useSettingsStore.getState().mode;
    if (current !== 'training') {
      useSettingsStore.setState({ mode: 'training' });
    }
  }, []);
}
