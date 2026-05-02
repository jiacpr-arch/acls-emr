import { useState, useRef } from 'react';
import { useCaseStore } from '../stores/caseStore';
import { useTimerStore } from '../stores/timerStore';
import { Camera, Image as ImageIcon, Edit, X, Save } from 'lucide-react';

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
    <div className="absolute bottom-0 left-0 right-0 z-50 animate-slide-up bg-bg-secondary border-t border-border"
      style={{
        borderTopLeftRadius: 'var(--radius-2xl)',
        borderTopRightRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-pop)',
        maxHeight: '60vh',
      }}>
      <div className="w-10 h-1 bg-bg-tertiary mx-auto mt-3" style={{ borderRadius: 99 }} />
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="tab-group flex-1 mr-3">
          <button onClick={() => setTab('photo')} className={`tab-item ${tab === 'photo' ? 'active' : ''}`}>
            <Camera size={12} strokeWidth={2.2} className="inline mr-1" /> Photo
          </button>
          <button onClick={() => setTab('note')} className={`tab-item ${tab === 'note' ? 'active' : ''}`}>
            <Edit size={12} strokeWidth={2.2} className="inline mr-1" /> Note
          </button>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
          style={{ borderRadius: 99 }} aria-label="Close">
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>

      <div className="p-4">
        {tab === 'photo' && (
          <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fileRef.current?.click()} className="btn btn-info btn-lg btn-block">
                <Camera size={16} strokeWidth={2.2} /> Camera
              </button>
              <button onClick={() => { fileRef.current?.removeAttribute('capture'); fileRef.current?.click(); }}
                className="btn btn-ghost btn-lg btn-block">
                <ImageIcon size={16} strokeWidth={2.2} /> Gallery
              </button>
            </div>
            {photos.length > 0 && (
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {photos.map((p, i) => (
                  <div key={i} className="dash-card !p-2">
                    <img src={p.dataUrl} alt={p.name} style={{ borderRadius: 'var(--radius-sm)' }} className="w-full" />
                    <div className="text-[10px] text-text-muted mt-1 font-mono">{p.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'note' && (
          <div className="space-y-3">
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Type a note…"
              className="w-full text-caption" rows={4} autoFocus />
            <button onClick={saveNote} disabled={!note.trim()} className="btn btn-info btn-block disabled:opacity-40">
              <Save size={14} strokeWidth={2.2} /> Save Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
