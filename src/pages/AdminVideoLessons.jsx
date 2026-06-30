import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Plus, Trash2, Pencil, X, Video } from 'lucide-react';
import { signOut } from '../services/auth';
import { VIDEO_TOPICS, VIDEO_TOPIC_MAP } from '../data/videoTopics';
import { getYouTubeId } from '../utils/youtube';
import {
  listVideoLessonsAdmin, createVideoLesson, updateVideoLesson, deleteVideoLesson,
} from '../services/videoLessonAdminService';

const LETTERS = ['a', 'b', 'c', 'd', 'e'];
const blankChoice = (i) => ({ id: LETTERS[i] || `o${i}`, text: '' });
const blankQuestion = () => ({
  id: (crypto.randomUUID?.() || String(Math.random())).slice(0, 8),
  question: '', choices: [blankChoice(0), blankChoice(1)], correctId: 'a', explanation: '',
});
const blankForm = (topic) => ({
  topic: topic || VIDEO_TOPICS[0].id,
  title: '', youtubeId: '', orientation: 'portrait',
  startSec: '', endSec: '', required: true,
  keyPoints: '', chapters: [], quiz: [],
  relatedPath: '', relatedLabel: '',
});

export default function AdminVideoLessons() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // form object หรือ null
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setItems(await listVideoLessonsAdmin()); }
    catch (err) { alert('โหลดไม่สำเร็จ: ' + (err?.message || err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleLogout = async () => { await signOut(); navigate('/admin/login', { replace: true }); };

  const startCreate = (topic) => setEditing(blankForm(topic));
  const startEdit = (item) => setEditing({
    ...blankForm(item.topic), ...item,
    startSec: item.startSec ?? '', endSec: item.endSec ?? '',
  });

  const save = async () => {
    const f = editing;
    const ytId = getYouTubeId(f.youtubeId) || (/^[\w-]{11}$/.test(f.youtubeId.trim()) ? f.youtubeId.trim() : '');
    if (!f.title.trim()) return alert('กรุณาใส่ชื่อคลิป');
    if (!ytId) return alert('ลิงก์ YouTube ไม่ถูกต้อง (ต้องเป็นลิงก์ youtu.be / youtube.com หรือ video id 11 ตัว)');
    setSaving(true);
    try {
      const payload = { ...f, youtubeId: ytId };
      if (f.id) await updateVideoLesson(f.id, payload);
      else await createVideoLesson(payload);
      setEditing(null);
      await reload();
    } catch (err) { alert('บันทึกไม่สำเร็จ: ' + (err?.message || err)); }
    finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!confirm(`ลบคลิป "${item.title}"?`)) return;
    try { await deleteVideoLesson(item.id); await reload(); }
    catch (err) { alert('ลบไม่สำเร็จ: ' + (err?.message || err)); }
  };

  return (
    <div className="page-container space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} strokeWidth={2.2} className="text-purple" />
          <h1 className="text-title text-text-primary">จัดการวิดีโอบทเรียน</h1>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm"><LogOut size={14} strokeWidth={2.2} /> ออก</button>
      </div>

      {loading && <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>}

      {!loading && VIDEO_TOPICS.map(tpc => {
        const clips = items.filter(i => i.topic === tpc.id);
        return (
          <div key={tpc.id} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-overline text-text-muted">{tpc.emoji} {tpc.label} ({clips.length})</div>
              <button onClick={() => startCreate(tpc.id)} className="btn btn-ghost btn-sm text-purple"><Plus size={14} strokeWidth={2.4} /> เพิ่มคลิป</button>
            </div>
            {clips.map(item => (
              <div key={item.id} className="dash-card !p-3 flex items-center gap-3">
                <Video size={16} strokeWidth={2.2} className="text-purple shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-bold text-text-primary truncate">{item.title}</div>
                  <div className="text-[11px] text-text-muted">
                    {item.youtubeId} · {item.quiz?.length || 0} ควิซ · {item.chapters?.length || 0} สารบัญ
                    {!item.required && ' · เสริม'}
                  </div>
                </div>
                <button onClick={() => startEdit(item)} className="btn btn-ghost btn-sm"><Pencil size={14} strokeWidth={2.2} /></button>
                <button onClick={() => remove(item)} className="btn btn-ghost btn-sm text-danger"><Trash2 size={14} strokeWidth={2.2} /></button>
              </div>
            ))}
          </div>
        );
      })}

      {editing && (
        <VideoLessonEditor
          form={editing}
          setForm={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

function VideoLessonEditor({ form, setForm, onSave, onClose, saving }) {
  const upd = (patch) => setForm(f => ({ ...f, ...patch }));
  const ytId = getYouTubeId(form.youtubeId) || (/^[\w-]{11}$/.test((form.youtubeId || '').trim()) ? form.youtubeId.trim() : '');

  // chapters
  const addChapter = () => upd({ chapters: [...form.chapters, { t: 0, label: '' }] });
  const setChapter = (i, patch) => upd({ chapters: form.chapters.map((c, j) => j === i ? { ...c, ...patch } : c) });
  const delChapter = (i) => upd({ chapters: form.chapters.filter((_, j) => j !== i) });

  // quiz
  const addQuestion = () => upd({ quiz: [...form.quiz, blankQuestion()] });
  const setQuestion = (i, patch) => upd({ quiz: form.quiz.map((q, j) => j === i ? { ...q, ...patch } : q) });
  const delQuestion = (i) => upd({ quiz: form.quiz.filter((_, j) => j !== i) });
  const addChoice = (qi) => setQuestion(qi, { choices: [...form.quiz[qi].choices, blankChoice(form.quiz[qi].choices.length)] });
  const setChoice = (qi, ci, text) => setQuestion(qi, { choices: form.quiz[qi].choices.map((c, j) => j === ci ? { ...c, text } : c) });
  const delChoice = (qi, ci) => {
    const q = form.quiz[qi];
    if (q.choices.length <= 2) return;
    setQuestion(qi, { choices: q.choices.filter((_, j) => j !== ci) });
  };

  const inputCls = 'w-full bg-bg-secondary border border-border-strong px-3 py-2 text-body';
  const inputStyle = { borderRadius: 'var(--radius-md)' };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-bg-primary w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 space-y-3"
        style={{ borderRadius: 'var(--radius-xl)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between sticky -top-4 bg-bg-primary py-2 -mt-2 z-10">
          <h2 className="text-headline text-text-primary">{form.id ? 'แก้ไขคลิป' : 'เพิ่มคลิป'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={16} strokeWidth={2.2} /></button>
        </div>

        <label className="block">
          <span className="text-caption font-bold text-text-secondary">หัวข้อ</span>
          <select value={form.topic} onChange={e => upd({ topic: e.target.value })} className={inputCls} style={inputStyle}>
            {VIDEO_TOPICS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-caption font-bold text-text-secondary">ชื่อคลิป</span>
          <input value={form.title} onChange={e => upd({ title: e.target.value })} className={inputCls} style={inputStyle} placeholder="เช่น การใช้ BVM" />
        </label>

        <label className="block">
          <span className="text-caption font-bold text-text-secondary">🔗 ลิงก์ YouTube (วางลิงก์ ไม่ต้องอัปไฟล์)</span>
          <input value={form.youtubeId} onChange={e => upd({ youtubeId: e.target.value })} className={inputCls} style={inputStyle} placeholder="https://youtu.be/xxxxxxxxxxx" />
          {form.youtubeId && (
            <span className={`text-[11px] ${ytId ? 'text-success' : 'text-danger'}`}>{ytId ? `id: ${ytId}` : 'ลิงก์ไม่ถูกต้อง'}</span>
          )}
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-caption font-bold text-text-secondary">เริ่ม (วิ)</span>
            <input type="number" value={form.startSec} onChange={e => upd({ startSec: e.target.value })} className={inputCls} style={inputStyle} placeholder="0" />
          </label>
          <label className="block">
            <span className="text-caption font-bold text-text-secondary">จบ (วิ)</span>
            <input type="number" value={form.endSec} onChange={e => upd({ endSec: e.target.value })} className={inputCls} style={inputStyle} placeholder="—" />
          </label>
          <label className="block">
            <span className="text-caption font-bold text-text-secondary">แนว</span>
            <select value={form.orientation} onChange={e => upd({ orientation: e.target.value })} className={inputCls} style={inputStyle}>
              <option value="portrait">ตั้ง 9:16</option>
              <option value="landscape">นอน 16:9</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input type="checkbox" checked={form.required} onChange={e => upd({ required: e.target.checked })} className="w-4 h-4" />
          <span className="text-caption font-bold text-text-secondary">บังคับเพื่อใบประกาศ (required)</span>
        </label>

        {/* B */}
        <label className="block">
          <span className="text-caption font-bold text-purple">📝 B · สรุปประเด็น (markdown bullet)</span>
          <textarea value={form.keyPoints} onChange={e => upd({ keyPoints: e.target.value })} rows={3} className={inputCls} style={inputStyle} placeholder={'- ประเด็นที่ 1\n- ประเด็นที่ 2'} />
        </label>

        {/* A */}
        <div className="space-y-2">
          <div className="text-caption font-bold text-purple">📍 A · สารบัญช่วงเวลา</div>
          {form.chapters.map((ch, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="number" value={ch.t} onChange={e => setChapter(i, { t: Number(e.target.value) })} className={`${inputCls} !w-20`} style={inputStyle} placeholder="วิ" />
              <input value={ch.label} onChange={e => setChapter(i, { label: e.target.value })} className={inputCls} style={inputStyle} placeholder="ชื่อช่วง" />
              <button onClick={() => delChapter(i)} className="btn btn-ghost btn-sm text-danger shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addChapter} className="btn btn-ghost btn-sm text-purple w-full"><Plus size={14} /> เพิ่มช่วงเวลา</button>
        </div>

        {/* C */}
        <div className="space-y-3">
          <div className="text-caption font-bold text-success">✅ C · ควิซ</div>
          {form.quiz.map((q, qi) => (
            <div key={q.id || qi} className="dash-card !p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-muted">ข้อ {qi + 1}</span>
                <button onClick={() => delQuestion(qi)} className="btn btn-ghost btn-sm text-danger"><Trash2 size={13} /></button>
              </div>
              <input value={q.question} onChange={e => setQuestion(qi, { question: e.target.value })} className={inputCls} style={inputStyle} placeholder="คำถาม" />
              {q.choices.map((c, ci) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correctId === c.id} onChange={() => setQuestion(qi, { correctId: c.id })} className="w-4 h-4 shrink-0" title="ตอบถูก" />
                  <span className="text-[11px] font-mono text-text-muted w-4">{c.id}</span>
                  <input value={c.text} onChange={e => setChoice(qi, ci, e.target.value)} className={inputCls} style={inputStyle} placeholder={`ตัวเลือก ${c.id}`} />
                  <button onClick={() => delChoice(qi, ci)} className="btn btn-ghost btn-sm text-danger shrink-0" disabled={q.choices.length <= 2}><X size={13} /></button>
                </div>
              ))}
              <button onClick={() => addChoice(qi)} className="btn btn-ghost btn-sm text-purple"><Plus size={13} /> เพิ่มตัวเลือก</button>
              <input value={q.explanation} onChange={e => setQuestion(qi, { explanation: e.target.value })} className={inputCls} style={inputStyle} placeholder="คำอธิบายเฉลย (ไม่บังคับ)" />
            </div>
          ))}
          <button onClick={addQuestion} className="btn btn-ghost btn-sm text-success w-full"><Plus size={14} /> เพิ่มข้อ</button>
        </div>

        {/* D */}
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-caption font-bold text-info">📖 D · ลิงก์ (path)</span>
            <input value={form.relatedPath} onChange={e => upd({ relatedPath: e.target.value })} className={inputCls} style={inputStyle} placeholder="/pre-course/pc09" />
          </label>
          <label className="block">
            <span className="text-caption font-bold text-info">ป้ายลิงก์</span>
            <input value={form.relatedLabel} onChange={e => upd({ relatedLabel: e.target.value })} className={inputCls} style={inputStyle} placeholder="บทที่ 9" />
          </label>
        </div>

        <div className="flex gap-2 pt-2 sticky -bottom-4 bg-bg-primary py-3 -mb-4">
          <button onClick={onClose} className="btn btn-ghost flex-1">ยกเลิก</button>
          <button onClick={onSave} disabled={saving} className="btn btn-success flex-1 disabled:opacity-50">{saving ? 'กำลังบันทึก…' : '💾 บันทึก'}</button>
        </div>
      </div>
    </div>
  );
}
