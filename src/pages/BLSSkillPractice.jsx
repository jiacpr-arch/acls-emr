import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playMetronomeClick, playBeep } from '../utils/sound';
import { ChevronLeft, Play, Pause, RotateCcw, HeartPulse, Wind } from 'lucide-react';

const TARGET_RATE = 110;        // กลางช่วง 100–120
const RATE_LOW = 100;
const RATE_HIGH = 120;
const CYCLE_TARGET_SEC = 120;   // 2 นาที = 1 cycle เปลี่ยนคนกด
const BREATH_PAUSE_MS = 5000;   // pause หลังครบ 30 ครั้ง เพื่อช่วยหายใจ 2 ครั้ง

export default function BLSSkillPractice() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [rate, setRate] = useState(TARGET_RATE);     // bpm ที่ตั้งไว้
  const [tapCount, setTapCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [actualBpm, setActualBpm] = useState(null);
  const [ratio302, setRatio302] = useState(true);    // BLS-HCP default: 30:2 ช่วยหายใจ
  const [breathAlert, setBreathAlert] = useState(false);
  const [breathPauseStartedAt, setBreathPauseStartedAt] = useState(null);
  const [breathTickNow, setBreathTickNow] = useState(0);
  const breathPauseRef = useRef(false);
  const beatCountRef = useRef(0);
  const tapTimesRef = useRef([]);
  const elapsedTimerRef = useRef(null);
  const metronomeTimerRef = useRef(null);

  // Metronome — pause ทุก 30 ครั้ง 5 วินาทีเมื่อโหมด 30:2 เปิดอยู่
  useEffect(() => {
    if (!running || !metronomeOn) {
      clearInterval(metronomeTimerRef.current);
      return;
    }
    const intervalMs = 60000 / rate;
    metronomeTimerRef.current = setInterval(() => {
      if (breathPauseRef.current) return;
      playMetronomeClick();
      if (ratio302) {
        beatCountRef.current += 1;
        if (beatCountRef.current >= 30) {
          beatCountRef.current = 0;
          breathPauseRef.current = true;
          setBreathAlert(true);
          setBreathPauseStartedAt(Date.now());
          playBeep(523, 0.3, 0.3);
        }
      }
    }, intervalMs);
    return () => clearInterval(metronomeTimerRef.current);
  }, [running, metronomeOn, rate, ratio302]);

  // Resume after breath pause + tick clock for countdown display
  useEffect(() => {
    if (!breathPauseStartedAt) return;
    const iv = setInterval(() => {
      const now = Date.now();
      setBreathTickNow(now);
      if (now - breathPauseStartedAt >= BREATH_PAUSE_MS) {
        breathPauseRef.current = false;
        setBreathAlert(false);
        setBreathPauseStartedAt(null);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [breathPauseStartedAt]);

  // Reset beat count when ratio mode flips or run stops
  useEffect(() => {
    beatCountRef.current = 0;
    breathPauseRef.current = false;
    setBreathAlert(false);
    setBreathPauseStartedAt(null);
  }, [ratio302, running]);

  // Elapsed timer
  useEffect(() => {
    if (!running) {
      clearInterval(elapsedTimerRef.current);
      return;
    }
    elapsedTimerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(elapsedTimerRef.current);
  }, [running]);

  const handleTap = () => {
    if (!running) return;
    const now = performance.now();
    const tapTimes = [...tapTimesRef.current, now].slice(-8);
    tapTimesRef.current = tapTimes;
    setTapCount(c => c + 1);
    if (tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) intervals.push(tapTimes[i] - tapTimes[i - 1]);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setActualBpm(Math.round(60000 / avgInterval));
    }
  };

  const handleReset = () => {
    setRunning(false);
    setTapCount(0);
    setElapsed(0);
    setActualBpm(null);
    tapTimesRef.current = [];
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const bpmInZone = actualBpm != null && actualBpm >= RATE_LOW && actualBpm <= RATE_HIGH;
  const cycleProgress = Math.min((elapsed / CYCLE_TARGET_SEC) * 100, 100);
  const cycleDue = elapsed > 0 && elapsed % CYCLE_TARGET_SEC === 0;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur border-b border-bg-tertiary">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 inline-flex items-center justify-center hover:bg-bg-tertiary"
            style={{ borderRadius: 'var(--radius-full)' }} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="text-headline flex items-center gap-2">
            <HeartPulse size={20} className="text-info" />
            ฝึก CPR (Skill Practice)
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Description */}
        <div className="dash-card">
          <div className="text-sm text-text-secondary leading-relaxed">
            ฝึกอัตราการกดหน้าอก <b>100–120 ครั้ง/นาที</b> ตามมาตรฐาน BLS (ILCOR 2025)<br />
            กดปุ่ม <b>เริ่ม</b> เพื่อเปิด metronome → แตะปุ่มใหญ่ตามจังหวะที่กดจริง → ตรวจสอบ BPM ของตัวเอง<br />
            เปลี่ยนคนกดทุก <b>2 นาที</b> เพื่อรักษาคุณภาพ
          </div>
        </div>

        {/* Breath alert banner */}
        {breathAlert && (
          <div className="bg-info text-white text-center py-3 text-base font-bold inline-flex items-center justify-center gap-2 w-full animate-pulse"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <Wind size={18} /> ช่วยหายใจ 2 ครั้ง — หยุดกด {breathPauseStartedAt && (
              <span className="font-mono">
                {Math.max(0, Math.ceil((BREATH_PAUSE_MS - ((breathTickNow || breathPauseStartedAt) - breathPauseStartedAt)) / 1000))}s
              </span>
            )}
          </div>
        )}

        {/* 30:2 mode toggle */}
        <div className="dash-card">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex-1">
              <div className="text-sm font-semibold inline-flex items-center gap-2">
                <Wind size={16} className="text-info" /> โหมด 30:2 (ช่วยหายใจ)
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                BLS-HCP standard: หยุดกดทุก 30 ครั้ง เพื่อช่วยหายใจ 2 ครั้ง (ก่อนใส่ advanced airway)
              </div>
            </div>
            <input
              type="checkbox"
              checked={ratio302}
              onChange={(e) => setRatio302(e.target.checked)}
              className="w-5 h-5 accent-info"
            />
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="dash-card text-center">
            <div className="text-xs text-text-muted mb-1">เวลา</div>
            <div className="text-2xl font-bold tabular-nums">{fmtTime(elapsed)}</div>
          </div>
          <div className="dash-card text-center">
            <div className="text-xs text-text-muted mb-1">นับครั้ง</div>
            <div className="text-2xl font-bold tabular-nums">{tapCount}</div>
          </div>
          <div className={`dash-card text-center ${
            actualBpm == null ? '' : bpmInZone ? 'ring-2 ring-success' : 'ring-2 ring-danger'
          }`}>
            <div className="text-xs text-text-muted mb-1">BPM จริง</div>
            <div className={`text-2xl font-bold tabular-nums ${
              actualBpm == null ? 'text-text-muted' : bpmInZone ? 'text-success' : 'text-danger'
            }`}>
              {actualBpm ?? '—'}
            </div>
          </div>
        </div>

        {/* Cycle progress */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-secondary">รอบนี้ ({CYCLE_TARGET_SEC}s)</div>
            {cycleDue && (
              <div className="text-xs font-bold text-warning">⚠ เปลี่ยนคนกดได้แล้ว</div>
            )}
          </div>
          <div className="h-2 bg-bg-tertiary overflow-hidden" style={{ borderRadius: 'var(--radius-full)' }}>
            <div className="h-full bg-info transition-all"
              style={{ width: `${cycleProgress}%`, borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>

        {/* Big tap button */}
        <button
          onClick={handleTap}
          disabled={!running}
          className={`w-full py-12 text-2xl font-bold transition-all ${
            running
              ? 'bg-info text-white active:scale-95'
              : 'bg-bg-tertiary text-text-muted'
          }`}
          style={{ borderRadius: 'var(--radius-2xl)' }}
        >
          {running ? 'แตะตามจังหวะที่กด' : 'กดเริ่มก่อน'}
        </button>

        {/* Rate slider */}
        <div className="dash-card space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">Metronome BPM</div>
            <div className="text-lg font-bold tabular-nums">{rate}</div>
          </div>
          <input
            type="range"
            min={RATE_LOW}
            max={RATE_HIGH}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>{RATE_LOW}</span>
            <span>{RATE_HIGH}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setRunning(r => !r)}
            className={`py-4 font-semibold inline-flex items-center justify-center gap-2 ${
              running ? 'bg-warning text-white' : 'bg-success text-white'
            }`}
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            {running ? <><Pause size={18} /> หยุด</> : <><Play size={18} /> เริ่ม</>}
          </button>
          <button
            onClick={() => setMetronomeOn(m => !m)}
            className={`py-4 font-semibold ${
              metronomeOn ? 'bg-info text-white' : 'bg-bg-tertiary text-text-secondary'
            }`}
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            🔊 {metronomeOn ? 'ปิดเสียง' : 'เปิดเสียง'}
          </button>
          <button
            onClick={handleReset}
            className="py-4 font-semibold bg-bg-tertiary text-text-secondary inline-flex items-center justify-center gap-2"
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            <RotateCcw size={18} /> รีเซ็ต
          </button>
        </div>
      </div>
    </div>
  );
}
