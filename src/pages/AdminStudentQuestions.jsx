import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, ExternalLink, ChevronDown, ChevronLeft, Filter, MessageCircleQuestion, RefreshCw,
} from 'lucide-react';
import { signOut } from '../services/auth';
import {
  listStudentQuestions,
  countStudentQuestionsByStatus,
} from '../services/studentQuestionAdminService';
import { listChapters } from '../services/qaDeepAdminService';
import StudentQuestionReviewItem from '../components/admin/StudentQuestionReviewItem';

const STATUS_FILTERS = [
  { value: 'all',         label: 'ทั้งหมด' },
  { value: 'draft_ready', label: '🟡 พร้อมตรวจ' },
  { value: 'pending',     label: '⏳ รอประมวลผล' },
  { value: 'processing',  label: '⚙️ กำลังประมวลผล' },
  { value: 'failed',      label: '❌ ล้มเหลว' },
  { value: 'published',   label: '✅ เผยแพร่แล้ว' },
  { value: 'rejected',    label: '🚫 ปฏิเสธ' },
];

export default function AdminStudentQuestions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('draft_ready');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [its, chs, cs] = await Promise.all([
        listStudentQuestions(),
        listChapters(),
        countStudentQuestionsByStatus(),
      ]);
      setItems(its);
      setChapters(chs);
      setCounts(cs);
    } catch (err) {
      alert('โหลดไม่สำเร็จ: ' + (err?.message || err));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => i.status === filter);
  }, [items, filter]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
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
            <MessageCircleQuestion size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h1 className="text-body-strong text-text-primary">คำถามจากนักเรียน</h1>
            <p className="text-[11px] text-text-muted">ตรวจสอบคำตอบที่ AI ร่าง · แก้ไข · เผยแพร่เข้า Q&A</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/qa-deep" className="btn btn-ghost btn-sm" title="ไปยัง Q&A admin">
            <Shield size={14} strokeWidth={2.2} /> Q&A
          </Link>
          <Link to="/qa-acls-deep" target="_blank" className="btn btn-ghost btn-sm" title="เปิดหน้าผู้ใช้">
            <ExternalLink size={14} strokeWidth={2.2} /> ดูหน้า
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={14} strokeWidth={2.2} /> ออก
          </button>
        </div>
      </div>

      <div className="dash-card space-y-3">
        <div className="text-overline text-info inline-flex items-center gap-1.5">
          <Filter size={12} strokeWidth={2.2} /> ตัวกรองสถานะ
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-bg-secondary border border-border text-caption text-text-primary focus:outline-none focus:border-info appearance-none"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {STATUS_FILTERS.map(s => {
              const n = s.value === 'all'
                ? items.length
                : (counts[s.value] || 0);
              return (
                <option key={s.value} value={s.value}>{s.label} ({n})</option>
              );
            })}
          </select>
          <ChevronDown size={14} strokeWidth={2.2}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body-strong text-text-primary">
          รายการ ({filtered.length})
        </h2>
        <button onClick={load} disabled={loading} className="btn btn-ghost btn-sm disabled:opacity-40">
          <RefreshCw size={12} strokeWidth={2.2} className={loading ? 'animate-spin' : ''} />
          รีเฟรช
        </button>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : filtered.length === 0 ? (
        <div className="dash-card text-center text-caption text-text-muted py-6">
          ไม่มีคำถามในสถานะนี้
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <StudentQuestionReviewItem
              key={item.id}
              item={item}
              chapters={chapters}
              onChange={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
