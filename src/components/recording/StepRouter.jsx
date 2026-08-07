import { useState, useRef } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import { useTimerStore } from '../../stores/timerStore';
import { IS_BLS } from '../../config/courseMode';
import { STEPS, nextStepAfterRhythm } from '../../data/recordingSteps';
import { StepCard, BigButton, TrainingHint, CountdownHint } from '../StepUI';
import { HeartPulse, Shield, Hand, Phone, Hospital, Monitor } from 'lucide-react';

import CPRDashboard from '../CPRDashboard';
import AirwayPanel from '../AirwayPanel';
import ReversibleCausesPanel from '../ReversibleCausesPanel';
import BradycardiaPathway from '../BradycardiaPathway';
import TachycardiaPathway from '../TachycardiaPathway';
import MIACSPathway from '../MIACSPathway';
import StrokePathway from '../StrokePathway';
import PostROSCChecklist from '../PostROSCChecklist';
import AEDPanel from '../AEDPanel';
import StableMonitor from '../StableMonitor';
import RhythmSelectStep from './RhythmSelectStep';
import DrugStep from './DrugStep';
import TerminatedStep from './TerminatedStep';
import { ShockStep } from './ShockControls';

// The wizard: renders the current step of the resuscitation state machine.
// All transitions go through onGoStep/onEndCase owned by Recording.
export default function StepRouter({ step, startMode, scenario, isTraining, narrationBusy, onGoStep, onLog, onEndCase, onShock, onOpenLabs, onNavigateHistory }) {
  const isRunning = useTimerStore(s => s.isRunning);
  const startTimer = useTimerStore(s => s.startTimer);
  const log = onLog;
  const goStep = onGoStep;

  // จังหวะอ่านก่อนกด (narrationBusy): เดิมใช้ disabled ตรงๆ ทำให้ปุ่มดูค้าง/ไม่ตอบสนอง
  // ตอนผู้เรียนกดเร็วไป (pointer-events:none = เงียบสนิท) — เปลี่ยนมาให้ปุ่มยังกดได้จริง
  // แค่โชว์ nudge สั้นๆ แทนถ้ากดระหว่างที่ยังไม่ถึงจังหวะ
  const [waitHint, setWaitHint] = useState(false);
  const waitTimerRef = useRef(null);
  const guard = (fn) => () => {
    if (narrationBusy) {
      setWaitHint(true);
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = setTimeout(() => setWaitHint(false), 1100);
      return;
    }
    fn();
  };
  const waitHintNode = waitHint && (
    <div className="text-2xs text-warning text-center font-semibold animate-pulse -mt-1">
      ⏳ ฟังตัวละครอีกนิดนะ แล้วค่อยเลือก
    </div>
  );

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
          <div className="text-caption text-text-secondary text-center font-medium mb-1">ประเมินผู้ป่วยแล้วพบว่า:</div>
          {waitHintNode}
          <div className="grid grid-cols-1 gap-3 w-full">
            <BigButton color="bg-danger" pending={narrationBusy} onClick={guard(() => { log('other', '❌ Unresponsive + Not Breathing'); goStep(STEPS.CALL_FOR_HELP); })}>
              ❌ Unresponsive + Not Breathing
              <div className="text-3xs font-normal mt-0.5">→ Call for help → Check Pulse</div>
            </BigButton>
            <BigButton color="bg-danger" pending={narrationBusy} onClick={guard(() => { log('other', '❌ Unresponsive + Gasping (agonal breathing)'); goStep(STEPS.CALL_FOR_HELP); })}>
              ❌ Unresponsive + Gasping
              <div className="text-3xs font-normal mt-0.5">Gasping = NOT normal → treat as no breathing</div>
            </BigButton>
            <BigButton color="bg-warning text-black" pending={narrationBusy} onClick={guard(() => { log('other', '❌ Unresponsive BUT Breathing normally → Recovery position'); goStep(STEPS.PULSE_PRESENT); })}>
              ❌ Unresponsive BUT Breathing Normally
              <div className="text-3xs font-normal mt-0.5">Has pulse → Recovery position → Monitor</div>
            </BigButton>
            <BigButton color="bg-success" pending={narrationBusy} onClick={guard(() => { log('other', '✅ Responsive + Breathing'); goStep(STEPS.PULSE_PRESENT); })}>
              ✅ Responsive + Breathing
            </BigButton>
          </div>
        </StepCard>
      );

    case STEPS.CALL_FOR_HELP:
      return <CallForHelpStep onLog={log} onGoStep={goStep} />;

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
          <div className="text-caption text-text-secondary text-center font-medium mt-3">คลำชีพจรแล้วพบว่า:</div>
          {waitHintNode}
          <div className="grid grid-cols-2 gap-4 w-full mt-1">
            <BigButton color="bg-danger" pending={narrationBusy} onClick={guard(() => { log('other', '❌ No Pulse — Cardiac Arrest'); if (!isRunning) startTimer(); goStep(STEPS.START_CPR); })}>❌ No Pulse</BigButton>
            <BigButton color="bg-success" pending={narrationBusy} onClick={guard(() => { log('other', '✅ Pulse Present'); goStep(STEPS.PULSE_PRESENT); })}>✅ Pulse Present</BigButton>
          </div>
        </StepCard>
      );

    // ========== PULSE PRESENT ==========
    case STEPS.PULSE_PRESENT:
      return (
        <StepCard phase="Assessment" phaseColor="text-success" icon={HeartPulse} title="Pulse Present"
          subtitle="Assess heart rate and condition"
          instructions={['Check monitor or count pulse for 6 sec × 10', 'If not breathing adequately → Rescue breathing', 'Attach monitor if not done']}>
          <div className="text-caption text-text-secondary text-center font-medium mb-1">ประเมินอัตราการเต้นหัวใจแล้วพบว่า:</div>
          {waitHintNode}
          <div className="grid grid-cols-1 gap-3 w-full">
            <BigButton color="bg-info" pending={narrationBusy} onClick={guard(() => { if (!isRunning) startTimer(); log('other', '🐢 Bradycardia'); goStep(STEPS.PULSE_BRADYCARDIA); })}>🐢 Bradycardia (HR &lt; 50)</BigButton>
            <BigButton color="bg-success" pending={narrationBusy} onClick={guard(() => { if (!isRunning) startTimer(); log('other', '✅ Normal rate'); goStep(STEPS.PULSE_NORMAL); })}>✅ Normal (HR 50-150)</BigButton>
            <BigButton color="bg-danger" pending={narrationBusy} onClick={guard(() => { if (!isRunning) startTimer(); log('other', '⚡ Tachycardia'); goStep(STEPS.PULSE_TACHYCARDIA); })}>🐇 Tachycardia (HR &gt; 150)</BigButton>
            <div className="grid grid-cols-2 gap-3">
              <BigButton color="bg-danger" pending={narrationBusy} onClick={guard(() => { if (!isRunning) startTimer(); log('other', '🫀 Suspected ACS/MI'); goStep(STEPS.PULSE_MI); })}>🫀 ACS / MI</BigButton>
              <BigButton color="bg-purple text-white" pending={narrationBusy} onClick={guard(() => { if (!isRunning) startTimer(); log('other', '🧠 Suspected Stroke'); goStep(STEPS.PULSE_STROKE); })}>🧠 Stroke</BigButton>
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
        onDone={onNavigateHistory}
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
      if (IS_BLS) {
        return <AEDPanel
          mode="initial"
          scenarioVerdict={scenario?.aedVerdict || null}
          onShockDelivered={() => goStep(STEPS.CPR_CYCLE)}
          onNoShock={() => goStep(STEPS.CPR_CYCLE)}
          onROSC={() => onEndCase('ROSC')}
          isTraining={isTraining}
        />;
      }
      return <RhythmSelectStep title="Initial Rhythm" subtitle="What rhythm do you see on monitor?" phase="BLS — Defibrillation" isTraining={isTraining}
        onSelect={(rhythm) => {
          useCaseStore.getState().setRhythm(rhythm);
          log('rhythm', `Initial Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
          useCaseStore.getState().updatePatient('initialRhythm', rhythm.abbreviation);
          goStep(nextStepAfterRhythm(rhythm));
        }} />;

    // ========== PRIMARY SURVEY ==========
    case STEPS.SHOCK_DECISION:
      // BLS never reaches SHOCK_DECISION — AEDPanel handles shock internally.
      return <ShockStep onShocked={() => goStep(STEPS.CPR_CYCLE)} onSkip={() => goStep(STEPS.CPR_CYCLE)} isTraining={isTraining} />;

    case STEPS.CPR_CYCLE:
      return <CPRDashboard
        onCheckRhythm={() => goStep(STEPS.RHYTHM_CHECK)}
        onGiveDrug={() => goStep(STEPS.GIVE_DRUG)}
        onAirway={() => goStep(STEPS.AIRWAY_MANAGEMENT)}
        onROSC={() => onEndCase('ROSC')}
        onSecondary={() => goStep(STEPS.SECONDARY_SURVEY)}
        onShock={onShock}
        isTraining={isTraining} />;

    case STEPS.RHYTHM_CHECK:
      if (IS_BLS) {
        return <AEDPanel
          mode="recheck"
          scenarioVerdict={scenario?.aedVerdict || null}
          onShockDelivered={() => goStep(STEPS.CPR_CYCLE)}
          onNoShock={() => goStep(STEPS.CPR_CYCLE)}
          onROSC={() => onEndCase('ROSC')}
          isTraining={isTraining}
        />;
      }
      return <RhythmSelectStep title="⏱️ Rhythm Check" subtitle={`Cycle ${useTimerStore.getState().cycleNumber} complete — pause < 10 sec`}
        phase="Primary Survey" showROSC showTerminate isTraining={isTraining}
        onSelect={(rhythm) => {
          useCaseStore.getState().setRhythm(rhythm);
          log('rhythm', `Rhythm: ${rhythm.abbreviation}`, { shockable: rhythm.shockable });
          const next = nextStepAfterRhythm(rhythm, { isRecheck: true });
          if (next === STEPS.ROSC) onEndCase('ROSC');
          else goStep(next);
        }}
        onROSC={() => onEndCase('ROSC')}
        onTerminate={() => onEndCase('terminated')} />;

    case STEPS.GIVE_DRUG:
      return <DrugStep onDone={() => goStep(STEPS.CPR_CYCLE)} isTraining={isTraining} />;

    case STEPS.AIRWAY_MANAGEMENT:
      return <AirwayPanel onClose={() => goStep(STEPS.CPR_CYCLE)} />;

    case STEPS.SECONDARY_SURVEY:
      return <ReversibleCausesPanel onClose={() => goStep(STEPS.CPR_CYCLE)}
        onOpenAirway={() => goStep(STEPS.AIRWAY_MANAGEMENT)}
        onOpenLabs={onOpenLabs}
      />;

    // ========== OUTCOMES ==========
    case STEPS.ROSC:
      return <PostROSCChecklist
        onDone={onNavigateHistory}
        isTraining={isTraining}
        onBrady={() => goStep(STEPS.PULSE_BRADYCARDIA)}
        onTachy={() => goStep(STEPS.PULSE_TACHYCARDIA)}
        onMI={() => goStep(STEPS.PULSE_MI)}
        onArrest={() => goStep(STEPS.START_CPR)}
      />;

    case STEPS.TERMINATED:
      return <TerminatedStep onDone={onNavigateHistory} />;

    default:
      return null;
  }
}

// Witnessed/bystander answers only matter while this card is on screen —
// they are written to the patient record on submit, and there is no
// navigation path back to this step.
function CallForHelpStep({ onLog, onGoStep }) {
  const [witnessed, setWitnessed] = useState(null);
  const [bystanderCPR, setBystanderCPR] = useState(null);

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
          onLog('other', '📞 Help activated', { witnessed, bystanderCPR });
          useCaseStore.getState().updatePatient('witnessed', witnessed);
          useCaseStore.getState().updatePatient('bystanderCPR', bystanderCPR);
          onGoStep(STEPS.CHECK_PULSE);
        }}>📞 Help Activated → Check Pulse</BigButton>
      </div>
    </StepCard>
  );
}
