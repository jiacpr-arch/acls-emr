import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import OxygenDevice from './OxygenDevice';
import PanelWrapper from './PanelWrapper';

// Enhanced Airway Panel — device selection + details
// Available from ALL pathways (not just cardiac arrest)
export default function AirwayPanel({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  const [phase, setPhase] = useState('select'); // select, details, access
  const [device, setDevice] = useState(null);
  const [tubeSize, setTubeSize] = useState(7.5);
  const [tubeDepth, setTubeDepth] = useState(22);
  const [cuffPressure, setCuffPressure] = useState(25);
  const [attempts, setAttempts] = useState(1);
  const [confirmMethod, setConfirmMethod] = useState(null);
  const [ventMode, setVentMode] = useState(null);

  const logDevice = (dev) => {
    setDevice(dev);
    addEvent({ elapsed, category: 'airway', type: `🫁 ${dev}`, details: { device: dev } });
    if (dev === 'BVM + O₂') {
      onClose(); // BVM doesn't need detail
    } else {
      setPhase('details');
    }
  };

  const saveDetails = () => {
    const details = {
      device, tubeSize, tubeDepth, cuffPressure, attempts, confirmMethod, ventMode,
    };
    addEvent({
      elapsed,
      category: 'airway',
      type: `🫁 ${device} #${tubeSize} depth ${tubeDepth}cm cuff ${cuffPressure}cmH₂O (${attempts} attempt${attempts > 1 ? 's' : ''})`,
      details,
    });
    // Save to caseStore airway
    useCaseStore.getState().updateAirway?.(details);
    onClose();
  };

  const logAccess = (type) => {
    addEvent({ elapsed, category: 'access', type, details: {} });
    onClose();
  };

  if (phase === 'details') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
          <span className="font-bold text-text-primary">🫁 {device} — Details</span>
          <div className="flex gap-2">
            <button onClick={saveDetails} className="btn-action btn-info px-4 py-1.5 text-xs !min-h-0">Save</button>
            <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="glass-card !p-3 space-y-2">
            <ScrollPicker label="Tube Size" value={tubeSize} onChange={setTubeSize}
              min={3} max={9} step={0.5} />
            <ScrollPicker label="Depth" value={tubeDepth} onChange={setTubeDepth}
              min={15} max={30} step={1} unit="cm" targetLow={20} targetHigh={24} />
            <ScrollPicker label="Cuff Pressure" value={cuffPressure} onChange={setCuffPressure}
              min={10} max={40} step={1} unit="cmH₂O" targetLow={20} targetHigh={30} />
          </div>

          <div className="glass-card !p-3">
            <div className="text-xs text-text-muted font-medium mb-2">Intubation Attempts</div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setAttempts(n)}
                  className={`py-2.5 rounded-xl text-sm font-bold ${
                    attempts === n ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{n}</button>
              ))}
            </div>
          </div>

          <div className="glass-card !p-3">
            <div className="text-xs text-text-muted font-medium mb-2">Confirmation Method</div>
            <div className="grid grid-cols-2 gap-2">
              {['EtCO₂ Waveform', 'Auscultation', 'Both', 'CXR'].map(m => (
                <button key={m} onClick={() => setConfirmMethod(m)}
                  className={`py-2.5 rounded-xl text-xs font-semibold ${
                    confirmMethod === m ? 'bg-success text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          <div className="glass-card !p-3">
            <div className="text-xs text-text-muted font-medium mb-2">Ventilation Mode</div>
            <div className="grid grid-cols-3 gap-2">
              {['BVM', 'Mechanical Vent', 'Spontaneous'].map(m => (
                <button key={m} onClick={() => setVentMode(m)}
                  className={`py-2.5 rounded-xl text-xs font-semibold ${
                    ventMode === m ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Device selection + IV/IO access
  return (
    <PanelWrapper title="Airway & Access" icon="🫁" onClose={onClose}>
        <div className="text-xs text-text-muted font-semibold uppercase mb-1">Airway Device</div>
        <div className="space-y-2">
          <button onClick={() => logDevice('BVM + O₂')}
            className="w-full btn-action btn-info py-4 text-sm font-semibold">
            🫁 BVM + O₂
            <div className="text-[10px] font-normal opacity-70 mt-0.5">Basic — easiest first</div>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => logDevice('SGA (LMA/i-gel)')}
              className="btn-action btn-ghost py-3.5 text-sm font-semibold">
              SGA (LMA)
            </button>
            <button onClick={() => logDevice('ETT')}
              className="btn-action btn-ghost py-3.5 text-sm font-semibold">
              ETT
            </button>
          </div>
        </div>

        <div className="text-xs text-text-muted font-semibold uppercase mb-1 mt-4">Oxygen Delivery</div>
        <OxygenDevice onClose={() => {}} />

        <div className="text-xs text-text-muted font-semibold uppercase mb-1 mt-4">Vascular Access</div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => logAccess('💉 IV Access')}
            className="btn-action btn-ghost py-3.5 text-sm">💉 IV Access</button>
          <button onClick={() => logAccess('🦴 IO Access')}
            className="btn-action btn-ghost py-3.5 text-sm">🦴 IO Access</button>
        </div>

        <div className="text-xs text-text-muted font-semibold uppercase mb-1 mt-4">After Advanced Airway</div>
        <div className="glass-card !p-3 text-xs text-text-secondary space-y-1">
          <div>• 1 breath every 6 seconds (10/min)</div>
          <div>• Continuous CPR (no 30:2 pause)</div>
          <div>• Confirm with waveform EtCO₂</div>
        </div>
    </PanelWrapper>
  );
}
