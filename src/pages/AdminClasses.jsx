import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, School, Search, RefreshCw, Copy, Check,
  Archive, ArchiveRestore,
} from 'lucide-react';
import { fetchClasses, setClassArchived } from '../services/adminClassesService';

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Recovery + housekeeping page: every class with BOTH codes (instructors who
// lose a code get it back from here) and an archive toggle for finished
// classes (archiving disables the codes).
export default function AdminClasses() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(null);   // `${id}:code` | `${id}:instructor`
  const [busyId, setBusyId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setReloadKey(k => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetchClasses()
      .then(d => { if (!cancelled) setRows(d.classes || []); })
      .catch(e => { if (!cancelled) { setError(e.message); setRows([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = showArchived ? rows : rows.filter(r => !r.archived_at);
    if (q) {
      list = list.filter(r =>
        [r.name, r.code, r.instructor_code, r.course_mode]
          .some(v => String(v || '').toLowerCase().includes(q)),
      );
    }
    return list;
  }, [rows, query, showArchived]);

  const copy = (key, text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(c => (c === key ? null : c)), 1500);
  };

  const toggleArchive = async (r) => {
    const archiving = !r.archived_at;
    if (archiving && !confirm(
      `ปิดคลาส "${r.name}"?\nรหัสเข้าคลาสและรหัสอาจารย์จะใช้ไม่ได้จนกว่าจะเปิดคลาสอีกครั้ง (ข้อมูลไม่หาย)`)) {
      return;
    }
    setBusyId(r.id);
    try {
      await setClassArchived(r.id, archiving);
      refresh();
    } catch (e) {
      alert('ไม่สำเร็จ: ' + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const CodeCell = ({ id, kind, value }) => {
    const key = `${id}:${kind}`;
    if (!value) return <span className="text-text-muted">-</span>;
    return (
      <button onClick={() => copy(key, value)}
        className="inline-flex items-center gap-1 font-mono text-text-primary hover:text-info"
        title="คัดลอก">
        {value}
        {copied === key
          ? <Check size={12} strokeWidth={2.4} className="text-success" />
          : <Copy size={12} strokeWidth={2} className="text-text-muted" />}
      </button>
    );
  };

  return (
    <div className="page-container space-y-5">
      <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
        <ChevronLeft size={14} strokeWidth={2.2} /> กลับไป Admin
      </button>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <School size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h1 className="text-title text-text-primary">คลาสทั้งหมด</h1>
          <p className="text-caption text-text-muted">
            {loading ? 'กำลังโหลด…' : `รวม ${rows.length} คลาส · กู้รหัสให้อาจารย์ได้จากหน้านี้`}
          </p>
        </div>
        <button onClick={refresh} disabled={loading} className="btn btn-ghost btn-sm disabled:opacity-40">
          <RefreshCw size={13} strokeWidth={2.2} className={loading ? 'animate-spin' : ''} /> รีเฟรช
        </button>
      </div>

      {error && (
        <div className="dash-card text-caption text-danger">โหลดไม่สำเร็จ: {error}</div>
      )}

      <div className="flex items-center gap-2">
        <div className="dash-card flex items-center gap-2 !py-2 flex-1">
          <Search size={14} strokeWidth={2.2} className="text-text-muted shrink-0" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหา ชื่อคลาส / รหัส"
            className="w-full bg-transparent text-caption outline-none" />
        </div>
        <label className="text-caption text-text-secondary inline-flex items-center gap-1.5 shrink-0">
          <input type="checkbox" checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)} />
          แสดงคลาสที่ปิดแล้ว
        </label>
      </div>

      <div className="dash-card !p-0 overflow-x-auto">
        <table className="w-full text-caption whitespace-nowrap">
          <thead className="bg-bg-tertiary text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">คลาส</th>
              <th className="px-3 py-2 text-left">คอร์ส</th>
              <th className="px-3 py-2 text-left">รหัสเข้าคลาส</th>
              <th className="px-3 py-2 text-left">รหัสอาจารย์</th>
              <th className="px-3 py-2 text-center">นักเรียน</th>
              <th className="px-3 py-2 text-left">สร้างเมื่อ</th>
              <th className="px-3 py-2 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-text-muted">กำลังโหลด…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-text-muted">ไม่พบคลาส</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className={`border-t border-border ${r.archived_at ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 text-text-primary max-w-[180px] truncate" title={r.name}>{r.name}</td>
                <td className="px-3 py-2 text-text-secondary uppercase">{r.course_mode}</td>
                <td className="px-3 py-2"><CodeCell id={r.id} kind="code" value={r.code} /></td>
                <td className="px-3 py-2"><CodeCell id={r.id} kind="instructor" value={r.instructor_code} /></td>
                <td className="px-3 py-2 text-center text-text-secondary">{r.student_count}</td>
                <td className="px-3 py-2 text-text-secondary">{fmtDate(r.created_at)}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => toggleArchive(r)} disabled={busyId === r.id}
                    className="btn btn-ghost btn-sm disabled:opacity-40">
                    {r.archived_at
                      ? <><ArchiveRestore size={13} strokeWidth={2.2} /> เปิดอีกครั้ง</>
                      : <><Archive size={13} strokeWidth={2.2} /> ปิดคลาส</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-text-muted px-1">
        คลาสรุ่นเก่า (สร้างก่อนมีรหัสอาจารย์) จะไม่มีรหัสอาจารย์ — รหัสเข้าคลาสใช้ดูผลรวมได้ตามเดิม
        · ปิดคลาสแล้วรหัสทั้งคู่จะใช้ไม่ได้ แต่ข้อมูลยังอยู่ครบ เปิดอีกครั้งได้ตลอด
      </p>
    </div>
  );
}
