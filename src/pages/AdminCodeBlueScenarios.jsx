import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Plus, AlertTriangle, RefreshCw, Play, Trash2, Save, Upload, Heart,
} from 'lucide-react';
import {
  listScenarios, createScenario, updateScenario, setScenarioStatus,
  deleteScenario, generateScenarioWithAI,
} from '../services/codeBlueScenarioAdminService';
import { listCharacters } from '../services/codeBlueCharacterAdminService';
import { TRACK_META } from '../data/codeBlueScenarios';

const BUILTIN_CHAR_KEYS = ['nurse_mint', 'boy_compressor', 'fon_defib', 'att_dech'];

const STATUS_META = {
  draft:     { label: 'ร่าง', color: 'text-warning' },
  published: { label: 'เผยแพร่แล้ว', color: 'text-success' },
  rejected:  { label: 'ปฏิเสธ', color: 'text-text-muted' },
};

const PREVIEW_KEY = 'code_blue_preview'; // โจทย์ทดลองเล่น (CodeBlueSim อ่านเมื่อ ?preview=1)

const blankScenario = () => ({
  id: null, status: 'draft', source: 'manual',
  title: '', subtitle: '', level: 'basic', course: 'acls',
  payload: {
    title: '', subtitle: '', level: 'basic', course: 'acls', track: 'other', hiddenCause: null,
    story: [
      { say: { who: 'nurse_mint', pose: 'panic', text: 'อาจารย์! คนไข้หมดสติค่ะ!' }, t: 5 },
      { end: true },
    ],
  },
  warnings: [],
});

export default function AdminCodeBlueScenarios() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [editing, setEditing] = useState(null);
  const [aiCourse, setAiCourse] = useState('acls');
  const [aiLevel, setAiLevel] = useState('basic');
  const [aiBrief, setAiBrief] = useState('');
  const [genBusy, setGenBusy] = useState(false);
  const [customChars, setCustomChars] = useState([]); // [{key,name,role}]

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try {
      setList(await listScenarios());
    } catch (err) {
      setLoadErr(err?.message || String(err));
    } finally {
      setLoading(false);
    }
    // ตัวละคร custom (ไม่บล็อกหน้าหลักถ้าพัง)
    try {
      const chars = await listCharacters();
      setCustomChars(chars.map(c => ({ key: c.charKey, name: c.name, role: c.role })));
    } catch { /* ไม่มีตารางก็ข้ามไป */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenBusy(true);
    try {
      const { scenario: s, warnings } = await generateScenarioWithAI({ course: aiCourse, level: aiLevel, brief: aiBrief, characters: customChars });
      setEditing({
        id: null, status: 'draft', source: 'ai',
        title: s.title, subtitle: s.subtitle, level: s.level, course: s.course,
        payload: s, warnings: warnings || [],
      });
    } catch (err) {
      alert('AI สร้างโจทย์ไม่สำเร็จ: ' + (err?.message || err));
    } finally {
      setGenBusy(false);
    }
  };

  if (editing) {
    const allowedChars = [...BUILTIN_CHAR_KEYS, ...customChars.map(c => c.key)];
    return <ScenarioEditor item={editing} allowedChars={allowedChars} onClose={() => { setEditing(null); load(); }} navigate={navigate} />;
  }

  return (
    <div className="page-container space-y-3 pb-28">
      <Link to="/admin" className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> แดชบอร์ดแอดมิน
      </Link>
      <div className="flex items-center gap-2">
        <Heart size={20} strokeWidth={2.4} className="text-danger" />
        <h1 className="text-headline text-text-primary">โจทย์เกม Code Blue</h1>
      </div>
      <p className="text-2xs text-text-muted leading-relaxed">
        ให้ AI ร่างโจทย์จากคำบรรยายภาษาไทย หรือสร้างเอง — โจทย์ใหม่เป็น "ร่าง" เสมอ ตรวจแล้วกด "เผยแพร่" นักเรียนถึงจะเห็นในเกม
        (โหมด acls โผล่ที่ acls.morroo · โหมด bls โผล่ที่ MorRoo)
      </p>

      {/* AI generate */}
      <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2">
        <div className="text-xs font-black text-text-primary inline-flex items-center gap-1.5">
          <Sparkles size={14} strokeWidth={2.4} className="text-info" /> ให้ AI ร่างโจทย์
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* AI ร่างโจทย์รองรับแค่ acls/bls ที่ api/code-blue/generate-scenario.js —
              airway/defib/iv ยังไม่มี prompt scope ของตัวเอง ต้องสร้างโจทย์เองด้านล่างแทน */}
          <select value={aiCourse} onChange={e => setAiCourse(e.target.value)}
            className="px-2 py-2 border border-border rounded text-sm">
            <option value="acls">ACLS</option>
            <option value="bls">BLS (MorRoo)</option>
          </select>
          <select value={aiLevel} onChange={e => setAiLevel(e.target.value)}
            className="px-2 py-2 border border-border rounded text-sm">
            <option value="basic">พื้นฐาน</option>
            <option value="intermediate">ปานกลาง</option>
            <option value="megacode">Megacode</option>
          </select>
        </div>
        <textarea value={aiBrief} onChange={e => setAiBrief(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-border rounded text-sm"
          placeholder="โจทย์ (พิมพ์ไทยธรรมดา) เช่น หญิง 70 CKD ขาดฟอกไต arrest PEA จาก hyperK อยากมี event ญาติบอกใบ้" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={generate} disabled={genBusy} className="btn btn-info btn-block font-bold">
            <Sparkles size={14} strokeWidth={2.4} /> {genBusy ? 'กำลังร่าง…' : 'ร่างด้วย AI'}
          </button>
          <button onClick={() => setEditing(blankScenario())} className="btn btn-ghost btn-block font-bold border">
            <Plus size={14} strokeWidth={2.4} /> สร้างเอง
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xs text-text-muted">{list.length} โจทย์ในระบบ</span>
        <button onClick={load} className="btn btn-ghost btn-icon btn-sm"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : loadErr ? (
        <div className="glass-card !p-3 border-2 border-danger/40 text-caption text-danger inline-flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={2.4} /> โหลดไม่สำเร็จ: {loadErr} (ตาราง code_blue_scenarios อาจยังไม่ถูกสร้าง)
        </div>
      ) : list.length === 0 ? (
        <div className="text-center text-caption text-text-muted py-8">ยังไม่มีโจทย์ — เริ่มด้วย "ร่างด้วย AI" หรือ "สร้างเอง"</div>
      ) : (
        <div className="space-y-2">
          {list.map(s => {
            const sm = STATUS_META[s.status] || STATUS_META.draft;
            return (
              <button key={s.id} onClick={() => setEditing({ ...s, warnings: [] })}
                className="w-full dash-card !p-3 flex items-center gap-3 text-left hover:bg-bg-tertiary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-black text-text-primary truncate">{s.title || '(ไม่มีชื่อ)'}</div>
                  <div className="text-3xs text-text-muted">
                    {s.course.toUpperCase()} · {s.level} · {s.source === 'ai' ? 'AI' : 'มือ'}
                  </div>
                </div>
                <span className={`text-2xs font-bold shrink-0 ${sm.color}`}>{sm.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScenarioEditor({ item, onClose, navigate, allowedChars = [] }) {
  const [title, setTitle] = useState(item.title || item.payload?.title || '');
  const [subtitle, setSubtitle] = useState(item.subtitle || item.payload?.subtitle || '');
  const [level, setLevel] = useState(item.level || item.payload?.level || 'basic');
  const [course, setCourse] = useState(item.course || item.payload?.course || 'acls');
  // หมวดในหน้าเลือกเคส — อยู่ใน payload (ตาราง DB ไม่มีคอลัมน์แยก) ไม่ระบุ = 'other'
  const [track, setTrack] = useState(item.payload?.track || 'other');
  const [storyText, setStoryText] = useState(
    JSON.stringify(item.payload?.story ?? [], null, 2),
  );
  const [jsonErr, setJsonErr] = useState('');
  const [saving, setSaving] = useState(false);
  const warnings = item.warnings || [];

  function parseStory() {
    try {
      const story = JSON.parse(storyText);
      if (!Array.isArray(story)) throw new Error('story ต้องเป็น array');
      setJsonErr('');
      return story;
    } catch (e) {
      setJsonErr('JSON ผิด: ' + e.message);
      return null;
    }
  }

  function buildPayload(story) {
    return {
      title: title.trim(), subtitle: subtitle.trim(), level, course, track,
      hiddenCause: item.payload?.hiddenCause ?? null,
      story,
    };
  }

  async function save(publish) {
    const story = parseStory();
    if (!story) return;
    setSaving(true);
    try {
      const payload = buildPayload(story);
      const input = { title, subtitle, level, course, source: item.source || 'manual', payload };
      let id = item.id;
      if (id) {
        await updateScenario(id, input);
      } else {
        const created = await createScenario(input);
        id = created.id;
      }
      if (publish) await setScenarioStatus(id, 'published');
      onClose();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  function playtest() {
    const story = parseStory();
    if (!story) return;
    const sc = { id: 'preview', ...buildPayload(story) };
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify(sc)); } catch { /* ignore */ }
    navigate('/sim?preview=1');
  }

  async function remove() {
    if (!item.id) { onClose(); return; }
    if (!confirm('ลบโจทย์นี้?')) return;
    setSaving(true);
    try { await deleteScenario(item.id); onClose(); }
    catch (err) { alert('ลบไม่สำเร็จ: ' + (err?.message || err)); setSaving(false); }
  }

  return (
    <div className="page-container space-y-3 pb-28">
      <button onClick={onClose} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> กลับรายการ
      </button>
      <h1 className="text-headline text-text-primary">{item.id ? 'แก้ไขโจทย์' : 'โจทย์ใหม่'}</h1>

      {warnings.length > 0 && (
        <div className="glass-card !p-3 border-2 border-warning/50 space-y-1">
          <div className="text-2xs font-black text-warning inline-flex items-center gap-1">
            <AlertTriangle size={13} strokeWidth={2.4} /> AI เตือน — ตรวจก่อนเผยแพร่
          </div>
          {warnings.map((w, i) => <div key={i} className="text-3xs text-text-secondary">• {w}</div>)}
        </div>
      )}

      <div className="space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ชื่อเคส"
          className="w-full px-3 py-2 border border-border rounded text-sm font-bold" />
        <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="บรรยายผู้ป่วย 1 บรรทัด"
          className="w-full px-3 py-2 border border-border rounded text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <select value={course} onChange={e => setCourse(e.target.value)} className="px-2 py-2 border border-border rounded text-sm">
            <option value="acls">ACLS</option>
            <option value="bls">BLS (MorRoo)</option>
            <option value="airway">Airway</option>
            <option value="defib">Defib</option>
            <option value="iv">IV/IO</option>
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} className="px-2 py-2 border border-border rounded text-sm">
            <option value="basic">พื้นฐาน</option>
            <option value="intermediate">ปานกลาง</option>
            <option value="megacode">Megacode</option>
          </select>
          <select value={track} onChange={e => setTrack(e.target.value)} className="col-span-2 px-2 py-2 border border-border rounded text-sm">
            {Object.entries(TRACK_META).map(([key, t]) => (
              <option key={key} value={key}>หมวด: {t.icon} {t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xs font-black text-text-primary">story (JSON) — ลำดับ node ของเคส</div>
        <textarea value={storyText} onChange={e => setStoryText(e.target.value)} rows={16} spellCheck={false}
          className="w-full px-3 py-2 border border-border rounded text-3xs font-mono" />
        {jsonErr && <div className="text-3xs text-danger">{jsonErr}</div>}
        <div className="text-3xs text-text-muted">
          node: say / inter / skip / choice / end · ตัวละคร: {allowedChars.join(', ')} · เป้าหมาย: YOU/CPR/AIRWAY/DEFIB/DRUG/MONITOR
        </div>
      </div>

      <button onClick={playtest} className="btn btn-ghost btn-block font-bold border-2">
        <Play size={14} strokeWidth={2.4} /> ทดลองเล่น (ยังไม่บันทึก)
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => save(false)} disabled={saving} className="btn btn-ghost btn-block font-bold border-2">
          <Save size={14} strokeWidth={2.4} /> บันทึกร่าง
        </button>
        <button onClick={() => save(true)} disabled={saving} className="btn btn-success btn-block font-bold">
          <Upload size={14} strokeWidth={2.4} /> เผยแพร่
        </button>
      </div>
      {item.id && (
        <button onClick={remove} disabled={saving} className="btn btn-ghost btn-block text-danger border border-danger/40">
          <Trash2 size={14} strokeWidth={2.4} /> ลบโจทย์นี้
        </button>
      )}
    </div>
  );
}
