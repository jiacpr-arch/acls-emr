import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import OxygenDevice from './OxygenDevice';
import PanelWrapper from './PanelWrapper';
import { Wind, Syringe, Bone } from 'lucide-react';

export default function AirwayPanel({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);

  const [phase, setPhase] = useState('select');
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
      onClose();
    } else {
      setPhase('details');
    }
  };

  const saveDetails = () => {
    const details = { device, tubeSize, tubeDepth, cuffPressure, attempts, confirmMethod, ventMode };
    addEvent({
      elapsed,
      category: 'airway',
      type: `🫁 ${device} #${tubeSize} depth ${tubeDepth}cm cuff ${cuffPressure}cmH₂O (${attempts} attempt${attempts > 1 ? 's' : ''})`,
      details,
    });
    useCaseStore.getState().updateAirway?.(details);
    onClose();
  };

  const logAccess = (type) => {
    addEvent({ elapsed, category: 'access', type, details: {} });
    onClose();
  };

  if (phase === 'details') {
    return (
      <PanelWrapper title={`${device} — Details`} icon={<Wind size={18} strokeWidth={2.2} />} onClose={onClose} onSave={saveDetails}>
        <div className="space-y-3">
          <div className="dash-card !p-3 space-y-2">
            <ScrollPicker label="Tube Size" value={tubeSize} onChange={setTubeSize} min={3} max={9} step={0.5} />
            <ScrollPicker label="Depth" value={tubeDepth} onChange={setTubeDepth} min={15} max={30} step={1} unit="cm" targetLow={20} targetHigh={24} />
            <ScrollPicker label="Cuff Pressure" value={cuffPressure} onChange={setCuffPressure} min={10} max={40} step={1} unit="cmH₂O" targetLow={20} targetHigh={30} />
          </div>
          <div className="dash-card !p-3">
            <div className="text-overline mb-2">Intubation Attempts</div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setAttempts(n)}
                  className={`btn ${attempts === n ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="dash-card !p-3">
            <div className="text-overline mb-2">Confirmation Method</div>
            <div className="grid grid-cols-2 gap-2">
              {['EtCO₂ Waveform', 'Auscultation', 'Both', 'CXR'].map(m => (
                <button key={m} onClick={() => setConfirmMethod(m)}
                  className={`btn ${confirmMethod === m ? 'btn-success' : 'btn-ghost'} btn-sm`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="dash-card !p-3">
            <div className="text-overline mb-2">Ventilation Mode</div>
            <div className="grid grid-cols-3 gap-2">
              {['BVM', 'Mechanical Vent', 'Spontaneous'].map(m => (
                <button key={m} onClick={() => setVentMode(m)}
                  className={`btn ${ventMode === m ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper title="Airway & Access" icon={<Wind size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="text-overline mb-2">Airway Device</div>
      <div className="space-y-2">
        <button onClick={() => logDevice('BVM + O₂')} className="btn btn-info btn-xl btn-block">
          <Wind size={18} strokeWidth={2.4} /> BVM + O₂
          <span className="text-[11px] font-normal opacity-80 ml-1">Basic — easiest first</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => logDevice('SGA (LMA/i-gel)')} className="btn btn-ghost btn-lg btn-block">
            SGA (LMA)
          </button>
          <button onClick={() => logDevice('ETT')} className="btn btn-ghost btn-lg btn-block">
            ETT
          </button>
        </div>
      </div>

      <div className="text-overline mb-2 mt-4">Oxygen Delivery</div>
      <OxygenDevice onClose={() => {}} />

      <div className="text-overline mb-2 mt-4">Vascular Access</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => logAccess('💉 IV Access')} className="btn btn-ghost btn-lg btn-block">
          <Syringe size={16} strokeWidth={2.2} /> IV Access
        </button>
        <button onClick={() => logAccess('🦴 IO Access')} className="btn btn-ghost btn-lg btn-block">
          <Bone size={16} strokeWidth={2.2} /> IO Access
        </button>
      </div>

      <div className="text-overline mb-2 mt-4">After Advanced Airway</div>
      <div className="instruction-list">
        <div className="instruction-item">1 breath every 6 seconds (10/min)</div>
        <div className="instruction-item">Continuous CPR (no 30:2 pause)</div>
        <div className="instruction-item">Confirm with waveform EtCO₂</div>
      </div>
    </PanelWrapper>
  );
}
