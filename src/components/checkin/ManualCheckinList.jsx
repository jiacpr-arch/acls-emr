import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';

const timeStr = (iso) => (iso ? new Date(iso).toLocaleTimeString('th-TH', {
  hour: '2-digit', minute: '2-digit',
}) : '');

// เช็คชื่อจากรายชื่อ (ไม่ใช้กล้อง) — นักเรียนลืมมือถือ/จอแตก/QR สแกนไม่ติด
// ใช้ข้อมูล board ที่หน้าแม่โหลดไว้แล้ว กดเช็คชื่อ → หน้าแม่เรียก RPC เดิม
// ตัวเดียวกับตอนสแกน แล้ว refresh board
export default function ManualCheckinList({ board, stationId, onCheckin, busy }) {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const list = (board?.rows || []).map(({ student, checkins }) => ({
      student,
      checkin: checkins?.[stationId] || null,
    }));
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? list.filter(({ student }) =>
          (student.name || '').toLowerCase().includes(needle)
          || (student.studentId || '').toLowerCase().includes(needle))
      : list;
    // เรียงคนที่ยังไม่เช็คชื่อขึ้นก่อน แล้วตามรหัสนักเรียน
    return filtered.sort((a, b) => {
      if (!!a.checkin !== !!b.checkin) return a.checkin ? 1 : -1;
      return (a.student.studentId || '').localeCompare(b.student.studentId || '');
    });
  }, [board, stationId, q]);

  return (
    <div className="dash-card space-y-2">
      <div className="relative">
        <Search size={14} strokeWidth={2.2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาชื่อ / รหัสนักเรียน"
          className="w-full text-caption !pl-9"
        />
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-text-muted text-caption py-4">
          {q ? 'ไม่พบนักเรียนที่ค้นหา' : 'ยังไม่มีนักเรียนในคลาส'}
        </div>
      ) : rows.map(({ student, checkin }) => (
        <div key={student.id} className="flex items-center gap-2 border-t border-border pt-2 first:border-t-0 first:pt-0">
          <div className="flex-1 min-w-0">
            <div className="text-caption text-text-primary truncate">{student.name}</div>
            <div className="text-2xs font-mono text-text-muted">{student.studentId}</div>
          </div>
          {checkin ? (
            <div className="text-2xs text-success font-bold inline-flex items-center gap-1 shrink-0">
              <Check size={12} strokeWidth={2.6} /> {timeStr(checkin.checkedInAt)}
              {checkin.examPassed != null && (
                <span className={checkin.examPassed ? 'text-success' : 'text-danger'}>
                  · {checkin.examPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                </span>
              )}
            </div>
          ) : (
            <button
              disabled={busy}
              onClick={() => onCheckin(student.id)}
              className="btn btn-primary btn-sm shrink-0 disabled:opacity-40">
              เช็คชื่อ
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
