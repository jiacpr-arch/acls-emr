import { useState } from 'react';
import { Plus, Trash2, Video, Play } from 'lucide-react';
import { addPreCourseVideo } from '../../services/precourseImageService';
import { updateImage, deleteImage } from '../../services/alsAdminService';
import { getYouTubeId } from '../../utils/youtube';

// แผงจัดการวิดีโอประกอบของ read step (วางลิงก์ YouTube — เก็บใน acls_images parent_type='precourse-video')
export default function VideoManager({ stepId, videos, onChange }) {
  const [url, setUrl] = useState('');
  const [orientation, setOrientation] = useState('portrait');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const validId = getYouTubeId(url.trim());

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!validId) {
      alert('ลิงก์ YouTube ไม่ถูกต้อง — รองรับ youtu.be/, watch?v= และ shorts/');
      return;
    }
    setAdding(true);
    try {
      await addPreCourseVideo(stepId, trimmed, { orientation, label: label.trim() || 'ดูคลิป' });
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
          placeholder="ลิงก์ YouTube (youtu.be/ · watch?v= · shorts/)"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-[12px]"
          style={{ borderRadius: 4 }}
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ชื่อคลิป (ไม่ใส่ได้ → 'ดูคลิป')"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-[12px]"
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
      className={`text-[11px] font-bold px-2 py-1 border transition-colors ${
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
  const ytId = getYouTubeId(video.url);
  const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

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
      <div className="w-16 h-16 shrink-0 bg-bg-tertiary inline-flex items-center justify-center overflow-hidden"
        style={{ borderRadius: 'var(--radius-sm)' }}>
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <Play size={18} strokeWidth={2.2} className="text-text-muted" />}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ชื่อคลิป"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-[12px]"
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
