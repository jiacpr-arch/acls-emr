// ============ DOCTOR INSTRUCTOR ============
// Shared cute instructor avatar with mood (idle | happy | sad). No store deps.
export default function Instructor({ mood = 'idle' }) {
  const eye = mood === 'happy'
    ? <><path d="M28 32 Q31 29 34 32" stroke="#1A2332" strokeWidth="1.8" fill="none"/><path d="M40 32 Q43 29 46 32" stroke="#1A2332" strokeWidth="1.8" fill="none"/></>
    : <><circle cx="31" cy="32" r="2" fill="#1A2332"/><circle cx="43" cy="32" r="2" fill="#1A2332"/></>;
  const mouth = mood === 'happy'
    ? <path d="M30 40 Q37 46 44 40" stroke="#1A2332" strokeWidth="1.8" fill="#FF6B6B"/>
    : mood === 'sad'
      ? <path d="M30 44 Q37 38 44 44" stroke="#1A2332" strokeWidth="1.8" fill="none"/>
      : <path d="M32 41 Q37 44 42 41" stroke="#1A2332" strokeWidth="1.5" fill="none"/>;
  return (
    <svg viewBox="0 0 75 80" width="60" height="64" className="animate-bob-cute">
      <path d="M12 78 L12 60 Q12 48 37 48 Q62 48 62 60 L62 78 Z" fill="white" stroke="#1A2332" strokeWidth="1.8"/>
      <ellipse cx="37" cy="35" rx="18" ry="20" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1.8"/>
      <path d="M19 28 Q19 8 37 7 Q55 8 55 28 Q55 18 47 16 Q37 22 27 16 Q19 18 19 28 Z" fill="#1A2332"/>
      <path d="M22 18 Q37 8 52 18 L52 22 Q37 12 22 22 Z" fill="#C53030"/>
      <rect x="35" y="13" width="3" height="7" fill="white"/>
      <rect x="33" y="15" width="7" height="3" fill="white"/>
      {eye}
      {mouth}
      <path d="M28 48 Q24 60 33 65" stroke="#1A2332" strokeWidth="1.5" fill="none"/>
      <circle cx="33" cy="65" r="3" fill="#888"/>
    </svg>
  );
}
