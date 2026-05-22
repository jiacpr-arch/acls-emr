// ECG waveform renderer.
// Two visual modes:
//   variant="paper"   → light pink/red grid like real ECG paper (default for quiz)
//   variant="monitor" → dark background, green trace (bedside monitor look)
//
// Coordinate model: we work in millimetres internally then scale to px.
// Paper speed = 25 mm/s, gain = 10 mm/mV (clinical standard).

const MM = 4; // px per mm
const STRIP_MM_W = 150; // 6 seconds
const STRIP_MM_H = 38;
const W = STRIP_MM_W * MM;
const H = STRIP_MM_H * MM;
const BASE = H / 2;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Single beat builder. All offsets in pixels; cw is cycle width in px.
// opts:
//   p: { amp, dur, pos, polarity, present }  (P wave)
//   pr: PR interval in mm
//   qrs: { width, rAmp, qAmp, sAmp, delta }
//   st: ST level (mm, + = elevation)
//   t: { amp, dur, inverted, peaked }
//   u: small U wave amp
function beat(x0, opts) {
  const o = {
    p: { amp: 1.0, dur: 3, polarity: 1, present: true, ...(opts.p || {}) },
    pr: opts.pr ?? 4, // mm from P start to QRS start
    qrs: { width: 3, rAmp: 12, qAmp: 1, sAmp: 4, delta: false, ...(opts.qrs || {}) },
    st: opts.st ?? 0,
    t: { amp: 3, dur: 6, inverted: false, peaked: false, ...(opts.t || {}) },
    u: opts.u ?? 0,
  };
  let d = '';
  let x = x0;

  // P wave
  if (o.p.present) {
    const pw = o.p.dur * MM;
    const ph = o.p.amp * MM * o.p.polarity;
    d += ` L ${x} ${BASE}`;
    d += ` Q ${x + pw / 2} ${BASE - ph} ${x + pw} ${BASE}`;
    x += pw;
    // PR segment isoelectric (rest of PR interval)
    const prRest = Math.max(0, o.pr - o.p.dur) * MM;
    d += ` L ${x + prRest} ${BASE}`;
    x += prRest;
  } else {
    d += ` L ${x + o.pr * MM} ${BASE}`;
    x += o.pr * MM;
  }

  // QRS
  const qw = o.qrs.width * MM;
  if (o.qrs.delta) {
    // WPW slurred upstroke
    d += ` L ${x + qw * 0.35} ${BASE - o.qrs.rAmp * 0.4 * MM / 4}`;
    d += ` L ${x + qw * 0.55} ${BASE - o.qrs.rAmp * MM / 4}`;
    d += ` L ${x + qw} ${BASE + o.qrs.sAmp * MM / 4}`;
  } else if (o.qrs.width > 4) {
    // Wide bizarre QRS (VT/PVC/paced)
    d += ` Q ${x + qw * 0.25} ${BASE - o.qrs.rAmp * MM / 3} ${x + qw * 0.5} ${BASE - o.qrs.rAmp * MM / 3}`;
    d += ` Q ${x + qw * 0.75} ${BASE - o.qrs.rAmp * MM / 3} ${x + qw} ${BASE + o.qrs.sAmp * MM / 3}`;
  } else {
    // Narrow QRS: Q-R-S
    if (o.qrs.qAmp > 0) {
      d += ` L ${x + qw * 0.15} ${BASE + (o.qrs.qAmp * MM) / 4}`;
    }
    d += ` L ${x + qw * 0.5} ${BASE - (o.qrs.rAmp * MM) / 4}`;
    d += ` L ${x + qw * 0.85} ${BASE + (o.qrs.sAmp * MM) / 4}`;
    d += ` L ${x + qw} ${BASE - o.st * MM / 4}`;
  }
  x += qw;

  // ST segment (4 mm)
  const stW = 4 * MM;
  d += ` L ${x + stW} ${BASE - o.st * MM / 4}`;
  x += stW;

  // T wave
  const tw = o.t.dur * MM;
  const th = (o.t.inverted ? 1 : -1) * o.t.amp * MM / 4;
  if (o.t.peaked) {
    d += ` L ${x + tw * 0.3} ${BASE}`;
    d += ` L ${x + tw * 0.5} ${BASE + th * 2}`;
    d += ` L ${x + tw * 0.7} ${BASE}`;
    d += ` L ${x + tw} ${BASE}`;
  } else {
    d += ` Q ${x + tw * 0.5} ${BASE + th * 1.6} ${x + tw} ${BASE}`;
  }
  x += tw;

  // U wave (small)
  if (o.u > 0) {
    const uw = 4 * MM;
    d += ` Q ${x + uw * 0.5} ${BASE - o.u * MM / 4} ${x + uw} ${BASE}`;
    x += uw;
  }
  return { d, x };
}

// Repeat sinus-like beats at a heart rate filling the strip.
function sinusStrip(bpm, beatOpts, startBase = BASE) {
  const cycleMm = (60 / bpm) * 25; // mm per beat at 25mm/s
  const cw = cycleMm * MM;
  let d = `M 0 ${startBase}`;
  let x = 0;
  while (x < W + cw) {
    const res = beat(x, beatOpts);
    d += res.d;
    // baseline to next beat start
    const next = x + cw;
    d += ` L ${next} ${BASE}`;
    x = next;
  }
  return d;
}

function buildPath(rhythmId) {
  switch (rhythmId) {
    // ---- Normal & sinus ----
    case 'nsr':
      return sinusStrip(72, {});
    case 'sinus_tach':
      return sinusStrip(120, { t: { amp: 2.5, dur: 5 } });
    case 'sb':
      return sinusStrip(45, {});

    // ---- AV blocks ----
    case 'avb1':
      return sinusStrip(70, { pr: 9 }); // long PR

    case 'wenckebach': {
      // Progressive PR prolongation then dropped QRS (Mobitz I)
      let d = `M 0 ${BASE}`;
      let x = 0;
      const baseCw = (60 / 65) * 25 * MM;
      const pattern = [4, 6, 8, 10]; // PR increasing, last is dropped P only
      let i = 0;
      while (x < W) {
        const pr = pattern[i % pattern.length];
        const drop = i % pattern.length === pattern.length - 1;
        if (drop) {
          // only a P wave then long pause
          const pw = 3 * MM;
          d += ` L ${x} ${BASE} Q ${x + pw / 2} ${BASE - MM} ${x + pw} ${BASE}`;
          d += ` L ${x + baseCw} ${BASE}`;
          x += baseCw;
        } else {
          const res = beat(x, { pr });
          d += res.d;
          d += ` L ${x + baseCw} ${BASE}`;
          x += baseCw;
        }
        i++;
      }
      return d;
    }

    case 'avb2': {
      // Mobitz II: constant PR, occasional dropped QRS
      let d = `M 0 ${BASE}`;
      let x = 0;
      const cw = (60 / 70) * 25 * MM;
      let i = 0;
      while (x < W) {
        if (i % 3 === 2) {
          // dropped: P only
          const pw = 3 * MM;
          d += ` L ${x} ${BASE} Q ${x + pw / 2} ${BASE - MM} ${x + pw} ${BASE}`;
          d += ` L ${x + cw} ${BASE}`;
        } else {
          const res = beat(x, {});
          d += res.d;
          d += ` L ${x + cw} ${BASE}`;
        }
        x += cw;
        i++;
      }
      return d;
    }

    case 'avb3': {
      // AV dissociation: independent P (faster) and QRS (slower, wide escape)
      let d = `M 0 ${BASE}`;
      const pRate = 90;
      const qRate = 35;
      const pInt = (60 / pRate) * 25 * MM;
      const qInt = (60 / qRate) * 25 * MM;
      const events = [];
      for (let x = pInt * 0.4; x < W; x += pInt) events.push({ x, type: 'p' });
      for (let x = qInt * 0.3; x < W; x += qInt) events.push({ x, type: 'q' });
      events.sort((a, b) => a.x - b.x);
      for (const e of events) {
        d += ` L ${e.x} ${BASE}`;
        if (e.type === 'p') {
          const pw = 3 * MM;
          d += ` Q ${e.x + pw / 2} ${BASE - MM} ${e.x + pw} ${BASE}`;
        } else {
          const qw = 5 * MM;
          d += ` Q ${e.x + qw * 0.3} ${BASE - 8 * MM / 3} ${e.x + qw * 0.5} ${BASE - 8 * MM / 3}`;
          d += ` Q ${e.x + qw * 0.7} ${BASE + 4 * MM / 3} ${e.x + qw} ${BASE}`;
          const tw = 6 * MM;
          d += ` Q ${e.x + qw + tw / 2} ${BASE + 3 * MM / 4} ${e.x + qw + tw} ${BASE}`;
        }
      }
      d += ` L ${W} ${BASE}`;
      return d;
    }

    // ---- Tachys narrow ----
    case 'svt':
      return sinusStrip(180, { p: { present: false }, pr: 1, t: { amp: 2, dur: 4 } });

    case 'af': {
      // Irregularly irregular, fibrillatory baseline, no P
      const r = seeded(13);
      let d = `M 0 ${BASE}`;
      const beats = [];
      let t = 0;
      while (t < W) {
        // RR interval random 14-28mm (irregular)
        t += (14 + r() * 14) * MM;
        beats.push(t);
      }
      let cur = 0;
      for (const bx of beats) {
        if (bx >= W) break;
        // Fibrillatory wavy baseline from cur to bx
        for (let x = cur; x < bx - 4 * MM; x += 1.5) {
          d += ` L ${x} ${BASE + (r() - 0.5) * MM * 0.6}`;
        }
        // narrow QRS
        const qx = bx;
        d += ` L ${qx - 1 * MM} ${BASE}`;
        d += ` L ${qx} ${BASE - 11 * MM / 4}`;
        d += ` L ${qx + 1 * MM} ${BASE + 3 * MM / 4}`;
        d += ` L ${qx + 2 * MM} ${BASE}`;
        cur = qx + 2 * MM;
      }
      for (let x = cur; x < W; x += 1.5) {
        d += ` L ${x} ${BASE + (seeded(99 + x)() - 0.5) * MM * 0.6}`;
      }
      return d;
    }

    case 'aflutter': {
      // Sawtooth F waves ~300/min with 2:1 conduction QRS
      let d = `M 0 ${BASE}`;
      const fw = 5 * MM; // 5mm per flutter wave (300/min)
      const qrsEvery = 2; // 2:1
      let i = 0;
      let x = 0;
      while (x < W) {
        // sawtooth down then up
        d += ` L ${x + fw * 0.5} ${BASE + 2 * MM}`;
        d += ` L ${x + fw} ${BASE - 1.5 * MM}`;
        x += fw;
        if (i % qrsEvery === qrsEvery - 1) {
          d += ` L ${x + 1 * MM} ${BASE}`;
          d += ` L ${x + 1.5 * MM} ${BASE - 10 * MM / 4}`;
          d += ` L ${x + 2 * MM} ${BASE + 3 * MM / 4}`;
          d += ` L ${x + 3 * MM} ${BASE}`;
          x += 3 * MM;
        }
        i++;
      }
      return d;
    }

    // ---- Tachys wide ----
    case 'vt':
    case 'pvt': {
      // Monomorphic wide-complex tachycardia: each beat is a fused
      // R-S-T sine-like deflection with no isoelectric segment.
      // Rate ~170/min, regular. R up tall, then dip below baseline
      // (S/discordant-T), then back to baseline.
      const bpm = 170;
      const cycleMm = (60 / bpm) * 25;
      const cw = cycleMm * MM;
      let d = `M 0 ${BASE}`;
      let x = 0;
      while (x < W + cw) {
        // Upstroke and R peak
        d += ` Q ${x + cw * 0.18} ${BASE - 16 * MM / 3} ${x + cw * 0.36} ${BASE - 14 * MM / 3}`;
        // Down past baseline to S/T trough
        d += ` Q ${x + cw * 0.5} ${BASE + 2 * MM} ${x + cw * 0.65} ${BASE + 8 * MM / 3}`;
        // Recovery back to baseline
        d += ` Q ${x + cw * 0.85} ${BASE + 2 * MM / 3} ${x + cw} ${BASE}`;
        x += cw;
      }
      return d;
    }

    case 'tdp': {
      // Polymorphic VT with twisting amplitude envelope
      const r = seeded(31);
      let d = `M 0 ${BASE}`;
      const step = 2;
      let i = 0;
      for (let x = 0; x < W; x += step) {
        const env = Math.sin((x / W) * Math.PI * 2) * 18 + 12;
        const dir = i % 2 === 0 ? -1 : 1;
        d += ` L ${x} ${BASE + dir * env + (r() - 0.5) * 3}`;
        i++;
      }
      return d;
    }

    case 'vf':
    case 'vf_coarse': {
      const r = seeded(99);
      let d = `M 0 ${BASE}`;
      for (let x = 0; x <= W; x += 2) {
        const amp = 20 + r() * 16;
        d += ` L ${x} ${BASE + (r() - 0.5) * amp}`;
      }
      return d;
    }
    case 'vf_fine': {
      const r = seeded(77);
      let d = `M 0 ${BASE}`;
      for (let x = 0; x <= W; x += 2) {
        const amp = 5 + r() * 6;
        d += ` L ${x} ${BASE + (r() - 0.5) * amp}`;
      }
      return d;
    }

    case 'asystole': {
      const r = seeded(3);
      let d = `M 0 ${BASE}`;
      for (let x = 0; x <= W; x += 3) {
        d += ` L ${x} ${BASE + (r() - 0.5) * 1.2}`;
      }
      return d;
    }

    case 'pea':
      return sinusStrip(75, {});

    // ---- Ectopy ----
    case 'pvc': {
      // Sinus with one wide bizarre PVC mid-strip
      let d = `M 0 ${BASE}`;
      let x = 0;
      const cw = (60 / 75) * 25 * MM;
      let i = 0;
      while (x < W) {
        if (i === 3) {
          // PVC: no P, wide bizarre, no compensatory pause shown
          const res = beat(x, {
            p: { present: false }, pr: 0,
            qrs: { width: 7, rAmp: 16, qAmp: 0, sAmp: 8 },
            t: { amp: 5, dur: 6, inverted: true },
          });
          d += res.d;
        } else {
          const res = beat(x, {});
          d += res.d;
        }
        d += ` L ${x + cw} ${BASE}`;
        x += cw;
        i++;
      }
      return d;
    }

    case 'pac': {
      // Sinus with one early P (premature atrial complex)
      let d = `M 0 ${BASE}`;
      let x = 0;
      const cw = (60 / 70) * 25 * MM;
      let i = 0;
      while (x < W) {
        if (i === 3) {
          // PAC: early, normal narrow QRS
          const res = beat(x - cw * 0.3, { p: { amp: 1.2 } });
          d += res.d;
          d += ` L ${x + cw} ${BASE}`;
        } else {
          const res = beat(x, {});
          d += res.d;
          d += ` L ${x + cw} ${BASE}`;
        }
        x += cw;
        i++;
      }
      return d;
    }

    case 'bigeminy': {
      // Alternating normal beat and PVC
      let d = `M 0 ${BASE}`;
      let x = 0;
      const cw = (60 / 70) * 25 * MM;
      let i = 0;
      while (x < W) {
        if (i % 2 === 1) {
          const res = beat(x, {
            p: { present: false }, pr: 0,
            qrs: { width: 7, rAmp: 14, qAmp: 0, sAmp: 7 },
            t: { amp: 4, dur: 6, inverted: true },
          });
          d += res.d;
        } else {
          const res = beat(x, {});
          d += res.d;
        }
        d += ` L ${x + cw} ${BASE}`;
        x += cw;
        i++;
      }
      return d;
    }

    // ---- Junctional ----
    case 'junctional':
      return sinusStrip(50, { p: { present: false }, pr: 0, t: { amp: 3, dur: 6 } });

    // ---- Paced ----
    case 'paced': {
      // Pacer spike then wide QRS
      let d = `M 0 ${BASE}`;
      let x = 0;
      const cw = (60 / 72) * 25 * MM;
      while (x < W) {
        // pacer spike (thin vertical)
        d += ` L ${x + 2 * MM} ${BASE}`;
        d += ` L ${x + 2 * MM} ${BASE - 6 * MM}`;
        d += ` L ${x + 2.2 * MM} ${BASE - 6 * MM}`;
        d += ` L ${x + 2.2 * MM} ${BASE}`;
        const res = beat(x + 2.5 * MM, {
          p: { present: false }, pr: 0,
          qrs: { width: 7, rAmp: 13, qAmp: 0, sAmp: 7 },
          t: { amp: 4, dur: 6, inverted: true },
        });
        d += res.d;
        d += ` L ${x + cw} ${BASE}`;
        x += cw;
      }
      return d;
    }

    // ---- WPW ----
    case 'wpw':
      return sinusStrip(75, {
        pr: 2,
        qrs: { width: 5, rAmp: 12, qAmp: 0, sAmp: 4, delta: true },
      });

    // ---- Ischemia / STEMI ----
    case 'stemi_anterior':
    case 'stemi':
      return sinusStrip(80, { st: 3.5, t: { amp: 4, dur: 6 } });
    case 'stemi_inferior':
      return sinusStrip(70, { st: 3, t: { amp: 3.5, dur: 6 } });
    case 'nstemi':
      return sinusStrip(85, { st: -2.5, t: { amp: 3, dur: 5 } });
    case 'ischemic_t':
      return sinusStrip(75, { t: { amp: 4, dur: 6, inverted: true } });

    // ---- Electrolytes ----
    case 'hyperk':
      return sinusStrip(70, { t: { amp: 6, dur: 4, peaked: true } });
    case 'hypok':
      return sinusStrip(75, { t: { amp: 1.5, dur: 5 }, u: 2 });
    case 'long_qt':
      return sinusStrip(70, { t: { amp: 3, dur: 12 } });

    default:
      return `M 0 ${BASE} L ${W} ${BASE}`;
  }
}

function PaperGrid() {
  const lines = [];
  // small boxes every 1mm
  for (let i = 1; i < STRIP_MM_W; i++) {
    lines.push(
      <line key={`v-${i}`} x1={i * MM} y1={0} x2={i * MM} y2={H}
        stroke="rgba(239,68,68,0.18)" strokeWidth={i % 5 === 0 ? 0.8 : 0.3} />
    );
  }
  for (let i = 1; i < STRIP_MM_H; i++) {
    lines.push(
      <line key={`h-${i}`} x1={0} y1={i * MM} x2={W} y2={i * MM}
        stroke="rgba(239,68,68,0.18)" strokeWidth={i % 5 === 0 ? 0.8 : 0.3} />
    );
  }
  return <g>{lines}</g>;
}

function MonitorGrid() {
  return (
    <g stroke="rgba(16,185,129,0.12)" strokeWidth="0.5">
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={`v${i}`} x1={(i + 1) * (W / 15)} y1="0" x2={(i + 1) * (W / 15)} y2={H} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={(i + 1) * (H / 6)} x2={W} y2={(i + 1) * (H / 6)} />
      ))}
    </g>
  );
}

export default function EKGWaveform({ rhythmId, variant = 'paper', color, className = '' }) {
  const d = buildPath(rhythmId);
  const isPaper = variant === 'paper';
  const bg = isPaper ? '#fff7f0' : '#0b0f14';
  const traceColor = color || (isPaper ? '#111827' : '#10b981');
  const traceWidth = isPaper ? 1.4 : 1.6;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full ${className}`}
      style={{ height: 'auto', aspectRatio: `${W} / ${H}`, display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
      aria-label={`EKG waveform: ${rhythmId}`}
    >
      <rect x="0" y="0" width={W} height={H} fill={bg} />
      {isPaper ? <PaperGrid /> : <MonitorGrid />}
      <path d={d} fill="none" stroke={traceColor} strokeWidth={traceWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
