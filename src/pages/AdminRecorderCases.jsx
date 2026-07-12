import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Plus, Target, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { listRecorderCases, generateCaseWithAI } from '../services/recorderCaseAdminService';
import { CASE_CATEGORIES, CASE_CATEGORY_META, blankCase } from '../data/recorderCases';
import RecorderCaseEditor from '../components/admin/RecorderCaseEditor';

const STATUS_META = {
  draft:     { label: 'ร่าง', color: 'text-warning' },
  published: { label: 'เผยแพร่แล้ว', color: 'text-success' },
  rejected:  { label: 'ปฏิเสธ', color: 'text-text-muted' },
};

export default function AdminRecorderCases() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [editing, setEditing] = useState(null);
  const [aiCat, setAiCat] = useState('cardiac_arrest');
  const [aiDiff, setAiDiff] = useState('basic');
  const [aiBrief, setAiBrief] = useState('');
  const [genBusy, setGenBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try {
      setList(await listRecorderCases());
    } catch (err) {
      setLoadErr(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenBusy(true);
    try {
      const { case: c, warnings } = await generateCaseWithAI({ category: aiCat, difficulty: aiDiff, brief: aiBrief });
      setEditing({
        id: null, status: 'draft', source: 'ai',
        titleTh: c.title_th, category: c.category, difficulty: c.difficulty,
        payload: c, warnings: warnings || [],
      });
    } catch (err) {
      alert('AI สร้างเคสไม่สำเร็จ: ' + (err?.message || err));
    } finally {
      setGenBusy(false);
    }
  };

  const filtered = statusFilter === 'all' ? list : list.filter(c => c.status === statusFilter);

  // ---------- EDITOR VIEW ----------
  if (editing) {
    return (
      <div className="page-container space-y-3 pb-28">
        <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} strokeWidth={2.4} /> กลับรายการ
        </button>
        <h1 className="text-headline text-text-primary">{editing.id ? 'แก้ไขเคส' : 'เคสใหม่'}</h1>
        <RecorderCaseEditor
          item={editing}
          onClose={() => { setEditing(null); load(); }}
          onSaved={load}
        />
      </div>
    );
  }

  // ---------- LIST VIEW ----------
  return (
    <div className="page-container space-y-3 pb-28">
      <Link to="/admin" className="btn btn-ghost btn-sm inline-flex items-center gap-1">
        <ArrowLeft size={14} strokeWidth={2.4} /> แดชบอร์ดแอดมิน
      </Link>
      <div className="flex items-center gap-2">
        <Target size={20} strokeWidth={2.4} className="text-purple" />
        <h1 className="text-headline text-text-primary">เคสเกม Recorder</h1>
      </div>
      <p className="text-2xs text-text-muted leading-relaxed">
        สร้างเคสเอง หรือให้ AI ร่าง — เคสใหม่เป็น "ร่าง" เสมอ ต้องตรวจ dose/พลังงาน/จังหวะแล้วกด "เผยแพร่" ผู้เรียนถึงจะเห็น
      </p>

      {/* AI generate */}
      <div className="bg-bg-secondary border-2 border-text-primary p-3 space-y-2">
        <div className="text-xs font-black text-text-primary inline-flex items-center gap-1.5">
          <Sparkles size={14} strokeWidth={2.4} className="text-info" /> ให้ AI ร่างเคส
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={aiCat} onChange={e => setAiCat(e.target.value)}
            className="px-2 py-2 border border-border rounded text-sm">
            {CASE_CATEGORIES.map(c => <option key={c} value={c}>{CASE_CATEGORY_META[c].label_th}</option>)}
          </select>
          <select value={aiDiff} onChange={e => setAiDiff(e.target.value)}
            className="px-2 py-2 border border-border rounded text-sm">
            <option value="basic">basic</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </div>
        <textarea value={aiBrief} onChange={e => setAiBrief(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-border rounded text-sm"
          placeholder="โจทย์เพิ่มเติม (ไม่บังคับ) เช่น ชาย 70 ปี post-op, refractory VF" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={generate} disabled={genBusy} className="btn btn-info btn-block font-bold">
            <Sparkles size={14} strokeWidth={2.4} /> {genBusy ? 'กำลังร่าง…' : 'ร่างด้วย AI'}
          </button>
          <button onClick={() => setEditing(blankCase())} className="btn btn-ghost btn-block font-bold border">
            <Plus size={14} strokeWidth={2.4} /> สร้างเอง
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'draft', 'published', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-2xs font-bold rounded ${statusFilter === s ? 'bg-info text-white' : 'bg-bg-secondary border border-border text-text-muted'}`}>
            {s === 'all' ? 'ทั้งหมด' : STATUS_META[s].label}
          </button>
        ))}
        <button onClick={load} className="btn btn-ghost btn-icon btn-sm ml-auto"><RefreshCw size={14} /></button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : loadErr ? (
        <div className="glass-card !p-3 border-2 border-danger/40 text-caption text-danger inline-flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={2.4} /> โหลดไม่สำเร็จ: {loadErr} (ตาราง recorder_cases อาจยังไม่ถูกสร้าง)
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-caption text-text-muted py-8">ยังไม่มีเคส — เริ่มด้วย "ร่างด้วย AI" หรือ "สร้างเอง"</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const sm = STATUS_META[c.status] || STATUS_META.draft;
            return (
              <button key={c.id} onClick={() => setEditing(c)}
                className="w-full dash-card !p-3 flex items-center gap-3 text-left hover:bg-bg-tertiary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-black text-text-primary truncate">{c.titleTh || '(ไม่มีชื่อ)'}</div>
                  <div className="text-3xs text-text-muted">
                    {CASE_CATEGORY_META[c.category]?.label_th || c.category} · {c.difficulty} · {c.source === 'ai' ? 'AI' : 'มือ'}
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
