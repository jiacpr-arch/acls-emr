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
    // sparse/slow complexes → bradycardia & PEA
    brady: 'M0 30 ' + Array.from({ length: 3 }).map((_, i) => {
      const x = i * 200;
      return `L${x + 40} 30 L${x + 90} 30 L${x + 95} 8 L${x + 100} 52 L${x + 105} 30 L${x + 200} 30`;
    }).join(' '),
    pea:  'M0 30 ' + Array.from({ length: 3 }).map((_, i) => {
      const x = i * 200;
      return `L${x + 60} 30 L${x + 90} 24 L${x + 120} 36 L${x + 150} 30 L${x + 200} 30`;
    }).join(' '),
    // dense narrow complexes → SVT (fast, regular)
    svt:  'M0 30 ' + Array.from({ length: 10 }).map((_, i) => {
      const x = i * 60;
      return `L${x + 20} 30 L${x + 25} 10 L${x + 30} 50 L${x + 35} 30 L${x + 60} 30`;
    }).join(' '),
    // irregular baseline, no P → AF
    af:   'M0 30 ' + Array.from({ length: 8 }).map((_, i) => {
      const x = i * 75;
      const j = (i * 5) % 7 - 3;
      return `L${x + 30 + j} 30 L${x + 38} 12 L${x + 44} 48 L${x + 50} 30 L${x + 75} ${30 + ((i * 3) % 5 - 2)}`;
    }).join(' '),
    // NSR with ST elevation → STEMI
    stemi: 'M0 30 ' + Array.from({ length: 4 }).map((_, i) => {
      const x = i * 150;
      return `L${x + 20} 30 L${x + 30} 30 L${x + 60} 30 L${x + 65} 6 L${x + 70} 40 L${x + 75} 22 L${x + 110} 22 L${x + 120} 22 L${x + 150} 30`;
    }).join(' '),
  };
  paths.asystole = paths.flat;
  paths.pvt = paths.vt;
  const RED = ['vf', 'vt', 'pvt', 'torsades'];
  const GRAY = ['flat', 'asystole'];
  const color = RED.includes(rhythm) ? '#FF4444' : (GRAY.includes(rhythm) ? '#8896A6' : '#22DD66');

  return (
    <div className="bg-black border-2 border-text-primary p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-3xs font-mono text-green-400 font-bold">ECG · {rhythm.toUpperCase()}</div>
        <div className="text-[9px] font-mono text-green-400">PT MONITOR</div>
      </div>
      <svg viewBox="0 0 600 60" className="w-full" style={{ height: 50, background: '#040810' }}>
        <path d={paths[rhythm] || paths.flat} fill="none" stroke={color} strokeWidth="1.8"
              className={GRAY.includes(rhythm) ? '' : 'animate-ecg-scroll'}/>
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
