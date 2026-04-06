import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

// Floating status change buttons — visible on ALL pathways
// Allows quick transition: No Pulse → Arrest, Unresponsive → Re-assess, ROSC
export default function FloatingStatus({ onNoPulse, onUnresponsive, onROSC, onEKGChanged, currentStep }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const isArrest = currentStep === 'cpr_cycle' || currentStep === 'shock_decision' || currentStep === 'rhythm_check';

  return (
    <div className="flex gap-1.5 px-3 py-1.5 bg-bg-secondary/90 border-t border-bg-tertiary/50 shrink-0">
      {/* No Pulse — go to cardiac arrest */}
      {!isArrest && (
        <button onClick={() => {
          addEvent({ elapsed, category: 'other', type: '🔴 No Pulse — Cardiac Arrest', details: {} });
          onNoPulse();
        }} className="flex-1 text-[10px] py-1.5 rounded-lg bg-danger/10 text-danger font-bold">
          🔴 No Pulse
        </button>
      )}

      {/* Unresponsive — re-assess */}
      <button onClick={() => {
        addEvent({ elapsed, category: 'other', type: '😵 Patient Unresponsive — Re-assess', details: {} });
        onUnresponsive();
      }} className="flex-1 text-[10px] py-1.5 rounded-lg bg-warning/10 text-warning font-bold">
        😵 Unresponsive
      </button>

      {/* EKG Changed */}
      <button onClick={() => {
        addEvent({ elapsed, category: 'rhythm', type: '📈 EKG Changed — Re-assess', details: {} });
        onEKGChanged();
      }} className="flex-1 text-[10px] py-1.5 rounded-lg bg-info/10 text-info font-bold">
        📈 EKG Changed
      </button>

      {/* ROSC — only in arrest */}
      {isArrest && (
        <button onClick={() => {
          addEvent({ elapsed, category: 'other', type: '💚 ROSC', details: {} });
          onROSC();
        }} className="flex-1 text-[10px] py-1.5 rounded-lg bg-success/10 text-success font-bold">
          💚 ROSC
        </button>
      )}
    </div>
  );
}
