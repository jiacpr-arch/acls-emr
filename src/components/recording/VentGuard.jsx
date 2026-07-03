import { useCaseStore } from '../../stores/caseStore';
import VentilatorSettings from '../VentilatorSettings';

export default function VentGuard({ onClose, onNeedAirway }) {
  const events = useCaseStore(s => s.events);
  const hasAirway = events.some(e => e.category === 'airway' && (e.type?.includes('ETT') || e.type?.includes('SGA') || e.type?.includes('LMA')));

  if (!hasAirway) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="glass-card !p-4 m-6 text-center space-y-3" onClick={e => e.stopPropagation()}>
          <div className="text-3xl">🫁</div>
          <div className="text-sm font-bold text-text-primary">Place ETT/SGA first</div>
          <div className="text-xs text-text-muted">Ventilator settings require advanced airway</div>
          <button onClick={onNeedAirway} className="w-full btn-action btn-info py-3 text-sm font-bold">
            🫁 Open Airway Panel
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-block">Cancel</button>
        </div>
      </div>
    );
  }

  return <VentilatorSettings onClose={onClose} />;
}
