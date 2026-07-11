import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerWorker } from '../hooks/useTimerWorker';
import { useMetronome } from '../hooks/useMetronome';
import { useRecordingLifecycle } from '../hooks/useRecordingLifecycle';
import { playROSCSound } from '../utils/sound';
import { isPediatric } from '../utils/pediatricDose';
import VoiceCommand from '../components/VoiceCommand';

// Components
import VitalsPanel from '../components/VitalsPanel';
import AirwayPanel from '../components/AirwayPanel';
import LabsPanel from '../components/LabsPanel';
import ReversibleCausesPanel from '../components/ReversibleCausesPanel';
import EKGCapture from '../components/EKGCapture';
import SimulationEngine, { StaffTakeover, ScenarioComplete } from '../components/SimulationEngine';
import { getScenarioById } from '../data/scenarios';
import EndCaseModal from '../components/EndCaseModal';
import CheatSheet from '../components/CheatSheet';
import SBARHandover from '../components/SBARHandover';
import DebriefingGuide from '../components/DebriefingGuide';
import PhotoNote from '../components/PhotoNote';
import IncidentReport from '../components/IncidentReport';
import CommLog from '../components/CommLog';
import QuickBar from '../components/QuickBar';
import { EventLogPanel, PatientInfoPanel, TeamPanel } from '../components/Panels';
import { STEPS, getInitialStep, ARREST_STEPS } from '../data/recordingSteps';
import TimerBar from '../components/recording/TimerBar';
import VentGuard from '../components/recording/VentGuard';
import StepRouter from '../components/recording/StepRouter';
import { ShockModal } from '../components/recording/ShockControls';

// ==========================================
// ACLS Recording — Hybrid Wizard + Dashboard
// ==========================================

export default function Recording() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startMode = searchParams.get('start') || 'bls';
  const currentCase = useCaseStore(s => s.currentCase);
  const endCase = useCaseStore(s => s.endCase);
  // Narrow selectors: the timer store is set() 5×/sec while running, so a
  // bare useTimerStore() would re-render this whole page on every tick.
  const isRunning = useTimerStore(s => s.isRunning);
  const elapsed = useTimerStore(s => s.elapsed);
  const mode = useSettingsStore(s => s.mode);
  const isTraining = mode === 'training';

  // Scenario mode
  const scenarioId = searchParams.get('scenario');
  const scenarioMode = searchParams.get('mode') || 'learning';
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;
  const [scenarioState, setScenarioState] = useState(scenario ? 'active' : null);
  const [scenarioScore, setScenarioScore] = useState(null);

  // Initialize
  useTimerWorker();
  useMetronome();
  useRecordingLifecycle({ startMode, currentCase, navigate });

  const [step, setStep] = useState(getInitialStep(startMode));

  const [showLog, setShowLog] = useState(false);
  const [showPatient, setShowPatient] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showShockModal, setShowShockModal] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showAirway, setShowAirway] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [showHT, setShowHT] = useState(false);
  const [showEKG, setShowEKG] = useState(false);
  const [showEndCase, setShowEndCase] = useState(false);
  const [showVent, setShowVent] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSBAR, setShowSBAR] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showPhotoNote, setShowPhotoNote] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [showComm, setShowComm] = useState(false);

  if (!currentCase) return null;

  // Scenario screens
  if (scenario && scenarioState === 'complete') {
    return <ScenarioComplete scenario={scenario} score={scenarioScore} mode={scenarioMode}
      onRetry={() => window.location.reload()}
      onNext={() => navigate('/scenarios')}
      onDashboard={() => navigate('/history')} />;
  }
  if (scenario && scenarioState === 'takeover') {
    return <StaffTakeover scenario={scenario} score={scenarioScore}
      onRetry={() => window.location.reload()}
      onNext={() => navigate('/scenarios')} />;
  }

  const log = (category, type, details = {}) => {
    useCaseStore.getState().addEvent({ elapsed: useTimerStore.getState().elapsed, category, type, details });
  };
  const goStep = (nextStep) => setStep(nextStep);
  const handleEndCase = async (outcome) => {
    const timer = useTimerStore.getState();
    if (timer.cprActive) timer.stopCPR('case_end');
    timer.stopTimer();
    if (outcome === 'ROSC') playROSCSound();
    await endCase(outcome);
    setStep(outcome === 'ROSC' ? STEPS.ROSC : STEPS.TERMINATED);
  };

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden relative ${isTraining ? 'bg-blue-50 dark:bg-slate-900 ring-4 ring-blue-300/30 ring-inset' : 'bg-bg-primary'}`}>
      {/* Training mode banner */}
      {isTraining && !scenario && (
        <div className="bg-info text-white text-center text-3xs font-bold py-1.5 tracking-wider shrink-0 z-50">TRAINING MODE</div>
      )}

      {/* Simulation engine */}
      {scenario && scenarioState === 'active' && (
        <SimulationEngine scenario={scenario} mode={scenarioMode}
          onComplete={(s) => { setScenarioScore(s); setScenarioState('complete'); }}
          onStaffTakeover={(s) => { setScenarioScore(s); setScenarioState('takeover'); }} />
      )}

      {/* Timer Bar + Pediatric + Voice */}
      {(isRunning || elapsed > 0) && (
        <>
          <TimerBar onToggleLog={() => setShowLog(!showLog)} showLog={showLog} isTraining={isTraining} currentStep={step} />
          <div className="flex items-center justify-between px-3 py-0.5 bg-bg-secondary/50 shrink-0">
            <div className="flex items-center gap-2">
              {isPediatric(useCaseStore.getState().patient) && (
                <span className="text-[9px] font-bold bg-purple/15 text-purple px-2 py-0.5 rounded-full">PEDS</span>
              )}
            </div>
            <VoiceCommand />
          </div>
        </>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-4 overflow-y-auto pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        <div className="w-full max-w-md">
          <StepRouter
            step={step}
            startMode={startMode}
            scenario={scenario}
            isTraining={isTraining}
            onGoStep={goStep}
            onLog={log}
            onEndCase={handleEndCase}
            onShock={() => setShowShockModal(true)}
            onOpenLabs={() => setShowLabs(true)}
            onNavigateHistory={() => navigate('/history')}
          />
        </div>
      </div>

      {/* Quick access bar */}
      {(isRunning || elapsed > 0) && (
        <QuickBar
          onPatient={() => setShowPatient(true)}
          onTeam={() => setShowTeam(true)}
          onVitals={() => setShowVitals(true)}
          onLabs={() => setShowLabs(true)}
          onEKG={() => setShowEKG(true)}
          onAirway={() => setShowAirway(true)}
          onHT={() => setShowHT(true)}
          onVent={() => setShowVent(true)}
          onCheatSheet={() => setShowCheatSheet(true)}
          onSBAR={() => setShowSBAR(true)}
          onComm={() => setShowComm(true)}
          onIncident={() => setShowIncident(true)}
          onPhotoNote={() => setShowPhotoNote(true)}
          onDebrief={() => setShowDebrief(true)}
          onEndCase={() => setShowEndCase(true)}
          onNoPulse={() => { useTimerStore.getState().startCPR(); goStep(STEPS.START_CPR); }}
          onUnresponsive={() => goStep(STEPS.CHECK_PULSE)}
          onEKGChanged={() => goStep(STEPS.RHYTHM_CHECK)}
          onROSC={() => handleEndCase('ROSC')}
          isArrest={ARREST_STEPS.includes(step)}
          isPostROSC={step === STEPS.ROSC}
        />
      )}

      {/* Overlays */}
      {showLog && <EventLogPanel onClose={() => setShowLog(false)} />}
      {showPatient && <PatientInfoPanel onClose={() => setShowPatient(false)} />}
      {showTeam && <TeamPanel onClose={() => setShowTeam(false)} />}
      {showShockModal && <ShockModal onClose={() => setShowShockModal(false)} isTraining={isTraining} />}
      {showVitals && <VitalsPanel onClose={() => setShowVitals(false)} />}
      {showAirway && <AirwayPanel onClose={() => setShowAirway(false)} />}
      {showLabs && <LabsPanel onClose={() => setShowLabs(false)} />}
      {showHT && <ReversibleCausesPanel onClose={() => setShowHT(false)}
        onOpenAirway={() => { setShowHT(false); setShowAirway(true); }}
        onOpenLabs={() => { setShowHT(false); setShowLabs(true); }}
      />}
      {showEKG && <EKGCapture onClose={() => setShowEKG(false)} />}
      {showVent && <VentGuard onClose={() => setShowVent(false)} onNeedAirway={() => { setShowVent(false); setShowAirway(true); }} />}
      {showCheatSheet && <CheatSheet onClose={() => setShowCheatSheet(false)} />}
      {showSBAR && <SBARHandover onClose={() => setShowSBAR(false)} />}
      {showDebrief && <DebriefingGuide onClose={() => setShowDebrief(false)} />}
      {showPhotoNote && <PhotoNote onClose={() => setShowPhotoNote(false)} />}
      {showIncident && <IncidentReport onClose={() => setShowIncident(false)} />}
      {showComm && <CommLog onClose={() => setShowComm(false)} />}
      {showEndCase && <EndCaseModal
        onClose={() => setShowEndCase(false)}
        onROSC={() => goStep(STEPS.ROSC)}
        onTerminate={() => goStep(STEPS.TERMINATED)}
        onDashboard={() => navigate('/history')}
      />}
    </div>
  );
}
