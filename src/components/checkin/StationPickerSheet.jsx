import { Award, ClipboardCheck, Check, X, User } from 'lucide-react';

const timeStr = (iso) => (iso ? new Date(iso).toLocaleTimeString('th-TH', {
  hour: '2-digit', minute: '2-digit',
}) : '');

// Bottom sheet หลังสแกน QR — "นักเรียนคนนี้เข้าฐานไหน?"
// scan-first flow: อาจารย์ไม่ต้องเลือกฐานก่อนสแกน สแกนปุ๊บระบบถามฐานทันที
// ฐานที่นักเรียนคนนี้เช็คไปแล้วขึ้น ✓ + เวลา (ยังกดซ้ำได้ เผื่อเข้าไปให้คะแนน
// เพิ่ม — ระบบกันบันทึกซ้ำที่ DB อยู่แล้ว) ฐานที่ใช้ครั้งล่าสุดมีป้าย "ล่าสุด"
export default function StationPickerSheet({
  open, student, stations, checkins = {}, lastStationId, onPick, onClose, busy = false,
}) {
  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg max-h-[85vh] bg-bg-secondary animate-slide-up flex flex-col"
        style={{ borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', boxShadow: 'var(--shadow-pop)' }}>
        <div className="p-4 border-b border-border shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary">เข้าฐานไหน?</div>
              <div className="text-2xs text-text-muted">แตะฐานเพื่อเช็คชื่อ + เปิดใบประเมินทันที</div>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="ยกเลิก">
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
          <div className="bg-info/12 border border-info/40 px-3 py-2 flex items-center gap-2"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <User size={15} strokeWidth={2.4} className="text-info shrink-0" />
            <div className="min-w-0">
              <span className="text-body-strong text-text-primary">{student.name}</span>
              {student.studentId && (
                <span className="font-mono text-caption text-text-secondary"> ({student.studentId})</span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {stations.map((s) => {
            const done = checkins?.[s.id];
            const isLast = s.id === lastStationId;
            return (
              <button
                key={s.id}
                type="button"
                disabled={busy}
                onClick={() => onPick(s)}
                className={`cl-row ${done ? 'is-checked' : ''}`}
              >
                <span className="cl-box">
                  {done
                    ? <Check size={17} strokeWidth={3.2} />
                    : (s.kind === 'exam'
                      ? <Award size={15} strokeWidth={2.4} className="text-warning" />
                      : <ClipboardCheck size={15} strokeWidth={2.4} className="text-text-muted" />)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-bold">{s.name}</span>
                  {s.kind === 'exam' && <span className="text-warning text-caption"> · สอบ</span>}
                  {done && (
                    <span className="block text-caption text-success">
                      เช็คชื่อแล้ว {timeStr(done.checkedInAt)}
                      {done.examPassed != null && (done.examPassed ? ' · ผ่าน' : ' · ไม่ผ่าน')}
                    </span>
                  )}
                </span>
                {isLast && (
                  <span className="shrink-0 text-2xs font-bold text-info bg-info/12 px-2 py-0.5"
                    style={{ borderRadius: 'var(--radius-full)' }}>
                    ล่าสุด
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <button onClick={onClose} className="btn btn-ghost btn-block">ยกเลิก — ไม่เช็คชื่อ</button>
        </div>
      </div>
    </div>
  );
}
