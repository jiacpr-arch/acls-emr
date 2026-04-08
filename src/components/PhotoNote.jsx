import { useState, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';

// Photo + Note capture — floating button during recording
export default function PhotoNote({ onClose }) {
  const addEvent = useCaseStore(s => s.addEvent);
  const elapsed = useTimerStore(s => s.elapsed);
  const [tab, setTab] = useState('photo');
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState('');
  const fileRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos(prev => [...prev, { dataUrl: ev.target.result, name: file.name, time: new Date() }]);
      addEvent({ elapsed, category: 'other', type: `📸 Photo: ${file.name}`, details: { fileName: file.name } });
    };
    reader.readAsDataURL(file);
  };

  const saveNote = () => {
    if (note.trim()) {
      addEvent({ elapsed, category: 'other', type: `📝 Note: ${note.trim()}`, details: { note: note.trim() } });
      setNote('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-slide-up bg-white rounded-t-2xl border-t border-bg-tertiary"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '60vh' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <div className="tab-group flex-1 mr-3">
          <button onClick={() => setTab('photo')} className={`tab-item ${tab === 'photo' ? 'active' : ''}`}>📸 Photo</button>
          <button onClick={() => setTab('note')} className={`tab-item ${tab === 'note' ? 'active' : ''}`}>📝 Note</button>
        </div>
        <button onClick={onClose} className="text-text-muted text-sm font-bold">✕</button>
      </div>

      <div className="p-4">
        {tab === 'photo' && (
          <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="btn-action btn-info py-4 text-sm font-semibold">📸 Camera</button>
              <button onClick={() => { fileRef.current?.removeAttribute('capture'); fileRef.current?.click(); }}
                className="btn-action btn-ghost py-4 text-sm font-semibold">🖼️ Gallery</button>
            </div>
            {photos.length > 0 && (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {photos.map((p, i) => (
                  <div key={i} className="glass-card !p-2">
                    <img src={p.dataUrl} alt={p.name} className="w-full rounded-lg" />
                    <div className="text-[9px] text-text-muted mt-1">{p.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'note' && (
          <div className="space-y-3">
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Type a note..."
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
              rows={4} autoFocus />
            <button onClick={saveNote} disabled={!note.trim()}
              className="w-full btn-action btn-info py-3 text-sm font-bold disabled:opacity-40">
              Save Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
