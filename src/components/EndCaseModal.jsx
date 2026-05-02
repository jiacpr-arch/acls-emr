import { useCaseStore, clearActiveSession } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { playROSCSound } from '../utils/sound';
import { HeartPulse, Cross, FileText, Hospital, X, Square } from 'lucide-react';

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
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-bg-secondary p-4 space-y-2 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          borderTopLeftRadius: 'var(--radius-2xl)',
          borderTopRightRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-pop)',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0))',
        }}>
        <div className="w-10 h-1 bg-bg-tertiary mx-auto mb-2" style={{ borderRadius: 99 }} />

        <div className="flex items-center justify-between mb-1">
          <div className="text-headline text-text-primary">End Case — Select Outcome</div>
          <button onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
            style={{ borderRadius: 99 }} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <button onClick={() => handleEnd('ROSC', 'ROSC')} className="btn btn-success btn-lg btn-block">
          <HeartPulse size={16} strokeWidth={2.4} /> ROSC — Return of Spontaneous Circulation
        </button>

        <button onClick={() => handleEnd('terminated', 'CPR Terminated')} className="btn btn-ghost btn-block">
          <Cross size={15} strokeWidth={2.2} /> Terminate CPR
        </button>

        <button onClick={() => handleEnd('DNAR', 'DNAR')} className="btn btn-ghost btn-block">
          <FileText size={15} strokeWidth={2.2} /> DNAR — Do Not Attempt Resuscitation
        </button>

        <button onClick={() => handleEnd('transfer', 'Transfer to Another Team')} className="btn btn-ghost btn-block">
          <Hospital size={15} strokeWidth={2.2} /> Transfer — Hand Over to Another Team
        </button>

        <button onClick={() => handleEnd('cancel', 'Case Cancelled')}
          className="btn btn-outline-danger btn-block">
          <Square size={15} strokeWidth={2.2} /> Cancel Case — Do Not Save
        </button>

        <button onClick={onClose} className="w-full text-text-muted text-caption py-2">
          Continue Recording
        </button>
      </div>
    </div>
  );
}
