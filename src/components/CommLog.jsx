import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

// Communication Log — track who was notified
export default function CommLog({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const events = useCaseStore(s => s.events);
  const [name, setName] = useState('');

  const commEvents = events.filter(e => e.type?.includes('📞') || e.type?.includes('Notified') || e.type?.includes('Consult'));

  const quickNotify = [
    { label: 'Attending Physician', icon: '👨‍⚕️' },
    { label: 'Cardiology Consult', icon: '🫀' },
    { label: 'Neurology Consult', icon: '🧠' },
    { label: 'Surgery Consult', icon: '🔪' },
    { label: 'ICU / CCU', icon: '🏥' },
    { label: 'Cath Lab Activation', icon: '⚡' },
    { label: 'Family Notified', icon: '👥' },
    { label: 'Code Team Leader', icon: '👑' },
    { label: 'Anesthesia', icon: '🫁' },
    { label: 'Pharmacy', icon: '💊' },
  ];

  const logComm = (label, personName = '') => {
    const detail = personName ? `${label}: ${personName}` : label;
    addEvent({ elapsed, category: 'other', type: `📞 ${detail}`, details: { comm: label, person: personName } });
    setName('');
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <span className="font-bold text-text-primary">📞 Communication Log</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Quick notify buttons */}
        <div className="text-xs text-text-muted font-semibold mb-1">Quick Notify</div>
        <div className="grid grid-cols-2 gap-1.5">
          {quickNotify.map(n => (
            <button key={n.label} onClick={() => logComm(`Notified: ${n.label}`)}
              className="btn-action btn-ghost py-2.5 text-[10px] text-left px-3">
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* Custom entry */}
        <div className="glass-card !p-3 space-y-2">
          <div className="text-xs text-text-muted font-semibold">Custom Notification</div>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Name / Department / Details"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-xs text-text-primary focus:outline-none focus:border-info" />
          <button onClick={() => { if (name.trim()) logComm('Notified', name.trim()); }} disabled={!name.trim()}
            className="w-full btn-action btn-info py-2.5 text-xs font-bold disabled:opacity-40">
            📞 Log Notification
          </button>
        </div>

        {/* Log history */}
        {commEvents.length > 0 && (
          <div>
            <div className="text-xs text-text-muted font-semibold mb-1">Communication History</div>
            <div className="space-y-1">
              {commEvents.map((e, i) => (
                <div key={i} className="glass-card !p-2 flex items-center gap-2">
                  <span className="text-xs">📞</span>
                  <span className="flex-1 text-xs text-text-primary">{e.type?.replace('📞 ', '')}</span>
                  <span className="text-[9px] text-text-muted font-mono">{Math.floor(e.elapsed / 60)}:{String(e.elapsed % 60).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
