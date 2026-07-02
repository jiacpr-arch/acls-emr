import { useCaseStore } from '../../stores/caseStore';
import { useTimerStore } from '../../stores/timerStore';
import { formatTimeLong } from '../../utils/formatTime';
import { exportCasePDF } from '../../utils/exportPDF';
import { StepCard, BigButton } from '../StepUI';
import { Cross } from 'lucide-react';

export default function TerminatedStep({ onDone }) {
  const { currentCase, events, patient, team, etco2Readings, shockCount } = useCaseStore();
  const { elapsed } = useTimerStore();

  const handleExport = () => {
    const timer = useTimerStore.getState();
    exportCasePDF({
      id: currentCase?.id, mode: currentCase?.mode, startTime: currentCase?.startTime, endTime: new Date(),
      outcome: 'terminated', events, patient, team, etco2Readings,
      ccf: timer.getCCF(), totalCPRTime: Math.round(timer.totalCPRTime),
      totalPauseTime: Math.round(timer.totalPauseTime), cycleNumber: timer.cycleNumber, shockCount, elapsed: Math.round(timer.elapsed),
    });
  };

  return (
    <StepCard phase="Case Ended" phaseColor="text-text-muted" icon={Cross} title="Case Terminated" subtitle={`Total duration: ${formatTimeLong(elapsed)}`}>
      <BigButton color="bg-info text-white" onClick={handleExport}>📄 Export PDF Report</BigButton>
      <BigButton color="bg-bg-secondary text-text-primary" onClick={onDone}>Done → Dashboard</BigButton>
    </StepCard>
  );
}
