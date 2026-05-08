// Scroll/slider picker — no keyboard input
// Used for vitals, labs, drug doses, etc.
export default function ScrollPicker({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  color = 'accent-info',
  alertLow = null,    // value below this = danger
  alertHigh = null,   // value above this = danger
  targetLow = null,   // target range low
  targetHigh = null,  // target range high
}) {
  const isDanger = (alertLow !== null && value < alertLow) || (alertHigh !== null && value > alertHigh);
  const isTarget = targetLow !== null && targetHigh !== null && value >= targetLow && value <= targetHigh;
  const valueColor = isDanger ? 'text-danger' : isTarget ? 'text-success' : 'text-text-primary';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium">{label}</span>
        <span className={`text-lg font-mono font-black ${valueColor}`}>
          {value} <span className="text-xs font-normal text-text-muted">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`w-full ${color}`}
      />
      <div className="flex justify-between text-[9px] text-text-muted">
        <span>{min}</span>
        {targetLow !== null && targetHigh !== null && (
          <span className="text-success font-semibold">{targetLow}-{targetHigh} target</span>
        )}
        <span>{max}</span>
      </div>
    </div>
  );
}
