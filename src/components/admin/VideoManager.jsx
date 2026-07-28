import { useState } from 'react';
import { Plus, Trash2, Video, Play } from 'lucide-react';
import { updateImage, deleteImage } from '../../services/alsAdminService';
import { getVideoSource } from '../../utils/videoSource';

// แผงจัดการวิดีโอประกอบ (วางลิงก์ YouTube หรือ Google Drive) — เก็บผ่าน onAdd ที่ caller ส่งมา
// เพื่อให้ใช้ร่วมกันได้ทั้ง precourse-video, bls-guide-video ฯลฯ โดยไม่ผูกกับ parent_type ใดตายตัว
export default function VideoManager({ videos, onAdd, onChange }) {
  const [url, setUrl] = useState('');
  const [orientation, setOrientation] = useState('portrait');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const validSource = getVideoSource(url.trim());

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!validSource) {
      alert('ลิงก์ไม่ถูกต้อง — รองรับ YouTube (youtu.be/, watch?v=, shorts/) และ Google Drive (drive.google.com/file/d/…)\nไฟล์ Drive ต้องแชร์เป็น "ทุกคนที่มีลิงก์"');
      return;
    }
    setAdding(true);
    try {
      await onAdd(trimmed, { orientation, label: label.trim() || 'ดูคลิป' });
      setUrl('');
      setLabel('');
      setOrientation('portrait');
      onChange?.();
    } catch (err) {
      alert('เพิ่มวิดีโอไม่สำเร็จ: ' + (err?.message || err));
    }
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
          <Video size={12} strokeWidth={2.2} /> วิดีโอประกอบ ({videos.length})
        </span>
      </div>

      {/* ฟอร์มเพิ่มวิดีโอ */}
      <div className="border border-border bg-bg-secondary p-2 space-y-1.5" style={{ borderRadius: 'var(--radius-sm)' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="ลิงก์ YouTube หรือ Google Drive (แชร์แบบทุกคนที่มีลิงก์)"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-xs"
          style={{ borderRadius: 4 }}
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ชื่อคลิป (ไม่ใส่ได้ → 'ดูคลิป')"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-xs"
          style={{ borderRadius: 4 }}
        />
        <div className="flex items-center gap-2">
          <div className="inline-flex gap-1">
            <OrientationButton active={orientation === 'portrait'} onClick={() => setOrientation('portrait')} label="แนวตั้ง 9:16" />
            <OrientationButton active={orientation === 'landscape'} onClick={() => setOrientation('landscape')} label="แนวนอน 16:9" />
          </div>
          <div className="flex-1" />
          <button onClick={handleAdd} disabled={adding || !url.trim()} className="btn btn-primary btn-sm disabled:opacity-40">
            <Plus size={12} strokeWidth={2.4} /> {adding ? 'กำลังเพิ่ม…' : 'เพิ่มวิดีโอ'}
          </button>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map(v => <VideoRow key={v.id} video={v} onChange={onChange} />)}
        </div>
      )}
    </div>
  );
}

function OrientationButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-2xs font-bold px-2 py-1 border transition-colors ${
        active ? 'border-info bg-info/15 text-info' : 'border-border bg-bg-primary text-text-muted'
      }`}
      style={{ borderRadius: 4 }}
    >
      {label}
    </button>
  );
}

function VideoRow({ video, onChange }) {
  const [label, setLabel] = useState(video.label || '');
  const [orientation, setOrientation] = useState(video.orientation || 'portrait');
  const [busy, setBusy] = useState(false);
  const dirty = label !== (video.label || '') || orientation !== (video.orientation || 'portrait');
  const thumb = getVideoSource(video.url)?.thumbUrl || null;

  const handleSave = async () => {
    setBusy(true);
    try {
      await updateImage(video.id, { caption: label, alt: orientation });
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!confirm('ลบวิดีโอนี้?')) return;
    setBusy(true);
    try {
      await deleteImage(video.id, video.url);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusy(false);
  };

  return (
    <div className="border border-border bg-bg-secondary p-2 flex gap-2" style={{ borderRadius: 'var(--radius-sm)' }}>
      <div className="relative w-16 h-16 shrink-0 bg-bg-tertiary inline-flex items-center justify-center overflow-hidden"
        style={{ borderRadius: 'var(--radius-sm)' }}>
        <Play size={18} strokeWidth={2.2} className="text-text-muted absolute" />
        {thumb && (
          <img src={thumb} alt="" className="relative w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ชื่อคลิป"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-xs"
          style={{ borderRadius: 4 }}
        />
        <div className="flex items-center gap-1">
          <OrientationButton active={orientation === 'portrait'} onClick={() => setOrientation('portrait')} label="9:16" />
          <OrientationButton active={orientation === 'landscape'} onClick={() => setOrientation('landscape')} label="16:9" />
          <div className="flex-1" />
          <button onClick={handleSave} disabled={!dirty || busy} className="btn btn-primary btn-sm disabled:opacity-40">
            บันทึก
          </button>
          <button onClick={handleDelete} disabled={busy} className="btn btn-ghost btn-sm text-danger">
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
