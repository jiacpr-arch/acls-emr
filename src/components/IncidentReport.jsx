import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { formatTimeLong } from '../utils/formatTime';
import PanelWrapper from './PanelWrapper';
import { FileText, Share, Copy } from 'lucide-react';

// Incident Report — auto-filled from case data
// For hospitals requiring documentation after cardiac arrest
export default function IncidentReport({ onClose }) {
  const { currentCase, events, patient, team, shockCount, etco2Readings, airway } = useCaseStore();
  const { elapsed, getCCF, cycleNumber, totalCPRTime } = useTimerStore();

  const p = patient || {};
  const t = team || {};
  const outcome = currentCase?.outcome || 'ongoing';
  const startTime = currentCase?.startTime ? new Date(currentCase.startTime) : null;
  const endTime = currentCase?.endTime ? new Date(currentCase.endTime) : null;

  const epiCount = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')).length;
  const amioCount = events.filter(e => e.category === 'drug' && e.type?.includes('Amiodarone')).length;
  const rhythmEvents = events.filter(e => e.category === 'rhythm');
  const htEvents = events.filter(e => e.type?.includes('Suspected cause') || e.type?.includes('Corrected'));

  const reportText = `
INCIDENT REPORT — CARDIAC ARREST
==================================
Date: ${startTime ? startTime.toLocaleDateString('en-US') : '-'}
Case ID: ${currentCase?.id || '-'}
Location: ${p.location || '-'}

PATIENT INFORMATION
Name: ${p.name || '-'}
HN: ${p.hn || '-'}
Age: ${p.age || '-'} | Gender: ${p.gender || '-'} | Weight: ${p.weight || '-'} kg

CLINICAL PRESENTATION
Chief Complaint: ${p.chiefComplaint || '-'}
PMH: ${Array.isArray(p.pmh) ? p.pmh.join(', ') : (p.pmh || '-')}
Medications: ${Array.isArray(p.medications) ? p.medications.join(', ') : (p.medications || '-')}
Allergies: ${Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || '-')}

EVENT DETAILS
Witnessed: ${p.witnessed ? 'Yes' : 'No'}
Bystander CPR: ${p.bystanderCPR ? 'Yes' : 'No'}
Initial Rhythm: ${p.initialRhythm || '-'}
Time of Arrest: ${startTime ? startTime.toLocaleTimeString('en-US', { hour12: false }) : '-'}
Time of ${outcome === 'ROSC' ? 'ROSC' : 'Termination'}: ${endTime ? endTime.toLocaleTimeString('en-US', { hour12: false }) : '-'}
Total Duration: ${formatTimeLong(elapsed)}

RESUSCITATION SUMMARY
CPR Duration: ${formatTimeLong(Math.round(totalCPRTime))}
CPR Cycles: ${cycleNumber}
CCF: ${getCCF()}%
Defibrillations: ${shockCount}
Epinephrine Doses: ${epiCount}
Amiodarone Doses: ${amioCount}
Airway: ${airway?.device || 'Not documented'}
Reversible Causes: ${htEvents.length > 0 ? htEvents.map(e => e.type).join('; ') : 'None identified'}

OUTCOME: ${outcome?.toUpperCase() || '-'}

TEAM
Leader: ${t.leader || '-'}
Airway: ${t.airway || '-'}
Drug Admin: ${t.drugAdmin || '-'}
Recorder: ${t.recorder || '-'}

Total Events Logged: ${events.length}
Report Generated: ${new Date().toLocaleString('en-US')}
==================================
  `.trim();

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(reportText).then(() => alert('Report copied'));
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Incident Report ${currentCase?.id}`, text: reportText });
      } catch (e) { /* cancelled */ }
    } else {
      copyToClipboard();
    }
  };

  return (
    <PanelWrapper title="Incident Report" icon={<FileText size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="flex gap-2 mb-3">
        <button onClick={share} className="btn btn-info btn-sm">
          <Share size={13} strokeWidth={2.2} /> Share
        </button>
        <button onClick={copyToClipboard} className="btn btn-ghost btn-sm">
          <Copy size={13} strokeWidth={2.2} /> Copy
        </button>
      </div>
      <pre className="text-[11px] font-mono text-text-primary whitespace-pre-wrap leading-relaxed bg-bg-primary p-4 border border-border"
        style={{ borderRadius: 'var(--radius-md)' }}>
        {reportText}
      </pre>
    </PanelWrapper>
  );
}
