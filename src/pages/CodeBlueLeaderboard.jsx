import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useClassStore } from '../stores/classStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { rpcGetCodeBlueLeaderboard } from '../services/cohortSync';

// อันดับเหรียญ Code Blue Sim ของทั้งคลาส — ทุกคนในคลาสเห็นชื่อ+อันดับกันหมด
// เหรียญคำนวณฝั่ง server จากผลที่ดีที่สุดต่อเคส (เล่นซ้ำอัปเกรดได้ ฟาร์มไม่ได้):
// 🥇 ผ่านแบบไม่พลาดเลย · 🥈 พลาด ≤ 2 · 🥉 ผ่าน — แต้ม 3/2/1

const RANK_TONE = ['#F2C14E', '#C0C7D1', '#CD8A54']; // ทอง เงิน ทองแดง สำหรับ top 3

export default function CodeBlueLeaderboard() {
  const navigate = useNavigate();
  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [rows, setRows] = useState(null); // null = กำลังโหลด
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setRows(null);
    rpcGetCodeBlueLeaderboard().then(({ data, error: err }) => {
      if (err) setError(err);
      else setRows(data);
    });
  };

  useEffect(() => {
    if (classCode) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classCode]);

  // ระบุแถวของตัวเอง — pk ตรงกับที่ endCase ใช้ส่งผล (activeStudent.id)
  // เผื่อ pk ฝั่ง server ถูก remap ให้ fallback เทียบด้วยรหัสนักเรียน
  const isMe = (r) => !!activeStudent && (
    r.studentPk === activeStudent.id
    || (!!activeStudent.studentId && r.studentId === activeStudent.studentId)
  );

  if (!classCode) {
    return (
      <div className="page-container space-y-4 pb-24 text-center">
        <div className="text-[52px] pt-8" aria-hidden="true">🏆</div>
        <h1 className="text-title text-text-primary">อันดับเหรียญในคลาส</h1>
        <p className="text-caption text-text-muted">
          ยังไม่ได้เข้าร่วมคลาส — กรอกรหัสคลาสจากอาจารย์ที่หน้า Pre-course ก่อน
          แล้วผล Code Blue Sim ของคุณจะขึ้นบอร์ดแข่งกับเพื่อนในคลาสอัตโนมัติ
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/pre-course')}>
          ไปหน้า Pre-course
        </button>
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/sim')}>
            ← กลับไปเล่น Code Blue Sim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-4 pb-24">
      <div className="text-center space-y-1 pt-2">
        <div className="text-[44px] leading-none" aria-hidden="true">🏆</div>
        <h1 className="text-title text-text-primary">อันดับเหรียญในคลาส</h1>
        <p className="text-caption text-text-muted">{className || classCode}</p>
        <p className="text-2xs text-text-muted">
          🥇 ผ่านแบบไม่พลาดเลย · 🥈 พลาด ≤ 2 · 🥉 ผ่าน — แต้ม 3/2/1 นับผลที่ดีที่สุดต่อเคส
        </p>
      </div>

      {error && (
        <div className="dash-card text-center space-y-2">
          <p className="text-caption text-danger">โหลดอันดับไม่สำเร็จ — ลองใหม่อีกครั้ง</p>
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={15} strokeWidth={2.2} /> ลองใหม่
          </button>
        </div>
      )}

      {!error && rows === null && (
        <div className="dash-card text-center text-caption text-text-muted">กำลังโหลดอันดับ…</div>
      )}

      {!error && rows !== null && rows.length === 0 && (
        <div className="dash-card text-center text-caption text-text-muted">
          ยังไม่มีใครในคลาสเล่น Code Blue Sim เลย — เป็นคนแรกสิ!
        </div>
      )}

      {!error && rows !== null && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r, i) => {
            const me = isMe(r);
            const tone = i < 3 && r.points > 0 ? RANK_TONE[i] : null;
            return (
              <div
                key={r.studentPk}
                className="dash-card !p-3 flex items-center gap-3"
                style={me ? { boxShadow: '0 0 0 2px var(--color-info) inset' } : undefined}
              >
                <span
                  className="w-8 h-8 shrink-0 inline-flex items-center justify-center font-extrabold text-sm"
                  style={{
                    borderRadius: '50%',
                    background: tone || 'rgba(127, 127, 127, .12)',
                    color: tone ? '#1F2430' : 'inherit',
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-bold text-text-primary truncate">
                    {r.name}{me && <span className="text-info text-2xs font-extrabold"> · คุณ</span>}
                  </div>
                  <div className="text-2xs text-text-muted">
                    🥇 {r.gold} · 🥈 {r.silver} · 🥉 {r.bronze} · ผ่าน {r.cleared} เคส
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-headline font-extrabold text-text-primary">{r.points}</div>
                  <div className="text-3xs text-text-muted">แต้ม</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <button className="btn btn-primary" onClick={() => navigate('/sim')}>
          🚨 เก็บเหรียญเพิ่ม — เล่น Code Blue Sim
        </button>
      </div>
    </div>
  );
}
