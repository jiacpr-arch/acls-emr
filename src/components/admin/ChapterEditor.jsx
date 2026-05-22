import { useEffect, useState, useCallback } from 'react';
import { Save, Plus } from 'lucide-react';
import { getChapterFull, updateChapter, createSection } from '../../services/alsAdminService';
import SectionEditor from './SectionEditor';

export default function ChapterEditor({ chapterId, onChange }) {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChapterFull(chapterId);
      setChapter(data);
      setTitle(data.title || '');
      setIcon(data.icon || '');
    } catch (err) {
      alert('โหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setLoading(false);
  }, [chapterId]);

  useEffect(() => { load(); }, [load]);

  const handleSaveMeta = async () => {
    setSaving(true);
    try {
      await updateChapter(chapterId, { title, icon });
      await load();
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setSaving(false);
  };

  const handleAddSection = async () => {
    try {
      await createSection(chapterId);
      await load();
      onChange?.();
    } catch (err) {
      alert('เพิ่มไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const reload = async () => {
    await load();
    onChange?.();
  };

  if (loading) {
    return <div className="text-center text-caption text-text-muted py-4">กำลังโหลด…</div>;
  }
  if (!chapter) return null;

  const metaDirty = title !== (chapter.title || '') || icon !== (chapter.icon || '');

  return (
    <div className="space-y-3 pt-2">
      <div className="dash-card space-y-2 !p-3">
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <label>
            <span className="text-[11px] font-bold text-text-muted mb-1 block">Icon</span>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📚"
              className="w-full px-2 py-1.5 bg-bg-primary border border-border text-body text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
          </label>
          <label>
            <span className="text-[11px] font-bold text-text-muted mb-1 block">ชื่อบท</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1.5 bg-bg-primary border border-border text-caption"
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
          </label>
        </div>
        <button onClick={handleSaveMeta} disabled={!metaDirty || saving} className="btn btn-primary btn-sm disabled:opacity-40">
          <Save size={12} strokeWidth={2.2} /> {saving ? 'กำลังบันทึก…' : 'บันทึกชื่อบท'}
        </button>
      </div>

      <div className="space-y-2">
        {chapter.sections.map(s => (
          <SectionEditor key={s.id} section={s} allSections={chapter.sections} onChange={reload} />
        ))}
      </div>

      <button onClick={handleAddSection} className="btn btn-ghost btn-block">
        <Plus size={14} strokeWidth={2.2} /> เพิ่มหัวข้อย่อย
      </button>
    </div>
  );
}
