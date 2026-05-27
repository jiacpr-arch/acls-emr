import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, AlertCircle } from 'lucide-react';
import { signIn } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-md mx-auto py-12 space-y-5">
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.28)',
          }}
        >
          <Lock size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">Admin Login</h1>
        <p className="text-caption text-text-muted">เข้าสู่ระบบจัดการเนื้อหา ALS</p>
      </div>

      <form onSubmit={handleSubmit} className="dash-card space-y-3">
        <label className="block">
          <span className="text-caption font-bold text-text-secondary mb-1 block">รหัสผ่าน</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            disabled={submitting}
            className="w-full px-3 py-2 bg-bg-secondary border border-border text-body text-text-primary focus:outline-none focus:border-info disabled:opacity-50"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </label>

        {error && (
          <div
            className="bg-danger/8 border border-danger/30 p-3 text-caption text-danger inline-flex items-center gap-2 w-full"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <AlertCircle size={14} strokeWidth={2.2} /> {error}
          </div>
        )}

        <button type="submit" disabled={submitting || !password} className="btn btn-primary btn-block disabled:opacity-50">
          <LogIn size={16} strokeWidth={2.2} />
          {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="text-[11px] text-text-muted text-center">
        Email: <code className="px-1 py-0.5 bg-bg-tertiary font-mono">admin@acls-emr.local</code>
      </p>
    </div>
  );
}
