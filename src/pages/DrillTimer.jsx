import { useState, useEffect, useRef } from 'react';
import { playMetronomeClick, playBeep } from '../utils/sound';
import CircularTimer from '../components/CircularTimer';

// Drill Timer — practice CPR skills without a case
// Practice: compression rate, 30:2 timing, pulse check speed
export default function DrillTimer() {
  const [mode, setMode] = useState(null); // null | 'compression' | '30_2' | 'pulse_check'
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [bpm, setBpm] = useState(110);
  const intervalRef = useRef(null);
  const metronomeRef = useRef(null);

  // Timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Metronome for compression practice
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
      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20">
        <h1 className="text-2xl font-bold text-text-primary">🏋️ Drill Timer</h1>
        <p className="text-sm text-text-muted">Practice CPR skills without starting a case</p>

        <div className="space-y-3">
          <button onClick={() => setMode('compression')}
            className="w-full glass-card !p-4 text-left">
            <div className="text-lg font-bold text-text-primary">🫀 Compression Rate</div>
            <div className="text-xs text-text-muted">Practice 100-120/min with metronome</div>
          </button>

          <button onClick={() => setMode('30_2')}
            className="w-full glass-card !p-4 text-left">
            <div className="text-lg font-bold text-text-primary">🫁 30:2 Timing</div>
            <div className="text-xs text-text-muted">Practice 30 compressions + 2 breaths cycle</div>
          </button>

          <button onClick={() => setMode('pulse_check')}
            className="w-full glass-card !p-4 text-left">
            <div className="text-lg font-bold text-text-primary">⏱️ Pulse Check</div>
            <div className="text-xs text-text-muted">Practice checking pulse within 10 seconds</div>
          </button>
        </div>
      </div>
    );
  }

  // Compression practice
  if (mode === 'compression') {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4 text-center pb-20">
        <h1 className="text-xl font-bold text-text-primary">🫀 Compression Rate Practice</h1>

        <CircularTimer value={elapsed % 120} max={120} size={180} strokeWidth={12}
          color={running ? 'stroke-success' : 'stroke-bg-tertiary'}>
          <div className="text-4xl font-mono font-black text-text-primary">{count}</div>
          <div className="text-xs text-text-muted">compressions</div>
        </CircularTimer>

        <div className="glass-card !p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Rate: {bpm} bpm</span>
            <span className="text-xs text-text-muted">Target: 100-120</span>
          </div>
          <input type="range" min={80} max={140} value={bpm} onChange={e => setBpm(parseInt(e.target.value))}
            className="w-full accent-success" />
        </div>

        <div className="text-sm text-text-muted">
          Actual rate: {elapsed > 0 ? Math.round((count / elapsed) * 60) : 0} /min
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setRunning(!running); }} className={`btn-action py-4 text-sm font-bold ${running ? 'btn-danger' : 'btn-success'}`}>
            {running ? '⏸ Stop' : '▶️ Start'}
          </button>
          <button onClick={reset} className="btn-action btn-ghost py-4 text-sm font-bold">🔄 Reset</button>
        </div>

        <button onClick={() => { reset(); setMode(null); }} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  // 30:2 practice
  if (mode === '30_2') {
    const cyclePos = count % 32; // 30 compressions + 2 breaths
    const isBreathPhase = cyclePos >= 30;
    const cycleCount = Math.floor(count / 32);

    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4 text-center pb-20">
        <h1 className="text-xl font-bold text-text-primary">🫁 30:2 Timing Practice</h1>

        <div className={`text-6xl font-mono font-black ${isBreathPhase ? 'text-info animate-pulse' : 'text-success'}`}>
          {isBreathPhase ? '🫁 BREATHE' : cyclePos + 1}
        </div>
        <div className="text-sm text-text-muted">
          {isBreathPhase ? `Give 2 breaths (${cyclePos - 29}/2)` : `Compression ${cyclePos + 1}/30`}
        </div>
        <div className="text-xs text-text-muted">Cycles completed: {cycleCount}</div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => {
            if (!running) setRunning(true);
            setCount(prev => prev + 1);
            if (!isBreathPhase) playMetronomeClick();
            else playBeep(523, 0.2, 0.3);
          }} className={`btn-action py-6 text-lg font-bold ${isBreathPhase ? 'btn-info' : 'btn-success'}`}>
            {isBreathPhase ? '🫁 Breath' : '🫀 Press'}
          </button>
          <button onClick={reset} className="btn-action btn-ghost py-6 text-sm font-bold">🔄 Reset</button>
        </div>

        <button onClick={() => { reset(); setMode(null); }} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  // Pulse check practice
  if (mode === 'pulse_check') {
    const overTime = elapsed > 10;

    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4 text-center pb-20">
        <h1 className="text-xl font-bold text-text-primary">⏱️ Pulse Check Practice</h1>
        <p className="text-xs text-text-muted">Target: ≤10 seconds</p>

        <CircularTimer value={Math.min(elapsed, 10)} max={10} size={200} strokeWidth={14}
          color={overTime ? 'stroke-danger' : elapsed > 7 ? 'stroke-warning' : 'stroke-success'}
          alert={overTime}>
          <div className={`text-5xl font-mono font-black ${overTime ? 'text-danger' : 'text-success'}`}>{elapsed}s</div>
          <div className="text-xs text-text-muted">{overTime ? 'TOO LONG!' : 'checking...'}</div>
        </CircularTimer>

        <div className="grid grid-cols-2 gap-3">
          {!running ? (
            <button onClick={() => { setRunning(true); setElapsed(0); }}
              className="btn-action btn-success py-4 text-sm font-bold col-span-2">
              ▶️ Start Pulse Check
            </button>
          ) : (
            <>
              <button onClick={() => { setRunning(false); }}
                className="btn-action btn-info py-4 text-sm font-bold">
                ✅ Pulse Found ({elapsed}s)
              </button>
              <button onClick={() => { setRunning(false); }}
                className="btn-action btn-danger py-4 text-sm font-bold">
                ❌ No Pulse ({elapsed}s)
              </button>
            </>
          )}
        </div>

        {!running && elapsed > 0 && (
          <div className={`glass-card !p-3 ${elapsed <= 10 ? 'border-success/30' : 'border-danger/30'} border`}>
            <div className={`text-sm font-bold ${elapsed <= 10 ? 'text-success' : 'text-danger'}`}>
              {elapsed <= 7 ? '🏆 Excellent!' : elapsed <= 10 ? '✅ Good — within 10s' : `⚠️ Too slow (${elapsed}s) — practice more`}
            </div>
          </div>
        )}

        <button onClick={() => { reset(); }} className="btn-action btn-ghost py-3 text-sm">🔄 Try Again</button>
        <button onClick={() => { reset(); setMode(null); }} className="text-text-muted text-xs underline">← Back</button>
      </div>
    );
  }

  return null;
}
