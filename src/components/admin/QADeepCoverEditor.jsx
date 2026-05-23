import { useEffect, useState } from 'react';
import { Upload, Save, Image as ImageIcon, X } from 'lucide-react';
import {
  getPageSettings,
  updatePageSettings,
  uploadPageCover,
} from '../../services/qaDeepAdminService';

export default function QADeepCoverEditor({ onChange }) {
  const [row, setRow] = useState(null);
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getPageSettings();
      setRow(data);
      setTitle(data.title || '');
      setIntro(data.intro || '');
    } catch (err) {
      alert('โหลดไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !row) return;
    setUploading(true);
    try {
      const url = await uploadPageCover(file);
      await updatePageSettings(row.id, { cover_image_url: url });
      await load();
      onChange?.();
    } catch (err) {
      alert('อัปโหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleClearCover = async () => {
    if (!row) return;
    if (!confirm('ลบรูปหน้าปก?')) return;
    try {
      await updatePageSettings(row.id, { cover_image_url: null });
      await load();
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const handleSave = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await updatePageSettings(row.id, { title, intro });
      await load();
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setSaving(false);
  };

  if (!row) {
    return (
      <div className="dash-card text-caption text-text-muted text-center">กำลังโหลด…</div>
    );
  }

  const dirty = title !== (row.title || '') || intro !== (row.intro || '');

  return (
    <div className="dash-card space-y-3">
      <div className="text-overline text-info inline-flex items-center gap-1.5">
        <ImageIcon size={12} strokeWidth={2.2} /> หน้าปกและข้อความนำ
      </div>

      {row.cover_image_url ? (
        <div className="relative">
          <img
            src={row.cover_image_url}
            alt={row.title || 'cover'}
            className="w-full max-h-48 object-cover border border-border"
            style={{ borderRadius: 'var(--radius-md)' }}
          />
          <button
            onClick={handleClearCover}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 bg-bg-primary/90 border border-border text-danger hover:bg-bg-primary"
            style={{ borderRadius: 'var(--radius-sm)' }}
            title="ลบรูปหน้าปก"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      ) : (
        <div
          className="w-full py-6 text-center border border-dashed border-border text-caption text-text-muted"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          ยังไม่มีรูปหน้าปก
        </div>
      )}

      <label className="btn btn-ghost btn-sm cursor-pointer w-full justify-center">
        <Upload size={12} strokeWidth={2.2} />
        {uploading ? 'กำลังอัปโหลด…' : row.cover_image_url ? 'เปลี่ยนรูปหน้าปก' : 'อัปโหลดหน้าปก'}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
      </label>

      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">ชื่อหน้า</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">คำอธิบายนำ (intro)</span>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="btn btn-primary btn-sm disabled:opacity-40"
      >
        <Save size={12} strokeWidth={2.2} />
        {saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </div>
  );
}
