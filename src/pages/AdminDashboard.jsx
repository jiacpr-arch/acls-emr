import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, BookOpen, MessageCircleQuestion, Inbox, ChevronRight,
} from 'lucide-react';
import { signOut } from '../services/auth';

const SECTIONS = [
  {
    to: '/admin/chapters',
    title: 'คลังความรู้ ALS',
    desc: 'แก้ไขบท หัวข้อ และเนื้อหา',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
    shadow: '0 8px 20px rgba(220, 38, 38, 0.22)',
  },
  {
    to: '/admin/qa-deep',
    title: 'Q&A ACLS เชิงลึก',
    desc: 'เพิ่ม/แก้ไขคำถาม-คำตอบ จัดหมวดและรูป',
    icon: MessageCircleQuestion,
    gradient: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark, #1d4ed8) 100%)',
    shadow: '0 8px 20px rgba(37, 99, 235, 0.22)',
  },
  {
    to: '/admin/student-questions',
    title: 'คำถามจากนักเรียน',
    desc: 'ตรวจสอบและเผยแพร่คำถามที่ส่งเข้ามา',
    icon: Inbox,
    gradient: 'linear-gradient(135deg, var(--color-success, #16a34a) 0%, var(--color-success-dark, #15803d) 100%)',
    shadow: '0 8px 20px rgba(22, 163, 74, 0.22)',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="page-container space-y-4">
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
            <h1 className="text-body-strong text-text-primary">Admin Dashboard</h1>
            <p className="text-[11px] text-text-muted">เลือกส่วนที่ต้องการเพิ่ม/แก้ไขเนื้อหา</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">
          <LogOut size={14} strokeWidth={2.2} /> ออกจากระบบ
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map(({ to, title, desc, icon: Icon, gradient, shadow }) => (
          <Link
            key={to}
            to={to}
            className="dash-card flex items-center gap-3 hover:bg-bg-tertiary/50 transition-colors group"
          >
            <div
              className="w-12 h-12 inline-flex items-center justify-center shrink-0"
              style={{
                background: gradient,
                borderRadius: 'var(--radius-lg)',
                boxShadow: shadow,
              }}
            >
              <Icon size={22} strokeWidth={2.2} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-body-strong text-text-primary block truncate">{title}</span>
              <span className="text-[11px] text-text-muted">{desc}</span>
            </div>
            <ChevronRight
              size={16}
              strokeWidth={2.2}
              className="text-text-muted shrink-0 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
