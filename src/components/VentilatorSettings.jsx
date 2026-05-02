import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import ScrollPicker from './ScrollPicker';
import PanelWrapper from './PanelWrapper';
import { Stethoscope, AlertTriangle } from 'lucide-react';

// Ventilator Settings — adjustable anytime
export default function VentilatorSettings({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const patient = useCaseStore(s => s.patient);

  const [ventMode, setVentMode] = useState('AC');
  const [fio2, setFio2] = useState(100);
  const [tv, setTv] = useState(450);
  const [rr, setRr] = useState(14);
  const [peep, setPeep] = useState(5);
  const [ps, setPs] = useState(10);

  const mv = ((tv * rr) / 1000).toFixed(1);
  const weight = patient?.weight || 70;
  const tvPerKg = (tv / weight).toFixed(1);

  const save = () => {
    addEvent({
      elapsed, category: 'airway',
      type: `🖥️ Vent: ${ventMode} FiO₂ ${fio2}% TV ${tv}ml RR ${rr} PEEP ${peep}`,
      details: { ventMode, fio2, tv, rr, peep, ps, mv, tvPerKg },
    });
    onClose();
  };

  return (
    <PanelWrapper title="Ventilator Settings" icon={<Stethoscope size={18} strokeWidth={2.2} />} onClose={onClose} onSave={save}>
      <div className="space-y-3">
        {/* Mode */}
        <div className="dash-card !p-3">
          <div className="section-header !mb-2">Mode</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['AC', 'SIMV', 'PS', 'CPAP'].map(m => (
              <button key={m} onClick={() => setVentMode(m)}
                className={`py-2.5 rounded-xl text-xs font-bold ${
                  ventMode === m ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                }`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="dash-card !p-3 space-y-3">
          <ScrollPicker label="FiO₂" value={fio2} onChange={setFio2}
            min={21} max={100} step={1} unit="%"
            targetLow={21} targetHigh={60} alertHigh={60} />
          {fio2 > 60 && (
            <div className="text-[11px] text-warning font-bold px-1 inline-flex items-center gap-1.5">
              <AlertTriangle size={11} strokeWidth={2.4} /> FiO₂ &gt;60% — Try to wean if SpO₂ allows
            </div>
          )}

          <ScrollPicker label="Tidal Volume (TV)" value={tv} onChange={setTv}
            min={200} max={800} step={10} unit="ml" />

          <ScrollPicker label="Respiratory Rate (RR)" value={rr} onChange={setRr}
            min={6} max={30} step={1} unit="/min"
            targetLow={12} targetHigh={20} />

          <ScrollPicker label="PEEP" value={peep} onChange={setPeep}
            min={0} max={20} step={1} unit="cmH₂O"
            targetLow={5} targetHigh={10} />

          {(ventMode === 'PS' || ventMode === 'CPAP') && (
            <ScrollPicker label="Pressure Support" value={ps} onChange={setPs}
              min={0} max={25} step={1} unit="cmH₂O" />
          )}
        </div>

        {/* Calculated values */}
        <div className="dash-card !p-3">
          <div className="section-header !mb-2">Calculated</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-box">
              <div className="stat-value text-lg text-text-primary">{mv}</div>
              <div className="stat-label">MV (L/min)</div>
            </div>
            <div className="stat-box">
              <div className={`stat-value text-lg ${parseFloat(tvPerKg) > 8 ? 'text-danger' : 'text-success'}`}>{tvPerKg}</div>
              <div className="stat-label">TV/kg (ml/kg)</div>
            </div>
          </div>
          {parseFloat(tvPerKg) > 8 && (
            <div className="text-[11px] text-danger font-bold mt-2 inline-flex items-center gap-1.5">
              <AlertTriangle size={11} strokeWidth={2.4} /> TV &gt;8ml/kg — Use lung protective ventilation (6-8 ml/kg)
            </div>
          )}
          <div className="text-[9px] text-text-muted mt-1">Based on weight: {weight}kg</div>
        </div>
      </div>
    </PanelWrapper>
  );
}
