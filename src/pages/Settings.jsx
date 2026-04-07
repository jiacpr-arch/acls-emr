import { useSettingsStore } from '../stores/settingsStore';

export default function Settings() {
  const settings = useSettingsStore();

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="bg-bg-secondary rounded-xl p-4 space-y-4">
        {/* Mode */}
        <div>
          <label className="text-sm text-text-secondary block mb-2">Mode</label>
          <div className="flex gap-2">
            {['clinical', 'training'].map(m => (
              <button key={m}
                onClick={() => settings.setMode(m)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  settings.mode === m
                    ? (m === 'clinical' ? 'bg-danger text-white' : 'bg-info text-white')
                    : 'bg-bg-tertiary text-text-secondary'
                }`}
              >
                {m === 'clinical' ? '🏥 Clinical' : '📚 Training'}
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode */}
        <ToggleSetting label="Dark Mode" value={settings.theme === 'dark'} onToggle={() => {
          settings.toggleTheme();
          document.documentElement.classList.toggle('dark');
        }} />

        {/* Sound Settings */}
        <ToggleSetting label="Sound Effects" value={settings.soundEnabled} onToggle={settings.toggleSound} />
        <ToggleSetting label="Metronome" value={settings.metronomeEnabled} onToggle={settings.toggleMetronome} />
        <ToggleSetting label="Cycle Alert (2 min)" value={settings.cycleAlertEnabled} onToggle={settings.toggleCycleAlert} />
        <ToggleSetting label="Drug Reminders" value={settings.drugReminderEnabled} onToggle={settings.toggleDrugReminder} />
        <ToggleSetting label="Compressor Rotation (2 min)" value={settings.compressorRotateAlert} onToggle={settings.toggleCompressorRotateAlert} />

        {/* Metronome Rate */}
        {settings.metronomeEnabled && (
          <div>
            <label className="text-sm text-text-secondary block mb-1">
              Metronome Rate: {settings.metronomeRate} bpm
            </label>
            <input
              type="range"
              min={80} max={140}
              value={settings.metronomeRate}
              onChange={e => settings.setMetronomeRate(parseInt(e.target.value))}
              className="w-full accent-info"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>80</span>
              <span className="text-success font-semibold">100-120 target</span>
              <span>140</span>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-bg-secondary rounded-xl p-4 text-center text-text-muted text-xs space-y-1.5">
        <div className="w-12 h-12 mx-auto bg-danger rounded-xl flex items-center justify-center shadow-md mb-2">
          <span className="text-2xl">🫀</span>
        </div>
        <div className="text-lg font-black text-text-primary">ACLS EMR</div>
        <div className="text-text-secondary">Advanced Cardiac Life Support Recording</div>
        <div className="font-mono text-[10px]">v2.0.0 — PWA Offline-First</div>
        <div className="text-text-muted text-[10px]">JIA Trainer Center · jia1669.com</div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, value, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          value ? 'bg-success' : 'bg-bg-tertiary'
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
