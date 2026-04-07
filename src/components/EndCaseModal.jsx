import { useCaseStore, clearActiveSession } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { playROSCSound } from '../utils/sound';

// End Case Modal — multiple outcome options
export default function EndCaseModal({ onClose, onROSC, onTerminate, onDashboard }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const endCase = useCaseStore(s => s.endCase);
  const elapsed = useTimerStore(s => s.elapsed);

  const handleEnd = async (outcome, label) => {
    useTimerStore.getState().stopTimer();
    addEvent({ elapsed, category: 'other', type: `🏁 Case ended: ${label}`, details: { outcome } });
    if (outcome === 'ROSC') {
      playROSCSound();
      await endCase('ROSC');
      onROSC();
    } else if (outcome === 'terminated' || outcome === 'DNAR' || outcome === 'transfer') {
      await endCase(outcome);
      clearActiveSession();
      onTerminate();
    } else if (outcome === 'cancel') {
      clearActiveSession();
      useCaseStore.getState().clearCase();
      onDashboard();
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-4 space-y-2 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
        <div className="text-center text-sm font-bold text-text-primary mb-2">End Case — Select Outcome</div>

        <button onClick={() => handleEnd('ROSC', 'ROSC')}
          className="w-full btn-action btn-success py-3.5 text-sm font-bold">
          💚 ROSC — Return of Spontaneous Circulation
        </button>

        <button onClick={() => handleEnd('terminated', 'CPR Terminated')}
          className="w-full btn-action btn-ghost py-3 text-sm font-semibold">
          🕊️ Terminate CPR
        </button>

        <button onClick={() => handleEnd('DNAR', 'DNAR')}
          className="w-full btn-action btn-ghost py-3 text-sm font-semibold">
          📋 DNAR — Do Not Attempt Resuscitation
        </button>

        <button onClick={() => handleEnd('transfer', 'Transfer to Another Team')}
          className="w-full btn-action btn-ghost py-3 text-sm font-semibold">
          🏥 Transfer — Hand Over to Another Team
        </button>

        <button onClick={() => handleEnd('cancel', 'Case Cancelled')}
          className="w-full btn-action py-3 text-sm text-danger bg-danger/5 border border-danger/20 font-semibold">
          ❌ Cancel Case — Do Not Save
        </button>

        <button onClick={onClose} className="w-full text-text-muted text-xs underline py-2">
          Continue Recording
        </button>
      </div>
    </div>
  );
}
