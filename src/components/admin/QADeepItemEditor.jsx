import { useEffect, useState } from 'react';
import {
  Upload, Trash2, Image as ImageIcon, ChevronUp, ChevronDown,
  Save, HelpCircle, Layers, Sparkles, X,
} from 'lucide-react';
import {
  updateQaItem,
  deleteQaItem,
  moveQaItem,
  uploadItemImage,
  updateItemImage,
  deleteItemImage,
  classifyQaItem,
} from '../../services/qaDeepAdminService';

export default function QADeepItemEditor({ item, allItems, chapters, onChange }) {
  const [question, setQuestion] = useState(item.question || '');
  const [answer, setAnswer] = useState(item.answer || '');
  const [chapterId, setChapterId] = useState(item.chapter_id || '');
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classifyHint, setClassifyHint] = useState(null);
  // รูปที่เลือกไว้แต่ยังไม่อัปโหลด — จะอัปโหลดพร้อมกดบันทึกครั้งเดียว
  // [{ tempId, file, type, previewUrl }]
  const [staged, setStaged] = useState([]);

  // รีเซ็ตฟอร์มเฉพาะตอนสลับไป Q&A คนละข้อเท่านั้น
  // (ไม่รีเซ็ตตอน refetch ข้อเดิม เพื่อไม่ให้ข้อความที่พิมพ์ค้างไว้หาย)
  useEffect(() => {
    setQuestion(item.question || '');
    setAnswer(item.answer || '');
    setChapterId(item.chapter_id || '');
    setClassifyHint(null);
    setStaged(prev => {
      prev.forEach(s => URL.revokeObjectURL(s.previewUrl));
      return [];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  // เคลียร์ preview url ตอน unmount
  useEffect(() => {
    return () => {
      setStaged(prev => {
        prev.forEach(s => URL.revokeObjectURL(s.previewUrl));
        return prev;
      });
    };
  }, []);

  const dirty =
    question !== (item.question || '') ||
    answer !== (item.answer || '') ||
    chapterId !== (item.chapter_id || '') ||
    staged.length > 0;

  const stageImage = (file, type) => {
    if (!file) return;
    setStaged(prev => [
      ...prev,
      { tempId: crypto.randomUUID(), file, type, previewUrl: URL.createObjectURL(file) },
    ]);
  };

  const unstageImage = (tempId) => {
    setStaged(prev => {
      const found = prev.find(s => s.tempId === tempId);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter(s => s.tempId !== tempId);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1) บันทึกข้อความ
      await updateQaItem(item.id, {
        question,
        answer,
        chapter_id: chapterId || null,
      });
      // 2) อัปโหลดรูปที่เลือกไว้ทั้งหมด
      for (const s of staged) {
        await uploadItemImage(s.file, item.id, s.type);
      }
      // 3) เคลียร์รูปที่ค้างไว้
      staged.forEach(s => URL.revokeObjectURL(s.previewUrl));
      setStaged([]);
      onChange?.();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('ลบ Q&A นี้พร้อมรูปทั้งหมด?')) return;
    try {
      await deleteQaItem(item.id);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const handleMove = async (direction) => {
    try {
      await moveQaItem(item.id, direction, allItems);
      onChange?.();
    } catch (err) {
      alert('ย้ายไม่สำเร็จ: ' + (err?.message || err));
    }
  };

  const handleAutoClassify = async () => {
    if (!question.trim()) {
      alert('พิมพ์คำถามก่อนค่อยจัดหมวดอัตโนมัติ');
      return;
    }
    setClassifying(true);
    setClassifyHint(null);
    try {
      const r = await classifyQaItem({ question, answer });
      if (r.chapterId) {
        setChapterId(r.chapterId);
        const ch = (chapters || []).find(c => c.id === r.chapterId);
        setClassifyHint({
          type: 'ok',
          text: `แนะนำ: ${ch?.icon ? ch.icon + ' ' : ''}${ch?.title || r.chapterId}${r.reason ? ` — ${r.reason}` : ''} (กดบันทึกเพื่อยืนยัน)`,
        });
      } else if (r.suggestedNewChapter) {
        setClassifyHint({
          type: 'warn',
          text: `ไม่มีหมวดที่เหมาะ — แนะนำให้สร้างหมวดใหม่ชื่อ "${r.suggestedNewChapter}"${r.reason ? ` (${r.reason})` : ''}`,
        });
      } else {
        setClassifyHint({
          type: 'warn',
          text: `ไม่พบหมวดที่เหมาะ${r.reason ? ` — ${r.reason}` : ''}`,
        });
      }
    } catch (err) {
      setClassifyHint({ type: 'err', text: 'จัดหมวดไม่สำเร็จ: ' + (err?.message || err) });
    }
    setClassifying(false);
  };

  const covers = (item.images || []).filter(i => i.image_type === 'cover');
  const infos = (item.images || []).filter(i => i.image_type === 'infographic');
  const stagedCovers = staged.filter(s => s.type === 'cover');
  const stagedInfos = staged.filter(s => s.type === 'infographic');

  return (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-sm)' }}>
          <HelpCircle size={14} strokeWidth={2.4} />
        </div>
        <span className="text-overline text-text-muted">#{item.sort_order}</span>
        <div className="flex-1" />
        <button onClick={() => handleMove('up')} className="btn btn-ghost btn-sm" title="ย้ายขึ้น">
          <ChevronUp size={14} strokeWidth={2.2} />
        </button>
        <button onClick={() => handleMove('down')} className="btn btn-ghost btn-sm" title="ย้ายลง">
          <ChevronDown size={14} strokeWidth={2.2} />
        </button>
        <button onClick={handleDelete} className="btn btn-ghost btn-sm text-danger" title="ลบ">
          <Trash2 size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div className="block">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-caption font-bold text-text-secondary inline-flex items-center gap-1.5">
            <Layers size={12} strokeWidth={2.2} /> หมวด (บทใน ALS)
          </span>
          <button
            type="button"
            onClick={handleAutoClassify}
            disabled={classifying || !question.trim()}
            className="btn btn-ghost btn-sm disabled:opacity-40"
            title="ให้ AI จัดหมวดให้อัตโนมัติจากคำถาม-คำตอบ"
          >
            <Sparkles size={12} strokeWidth={2.2} />
            {classifying ? 'กำลังจัดหมวด…' : 'จัดหมวดอัตโนมัติ'}
          </button>
        </div>
        <select
          value={chapterId}
          onChange={(e) => { setChapterId(e.target.value); setClassifyHint(null); }}
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-sm)' }}
        >
          <option value="">— ยังไม่จัดหมวด —</option>
          {(chapters || []).map(c => (
            <option key={c.id} value={c.id}>
              {c.icon ? `${c.icon} ` : ''}{c.title}
            </option>
          ))}
        </select>
        {classifyHint && (
          <div
            className={
              'text-[11px] mt-1 ' +
              (classifyHint.type === 'ok'
                ? 'text-info'
                : classifyHint.type === 'warn'
                ? 'text-text-muted'
                : 'text-danger')
            }
          >
            {classifyHint.text}
          </div>
        )}
      </div>

      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">คำถาม</span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          placeholder="พิมพ์คำถาม…"
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <label className="block">
        <span className="text-caption font-bold text-text-secondary mb-1 block">
          คำตอบ <span className="text-text-muted font-normal">(รองรับ Markdown: **bold**, ##, list, ตาราง, &gt; blockquote)</span>
        </span>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="พิมพ์คำตอบ (Markdown)…"
          className="w-full px-3 py-2 bg-bg-secondary border border-border text-caption text-text-primary font-mono focus:outline-none focus:border-info"
          style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </label>

      <div
        className="border border-border bg-bg-tertiary/40 p-3 space-y-3"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="text-overline text-info inline-flex items-center gap-1.5">
          <ImageIcon size={12} strokeWidth={2.2} /> รูปภาพประกอบ Q&A นี้
        </div>

        <ImageGroup
          label="รูปหน้าปกของ Q&A"
          helper="แสดงเหนือคำถาม · แนะนำ 1 รูป"
          images={covers}
          staged={stagedCovers}
          imageType="cover"
          onStage={stageImage}
          onUnstage={unstageImage}
          onChange={onChange}
        />

        <div className="h-px bg-border" />

        <ImageGroup
          label="Infographic"
          helper="แสดงระหว่างคำถาม–คำตอบ · เพิ่มได้หลายรูป"
          images={infos}
          staged={stagedInfos}
          imageType="infographic"
          onStage={stageImage}
          onUnstage={unstageImage}
          onChange={onChange}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="btn btn-primary btn-sm btn-block disabled:opacity-40"
      >
        <Save size={12} strokeWidth={2.2} />
        {saving
          ? 'กำลังบันทึก…'
          : staged.length > 0
          ? `บันทึกข้อความ + รูป (${staged.length})`
          : 'บันทึก'}
      </button>
    </div>
  );
}

function ImageGroup({ label, helper, images, staged, imageType, onStage, onUnstage, onChange }) {
  const [busyId, setBusyId] = useState(null);

  const handlePick = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => onStage(f, imageType));
    e.target.value = '';
  };

  const handleSaveMeta = async (img, patch) => {
    setBusyId(img.id);
    try {
      await updateItemImage(img.id, patch);
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
      await deleteItemImage(img.id, img.src);
      onChange?.();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err?.message || err));
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
            <ImageIcon size={12} strokeWidth={2.2} /> {label}
            <span className="text-text-muted font-normal">({images.length + staged.length})</span>
          </div>
          <div className="text-[11px] text-text-muted">{helper}</div>
        </div>
        <label className="btn btn-ghost btn-sm cursor-pointer shrink-0">
          <Upload size={12} strokeWidth={2.2} />
          เลือกรูป
          <input type="file" accept="image/*" multiple onChange={handlePick} className="hidden" />
        </label>
      </div>

      {staged.length > 0 && (
        <div className="space-y-2">
          {staged.map(s => (
            <div
              key={s.tempId}
              className="border border-info/50 bg-info/5 p-2 flex gap-2 items-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <img src={s.previewUrl} alt="" className="w-20 h-20 object-cover shrink-0" style={{ borderRadius: 'var(--radius-sm)' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-info">รอบันทึก</div>
                <div className="text-[11px] text-text-muted truncate">{s.file.name}</div>
                <div className="text-[11px] text-text-muted">กด “บันทึก” ด้านล่างเพื่ออัปโหลดพร้อมข้อความ</div>
              </div>
              <button
                onClick={() => onUnstage(s.tempId)}
                className="btn btn-ghost btn-sm text-danger shrink-0"
                title="เอารูปนี้ออก"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>
          ))}
        </div>
      )}

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
