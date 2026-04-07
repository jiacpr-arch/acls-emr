import { useState, useEffect, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { playBeep } from '../utils/sound';

// SimulationEngine v2 — replaces basic ScenarioEngine
// Features: patient status changes, team feedback, monitor sounds, typing effect

// Monitor beep sound (simulates heart monitor)
function useMonitorBeep(hr, enabled) {
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!enabled || !hr || hr <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const ms = Math.round(60000 / hr);
    intervalRef.current = setInterval(() => {
      playBeep(880, 0.05, 0.1); // short quiet beep
    }, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hr, enabled]);
}

// Typing effect for scenario text
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

// Patient vital signs display
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

// Team feedback message
function TeamMessage({ message, type = 'info' }) {
  const colors = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${colors[type]}`}>
      <span className="shrink-0">💬</span>
      <span>{message}</span>
    </div>
  );
}

export default function SimulationEngine({ scenario, mode, onComplete, onStaffTakeover }) {
  const isLearning = mode === 'learning';
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0, reactions: [], steps: [] });
  const [wrongCount, setWrongCount] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState(null);
  const [teamMessages, setTeamMessages] = useState([]);
  const [patientVitals, setPatientVitals] = useState(scenario.steps[0]?.vitals || { hr: 0, bp: '0/0', spo2: 0, etco2: 0 });
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentStep = scenario.steps[currentStepIdx];
  const maxWrong = 4;
  const events = useCaseStore(s => s.events);

  // Monitor beep based on patient HR
  useMonitorBeep(patientVitals.hr, soundEnabled);

  // Update vitals when step changes
  useEffect(() => {
    if (currentStep?.vitals) {
      setPatientVitals(prev => ({ ...prev, ...currentStep.vitals }));
    }
  }, [currentStepIdx]);

  // Listen for correct actions
  useEffect(() => {
    if (!currentStep || completed) return;
    const lastEvent = events[0];
    if (!lastEvent) return;

    const eventType = lastEvent.type?.toLowerCase() || '';
    const eventCategory = lastEvent.category || '';

    const isCorrect = currentStep.correctActions?.some(action => {
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
      if (a.includes('nihss') && eventType.includes('nihss')) return true;
      if (a.includes('ct') && eventType.includes('ct')) return true;
      if (a.includes('tpa') && eventType.includes('tpa')) return true;
      if (a.includes('post_rosc') && eventType.includes('post-rosc')) return true;
      if (a.includes('switch_compressor') && eventType.includes('switch')) return true;
      return false;
    });

    if (isCorrect) {
      const reactionTime = (Date.now() - stepStartTime) / 1000;

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
    }
  }, [events.length]);

  if (!currentStep) return null;

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
            <div key={i} className="text-[10px] text-text-secondary">💬 {msg}</div>
          ))}
        </div>
      )}

      {/* Learning hint */}
      {isLearning && currentStep.hint_th && (
        <div className="px-3 py-1.5 bg-blue-50 text-[11px] text-blue-700">
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
        <div className="flex items-center justify-center gap-4 px-4 py-1 bg-bg-tertiary/30 text-[10px] text-text-muted">
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
