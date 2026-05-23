import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Plus, Shield, ExternalLink } from 'lucide-react';
import { signOut } from '../services/auth';
import {
  listQaItemsFull,
  createQaItem,
} from '../services/qaDeepAdminService';
import QADeepCoverEditor from '../components/admin/QADeepCoverEditor';
import QADeepItemEditor from '../components/admin/QADeepItemEditor';

export default function AdminQADeep() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQaItemsFull();
      setItems(data);
    } catch (err) {
      alert('โหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleAdd = async () => {
    setCreating(true);
    try {
      await createQaItem();
      await load();
    } catch (err) {
      alert('เพิ่มไม่สำเร็จ: ' + (err?.message || err));
    }
    setCreating(false);
  };

  return (
    <div className="page-container space-y-4">
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
            <p className="text-[11px] text-text-muted">เพิ่ม/แก้ไขคำถาม-คำตอบ และอัปโหลดรูป</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/qa-acls-deep" target="_blank" className="btn btn-ghost btn-sm" title="เปิดหน้าผู้ใช้">
            <ExternalLink size={14} strokeWidth={2.2} /> ดูหน้า
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={14} strokeWidth={2.2} /> ออก
          </button>
        </div>
      </div>

      <QADeepCoverEditor onChange={load} />

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body-strong text-text-primary">รายการ Q&A ({items.length})</h2>
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
      ) : items.length === 0 ? (
        <div className="dash-card text-center text-caption text-text-muted py-6">
          ยังไม่มี Q&A — กด “เพิ่ม Q&A” เพื่อสร้างรายการแรก
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <QADeepItemEditor
              key={item.id}
              item={item}
              allItems={items}
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
