import { useState, useEffect, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { playBeep, playShockSound, playWarningBeep } from '../utils/sound';
import ScenarioStage from './scenario/ScenarioStage';
import { deriveStageState, autoSpeaker } from './scenario/stageState';
import { useScenarioStageStore } from '../stores/scenarioStageStore';

// SimulationEngine v3 — cinematic stage (Code Blue Sim style) ครอบหน้า Recording จริง
// - โจทย์แสดงเป็นฉาก: ตัวละคร + จอ ECG + เอฟเฟกต์ (ScenarioStage)
// - นักเรียนยังกด record บนหน้า Recording จริง → engine ฟัง caseStore.events
// - scenario.visual === false → กลับไปใช้ banner ข้อความแบบเดิม (legacy)

// Monitor beep sound (simulates heart monitor)
// ปิดขณะ CPR active — เสียงจะชนกับ metronome ของหน้า Recording
function useMonitorBeep(hr, enabled) {
  const cprActive = useTimerStore(s => s.cprActive);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!enabled || !hr || hr <= 0 || cprActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const ms = Math.round(60000 / hr);
    intervalRef.current = setInterval(() => {
      playBeep(880, 0.05, 0.1); // short quiet beep
    }, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hr, enabled, cprActive]);
}

// Typing effect for scenario text (legacy banner)
function TypeWriter({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}{!done && <span className="animate-pulse">|</span>}</span>;
}

// Patient vital signs display (legacy banner)
function PatientMonitor({ vitals, className = '' }) {
  if (!vitals) return null;
  return (
    <div className={`grid grid-cols-4 gap-1 ${className}`}>
      {vitals.hr !== undefined && (
        <div className="stat-box !p-1.5">
          <div className={`stat-value text-sm ${vitals.hr === 0 ? 'text-danger' : vitals.hr > 150 ? 'text-danger' : vitals.hr < 50 ? 'text-warning' : 'text-success'}`}>{vitals.hr || '--'}</div>
          <div className="stat-label">HR</div>
        </div>
      )}
      {vitals.bp && (
        <div className="stat-box !p-1.5">
          <div className={`stat-value text-sm ${parseInt(vitals.bp) < 90 ? 'text-danger' : 'text-text-primary'}`}>{vitals.bp || '--/--'}</div>
          <div className="stat-label">BP</div>
        </div>
      )}
      {vitals.spo2 !== undefined && (
        <div className="stat-box !p-1.5">
          <div className={`stat-value text-sm ${vitals.spo2 < 94 ? 'text-danger' : 'text-success'}`}>{vitals.spo2 || '--'}%</div>
          <div className="stat-label">SpO₂</div>
        </div>
      )}
      {vitals.etco2 !== undefined && (
        <div className="stat-box !p-1.5">
          <div className={`stat-value text-sm ${vitals.etco2 > 40 ? 'text-success' : vitals.etco2 < 10 ? 'text-danger' : 'text-text-primary'}`}>{vitals.etco2 || '--'}</div>
          <div className="stat-label">EtCO₂</div>
        </div>
      )}
    </div>
  );
}

// รอบ CPR จริง (2 นาที ตาม timerStore.cycleDuration) ที่ต้องครบก่อนจะ "shock ซ้ำ/check
// rhythm ซ้ำ/ให้ epi ซ้ำ" ถือว่าถูก — กันนักเรียนกดข้ามเร็วกว่าสถานการณ์จริง (เฉพาะเคส
// cardiac_arrest, ให้ grace 10 วิสำหรับ lag การกดปุ่มจริง)
const CYCLE_GATE_SECONDS = 110;
// token พวกนี้แทน "รอบถัดไป" เท่านั้น (ไม่ใช่ shock/epi ครั้งแรกซึ่งไม่ต้องรอ)
function isCycleGatedToken(token) {
  return token === 'defib' || token === 'check_pulse' || token === 'epi_repeat';
}

// เทียบ event จริงจาก Recording กับ correctActions ของ step — คืน action token ที่ตรง
// (ไม่ใช่แค่ boolean) เพื่อให้รู้ว่าต้องเช็ค cycle-gate จาก token ไหน
function matchedCorrectAction(step, eventType, eventCategory) {
  return step.correctActions?.find(action => {
    const a = action.toLowerCase();
    if (a.includes('scene_safety') && eventType.includes('scene safe')) return true;
    if (a.includes('check_response') && (eventType.includes('unresponsive') || eventType.includes('responsive'))) return true;
    if (a.includes('call') && eventType.includes('help activated')) return true;
    if (a.includes('start_cpr') && eventType.includes('cpr started')) return true;
    if (a.includes('defib') && eventCategory === 'shock') return true;
    if (a.includes('epi') && eventType.includes('epinephrine')) return true;
    if (a.includes('resume_cpr') && eventType.includes('cpr')) return true;
    if (a.includes('check_pulse') && (eventType.includes('pulse') || eventType.includes('rhythm check'))) return true;
    if (a.includes('rosc') && eventType.includes('rosc')) return true;
    if (a.includes('amiodarone') && eventType.includes('amiodarone')) return true;
    if (a.includes('atropine') && eventType.includes('atropine')) return true;
    if (a.includes('vagal') && eventType.includes('vagal')) return true;
    if (a.includes('adenosine') && eventType.includes('adenosine')) return true;
    if (a.includes('monitor') && (eventType.includes('monitor') || eventType.includes('assessment'))) return true;
    if (a.includes('find_cause') && (eventType.includes('cause') || eventType.includes('h&t') || eventType.includes('corrected'))) return true;
    if (a.includes('assess') && (eventType.includes('stable') || eventType.includes('unstable') || eventType.includes('acs') || eventType.includes('fast'))) return true;
    if (a.includes('mona') && (eventType.includes('aspirin') || eventType.includes('ntg'))) return true;
    if (a.includes('cath') && eventType.includes('cath')) return true;
    if (a.includes('heparin') && eventType.includes('heparin')) return true;
    if (a.includes('antiplatelet') && (eventType.includes('clopidogrel') || eventType.includes('ticagrelor'))) return true;
    if (a.includes('dtx') && eventType.includes('dtx')) return true;
    if (a.includes('nihss') && eventType.includes('nihss')) return true;
    if (a.includes('ct') && eventType.includes('ct')) return true;
    if (a.includes('tpa') && eventType.includes('tpa')) return true;
    if (a.includes('post_rosc') && eventType.includes('post-rosc')) return true;
    if (a.includes('switch_compressor') && eventType.includes('switch')) return true;
    return false;
  }) || null;
}

// เทียบ event กับ wrongActions (key สั้นๆ ใน scenarios.js เช่น 'defib', 'epi')
const WRONG_MATCHERS = {
  defib: (type, cat) => cat === 'shock',
  epi: (type) => type.includes('epinephrine'),
  amiodarone: (type) => type.includes('amiodarone'),
  atropine: (type) => type.includes('atropine'),
  adenosine: (type) => type.includes('adenosine'),
  tpa: (type) => type.includes('tpa') || type.includes('alteplase'),
};
function matchWrongAction(step, eventType, eventCategory) {
  const wrongActions = step.wrongActions || {};
  for (const key of Object.keys(wrongActions)) {
    const matcher = WRONG_MATCHERS[key];
    const hit = matcher ? matcher(eventType, eventCategory) : eventType.includes(key);
    if (hit) return { key, message: wrongActions[key] };
  }
  return null;
}

export default function SimulationEngine({ scenario, mode, onComplete, onStaffTakeover }) {
  const isLearning = mode === 'learning';
  const useCinematic = scenario.visual !== false; // escape hatch ต่อ scenario
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0, reactions: [], steps: [] });
  const [wrongCount, setWrongCount] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState(null);
  const [teamMessages, setTeamMessages] = useState([]);
  const [patientVitals, setPatientVitals] = useState(scenario.steps[0]?.vitals || { hr: 0, bp: '0/0', spo2: 0, etco2: 0 });
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // ปฏิกิริยาต่อการ record ล่าสุด — แสดงชั่วคราวบนฉากแล้วเคลียร์กลับเป็นโจทย์
  const [lastResult, setLastResult] = useState(null); // {kind, message, pose, fx, at}
  // จอเตี้ย (มือถือแนวนอน/จอเล็ก) → เริ่มแบบย่อ ให้ปุ่ม record ใช้พื้นที่เต็ม
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(max-height: 640px)').matches,
  );
  const reactionTimerRef = useRef(null);
  // กัน effect (key ด้วย events.length) ประมวลผล event เดิมซ้ำตอน re-render
  const processedCountRef = useRef(null);

  const currentStep = scenario.steps[currentStepIdx];
  const maxWrong = 4;
  const events = useCaseStore(s => s.events);

  // Monitor beep based on patient HR
  useMonitorBeep(patientVitals.hr, soundEnabled);

  // Update vitals when step changes + เสียง alarm ตอนเจอ rhythm วิกฤตใหม่
  useEffect(() => {
    if (currentStep?.vitals) {
      setPatientVitals(prev => ({ ...prev, ...currentStep.vitals }));
    }
    if (useCinematic && soundEnabled && currentStepIdx > 0) {
      const fx = currentStep?.fx
        || (['vf', 'pvt', 'vt', 'asystole', 'pea'].includes(currentStep?.ekg || currentStep?.rhythm) ? 'alarm' : null);
      if (fx === 'alarm') playWarningBeep();
    }
  }, [currentStepIdx]);

  // publish สถานะฉากลง store (จุด broadcast สำหรับโหมดสองจอในอนาคต)
  useEffect(() => {
    useScenarioStageStore.getState().setStage({
      scenarioId: scenario.id, mode, stepIndex: currentStepIdx, lastResult, completed,
    });
  }, [scenario.id, mode, currentStepIdx, lastResult, completed]);
  useEffect(() => () => {
    useScenarioStageStore.getState().reset();
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
  }, []);

  // แสดงปฏิกิริยาชั่วคราว แล้วกลับเป็นโจทย์ของ step ปัจจุบัน
  const showReaction = (result, holdMs) => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    setLastResult(result);
    reactionTimerRef.current = setTimeout(() => setLastResult(null), holdMs);
  };

  // Listen for real recording events → correct / wrong
  useEffect(() => {
    if (!currentStep || completed) return;
    // init: ไม่นับ events ที่มีอยู่ก่อน scenario เริ่ม
    if (processedCountRef.current === null) {
      processedCountRef.current = events.length;
      return;
    }
    if (events.length <= processedCountRef.current) return;
    processedCountRef.current = events.length;

    const lastEvent = events[0];
    if (!lastEvent) return;

    const eventType = lastEvent.type?.toLowerCase() || '';
    const eventCategory = lastEvent.category || '';

    const matchedAction = matchedCorrectAction(currentStep, eventType, eventCategory);

    // ต้องรอรอบ CPR จริงให้ครบก่อน (เฉพาะ cardiac_arrest) — กดเร็วกว่านี้ = ขัดจังหวะ CPR จริง
    // ใช้เวลาจริง (Date.now()) นับตั้งแต่ step ปัจจุบันเริ่ม (คือจังหวะที่รอบ CPR รอบนี้เริ่ม
    // จริงๆ — ไม่ว่ารอบนี้จะเกิดจาก shock, epi, หรือ resume CPR ก็ตาม) ไม่ผูกกับ timerStore's
    // cycleElapsed โดยตรง เพราะค่านั้น reset เฉพาะตอน shock (resetCycle ใน ShockControls/AEDPanel)
    // จึงไม่ครอบคลุมรอบ non-shockable (asystole/PEA) — stepStartTime ครอบคลุมทุกกรณีสม่ำเสมอกว่า
    if (matchedAction && scenario.category === 'cardiac_arrest' && isCycleGatedToken(matchedAction)) {
      const elapsedSinceCycle = (Date.now() - stepStartTime) / 1000;
      if (elapsedSinceCycle < CYCLE_GATE_SECONDS) {
        const remain = Math.max(1, Math.ceil(CYCLE_GATE_SECONDS - elapsedSinceCycle));
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        setScore(prev => ({
          ...prev,
          wrong: prev.wrong + 1,
          total: prev.total + 1,
          steps: [...prev.steps, { idx: currentStepIdx, correct: false, action: lastEvent.type }],
        }));

        if (soundEnabled) playBeep(200, 0.3, 0.3);
        const earlyMsg = isLearning
          ? `ยังไม่ครบรอบ CPR 2 นาที (เหลืออีก ${remain} วิ) — ห้ามขัดจังหวะการกดหน้าอกก่อนเวลา`
          : 'ทีมขัดจังหวะ CPR ก่อนครบรอบ — ทบทวนจังหวะ CPR ก่อนบันทึกครั้งถัดไป';
        showReaction({ kind: 'wrong', message: earlyMsg, at: Date.now() }, 2600);

        if (isLearning) {
          setFeedback({ correct: false, message: earlyMsg });
          setTimeout(() => setFeedback(null), 3000);
        }

        if (newWrong >= maxWrong) onStaffTakeover(score);
        return; // ยังไม่เลื่อน step — ให้กด CPR ต่อจนครบรอบแล้วค่อยลองใหม่
      }
    }

    if (matchedAction) {
      const reactionTime = (Date.now() - stepStartTime) / 1000;
      const isShock = eventCategory === 'shock';

      // Update vitals — patient improves
      setPatientVitals(prev => ({
        hr: prev.hr === 0 ? 0 : Math.min(prev.hr + 5, 100),
        bp: prev.bp === '0/0' ? '0/0' : '110/70',
        spo2: Math.min((prev.spo2 || 90) + 2, 99),
        etco2: (prev.etco2 || 15) + 3,
      }));

      // Team feedback
      const teamMsg = currentStep.teamFeedback || `"Roger, ${lastEvent.type?.replace(/[💉💊⚡🫀📈🌬️🔍📊✅❌📞🏥🛡️🖥️👋📋🕊️💚]/g, '').trim()} done"`;
      setTeamMessages(prev => [teamMsg, ...prev].slice(0, 5));

      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
        reactions: [...prev.reactions, reactionTime],
        steps: [...prev.steps, { idx: currentStepIdx, correct: true, time: reactionTime, action: lastEvent.type }],
      }));

      if (soundEnabled) {
        if (isShock) playShockSound();
        else playBeep(1200, 0.12, 0.22);
      }
      // exam: flash เบาๆ พอ ไม่มีบทพูดชม (ป้องกันใบ้คำตอบ step ถัดไป)
      showReaction({
        kind: 'correct',
        message: isLearning ? (currentStep.onCorrect?.line_th || currentStep.teamFeedback || null) : null,
        // บทพูดปฏิกิริยาเป็นของ step ที่เพิ่งตอบ — ล็อกผู้พูดของ step นี้ไว้
        speaker: currentStep.speaker || autoSpeaker(currentStep),
        pose: currentStep.onCorrect?.pose || 'happy',
        fx: isShock ? 'shock' : null,
        at: Date.now(),
      }, isLearning ? 1800 : 900);

      if (isLearning) {
        setFeedback({ correct: true, message: currentStep.hint_th || 'Correct!' });
        setTimeout(() => setFeedback(null), 2000);
      }

      if (currentStepIdx < scenario.steps.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
        setStepStartTime(Date.now());
      } else {
        setCompleted(true);
        onComplete(score);
      }
      return;
    }

    // ไม่ตรง correct → เช็ค wrongActions (เดิมประกาศไว้ใน data แต่ไม่เคยถูกต่อสาย)
    const wrong = matchWrongAction(currentStep, eventType, eventCategory);
    if (wrong) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setScore(prev => ({
        ...prev,
        wrong: prev.wrong + 1,
        total: prev.total + 1,
        steps: [...prev.steps, { idx: currentStepIdx, correct: false, action: lastEvent.type }],
      }));

      if (soundEnabled) playBeep(200, 0.3, 0.3);
      showReaction({
        kind: 'wrong',
        // exam: ไม่เฉลยเหตุผล — แค่บอกว่าทีมลังเล
        message: isLearning ? wrong.message : 'ทีมลังเล… ทบทวน algorithm ก่อนบันทึกครั้งถัดไป',
        at: Date.now(),
      }, 2600);

      if (isLearning) {
        setFeedback({ correct: false, message: wrong.message });
        setTimeout(() => setFeedback(null), 3000);
      }

      if (newWrong >= maxWrong) {
        onStaffTakeover(score);
      }
    }
  }, [events.length]);

  if (!currentStep) return null;

  // ============ Cinematic stage (default) ============
  if (useCinematic) {
    const stage = deriveStageState(scenario, currentStepIdx, lastResult, patientVitals);
    return (
      <div className="shrink-0 z-40">
        <ScenarioStage
          stage={stage}
          mode={mode}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(s => !s)}
        />
        {/* Score bar (learning only) */}
        {isLearning && !collapsed && (
          <div className="flex items-center justify-center gap-4 px-4 py-1 bg-bg-tertiary/30 text-3xs text-text-muted">
            <span>✅ {score.correct}</span>
            <span>❌ {score.wrong}</span>
            <span>Avg: {score.reactions.length > 0 ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1) : '-'}s</span>
          </div>
        )}
      </div>
    );
  }

  // ============ Legacy text banner (scenario.visual === false) ============
  return (
    <div className="shrink-0 z-40">
      {/* Scenario bar */}
      <div className={`px-4 py-3 ${isLearning ? 'bg-blue-600' : 'bg-purple'} text-white`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            {isLearning ? '📚 LEARNING' : '📝 EXAM'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
              {currentStepIdx + 1}/{scenario.steps.length}
            </span>
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-xs opacity-70">{soundEnabled ? '🔊' : '🔇'}</button>
          </div>
        </div>

        {/* Scenario text with typing effect */}
        <div className="text-sm leading-relaxed font-medium min-h-[2.5rem]">
          {isLearning ? (
            <TypeWriter text={currentStep.scenario_th} speed={25} />
          ) : (
            currentStep.scenario_th
          )}
        </div>

        {/* EKG indicator */}
        {currentStep.ekg && (
          <div className="mt-2 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-bold">
            📈 EKG: {currentStep.ekg.toUpperCase()}
          </div>
        )}

        {/* Progress bar */}
        <div className="flex gap-1 mt-2">
          {scenario.steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${
              i < currentStepIdx ? 'bg-white' : i === currentStepIdx ? 'bg-white/60 animate-pulse' : 'bg-white/20'
            }`} />
          ))}
        </div>
      </div>

      {/* Patient Monitor */}
      <PatientMonitor vitals={patientVitals} className="px-3 py-1.5 bg-black/90" />

      {/* Team feedback */}
      {teamMessages.length > 0 && (
        <div className="px-3 py-1.5 bg-bg-tertiary/30 space-y-1 max-h-[60px] overflow-hidden">
          {teamMessages.slice(0, 2).map((msg, i) => (
            <div key={i} className="text-3xs text-text-secondary">💬 {msg}</div>
          ))}
        </div>
      )}

      {/* Learning hint */}
      {isLearning && currentStep.hint_th && (
        <div className="px-3 py-1.5 bg-blue-50 text-2xs text-blue-700">
          💡 {currentStep.hint_th}
        </div>
      )}

      {/* Feedback popup */}
      {feedback && (
        <div className={`px-4 py-2 text-center text-sm font-bold ${
          feedback.correct ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {feedback.correct ? '✅ ' : '❌ '}{feedback.message}
        </div>
      )}

      {/* Score bar (learning only) */}
      {isLearning && (
        <div className="flex items-center justify-center gap-4 px-4 py-1 bg-bg-tertiary/30 text-3xs text-text-muted">
          <span>✅ {score.correct}</span>
          <span>❌ {score.wrong}</span>
          <span>Avg: {score.reactions.length > 0 ? (score.reactions.reduce((a, b) => a + b, 0) / score.reactions.length).toFixed(1) : '-'}s</span>
        </div>
      )}
    </div>
  );
}

// Re-export completion screens from old ScenarioEngine
export { StaffTakeover, ScenarioComplete } from './ScenarioEngine';
