import { useState, useEffect, useRef } from 'react';
import { playMetronomeClick, playBeep } from '../utils/sound';
import CircularTimer from '../components/CircularTimer';
import {
  HeartPulse, Wind, Timer, Play, Pause, RefreshCw, ChevronLeft,
  Check, X, Trophy, Activity,
} from '../components/ui/Icon';

export default function DrillTimer() {
  const [mode, setMode] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [bpm, setBpm] = useState(110);
  const intervalRef = useRef(null);
  const metronomeRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (running && mode === 'compression') {
      const ms = Math.round(60000 / bpm);
      metronomeRef.current = setInterval(() => {
        playMetronomeClick();
        setCount(prev => prev + 1);
      }, ms);
    } else {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    }
    return () => { if (metronomeRef.current) clearInterval(metronomeRef.current); };
  }, [running, mode, bpm]);

  const reset = () => { setRunning(false); setElapsed(0); setCount(0); };

  if (!mode) {
    return (
      <div className="page-container space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 inline-flex items-center justify-center bg-success/15 text-success"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Activity size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-title text-text-primary">Drill Timer</h1>
            <p className="text-caption text-text-muted">Practice CPR skills without a case</p>
          </div>
        </div>

        <div className="space-y-2">
          <DrillChoice onClick={() => setMode('compression')} Icon={HeartPulse} tone="danger"
            title="Compression Rate" sub="Practice 100-120/min with metronome" />
          <DrillChoice onClick={() => setMode('30_2')} Icon={Wind} tone="info"
            title="30:2 Timing" sub="Practice 30 compressions + 2 breaths cycle" />
          <DrillChoice onClick={() => setMode('pulse_check')} Icon={Timer} tone="warning"
            title="Pulse Check" sub="Practice checking pulse within 10 seconds" />
        </div>
      </div>
    );
  }

  if (mode === 'compression') {
    return (
      <div className="page-container space-y-4 text-center">
        <PageTitle Icon={HeartPulse} text="Compression Rate Practice" />

        <CircularTimer value={elapsed % 120} max={120} size={180} strokeWidth={12}
          color={running ? 'stroke-success' : 'stroke-bg-tertiary'}>
          <div className="text-numeric text-4xl text-text-primary">{count}</div>
          <div className="text-caption text-text-muted">compressions</div>
        </CircularTimer>

        <div className="dash-card !p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption text-text-muted">Rate: <span className="font-mono font-bold text-text-primary">{bpm}</span> bpm</span>
            <span className="badge bg-success/15 text-success">Target 100–120</span>
          </div>
          <input type="range" min={80} max={140} value={bpm} onChange={e => setBpm(parseInt(e.target.value))}
            className="w-full accent-success" />
        </div>

        <div className="text-caption text-text-muted">
          Actual rate: <span className="font-mono font-bold text-text-primary">{elapsed > 0 ? Math.round((count / elapsed) * 60) : 0}</span> /min
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setRunning(!running)} className={`btn btn-lg btn-block ${running ? 'btn-danger' : 'btn-success'}`}>
            {running ? <><Pause size={16} strokeWidth={2.4} /> Stop</> : <><Play size={16} strokeWidth={2.4} /> Start</>}
          </button>
          <button onClick={reset} className="btn btn-ghost btn-lg btn-block">
            <RefreshCw size={16} strokeWidth={2} /> Reset
          </button>
        </div>

        <BackButton onClick={() => { reset(); setMode(null); }} />
      </div>
    );
  }

  if (mode === '30_2') {
    const cyclePos = count % 32;
    const isBreathPhase = cyclePos >= 30;
    const cycleCount = Math.floor(count / 32);

    return (
      <div className="page-container space-y-4 text-center">
        <PageTitle Icon={Wind} text="30:2 Timing Practice" />

        <div className={`text-numeric text-6xl ${isBreathPhase ? 'text-info animate-pulse' : 'text-success'}`}>
          {isBreathPhase ? 'BREATHE' : cyclePos + 1}
        </div>
        <div className="text-caption text-text-muted">
          {isBreathPhase ? `Give 2 breaths (${cyclePos - 29}/2)` : `Compression ${cyclePos + 1}/30`}
        </div>
        <div className="text-caption text-text-muted">Cycles completed: <span className="font-mono font-bold text-text-primary">{cycleCount}</span></div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => {
            if (!running) setRunning(true);
            setCount(prev => prev + 1);
            if (!isBreathPhase) playMetronomeClick();
            else playBeep(523, 0.2, 0.3);
          }} className={`btn btn-xl btn-block ${isBreathPhase ? 'btn-info' : 'btn-success'}`}>
            {isBreathPhase ? <><Wind size={20} strokeWidth={2.4} /> Breath</> : <><HeartPulse size={20} strokeWidth={2.4} /> Press</>}
          </button>
          <button onClick={reset} className="btn btn-ghost btn-xl btn-block">
            <RefreshCw size={18} strokeWidth={2} /> Reset
          </button>
        </div>

        <BackButton onClick={() => { reset(); setMode(null); }} />
      </div>
    );
  }

  if (mode === 'pulse_check') {
    const overTime = elapsed > 10;

    return (
      <div className="page-container space-y-4 text-center">
        <PageTitle Icon={Timer} text="Pulse Check Practice" />
        <p className="text-caption text-text-muted">Target: ≤10 seconds</p>

        <CircularTimer value={Math.min(elapsed, 10)} max={10} size={200} strokeWidth={14}
          color={overTime ? 'stroke-danger' : elapsed > 7 ? 'stroke-warning' : 'stroke-success'}
          alert={overTime}>
          <div className={`text-numeric text-5xl ${overTime ? 'text-danger' : 'text-success'}`}>{elapsed}s</div>
          <div className="text-caption text-text-muted">{overTime ? 'TOO LONG!' : 'checking…'}</div>
        </CircularTimer>

        <div className="grid grid-cols-2 gap-3">
          {!running ? (
            <button onClick={() => { setRunning(true); setElapsed(0); }}
              className="btn btn-success btn-lg btn-block col-span-2">
              <Play size={16} strokeWidth={2.4} /> Start Pulse Check
            </button>
          ) : (
            <>
              <button onClick={() => setRunning(false)} className="btn btn-info btn-lg btn-block">
                <Check size={16} strokeWidth={2.4} /> Pulse Found ({elapsed}s)
              </button>
              <button onClick={() => setRunning(false)} className="btn btn-danger btn-lg btn-block">
                <X size={16} strokeWidth={2.4} /> No Pulse ({elapsed}s)
              </button>
            </>
          )}
        </div>

        {!running && elapsed > 0 && (
          <div className={`dash-card !p-3 border ${elapsed <= 10 ? 'border-success/40' : 'border-danger/40'}`}>
            <div className={`text-body-strong inline-flex items-center gap-1.5 ${elapsed <= 10 ? 'text-success' : 'text-danger'}`}>
              {elapsed <= 7 ? (
                <><Trophy size={16} strokeWidth={2.4} /> Excellent!</>
              ) : elapsed <= 10 ? (
                <><Check size={16} strokeWidth={2.4} /> Good — within 10s</>
              ) : (
                <><X size={16} strokeWidth={2.4} /> Too slow ({elapsed}s) — practice more</>
              )}
            </div>
          </div>
        )}

        <button onClick={reset} className="btn btn-ghost btn-block">
          <RefreshCw size={16} strokeWidth={2} /> Try Again
        </button>
        <BackButton onClick={() => { reset(); setMode(null); }} />
      </div>
    );
  }

  return null;
}

function PageTitle({ Icon, text }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 text-headline text-text-primary">
      <Icon size={20} strokeWidth={2.2} className="text-text-secondary" />
      {text}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-text-muted text-caption mx-auto hover:text-text-primary">
      <ChevronLeft size={14} strokeWidth={2.2} /> Back
    </button>
  );
}

function DrillChoice({ onClick, Icon, tone, title, sub }) {
  const tones = {
    danger: 'bg-danger/12 text-danger',
    info: 'bg-info/12 text-info',
    warning: 'bg-warning/12 text-warning',
    success: 'bg-success/12 text-success',
  };
  return (
    <button onClick={onClick}
      className="w-full dash-card !p-4 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3">
      <div className={`w-12 h-12 inline-flex items-center justify-center ${tones[tone]} shrink-0`}
        style={{ borderRadius: 'var(--radius-md)' }}>
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-headline text-text-primary">{title}</div>
        <div className="text-caption text-text-muted">{sub}</div>
      </div>
    </button>
  );
}
