import { useState, useRef, useCallback, useEffect } from 'react';

// ==========================================
// Recorder Hero — clock เบาๆ (แยกจาก timerStore ของ EMR จริง)
// เดินด้วย setInterval 200ms + Date.now() delta เพื่อรองรับ pause/resume
// คืน elapsed เป็นวินาที (float); เรียก onTick(elapsed) ทุก tick (ถ้ามี)
// ==========================================
export function useGameClock(onTick) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const baseRef = useRef(0);        // วินาทีที่สะสมไว้ก่อน pause ล่าสุด
  const startedAtRef = useRef(null); // Date.now() ตอนเริ่มเดินรอบปัจจุบัน
  const intervalRef = useRef(null);
  const onTickRef = useRef(onTick);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const tick = useCallback(() => {
    if (startedAtRef.current == null) return;
    const now = Date.now();
    const value = baseRef.current + (now - startedAtRef.current) / 1000;
    setElapsed(value);
    onTickRef.current?.(value);
  }, []);

  const start = useCallback(() => {
    clearTick();
    baseRef.current = 0;
    startedAtRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    intervalRef.current = setInterval(tick, 200);
  }, [tick]);

  const pause = useCallback(() => {
    if (startedAtRef.current == null) return;
    baseRef.current += (Date.now() - startedAtRef.current) / 1000;
    startedAtRef.current = null;
    setRunning(false);
    clearTick();
  }, []);

  const resume = useCallback(() => {
    if (startedAtRef.current != null) return;
    startedAtRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(tick, 200);
  }, [tick]);

  const stop = useCallback(() => {
    pause();
  }, [pause]);

  const reset = useCallback(() => {
    clearTick();
    baseRef.current = 0;
    startedAtRef.current = null;
    setElapsed(0);
    setRunning(false);
  }, []);

  useEffect(() => () => clearTick(), []);

  return { elapsed, running, start, pause, resume, stop, reset };
}
