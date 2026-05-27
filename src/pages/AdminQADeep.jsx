import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Plus, Shield, ExternalLink, ChevronDown, Filter, MessageCircleQuestion, Sparkles,
} from 'lucide-react';
import { signOut } from '../services/auth';
import {
  listQaItemsFull,
  listChapters,
  createQaItem,
  updateQaItem,
  classifyQaItemsBatch,
} from '../services/qaDeepAdminService';
import QADeepCoverEditor from '../components/admin/QADeepCoverEditor';
import QADeepItemEditor from '../components/admin/QADeepItemEditor';

const UNCATEGORIZED_FILTER = '_uncategorized';
const ALL_FILTER = '_all';

export default function AdminQADeep() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState(ALL_FILTER);
  const [newItemChapter, setNewItemChapter] = useState('');
  const [bulkClassifying, setBulkClassifying] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [its, chs] = await Promise.all([listQaItemsFull(), listChapters()]);
      setItems(its);
      setChapters(chs);
    } catch (err) {
      alert('โหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const map = new Map();
    let uncategorized = 0;
    for (const it of items) {
      if (it.chapter_id) {
        map.set(it.chapter_id, (map.get(it.chapter_id) ?? 0) + 1);
      } else {
        uncategorized += 1;
      }
    }
    return { byChapter: map, uncategorized };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === ALL_FILTER) return items;
    if (filter === UNCATEGORIZED_FILTER) return items.filter(i => !i.chapter_id);
    return items.filter(i => i.chapter_id === filter);
  }, [items, filter]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleAdd = async () => {
    // Default the new item's chapter to whatever is currently filtered
    const initialChapter =
      filter !== ALL_FILTER && filter !== UNCATEGORIZED_FILTER ? filter : newItemChapter || null;
    setCreating(true);
    try {
      await createQaItem(initialChapter);
      await load();
    } catch (err) {
      alert('เพิ่มไม่สำเร็จ: ' + (err?.message || err));
    }
    setCreating(false);
  };

  const handleBulkClassify = async () => {
    const targets = items.filter(i => !i.chapter_id && (i.question || '').trim());
    if (!targets.length) {
      alert('ไม่มี Q&A ที่ต้องจัดหมวด (รายการต้องมีคำถามและยังไม่จัดหมวด)');
      return;
    }
    if (!confirm(`จัดหมวดอัตโนมัติให้ ${targets.length} รายการที่ยังไม่จัดหมวด?\n(ระบบจะใช้ AI วิเคราะห์ — อาจใช้เวลาสักครู่)`)) {
      return;
    }
    setBulkClassifying(true);
    setBulkProgress({ done: 0, total: targets.length, applied: 0, skipped: 0, failed: 0 });
    try {
      const payload = targets.map(t => ({ id: t.id, question: t.question, answer: t.answer }));
      const results = await classifyQaItemsBatch(payload);
      let applied = 0;
      let skipped = 0;
      let failed = 0;
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.error) {
          failed += 1;
        } else if (r.chapterId) {
          try {
            await updateQaItem(r.id, { chapter_id: r.chapterId });
            applied += 1;
          } catch {
            failed += 1;
          }
        } else {
          skipped += 1;
        }
        setBulkProgress({ done: i + 1, total: targets.length, applied, skipped, failed });
      }
      await load();
      alert(`เสร็จแล้ว: จัดหมวดให้ ${applied} รายการ, ไม่พบหมวดที่เหมาะ ${skipped}, ล้มเหลว ${failed}`);
    } catch (err) {
      alert('จัดหมวดไม่สำเร็จ: ' + (err?.message || err));
    }
    setBulkClassifying(false);
    setBulkProgress(null);
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <div
            className="w-10 h-10 inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Shield size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h1 className="text-body-strong text-text-primary">Admin — Q&A ACLS เชิงลึก</h1>
            <p className="text-[11px] text-text-muted">เพิ่ม/แก้ไขคำถาม-คำตอบ จัดหมวดและอัปโหลดรูป</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/student-questions" className="btn btn-ghost btn-sm" title="คำถามจากนักเรียน">
            <MessageCircleQuestion size={14} strokeWidth={2.2} /> คำถามนักเรียน
          </Link>
          <Link to="/qa-acls-deep" target="_blank" className="btn btn-ghost btn-sm" title="เปิดหน้าผู้ใช้">
            <ExternalLink size={14} strokeWidth={2.2} /> ดูหน้า
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={14} strokeWidth={2.2} /> ออก
          </button>
        </div>
      </div>

      <QADeepCoverEditor onChange={load} />

      <div className="dash-card space-y-3">
        <div className="text-overline text-info inline-flex items-center gap-1.5">
          <Filter size={12} strokeWidth={2.2} /> ตัวกรองหมวด
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info appearance-none"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <option value={ALL_FILTER}>ทั้งหมด ({items.length})</option>
            <option value={UNCATEGORIZED_FILTER}>
              📌 ยังไม่จัดหมวด ({counts.uncategorized})
            </option>
            {chapters.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}{c.title} ({counts.byChapter.get(c.id) ?? 0})
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={2.2}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {filter === ALL_FILTER && (
          <label className="block">
            <span className="text-caption font-bold text-text-secondary mb-1 block">
              หมวดสำหรับ Q&A ที่จะเพิ่มใหม่ <span className="text-text-muted font-normal">(เลือกก่อนกด “เพิ่ม Q&A”)</span>
            </span>
            <div className="relative">
              <select
                value={newItemChapter}
                onChange={(e) => setNewItemChapter(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info appearance-none"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <option value="">— ยังไม่จัดหมวด —</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={2.2}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </label>
        )}
      </div>

      {counts.uncategorized > 0 && (
        <div className="dash-card flex items-center justify-between gap-2">
          <div className="text-caption text-text-secondary">
            <span className="font-bold text-text-primary">{counts.uncategorized}</span> รายการยังไม่ได้จัดหมวด —
            ให้ AI ช่วยจัดทีเดียว
            {bulkProgress && (
              <span className="text-text-muted ml-1">
                ({bulkProgress.done}/{bulkProgress.total} · จัดแล้ว {bulkProgress.applied})
              </span>
            )}
          </div>
          <button
            onClick={handleBulkClassify}
            disabled={bulkClassifying}
            className="btn btn-primary btn-sm disabled:opacity-50 shrink-0"
            title="ให้ AI จัดหมวดให้ทุกรายการที่ยังไม่จัดหมวด"
          >
            <Sparkles size={14} strokeWidth={2.2} />
            {bulkClassifying ? 'กำลังจัดหมวด…' : 'จัดหมวดอัตโนมัติทั้งหมด'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body-strong text-text-primary">
          รายการ Q&A ({filteredItems.length})
        </h2>
        <button
          onClick={handleAdd}
          disabled={creating}
          className="btn btn-primary btn-sm disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={2.2} />
          {creating ? 'กำลังเพิ่ม…' : 'เพิ่ม Q&A'}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : filteredItems.length === 0 ? (
        <div className="dash-card text-center text-caption text-text-muted py-6">
          {filter === ALL_FILTER
            ? 'ยังไม่มี Q&A — กด “เพิ่ม Q&A” เพื่อสร้างรายการแรก'
            : 'ยังไม่มี Q&A ในหมวดนี้'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <QADeepItemEditor
              key={item.id}
              item={item}
              allItems={items}
              chapters={chapters}
              onChange={load}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted text-center pt-2">
        เนื้อหาจะ refresh ในแอป end-user ภายใน 6 ชั่วโมง (cache TTL) — เปิดหน้าผู้ใช้แบบ incognito เพื่อดูทันที
      </p>
    </div>
  );
}
