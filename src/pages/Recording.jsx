import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getRhythmsByCategory } from '../data/rhythms';
import { reversibleCauses } from '../data/hs-and-ts';
import { formatTimeLong, formatTime, formatElapsed } from '../utils/formatTime';
import { useTimerWorker } from '../hooks/useTimerWorker';
import { useMetronome } from '../hooks/useMetronome';
import { initAudio, playShockSound, playROSCSound, playDrugAlert } from '../utils/sound';
import { exportCasePDF } from '../utils/exportPDF';
import { calculateScore } from '../utils/scoring';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
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

// ==========================================
// ACLS Systematic Approach — Step by Step
// BLS: Scene Safety → Response → Pulse → CPR
// RRT/MET: Team Arrived → Pulse Check → Assess
// ==========================================

const STEPS = {
  // BLS SURVEY
  SCENE_SAFETY: 'scene_safety',
  CHECK_RESPONSE: 'check_response',
  CALL_FOR_HELP: 'call_for_help',
  CHECK_PULSE: 'check_pulse',
  // RRT/MET ENTRY
  RRT_ARRIVED: 'rrt_arrived',
  // → Patient has pulse → assess rate
  PULSE_PRESENT: 'pulse_present',
  PULSE_BRADYCARDIA: 'pulse_bradycardia',
  PULSE_TACHYCARDIA: 'pulse_tachycardia',
  PULSE_NORMAL: 'pulse_normal',
  PULSE_MI: 'pulse_mi',
  PULSE_STROKE: 'pulse_stroke',
  // → No pulse → CPR
  START_CPR: 'start_cpr',
  ATTACH_MONITOR: 'attach_monitor',
  INITIAL_RHYTHM: 'initial_rhythm',
  // PRIMARY SURVEY (ACLS)
  SHOCK_DECISION: 'shock_decision',
  CPR_CYCLE: 'cpr_cycle',
  RHYTHM_CHECK: 'rhythm_check',
  GIVE_DRUG: 'give_drug',
  AIRWAY_MANAGEMENT: 'airway_mgmt',
  // SECONDARY SURVEY
  SECONDARY_SURVEY: 'secondary_survey',
  // OUTCOMES
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
  const isTraining = mode === 'training';

  // Initialize Web Worker timer + audio + metronome
  useTimerWorker();
  useMetronome();
  useEffect(() => { initAudio(); }, []);

  // Set initial step based on start mode
  const [step, setStep] = useState(startMode === 'rrt' ? STEPS.RRT_ARRIVED : STEPS.SCENE_SAFETY);
  const [showLog, setShowLog] = useState(false);
  const [showPatient, setShowPatient] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showShockModal, setShowShockModal] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showAirway, setShowAirway] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [showHT, setShowHT] = useState(false);
  const [witnessed, setWitnessed] = useState(null);
  const [bystanderCPR, setBystanderCPR] = useState(null);

  useEffect(() => {
    if (!currentCase) navigate('/');
  }, [currentCase]);

  if (!currentCase) return null;

  const log = (category, type, details = {}) => {
    addEvent({ elapsed: useTimerStore.getState().elapsed, category, type, details });
  };

  const goStep = (nextStep) => setStep(nextStep);

  const handleEndCase = async (outcome) => {
    useTimerStore.getState().stopTimer();
    if (outcome === 'ROSC') playROSCSound();
    await endCase(outcome);
    setStep(outcome === 'ROSC' ? STEPS.ROSC : STEPS.TERMINATED);
  };

  // ===== Render current step =====
  const renderStep = () => {
    switch (step) {

      // ========== BLS SURVEY ==========

      case STEPS.SCENE_SAFETY:
        return (
          <StepCard
            phase="BLS Survey"
            phaseColor="text-info"
            icon="🛡️"
            title="Scene Safety"
            subtitle="Is the scene safe for you and the patient?"
            instructions={[
              'Check for hazards (electrical, chemical, traffic)',
              'Wear PPE (gloves, mask, eye protection)',
              'Ensure safe approach',
            ]}
          >
            <BigButton color="bg-success" onClick={() => {
              log('other', '✅ Scene Safe');
              goStep(STEPS.CHECK_RESPONSE);
            }}>
              ✅ Scene is SAFE
            </BigButton>
          </StepCard>
        );

      case STEPS.CHECK_RESPONSE:
        return (
          <StepCard
            phase="BLS Survey"
            phaseColor="text-info"
            icon="👋"
            title="Check Responsiveness"
            subtitle='Tap shoulders firmly, shout "Are you okay?"'
            instructions={[
              'Tap both shoulders',
              'Shout clearly: "Are you okay?"',
              'Look for response, movement, normal breathing',
              'Scan for breathing (5-10 seconds)',
            ]}
          >
            <div className="grid grid-cols-2 gap-4 w-full">
              <BigButton color="bg-danger" onClick={() => {
                log('other', '❌ Unresponsive');
                goStep(STEPS.CALL_FOR_HELP);
              }}>
                ❌ Unresponsive
              </BigButton>
              <BigButton color="bg-success" onClick={() => {
                log('other', '✅ Responsive');
                goStep(STEPS.PULSE_PRESENT);
              }}>
                ✅ Responsive
              </BigButton>
            </div>
          </StepCard>
        );

      case STEPS.CALL_FOR_HELP:
        return (
          <StepCard
            phase="BLS Survey"
            phaseColor="text-info"
            icon="📞"
            title="Activate Emergency Response"
            subtitle="Call for help & get AED/Defibrillator"
            instructions={[
              'Call code team / 1669 / hospital emergency',
              'Ask someone to bring AED/defibrillator',
              'Ask someone to bring crash cart',
            ]}
          >
            <div className="space-y-4 w-full">
              <div className="text-sm text-text-secondary text-center font-medium">Witnessed arrest?</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setWitnessed(true)}
                  className={`btn-action py-3.5 text-sm ${witnessed === true ? 'btn-info' : 'btn-ghost'}`}>
                  Yes — Witnessed
                </button>
                <button onClick={() => setWitnessed(false)}
                  className={`btn-action py-3.5 text-sm ${witnessed === false ? 'btn-info' : 'btn-ghost'}`}>
                  No — Unwitnessed
                </button>
              </div>
              <div className="text-sm text-text-secondary text-center font-medium">Bystander CPR?</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setBystanderCPR(true)}
                  className={`btn-action py-3.5 text-sm ${bystanderCPR === true ? 'btn-info' : 'btn-ghost'}`}>
                  Yes
                </button>
                <button onClick={() => setBystanderCPR(false)}
                  className={`btn-action py-3.5 text-sm ${bystanderCPR === false ? 'btn-info' : 'btn-ghost'}`}>
                  No
                </button>
              </div>

              <BigButton color="bg-warning text-black" onClick={() => {
                log('other', '📞 Help activated', { witnessed, bystanderCPR });
                useCaseStore.getState().updatePatient('witnessed', witnessed);
                useCaseStore.getState().updatePatient('bystanderCPR', bystanderCPR);
                goStep(STEPS.CHECK_PULSE);
              }}>
                📞 Help Activated → Check Pulse
              </BigButton>
            </div>
          </StepCard>
        );

      // ========== RRT/MET TEAM ENTRY ==========

      case STEPS.RRT_ARRIVED:
        return (
          <StepCard
            phase="RRT / MET Team"
            phaseColor="text-info"
            icon="🏥"
            title="Team Arrived"
            subtitle="Rapid Response / Medical Emergency Team on scene"
            instructions={[
              'Get brief handover from caller',
              'What happened? When? Any interventions?',
              'Attach monitor if not done',
              'Assess patient now',
            ]}
          >
            <BigButton color="bg-info" onClick={() => {
              startTimer();
              log('other', '🏥 RRT/MET Team arrived');
              goStep(STEPS.CHECK_PULSE);
            }}>
              🏥 Team Ready → Assess Patient
            </BigButton>
          </StepCard>
        );

      case STEPS.CHECK_PULSE:
        return (
          <StepCard
            phase={startMode === 'rrt' ? 'RRT Assessment' : 'BLS Survey'}
            phaseColor="text-info"
            icon="🫀"
            title="Check Pulse & Breathing"
            subtitle="Carotid pulse check — MAX 10 seconds"
            instructions={[
              'Feel carotid pulse (one side)',
              'Simultaneously look for breathing',
              'Gasping = NOT normal breathing',
              'If unsure → assume NO pulse',
            ]}
          >
            <CountdownHint seconds={10} />
            <TrainingHint show={isTraining}>
              <p>คลำ carotid pulse ไม่เกิน 10 วินาที — ถ้าไม่แน่ใจ ให้ถือว่าไม่มีชีพจร</p>
              <p>ดู breathing พร้อมกัน — gasping ≠ normal breathing</p>
            </TrainingHint>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <BigButton color="bg-danger" onClick={() => {
                log('other', '❌ No Pulse — Cardiac Arrest');
                if (!isRunning) startTimer();
                goStep(STEPS.START_CPR);
              }}>
                ❌ No Pulse
              </BigButton>
              <BigButton color="bg-success" onClick={() => {
                log('other', '✅ Pulse Present');
                goStep(STEPS.PULSE_PRESENT);
              }}>
                ✅ Pulse Present
              </BigButton>
            </div>
          </StepCard>
        );

      case STEPS.PULSE_PRESENT:
        return (
          <StepCard
            phase="Assessment"
            phaseColor="text-success"
            icon="💚"
            title="Pulse Present"
            subtitle="Assess heart rate — What is the rate?"
            instructions={[
              'Check monitor or count pulse for 6 sec × 10',
              'If not breathing adequately → Rescue breathing (1 breath q6s)',
              'Attach monitor if not done',
            ]}
          >
            <div className="grid grid-cols-1 gap-3 w-full">
              <BigButton color="bg-info" onClick={() => {
                if (!isRunning) startTimer();
                log('other', '🐢 Pulse present — Bradycardia');
                goStep(STEPS.PULSE_BRADYCARDIA);
              }}>
                🐢 Bradycardia (HR &lt; 50)
              </BigButton>
              <BigButton color="bg-success" onClick={() => {
                if (!isRunning) startTimer();
                log('other', '✅ Pulse present — Normal rate');
                goStep(STEPS.PULSE_NORMAL);
              }}>
                ✅ Normal (HR 50-150)
              </BigButton>
              <BigButton color="bg-danger" onClick={() => {
                if (!isRunning) startTimer();
                log('other', '⚡ Pulse present — Tachycardia');
                goStep(STEPS.PULSE_TACHYCARDIA);
              }}>
                🐇 Tachycardia (HR &gt; 150)
              </BigButton>
              <div className="grid grid-cols-2 gap-3">
                <BigButton color="bg-danger" onClick={() => {
                  if (!isRunning) startTimer();
                  log('other', '🫀 Suspected ACS/MI');
                  goStep(STEPS.PULSE_MI);
                }}>
                  🫀 ACS / MI
                </BigButton>
                <BigButton color="bg-purple text-white" onClick={() => {
                  if (!isRunning) startTimer();
                  log('other', '🧠 Suspected Stroke');
                  goStep(STEPS.PULSE_STROKE);
                }}>
                  🧠 Stroke
                </BigButton>
              </div>
            </div>
          </StepCard>
        );

      case STEPS.PULSE_BRADYCARDIA:
        return <BradycardiaPathway
          onLog={log}
          onMonitor={() => goStep(STEPS.PULSE_NORMAL)}
          onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)}
          onArrest={() => { goStep(STEPS.START_CPR); }}
          isTraining={isTraining}
        />;

      case STEPS.PULSE_TACHYCARDIA:
        return <TachycardiaPathway
          onLog={log}
          onMonitor={() => goStep(STEPS.PULSE_NORMAL)}
          onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)}
          onArrest={() => { goStep(STEPS.START_CPR); }}
          isTraining={isTraining}
        />;

      case STEPS.PULSE_MI:
        return <MIACSPathway
          onLog={log}
          onMonitor={() => goStep(STEPS.PULSE_NORMAL)}
          onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)}
          onArrest={() => { goStep(STEPS.START_CPR); }}
          isTraining={isTraining}
        />;

      case STEPS.PULSE_STROKE:
        return <StrokePathway
          onLog={log}
          onMonitor={() => goStep(STEPS.PULSE_NORMAL)}
          onRecheckPulse={() => goStep(STEPS.CHECK_PULSE)}
          onArrest={() => { goStep(STEPS.START_CPR); }}
          isTraining={isTraining}
        />;

      case STEPS.PULSE_NORMAL:
        return (
          <StepCard
            phase="Assessment"
            phaseColor="text-success"
            icon="✅"
            title="Stable — Monitor"
            subtitle="Pulse present, normal rate"
            instructions={[
              'Continue monitoring vital signs',
              'Primary Assessment: ABCDE',
              'Supplemental O₂ if SpO₂ < 94%',
              'IV access + Labs',
              '12-Lead ECG',
              'Treat underlying cause',
            ]}
          >
            <BigButton color="bg-info" onClick={() => {
              log('other', '📋 Proceed to primary assessment (ABCDE)');
            }}>
              📋 Continue Assessment (ABCDE)
            </BigButton>
            <button onClick={() => goStep(STEPS.CHECK_PULSE)}
              className="text-text-muted text-xs underline mt-2">
              ← Re-check pulse (deteriorating?)
            </button>
          </StepCard>
        );

      // ========== START CPR ==========

      case STEPS.START_CPR:
        return (
          <StepCard
            phase="BLS — Circulation"
            phaseColor="text-danger"
            icon="🫀"
            title="START CPR"
            subtitle="High-quality chest compressions NOW"
            instructions={[
              'Rate: 100-120/min',
              'Depth: 5-6 cm (2-2.4 inches)',
              'Allow full chest recoil — don\'t lean',
              'Minimize interruptions',
              '30:2 ratio (until advanced airway)',
            ]}
          >
            <TrainingHint show={isTraining}>
              <p>กดลึก 5-6 cm, อัตรา 100-120/min</p>
              <p>ปล่อยอกคืนเต็มที่ — อย่าเอนน้ำหนักทับ</p>
              <p>ลดการหยุดกดให้น้อยที่สุด (CCF ≥60%)</p>
            </TrainingHint>
            <BigButton color="bg-danger" size="huge" onClick={() => {
              useTimerStore.getState().startCPR();
              log('cpr', '🫀 CPR Started');
              goStep(STEPS.ATTACH_MONITOR);
            }}>
              🫀 CPR STARTED
            </BigButton>
          </StepCard>
        );

      case STEPS.ATTACH_MONITOR:
        return (
          <StepCard
            phase="BLS — Defibrillation"
            phaseColor="text-danger"
            icon="🖥️"
            title="Attach Monitor / AED"
            subtitle="Apply pads while CPR continues"
            instructions={[
              'Apply defibrillator pads (anterior-lateral)',
              'DO NOT stop CPR to attach pads',
              'Open airway: Head-tilt / Chin-lift',
              'Give 2 rescue breaths (if trained)',
            ]}
          >
            <BigButton color="bg-info" onClick={() => {
              log('other', '🖥️ Monitor attached');
              goStep(STEPS.INITIAL_RHYTHM);
            }}>
              🖥️ Monitor Attached → Check Rhythm
            </BigButton>
          </StepCard>
        );

      case STEPS.INITIAL_RHYTHM:
        return <RhythmSelectStep
          title="Initial Rhythm"
          subtitle="What rhythm do you see on monitor?"
          phase="BLS — Defibrillation"
          onSelect={(rhythm) => {
            useCaseStore.getState().setRhythm(rhythm);
            log('rhythm', `Initial Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
            useCaseStore.getState().updatePatient('initialRhythm', rhythm.abbreviation);
            if (rhythm.shockable) {
              goStep(STEPS.SHOCK_DECISION);
            } else {
              goStep(STEPS.CPR_CYCLE);
            }
          }}
        />;

      // ========== PRIMARY SURVEY (ACLS) ==========

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
          isTraining={isTraining}
        />;

      case STEPS.RHYTHM_CHECK:
        return <RhythmSelectStep
          title="⏱️ Rhythm Check"
          subtitle={`Cycle ${useTimerStore.getState().cycleNumber} complete — pause < 10 sec`}
          phase="Primary Survey"
          showROSC
          showTerminate
          isTraining={isTraining}
          onSelect={(rhythm) => {
            useCaseStore.getState().setRhythm(rhythm);
            log('rhythm', `Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
            if (rhythm.id === 'rosc') {
              handleEndCase('ROSC');
            } else if (rhythm.shockable) {
              goStep(STEPS.SHOCK_DECISION);
            } else {
              goStep(STEPS.CPR_CYCLE);
            }
          }}
          onROSC={() => handleEndCase('ROSC')}
          onTerminate={() => handleEndCase('terminated')}
        />;

      case STEPS.GIVE_DRUG:
        return <DrugStep onDone={() => goStep(STEPS.CPR_CYCLE)} isTraining={isTraining} />;

      case STEPS.AIRWAY_MANAGEMENT:
        return <AirwayPanel onClose={() => goStep(STEPS.CPR_CYCLE)} />;

      case STEPS.SECONDARY_SURVEY:
        return <ReversibleCausesPanel onClose={() => goStep(STEPS.CPR_CYCLE)} />;

      // ========== OUTCOMES ==========

      case STEPS.ROSC:
        return <PostROSCChecklist onDone={() => navigate('/history')} isTraining={isTraining} />;

      case STEPS.TERMINATED:
        return <TerminatedStep onDone={() => navigate('/history')} isTraining={isTraining} />;

      default:
        return null;
    }
  };

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden relative ${isTraining ? 'bg-blue-50 ring-4 ring-blue-300/30 ring-inset' : 'bg-bg-primary'}`}>
      {/* Training mode banner */}
      {isTraining && (
        <div className="bg-info text-white text-center text-[10px] font-bold py-1.5 tracking-wider shrink-0 z-50">
          TRAINING MODE — ข้อมูลนี้ไม่ใช่ข้อมูลผู้ป่วยจริง
        </div>
      )}
      {/* Timer Bar — always visible after CPR starts */}
      {(isRunning || elapsed > 0) && (
        <TimerBar onToggleLog={() => setShowLog(!showLog)} showLog={showLog} isTraining={isTraining} />
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-5 py-6 overflow-y-auto">
        <div className="w-full max-w-lg">
          {renderStep()}
        </div>
      </div>

      {/* Quick access bar — visible during recording */}
      {(isRunning || elapsed > 0) && (
        <div className="flex gap-1.5 px-3 py-1.5 bg-bg-secondary/80 border-t border-bg-tertiary/50 shrink-0">
          <button onClick={() => setShowPatient(true)}
            className="flex-1 text-[10px] py-1.5 rounded-lg bg-bg-primary text-text-secondary font-medium">
            👤 Patient
          </button>
          <button onClick={() => setShowTeam(true)}
            className="flex-1 text-[10px] py-1.5 rounded-lg bg-bg-primary text-text-secondary font-medium">
            👥 Team
          </button>
          <button onClick={() => setShowVitals(true)}
            className="flex-1 text-[10px] py-1.5 rounded-lg bg-bg-primary text-text-secondary font-medium">
            📊 Vitals
          </button>
          <button onClick={() => setShowLabs(true)}
            className="flex-1 text-[10px] py-1.5 rounded-lg bg-bg-primary text-text-secondary font-medium">
            🔬 Labs
          </button>
        </div>
      )}

      {/* Floating status buttons */}
      {(isRunning || elapsed > 0) && (
        <FloatingStatus
          currentStep={step}
          onNoPulse={() => { useTimerStore.getState().startCPR(); goStep(STEPS.START_CPR); }}
          onUnresponsive={() => goStep(STEPS.CHECK_PULSE)}
          onEKGChanged={() => goStep(STEPS.RHYTHM_CHECK)}
          onROSC={() => handleEndCase('ROSC')}
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
      {showHT && <ReversibleCausesPanel onClose={() => setShowHT(false)} />}
    </div>
  );
}


// =============================================
// REUSABLE COMPONENTS
// =============================================

function StepCard({ phase, phaseColor, icon, title, subtitle, instructions, children }) {
  return (
    <div className="text-center space-y-4 animate-slide-up px-2">
      <div className={`text-[11px] font-extrabold uppercase tracking-[0.2em] ${phaseColor}`}>{phase}</div>
      <div className="text-5xl">{icon}</div>
      <div>
        <h1 className="text-[1.65rem] font-black text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary text-[0.85rem] mt-1.5">{subtitle}</p>}
      </div>
      {instructions && (
        <div className="instruction-list text-left">
          {instructions.map((inst, i) => (
            <div key={i} className="instruction-item">{inst}</div>
          ))}
        </div>
      )}
      <div className="space-y-4 pt-2">{children}</div>
    </div>
  );
}

function BigButton({ color, onClick, children, size = 'normal', disabled = false }) {
  const pad = size === 'huge' ? 'py-7 text-xl' : 'py-4 text-[1.05rem]';
  // Map old color classes to new btn- classes
  const btnClass = color.includes('bg-danger') ? 'btn-danger'
    : color.includes('bg-info') ? 'btn-info'
    : color.includes('bg-success') ? 'btn-success'
    : color.includes('bg-warning') ? 'btn-warning'
    : color.includes('bg-purple') ? 'btn-purple'
    : color.includes('bg-shock') ? 'btn-shock'
    : color.includes('bg-cyan') ? 'btn-info'
    : 'btn-ghost';
  const extra = color.includes('animate-pulse') ? 'animate-pulse' : '';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full ${pad} btn-action ${btnClass} ${extra} disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}

function TrainingHint({ show, children }) {
  if (!show) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left text-xs text-blue-700 space-y-1 w-full">
      <div className="font-bold text-[10px] uppercase tracking-wider text-blue-500">Training Tip</div>
      {children}
    </div>
  );
}

function CountdownHint({ seconds }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className={`text-center ${count <= 3 ? 'text-danger' : 'text-warning'}`}>
      <div className="text-5xl font-mono font-black">{count}s</div>
      <div className="text-xs">Max pulse check time</div>
    </div>
  );
}

// ===== RHYTHM SELECT =====
function RhythmSelectStep({ title, subtitle, phase, onSelect, showROSC, showTerminate, onROSC, onTerminate, isTraining }) {
  const arrestRhythms = getRhythmsByCategory('cardiac_arrest');
  return (
    <StepCard phase={phase} phaseColor="text-warning" icon="📈" title={title} subtitle={subtitle}>
      <TrainingHint show={isTraining}>
        <p>หยุด CPR ไม่เกิน 10 วินาที เพื่อ check rhythm</p>
        <p>VF/pVT → Shock | PEA/Asystole → CPR + Epi</p>
      </TrainingHint>
      <div className="grid grid-cols-2 gap-3.5">
        {arrestRhythms.map(r => (
          <button key={r.id} onClick={() => onSelect(r)}
            className={`btn-action py-5 text-lg ${
              r.shockable ? 'btn-danger' : 'btn-warning'
            }`}>
            {r.abbreviation}
            <div className="text-[10px] font-bold mt-1 opacity-80">
              {r.shockable ? '⚡ Shockable' : '→ CPR continue'}
            </div>
          </button>
        ))}
      </div>
      {(showROSC || showTerminate) && (
        <div className="grid grid-cols-2 gap-3.5 mt-1">
          {showROSC && (
            <button onClick={onROSC}
              className="btn-action py-4 text-sm bg-transparent border border-success/40 text-success font-bold">
              🟢 ROSC
            </button>
          )}
          {showTerminate && (
            <button onClick={onTerminate}
              className="btn-action btn-ghost py-4 text-sm text-text-muted">
              🔴 Terminate
            </button>
          )}
        </div>
      )}
    </StepCard>
  );
}

// ===== SHOCK STEP =====
function ShockStep({ onShocked, onSkip, isTraining }) {
  const { shockCount, currentRhythm, addShock, addEvent } = useCaseStore();
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const elapsed = useTimerStore(s => s.elapsed);
  const energy = currentRhythm?.energyBiphasic
    ? (shockCount === 0 ? currentRhythm.energyBiphasic.first : currentRhythm.energyBiphasic.subsequent)
    : 200;

  return (
    <StepCard
      phase="Primary Survey — Defibrillation"
      phaseColor="text-shock"
      icon="⚡"
      title="DEFIBRILLATION"
      subtitle={`${currentRhythm?.abbreviation} → Shock #${shockCount + 1}`}
      instructions={[
        `Energy: ${energy}J Biphasic (360J Monophasic)`,
        'Charge during CPR — minimize pause',
        'Clear patient before shock',
        'Resume CPR immediately after shock',
      ]}
    >
      <TrainingHint show={isTraining}>
        <p>Charge ระหว่าง CPR — หยุดกดให้สั้นที่สุด (&lt;5 วินาที)</p>
        <p>"Clear!" → ดูว่าไม่มีใครสัมผัสผู้ป่วย → Shock → กด CPR ทันที</p>
      </TrainingHint>
      <BigButton color="bg-shock text-white animate-pulse" size="huge" onClick={() => {
        if (soundEnabled) playShockSound();
        addShock();
        addEvent({ elapsed, category: 'shock', type: `⚡ Shock #${shockCount + 1}`, details: { energy: `${energy}J` } });
        onShocked();
      }}>
        ⚡ SHOCK DELIVERED
      </BigButton>
      <button onClick={onSkip} className="text-text-muted text-xs underline">
        Skip → Resume CPR
      </button>
    </StepCard>
  );
}

// ===== CPR CYCLE (2 min) =====
function CPRCycleStep({ onCheckRhythm, onGiveDrug, onAirway, onROSC, onSecondary, isTraining }) {
  const { cycleElapsed, cycleDuration, cycleNumber, cprActive, startCPR, stopCPR, elapsed, compressorRotateDue, dismissCompressorRotate } = useTimerStore();
  const { shockCount, currentRhythm, drugTimers, addEvent } = useCaseStore();
  const remaining = cycleDuration - cycleElapsed;
  const progress = (cycleElapsed / cycleDuration) * 100;
  const almostDone = remaining <= 15;

  // Drug timer alerts
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { if (!cprActive) startCPR(); }, []);

  const activeDrugTimers = drugTimers.filter(t => t.isActive);
  const epiDue = activeDrugTimers.some(t => t.drugId === 'epinephrine_arrest' && (now - t.startedAt) >= t.intervalSeconds * 1000);

  // Play drug alert sound when any timer becomes due
  const [alertedDrugs, setAlertedDrugs] = useState(new Set());
  const settings = useSettingsStore();
  useEffect(() => {
    activeDrugTimers.forEach(t => {
      const isDue = (now - t.startedAt) >= t.intervalSeconds * 1000;
      if (isDue && !alertedDrugs.has(t.id) && settings.soundEnabled && settings.drugReminderEnabled) {
        playDrugAlert();
        setAlertedDrugs(prev => new Set(prev).add(t.id));
      }
    });
  }, [now]);

  return (
    <div className="text-center space-y-4 animate-slide-up">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">Primary Survey — CPR</div>

      {/* Big countdown + CCF */}
      <div className="flex items-center justify-center gap-4">
        <div>
          <div className={`text-6xl font-mono font-black tabular-nums tracking-tight ${
            almostDone ? 'text-danger animate-pulse' : 'text-success'
          }`}>
            {formatTime(remaining)}
          </div>
          <h1 className="text-base font-bold text-text-primary mt-1">
            Cycle {cycleNumber} — Compressing
          </h1>
        </div>
        <CCFBadge />
      </div>

      {/* Progress bar */}
      <div className="progress-track !h-2.5">
        <div className={`progress-fill ${
          almostDone ? 'bg-danger' : 'bg-success'
        }`} style={{ width: `${progress}%` }} />
      </div>

      {/* Compressor rotation alert */}
      {compressorRotateDue && (
        <button onClick={dismissCompressorRotate}
          className="w-full bg-warning/15 border border-warning/30 rounded-xl px-4 py-3 text-sm font-bold text-warning animate-pulse text-center">
          🔄 สลับคนกด CPR! (ครบ 2 นาทีแล้ว) — Tap to dismiss
        </button>
      )}

      {/* EtCO₂ quick input */}
      <EtCO2Input />

      {/* Training hint */}
      <TrainingHint show={isTraining}>
        <p>Non-shockable rhythm → ให้ Epi ทันที | Shockable → Epi หลัง shock ครั้งที่ 2</p>
        <p>Epi ทุก 3-5 นาที | Amiodarone หลัง shock ครั้งที่ 3 (300mg แล้วตาม 150mg)</p>
      </TrainingHint>

      {/* Drug timer alerts */}
      {activeDrugTimers.length > 0 && (
        <div className="space-y-1.5">
          {activeDrugTimers.map(t => {
            const rem = Math.max(0, Math.ceil((t.intervalSeconds * 1000 - (now - t.startedAt)) / 1000));
            const due = rem <= 0;
            const m = Math.floor(rem / 60);
            const s = rem % 60;
            return (
              <div key={t.id} className={`glass-card flex items-center justify-between px-4 py-2.5 text-sm ${
                due ? '!border-danger/40 animate-pulse' : ''
              }`}>
                <span className="font-semibold">💊 {t.drugName}</span>
                <span className={`font-mono font-bold ${due ? 'text-danger' : 'text-text-primary'}`}>
                  {due ? '⚠️ DUE NOW' : `${m}:${String(s).padStart(2, '0')}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons during CPR */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={onGiveDrug}
          className={`btn-action py-3.5 text-sm ${
            epiDue ? 'btn-purple animate-pulse' : 'btn-ghost'
          }`}>
          💉 Drug
        </button>
        <button onClick={onAirway}
          className="btn-action btn-ghost py-3.5 text-sm">
          🫁 Airway
        </button>
        <button onClick={onSecondary}
          className="btn-action btn-ghost py-3.5 text-sm">
          📋 H's & T's
        </button>
      </div>

      {/* Check Rhythm */}
      <BigButton
        color={almostDone ? 'bg-info text-white' : 'bg-bg-secondary text-text-muted'}
        onClick={() => {
          stopCPR('rhythm_check');
          addEvent({ elapsed, category: 'cpr', type: `Rhythm Check (Cycle ${cycleNumber})`, details: {} });
          onCheckRhythm();
        }}
      >
        🔍 Check Rhythm (Pause CPR)
      </BigButton>

      {/* ROSC */}
      <button onClick={onROSC}
        className="w-full btn-action py-3.5 text-sm bg-transparent border border-success/40 text-success font-bold">
        🟢 ROSC — Pulse detected
      </button>
    </div>
  );
}

// ===== DRUG STEP =====
function DrugStep({ onDone, isTraining }) {
  const { addEvent, addDrugTimer, shockCount, currentRhythm } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);
  const isShockable = currentRhythm?.shockable;
  const [showTech, setShowTech] = useState(null); // which drug's technique to show

  const give = (name, id, hasTimer = false, sec = 180) => {
    addEvent({ elapsed, category: 'drug', type: `💉 ${name}`, details: { drugId: id } });
    if (hasTimer) addDrugTimer(id, name, sec);
    onDone();
  };

  // Drug techniques — short, actionable
  const techniques = {
    epinephrine_arrest: 'Epi 1:1000 1ml + NSS 9ml = 1:10,000 → IV push fast → flush NSS 20ml → elevate arm',
    amiodarone_first: '300mg undiluted or +D5W 4ml → push 1-3min → flush NSS 20ml. ⚠️ Do NOT mix with NSS!',
    amiodarone_second: '150mg same technique. For maintenance: 150mg + D5W 100ml drip 10min.',
    atropine: '1mg IV push fast (<1min) → flush 20ml. ⚠️ Slow push = paradoxical bradycardia!',
    sodium_bicarb: '1mEq/kg IV push slow. ⚠️ Flush before/after Ca (precipitates).',
    calcium_chloride: '10% 10-20ml IV push slow 2-5min + ECG monitoring. ⚠️ CI: Digoxin. Flush before/after NaHCO₃.',
    magnesium: 'Arrest: 2g push 1-2min. Stable: drip 5-20min.',
    naloxone: '0.4-2mg IV/IM/IN. Titrate to breathing. May need repeat.',
  };

  return (
    <StepCard phase="Primary Survey — Circulation" phaseColor="text-purple"
      icon="💉" title="Medication"
      subtitle={isShockable ? `Shockable rhythm · Shocks: ${shockCount}` : 'Non-shockable → Epi ASAP'}>

      <TrainingHint show={isTraining}>
        {isShockable
          ? <p>Shockable: Epi after 2nd shock → Amiodarone 300mg after 3rd shock</p>
          : <p>Non-shockable: Epi 1mg IV immediately → repeat q3-5 min</p>
        }
      </TrainingHint>

      {/* Technique popup */}
      {showTech && (
        <div className="glass-card !p-3 text-left text-xs text-text-secondary mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-text-primary text-xs">Technique</span>
            <button onClick={() => setShowTech(null)} className="text-text-muted text-[10px]">✕</button>
          </div>
          <div>{techniques[showTech] || 'Standard IV push → flush 20ml'}</div>
        </div>
      )}

      <div className="space-y-2">
        <button onClick={() => give('Epinephrine 1mg IV (1:10,000)', 'epinephrine_arrest', true, 180)}
          className="w-full btn-action btn-purple py-3.5 text-sm text-left px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">💉 Epinephrine 1mg IV</div>
              <div className="text-[10px] font-normal opacity-80">1:10,000 → IV push fast → flush 20ml → q3-5 min</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowTech('epinephrine_arrest'); }}
              className="text-[9px] underline opacity-60 shrink-0 ml-2">how?</button>
          </div>
        </button>

        {isShockable && (
          <button onClick={() => give('Amiodarone 300mg IV', 'amiodarone_first')}
            className={`w-full btn-action py-3.5 text-sm text-left px-4 ${shockCount >= 3 ? 'btn-info' : 'btn-ghost'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">💊 Amiodarone 300mg {shockCount >= 3 && '← recommended'}</div>
                <div className="text-[10px] font-normal opacity-80">300mg (+D5W 4ml) → push 1-3min → flush NSS 20ml</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowTech('amiodarone_first'); }}
                className="text-[9px] underline opacity-60 shrink-0 ml-2">how?</button>
            </div>
          </button>
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
          <button key={d.id} className="btn-action btn-ghost py-2.5 text-[10px] relative"
            onClick={() => give(`${d.label} (${d.detail})`, d.id)}>
            <div className="font-semibold">{d.label}</div>
            <div className="text-[8px] text-text-muted">{d.detail}</div>
            <button onClick={(e) => { e.stopPropagation(); setShowTech(d.id); }}
              className="absolute top-0.5 right-1 text-[8px] text-info">?</button>
          </button>
        ))}
      </div>

      <button onClick={onDone} className="text-text-muted text-xs underline">← Back to CPR</button>
    </StepCard>
  );
}

// ===== AIRWAY STEP =====
function AirwayStep({ onDone }) {
  const { addEvent } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);

  const logAirway = (type) => {
    addEvent({ elapsed, category: 'airway', type, details: {} });
    onDone();
  };

  return (
    <StepCard phase="Primary Survey — Airway" phaseColor="text-cyan-400"
      icon="🫁" title="Airway Management"
      instructions={[
        'BVM with O₂ → easiest first',
        'Advanced airway: SGA or ETT',
        'Confirm with waveform capnography (EtCO₂)',
        'After advanced airway: 1 breath q6s, continuous CPR',
      ]}>
      <div className="grid grid-cols-1 gap-3">
        <BigButton color="bg-cyan-600 text-white" onClick={() => logAirway('🫁 BVM + O₂')}>
          🫁 BVM + O₂
        </BigButton>
        <div className="grid grid-cols-2 gap-3">
          <BigButton color="bg-bg-secondary text-text-primary" onClick={() => logAirway('🫁 SGA (LMA/i-gel)')}>
            SGA (LMA)
          </BigButton>
          <BigButton color="bg-bg-secondary text-text-primary" onClick={() => logAirway('🫁 ETT Intubation')}>
            ETT
          </BigButton>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BigButton color="bg-bg-tertiary text-text-secondary" onClick={() => {
            addEvent({ elapsed, category: 'access', type: '💉 IV Access', details: {} });
            onDone();
          }}>
            💉 IV Access
          </BigButton>
          <BigButton color="bg-bg-tertiary text-text-secondary" onClick={() => {
            addEvent({ elapsed, category: 'access', type: '🦴 IO Access', details: {} });
            onDone();
          }}>
            🦴 IO Access
          </BigButton>
        </div>
      </div>
      <button onClick={onDone} className="text-text-muted text-xs underline">← Back to CPR</button>
    </StepCard>
  );
}

// ===== SECONDARY SURVEY (H's & T's + SAMPLE) =====
function SecondarySurveyStep({ onDone }) {
  const [tab, setTab] = useState('ht');

  return (
    <div className="text-center space-y-3">
      <div className="text-xs font-bold uppercase tracking-widest text-warning">Secondary Survey</div>
      <h1 className="text-xl font-black text-text-primary">🔍 Identify Reversible Causes</h1>

      <div className="tab-group">
        <button onClick={() => setTab('ht')}
          className={`tab-item ${tab === 'ht' ? 'active' : ''}`}>
          H's & T's
        </button>
        <button onClick={() => setTab('sample')}
          className={`tab-item ${tab === 'sample' ? 'active' : ''}`}>
          SAMPLE
        </button>
      </div>

      {tab === 'ht' && (
        <div className="grid grid-cols-2 gap-3 text-left max-h-[45vh] overflow-y-auto">
          <div>
            <div className="text-[10px] font-bold text-info mb-1.5">H's</div>
            {reversibleCauses.hs.map((c, i) => (
              <div key={i} className="glass-card p-2.5 mb-2">
                <div className="text-xs font-bold text-text-primary">{c.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{c.signs}</div>
                <div className="text-[10px] text-info mt-0.5">→ {c.treatment}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-bold text-danger mb-1.5">T's</div>
            {reversibleCauses.ts.map((c, i) => (
              <div key={i} className="glass-card p-2.5 mb-2">
                <div className="text-xs font-bold text-text-primary">{c.name}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{c.signs}</div>
                <div className="text-[10px] text-danger mt-0.5">→ {c.treatment}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'sample' && (
        <div className="glass-card p-4 text-left space-y-3">
          {[
            { letter: 'S', label: 'Signs & Symptoms', hint: 'อาการก่อนเกิดเหตุ? เจ็บหน้าอก, หอบเหนื่อย, ใจสั่น?' },
            { letter: 'A', label: 'Allergies', hint: 'แพ้ยาอะไรบ้าง?' },
            { letter: 'M', label: 'Medications', hint: 'ยาที่ใช้ประจำ? Anticoagulant, Beta-blocker, Insulin?' },
            { letter: 'P', label: 'Past Medical History', hint: 'โรคประจำตัว? โรคหัวใจ, เบาหวาน, ไต?' },
            { letter: 'L', label: 'Last Oral Intake', hint: 'กินอาหาร/ดื่มน้ำครั้งล่าสุดเมื่อไหร่?' },
            { letter: 'E', label: 'Events Leading', hint: 'ก่อนเกิดเหตุทำอะไรอยู่? เกิดขึ้นยังไง?' },
          ].map(item => (
            <div key={item.letter} className="flex items-start gap-2">
              <span className="w-6 h-6 bg-info text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">
                {item.letter}
              </span>
              <div>
                <div className="text-xs font-bold text-text-primary">{item.label}</div>
                <div className="text-[10px] text-text-muted">{item.hint}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BigButton color="bg-bg-secondary text-text-primary" onClick={onDone}>
        ← Back to CPR
      </BigButton>
    </div>
  );
}

// ===== SCORECARD (Training Only) =====
function Scorecard({ events }) {
  const timerData = {
    ccf: useTimerStore.getState().getCCF(),
    totalPauseTime: useTimerStore.getState().totalPauseTime,
    elapsed: useTimerStore.getState().elapsed,
  };
  const scores = calculateScore(events, timerData);
  const ratingColors = { good: 'text-success', fair: 'text-warning', poor: 'text-danger' };
  const ratingBg = { good: 'bg-success/10', fair: 'bg-warning/10', poor: 'bg-danger/10' };
  const gradeColor = { A: 'text-success', B: 'text-info', C: 'text-warning', D: 'text-danger', F: 'text-danger' };

  const metrics = [
    scores.timeToFirstShock && { name: 'Time to 1st Shock', ...scores.timeToFirstShock },
    scores.epiCompliance && { name: 'Epi Timing', ...scores.epiCompliance },
    scores.ccf && { name: 'CCF', ...scores.ccf },
    scores.handsOffTime && { name: 'Hands-off Time', ...scores.handsOffTime },
  ].filter(Boolean);

  return (
    <div className="glass-card !p-4 space-y-3 text-left w-full">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-info">Performance Scorecard</div>
        <div className={`text-3xl font-black ${gradeColor[scores.grade] || 'text-text-primary'}`}>{scores.grade}</div>
      </div>
      {metrics.map((m, i) => (
        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${ratingBg[m.rating]}`}>
          <div>
            <div className="text-xs font-semibold text-text-primary">{m.name}</div>
            <div className="text-[10px] text-text-muted">Target: {m.target}</div>
          </div>
          <div className={`font-mono font-bold text-sm ${ratingColors[m.rating]}`}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

// ===== ROSC =====
function ROSCStep({ onDone, isTraining }) {
  const { endCase, currentCase, events, patient, team, etco2Readings, shockCount } = useCaseStore();
  const { elapsed, stopTimer } = useTimerStore();
  const [saved, setSaved] = useState(false);

  const handleEnd = async () => {
    if (!saved) {
      stopTimer();
      await endCase('ROSC');
      setSaved(true);
    }
  };

  useEffect(() => { handleEnd(); }, []);

  const handleExport = () => {
    const timer = useTimerStore.getState();
    const caseData = {
      id: currentCase?.id,
      mode: currentCase?.mode,
      startTime: currentCase?.startTime,
      endTime: new Date(),
      outcome: 'ROSC',
      events, patient, team, etco2Readings,
      ccf: timer.getCCF(),
      totalCPRTime: Math.round(timer.totalCPRTime),
      totalPauseTime: Math.round(timer.totalPauseTime),
      cycleNumber: timer.cycleNumber,
      shockCount,
      elapsed: Math.round(timer.elapsed),
    };
    exportCasePDF(caseData);
  };

  return (
    <StepCard phase="Post-Cardiac Arrest Care" phaseColor="text-success"
      icon="💚" title="ROSC Achieved!"
      instructions={[
        'SpO₂ 92-98% — avoid hyperoxia',
        'EtCO₂ 35-45 mmHg — avoid hyperventilation',
        'MAP ≥ 65 mmHg (IV fluids + vasopressors)',
        '12-Lead ECG → STEMI? → Cath lab',
        'TTM 32-36°C for ≥ 24 hours',
        'Labs: ABG, Lactate, Troponin, Electrolytes',
        'Glucose 140-180 mg/dL',
        'Seizure precaution',
      ]}>
      {isTraining && <Scorecard events={events} />}
      <BigButton color="bg-info text-white" onClick={handleExport}>
        📄 Export PDF Report
      </BigButton>
      <BigButton color="bg-success text-white" onClick={onDone}>
        ✅ Done → Dashboard
      </BigButton>
    </StepCard>
  );
}

// ===== TERMINATED =====
function TerminatedStep({ onDone, isTraining }) {
  const { endCase, currentCase, events, patient, team, etco2Readings, shockCount } = useCaseStore();
  const { elapsed, stopTimer } = useTimerStore();
  const [saved, setSaved] = useState(false);

  const handleEnd = async () => {
    if (!saved) {
      stopTimer();
      await endCase('terminated');
      setSaved(true);
    }
  };

  useEffect(() => { handleEnd(); }, []);

  const handleExport = () => {
    const timer = useTimerStore.getState();
    const caseData = {
      id: currentCase?.id,
      mode: currentCase?.mode,
      startTime: currentCase?.startTime,
      endTime: new Date(),
      outcome: 'terminated',
      events, patient, team, etco2Readings,
      ccf: timer.getCCF(),
      totalCPRTime: Math.round(timer.totalCPRTime),
      totalPauseTime: Math.round(timer.totalPauseTime),
      cycleNumber: timer.cycleNumber,
      shockCount,
      elapsed: Math.round(timer.elapsed),
    };
    exportCasePDF(caseData);
  };

  return (
    <StepCard phase="Case Ended" phaseColor="text-text-muted"
      icon="🕊️" title="Case Terminated"
      subtitle={`Total duration: ${formatTimeLong(elapsed)}`}>
      {isTraining && <Scorecard events={events} />}
      <BigButton color="bg-info text-white" onClick={handleExport}>
        📄 Export PDF Report
      </BigButton>
      <BigButton color="bg-bg-secondary text-text-primary" onClick={onDone}>
        Done → Dashboard
      </BigButton>
    </StepCard>
  );
}

// ===== TIMER BAR =====
function TimerBar({ onToggleLog, showLog, isTraining }) {
  const { elapsed, cycleElapsed, cycleNumber, cycleDuration, cprActive, isRunning } = useTimerStore();
  const { shockCount, events } = useCaseStore();
  const cycleRemaining = cycleDuration - cycleElapsed;
  const cycleProgress = (cycleElapsed / cycleDuration) * 100;

  return (
    <div className="timer-bar px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-4">
        <div className={`text-3xl font-mono font-black tabular-nums tracking-tight ${isRunning ? (isTraining ? 'text-info' : 'text-danger') : 'text-text-muted'}`}>
          {formatTimeLong(elapsed)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted font-medium">Cycle {cycleNumber}</span>
            <span className={`badge ${
              cprActive ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
            }`}>
              {cprActive ? '🫀 CPR' : '⏸ PAUSE'} · {formatTime(cycleRemaining)}
            </span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${
              cycleProgress > 90 ? 'bg-danger animate-pulse' : cycleProgress > 75 ? 'bg-warning' : 'bg-info'
            }`} style={{ width: `${cycleProgress}%` }} />
          </div>
        </div>
        <span className="badge bg-shock/15 text-shock">⚡ {shockCount}</span>
        <button onClick={onToggleLog}
          className={`badge transition-all ${showLog ? 'bg-info/20 text-info' : 'bg-bg-tertiary/50 text-text-muted'}`}>
          📋 {events.length}
        </button>
      </div>
    </div>
  );
}

// ===== SHOCK MODAL (Quick shock from CPR Dashboard) =====
function ShockModal({ onClose, isTraining }) {
  const { shockCount, currentRhythm, addShock, addEvent } = useCaseStore();
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const elapsed = useTimerStore(s => s.elapsed);
  const energy = currentRhythm?.energyBiphasic
    ? (shockCount === 0 ? currentRhythm.energyBiphasic.first : currentRhythm.energyBiphasic.subsequent)
    : 200;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary p-4 space-y-3"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-primary">⚡ Defibrillation — Shock #{shockCount + 1}</span>
        <button onClick={onClose} className="text-text-muted text-sm font-bold">✕</button>
      </div>
      <div className="text-sm text-text-secondary">
        {currentRhythm?.abbreviation} → {energy}J Biphasic
      </div>
      {isTraining && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
          Charge during CPR → pause &lt;5s → Clear → Shock → Resume CPR immediately
        </div>
      )}
      <button onClick={() => {
        if (soundEnabled) playShockSound();
        addShock();
        addEvent({ elapsed, category: 'shock', type: `⚡ Shock #${shockCount + 1}`, details: { energy: `${energy}J` } });
        onClose();
      }} className="w-full btn-action btn-shock py-5 text-xl font-black animate-pulse">
        ⚡ SHOCK {energy}J
      </button>
    </div>
  );
}

// ===== TCP STEP =====
function TCPStep({ onLog, onMonitor, onArrest }) {
  const [tcpPhase, setTcpPhase] = useState('setup'); // setup, capture, vasopressors
  const [mode, setMode] = useState('Demand');
  const [rate, setRate] = useState(60);
  const [output, setOutput] = useState(0);    // mA
  const [captured, setCaptured] = useState(false);
  const [threshold, setThreshold] = useState(null);
  const [safetyMargin, setSafetyMargin] = useState(null);
  const [femoralPulse, setFemoralPulse] = useState(null);

  const handleCapture = () => {
    setCaptured(true);
    setThreshold(output);
    const margin = Math.min(output + 10, 200);
    setSafetyMargin(margin);
    setOutput(margin);
    onLog('other', `⚡ TCP Capture at ${output}mA → Safety margin ${margin}mA (Mode: ${mode}, Rate: ${rate}bpm)`);
    setTcpPhase('capture');
  };

  if (tcpPhase === 'capture') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-success">TCP — Captured</div>
        <div className="text-5xl">⚡</div>
        <h1 className="text-[1.65rem] font-black text-text-primary leading-tight">Pacing Active</h1>

        {/* TCP Summary */}
        <div className="glass-card !p-4 text-left space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-primary rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-text-muted uppercase font-semibold">Mode</div>
              <div className="text-sm font-bold text-text-primary">{mode}</div>
            </div>
            <div className="bg-bg-primary rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-text-muted uppercase font-semibold">Rate</div>
              <div className="text-sm font-bold text-text-primary">{rate} bpm</div>
            </div>
            <div className="bg-bg-primary rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-text-muted uppercase font-semibold">Threshold</div>
              <div className="text-sm font-bold text-warning">{threshold} mA</div>
            </div>
            <div className="bg-bg-primary rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-text-muted uppercase font-semibold">Output (Safety)</div>
              <div className="text-sm font-bold text-success">{safetyMargin} mA</div>
            </div>
          </div>
        </div>

        {/* Femoral pulse check */}
        <div className="glass-card !p-4">
          <div className="text-sm font-bold text-text-primary mb-2">คลำ Femoral Pulse</div>
          <p className="text-xs text-text-secondary mb-3">ตรวจสอบว่ามี mechanical capture — คลำ femoral pulse (ไม่ใช่ carotid เพราะอาจสับสนกับ muscle twitch)</p>
          <div className="flex gap-3">
            <button onClick={() => {
              setFemoralPulse(true);
              onLog('other', '✅ Femoral pulse palpable — mechanical capture confirmed');
            }} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              femoralPulse === true ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
            }`}>✅ คลำได้</button>
            <button onClick={() => {
              setFemoralPulse(false);
              onLog('other', '❌ Femoral pulse NOT palpable — increase output or check pads');
            }} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              femoralPulse === false ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
            }`}>❌ คลำไม่ได้</button>
          </div>
          {femoralPulse === false && (
            <p className="text-xs text-danger mt-2 font-medium">→ เพิ่ม output / ตรวจสอบ pad position / พิจารณา vasopressors</p>
          )}
        </div>

        {/* Sedation reminder */}
        <div className="glass-card !p-3 text-left">
          <div className="text-xs font-bold text-text-primary">💊 Sedation / Analgesia</div>
          <p className="text-[11px] text-text-secondary mt-0.5">TCP เจ็บมาก — ให้ Midazolam 1-2mg IV + Fentanyl 25-50mcg IV ถ้าผู้ป่วยรู้สึกตัว</p>
          <button onClick={() => onLog('drug', '💊 Sedation for TCP (Midazolam + Fentanyl)')}
            className="btn-action btn-purple py-2 text-xs mt-2 w-full">💊 Sedation Given</button>
        </div>

        {/* Vasopressors option */}
        <button onClick={() => setTcpPhase('vasopressors')}
          className="w-full btn-action btn-ghost py-3 text-sm">
          💉 Add Vasopressors (Dopamine / Epi)
        </button>

        <BigButton color="bg-success" onClick={onMonitor}>
          ✅ Stabilized → Monitor
        </BigButton>
        <BigButton color="bg-danger" onClick={onArrest}>
          ❌ Pulseless → Start CPR
        </BigButton>
      </div>
    );
  }

  if (tcpPhase === 'vasopressors') {
    return (
      <div className="text-center space-y-4 animate-slide-up px-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple">Vasopressor Infusion</div>
        <div className="text-5xl">💉</div>
        <h1 className="text-[1.65rem] font-black text-text-primary leading-tight">Vasopressors</h1>

        {/* Dopamine */}
        <div className="glass-card !p-4 text-left">
          <div className="text-sm font-bold text-text-primary mb-1">💉 Dopamine</div>
          <div className="text-xs text-text-secondary space-y-1 mb-2">
            <div>ขนาด: <span className="font-bold text-text-primary">5-20 mcg/kg/min</span></div>
            <div>ผสม: <span className="font-bold text-text-primary">Dopamine 400mg + NSS 250ml</span></div>
            <div>ความเข้มข้น: 1,600 mcg/ml</div>
            <div>ตัวอย่าง: ผู้ป่วย 60kg → เริ่ม 5 mcg/kg/min = 11.25 ml/hr</div>
          </div>
          <button onClick={() => onLog('drug', '💉 Dopamine infusion started (400mg/NSS 250ml, 5-20 mcg/kg/min)')}
            className="btn-action btn-purple py-2.5 text-xs w-full">💉 Start Dopamine</button>
        </div>

        {/* Epinephrine infusion */}
        <div className="glass-card !p-4 text-left">
          <div className="text-sm font-bold text-text-primary mb-1">💉 Epinephrine Infusion</div>
          <div className="text-xs text-text-secondary space-y-1 mb-2">
            <div>ขนาด: <span className="font-bold text-text-primary">2-10 mcg/min</span></div>
            <div>ผสม: <span className="font-bold text-text-primary">Epinephrine 1mg (1:1000) + NSS 250ml</span></div>
            <div>ความเข้มข้น: 4 mcg/ml</div>
            <div>เริ่ม 2 mcg/min = 30 ml/hr → titrate ตาม HR/BP</div>
          </div>
          <button onClick={() => onLog('drug', '💉 Epinephrine infusion started (1mg/NSS 250ml, 2-10 mcg/min)')}
            className="btn-action btn-purple py-2.5 text-xs w-full">💉 Start Epi Infusion</button>
        </div>

        <button onClick={() => setTcpPhase('capture')}
          className="text-text-muted text-xs underline">← Back to TCP</button>
        <BigButton color="bg-success" onClick={onMonitor}>
          ✅ Stabilized → Monitor
        </BigButton>
        <BigButton color="bg-danger" onClick={onArrest}>
          ❌ Pulseless → Start CPR
        </BigButton>
      </div>
    );
  }

  // Setup phase
  return (
    <div className="text-center space-y-4 animate-slide-up px-2">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-warning">Transcutaneous Pacing</div>
      <div className="text-5xl">⚡</div>
      <h1 className="text-[1.65rem] font-black text-text-primary leading-tight">TCP Setup</h1>

      {/* Mode */}
      <div className="glass-card !p-4 text-left">
        <div className="text-[10px] font-semibold text-text-muted uppercase mb-2">Mode</div>
        <div className="flex gap-2">
          {['Demand', 'Fixed'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                mode === m ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>{m}</button>
          ))}
        </div>
        <p className="text-[10px] text-text-muted mt-1.5">
          {mode === 'Demand' ? 'Demand: pace เมื่อ intrinsic rate < set rate (ใช้บ่อย)' : 'Fixed: pace ตลอด ไม่สนใจ intrinsic rhythm (ใช้เมื่อ sense ไม่ได้)'}
        </p>
      </div>

      {/* Rate */}
      <div className="glass-card !p-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase">Rate</span>
          <span className="text-lg font-mono font-black text-text-primary">{rate} bpm</span>
        </div>
        <input type="range" min={40} max={180} step={10} value={rate}
          onChange={e => setRate(parseInt(e.target.value))}
          className="w-full accent-info" />
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>40</span>
          <span className="text-success font-semibold">60-80 typical</span>
          <span>180</span>
        </div>
      </div>

      {/* Output (mA) */}
      <div className="glass-card !p-4 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase">Output (mA)</span>
          <span className={`text-lg font-mono font-black ${output > 0 ? 'text-warning' : 'text-text-muted'}`}>{output} mA</span>
        </div>
        <input type="range" min={0} max={200} step={5} value={output}
          onChange={e => setOutput(parseInt(e.target.value))}
          className="w-full accent-warning" />
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>0</span>
          <span>เพิ่มทีละ 5-10 mA จนเห็น capture</span>
          <span>200</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="instruction-list text-left">
        <div className="instruction-item">เริ่ม rate 60 bpm, output 0 mA</div>
        <div className="instruction-item">เพิ่ม output ทีละ 5-10 mA จน capture</div>
        <div className="instruction-item">ดู ECG: pacer spike + wide QRS = electrical capture</div>
        <div className="instruction-item">จด threshold → ตั้ง safety margin (+10mA หรือ threshold x2)</div>
      </div>

      {/* Capture button */}
      <BigButton color={output > 0 ? 'bg-success' : 'bg-bg-secondary text-text-muted'} onClick={handleCapture} disabled={output === 0}>
        ✅ Capture! (Threshold = {output} mA)
      </BigButton>

      {/* No capture → vasopressors */}
      <button onClick={() => { setTcpPhase('vasopressors'); onLog('other', '⚡ TCP — no capture, switching to vasopressors'); }}
        className="w-full btn-action btn-ghost py-3 text-sm">
        ❌ No Capture → Vasopressors
      </button>

      <BigButton color="bg-danger" onClick={onArrest}>
        ❌ Pulseless → Start CPR
      </BigButton>
    </div>
  );
}

// ===== BRADYCARDIA STEP =====
function BradycardiaStep({ onLog, onMonitor, onRecheckPulse, onArrest }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const [phase, setPhase] = useState('assess'); // assess, atropine, pacing
  const [atropineCount, setAtropineCount] = useState(0);

  if (phase === 'atropine') {
    return (
      <StepCard phase="Bradycardia — Treatment" phaseColor="text-info"
        icon="💉" title="Atropine Protocol"
        subtitle={`Doses given: ${atropineCount}/3 (max 3mg)`}>
        <BigButton color="bg-purple" onClick={() => {
          const count = atropineCount + 1;
          setAtropineCount(count);
          onLog('drug', `💉 Atropine 1mg IV (dose ${count}/3)`);
        }} disabled={atropineCount >= 3}>
          💉 Give Atropine 1mg IV
          <div className="text-xs font-normal opacity-80 mt-1">
            {atropineCount >= 3 ? 'Max dose reached' : `Dose ${atropineCount + 1} of 3 · q3-5min`}
          </div>
        </BigButton>
        {atropineCount > 0 && (
          <BigButton color="bg-warning" onClick={() => setPhase('pacing')}>
            ⚡ Atropine ineffective → Pacing / Vasopressors
          </BigButton>
        )}
        <BigButton color="bg-success" onClick={onMonitor}>
          ✅ HR improved → Monitor
        </BigButton>
        <BigButton color="bg-danger" onClick={onArrest}>
          ❌ Pulseless → Start CPR
        </BigButton>
      </StepCard>
    );
  }

  if (phase === 'pacing') {
    return <TCPStep onLog={onLog} onMonitor={onMonitor} onArrest={onArrest} />;
  }

  return (
    <StepCard phase="Bradycardia Algorithm" phaseColor="text-info"
      icon="🐢" title="Symptomatic Bradycardia?"
      subtitle="HR < 60 — Is the patient symptomatic?"
      instructions={[
        'Symptoms: Hypotension, altered mental status, chest pain, acute HF, shock',
        'Signs of poor perfusion?',
        'Identify and treat underlying cause',
      ]}>
      <BigButton color="bg-danger" onClick={() => {
        onLog('other', '⚠️ Symptomatic Bradycardia — starting Atropine');
        setPhase('atropine');
      }}>
        ⚠️ Symptomatic → Atropine Protocol
      </BigButton>
      <BigButton color="bg-success" onClick={() => {
        onLog('other', '✅ Asymptomatic Bradycardia — Monitor');
        onMonitor();
      }}>
        ✅ Asymptomatic → Monitor
      </BigButton>
      <button onClick={onRecheckPulse} className="text-text-muted text-xs underline mt-2">
        ← Re-check pulse
      </button>
    </StepCard>
  );
}

// ===== TACHYCARDIA STEP =====
function TachycardiaStep({ onLog, onMonitor, onRecheckPulse, onArrest }) {
  const elapsed = useTimerStore(s => s.elapsed);
  const [phase, setPhase] = useState('assess'); // assess, unstable, svt, af, vt

  if (phase === 'unstable') {
    return (
      <StepCard phase="Tachycardia — UNSTABLE" phaseColor="text-danger"
        icon="⚡" title="Synchronized Cardioversion"
        instructions={[
          'Sedate if conscious (Midazolam 1-2mg / Fentanyl 25-50mcg)',
          'Narrow regular: 50-100J',
          'Narrow irregular (AF): 120-200J biphasic',
          'Wide regular: 100J',
          'Wide irregular: Defibrillation (unsynchronized)',
        ]}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { onLog('drug', '💊 Midazolam 1-2mg IV (sedation)'); }}
            className="btn-action btn-purple py-3.5 text-sm">💊 Sedate</button>
          <button onClick={() => { onLog('shock', '⚡ Synchronized Cardioversion delivered'); }}
            className="btn-action btn-shock py-3.5 text-sm">⚡ Cardiovert</button>
        </div>
        <BigButton color="bg-success" onClick={() => {
          onLog('other', '✅ Cardioversion successful — sinus rhythm');
          onMonitor();
        }}>
          ✅ Converted → Monitor
        </BigButton>
        <BigButton color="bg-warning" onClick={() => setPhase('assess')}>
          ← Back to Assessment
        </BigButton>
        <BigButton color="bg-danger" onClick={onArrest}>
          ❌ Pulseless → Start CPR
        </BigButton>
      </StepCard>
    );
  }

  if (phase === 'svt') {
    return (
      <StepCard phase="SVT — Stable Narrow Regular" phaseColor="text-info"
        icon="💓" title="SVT Treatment"
        instructions={[
          '1. Vagal maneuvers (Valsalva / carotid massage)',
          '2. Adenosine 6mg rapid IV push + flush',
          '3. Adenosine 12mg (may repeat x1)',
          '4. Consider Diltiazem or Beta-blocker',
        ]}>
        <button onClick={() => { onLog('other', '🫁 Vagal maneuver performed'); }}
          className="btn-action btn-ghost py-3.5 text-sm w-full mb-2">🫁 Vagal Maneuver</button>
        <button onClick={() => { onLog('drug', '💉 Adenosine 6mg rapid IV push'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Adenosine 6mg</button>
        <button onClick={() => { onLog('drug', '💉 Adenosine 12mg rapid IV push'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Adenosine 12mg</button>
        <button onClick={() => { onLog('drug', '💉 Diltiazem 15-20mg IV over 2min'); }}
          className="btn-action btn-ghost py-3.5 text-sm w-full mb-2">💉 Diltiazem</button>
        <BigButton color="bg-success" onClick={() => {
          onLog('other', '✅ SVT converted');
          onMonitor();
        }}>✅ Converted → Monitor</BigButton>
        <button onClick={() => setPhase('assess')} className="text-text-muted text-xs underline mt-2">← Back</button>
      </StepCard>
    );
  }

  if (phase === 'af') {
    return (
      <StepCard phase="AF — Stable Narrow Irregular" phaseColor="text-info"
        icon="💓" title="AF/Flutter Rate Control"
        instructions={[
          'Diltiazem 15-20mg IV over 2 min (may repeat)',
          'OR Metoprolol 5mg IV q5min (max 15mg)',
          'OR Amiodarone 150mg IV over 10 min',
          'If AF >48h or unknown → anticoagulate before cardioversion',
        ]}>
        <button onClick={() => { onLog('drug', '💉 Diltiazem 15-20mg IV'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Diltiazem</button>
        <button onClick={() => { onLog('drug', '💉 Metoprolol 5mg IV'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Metoprolol</button>
        <button onClick={() => { onLog('drug', '💉 Amiodarone 150mg IV/10min'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Amiodarone</button>
        <BigButton color="bg-success" onClick={() => {
          onLog('other', '✅ Rate controlled');
          onMonitor();
        }}>✅ Rate Controlled → Monitor</BigButton>
        <button onClick={() => setPhase('assess')} className="text-text-muted text-xs underline mt-2">← Back</button>
      </StepCard>
    );
  }

  if (phase === 'vt') {
    return (
      <StepCard phase="VT — Stable Wide Regular" phaseColor="text-warning"
        icon="⚡" title="Stable VT Treatment"
        instructions={[
          'Amiodarone 150mg IV over 10 min',
          'May repeat Amiodarone x1',
          'Prepare for cardioversion if deteriorates',
          'Expert consult recommended',
        ]}>
        <button onClick={() => { onLog('drug', '💉 Amiodarone 150mg IV over 10min'); }}
          className="btn-action btn-purple py-3.5 text-sm w-full mb-2">💉 Amiodarone 150mg</button>
        <button onClick={() => { onLog('drug', '💉 Amiodarone 150mg repeat'); }}
          className="btn-action btn-ghost py-3.5 text-sm w-full mb-2">💉 Amiodarone repeat</button>
        <BigButton color="bg-danger" onClick={() => {
          setPhase('unstable');
        }}>⚡ Deteriorating → Cardioversion</BigButton>
        <BigButton color="bg-success" onClick={() => {
          onLog('other', '✅ VT resolved');
          onMonitor();
        }}>✅ Resolved → Monitor</BigButton>
        <button onClick={() => setPhase('assess')} className="text-text-muted text-xs underline mt-2">← Back</button>
      </StepCard>
    );
  }

  // Default: Assessment
  return (
    <StepCard phase="Tachycardia Algorithm" phaseColor="text-danger"
      icon="🐇" title="Tachycardia Assessment"
      subtitle="HR > 100 — Stable or Unstable?"
      instructions={[
        'Unstable signs: Hypotension, altered consciousness, chest pain, acute HF, shock',
        'If unstable → Synchronized Cardioversion',
        'If stable → Identify rhythm type below',
      ]}>
      <BigButton color="bg-danger" onClick={() => {
        onLog('other', '⚠️ Unstable Tachycardia');
        setPhase('unstable');
      }}>
        ⚠️ UNSTABLE → Cardioversion
      </BigButton>
      <div className="text-xs text-text-muted font-semibold text-center pt-1">Stable — Select rhythm type:</div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { onLog('other', 'SVT identified'); setPhase('svt'); }}
          className="btn-action btn-ghost py-4 text-sm">
          Narrow Regular
          <div className="text-[10px] text-info mt-1">SVT → Adenosine</div>
        </button>
        <button onClick={() => { onLog('other', 'AF/Flutter identified'); setPhase('af'); }}
          className="btn-action btn-ghost py-4 text-sm">
          Narrow Irregular
          <div className="text-[10px] text-info mt-1">AF → Rate control</div>
        </button>
        <button onClick={() => { onLog('other', 'VT identified'); setPhase('vt'); }}
          className="btn-action btn-ghost py-4 text-sm">
          Wide Regular
          <div className="text-[10px] text-warning mt-1">VT → Amiodarone</div>
        </button>
        <button onClick={() => { onLog('other', 'Wide irregular → treat as VF'); onArrest(); }}
          className="btn-action btn-ghost py-4 text-sm">
          Wide Irregular
          <div className="text-[10px] text-danger mt-1">→ Defib (pVT/Torsades)</div>
        </button>
      </div>
      <button onClick={onRecheckPulse} className="text-text-muted text-xs underline mt-2">
        ← Re-check pulse
      </button>
    </StepCard>
  );
}

// ===== CCF BADGE =====
function CCFBadge() {
  const ccf = useTimerStore(s => s.getCCF());
  const color = ccf >= 80 ? 'text-success' : ccf >= 60 ? 'text-warning' : 'text-danger';
  const bgColor = ccf >= 80 ? 'bg-success/10' : ccf >= 60 ? 'bg-warning/10' : 'bg-danger/10';
  return (
    <div className={`${bgColor} rounded-xl px-3 py-2 text-center`}>
      <div className={`text-2xl font-mono font-black ${color}`}>{ccf}%</div>
      <div className="text-[9px] text-text-muted font-semibold uppercase">CCF</div>
    </div>
  );
}

// ===== EtCO₂ INPUT =====
function EtCO2Input() {
  const [show, setShow] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [value, setValue] = useState('');
  const { addEtCO2, latestEtCO2, etco2Readings } = useCaseStore();
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  const submit = () => {
    const num = parseInt(value);
    if (num > 0 && num < 200) {
      addEtCO2(num, 'during_cpr');
      addEvent({ elapsed, category: 'etco2', type: `🌬️ EtCO₂: ${num} mmHg`, details: { value: num } });
      setValue('');
      setShow(false);
    }
  };

  const chartData = etco2Readings.map(r => ({
    time: r.elapsed,
    value: r.value,
  }));

  if (!show) {
    return (
      <div className="space-y-1 w-full">
        <button onClick={() => setShow(true)}
          className={`glass-card flex items-center justify-between px-4 py-2 text-sm w-full ${
            latestEtCO2 && latestEtCO2.value > 20 ? '!border-success/40' : ''
          }`}>
          <span className="text-text-muted font-medium">🌬️ EtCO₂</span>
          <span className={`font-mono font-bold ${
            latestEtCO2 ? (latestEtCO2.value < 10 ? 'text-danger' : latestEtCO2.value > 20 ? 'text-success' : 'text-text-primary') : 'text-text-muted'
          }`}>
            {latestEtCO2 ? `${latestEtCO2.value} mmHg` : 'Tap to record'}
          </span>
        </button>
        {chartData.length >= 2 && (
          <button onClick={() => setShowChart(!showChart)}
            className="text-[10px] text-info underline w-full text-center">
            {showChart ? 'Hide chart' : `Show trend (${chartData.length} readings)`}
          </button>
        )}
        {showChart && chartData.length >= 2 && <EtCO2Chart data={chartData} />}
      </div>
    );
  }

  return (
    <div className="glass-card flex items-center gap-2 px-3 py-2">
      <span className="text-sm">🌬️</span>
      <input type="number" value={value} onChange={e => setValue(e.target.value)}
        placeholder="mmHg" autoFocus
        className="flex-1 bg-bg-primary rounded-lg px-3 py-2 text-sm font-mono text-center border border-bg-tertiary focus:outline-none focus:border-info"
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <button onClick={submit} className="btn-action btn-info px-3 py-2 text-xs !min-h-0">Save</button>
      <button onClick={() => setShow(false)} className="text-text-muted text-xs">✕</button>
    </div>
  );
}

function EtCO2Chart({ data }) {
  return (
    <div className="glass-card !p-2 w-full">
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 9 }} tickFormatter={v => `${Math.floor(v / 60)}m`} />
          <YAxis domain={[0, 60]} tick={{ fontSize: 9 }} />
          <ReferenceLine y={20} stroke="#16A34A" strokeDasharray="3 3" />
          <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="value" stroke="#2563EB" dot={{ r: 3 }} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-[9px] text-text-muted mt-1">
        <span><span className="text-success">---</span> &gt;20 = possible ROSC</span>
        <span><span className="text-danger">---</span> &lt;10 = low quality</span>
      </div>
    </div>
  );
}

// ===== EVENT LOG =====
function EventLogPanel({ onClose }) {
  const events = useCaseStore(s => s.events);
  const icons = { cpr: '🫀', rhythm: '📈', shock: '⚡', drug: '💉', airway: '🫁', access: '💉', etco2: '🌬️', other: '📝' };

  return (
    <div className="absolute bottom-0 left-0 right-0 max-h-[50vh] overflow-y-auto p-4 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-text-primary text-sm">📋 Event Log ({events.length})</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">
          Close ✕
        </button>
      </div>
      {events.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">No events yet</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((ev, i) => (
            <div key={i} className="glass-card flex items-center gap-2.5 px-3.5 py-2.5">
              <span>{icons[ev.category] || '📝'}</span>
              <span className="flex-1 truncate font-semibold text-sm text-text-primary">{ev.type}</span>
              <span className="text-text-muted font-mono text-xs shrink-0">{formatElapsed(ev.elapsed)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== PATIENT INFO PANEL =====
function PatientInfoPanel({ onClose }) {
  const { patient, updatePatient } = useCaseStore();

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={patient[field] || ''}
        onChange={e => updatePatient(field, type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
      />
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">👤 Patient Information</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">Done ✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="HN" field="hn" placeholder="Hospital Number" />
          <Field label="Name" field="name" placeholder="Patient Name" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Age" field="age" placeholder="Age" type="number" />
          <Field label="Weight (kg)" field="weight" placeholder="kg" type="number" />
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Gender</label>
            <div className="flex gap-1.5 mt-0.5">
              {['M', 'F'].map(g => (
                <button key={g} onClick={() => updatePatient('gender', g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    patient.gender === g ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{g === 'M' ? '♂ Male' : '♀ Female'}</button>
              ))}
            </div>
          </div>
        </div>
        <Field label="Chief Complaint" field="chiefComplaint" placeholder="Reason for arrest / presentation" />
        <Field label="Location" field="location" placeholder="Ward / ER / ICU / Outside hospital" />
        <Field label="PMH" field="pmh" placeholder="Past medical history (comma separated)" />
        <Field label="Medications" field="medications" placeholder="Current medications" />
        <Field label="Allergies" field="allergies" placeholder="Drug allergies" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Witnessed?</label>
            <div className="flex gap-1.5 mt-0.5">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => updatePatient('witnessed', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                    patient.witnessed === v ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Bystander CPR?</label>
            <div className="flex gap-1.5 mt-0.5">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => updatePatient('bystanderCPR', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                    patient.bystanderCPR === v ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== TEAM PANEL =====
function TeamPanel({ onClose }) {
  const { team, setTeam } = useCaseStore();

  const updateField = (field, value) => {
    setTeam({ ...team, [field]: value });
  };

  const RoleField = ({ label, field, placeholder, icon }) => (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{icon} {label}</label>
      <input
        type="text"
        value={team[field] || ''}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
      />
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">👥 Team Assignment</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">Done ✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <RoleField icon="👑" label="Team Leader" field="leader" placeholder="Name" />
        <RoleField icon="🫁" label="Airway" field="airway" placeholder="Name" />
        <RoleField icon="💉" label="Drug / IV" field="drugAdmin" placeholder="Name" />
        <RoleField icon="📝" label="Recorder" field="recorder" placeholder="Name" />
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">🫀 Compressors</label>
          <input
            type="text"
            value={Array.isArray(team.compressor) ? team.compressor.join(', ') : (team.compressor || '')}
            onChange={e => updateField('compressor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Names (comma separated)"
            className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">👥 Others</label>
          <input
            type="text"
            value={Array.isArray(team.others) ? team.others.join(', ') : (team.others || '')}
            onChange={e => updateField('others', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Other team members (comma separated)"
            className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
          />
        </div>
        <div className="glass-card !p-3 text-center text-xs text-text-muted">
          Rotate compressors every 2 minutes to maintain CPR quality
        </div>
      </div>
    </div>
  );
}
