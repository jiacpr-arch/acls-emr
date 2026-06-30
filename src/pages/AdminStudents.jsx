import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, Search, Download, RefreshCw, Check,
} from 'lucide-react';
import { fetchStudentRoster } from '../services/adminStudentsService';

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminStudents() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setReloadKey(k => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetchStudentRoster()
      .then(d => { if (!cancelled) setRows(d.students || []); })
      .catch(e => { if (!cancelled) { setError(e.message); setRows([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      [r.name, r.phone, r.email, r.class_name, r.class_code, r.student_id]
        .some(v => String(v || '').toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const downloadCSV = () => {
    const header = ['ชื่อ', 'เบอร์โทร', 'อีเมล', 'รหัสนักเรียน', 'คลาส', 'รหัสคลาส', 'คอร์ส', 'Pre-test', 'Post-test', 'เข้าเมื่อ'];
    const lines = filtered.map(r => [
      r.name, r.phone, r.email, r.student_id, r.class_name, r.class_code,
      String(r.course_mode || '').toUpperCase(),
      r.pre_test_passed ? 'ผ่าน' : '-',
      r.post_test_passed ? 'ผ่าน' : '-',
      r.created_at ? r.created_at.slice(0, 10) : '',
    ]);
    const csv = [header, ...lines]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Admin
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Users size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h1 className="text-title text-text-primary">รายชื่อนักเรียน</h1>
          <p className="text-caption text-text-muted">
            {loading ? 'กำลังโหลด…' : `รวม ${rows.length} คน ทุกคลาส`}
          </p>
        </div>
        <button onClick={refresh} disabled={loading} className="btn btn-ghost btn-sm disabled:opacity-40">
          <RefreshCw size={13} strokeWidth={2.2} className={loading ? 'animate-spin' : ''} /> รีเฟรช
        </button>
      </div>

      {error && (
        <div className="dash-card !p-3 bg-danger/10 border border-danger/30 text-caption text-danger">
          โหลดรายชื่อไม่สำเร็จ: {error}
        </div>
      )}

      {/* Search + export */}
      <div className="flex items-center gap-2">
        <div className="flex-1 inline-flex items-center gap-2 dash-card !py-2 !px-3">
          <Search size={15} strokeWidth={2.2} className="text-text-muted shrink-0" />
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหา ชื่อ / เบอร์ / คลาส"
            className="w-full bg-transparent text-caption outline-none" />
        </div>
        <button onClick={downloadCSV} disabled={!filtered.length}
          className="btn btn-primary btn-sm disabled:opacity-40">
          <Download size={14} strokeWidth={2.2} /> CSV
        </button>
      </div>

      {/* Roster */}
      <div className="dash-card !p-0 overflow-x-auto">
        <table className="w-full text-caption whitespace-nowrap">
          <thead className="bg-bg-tertiary text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">ชื่อ</th>
              <th className="px-3 py-2 text-left">เบอร์โทร</th>
              <th className="px-3 py-2 text-left">คลาส</th>
              <th className="px-3 py-2 text-center">คอร์ส</th>
              <th className="px-3 py-2 text-center">Post-test</th>
              <th className="px-3 py-2 text-left">เข้าเมื่อ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-text-muted">กำลังโหลด…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-text-muted">
                {rows.length === 0 ? 'ยังไม่มีนักเรียน' : 'ไม่พบรายการที่ค้นหา'}
              </td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 text-text-primary">{r.name || '-'}</td>
                <td className="px-3 py-2 font-mono text-text-secondary">{r.phone || '-'}</td>
                <td className="px-3 py-2 text-text-secondary">{r.class_name || '-'}</td>
                <td className="px-3 py-2 text-center text-text-secondary">
                  {String(r.course_mode || '').toUpperCase()}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.post_test_passed
                    ? <Check size={15} strokeWidth={2.6} className="text-success inline" />
                    : <span className="text-text-muted">—</span>}
                </td>
                <td className="px-3 py-2 text-text-muted">{fmtDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dash-card !p-3 bg-warning/10 border border-warning/30 text-caption text-text-secondary">
        ข้อมูลส่วนบุคคล (ชื่อ–เบอร์โทร–อีเมล) — ใช้ภายในเพื่อการอบรมเท่านั้น (PDPA)
        · รวมนักเรียนทุกคน ทั้งที่เข้าคลาสด้วยรหัสคลาส และที่ทำ Pre/Post-test แบบเดี่ยว
      </div>
    </div>
  );
}
