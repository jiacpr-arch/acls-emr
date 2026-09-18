import { useState, useEffect, useRef, useMemo } from 'react';
import './recorderAA.css';

// ==========================================
// Recorder Hero — overlay เริ่มเกม (นับถอยหลัง 3-2-1 ก่อนนาฬิกาเดิน)
// ให้ผู้เล่นเห็น layout ปุ่ม/ฉากก่อนเริ่ม แทนที่จะโดนโยนเข้าเกมทันที
// รอบแรกของผู้เล่น (coachText ถูกส่งมา) จะโชว์คำแนะนำวิธีเล่นด้วย
// ==========================================
const STEP_MS = 700;
const REDUCED_STEP_MS = 300;

export default function LiveStartOverlay({ title, coachText, onDone }) {
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const [count, setCount] = useState(3);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const stepMs = reducedMotion ? REDUCED_STEP_MS : STEP_MS;
    if (count <= 0) {
      const id = setTimeout(() => onDoneRef.current?.(), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setCount(c => c - 1), stepMs);
    return () => clearTimeout(id);
  }, [count, reducedMotion]);

  return (
    <div className="rgaa-startoverlay" style={{ cursor: 'pointer' }} onClick={() => setCount(0)}>
      {title && <div className="rgaa-startoverlay-title">{title}</div>}
      <div key={count} className="rgaa-startoverlay-num">{count > 0 ? count : 'เริ่ม!'}</div>
      <div className="rgaa-startoverlay-coach">{coachText ? `${coachText} (แตะเพื่อเริ่มเลย)` : 'แตะเพื่อเริ่มเลย'}</div>
    </div>
  );
}
