import { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { uploadImage, updateImage, deleteImage } from '../../services/alsAdminService';

export default function ImageManager({ parentType, parentId, images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadImage(file, parentType, parentId);
      onChange?.();
    } catch (err) {
      alert('อัปโหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleSaveMeta = async (img, patch) => {
    setBusyId(img.id);
    try {
      await updateImage(img.id, patch);
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusyId(null);
  };

  const handleDelete = async (img) => {
    if (!confirm('ลบรูปนี้?')) return;
    setBusyId(img.id);
    try {
      await deleteImage(img.id, img.src);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
          <ImageIcon size={12} strokeWidth={2.2} /> รูปประกอบ ({images.length})
        </span>
        <label className="btn btn-ghost btn-sm cursor-pointer">
          <Upload size={12} strokeWidth={2.2} />
          {uploading ? 'อัปโหลด…' : 'เพิ่มรูป'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map(img => (
            <ImageRow
              key={img.id}
              img={img}
              busy={busyId === img.id}
              onSave={(patch) => handleSaveMeta(img, patch)}
              onDelete={() => handleDelete(img)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageRow({ img, busy, onSave, onDelete }) {
  const [alt, setAlt] = useState(img.alt || '');
  const [caption, setCaption] = useState(img.caption || '');
  const dirty = alt !== (img.alt || '') || caption !== (img.caption || '');

  return (
    <div className="border border-border bg-bg-secondary p-2 flex gap-2" style={{ borderRadius: 'var(--radius-sm)' }}>
      <img src={img.src} alt={img.alt || ''} className="w-20 h-20 object-cover shrink-0" style={{ borderRadius: 'var(--radius-sm)' }} />
      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="alt text"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-[12px]"
          style={{ borderRadius: 4 }}
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="caption"
          className="w-full px-2 py-1 bg-bg-primary border border-border text-[12px]"
          style={{ borderRadius: 4 }}
        />
        <div className="flex gap-1">
          <button
            onClick={() => onSave({ alt, caption })}
            disabled={!dirty || busy}
            className="btn btn-primary btn-sm disabled:opacity-40"
          >
            บันทึก
          </button>
          <button onClick={onDelete} disabled={busy} className="btn btn-ghost btn-sm text-danger">
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
