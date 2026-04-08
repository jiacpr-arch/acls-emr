import PanelWrapper from './PanelWrapper';
import { useCaseStore } from '../stores/caseStore';
import { formatElapsed } from '../utils/formatTime';

// ===== EVENT LOG PANEL =====
export function EventLogPanel({ onClose }) {
  const events = useCaseStore(s => s.events);
  const icons = { cpr: '🫀', rhythm: '📈', shock: '⚡', drug: '💉', airway: '🫁', access: '💉', etco2: '🌬️', other: '📝' };

  return (
    <div className="absolute bottom-0 left-0 right-0 max-h-[50vh] overflow-y-auto p-4 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-text-primary text-sm">📋 Event Log ({events.length})</span>
        <button onClick={onClose} className="btn-action btn-ghost px-3 py-1.5 text-xs !min-h-0">Close ✕</button>
      </div>
      {events.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-4">No events yet</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((ev, i) => (
            <div key={i} className="glass-card flex items-center gap-2.5 px-3.5 py-2.5">
              <span>{icons[ev.category] || '📝'}</span>
              <span className="flex-1 truncate font-semibold text-sm text-text-primary">{ev.type}</span>
              <span className="text-text-muted font-mono text-xs shrink-0">{formatElapsed(ev.elapsed)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== PATIENT INFO PANEL =====
export function PatientInfoPanel({ onClose }) {
  const { patient, updatePatient } = useCaseStore();

  const Field = ({ label, field, placeholder, type = 'text' }) => (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</label>
      <input type={type} value={patient[field] || ''}
        onChange={e => updatePatient(field, type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info" />
    </div>
  );

  return (
    <PanelWrapper title="Patient Information" icon="👤" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="HN" field="hn" placeholder="Hospital Number" />
          <Field label="Name" field="name" placeholder="Patient Name" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Age" field="age" placeholder="Age" type="number" />
          <Field label="Weight (kg)" field="weight" placeholder="kg" type="number" />
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Gender</label>
            <div className="flex gap-1.5 mt-0.5">
              {['M', 'F'].map(g => (
                <button key={g} onClick={() => updatePatient('gender', g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    patient.gender === g ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{g === 'M' ? '♂ Male' : '♀ Female'}</button>
              ))}
            </div>
          </div>
        </div>
        <Field label="Chief Complaint" field="chiefComplaint" placeholder="Reason for arrest / presentation" />
        <Field label="Location" field="location" placeholder="Ward / ER / ICU / Outside hospital" />
        <Field label="PMH" field="pmh" placeholder="Past medical history (comma separated)" />
        <Field label="Medications" field="medications" placeholder="Current medications" />
        <Field label="Allergies" field="allergies" placeholder="Drug allergies" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Witnessed?</label>
            <div className="flex gap-1.5 mt-0.5">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => updatePatient('witnessed', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                    patient.witnessed === v ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Bystander CPR?</label>
            <div className="flex gap-1.5 mt-0.5">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => updatePatient('bystanderCPR', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                    patient.bystanderCPR === v ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                  }`}>{v ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PanelWrapper>
  );
}

// ===== TEAM PANEL =====
export function TeamPanel({ onClose }) {
  const { team, setTeam } = useCaseStore();
  const updateField = (field, value) => setTeam({ ...team, [field]: value });

  const RoleField = ({ label, field, placeholder, icon }) => (
    <div>
      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{icon} {label}</label>
      <input type="text" value={team[field] || ''} onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info" />
    </div>
  );

  return (
    <PanelWrapper title="Team Assignment" icon="👥" onClose={onClose}>
      <div className="space-y-3">
        <RoleField icon="👑" label="Team Leader" field="leader" placeholder="Name" />
        <RoleField icon="🫁" label="Airway" field="airway" placeholder="Name" />
        <RoleField icon="💉" label="Drug / IV" field="drugAdmin" placeholder="Name" />
        <RoleField icon="📝" label="Recorder" field="recorder" placeholder="Name" />
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">🫀 Compressors</label>
          <input type="text"
            value={Array.isArray(team.compressor) ? team.compressor.join(', ') : (team.compressor || '')}
            onChange={e => updateField('compressor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Names (comma separated)"
            className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">👥 Others</label>
          <input type="text"
            value={Array.isArray(team.others) ? team.others.join(', ') : (team.others || '')}
            onChange={e => updateField('others', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Other team members (comma separated)"
            className="w-full mt-0.5 px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info" />
        </div>
        <div className="glass-card !p-3 text-center text-xs text-text-muted">
          Rotate compressors every 2 minutes to maintain CPR quality
        </div>
      </div>
    </PanelWrapper>
  );
}
