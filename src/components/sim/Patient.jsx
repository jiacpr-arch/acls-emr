// ============ PATIENT ON BED ============
// Shared presentational patient figure. No store dependencies.
export default function Patient({ state }) {
  const isROSC = state.consciousness === 'rosc';
  const skinColor = isROSC ? '#FFD7B5' : (state.consciousness === 'unresponsive' ? '#C8C0B5' : '#FFD7B5');
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 90" width="200" height="90">
        {/* Bed */}
        <rect x="5" y="55" width="190" height="28" fill="#E8ECF1" stroke="#1A2332" strokeWidth="2"/>
        <rect x="0" y="70" width="200" height="14" fill="#8896A6" stroke="#1A2332" strokeWidth="2"/>
        <rect x="2" y="60" width="6" height="20" fill="#1A2332"/>
        <rect x="192" y="60" width="6" height="20" fill="#1A2332"/>
        {/* Pillow */}
        <ellipse cx="30" cy="55" rx="20" ry="6" fill="white" stroke="#1A2332" strokeWidth="1.5"/>
        {/* Body (sheet covered) */}
        <path d="M50 55 L180 55 Q185 55 185 60 L185 65 Q120 70 50 65 Z" fill="#5BAEDB" stroke="#1A2332" strokeWidth="2"/>
        <path d="M155 55 L180 55 L180 65 L155 65 Z" fill="white" stroke="#1A2332" strokeWidth="1.5"/>
        {/* Feet */}
        <path d="M178 55 L185 50 L186 60 Z" fill={skinColor} stroke="#1A2332" strokeWidth="1.2"/>
        {/* Head */}
        <ellipse cx="30" cy="48" rx="14" ry="13" fill={skinColor} stroke="#1A2332" strokeWidth="2"/>
        {/* Hair */}
        <path d="M17 48 Q17 36 30 35 Q43 36 43 48 Q43 42 36 41 Q30 44 24 41 Q17 42 17 48 Z" fill="#1A2332"/>
        {/* Face */}
        {isROSC ? <>
          <path d="M25 48 Q26 46 27 48" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          <path d="M33 48 Q34 46 35 48" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          <path d="M27 53 Q30 56 33 53" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
        </> : <>
          <path d="M24 48 L28 50 M28 48 L24 50" stroke="#1A2332" strokeWidth="1.2"/>
          <path d="M32 48 L36 50 M36 48 L32 50" stroke="#1A2332" strokeWidth="1.2"/>
          <line x1="27" y1="54" x2="33" y2="54" stroke="#1A2332" strokeWidth="1.2"/>
        </>}
        {/* IV line */}
        {state.ivAccess && <>
          <line x1="50" y1="58" x2="60" y2="40" stroke="#5BAEDB" strokeWidth="1.5"/>
          <rect x="56" y="32" width="10" height="14" fill="#E8ECF1" stroke="#1A2332" strokeWidth="1"/>
          <text x="61" y="42" textAnchor="middle" fontSize="6" fill="#1A2332">IV</text>
        </>}
        {/* CPR indicator (hands on chest) */}
        {state.compressorActive && <g className="animate-pump-hands">
          <ellipse cx="100" cy="50" rx="6" ry="3" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
        </g>}
        {/* BVM mask */}
        {state.airwayActive && <ellipse cx="30" cy="48" rx="10" ry="6" fill="#5BAEDB" fillOpacity="0.6" stroke="#1A2332" strokeWidth="1.2"/>}
        {/* Defib pads */}
        {state.defibCharged && <>
          <rect x="80" y="48" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1"/>
          <rect x="115" y="48" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1"/>
        </>}
      </svg>
    </div>
  );
}
