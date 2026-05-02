import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { AlertCircle, AlertTriangle, TrendingUp, HeartPulse } from './ui/Icon';

export default function FloatingStatus({ onNoPulse, onUnresponsive, onROSC, onEKGChanged, currentStep }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const isArrest = currentStep === 'cpr_cycle' || currentStep === 'shock_decision' || currentStep === 'rhythm_check';

  const baseClass = "flex-1 flex items-center justify-center gap-1 text-[11px] py-2 font-bold transition-colors";
  const radius = { borderRadius: 'var(--radius)' };

  return (
    <div className="flex gap-1.5 px-3 py-1.5 bg-bg-secondary/95 backdrop-blur border-t border-border shrink-0">
      {!isArrest && (
        <button onClick={() => {
          addEvent({ elapsed, category: 'other', type: '🔴 No Pulse — Cardiac Arrest', details: {} });
          onNoPulse();
        }} className={`${baseClass} bg-danger/10 text-danger hover:bg-danger/15`} style={radius}>
          <AlertCircle size={13} strokeWidth={2.4} /> No Pulse
        </button>
      )}

      <button onClick={() => {
        addEvent({ elapsed, category: 'other', type: '😵 Patient Unresponsive — Re-assess', details: {} });
        onUnresponsive();
      }} className={`${baseClass} bg-warning/10 text-warning hover:bg-warning/15`} style={radius}>
        <AlertTriangle size={13} strokeWidth={2.4} /> Unresponsive
      </button>

      <button onClick={() => {
        addEvent({ elapsed, category: 'rhythm', type: '📈 EKG Changed — Re-assess', details: {} });
        onEKGChanged();
      }} className={`${baseClass} bg-info/10 text-info hover:bg-info/15`} style={radius}>
        <TrendingUp size={13} strokeWidth={2.4} /> EKG Changed
      </button>

      {isArrest && (
        <button onClick={() => {
          addEvent({ elapsed, category: 'other', type: '💚 ROSC', details: {} });
          onROSC();
        }} className={`${baseClass} bg-success/10 text-success hover:bg-success/15`} style={radius}>
          <HeartPulse size={13} strokeWidth={2.4} /> ROSC
        </button>
      )}
    </div>
  );
}
