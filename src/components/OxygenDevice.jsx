import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';

// Oxygen delivery device selection + flow rate
// Used in: Airway panel, Post-ROSC, Stable Monitor
export default function OxygenDevice({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [device, setDevice] = useState(null);
  const [flowRate, setFlowRate] = useState(null);

  const devices = [
    { id: 'room_air', label: 'Room Air', icon: '🌬️', flowMin: 0, flowMax: 0, desc: 'No supplemental O₂' },
    { id: 'nasal_cannula', label: 'Nasal Cannula', icon: '👃', flowMin: 1, flowMax: 6, desc: '1-6 L/min → FiO₂ 24-44%', defaultFlow: 3 },
    { id: 'simple_mask', label: 'Simple Mask', icon: '😷', flowMin: 6, flowMax: 10, desc: '6-10 L/min → FiO₂ 40-60%', defaultFlow: 8 },
    { id: 'nrb', label: 'Non-Rebreather (NRB)', icon: '🎭', flowMin: 10, flowMax: 15, desc: '10-15 L/min → FiO₂ 60-95%', defaultFlow: 15 },
    { id: 'bvm', label: 'BVM (Bag-Valve-Mask)', icon: '🫁', flowMin: 10, flowMax: 15, desc: '10-15 L/min → FiO₂ ~100%', defaultFlow: 15 },
    { id: 'ventilator', label: 'Mechanical Ventilator', icon: '🖥️', flowMin: 21, flowMax: 100, desc: 'FiO₂ 21-100%', defaultFlow: 100, isFiO2: true },
  ];

  const handleSelect = (dev) => {
    setDevice(dev);
    setFlowRate(dev.defaultFlow || dev.flowMin);
    if (dev.flowMax === 0) {
      // Room air — save immediately
      addEvent({ elapsed, category: 'airway', type: `🌬️ O₂: Room Air (no supplemental)`, details: { device: dev.id } });
      onClose();
    }
  };

  const handleSave = () => {
    const unit = device.isFiO2 ? 'FiO₂' : 'L/min';
    addEvent({ elapsed, category: 'airway', type: `🌬️ O₂: ${device.label} ${flowRate}${device.isFiO2 ? '%' : ' L/min'}`, details: { device: device.id, flowRate } });
    onClose();
  };

  if (device && device.flowMax > 0) {
    return (
      <div className="glass-card !p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary">{device.icon} {device.label}</span>
          <button onClick={() => setDevice(null)} className="text-text-muted text-[10px]">← Change</button>
        </div>
        <ScrollPicker
          label={device.isFiO2 ? 'FiO₂' : 'Flow Rate'}
          value={flowRate}
          onChange={setFlowRate}
          min={device.flowMin}
          max={device.flowMax}
          step={1}
          unit={device.isFiO2 ? '%' : 'L/min'}
        />
        <button onClick={handleSave} className="w-full btn-action btn-info py-2.5 text-xs font-bold">
          Save O₂ Setting
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card !p-3 space-y-1.5">
      <div className="text-xs text-text-muted font-semibold mb-1">🌬️ Oxygen Device</div>
      {devices.map(dev => (
        <button key={dev.id} onClick={() => handleSelect(dev)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left bg-bg-primary border border-bg-tertiary">
          <span className="text-lg">{dev.icon}</span>
          <div>
            <div className="text-xs font-semibold text-text-primary">{dev.label}</div>
            <div className="text-[10px] text-text-muted">{dev.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
