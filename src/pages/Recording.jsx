import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getRhythmsByCategory } from '../data/rhythms';
import { formatTimeLong, formatTime } from '../utils/formatTime';
import { useTimerWorker } from '../hooks/useTimerWorker';
import { useMetronome } from '../hooks/useMetronome';
import { initAudio, playShockSound, playROSCSound } from '../utils/sound';
import { checkDrugInteraction, checkAllergy } from '../utils/drugInteractions';
import { isPediatric } from '../utils/pediatricDose';
import { t } from '../utils/i18n';
import VoiceCommand from '../components/VoiceCommand';
import { exportCasePDF } from '../utils/exportPDF';
import { HeartPulse, Pause, Pill, AlertTriangle, FileText, Zap, Shield, Hand, Phone, Hospital, Monitor, Activity, Syringe, Cross } from 'lucide-react';

// Components
import CPRDashboard from '../components/CPRDashboard';
import VitalsPanel from '../components/VitalsPanel';
import AirwayPanel from '../components/AirwayPanel';
import LabsPanel from '../components/LabsPanel';
import ReversibleCausesPanel from '../components/ReversibleCausesPanel';
import FloatingStatus from '../components/FloatingStatus';
import BradycardiaPathway from '../components/BradycardiaPathway';
import TachycardiaPathway from '../components/TachycardiaPathway';
import MIACSPathway from '../components/MIACSPathway';
import StrokePathway from '../components/StrokePathway';
import PostROSCChecklist from '../components/PostROSCChecklist';
import EKGCapture from '../components/EKGCapture';
import SimulationEngine, { StaffTakeover, ScenarioComplete } from '../components/SimulationEngine';
import { getScenarioById } from '../data/scenarios';
import StableMonitor from '../components/StableMonitor';
import EndCaseModal from '../components/EndCaseModal';
import VentilatorSettings from '../components/VentilatorSettings';
import CheatSheet from '../components/CheatSheet';
import SBARHandover from '../components/SBARHandover';
import DebriefingGuide from '../components/DebriefingGuide';
import PhotoNote from '../components/PhotoNote';
import IncidentReport from '../components/IncidentReport';
import CommLog from '../components/CommLog';
import QuickBar from '../components/QuickBar';
import { StepCard, BigButton, TrainingHint, CountdownHint } from '../components/StepUI';
import { EventLogPanel, PatientInfoPanel, TeamPanel } from '../components/Panels';

// ==========================================
// ACLS Recording — Hybrid Wizard + Dashboard
// ==========================================

const STEPS = {
  // BLS SURVEY
  SCENE_SAFETY: 'scene_safety',
  CHECK_RESPONSE: 'check_response',
  CALL_FOR_HELP: 'call_for_help',
  CHECK_PULSE: 'check_pulse',
  // RRT/MET ENTRY
  RRT_ARRIVED: 'rrt_arrived',
  // Pulse present pathways
  PULSE_PRESENT: 'pulse_present',
  PULSE_BRADYCARDIA: 'pulse_bradycardia',
  PULSE_TACHYCARDIA: 'pulse_tachycardia',
  PULSE_NORMAL: 'pulse_normal',
  PULSE_MI: 'pulse_mi',
  PULSE_STROKE: 'pulse_stroke',
  // No pulse → CPR
  START_CPR: 'start_cpr',
  ATTACH_MONITOR: 'attach_monitor',
  INITIAL_RHYTHM: 'initial_rhythm',
  // Primary Survey (ACLS)
  SHOCK_DECISION: 'shock_decision',
  CPR_CYCLE: 'cpr_cycle',
  RHYTHM_CHECK: 'rhythm_check',
  GIVE_DRUG: 'give_drug',
  AIRWAY_MANAGEMENT: 'airway_mgmt',
  SECONDARY_SURVEY: 'secondary_survey',
  // Outcomes
  ROSC: 'rosc',
  TERMINATED: 'terminated',
};

export default function Recording() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startMode = searchParams.get('start') || 'bls';
  const currentCase = useCaseStore(s => s.currentCase);
  const addEvent = useCaseStore(s => s.addEvent);
  const endCase = useCaseStore(s => s.endCase);
  const { isRunning, startTimer, elapsed } = useTimerStore();
  const mode = useSettingsStore(s => s.mode);
  const lang = useSettingsStore(s => s.language) || 'en';
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
  useEffect(() => { initAudio(); }, []);

  const getInitialStep = () => {
    if (startMode === 'resume') return STEPS.CPR_CYCLE; // resume to dashboard
    if (startMode === 'rrt') return STEPS.RRT_ARRIVED;
    return STEPS.SCENE_SAFETY;
  };
  const [step, setStep] = useState(getInitialStep());
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
  const [witnessed, setWitnessed] = useState(null);
  const [bystanderCPR, setBystanderCPR] = useState(null);

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
    addEvent({ elapsed: useTimerStore.getState().elapsed, category, type, details });
  };
  const goStep = (nextStep) => setStep(nextStep);
  const handleEndCase = async (outcome) => {
    const timer = useTimerStore.getState();
    if (timer.cprActive) timer.stopCPR('case_end');
    timer.stopTimer();
    if (outcome === 'ROSC') playROSCSound();
    try {
      await endCase(outcome);
    } catch (err) {
      console.error('Failed to persist end-of-case:', err);
    }
    setStep(outcome === 'ROSC' ? STEPS.ROSC : STEPS.TERMINATED);
  };

  // ===== Render step =====
  const renderStep = () => {
    switch (step) {
      // ========== BLS SURVEY ==========
      case STEPS.SCENE_SAFETY:
        return (
          <StepCard phase="BLS Survey" phaseColor="text-info" icon={Shield} title="Scene Safety"
            subtitle="Is the scene safe for you and the patient?"
            instructions={['Check for hazards (electrical, chemical, traffic)', 'Wear PPE (gloves, mask, eye protection)', 'Ensure safe approach']}>
            <BigButton color="bg-success" onClick={() => { log('other', '✅ Scene Safe'); goStep(STEPS.CHECK_RESPONSE); }}>
              ✅ Scene is SAFE
            </BigButton>
          </StepCard>
        );

      case STEPS.CHECK_RESPONSE:
        return (
          <StepCard phase="BLS Survey" phaseColor="text-info" icon={Hand} title="Check Responsiveness & Breathing"
            subtitle='Tap shoulders, shout "Are you okay?" + Look for breathing'
            instructions={['Tap both shoulders firmly', 'Shout clearly: "Are you okay?"', 'Look, listen, feel for breathing (5-10 sec)', 'Gasping = NOT normal breathing']}>
            <TrainingHint show={isTraining}>
              <p>Normal breathing = has pulse → assess further</p>
              <p>Gasping or no breathing → check pulse → may need CPR</p>
            </TrainingHint>
            <div className="grid grid-cols-1 gap-3 w-full">
              <BigButton color="bg-danger" onClick={() => { log('other', '❌ Unresponsive + Not Breathing'); goStep(STEPS.CALL_FOR_HELP); }}>
                ❌ Unresponsive + Not Breathing
                <div className="text-[10px] font-normal mt-0.5">→ Call for help → Check Pulse</div>
              </BigButton>
              <BigButton color="bg-danger" onClick={() => { log('other', '❌ Unresponsive + Gasping (agonal breathing)'); goStep(STEPS.CALL_FOR_HELP); }}>
                ❌ Unresponsive + Gasping
                <div className="text-[10px] font-normal mt-0.5">Gasping = NOT normal → treat as no breathing</div>
              </BigButton>
              <BigButton color="bg-warning text-black" onClick={() => { log('other', '❌ Unresponsive BUT Breathing normally → Recovery position'); goStep(STEPS.PULSE_PRESENT); }}>
                ❌ Unresponsive BUT Breathing Normally
                <div className="text-[10px] font-normal mt-0.5">Has pulse → Recovery position → Monitor</div>
              </BigButton>
              <BigButton color="bg-success" onClick={() => { log('other', '✅ Responsive + Breathing'); goStep(STEPS.PULSE_PRESENT); }}>
                ✅ Responsive + Breathing
              </BigButton>
            </div>
          </StepCard>
        );

      case STEPS.CALL_FOR_HELP:
        return (
          <StepCard phase="BLS Survey" phaseColor="text-info" icon={Phone} title="Activate Emergency Response"
            subtitle="Call for help & get AED/Defibrillator"
            instructions={['Call code team / 1669 / hospital emergency', 'Ask someone to bring AED/defibrillator', 'Ask someone to bring crash cart']}>
            <div className="space-y-4 w-full">
              <div className="text-sm text-text-secondary text-center font-medium">Witnessed arrest?</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setWitnessed(true)} className={`btn-action py-3.5 text-sm ${witnessed === true ? 'btn-info' : 'btn-ghost'}`}>Yes — Witnessed</button>
                <button onClick={() => setWitnessed(false)} className={`btn-action py-3.5 text-sm ${witnessed === false ? 'btn-info' : 'btn-ghost'}`}>No — Unwitnessed</button>
              </div>
              <div className="text-sm text-text-secondary text-center font-medium">Bystander CPR?</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setBystanderCPR(true)} className={`btn-action py-3.5 text-sm ${bystanderCPR === true ? 'btn-info' : 'btn-ghost'}`}>Yes</button>
                <button onClick={() => setBystanderCPR(false)} className={`btn-action py-3.5 text-sm ${bystanderCPR === false ? 'btn-info' : 'btn-ghost'}`}>No</button>
              </div>
              <BigButton color="bg-warning text-black" onClick={() => {
                log('other', '📞 Help activated', { witnessed, bystanderCPR });
                useCaseStore.getState().updatePatient('witnessed', witnessed);
                useCaseStore.getState().updatePatient('bystanderCPR', bystanderCPR);
                goStep(STEPS.CHECK_PULSE);
              }}>📞 Help Activated → Check Pulse</BigButton>
            </div>
          </StepCard>
        );

      case STEPS.RRT_ARRIVED:
        return (
          <StepCard phase="RRT / MET Team" phaseColor="text-info" icon={Hospital} title="Team Arrived"
            subtitle="Rapid Response / Medical Emergency Team on scene"
            instructions={['Get brief handover from caller', 'What happened? When? Any interventions?', 'Attach monitor if not done', 'Assess patient now']}>
            <BigButton color="bg-info" onClick={() => { startTimer(); log('other', '🏥 RRT/MET Team arrived'); goStep(STEPS.CHECK_PULSE); }}>
              🏥 Team Ready → Assess Patient
            </BigButton>
          </StepCard>
        );

      case STEPS.CHECK_PULSE:
        return (
          <StepCard phase={startMode === 'rrt' ? 'RRT Assessment' : 'BLS Survey'} phaseColor="text-info"
            icon={HeartPulse} title="Check Pulse & Breathing" subtitle="Carotid pulse check — MAX 10 seconds"
            instructions={['Feel carotid pulse (one side)', 'Simultaneously look for breathing', 'Gasping = NOT normal breathing', 'If unsure → assume NO pulse']}>
            <CountdownHint seconds={10} />
            <TrainingHint show={isTraining}>
              <p>Carotid pulse check ≤10 seconds — if unsure, assume no pulse</p>
            </TrainingHint>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <BigButton color="bg-danger" onClick={() => { log('other', '❌ No Pulse — Cardiac Arrest'); if (!isRunning) startTimer(); goStep(STEPS.START_CPR); }}>❌ No Pulse</BigButton>
              <BigButton color="bg-success" onClick={() => { log('other', '✅ Pulse Present'); goStep(STEPS.PULSE_PRESENT); }}>✅ Pulse Present</BigButton>
            </div>
          </StepCard>
        );

      // ========== PULSE PRESENT ==========
      case STEPS.PULSE_PRESENT:
        return (
          <StepCard phase="Assessment" phaseColor="text-success" icon={HeartPulse} title="Pulse Present"
            subtitle="Assess heart rate and condition"
            instructions={['Check monitor or count pulse for 6 sec × 10', 'If not breathing adequately → Rescue breathing', 'Attach monitor if not done']}>
            <div className="grid grid-cols-1 gap-3 w-full">
              <BigButton color="bg-info" onClick={() => { if (!isRunning) startTimer(); log('other', '🐢 Bradycardia'); goStep(STEPS.PULSE_BRADYCARDIA); }}>🐢 Bradycardia (HR &lt; 50)</BigButton>
              <BigButton color="bg-success" onClick={() => { if (!isRunning) startTimer(); log('other', '✅ Normal rate'); goStep(STEPS.PULSE_NORMAL); }}>✅ Normal (HR 50-150)</BigButton>
              <BigButton color="bg-danger" onClick={() => { if (!isRunning) startTimer(); log('other', '⚡ Tachycardia'); goStep(STEPS.PULSE_TACHYCARDIA); }}>🐇 Tachycardia (HR &gt; 150)</BigButton>
              <div className="grid grid-cols-2 gap-3">
                <BigButton color="bg-danger" onClick={() => { if (!isRunning) startTimer(); log('other', '🫀 Suspected ACS/MI'); goStep(STEPS.PULSE_MI); }}>🫀 ACS / MI</BigButton>
                <BigButton color="bg-purple text-white" onClick={() => { if (!isRunning) startTimer(); log('other', '🧠 Suspected Stroke'); goStep(STEPS.PULSE_STROKE); }}>🧠 Stroke</BigButton>
              </div>
            </div>
          </StepCard>
        );

      case STEPS.PULSE_BRADYCARDIA:
        return <BradycardiaPathway onLog={log} onMonitor={() => goStep(STEPS.PULSE_NORMAL)} onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)} onArrest={() => goStep(STEPS.START_CPR)} isTraining={isTraining} />;

      case STEPS.PULSE_TACHYCARDIA:
        return <TachycardiaPathway onLog={log} onMonitor={() => goStep(STEPS.PULSE_NORMAL)} onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)} onArrest={() => goStep(STEPS.START_CPR)} isTraining={isTraining} />;

      case STEPS.PULSE_MI:
        return <MIACSPathway onLog={log} onMonitor={() => goStep(STEPS.PULSE_NORMAL)} onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)} onArrest={() => goStep(STEPS.START_CPR)} isTraining={isTraining} />;

      case STEPS.PULSE_STROKE:
        return <StrokePathway onLog={log} onMonitor={() => goStep(STEPS.PULSE_NORMAL)} onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)} onArrest={() => goStep(STEPS.START_CPR)} isTraining={isTraining} />;

      case STEPS.PULSE_NORMAL:
        return <StableMonitor
          onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)}
          onArrest={() => goStep(STEPS.START_CPR)}
          onDone={() => navigate('/history')}
          isTraining={isTraining} />;

      // ========== CPR ==========
      case STEPS.START_CPR:
        return (
          <StepCard phase="BLS — Circulation" phaseColor="text-danger" icon={HeartPulse} title="START CPR"
            subtitle="High-quality chest compressions NOW"
            instructions={['Rate: 100-120/min', 'Depth: 5-6 cm', 'Allow full chest recoil', 'Minimize interruptions', '30:2 ratio (until advanced airway)']}>
            <TrainingHint show={isTraining}><p>Push hard 5-6 cm, rate 100-120/min, full recoil, minimize interruptions (CCF ≥60%)</p></TrainingHint>
            <BigButton color="bg-danger" size="huge" onClick={() => { useTimerStore.getState().startCPR(); log('cpr', '🫀 CPR Started'); goStep(STEPS.ATTACH_MONITOR); }}>🫀 CPR STARTED</BigButton>
          </StepCard>
        );

      case STEPS.ATTACH_MONITOR:
        return (
          <StepCard phase="BLS — Defibrillation" phaseColor="text-danger" icon={Monitor} title="Attach Monitor / AED"
            subtitle="Apply pads while CPR continues"
            instructions={['Apply defibrillator pads (anterior-lateral)', 'DO NOT stop CPR to attach pads', 'Open airway: Head-tilt / Chin-lift']}>
            <BigButton color="bg-info" onClick={() => { log('other', '🖥️ Monitor attached'); goStep(STEPS.INITIAL_RHYTHM); }}>🖥️ Monitor Attached → Check Rhythm</BigButton>
          </StepCard>
        );

      case STEPS.INITIAL_RHYTHM:
        return <RhythmSelectStep title="Initial Rhythm" subtitle="What rhythm do you see on monitor?" phase="BLS — Defibrillation" isTraining={isTraining}
          onSelect={(rhythm) => {
            useCaseStore.getState().setRhythm(rhythm);
            log('rhythm', `Initial Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
            useCaseStore.getState().updatePatient('initialRhythm', rhythm.abbreviation);
            goStep(rhythm.shockable ? STEPS.SHOCK_DECISION : STEPS.CPR_CYCLE);
          }} />;

      // ========== PRIMARY SURVEY ==========
      case STEPS.SHOCK_DECISION:
        return <ShockStep onShocked={() => goStep(STEPS.CPR_CYCLE)} onSkip={() => goStep(STEPS.CPR_CYCLE)} isTraining={isTraining} />;

      case STEPS.CPR_CYCLE:
        return <CPRDashboard
          onCheckRhythm={() => goStep(STEPS.RHYTHM_CHECK)}
          onGiveDrug={() => goStep(STEPS.GIVE_DRUG)}
          onAirway={() => goStep(STEPS.AIRWAY_MANAGEMENT)}
          onROSC={() => handleEndCase('ROSC')}
          onSecondary={() => goStep(STEPS.SECONDARY_SURVEY)}
          onShock={() => setShowShockModal(true)}
          isTraining={isTraining} />;

      case STEPS.RHYTHM_CHECK:
        return <RhythmSelectStep title="⏱️ Rhythm Check" subtitle={`Cycle ${useTimerStore.getState().cycleNumber} complete — pause < 10 sec`}
          phase="Primary Survey" showROSC showTerminate isTraining={isTraining}
          onSelect={(rhythm) => {
            useCaseStore.getState().setRhythm(rhythm);
            log('rhythm', `Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
            if (rhythm.id === 'rosc') handleEndCase('ROSC');
            else goStep(rhythm.shockable ? STEPS.SHOCK_DECISION : STEPS.CPR_CYCLE);
          }}
          onROSC={() => handleEndCase('ROSC')}
          onTerminate={() => handleEndCase('terminated')} />;

      case STEPS.GIVE_DRUG:
        return <DrugStep onDone={() => goStep(STEPS.CPR_CYCLE)} isTraining={isTraining} />;

      case STEPS.AIRWAY_MANAGEMENT:
        return <AirwayPanel onClose={() => goStep(STEPS.CPR_CYCLE)} />;

      case STEPS.SECONDARY_SURVEY:
        return <ReversibleCausesPanel onClose={() => goStep(STEPS.CPR_CYCLE)}
          onOpenAirway={() => goStep(STEPS.AIRWAY_MANAGEMENT)}
          onOpenLabs={() => { setShowLabs(true); }}
        />;

      // ========== OUTCOMES ==========
      case STEPS.ROSC:
        return <PostROSCChecklist
          onDone={() => navigate('/history')}
          isTraining={isTraining}
          onBrady={() => goStep(STEPS.PULSE_BRADYCARDIA)}
          onTachy={() => goStep(STEPS.PULSE_TACHYCARDIA)}
          onMI={() => goStep(STEPS.PULSE_MI)}
          onArrest={() => goStep(STEPS.START_CPR)}
        />;

      case STEPS.TERMINATED:
        return <TerminatedStep onDone={() => navigate('/history')} isTraining={isTraining} />;

      default:
        return null;
    }
  };

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden relative ${isTraining ? 'bg-blue-50 ring-4 ring-blue-300/30 ring-inset' : 'bg-bg-primary'}`}>
      {/* Training mode banner */}
      {isTraining && !scenario && (
        <div className="bg-info text-white text-center text-[10px] font-bold py-1.5 tracking-wider shrink-0 z-50">TRAINING MODE</div>
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
      <div className="flex-1 flex items-start justify-center px-4 py-4 overflow-y-auto pb-20">
        <div className="w-full max-w-md">{renderStep()}</div>
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
          isArrest={['cpr_cycle', 'shock_decision', 'rhythm_check', 'give_drug', 'airway_mgmt', 'secondary_survey'].includes(step)}
          isPostROSC={step === 'rosc'}
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

// =============================================
// INLINE COMPONENTS (still used, kept minimal)
// =============================================

function RhythmSelectStep({ title, subtitle, phase, onSelect, showROSC, showTerminate, onROSC, onTerminate, isTraining }) {
  const arrestRhythms = getRhythmsByCategory('cardiac_arrest');
  return (
    <StepCard phase={phase} phaseColor="text-warning" icon={Activity} title={title} subtitle={subtitle}>
      <TrainingHint show={isTraining}>
        <p>Pause CPR ≤10 seconds. VF/pVT → Shock | PEA/Asystole → CPR + Epi</p>
      </TrainingHint>
      <div className="grid grid-cols-2 gap-3.5">
        {arrestRhythms.map(r => (
          <button key={r.id} onClick={() => onSelect(r)}
            className={`btn-action py-5 text-lg ${r.shockable ? 'btn-danger' : 'btn-warning'}`}>
            {r.abbreviation}
            <div className="text-[10px] font-bold mt-1 opacity-80">{r.shockable ? '⚡ Shockable' : '→ CPR continue'}</div>
          </button>
        ))}
      </div>
      {(showROSC || showTerminate) && (
        <div className="grid grid-cols-2 gap-3.5 mt-1">
          {showROSC && <button onClick={onROSC} className="btn-action py-4 text-sm bg-transparent border border-success/40 text-success font-bold">🟢 ROSC</button>}
          {showTerminate && <button onClick={onTerminate} className="btn-action btn-ghost py-4 text-sm text-text-muted">🔴 Terminate</button>}
        </div>
      )}
    </StepCard>
  );
}

function ShockStep({ onShocked, onSkip, isTraining }) {
  const { shockCount, currentRhythm, addShock, addEvent } = useCaseStore();
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const elapsed = useTimerStore(s => s.elapsed);
  const energy = currentRhythm?.energyBiphasic ? (shockCount === 0 ? currentRhythm.energyBiphasic.first : currentRhythm.energyBiphasic.subsequent) : 200;

  return (
    <StepCard phase="Primary Survey — Defibrillation" phaseColor="text-shock" icon={Zap} title="DEFIBRILLATION"
      subtitle={`${currentRhythm?.abbreviation} → Shock #${shockCount + 1}`}
      instructions={[`Energy: ${energy}J Biphasic`, 'Charge during CPR — minimize pause', 'Clear patient before shock', 'Resume CPR immediately after shock']}>
      <TrainingHint show={isTraining}><p>Charge during CPR → pause &lt;5s → Clear → Shock → Resume CPR immediately</p></TrainingHint>
      <BigButton color="bg-shock text-white animate-pulse" size="huge" onClick={() => {
        if (soundEnabled) playShockSound();
        addShock();
        addEvent({ elapsed, category: 'shock', type: `⚡ Shock #${shockCount + 1}`, details: { energy: `${energy}J` } });
        useTimerStore.getState().resetCycle();
        onShocked();
      }}>⚡ SHOCK DELIVERED</BigButton>
      <button onClick={onSkip} className="text-text-muted text-xs underline">Skip → Resume CPR</button>
    </StepCard>
  );
}

function DrugStep({ onDone, isTraining }) {
  const { addEvent, addDrugTimer, shockCount, currentRhythm, patient } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);
  const isShockable = currentRhythm?.shockable;
  const [showTech, setShowTech] = useState(null);
  const [drugWarning, setDrugWarning] = useState(null);

  const give = (name, id, hasTimer = false, sec = 180) => {
    // Check interactions + allergies
    const interactions = checkDrugInteraction(id, patient?.medications);
    const allergy = checkAllergy(id, patient?.allergies);
    if (allergy) { setDrugWarning(allergy); return; }
    if (interactions.length > 0 && interactions.some(i => i.severity === 'critical')) { setDrugWarning(interactions[0]); return; }

    addEvent({ elapsed, category: 'drug', type: `💉 ${name}`, details: { drugId: id } });
    if (hasTimer) addDrugTimer(id, name, sec);
    onDone();
  };

  const techniques = {
    epinephrine_arrest: 'Epi 1:1000 1ml + NSS 9ml = 1:10,000 → IV push fast → flush NSS 20ml → elevate arm',
    amiodarone_first: '300mg undiluted or +D5W 4ml → push 1-3min → flush NSS 20ml. ⚠️ Do NOT mix with NSS!',
    atropine: '1mg IV push fast (<1min) → flush 20ml. ⚠️ Slow push = paradoxical bradycardia!',
    sodium_bicarb: '1mEq/kg IV push slow. ⚠️ Flush before/after Ca (precipitates).',
    calcium_chloride: '10% 10-20ml IV push slow 2-5min + ECG monitoring. ⚠️ CI: Digoxin.',
    magnesium: 'Arrest: 2g push 1-2min. Stable: drip 5-20min.',
    naloxone: '0.4-2mg IV/IM/IN. Titrate to breathing.',
  };

  return (
    <StepCard phase="Primary Survey — Circulation" phaseColor="text-purple" icon={Syringe} title="Medication"
      subtitle={isShockable ? `Shockable · Shocks: ${shockCount}` : 'Non-shockable → Epi ASAP'}>
      <TrainingHint show={isTraining}>
        {isShockable ? <p>Shockable: Epi after 2nd shock → Amiodarone 300mg after 3rd shock</p> : <p>Non-shockable: Epi 1mg IV immediately → repeat q3-5 min</p>}
      </TrainingHint>
      {/* Drug interaction/allergy warning */}
      {drugWarning && (
        <div className="glass-card !p-3 border-2 border-danger/50 space-y-2 mb-2">
          <div className={`text-xs font-bold ${drugWarning.severity === 'critical' ? 'text-danger' : 'text-warning'}`}>
            ⚠️ {drugWarning.message}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDrugWarning(null)} className="btn-action btn-ghost py-2 text-xs">Cancel</button>
            <button onClick={() => { setDrugWarning(null); }} className="btn-action btn-danger py-2 text-xs">Override & Give</button>
          </div>
        </div>
      )}

      {showTech && (
        <div className="glass-card !p-3 text-left text-xs text-text-secondary mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-text-primary">Technique</span>
            <button onClick={() => setShowTech(null)} className="text-text-muted text-[10px]">✕</button>
          </div>
          <div>{techniques[showTech] || 'Standard IV push → flush 20ml'}</div>
        </div>
      )}
      <div className="space-y-2">
        <div className="relative">
          <button onClick={() => give('Epinephrine 1mg IV (1:10,000)', 'epinephrine_arrest', true, 180)}
            className="w-full btn-action btn-purple py-3.5 text-sm text-left px-4 pr-14">
            <div className="font-bold">💉 Epinephrine 1mg IV</div>
            <div className="text-[10px] font-normal opacity-80">1:10,000 → push fast → flush 20ml → q3-5 min</div>
          </button>
          <button onClick={() => setShowTech('epinephrine_arrest')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] underline opacity-60 text-white">how?</button>
        </div>
        {isShockable && (
          <div className="relative">
            <button onClick={() => give('Amiodarone 300mg IV', 'amiodarone_first')}
              className={`w-full btn-action py-3.5 text-sm text-left px-4 pr-14 ${shockCount >= 3 ? 'btn-info' : 'btn-ghost'}`}>
              <div className="font-bold">💊 Amiodarone 300mg {shockCount >= 3 && '← recommended'}</div>
              <div className="text-[10px] font-normal opacity-80">+D5W 4ml → push 1-3min → flush NSS 20ml</div>
            </button>
            <button onClick={() => setShowTech('amiodarone_first')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] underline opacity-60">how?</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Amio 150', id: 'amiodarone_second', detail: '150mg+D5W, push/2min' },
          { label: 'Atropine', id: 'atropine', detail: '1mg IV push fast' },
          { label: 'NaHCO₃', id: 'sodium_bicarb', detail: '1mEq/kg IV slow' },
          { label: 'Ca Gluc', id: 'calcium_chloride', detail: '10% 10-20ml slow' },
          { label: 'MgSO₄', id: 'magnesium', detail: '2g IV' },
          { label: 'Naloxone', id: 'naloxone', detail: '0.4-2mg IV' },
        ].map(d => (
          <div key={d.id} className="relative">
            <button className="btn-action btn-ghost py-2.5 text-[10px] w-full"
              onClick={() => give(`${d.label} (${d.detail})`, d.id)}>
              <div className="font-semibold">{d.label}</div>
              <div className="text-[8px] text-text-muted">{d.detail}</div>
            </button>
            <button onClick={() => setShowTech(d.id)}
              className="absolute top-0.5 right-1 text-[8px] text-info">?</button>
          </div>
        ))}
      </div>
      <button onClick={onDone} className="text-text-muted text-xs underline">← Back to CPR</button>
    </StepCard>
  );
}

function TerminatedStep({ onDone, isTraining }) {
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

function ShockModal({ onClose, isTraining }) {
  const { shockCount, currentRhythm, addShock, addEvent } = useCaseStore();
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const elapsed = useTimerStore(s => s.elapsed);
  const energy = currentRhythm?.energyBiphasic ? (shockCount === 0 ? currentRhythm.energyBiphasic.first : currentRhythm.energyBiphasic.subsequent) : 200;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary p-4 space-y-3"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary">⚡ Shock #{shockCount + 1}</span>
        <button onClick={onClose} className="text-text-muted text-sm font-bold">✕</button>
      </div>
      <div className="text-sm text-text-secondary">{currentRhythm?.abbreviation} → {energy}J Biphasic</div>
      {isTraining && <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">Charge during CPR → pause &lt;5s → Clear → Shock → Resume CPR</div>}
      <button onClick={() => {
        if (soundEnabled) playShockSound();
        addShock();
        addEvent({ elapsed, category: 'shock', type: `⚡ Shock #${shockCount + 1}`, details: { energy: `${energy}J` } });
        useTimerStore.getState().resetCycle();
        onClose();
      }} className="w-full btn-action btn-shock py-5 text-xl font-black animate-pulse">⚡ SHOCK {energy}J</button>
    </div>
  );
}

function VentGuard({ onClose, onNeedAirway }) {
  const events = useCaseStore(s => s.events);
  const hasAirway = events.some(e => e.category === 'airway' && (e.type?.includes('ETT') || e.type?.includes('SGA') || e.type?.includes('LMA')));

  if (!hasAirway) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="glass-card !p-4 m-6 text-center space-y-3" onClick={e => e.stopPropagation()}>
          <div className="text-3xl">🫁</div>
          <div className="text-sm font-bold text-text-primary">Place ETT/SGA first</div>
          <div className="text-xs text-text-muted">Ventilator settings require advanced airway</div>
          <button onClick={onNeedAirway} className="w-full btn-action btn-info py-3 text-sm font-bold">
            🫁 Open Airway Panel
          </button>
          <button onClick={onClose} className="text-text-muted text-xs underline">Cancel</button>
        </div>
      </div>
    );
  }

  return <VentilatorSettings onClose={onClose} />;
}

function TimerBar({ onToggleLog, showLog, isTraining, currentStep }) {
  const { elapsed, cycleElapsed, cycleNumber, cycleDuration, cprActive, isRunning } = useTimerStore();
  const { shockCount, events, drugTimers } = useCaseStore();
  const cycleRemaining = cycleDuration - cycleElapsed;
  const cycleProgress = (cycleElapsed / cycleDuration) * 100;

  // Only show CPR cycle info during cardiac arrest steps
  const cprSteps = ['start_cpr', 'attach_monitor', 'initial_rhythm', 'shock_decision', 'cpr_cycle', 'rhythm_check', 'give_drug', 'airway_mgmt', 'secondary_survey'];
  const showCPRCycle = cprSteps.includes(currentStep);

  // Show drug interval timers for Brady/Tachy
  const now = Date.now();
  const activeTimers = drugTimers.filter(t => t.isActive);

  return (
    <div className="timer-bar px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-mono font-black tabular-nums tracking-tight ${isRunning ? (isTraining ? 'text-info' : 'text-danger') : 'text-text-muted'}`}>
          {formatTimeLong(elapsed)}
        </div>

        {showCPRCycle ? (
          /* CPR mode — show cycle timer */
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-text-muted font-medium">Cycle {cycleNumber}</span>
              <span className={`badge ${cprActive ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                {cprActive ? <HeartPulse size={11} strokeWidth={2.4} /> : <Pause size={11} strokeWidth={2.4} />}
                {cprActive ? 'CPR' : 'PAUSE'} · {formatTime(cycleRemaining)}
              </span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${cycleProgress > 90 ? 'bg-danger animate-pulse' : cycleProgress > 75 ? 'bg-warning' : 'bg-info'}`}
                style={{ width: `${cycleProgress}%` }} />
            </div>
          </div>
        ) : (
          /* Non-CPR mode — show drug timers or just elapsed */
          <div className="flex-1 min-w-0">
            {activeTimers.length > 0 ? (
              activeTimers.slice(0, 2).map(t => {
                const rem = Math.max(0, Math.ceil((t.intervalSeconds * 1000 - (now - t.startedAt)) / 1000));
                const due = rem <= 0;
                return (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-medium truncate inline-flex items-center gap-1">
                      <Pill size={11} strokeWidth={2.2} /> {t.drugName}
                    </span>
                    <span className={`badge ${due ? 'bg-danger/15 text-danger animate-pulse' : 'bg-purple/15 text-purple'}`}>
                      {due ? <><AlertTriangle size={11} strokeWidth={2.4} /> DUE</> : formatTime(rem)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-text-muted">Recording...</div>
            )}
          </div>
        )}

        {showCPRCycle && (
          <span className="badge bg-shock/15 text-shock"><Zap size={11} strokeWidth={2.4} /> {shockCount}</span>
        )}
        <button onClick={onToggleLog} className={`badge transition-all ${showLog ? 'bg-info/20 text-info' : 'bg-bg-tertiary/50 text-text-muted'}`}>
          <FileText size={11} strokeWidth={2.2} /> {events.length}
        </button>
      </div>
    </div>
  );
}
