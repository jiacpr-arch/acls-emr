import PanelWrapper from './PanelWrapper';
import { useCaseStore } from '../stores/caseStore';
import { formatElapsed } from '../utils/formatTime';
import {
  HeartPulse, Activity, Zap, Syringe, Wind, Stethoscope, FileText,
  X, User, Users, Crown, Edit,
} from 'lucide-react';

const eventIcons = {
  cpr: HeartPulse, rhythm: Activity, shock: Zap, drug: Syringe,
  airway: Wind, access: Syringe, etco2: Stethoscope, other: FileText,
};

// ===== EVENT LOG PANEL =====
export function EventLogPanel({ onClose }) {
  const events = useCaseStore(s => s.events);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 max-h-[50vh] overflow-y-auto p-4 z-50 animate-slide-up bg-bg-secondary border-t border-border"
      style={{
        borderTopLeftRadius: 'var(--radius-2xl)',
        borderTopRightRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-pop)',
      }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-headline text-text-primary inline-flex items-center gap-2">
          <FileText size={16} strokeWidth={2.2} /> Event Log ({events.length})
        </span>
        <button onClick={onClose}
          className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
          style={{ borderRadius: 99 }} aria-label="Close">
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>
      {events.length === 0 ? (
        <p className="text-text-muted text-caption text-center py-4">No events yet</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((ev, i) => {
            const I = eventIcons[ev.category] || FileText;
            return (
              <div key={i} className="dash-card !p-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <I size={13} strokeWidth={2} />
                </div>
                <span className="flex-1 truncate text-body-strong text-text-primary">{ev.type}</span>
                <span className="text-text-muted font-mono text-[11px] shrink-0">{formatElapsed(ev.elapsed)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PatientField({ label, field, placeholder, type = 'text', patient, updatePatient }) {
  return (
    <div>
      <label className="text-overline">{label}</label>
      <input type={type} value={patient[field] || ''}
        onChange={e => updatePatient(field, type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 text-body" />
    </div>
  );
}

// ===== PATIENT INFO PANEL =====
export function PatientInfoPanel({ onClose }) {
  const { patient, updatePatient } = useCaseStore();
  const fieldProps = { patient, updatePatient };

  return (
    <PanelWrapper title="Patient Information" icon={<User size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <PatientField {...fieldProps} label="HN" field="hn" placeholder="Hospital Number" />
          <PatientField {...fieldProps} label="Name" field="name" placeholder="Patient Name" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PatientField {...fieldProps} label="Age" field="age" placeholder="Age" type="number" />
          <PatientField {...fieldProps} label="Weight (kg)" field="weight" placeholder="kg" type="number" />
          <div>
            <label className="text-overline">Gender</label>
            <div className="flex gap-1.5 mt-1">
              {['M', 'F'].map(g => (
                <button key={g} onClick={() => updatePatient('gender', g)}
                  className={`flex-1 py-2 text-body-strong transition-colors ${
                    patient.gender === g ? 'bg-info text-white' : 'bg-bg-primary border border-border text-text-secondary'
                  }`} style={{ borderRadius: 'var(--radius-sm)' }}>
                  {g === 'M' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <PatientField {...fieldProps} label="Chief Complaint" field="chiefComplaint" placeholder="Reason for arrest / presentation" />
        <PatientField {...fieldProps} label="Location" field="location" placeholder="Ward / ER / ICU / Outside hospital" />
        <PatientField {...fieldProps} label="PMH" field="pmh" placeholder="Past medical history (comma separated)" />
        <PatientField {...fieldProps} label="Medications" field="medications" placeholder="Current medications" />
        <PatientField {...fieldProps} label="Allergies" field="allergies" placeholder="Drug allergies" />
        <div className="grid grid-cols-2 gap-3">
          <YesNoField label="Witnessed?" field="witnessed" patient={patient} updatePatient={updatePatient} />
          <YesNoField label="Bystander CPR?" field="bystanderCPR" patient={patient} updatePatient={updatePatient} />
        </div>
      </div>
    </PanelWrapper>
  );
}

function YesNoField({ label, field, patient, updatePatient }) {
  return (
    <div>
      <label className="text-overline">{label}</label>
      <div className="flex gap-1.5 mt-1">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => updatePatient(field, v)}
            className={`flex-1 py-2 text-body-strong transition-colors ${
              patient[field] === v ? 'bg-info text-white' : 'bg-bg-primary border border-border text-text-secondary'
            }`} style={{ borderRadius: 'var(--radius-sm)' }}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoleField({ Icon, label, field, placeholder, team, onUpdate }) {
  return (
    <div>
      <label className="text-overline inline-flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.2} /> {label}
      </label>
      <input type="text" value={team[field] || ''} onChange={e => onUpdate(field, e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 text-body" />
    </div>
  );
}

// ===== TEAM PANEL =====
export function TeamPanel({ onClose }) {
  const { team, setTeam } = useCaseStore();
  const updateField = (field, value) => setTeam({ ...team, [field]: value });
  const roleProps = { team, onUpdate: updateField };

  return (
    <PanelWrapper title="Team Assignment" icon={<Users size={18} strokeWidth={2.2} />} onClose={onClose}>
      <div className="space-y-3">
        <RoleField {...roleProps} Icon={Crown} label="Team Leader" field="leader" placeholder="Name" />
        <RoleField {...roleProps} Icon={Wind} label="Airway" field="airway" placeholder="Name" />
        <RoleField {...roleProps} Icon={Syringe} label="Drug / IV" field="drugAdmin" placeholder="Name" />
        <RoleField {...roleProps} Icon={Edit} label="Recorder" field="recorder" placeholder="Name" />
        <div>
          <label className="text-overline inline-flex items-center gap-1.5">
            <HeartPulse size={11} strokeWidth={2.2} /> Compressors
          </label>
          <input type="text"
            value={Array.isArray(team.compressor) ? team.compressor.join(', ') : (team.compressor || '')}
            onChange={e => updateField('compressor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Names (comma separated)"
            className="w-full mt-1 text-body" />
        </div>
        <div>
          <label className="text-overline inline-flex items-center gap-1.5">
            <Users size={11} strokeWidth={2.2} /> Others
          </label>
          <input type="text"
            value={Array.isArray(team.others) ? team.others.join(', ') : (team.others || '')}
            onChange={e => updateField('others', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Other team members (comma separated)"
            className="w-full mt-1 text-body" />
        </div>
        <div className="dash-card !p-3 text-center text-caption text-text-muted">
          Rotate compressors every 2 minutes to maintain CPR quality
        </div>
      </div>
    </PanelWrapper>
  );
}
