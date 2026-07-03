import { useEffect } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { initAudio } from '../utils/sound';
import { DIRECT_ENTRY_LABELS } from '../data/recordingSteps';

// Recording-page side effects: audio init, direct-entry auto-start,
// redirect when there is no active case, and tab-close protection.
export function useRecordingLifecycle({ startMode, currentCase, navigate }) {
  useEffect(() => { initAudio(); }, []);

  // Auto-start timer for direct-entry emergency modes
  useEffect(() => {
    if (DIRECT_ENTRY_LABELS[startMode]) {
      if (!useTimerStore.getState().isRunning) useTimerStore.getState().startTimer();
      useCaseStore.getState().addEvent({
        elapsed: useTimerStore.getState().elapsed,
        category: 'other',
        type: DIRECT_ENTRY_LABELS[startMode],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!currentCase) navigate('/'); }, [currentCase]);

  // Back button / tab close protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentCase && currentCase.outcome === 'ongoing') {
        e.preventDefault();
        e.returnValue = 'Recording in progress. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCase]);
}
