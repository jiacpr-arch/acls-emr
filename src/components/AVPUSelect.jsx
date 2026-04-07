// AVPU Assessment — clear, self-explanatory
// Shows what to do + what each level means + auto-flags unstable

export default function AVPUSelect({ value, onChange, compact = false }) {
  const levels = [
    {
      key: 'A',
      label: 'Alert',
      desc: 'Awake, talks, follows commands',
      how: 'Call their name — responds normally?',
      color: 'bg-success',
      stable: true,
    },
    {
      key: 'V',
      label: 'Voice',
      desc: 'Opens eyes / responds only when spoken to',
      how: 'Call loudly — any response?',
      color: 'bg-warning',
      stable: false,
    },
    {
      key: 'P',
      label: 'Pain',
      desc: 'Moves / withdraws only to painful stimulus',
      how: 'Trapezius squeeze — any response?',
      color: 'bg-shock',
      stable: false,
    },
    {
      key: 'U',
      label: 'Unresponsive',
      desc: 'No response to voice or pain',
      how: 'No response at all',
      color: 'bg-danger',
      stable: false,
    },
  ];

  if (compact) {
    return (
      <div>
        <div className="text-xs text-text-muted font-semibold mb-1.5">Consciousness — call patient's name</div>
        <div className="grid grid-cols-4 gap-1.5">
          {levels.map(a => (
            <button key={a.key} onClick={() => onChange(a.key)}
              className={`py-2.5 rounded-xl text-center transition-colors ${
                value === a.key ? `${a.color} text-white` : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>
              <div className="text-sm font-black">{a.key}</div>
              <div className={`text-[8px] font-medium ${value === a.key ? 'opacity-90' : 'text-text-muted'}`}>{a.label}</div>
            </button>
          ))}
        </div>
        {value && !levels.find(l => l.key === value)?.stable && (
          <div className="text-[10px] text-danger font-bold mt-1">⚠️ Altered consciousness — Unstable sign</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-text-muted font-semibold mb-1">Consciousness Assessment</div>
      <div className="text-[10px] text-text-secondary mb-2">Call patient's name → check response level:</div>
      <div className="space-y-1.5">
        {levels.map(a => (
          <button key={a.key} onClick={() => onChange(a.key)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
              value === a.key ? `${a.color} text-white` : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
            }`}>
            <span className="text-xl font-black w-8 text-center shrink-0">{a.key}</span>
            <div className="flex-1">
              <div className="text-xs font-bold">{a.label}</div>
              <div className={`text-[10px] ${value === a.key ? 'opacity-80' : 'text-text-muted'}`}>{a.desc}</div>
            </div>
            {!a.stable && (
              <span className={`text-[8px] font-bold shrink-0 ${value === a.key ? 'opacity-80' : 'text-danger'}`}>⚠️</span>
            )}
          </button>
        ))}
      </div>
      {value && !levels.find(l => l.key === value)?.stable && (
        <div className="text-[10px] text-danger font-bold mt-2">
          ⚠️ Not Alert — consider GCS assessment + check airway
        </div>
      )}
    </div>
  );
}
