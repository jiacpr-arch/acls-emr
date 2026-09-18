import { useEffect } from 'react';
import { IS_BLS, IS_SKILL_COURSE } from '../config/courseMode';
import { useSettingsStore } from '../stores/settingsStore';

// One-shot initialization for BLS and the airway/defib/iv skill courses:
// force training mode so recording shows hints and never enters "clinical" flow
// (none of these courses have a live EMR recording flow — theory-only).
export function useCourseModeInit() {
  useEffect(() => {
    if (!IS_BLS && !IS_SKILL_COURSE) return;
    const current = useSettingsStore.getState().mode;
    if (current !== 'training') {
      useSettingsStore.setState({ mode: 'training' });
    }
  }, []);
}
