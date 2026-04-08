import PanelWrapper from './PanelWrapper';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { formatTimeLong } from '../utils/formatTime';

// SBAR Handover auto-generated from case data
// S: Situation, B: Background, A: Assessment, R: Recommendation
export default function SBARHandover({ onClose }) {
  const { currentCase, events, patient, team, shockCount, etco2Readings, airway } = useCaseStore();
  const { elapsed, getCCF, cycleNumber, totalCPRTime } = useTimerStore();

  const p = patient || {};
  const outcome = currentCase?.outcome || 'ongoing';
  const duration = formatTimeLong(elapsed);

  // Extract key events
  const epiCount = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')).length;
  const amioCount = events.filter(e => e.category === 'drug' && e.type?.includes('Amiodarone')).length;
  const rhythmEvents = events.filter(e => e.category === 'rhythm');
  const lastRhythm = rhythmEvents[0]?.type?.replace('Rhythm: ', '').replace('Initial Rhythm: ', '') || p.initialRhythm || 'Unknown';
  const latestEtco2 = etco2Readings?.length > 0 ? etco2Readings[etco2Readings.length - 1]?.value : null;

  // Build SBAR
  const situation = `${p.age ? `${p.age}y` : ''} ${p.gender || ''} patient, ${outcome === 'ROSC' ? 'ROSC achieved' : outcome === 'ongoing' ? 'ongoing resuscitation' : `case ${outcome}`}. Duration: ${duration}.`;

  const background = [
    p.chiefComplaint && `Presenting complaint: ${p.chiefComplaint}.`,
    p.pmh && `PMH: ${Array.isArray(p.pmh) ? p.pmh.join(', ') : p.pmh}.`,
    p.medications && `Medications: ${Array.isArray(p.medications) ? p.medications.join(', ') : p.medications}.`,
    p.allergies && `Allergies: ${Array.isArray(p.allergies) ? p.allergies.join(', ') : p.allergies}.`,
    `Witnessed: ${p.witnessed ? 'Yes' : 'No'}. Bystander CPR: ${p.bystanderCPR ? 'Yes' : 'No'}.`,
  ].filter(Boolean).join(' ');

  const assessment = [
    `Initial rhythm: ${p.initialRhythm || 'Unknown'}. Current rhythm: ${lastRhythm}.`,
    `CPR: ${cycleNumber} cycles, CCF ${getCCF()}%.`,
    `Shocks: ${shockCount}. Epinephrine: ${epiCount} doses. Amiodarone: ${amioCount} doses.`,
    airway?.device && `Airway: ${airway.device}${airway.tubeSize ? ` #${airway.tubeSize}` : ''}.`,
    latestEtco2 !== null && `Last EtCO₂: ${latestEtco2} mmHg.`,
  ].filter(Boolean).join(' ');

  const recommendation = outcome === 'ROSC'
    ? 'Post-ROSC care: target SpO₂ 92-98%, MAP ≥65, 12-Lead ECG (STEMI?), TTM if no command, serial labs.'
    : outcome === 'ongoing'
    ? 'Continue ACLS. Consider reversible causes (H\'s & T\'s). Reassess rhythm q2min.'
    : 'Case terminated. Documentation complete. Family notified.';

  const fullSBAR = `S: ${situation}\n\nB: ${background}\n\nA: ${assessment}\n\nR: ${recommendation}`;

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(fullSBAR).then(() => {
      alert('SBAR copied to clipboard');
    });
  };

  return (
    <PanelWrapper title="SBAR Handover" icon="📋" onClose={onClose} onSave={copyToClipboard} saveLabel="Copy">
      <div className="space-y-3">
        <SBARSection letter="S" title="Situation" color="bg-danger" content={situation} />
        <SBARSection letter="B" title="Background" color="bg-warning" content={background} />
        <SBARSection letter="A" title="Assessment" color="bg-info" content={assessment} />
        <SBARSection letter="R" title="Recommendation" color="bg-success" content={recommendation} />
      </div>
    </PanelWrapper>
  );
}

function SBARSection({ letter, title, color, content }) {
  return (
    <div className="glass-card !p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-7 h-7 ${color} text-white rounded-lg flex items-center justify-center text-sm font-black`}>{letter}</span>
        <span className="text-sm font-bold text-text-primary">{title}</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{content || '—'}</p>
    </div>
  );
}
