import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import { Wind, ChevronLeft, Stethoscope } from 'lucide-react';

const allDevices = [
  { id: 'room_air', label: 'Room Air', Icon: Wind, flowMin: 0, flowMax: 0, desc: 'No supplemental O₂', for: ['pulse_present', 'post_rosc'] },
  { id: 'nasal_cannula', label: 'Nasal Cannula', Icon: Wind, flowMin: 1, flowMax: 6, desc: '1-6 L/min → FiO₂ 24-44%', defaultFlow: 3, for: ['pulse_present', 'post_rosc'] },
  { id: 'simple_mask', label: 'Simple Mask', Icon: Wind, flowMin: 6, flowMax: 10, desc: '6-10 L/min → FiO₂ 40-60%', defaultFlow: 8, for: ['pulse_present', 'post_rosc'] },
  { id: 'nrb', label: 'Non-Rebreather (NRB)', Icon: Wind, flowMin: 10, flowMax: 15, desc: '10-15 L/min → FiO₂ 60-95%', defaultFlow: 15, for: ['pulse_present', 'post_rosc'] },
  { id: 'bvm', label: 'BVM (Bag-Valve-Mask)', Icon: Wind, flowMin: 10, flowMax: 15, desc: '10-15 L/min → FiO₂ ~100%', defaultFlow: 15, for: ['cpr', 'pulse_present', 'post_rosc'] },
  { id: 'ventilator', label: 'Mechanical Ventilator', Icon: Stethoscope, flowMin: 21, flowMax: 100, desc: 'FiO₂ 21-100%', defaultFlow: 100, isFiO2: true, for: ['post_rosc'] },
];

export default function OxygenDevice({ onClose, situation = 'pulse_present' }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [device, setDevice] = useState(null);
  const [flowRate, setFlowRate] = useState(null);

  const devices = allDevices.filter(d => d.for.includes(situation));

  const handleSelect = (dev) => {
    setDevice(dev);
    setFlowRate(dev.defaultFlow || dev.flowMin);
    if (dev.flowMax === 0) {
      addEvent({ elapsed, category: 'airway', type: `🌬️ O₂: Room Air (no supplemental)`, details: { device: dev.id } });
      onClose();
    }
  };

  const handleSave = () => {
    addEvent({ elapsed, category: 'airway', type: `🌬️ O₂: ${device.label} ${flowRate}${device.isFiO2 ? '%' : ' L/min'}`, details: { device: device.id, flowRate } });
    onClose();
  };

  if (device && device.flowMax > 0) {
    const DIcon = device.Icon;
    return (
      <div className="dash-card !p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body-strong text-text-primary inline-flex items-center gap-2">
            <DIcon size={16} strokeWidth={2.2} className="text-text-secondary" /> {device.label}
          </span>
          <button onClick={() => setDevice(null)}
            className="text-text-muted text-caption inline-flex items-center gap-1 hover:text-text-primary">
            <ChevronLeft size={12} strokeWidth={2.2} /> Change
          </button>
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
        <button onClick={handleSave} className="btn btn-info btn-block">Save O₂ Setting</button>
      </div>
    );
  }

  return (
    <div className="dash-card !p-3 space-y-1.5">
      <div className="section-header inline-flex items-center gap-1.5 !mb-2">
        <Wind size={11} strokeWidth={2.2} /> Oxygen Device
      </div>
      {devices.map(dev => {
        const DIcon = dev.Icon;
        return (
          <button key={dev.id} onClick={() => handleSelect(dev)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left bg-bg-primary border border-border hover:bg-bg-tertiary transition-colors"
            style={{ borderRadius: 'var(--radius)' }}>
            <div className="w-8 h-8 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
              style={{ borderRadius: 'var(--radius-sm)' }}>
              <DIcon size={15} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-caption font-semibold text-text-primary truncate">{dev.label}</div>
              <div className="text-[10px] text-text-muted truncate">{dev.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
