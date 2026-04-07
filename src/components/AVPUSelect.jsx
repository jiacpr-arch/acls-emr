import { useState } from 'react';
import ScrollPicker from './ScrollPicker';

// AVPU Assessment with detail entry per level
// A → Orientation check, auto GCS 15
// V → GCS + Pupil
// P → Motor type + GCS + Pupil + Airway
// U → Auto GCS 3 + Pupil + Breathing + Airway

export default function AVPUSelect({ value, onChange, compact = false, onDetailSave }) {
  const [showDetail, setShowDetail] = useState(false);
  const [gcsE, setGcsE] = useState(4);
  const [gcsV, setGcsV] = useState(5);
  const [gcsM, setGcsM] = useState(6);
  const [pupilL, setPupilL] = useState(3);
  const [pupilR, setPupilR] = useState(3);
  const [pupilLReactive, setPupilLReactive] = useState(true);
  const [pupilRReactive, setPupilRReactive] = useState(true);
  const [motorType, setMotorType] = useState(null);
  const [oriented, setOriented] = useState({ person: true, place: true, time: true });
  const [breathingSelf, setBreathingSelf] = useState(null);
  const [airwaySafe, setAirwaySafe] = useState(null);

  const levels = [
    { key: 'A', label: 'Alert', desc: 'Awake, talks, follows commands', color: 'bg-success', stable: true },
    { key: 'V', label: 'Voice', desc: 'Opens eyes only when spoken to', color: 'bg-warning', stable: false },
    { key: 'P', label: 'Pain', desc: 'Responds only to painful stimulus', color: 'bg-shock', stable: false },
    { key: 'U', label: 'Unresponsive', desc: 'No response at all', color: 'bg-danger', stable: false },
  ];

  const handleSelect = (key) => {
    onChange(key);
    // Auto-set GCS based on AVPU
    if (key === 'A') { setGcsE(4); setGcsV(5); setGcsM(6); }
    if (key === 'U') { setGcsE(1); setGcsV(1); setGcsM(1); }
    if (key !== 'A') setShowDetail(true);
  };

  const gcsTotal = gcsE + gcsV + gcsM;

  const saveDetail = () => {
    const detail = {
      avpu: value, gcs: gcsTotal, gcsE, gcsV, gcsM,
      pupilL, pupilR, pupilLReactive, pupilRReactive,
      motorType, oriented, breathingSelf, airwaySafe,
    };
    if (onDetailSave) onDetailSave(detail);
    setShowDetail(false);
  };

  // Compact mode — just buttons
  if (compact && !showDetail) {
    return (
      <div>
        <div className="text-xs text-text-muted font-semibold mb-1.5">Consciousness — call patient's name</div>
        <div className="grid grid-cols-4 gap-1.5">
          {levels.map(a => (
            <button key={a.key} onClick={() => handleSelect(a.key)}
              className={`py-2.5 rounded-xl text-center transition-colors ${
                value === a.key ? `${a.color} text-white` : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>
              <div className="text-sm font-black">{a.key}</div>
              <div className={`text-[8px] font-medium ${value === a.key ? 'opacity-90' : 'text-text-muted'}`}>{a.label}</div>
            </button>
          ))}
        </div>
        {value && !levels.find(l => l.key === value)?.stable && (
          <div className="text-[10px] text-danger font-bold mt-1">⚠️ Altered consciousness — Unstable</div>
        )}
        {value === 'A' && <div className="text-[10px] text-success font-bold mt-1">✅ Alert — GCS 15</div>}
      </div>
    );
  }

  // Detail entry modal
  if (showDetail && value) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-text-primary">
            AVPU: {value} — Detail Assessment
          </div>
          <button onClick={saveDetail} className="btn-action btn-info px-3 py-1 text-[10px] !min-h-[28px]">Save</button>
        </div>

        {/* GCS */}
        <div className="glass-card !p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">GCS</span>
            <span className={`text-xl font-mono font-black ${gcsTotal <= 8 ? 'text-danger' : gcsTotal <= 12 ? 'text-warning' : 'text-success'}`}>
              {gcsTotal}/15
            </span>
          </div>
          {value !== 'U' && (
            <>
              <ScrollPicker label="Eye (E)" value={gcsE} onChange={setGcsE} min={1} max={4} step={1} />
              <ScrollPicker label="Verbal (V)" value={gcsV} onChange={setGcsV} min={1} max={5} step={1} />
              <ScrollPicker label="Motor (M)" value={gcsM} onChange={setGcsM} min={1} max={6} step={1} />
            </>
          )}
          {value === 'U' && (
            <div className="text-xs text-danger font-semibold">GCS 3 — No response (auto-set)</div>
          )}
          {gcsTotal <= 8 && (
            <div className="text-[10px] text-danger font-bold">⚠️ GCS ≤8 — Cannot protect airway → Intubation needed</div>
          )}
        </div>

        {/* Pupil */}
        <div className="glass-card !p-3 space-y-2">
          <div className="text-xs font-semibold text-text-muted">Pupil Assessment</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-text-muted mb-1">Left</div>
              <ScrollPicker label="Size" value={pupilL} onChange={setPupilL} min={1} max={8} step={1} unit="mm" />
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => setPupilLReactive(true)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${pupilLReactive ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                  Reactive
                </button>
                <button onClick={() => setPupilLReactive(false)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${!pupilLReactive ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                  Fixed
                </button>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted mb-1">Right</div>
              <ScrollPicker label="Size" value={pupilR} onChange={setPupilR} min={1} max={8} step={1} unit="mm" />
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => setPupilRReactive(true)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${pupilRReactive ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                  Reactive
                </button>
                <button onClick={() => setPupilRReactive(false)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${!pupilRReactive ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>
                  Fixed
                </button>
              </div>
            </div>
          </div>
          {!pupilLReactive && !pupilRReactive && (
            <div className="text-[10px] text-danger font-bold">⚠️ Bilateral fixed dilated — Poor prognosis</div>
          )}
        </div>

        {/* Pain response type (P only) */}
        {value === 'P' && (
          <div className="glass-card !p-3">
            <div className="text-xs font-semibold text-text-muted mb-2">Motor Response to Pain</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'localize', label: 'Localizes pain', gcsM: 5 },
                { key: 'withdraw', label: 'Flexion withdrawal', gcsM: 4 },
                { key: 'abnormal_flex', label: 'Abnormal flexion', gcsM: 3 },
                { key: 'extension', label: 'Extension', gcsM: 2 },
              ].map(m => (
                <button key={m.key} onClick={() => { setMotorType(m.key); setGcsM(m.gcsM); }}
                  className={`py-2 rounded-lg text-[10px] font-semibold ${
                    motorType === m.key ? 'bg-shock text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{m.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Breathing + Airway (P, U) */}
        {(value === 'P' || value === 'U') && (
          <div className="glass-card !p-3 space-y-2">
            <div className="text-xs font-semibold text-text-muted">Breathing & Airway</div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="text-[10px] text-text-muted mb-1">Breathing self?</div>
                <div className="flex gap-1.5">
                  <button onClick={() => setBreathingSelf(true)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${breathingSelf === true ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>Yes</button>
                  <button onClick={() => setBreathingSelf(false)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${breathingSelf === false ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>No</button>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-text-muted mb-1">Airway safe?</div>
                <div className="flex gap-1.5">
                  <button onClick={() => setAirwaySafe(true)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${airwaySafe === true ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>Yes</button>
                  <button onClick={() => setAirwaySafe(false)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold ${airwaySafe === false ? 'bg-danger text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'}`}>No</button>
                </div>
              </div>
            </div>
            {airwaySafe === false && (
              <div className="text-[10px] text-danger font-bold">⚠️ Airway not safe — Secure airway NOW</div>
            )}
          </div>
        )}

        {/* Orientation (A only) */}
        {value === 'A' && (
          <div className="glass-card !p-3">
            <div className="text-xs font-semibold text-text-muted mb-2">Oriented to:</div>
            <div className="grid grid-cols-3 gap-1.5">
              {['person', 'place', 'time'].map(o => (
                <button key={o} onClick={() => setOriented(prev => ({ ...prev, [o]: !prev[o] }))}
                  className={`py-2 rounded-lg text-[10px] font-semibold capitalize ${
                    oriented[o] ? 'bg-success text-white' : 'bg-danger/10 text-danger border border-danger/30'
                  }`}>{o}</button>
              ))}
            </div>
          </div>
        )}

        <button onClick={saveDetail} className="w-full btn-action btn-info py-3 text-sm font-bold">
          Save Assessment (GCS {gcsTotal})
        </button>
        <button onClick={() => setShowDetail(false)} className="text-text-muted text-xs underline w-full text-center">Cancel</button>
      </div>
    );
  }

  // Full mode — button list
  return (
    <div>
      <div className="text-xs text-text-muted font-semibold mb-1">Consciousness Assessment</div>
      <div className="text-[10px] text-text-secondary mb-2">Call patient's name → check response:</div>
      <div className="space-y-1.5">
        {levels.map(a => (
          <button key={a.key} onClick={() => handleSelect(a.key)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
              value === a.key ? `${a.color} text-white` : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
            }`}>
            <span className="text-xl font-black w-8 text-center shrink-0">{a.key}</span>
            <div className="flex-1">
              <div className="text-xs font-bold">{a.label}</div>
              <div className={`text-[10px] ${value === a.key ? 'opacity-80' : 'text-text-muted'}`}>{a.desc}</div>
            </div>
            {!a.stable && <span className={`text-[8px] font-bold shrink-0 ${value === a.key ? 'opacity-80' : 'text-danger'}`}>⚠️</span>}
          </button>
        ))}
      </div>
      {value === 'A' && <div className="text-[10px] text-success font-bold mt-1">✅ Alert — GCS 15</div>}
    </div>
  );
}
