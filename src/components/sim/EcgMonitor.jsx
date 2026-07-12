// ============ ECG MONITOR ============
// Shared presentational ECG strip + vitals grid. No store dependencies.
export default function EcgMonitor({ rhythm, hr, bp, spo2, etco2 }) {
  // Path generators per rhythm — repeated 3x to fill the strip
  const paths = {
    flat: 'M0 30 L600 30',
    vf:   'M0 30 ' + Array.from({ length: 60 }).map((_, i) => {
      const x = i * 10;
      // deterministic chaotic-ish pattern (no Math.random — pure for SSR/render safety)
      const y = 30 + (Math.sin(i * 1.7) * 14) + (Math.cos(i * 2.9) * 10) + ((i * 7) % 13 - 6);
      return `L${x} ${y}`;
    }).join(' '),
    vt:   'M0 30 ' + Array.from({ length: 12 }).map((_, i) => {
      const x = i * 50;
      return `L${x} 30 L${x + 8} 5 L${x + 16} 55 L${x + 24} 30 L${x + 50} 30`;
    }).join(' '),
    nsr:  'M0 30 ' + Array.from({ length: 4 }).map((_, i) => {
      const x = i * 150;
      return `L${x + 20} 30 L${x + 25} 26 L${x + 30} 30 L${x + 60} 30 L${x + 65} 5 L${x + 70} 55 L${x + 75} 30 L${x + 110} 30 L${x + 120} 22 L${x + 130} 30 L${x + 150} 30`;
    }).join(' '),
  };
  const color = rhythm === 'vf' || rhythm === 'vt' ? '#FF4444' : (rhythm === 'flat' ? '#8896A6' : '#22DD66');

  return (
    <div className="bg-black border-2 border-text-primary p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-3xs font-mono text-green-400 font-bold">ECG · {rhythm.toUpperCase()}</div>
        <div className="text-[9px] font-mono text-green-400">PT MONITOR</div>
      </div>
      <svg viewBox="0 0 600 60" className="w-full" style={{ height: 50, background: '#040810' }}>
        <path d={paths[rhythm] || paths.flat} fill="none" stroke={color} strokeWidth="1.8"
              className={rhythm !== 'flat' ? 'animate-ecg-scroll' : ''}/>
      </svg>
      <div className="grid grid-cols-4 gap-1 mt-2">
        <Vital label="HR" value={hr || '--'} unit="" color="text-green-400"/>
        <Vital label="BP" value={bp || '--/--'} unit="" color="text-yellow-300"/>
        <Vital label="SpO₂" value={spo2 ? `${spo2}` : '--'} unit="%" color="text-cyan-300"/>
        <Vital label="EtCO₂" value={etco2 || '--'} unit="" color="text-orange-300"/>
      </div>
    </div>
  );
}

function Vital({ label, value, unit, color }) {
  return (
    <div className="bg-black/60 border border-gray-700 px-1 py-0.5 text-center">
      <div className="text-[9px] text-gray-400 font-bold">{label}</div>
      <div className={`font-mono font-black text-sm ${color}`}>{value}<span className="text-[9px]">{unit}</span></div>
    </div>
  );
}
