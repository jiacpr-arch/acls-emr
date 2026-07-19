import { useState } from 'react';
import { Check, AlertTriangle, X, Award, ClipboardList } from 'lucide-react';

const timeStr = (iso) => (iso ? new Date(iso).toLocaleTimeString('th-TH', {
  hour: '2-digit', minute: '2-digit',
}) : '');

// การ์ดผลการสแกนล่าสุด — เขียว: เช็คชื่อสำเร็จ / เหลือง: สแกนซ้ำ /
// แดง: QR ไม่ถูกต้อง-คนละคลาส-นักเรียนไม่อยู่ในคลาส
// ฐานสอบ: มีปุ่ม ผ่าน/ไม่ผ่าน + คะแนน ต่อท้ายให้กดได้ทันทีหลังสแกน (แบบเร็ว
// ไม่ผ่านเช็คลิสต์) ทุกฐาน (ไม่ว่า kind ไหน) มีปุ่ม "เปิดเช็คลิสต์" ให้ให้คะแนน
// ละเอียดผ่าน ChecklistGrader ได้เสมอ — ตามที่อาจารย์ยืนยันว่าอยากใช้กับฐาน
// practice ด้วย ไม่ใช่แค่ฐานสอบ
export default function ScanResultCard({ result, onSetExam, examBusy, onOpenChecklist }) {
  const [score, setScore] = useState('');

  if (!result) return null;
  const { status, data, message } = result;

  if (status === 'error') {
    return (
      <div className="dash-card border border-danger/40 bg-danger/8 flex items-start gap-3">
        <X size={18} strokeWidth={2.4} className="text-danger shrink-0 mt-0.5" />
        <div className="text-caption text-text-primary">{message}</div>
      </div>
    );
  }

  const dup = status === 'duplicate';
  const isExam = data?.station?.kind === 'exam';
  const judged = data?.examPassed != null;

  return (
    <div className={`dash-card space-y-3 border ${
      dup ? 'border-warning/40 bg-warning/8' : 'border-success/40 bg-success/8'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 inline-flex items-center justify-center shrink-0 ${
          dup ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          {dup ? <AlertTriangle size={16} strokeWidth={2.4} /> : <Check size={16} strokeWidth={2.6} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">
            {data.student.name}
            <span className="font-mono text-text-secondary text-caption"> · {data.student.studentId}</span>
          </div>
          <div className={`text-caption ${dup ? 'text-warning' : 'text-success'} font-bold`}>
            {dup
              ? `เช็คชื่อไปแล้วเมื่อ ${timeStr(data.checkedInAt)}`
              : `เช็คชื่อสำเร็จ ${timeStr(data.checkedInAt)} — ${data.station.name}`}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border">
        {(isExam || judged) && (
          <div className="text-overline text-text-muted inline-flex items-center gap-1">
            <Award size={11} strokeWidth={2.4} /> ผลสอบฐานนี้
            {judged && (
              <span className={`font-bold ${data.examPassed ? 'text-success' : 'text-danger'}`}>
                — บันทึกแล้ว: {data.examPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                {data.examScore != null ? ` (${data.examScore})` : ''}
              </span>
            )}
          </div>
        )}
        {isExam && (
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="คะแนน (ไม่บังคับ)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="flex-1 min-w-0 text-caption"
            />
            <button
              disabled={examBusy}
              onClick={() => onSetExam(true, score === '' ? null : Number(score))}
              className="btn btn-sm bg-success text-white font-bold disabled:opacity-40">
              ผ่าน
            </button>
            <button
              disabled={examBusy}
              onClick={() => onSetExam(false, score === '' ? null : Number(score))}
              className="btn btn-sm bg-danger text-white font-bold disabled:opacity-40">
              ไม่ผ่าน
            </button>
          </div>
        )}
        {onOpenChecklist && (
          <button onClick={onOpenChecklist} className="btn btn-ghost btn-sm btn-block">
            <ClipboardList size={13} strokeWidth={2.2} /> เปิดเช็คลิสต์ให้คะแนนละเอียด
          </button>
        )}
      </div>
    </div>
  );
}
