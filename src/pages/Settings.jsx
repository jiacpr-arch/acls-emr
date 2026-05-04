import { useSettingsStore } from '../stores/settingsStore';
import {
  Hospital, GraduationCap, HeartPulse,
  Volume2, VolumeX, Activity, Bell, RefreshCw, Users,
  Sun, Moon, Monitor,
} from '../components/ui/Icon';

export default function Settings() {
  const settings = useSettingsStore();

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-title text-text-primary">Settings</h1>
        <p className="text-caption text-text-muted mt-0.5">Personalise your ACLS recorder</p>
      </div>

      {/* Mode */}
      <SettingSection title="Mode">
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard
            active={settings.mode === 'clinical'}
            onClick={() => settings.setMode('clinical')}
            tone="danger"
            Icon={Hospital}
            title="Clinical"
            sub="Real codes — no hints"
          />
          <ChoiceCard
            active={settings.mode === 'training'}
            onClick={() => settings.setMode('training')}
            tone="info"
            Icon={GraduationCap}
            title="Training"
            sub="Step-by-step guided"
          />
        </div>
      </SettingSection>

      {/* Language */}
      <SettingSection title="Language">
        <div className="grid grid-cols-2 gap-2">
          {[{ key: 'en', flag: '🇬🇧', label: 'English' }, { key: 'th', flag: '🇹🇭', label: 'ไทย' }].map(l => (
            <button key={l.key} onClick={() => settings.setLanguage(l.key)}
              className={`flex items-center justify-center gap-2 py-3 px-3 transition-colors ${
                settings.language === l.key
                  ? 'bg-info/10 text-info border border-info/40'
                  : 'bg-bg-secondary text-text-primary border border-border'
              }`} style={{ borderRadius: 'var(--radius-md)' }}>
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="text-body-strong">{l.label}</span>
            </button>
          ))}
        </div>
      </SettingSection>

      {/* Appearance & Audio */}
      <SettingSection title="Appearance & Audio">
        <ThemeSelector value={settings.theme} onChange={settings.setTheme} />
        <ToggleRow Icon={settings.soundEnabled ? Volume2 : VolumeX} label="Sound Effects" value={settings.soundEnabled} onToggle={settings.toggleSound} />
        <ToggleRow Icon={Activity} label="Metronome" value={settings.metronomeEnabled} onToggle={settings.toggleMetronome} />
      </SettingSection>

      {/* Alerts */}
      <SettingSection title="Alerts">
        <ToggleRow Icon={Bell} label="Cycle Alert (2 min)" value={settings.cycleAlertEnabled} onToggle={settings.toggleCycleAlert} />
        <ToggleRow Icon={RefreshCw} label="Drug Reminders" value={settings.drugReminderEnabled} onToggle={settings.toggleDrugReminder} />
        <ToggleRow Icon={Users} label="Compressor Rotation (2 min)" value={settings.compressorRotateAlert} onToggle={settings.toggleCompressorRotateAlert} />
      </SettingSection>

      {/* Metronome rate */}
      {settings.metronomeEnabled && (
        <SettingSection title="Metronome Rate">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-strong text-text-primary">{settings.metronomeRate} <span className="text-caption text-text-muted font-normal">bpm</span></span>
            <span className="badge bg-success/15 text-success">Target 100–120</span>
          </div>
          <input
            type="range"
            min={80} max={140}
            value={settings.metronomeRate}
            onChange={e => settings.setMetronomeRate(parseInt(e.target.value))}
            className="w-full accent-info"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1 font-mono">
            <span>80</span><span>110</span><span>140</span>
          </div>
        </SettingSection>
      )}

      {/* About */}
      <div className="dash-card text-center space-y-1.5 py-6">
        <div
          className="w-14 h-14 mx-auto inline-flex items-center justify-center mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.28)',
          }}
        >
          <HeartPulse size={28} strokeWidth={2.4} className="text-white" />
        </div>
        <div className="text-headline text-text-primary">ACLS EMR</div>
        <div className="text-caption text-text-secondary">Advanced Cardiac Life Support Recording</div>
        <div className="font-mono text-[11px] text-text-muted mt-1">v2.0.0 · PWA Offline-First</div>
        <div className="text-text-muted text-[11px]">JIA Trainer Center · jia1669.com</div>
      </div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div>
      <div className="section-header px-1">{title}</div>
      <div className="dash-card space-y-2.5">{children}</div>
    </div>
  );
}

function ChoiceCard({ active, onClick, tone, Icon: I, title, sub }) {
  const tones = {
    danger: active ? 'bg-danger/10 text-danger border-danger/40' : 'bg-bg-secondary text-text-primary border-border',
    info: active ? 'bg-info/10 text-info border-info/40' : 'bg-bg-secondary text-text-primary border-border',
  };
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start gap-1 p-3 border transition-colors text-left ${tones[tone]}`}
      style={{ borderRadius: 'var(--radius-md)' }}>
      <I size={20} strokeWidth={2.2} />
      <div className="text-body-strong mt-1">{title}</div>
      <div className="text-caption opacity-70">{sub}</div>
    </button>
  );
}

function ThemeSelector({ value, onChange }) {
  const options = [
    { key: 'light', Icon: Sun, label: 'Light' },
    { key: 'system', Icon: Monitor, label: 'System' },
    { key: 'dark', Icon: Moon, label: 'Dark' },
  ];
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
          style={{ borderRadius: 'var(--radius-sm)' }}>
          <Sun size={15} strokeWidth={2} />
        </div>
        <span className="text-body text-text-primary">Theme</span>
      </div>
      <div className="tab-group">
        {options.map(o => {
          const I = o.Icon;
          const active = value === o.key;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className={`tab-item flex items-center justify-center gap-1.5 ${active ? 'active' : ''}`}
              role="radio"
              aria-checked={active}
            >
              <I size={14} strokeWidth={2.2} />
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({ Icon: I, label, value, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {I && (
          <div className="w-8 h-8 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            <I size={15} strokeWidth={2} />
          </div>
        )}
        <span className="text-body text-text-primary truncate">{label}</span>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={value}
        className={`relative w-12 h-7 transition-colors shrink-0 border ${value ? 'bg-success border-success' : 'bg-bg-tertiary border-border-strong'}`}
        style={{ borderRadius: 99 }}
      >
        <span
          className="absolute top-0.5 w-6 h-6 bg-white transition-transform"
          style={{
            borderRadius: 99,
            transform: value ? 'translateX(22px)' : 'translateX(2px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)',
          }}
        />
      </button>
    </div>
  );
}
