import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Renders an invisible sentinel + a sticky bottom button.
 * The button only enables after the sentinel scrolls into view,
 * proving the user reached the end of the lesson content.
 */
export default function ReadCompleteButton({ alreadyRead, onComplete, label = 'อ่านจบแล้ว' }) {
  const sentinelRef = useRef(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  useEffect(() => {
    if (alreadyRead) return; // already unlocked via prop
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setReachedEnd(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [alreadyRead]);

  const unlocked = reachedEnd || alreadyRead;

  return (
    <>
      <div ref={sentinelRef} className="h-1" aria-hidden />
      <div className="sticky bottom-3 mt-4">
        {!unlocked && (
          <div className="text-center text-[11px] text-text-muted mb-2 inline-flex items-center gap-1 justify-center w-full">
            <ChevronDown size={12} strokeWidth={2.2} /> เลื่อนอ่านให้จบเพื่อปลดล็อก
          </div>
        )}
        <button
          onClick={onComplete}
          disabled={!unlocked}
          className={`btn btn-lg btn-block ${
            unlocked ? 'btn-success' : 'btn-ghost'
          } disabled:opacity-40`}>
          <Check size={16} strokeWidth={2.4} /> {alreadyRead ? 'อ่านจบแล้ว ✓ — ทำ Quiz ต่อ' : label}
        </button>
      </div>
    </>
  );
}
