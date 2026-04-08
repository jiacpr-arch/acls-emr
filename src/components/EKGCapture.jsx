import { useState, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import PanelWrapper from './PanelWrapper';

// EKG Capture Panel — available from all pathways
// Features: preset rhythm selection + photo capture + notes
export default function EKGCapture({ onClose, onRhythmSelect }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [tab, setTab] = useState('preset'); // preset, photo, history
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const fileRef = useRef(null);

  const presets = [
    { category: 'Arrest', items: [
      { id: 'vf', label: 'VF', desc: 'Chaotic, no organized QRS' },
      { id: 'pvt', label: 'pVT', desc: 'Wide QRS, regular, fast' },
      { id: 'pea', label: 'PEA', desc: 'Organized rhythm, no pulse' },
      { id: 'asystole', label: 'Asystole', desc: 'Flat line (check leads)' },
    ]},
    { category: 'Bradycardia', items: [
      { id: 'sinus_brady', label: 'Sinus Brady', desc: 'Normal P-QRS, rate <50' },
      { id: '1st_avb', label: '1st AVB', desc: 'PR >0.2s, all conducted' },
      { id: '2nd_type1', label: '2nd Type I', desc: 'PR progressive lengthening → dropped QRS' },
      { id: '2nd_type2', label: '2nd Type II', desc: 'Fixed PR → sudden dropped QRS' },
      { id: '3rd_avb', label: '3rd AVB', desc: 'P and QRS independent' },
    ]},
    { category: 'Tachycardia', items: [
      { id: 'svt', label: 'SVT', desc: 'Narrow, regular, >150' },
      { id: 'af', label: 'AF', desc: 'Narrow, irregularly irregular' },
      { id: 'aflutter', label: 'A.Flutter', desc: 'Sawtooth, regular or irregular' },
      { id: 'vt_pulse', label: 'VT+pulse', desc: 'Wide, regular, pulse present' },
      { id: 'torsades', label: 'Torsades', desc: 'Polymorphic VT, twisting QRS' },
    ]},
    { category: 'Other', items: [
      { id: 'sinus', label: 'NSR', desc: 'Normal Sinus Rhythm' },
      { id: 'stemi', label: 'STEMI', desc: 'ST elevation ≥1mm in ≥2 leads' },
      { id: 'nstemi', label: 'NSTEMI/UA', desc: 'ST depression, T inversion' },
      { id: 'wpw', label: 'WPW', desc: 'Short PR, delta wave, wide QRS' },
    ]},
  ];

  const handlePreset = (item) => {
    setSelectedPreset(item);
    addEvent({ elapsed, category: 'rhythm', type: `📈 EKG: ${item.label} (${item.desc})`, details: { rhythmId: item.id } });
    if (onRhythmSelect) onRhythmSelect(item);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photoData = { dataUrl: ev.target.result, timestamp: new Date(), name: file.name };
      setPhotos(prev => [...prev, photoData]);
      addEvent({ elapsed, category: 'rhythm', type: `📸 12-Lead ECG photo captured`, details: { fileName: file.name } });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (notes) {
      addEvent({ elapsed, category: 'rhythm', type: `📝 ECG notes: ${notes}`, details: { notes } });
    }
    onClose();
  };

  return (
    <PanelWrapper title="EKG / 12-Lead" icon="📈" onClose={onClose} onSave={handleSave} saveLabel="Done">
      {/* Tabs */}
      <div className="tab-group mb-4">
        <button onClick={() => setTab('preset')} className={`tab-item ${tab === 'preset' ? 'active' : ''}`}>Rhythm</button>
        <button onClick={() => setTab('photo')} className={`tab-item ${tab === 'photo' ? 'active' : ''}`}>12-Lead Photo</button>
      </div>

      <div>
        {/* Preset rhythms */}
        {tab === 'preset' && (
          <div className="space-y-3">
            {presets.map(cat => (
              <div key={cat.category}>
                <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">{cat.category}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {cat.items.map(item => (
                    <button key={item.id} onClick={() => handlePreset(item)}
                      className={`text-left px-4 py-3 rounded-lg transition-colors border-2 ${
                        selectedPreset?.id === item.id
                          ? 'bg-info/10 border-info'
                          : 'border-bg-tertiary hover:border-info/50'
                      }`}>
                      <div className="font-bold text-text-primary text-sm">{item.label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-[10px] text-text-muted text-center">
              Not sure? Take a photo → review later or send to cardiologist
            </div>
          </div>
        )}

        {/* Photo capture */}
        {tab === 'photo' && (
          <div className="space-y-3">
            <div className="text-xs text-text-secondary text-center">
              Take a photo of the 12-Lead ECG strip or monitor screen
            </div>

            {/* Camera/file input */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={handlePhoto} className="hidden" />

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => fileRef.current?.click()}
                className="btn-action btn-info py-4 text-sm font-semibold">
                📸 Take Photo
              </button>
              <button onClick={() => { fileRef.current?.removeAttribute('capture'); fileRef.current?.click(); }}
                className="btn-action btn-ghost py-4 text-sm font-semibold">
                🖼️ From Gallery
              </button>
            </div>

            {/* Photos taken */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-text-muted uppercase">Captured ECGs ({photos.length})</div>
                {photos.map((ph, i) => (
                  <div key={i} className="glass-card !p-2">
                    <img src={ph.dataUrl} alt={`ECG ${i + 1}`} className="w-full rounded-lg" />
                    <div className="text-[9px] text-text-muted mt-1">{ph.name} — {fmtClock(ph.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* AI ECG reading note */}
            <div className="glass-card !p-3 text-center text-xs text-text-secondary">
              <div className="font-bold text-text-primary mb-1">🤖 AI ECG Reading</div>
              <div>Available when online — photos saved for later analysis</div>
            </div>

            {/* Notes */}
            <div>
              <div className="text-[10px] text-text-muted font-semibold mb-1">ECG Interpretation Notes</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g., ST elevation V1-V4, Anterior STEMI"
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-xs text-text-primary focus:outline-none focus:border-info"
                rows={3} />
            </div>
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}

function fmtClock(ts) {
  return ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
}
