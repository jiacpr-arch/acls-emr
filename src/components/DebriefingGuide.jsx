import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { formatTimeLong } from '../utils/formatTime';

// Debriefing Guide — auto-generated post-case analysis
// Shows: what went well, what to improve, action plan
export default function DebriefingGuide({ onClose }) {
  const { events, patient, shockCount, etco2Readings } = useCaseStore();
  const { elapsed, getCCF, totalCPRTime, totalPauseTime, cycleNumber } = useTimerStore();

  const ccf = getCCF();
  const epiEvents = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion'));
  const shockEvents = events.filter(e => e.category === 'shock');
  const cprStartEvent = events.filter(e => e.type?.includes('CPR Started')).sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));

  // Analyze performance
  const strengths = [];
  const improvements = [];
  const actions = [];

  // Time to first CPR
  if (cprStartEvent.length > 0 && cprStartEvent[0].elapsed <= 30) {
    strengths.push({ text: `CPR started within ${cprStartEvent[0].elapsed}s`, detail: 'Early CPR improves survival' });
  } else if (cprStartEvent.length > 0) {
    improvements.push({ text: `CPR started at ${cprStartEvent[0].elapsed}s (target <30s)`, detail: 'Start compressions as soon as pulseless confirmed' });
    actions.push('Practice rapid pulse check + immediate CPR initiation');
  }

  // Time to first shock
  if (shockEvents.length > 0) {
    const firstShock = shockEvents.sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0))[0];
    if (firstShock.elapsed <= 120) {
      strengths.push({ text: `First shock at ${firstShock.elapsed}s`, detail: 'Early defibrillation is key for VF/pVT' });
    } else {
      improvements.push({ text: `First shock at ${firstShock.elapsed}s (target <2min)`, detail: 'For every minute without defibrillation, survival decreases ~10%' });
      actions.push('Practice rapid rhythm recognition + defibrillation');
    }
  }

  // CCF
  if (ccf >= 80) {
    strengths.push({ text: `Excellent CCF: ${ccf}%`, detail: 'Target ≥60%, yours exceeded 80%' });
  } else if (ccf >= 60) {
    strengths.push({ text: `Adequate CCF: ${ccf}%`, detail: 'Above minimum target of 60%' });
  } else if (ccf > 0) {
    improvements.push({ text: `Low CCF: ${ccf}% (target ≥60%)`, detail: 'Minimize interruptions in chest compressions' });
    actions.push('Practice minimizing pause times during rhythm checks');
  }

  // Epi timing
  if (epiEvents.length >= 2) {
    const intervals = [];
    for (let i = 1; i < epiEvents.length; i++) {
      intervals.push((epiEvents[i].elapsed || 0) - (epiEvents[i - 1].elapsed || 0));
    }
    const avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    const compliant = intervals.filter(iv => iv >= 180 && iv <= 300).length;
    if (compliant === intervals.length) {
      strengths.push({ text: `Epi timing perfect (avg ${avgInterval}s)`, detail: 'All intervals within 3-5 min range' });
    } else {
      improvements.push({ text: `Epi timing: ${compliant}/${intervals.length} intervals on time`, detail: `Average interval ${avgInterval}s (target 180-300s)` });
      actions.push('Use drug timer reminders for Epi q3-5min');
    }
  } else if (epiEvents.length === 1) {
    strengths.push({ text: 'Epinephrine administered', detail: '' });
  } else if (elapsed > 120) {
    improvements.push({ text: 'No Epinephrine given', detail: 'Epi should be given early in cardiac arrest' });
    actions.push('Review drug timing algorithm for cardiac arrest');
  }

  // H&T checked
  const htEvents = events.filter(e => e.type?.includes('Suspected cause') || e.type?.includes('Corrected'));
  if (htEvents.length > 0) {
    strengths.push({ text: `Reversible causes assessed (${htEvents.length} checked)`, detail: 'Identifying and treating H&T improves outcomes' });
  } else if (elapsed > 300) {
    improvements.push({ text: 'Reversible causes not assessed', detail: 'Check H\'s & T\'s during CPR' });
    actions.push('Practice systematic H&T assessment during resuscitation');
  }

  // Airway
  const airwayEvents = events.filter(e => e.category === 'airway');
  if (airwayEvents.length > 0) {
    strengths.push({ text: 'Airway management performed', detail: airwayEvents[0]?.type || '' });
  }

  // If no improvements found
  if (improvements.length === 0 && strengths.length > 0) {
    strengths.push({ text: 'Overall excellent performance!', detail: 'Keep up the good work' });
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">📊 Debriefing Guide</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Summary */}
        <div className="glass-card !p-3 text-center">
          <div className="text-2xl font-mono font-black text-text-primary">{formatTimeLong(elapsed)}</div>
          <div className="text-xs text-text-muted">Total Duration · CPR {cycleNumber} cycles · CCF {ccf}%</div>
        </div>

        {/* Strengths */}
        <div>
          <div className="text-xs font-bold text-success uppercase tracking-wider mb-2">✅ What Went Well</div>
          {strengths.length > 0 ? strengths.map((s, i) => (
            <div key={i} className="glass-card !p-2.5 mb-1.5 border-l-4 border-success">
              <div className="text-xs font-bold text-text-primary">{s.text}</div>
              {s.detail && <div className="text-[10px] text-text-muted">{s.detail}</div>}
            </div>
          )) : (
            <div className="text-xs text-text-muted">No data to analyze yet</div>
          )}
        </div>

        {/* Improvements */}
        <div>
          <div className="text-xs font-bold text-warning uppercase tracking-wider mb-2">⚠️ Areas to Improve</div>
          {improvements.length > 0 ? improvements.map((s, i) => (
            <div key={i} className="glass-card !p-2.5 mb-1.5 border-l-4 border-warning">
              <div className="text-xs font-bold text-text-primary">{s.text}</div>
              {s.detail && <div className="text-[10px] text-text-muted">{s.detail}</div>}
            </div>
          )) : (
            <div className="text-xs text-success font-semibold">No issues found — great job!</div>
          )}
        </div>

        {/* Action Plan */}
        {actions.length > 0 && (
          <div>
            <div className="text-xs font-bold text-info uppercase tracking-wider mb-2">🎯 Action Plan</div>
            {actions.map((a, i) => (
              <div key={i} className="glass-card !p-2.5 mb-1.5 border-l-4 border-info">
                <div className="text-xs text-text-primary">{i + 1}. {a}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-box">
            <div className="stat-value text-lg text-text-primary">{shockCount}</div>
            <div className="stat-label">Shocks</div>
          </div>
          <div className="stat-box">
            <div className="stat-value text-lg text-text-primary">{epiEvents.length}</div>
            <div className="stat-label">Epi Doses</div>
          </div>
          <div className="stat-box">
            <div className="stat-value text-lg text-text-primary">{events.length}</div>
            <div className="stat-label">Events</div>
          </div>
        </div>
      </div>
    </div>
  );
}
