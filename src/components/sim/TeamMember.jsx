// ============ TEAM MEMBER CHARACTERS ============
// Shared cute SVG resuscitation team member. No store dependencies.
// CSS animations (animate-pump/bag/inject/zap/bob-cute) live in src/index.css.
export default function TeamMember({ role, active, label, status }) {
  const colors = {
    compressor: { coat: '#2B6CB0', accent: '#1e4e8c' },
    airway:     { coat: '#6B46C1', accent: '#553399' },
    drug:       { coat: '#276749', accent: '#1c4d35' },
    defib:      { coat: '#C05621', accent: '#923f18' },
    leader:     { coat: '#C53030', accent: '#9B2C2C' },
  }[role];

  const animClass = active ? {
    compressor: 'animate-pump',
    airway: 'animate-bag',
    drug: 'animate-inject',
    defib: 'animate-zap',
    leader: 'animate-bob-cute',
  }[role] : '';

  return (
    <div className={`flex flex-col items-center gap-0.5 transition-all ${active ? 'scale-110' : ''}`}>
      <div className={`${animClass} ${active ? 'drop-shadow-[0_0_6px_rgba(43,108,176,0.55)]' : ''}`}>
        <svg viewBox="0 0 60 80" width="56" height="74">
          {/* Active highlight ring */}
          {active && <rect x="2" y="2" width="56" height="76" fill="none" stroke={colors.coat} strokeWidth="2" strokeDasharray="3 2"/>}
          {/* Head */}
          <ellipse cx="30" cy="18" rx="14" ry="15" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1.8"/>
          {/* Hair */}
          <path d="M16 18 Q16 4 30 4 Q44 4 44 18 Q44 12 36 11 Q30 14 24 11 Q16 12 16 18 Z" fill="#1A2332"/>
          {/* Cap */}
          {role === 'leader' && <path d="M18 12 Q30 5 42 12 L42 16 Q30 9 18 16 Z" fill="#C53030"/>}
          {/* Eyes */}
          <circle cx="25" cy="18" r="1.5" fill="#1A2332"/>
          <circle cx="35" cy="18" r="1.5" fill="#1A2332"/>
          {/* Mouth */}
          <path d="M27 24 Q30 26 33 24" stroke="#1A2332" strokeWidth="1.2" fill="none"/>
          {/* Body / Coat */}
          <path d="M14 75 L14 45 Q14 33 30 33 Q46 33 46 45 L46 75 Z" fill={colors.coat} stroke={colors.accent} strokeWidth="1.5"/>
          {/* Stethoscope (leader) */}
          {role === 'leader' && <>
            <path d="M22 33 Q18 45 26 50 Q34 55 38 48" stroke="#1A2332" strokeWidth="1.5" fill="none"/>
            <circle cx="38" cy="48" r="2.5" fill="#888"/>
          </>}
          {/* Hands holding tool */}
          {role === 'compressor' && <>
            <rect x="22" y="40" width="16" height="6" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
            <rect x="24" y="46" width="12" height="4" fill="#FFD7B5" stroke="#1A2332" strokeWidth="1"/>
          </>}
          {role === 'airway' && <>
            <ellipse cx="30" cy="48" rx="8" ry="5" fill="#5BAEDB" stroke="#1A2332" strokeWidth="1.2"/>
            <rect x="28" y="42" width="4" height="6" fill="#222"/>
          </>}
          {role === 'drug' && <>
            <rect x="38" y="38" width="14" height="3" fill="#E8ECF1" stroke="#1A2332" strokeWidth="1"/>
            <rect x="34" y="38.5" width="4" height="2" fill="#FFD7B5"/>
            <line x1="52" y1="39.5" x2="58" y2="39.5" stroke="#1A2332" strokeWidth="1"/>
          </>}
          {role === 'defib' && <>
            <rect x="36" y="40" width="14" height="10" fill="#FFD700" stroke="#1A2332" strokeWidth="1.2"/>
            <text x="43" y="48" textAnchor="middle" fontSize="8" fontWeight="bold">⚡</text>
          </>}
        </svg>
      </div>
      <div className={`text-3xs font-black px-1 ${active ? 'bg-info text-white' : 'text-text-primary'}`}>{label}</div>
      {status && <div className="text-[9px] font-mono font-bold text-success bg-success/10 px-1 border border-success">{status}</div>}
    </div>
  );
}
