import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ChevronDown, BookOpen, Shield, MessageCircleQuestion } from 'lucide-react';
import { signOut } from '../services/auth';
import { listChaptersWithCounts } from '../services/alsAdminService';
import ChapterEditor from '../components/admin/ChapterEditor';

export default function AdminChapters() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listChaptersWithCounts();
      setChapters(data);
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

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <div
            className="w-10 h-10 inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Shield size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h1 className="text-body-strong text-text-primary">Admin — คลังความรู้ ALS</h1>
            <p className="text-[11px] text-text-muted">แก้ไขเนื้อหา บันทึกอัตโนมัติเข้า Supabase</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/qa-deep" className="btn btn-ghost btn-sm" title="จัดการ Q&A ACLS เชิงลึก">
            <MessageCircleQuestion size={14} strokeWidth={2.2} /> Q&A เชิงลึก
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={14} strokeWidth={2.2} /> ออก
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-caption text-text-muted py-8">กำลังโหลด…</div>
      ) : (
        <div className="space-y-3">
          {chapters.map(ch => {
            const isOpen = openId === ch.id;
            return (
              <div key={ch.id} className="dash-card !p-0 overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : ch.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors"
                >
                  <div className="w-9 h-9 inline-flex items-center justify-center bg-danger/12 text-danger shrink-0"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-base">{ch.icon || <BookOpen size={16} strokeWidth={2.2} />}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-strong text-text-primary block truncate">{ch.title}</span>
                    <span className="text-[11px] text-text-muted">
                      {ch.sectionCount} หัวข้อ · อัปเดตล่าสุด {new Date(ch.updated_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    strokeWidth={2.2}
                    className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 animate-slide-up">
                    <div className="h-px bg-border mb-3" />
                    <ChapterEditor chapterId={ch.id} onChange={load} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-text-muted text-center pt-2">
        เนื้อหาจะ refresh ในแอป end-user ภายใน 6 ชั่วโมง (cache TTL) — กด refresh เพื่อดูทันที
      </p>
    </div>
  );
}
