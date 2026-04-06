import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

export default function EtCO2Panel() {
  const { latestEtCO2, etco2Readings, addEtCO2, addEvent } = useCaseStore();
  const elapsed = useTimerStore(s => s.elapsed);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 0 || val > 100) return;

    addEtCO2(val, 'during_cpr');
    addEvent({
      elapsed,
      category: 'etco2',
      type: `EtCO₂: ${val} mmHg`,
      details: { value: val, context: 'during_cpr' }
    });
    setInputValue('');
  };

  const getColor = (value) => {
    if (value < 10) return 'text-danger';
    if (value < 20) return 'text-warning';
    return 'text-success';
  };

  const getLabel = (value) => {
    if (value < 10) return 'Poor CPR quality';
    if (value < 20) return 'Adequate';
    if (value > 40) return 'Possible ROSC!';
    return 'Good';
  };

  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="text-xs text-text-muted uppercase tracking-wider mb-2">EtCO₂</div>

      {/* Current value */}
      <div className="text-center mb-3">
        {latestEtCO2 ? (
          <>
            <div className={`text-4xl font-bold font-mono ${getColor(latestEtCO2.value)}`}>
              {latestEtCO2.value}
            </div>
            <div className="text-xs text-text-muted">mmHg</div>
            <div className={`text-xs font-semibold mt-1 ${getColor(latestEtCO2.value)}`}>
              {getLabel(latestEtCO2.value)}
            </div>
          </>
        ) : (
          <div className="text-2xl text-text-muted">--</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="mmHg"
          min="0"
          max="100"
          className="flex-1 bg-bg-primary border border-bg-tertiary rounded-lg px-3 py-2 text-center text-lg font-mono text-text-primary focus:outline-none focus:border-info"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-info text-white rounded-lg font-semibold text-sm hover:bg-blue-600"
        >
          Log
        </button>
      </form>

      {/* Mini trend */}
      {etco2Readings.length > 1 && (
        <div className="flex items-end gap-1 mt-3 h-8">
          {etco2Readings.slice(-10).map((r, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${
                r.value < 10 ? 'bg-danger' : r.value < 20 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ height: `${Math.min(100, (r.value / 50) * 100)}%` }}
              title={`${r.value} mmHg`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
