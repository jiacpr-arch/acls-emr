import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, GraduationCap, Award, ClipboardCheck, RefreshCw, BarChart3,
} from 'lucide-react';
import { fetchAdminStats } from '../services/adminStatsService';

const MODES = [
  { key: 'acls', label: 'ACLS' },
  { key: 'bls', label: 'BLS' },
];

// Pull a numeric field for a given course_mode out of a [{course_mode, ...}] array.
function byMode(arr, mode, field) {
  const row = (arr || []).find(r => r.course_mode === mode);
  return row ? (row[field] ?? 0) : 0;
}

export default function AdminStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Refresh button — sets loading in an event handler (not in the effect body)
  // then bumps the key to re-run the fetch.
  const refresh = () => {
    setLoading(true);
    setError(null);
    setReloadKey(k => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetchAdminStats()
      .then(d => { if (!cancelled) setStats(d); })
      .catch(e => { if (!cancelled) { setError(e.message); setStats(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const cards = [
    { label: 'นักเรียนทั้งหมด', value: stats?.students_total, Icon: Users, tone: 'text-info' },
    { label: 'คลาสทั้งหมด', value: stats?.classes_total, sub: stats != null ? `กำลังเปิด ${stats.classes_active}` : null, Icon: GraduationCap, tone: 'text-text-primary' },
    { label: 'ผ่าน Post-test', value: stats?.post_test_passed, Icon: ClipboardCheck, tone: 'text-success' },
    { label: 'ใบประกาศนียบัตรที่ออก', value: stats?.certs_total, Icon: Award, tone: 'text-warning' },
  ];

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Admin
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BarChart3 size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h1 className="text-title text-text-primary">สถิติผู้เรียน</h1>
          <p className="text-caption text-text-muted">ภาพรวมทุกคลาส (ACLS + BLS)</p>
        </div>
        <button onClick={refresh} disabled={loading} className="btn btn-ghost btn-sm disabled:opacity-40">
          <RefreshCw size={13} strokeWidth={2.2} className={loading ? 'animate-spin' : ''} /> รีเฟรช
        </button>
      </div>

      {error && (
        <div className="dash-card !p-3 bg-danger/10 border border-danger/30 text-caption text-danger">
          โหลดสถิติไม่สำเร็จ: {error}
        </div>
      )}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map(({ label, value, sub, Icon, tone }) => (
          <div key={label} className="dash-card !p-4">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Icon size={14} strokeWidth={2.2} />
              <span className="text-caption">{label}</span>
            </div>
            <div className={`text-numeric text-3xl mt-1 ${tone}`}>
              {loading || value == null ? '—' : value}
            </div>
            {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Breakdown by course */}
      <div className="dash-card !p-0 overflow-x-auto">
        <table className="w-full text-caption">
          <thead className="bg-bg-tertiary text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">คอร์ส</th>
              <th className="px-3 py-2 text-center">นักเรียน</th>
              <th className="px-3 py-2 text-center">คลาส</th>
              <th className="px-3 py-2 text-center">ใบประกาศนียบัตร</th>
            </tr>
          </thead>
          <tbody>
            {MODES.map(({ key, label }) => (
              <tr key={key} className="border-t border-border">
                <td className="px-3 py-2 font-bold text-text-primary">{label}</td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {loading ? '—' : byMode(stats?.students_by_mode, key, 'students')}
                </td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {loading ? '—' : byMode(stats?.classes_by_mode, key, 'classes')}
                </td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {loading ? '—' : byMode(stats?.certs_by_mode, key, 'certs')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Caveat — same data scope as the instructor cohort page */}
      <div className="dash-card !p-3 bg-info/10 border border-info/30 text-caption text-text-secondary">
        นับเฉพาะนักเรียนที่เข้าคลาสด้วยรหัสคลาส (class code) — คนที่เรียนโดยไม่กรอกรหัสจะไม่ถูกนับ
        ส่วน "ใบประกาศนียบัตรที่ออก" นับทุกใบที่ออกในแอป ไม่ว่าจะเข้าคลาสหรือไม่
      </div>
    </div>
  );
}
