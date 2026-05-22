const W = 320;
const H = 80;
const BASE = H / 2;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function nsrCycle(x0, cw, baseY, wide = false, withP = true) {
  const px = x0 + cw * 0.18;
  const qx = x0 + cw * 0.45;
  const tx = x0 + cw * 0.75;
  const qrsW = wide ? 14 : 4;
  let d = '';
  if (withP) {
    d += ` L ${px - 8} ${baseY}`;
    d += ` Q ${px} ${baseY - 7}, ${px + 8} ${baseY}`;
  }
  d += ` L ${qx - qrsW} ${baseY}`;
  if (wide) {
    d += ` Q ${qx - 4} ${baseY - 26}, ${qx} ${baseY - 24}`;
    d += ` Q ${qx + 4} ${baseY - 22}, ${qx + qrsW} ${baseY + 6}`;
  } else {
    d += ` L ${qx - 2} ${baseY + 5}`;
    d += ` L ${qx + 1} ${baseY - 28}`;
    d += ` L ${qx + 4} ${baseY + 8}`;
  }
  d += ` L ${tx - 10} ${baseY}`;
  d += ` Q ${tx} ${baseY - 10}, ${tx + 10} ${baseY}`;
  d += ` L ${x0 + cw} ${baseY}`;
  return d;
}

function buildPath(rhythmId) {
  let d = `M 0 ${BASE}`;
  switch (rhythmId) {
    case 'nsr': {
      const cycles = 4;
      const cw = W / cycles;
      for (let i = 0; i < cycles; i++) d += nsrCycle(i * cw, cw, BASE);
      break;
    }
    case 'sb': {
      const cycles = 2;
      const cw = W / cycles;
      for (let i = 0; i < cycles; i++) d += nsrCycle(i * cw, cw, BASE);
      break;
    }
    case 'svt': {
      const cycles = 8;
      const cw = W / cycles;
      for (let i = 0; i < cycles; i++) d += nsrCycle(i * cw, cw, BASE, false, false);
      break;
    }
    case 'vt':
    case 'pvt': {
      const cycles = 5;
      const cw = W / cycles;
      for (let i = 0; i < cycles; i++) d += nsrCycle(i * cw, cw, BASE, true, false);
      break;
    }
    case 'af': {
      const positions = [0.08, 0.22, 0.32, 0.48, 0.6, 0.78, 0.92];
      const r = seeded(7);
      for (const p of positions) {
        const qx = p * W;
        const wob = (r() - 0.5) * 3;
        d += ` L ${qx - 6} ${BASE + wob}`;
        d += ` L ${qx - 2} ${BASE + 5}`;
        d += ` L ${qx + 1} ${BASE - 26}`;
        d += ` L ${qx + 4} ${BASE + 7}`;
        d += ` L ${qx + 8} ${BASE + wob}`;
      }
      d += ` L ${W} ${BASE}`;
      break;
    }
    case 'avb2': {
      const cw = W / 4;
      for (let i = 0; i < 3; i++) d += nsrCycle(i * cw, cw, BASE);
      const px = 3 * cw + cw * 0.18;
      d += ` L ${px - 8} ${BASE}`;
      d += ` Q ${px} ${BASE - 7}, ${px + 8} ${BASE}`;
      d += ` L ${W} ${BASE}`;
      break;
    }
    case 'avb3': {
      const pCount = 6;
      const qCount = 3;
      const events = [];
      for (let i = 0; i < pCount; i++) events.push({ t: (i + 0.5) / pCount * W, type: 'p' });
      for (let i = 0; i < qCount; i++) events.push({ t: (i + 0.5) / qCount * W, type: 'q' });
      events.sort((a, b) => a.t - b.t);
      for (const e of events) {
        if (e.type === 'p') {
          d += ` L ${e.t - 6} ${BASE}`;
          d += ` Q ${e.t} ${BASE - 6}, ${e.t + 6} ${BASE}`;
        } else {
          d += ` L ${e.t - 4} ${BASE}`;
          d += ` Q ${e.t} ${BASE - 22}, ${e.t + 4} ${BASE - 20}`;
          d += ` Q ${e.t + 8} ${BASE - 18}, ${e.t + 12} ${BASE + 5}`;
          d += ` L ${e.t + 16} ${BASE}`;
        }
      }
      d += ` L ${W} ${BASE}`;
      break;
    }
    case 'vf': {
      const r = seeded(99);
      for (let x = 3; x <= W; x += 3) {
        const amp = 18 + r() * 14;
        d += ` L ${x} ${BASE + (r() - 0.5) * amp}`;
      }
      break;
    }
    case 'tdp': {
      const r = seeded(31);
      const step = 6;
      let i = 0;
      for (let x = step; x <= W; x += step) {
        const env = Math.sin((x / W) * Math.PI * 2) * 22 + 10;
        const dir = i % 2 === 0 ? -1 : 1;
        d += ` L ${x} ${BASE + dir * env + (r() - 0.5) * 4}`;
        i++;
      }
      break;
    }
    case 'asystole': {
      const r = seeded(3);
      for (let x = 4; x <= W; x += 4) {
        d += ` L ${x} ${BASE + (r() - 0.5) * 1.5}`;
      }
      break;
    }
    case 'pea': {
      const cycles = 3;
      const cw = W / cycles;
      for (let i = 0; i < cycles; i++) d += nsrCycle(i * cw, cw, BASE);
      break;
    }
    default:
      d += ` L ${W} ${BASE}`;
  }
  return d;
}

export default function EKGWaveform({ rhythmId, color = '#10b981', className = '' }) {
  const d = buildPath(rhythmId);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full h-20 ${className}`}
      preserveAspectRatio="none"
      aria-label={`EKG waveform: ${rhythmId}`}
    >
      <rect x="0" y="0" width={W} height={H} fill="#0b0f14" />
      <g stroke="rgba(16,185,129,0.12)" strokeWidth="0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * (W / 8)} y1="0" x2={(i + 1) * (W / 8)} y2={H} />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * (H / 4)} x2={W} y2={(i + 1) * (H / 4)} />
        ))}
      </g>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
