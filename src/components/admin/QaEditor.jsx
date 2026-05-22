import { useState } from 'react';
import { Trash2, Save } from 'lucide-react';
import { updateQa, deleteQa } from '../../services/alsAdminService';
import ImageManager from './ImageManager';

export default function QaEditor({ qa, onChange }) {
  const [q, setQ] = useState(qa.q || '');
  const [a, setA] = useState(qa.a || '');
  const [saving, setSaving] = useState(false);
  const dirty = q !== (qa.q || '') || a !== (qa.a || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateQa(qa.id, { q, a });
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('ลบ Q&A นี้?')) return;
    try {
      await deleteQa(qa.id);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  return (
    <div className="border border-info/40 bg-info/5 p-3 space-y-2" style={{ borderRadius: 'var(--radius-md)' }}>
      <div className="flex items-center justify-between">
        <span className="text-overline text-info">Q&A</span>
        <button onClick={handleDelete} className="btn btn-ghost btn-sm text-danger">
          <Trash2 size={12} strokeWidth={2.2} /> ลบ
        </button>
      </div>

      <label className="block">
        <span className="text-[11px] font-bold text-text-muted mb-1 block">คำถาม</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-2 py-1.5 bg-bg-primary border border-border text-caption"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-bold text-text-muted mb-1 block">คำตอบ (Markdown)</span>
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          rows={12}
          className="w-full px-2 py-1.5 bg-bg-primary border border-border text-[12px] font-mono leading-relaxed"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <button onClick={handleSave} disabled={!dirty || saving} className="btn btn-primary btn-sm disabled:opacity-40">
        <Save size={12} strokeWidth={2.2} /> {saving ? 'กำลังบันทึก…' : 'บันทึก Q&A'}
      </button>

      <div className="pt-2 border-t border-border">
        <ImageManager parentType="qa" parentId={qa.id} images={qa.images || []} onChange={onChange} />
      </div>
    </div>
  );
}
