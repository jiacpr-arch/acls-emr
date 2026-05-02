import { useState } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import PanelWrapper from './PanelWrapper';
import {
  Phone, Stethoscope, HeartPulse, Brain, Hospital, Zap, Users,
  Crown, Wind, Pill, Send,
} from 'lucide-react';

const quickNotify = [
  { label: 'Attending Physician', Icon: Stethoscope },
  { label: 'Cardiology Consult', Icon: HeartPulse },
  { label: 'Neurology Consult', Icon: Brain },
  { label: 'Surgery Consult', Icon: Stethoscope },
  { label: 'ICU / CCU', Icon: Hospital },
  { label: 'Cath Lab Activation', Icon: Zap },
  { label: 'Family Notified', Icon: Users },
  { label: 'Code Team Leader', Icon: Crown },
  { label: 'Anesthesia', Icon: Wind },
  { label: 'Pharmacy', Icon: Pill },
];

export default function CommLog({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const events = useCaseStore(s => s.events);
  const [name, setName] = useState('');

  const commEvents = events.filter(e => e.type?.includes('📞') || e.type?.includes('Notified') || e.type?.includes('Consult'));

  const logComm = (label, personName = '') => {
    const detail = personName ? `${label}: ${personName}` : label;
    addEvent({ elapsed, category: 'other', type: `📞 ${detail}`, details: { comm: label, person: personName } });
    setName('');
  };

  return (
    <PanelWrapper title="Communication Log" icon={<Phone size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="space-y-3">
        {/* Quick notify */}
        <div>
          <div className="section-header">Quick Notify</div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickNotify.map(n => {
              const NIcon = n.Icon;
              return (
                <button key={n.label} onClick={() => logComm(`Notified: ${n.label}`)}
                  className="dash-card !p-2.5 flex items-center gap-2 text-left hover:bg-bg-tertiary transition-colors">
                  <div className="w-7 h-7 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <NIcon size={13} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary truncate">{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom entry */}
        <div className="dash-card space-y-2">
          <div className="section-header !mb-1">Custom Notification</div>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Name / Department / Details"
            className="w-full text-caption" />
          <button onClick={() => { if (name.trim()) logComm('Notified', name.trim()); }} disabled={!name.trim()}
            className="btn btn-info btn-block disabled:opacity-40">
            <Send size={14} strokeWidth={2.2} /> Log Notification
          </button>
        </div>

        {/* Log history */}
        {commEvents.length > 0 && (
          <div>
            <div className="section-header">Communication History</div>
            <div className="space-y-1">
              {commEvents.map((e, i) => (
                <div key={i} className="dash-card !p-2 flex items-center gap-2">
                  <Phone size={12} strokeWidth={2.2} className="text-text-muted shrink-0" />
                  <span className="flex-1 text-caption text-text-primary truncate">{e.type?.replace('📞 ', '')}</span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {Math.floor(e.elapsed / 60)}:{String(e.elapsed % 60).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}
