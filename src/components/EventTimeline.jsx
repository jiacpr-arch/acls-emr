import { useCaseStore } from '../stores/caseStore';
import { formatElapsed, formatClock } from '../utils/formatTime';

const categoryColors = {
  cpr: 'border-success text-success',
  rhythm: 'border-info text-info',
  shock: 'border-shock text-shock',
  drug: 'border-purple text-purple',
  airway: 'border-cyan-400 text-cyan-400',
  access: 'border-yellow-400 text-yellow-400',
  etco2: 'border-teal-400 text-teal-400',
  vitals: 'border-pink-400 text-pink-400',
  procedure: 'border-indigo-400 text-indigo-400',
  other: 'border-text-muted text-text-muted',
};

const categoryIcons = {
  cpr: '🫀', rhythm: '📈', shock: '⚡', drug: '💉',
  airway: '🫁', access: '💉', etco2: '🌬️', vitals: '📊',
  procedure: '🔧', other: '📝'
};

export default function EventTimeline() {
  const events = useCaseStore(s => s.events);

  if (events.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-xl p-4 text-center text-text-muted text-sm">
        No events recorded yet
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted uppercase tracking-wider">Event Timeline</span>
        <span className="text-xs text-text-muted">{events.length} events</span>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {events.map((event, idx) => {
          const colors = categoryColors[event.category] || categoryColors.other;
          const icon = categoryIcons[event.category] || '📝';

          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-l-3 bg-bg-primary/50 ${colors}`}
            >
              <span className="text-sm">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{event.type}</div>
                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="text-xs text-text-muted truncate">
                    {Object.entries(event.details).map(([k, v]) => `${v}`).join(' · ')}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono text-text-secondary">{formatElapsed(event.elapsed)}</div>
                <div className="text-[10px] text-text-muted">{formatClock(new Date(event.timestamp))}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
