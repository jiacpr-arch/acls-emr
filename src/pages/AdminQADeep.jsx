import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Plus, Shield, ExternalLink, ChevronDown, ChevronLeft, MessageCircleQuestion,
  FilePlus2, Archive,
} from 'lucide-react';
import { signOut } from '../services/auth';
import {
  listQaItemsFull,
  listChapters,
  createQaItem,
} from '../services/qaDeepAdminService';
import QADeepCoverEditor from '../components/admin/QADeepCoverEditor';
import QADeepItemEditor from '../components/admin/QADeepItemEditor';

export default function AdminQADeep() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newItemChapter, setNewItemChapter] = useState('');

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

  // Drafts = newly added items whose question is still empty. They live on this
  // "add new" page so they can be filled in right where they were created;
  // once a question is saved they move to the "จัดเก็บ" (posted) page.
  const draftItems = useMemo(
    () => items.filter(i => !(i.question || '').trim()),
    [items],
  );
  const postedCount = items.length - draftItems.length;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleAdd = async () => {
    setCreating(true);
    try {
      await createQaItem(newItemChapter || null);
      await load();
    } catch (err) {
      alert('เพิ่มไม่สำเร็จ: ' + (err?.message || err));
    }
    setCreating(false);
  };

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Admin
      </button>
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
            <h1 className="text-body-strong text-text-primary">Admin — เพิ่ม Q&A ACLS เชิงลึก</h1>
            <p className="text-[11px] text-text-muted">เพิ่มคำถาม-คำตอบใหม่ · รายการที่โพสต์แล้วอยู่ในหน้า “จัดเก็บ”</p>
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

      {/* ───── เพิ่มคำถามใหม่ ───── */}
      <div className="dash-card space-y-3" style={{ borderColor: 'var(--color-info)' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-overline text-info inline-flex items-center gap-1.5">
            <FilePlus2 size={12} strokeWidth={2.2} /> เพิ่มคำถามใหม่
          </div>
          <button
            onClick={handleAdd}
            disabled={creating}
            className="btn btn-primary btn-sm disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2.2} />
            {creating ? 'กำลังเพิ่ม…' : 'เพิ่ม Q&A'}
          </button>
        </div>

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

        {loading ? (
          <div className="text-center text-caption text-text-muted py-4">กำลังโหลด…</div>
        ) : draftItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[11px] text-text-muted">
              ฉบับร่างที่ยังไม่ได้กรอกคำถาม — กรอกคำถาม–คำตอบแล้วกด “บันทึก” รายการจะย้ายไปอยู่ในหน้า “จัดเก็บ”
            </p>
            {draftItems.map(item => (
              <QADeepItemEditor
                key={item.id}
                item={item}
                allItems={items}
                chapters={chapters}
                onChange={load}
              />
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-text-muted">
            กด “เพิ่ม Q&A” เพื่อสร้างคำถามใหม่ — รายการใหม่จะปรากฏที่นี่ให้กรอกทันที (ไม่ต้องเลื่อนลงไปล่างสุด)
          </p>
        )}
      </div>

      {/* ───── ลิงก์ไปหน้าจัดเก็บรายการที่โพสต์แล้ว ───── */}
      <Link
        to="/admin/qa-deep/posted"
        className="dash-card flex items-center justify-between gap-2 no-underline hover:border-info transition-colors"
      >
        <div className="inline-flex items-center gap-2">
          <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
            style={{ borderRadius: 'var(--radius-sm)' }}>
            <Archive size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-caption font-bold text-text-primary">จัดเก็บ Q&A ที่โพสต์แล้ว</div>
            <div className="text-[11px] text-text-muted">
              {loading ? 'กำลังนับ…' : `${postedCount} รายการ`} — แก้ไข จัดหมวด เรียงลำดับ และลบ
            </div>
          </div>
        </div>
        <ExternalLink size={14} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </Link>

      <p className="text-[11px] text-text-muted text-center pt-2">
        เนื้อหาจะ refresh ในแอป end-user ภายใน 6 ชั่วโมง (cache TTL) — เปิดหน้าผู้ใช้แบบ incognito เพื่อดูทันที
      </p>
    </div>
  );
}
