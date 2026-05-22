import { useState } from 'react';
import { Trash2, Save, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { updateSection, deleteSection, moveSection, createQa } from '../../services/alsAdminService';
import ImageManager from './ImageManager';
import QaEditor from './QaEditor';

export default function SectionEditor({ section, allSections, onChange }) {
  const [heading, setHeading] = useState(section.heading || '');
  const [body, setBody] = useState(section.body || '');
  const [saving, setSaving] = useState(false);
  const dirty = heading !== (section.heading || '') || body !== (section.body || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSection(section.id, { heading, body });
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('ลบหัวข้อนี้ทั้งหมด (รวม Q&A และรูป)?')) return;
    try {
      await deleteSection(section.id);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const handleMove = async (direction) => {
    try {
      await moveSection(section.id, direction, allSections);
      onChange?.();
    } catch (err) {
      alert('ย้ายไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const handleAddQa = async () => {
    try {
      await createQa(section.id);
      onChange?.();
    } catch (err) {
      alert('เพิ่มไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const idx = allSections.findIndex(s => s.id === section.id);
  const isFirst = idx === 0;
  const isLast = idx === allSections.length - 1;

  return (
    <div className="border border-border bg-bg-secondary p-3 space-y-3" style={{ borderRadius: 'var(--radius-md)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-overline text-text-muted">หัวข้อย่อย #{idx + 1}</span>
        <div className="flex gap-1">
          <button onClick={() => handleMove('up')} disabled={isFirst} className="btn btn-ghost btn-sm disabled:opacity-30">
            <ChevronUp size={14} strokeWidth={2.2} />
          </button>
          <button onClick={() => handleMove('down')} disabled={isLast} className="btn btn-ghost btn-sm disabled:opacity-30">
            <ChevronDown size={14} strokeWidth={2.2} />
          </button>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm text-danger">
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] font-bold text-text-muted mb-1 block">หัวข้อ (heading)</span>
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="(ปล่อยว่างได้ ถ้าเป็นหัวข้อ Q&A ล้วน)"
          className="w-full px-2 py-1.5 bg-bg-primary border border-border text-caption"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <label className="block">
        <span className="text-[11px] font-bold text-text-muted mb-1 block">เนื้อหา (body — plain text)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="(ปล่อยว่างได้)"
          className="w-full px-2 py-1.5 bg-bg-primary border border-border text-caption leading-relaxed"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <button onClick={handleSave} disabled={!dirty || saving} className="btn btn-primary btn-sm disabled:opacity-40">
        <Save size={12} strokeWidth={2.2} /> {saving ? 'กำลังบันทึก…' : 'บันทึกหัวข้อ'}
      </button>

      <div className="pt-2 border-t border-border">
        <ImageManager parentType="section" parentId={section.id} images={section.images || []} onChange={onChange} />
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-caption font-bold text-text-secondary">Q&A ({section.qa?.length || 0})</span>
          <button onClick={handleAddQa} className="btn btn-ghost btn-sm">
            <Plus size={12} strokeWidth={2.2} /> เพิ่ม Q&A
          </button>
        </div>
        {section.qa?.map(qa => (
          <QaEditor key={qa.id} qa={qa} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}
