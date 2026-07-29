import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useClassStore } from '../stores/classStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { isOpenLeague } from '../config/openLeague';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import {
  rpcGetCodeBlueLeaderboard, rpcGetCodeBlueGlobalLeaderboard,
} from '../services/cohortSync';

// อันดับ Code Blue Sim สองมุมมอง:
//   คลาสของฉัน — บอร์ดเดิม (ต้องอยู่ในคลาส/ลีก) ทุกคนในคลาสเห็นชื่อ+อันดับกันหมด
//   ทั้งเว็บ    — รวมทุกคลาส + ลีกออนไลน์ของหลักสูตรนี้ เปิดดูได้ไม่ต้องมีรหัส
// เหรียญคำนวณฝั่ง server จากผลที่ดีที่สุดต่อเคส (เล่นซ้ำอัปเกรดได้ ฟาร์มไม่ได้):
// 🥇 ผ่านแบบไม่พลาดเลย · 🥈 พลาด ≤ 2 · 🥉 ผ่าน — แต้ม 3/2/1
// แต้มเท่ากันตัดสินด้วย "คะแนนรวม" (ผลรวมคะแนนดีสุดต่อเคส) — ใช้ชี้ขาด
// ผู้ชนะเวลาจัดแคมเปญแจกรางวัล

const RANK_TONE = ['#F2C14E', '#C0C7D1', '#CD8A54']; // ทอง เงิน ทองแดง สำหรับ top 3

const rankTone = (rank, points) => (rank <= 3 && points > 0 ? RANK_TONE[rank - 1] : null);

// ช่วงเวลา "เดือนนี้" สำหรับบอร์ดประจำเดือน (ตัดคะแนนตามเดือนปฏิทิน) —
// until เปิดไว้ถึงปัจจุบัน server กรองจาก finished_at ของผลเกม
const monthSince = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};
const monthLabel = () => new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

function MedalLine({ r }) {
  return (
    <div className="text-2xs text-text-muted">
      🥇 {r.gold} · 🥈 {r.silver} · 🥉 {r.bronze} · ผ่าน {r.cleared} เคส
    </div>
  );
}

function MyRankCard({ rank, row, totalPlayers }) {
  return (
    <div className="dash-card !p-3 flex items-center gap-3"
      style={{ boxShadow: '0 0 0 2px var(--color-info) inset' }}>
      <span className="w-10 h-10 shrink-0 inline-flex flex-col items-center justify-center font-extrabold"
        style={{ borderRadius: '50%', background: 'var(--color-info)', color: '#fff' }}>
        <span className="text-sm leading-none">#{rank}</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-body font-bold text-text-primary truncate">
          อันดับของฉัน — {row.name}
          {totalPlayers ? <span className="text-2xs text-text-muted font-normal"> (จาก {totalPlayers} คน)</span> : null}
        </div>
        <MedalLine r={row} />
      </div>
      <div className="text-right shrink-0">
        <div className="text-headline font-extrabold text-text-primary">{row.points} แต้ม</div>
        <div className="text-3xs text-text-muted">คะแนนรวม {row.totalScore ?? 0}</div>
      </div>
    </div>
  );
}

function BoardRow({ rank, r, me, sub }) {
  const tone = rankTone(rank, r.points);
  return (
    <div
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
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-body font-bold text-text-primary truncate">
          {r.name}{me && <span className="text-info text-2xs font-extrabold"> · คุณ</span>}
        </div>
        <MedalLine r={r} />
        {sub && <div className="text-3xs text-text-muted truncate">{sub}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="text-headline font-extrabold text-text-primary">{r.points}</div>
        <div className="text-3xs text-text-muted">แต้ม · คะแนนรวม {r.totalScore ?? 0}</div>
      </div>
    </div>
  );
}

export default function CodeBlueLeaderboard() {
  const navigate = useNavigate();
  const classCode = useClassStore(s => s.classCode);
  const className = useClassStore(s => s.className);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  // ไม่มีคลาสก็ยังดู "ทั้งเว็บ" ได้ — เปิดแท็บ global ให้เลย
  const [tab, setTab] = useState(classCode ? 'class' : 'global');
  // รอบรางวัลเป็นรายเดือน → เริ่มที่ "เดือนนี้" (สนามแข่งจริงของแคมเปญ)
  const [period, setPeriod] = useState('month'); // 'month' | 'all'

  // ---- บอร์ดคลาสของฉัน ----
  const [rows, setRows] = useState(null); // null = กำลังโหลด
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // ปุ่ม "ลองใหม่" bump เพื่อ re-fetch

  const load = () => {
    setError(null);
    setRows(null);
    setTick((t) => t + 1);
  };

  useEffect(() => {
    if (!classCode) return undefined;
    let alive = true;
    const since = period === 'month' ? monthSince() : null;
    rpcGetCodeBlueLeaderboard({ since }).then(({ data, error: err }) => {
      if (!alive) return;
      if (err) setError(err);
      else setRows(data);
    });
    return () => { alive = false; };
  }, [classCode, tick, period]);

  // ---- บอร์ดรวมทั้งเว็บ ----
  const [gData, setGData] = useState(null);
  const [gError, setGError] = useState(null);
  const [gTick, setGTick] = useState(0);
  const studentPk = activeStudent?.id || null;

  const loadGlobal = () => {
    setGError(null);
    setGData(null);
    setGTick((t) => t + 1);
  };

  useEffect(() => {
    if (tab !== 'global') return undefined;
    let alive = true;
    const since = period === 'month' ? monthSince() : null;
    rpcGetCodeBlueGlobalLeaderboard({ studentPk, since }).then(({ data, error: err }) => {
      if (!alive) return;
      if (err) setGError(err);
      else setGData(data);
    });
    return () => { alive = false; };
  }, [tab, gTick, studentPk, period]);

  // สลับช่วงเวลา: ล้างข้อมูลก่อนให้ขึ้นสถานะกำลังโหลด ไม่โชว์บอร์ดเก่าค้าง
  const changePeriod = (p) => {
    if (p === period) return;
    setPeriod(p);
    setRows(null);
    setGData(null);
  };

  // ระบุแถวของตัวเอง — pk ตรงกับที่ endCase ใช้ส่งผล (activeStudent.id)
  // เผื่อ pk ฝั่ง server ถูก remap ให้ fallback เทียบด้วยรหัสนักเรียน
  // (บอร์ดลีกออนไลน์ server ปิด studentId ไว้ — กันรหัสผู้เล่นรั่ว — เหลือเทียบ pk)
  const isMe = (r) => !!activeStudent && (
    r.studentPk === activeStudent.id
    || (!!activeStudent.studentId && !!r.studentId && r.studentId === activeStudent.studentId)
  );

  const openLeague = isOpenLeague(classCode);
  const classTitle = openLeague ? 'อันดับลีกออนไลน์' : 'อันดับเหรียญในคลาส';
  const myIndex = rows ? rows.findIndex(isMe) : -1;
  const myRow = myIndex >= 0 ? rows[myIndex] : null;

  // แคมเปญรางวัล: ผู้ชนะต้องมีช่องทางติดต่อกลับ แต่เบอร์เป็นช่องไม่บังคับตอน
  // ลงทะเบียน (บังคับแล้ว drop-off สูง) — เลยชวนเพิ่มตรงหน้าบอร์ดแทน ซึ่งเป็น
  // จุดที่ผู้เล่นเห็นอันดับตัวเองและอยากได้รางวัลพอดี ฟอร์มเดิม prefill
  // ชื่อ/รหัสให้แล้ว เหลือกรอกเบอร์อย่างเดียว บันทึกแล้ว sync ขึ้น server
  const [showIdentity, setShowIdentity] = useState(false);
  const needContact = !!classCode && !!activeStudent && !activeStudent.phone;

  return (
    <div className="page-container space-y-4 pb-24">
      <div className="text-center space-y-1 pt-2">
        <div className="text-[44px] leading-none" aria-hidden="true">🏆</div>
        <h1 className="text-title text-text-primary">
          {tab === 'global' ? 'อันดับรวมทั้งเว็บ' : classTitle}
        </h1>
        <p className="text-caption text-text-muted">
          {period === 'month' && <>ประจำเดือน{monthLabel()} · </>}
          {tab === 'global'
            ? `ทุกคลาส + ลีกออนไลน์${gData ? ` · ผู้เล่นทั้งหมด ${gData.totalPlayers} คน` : ''}`
            : (className || classCode)}
        </p>
        <p className="text-2xs text-text-muted">
          🥇 ผ่านแบบไม่พลาดเลย · 🥈 พลาด ≤ 2 · 🥉 ผ่าน — แต้ม 3/2/1 นับผลที่ดีที่สุดต่อเคส
          {' '}· แต้มเท่ากันตัดสินด้วยคะแนนรวม
        </p>
      </div>

      {/* กติการางวัลรายเดือน — 2 รางวัล: แชมป์ทั้งเว็บ + แชมป์ลีกออนไลน์ */}
      <div className="dash-card !p-3 text-caption text-text-muted text-center">
        🏆 รางวัลประจำเดือน 2 รางวัล — <b>แชมป์ทั้งเว็บ</b> และ <b>แชมป์ลีกออนไลน์</b>
        <br />
        <span className="text-2xs">
          ตัดคะแนนสิ้นเดือน (ดูจากบอร์ด "เดือนนี้") · ผู้ชนะที่ไม่มีเบอร์ติดต่อถือว่าสละสิทธิ์
        </span>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className={`btn btn-sm ${tab === 'global' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('global')}
          aria-pressed={tab === 'global'}
        >
          🌐 ทั้งเว็บ
        </button>
        <button
          className={`btn btn-sm ${tab === 'class' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('class')}
          aria-pressed={tab === 'class'}
        >
          🏫 {openLeague ? 'ลีกออนไลน์' : 'คลาสของฉัน'}
        </button>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => changePeriod('month')}
          aria-pressed={period === 'month'}
        >
          📅 เดือนนี้
        </button>
        <button
          className={`btn btn-sm ${period === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => changePeriod('all')}
          aria-pressed={period === 'all'}
        >
          ตลอดกาล
        </button>
      </div>

      {needContact && (
        <div className="dash-card !p-3 flex items-center gap-3">
          <span className="text-[26px] leading-none shrink-0" aria-hidden="true">🎁</span>
          <div className="flex-1 min-w-0 text-caption text-text-muted">
            มีประกาศผู้ชนะรางวัลเป็นประจำ — เพิ่มเบอร์โทรไว้ให้ทีมงานติดต่อกลับ
            <b> ผู้ชนะที่ไม่มีเบอร์ติดต่อถือว่าสละสิทธิ์</b>
          </div>
          <button className="btn btn-sm btn-primary shrink-0" onClick={() => setShowIdentity(true)}>
            เพิ่มเบอร์
          </button>
        </div>
      )}

      {/* ================= ทั้งเว็บ ================= */}
      {tab === 'global' && (
        <>
          {gError && (
            <div className="dash-card text-center space-y-2">
              <p className="text-caption text-danger">โหลดอันดับไม่สำเร็จ — ลองใหม่อีกครั้ง</p>
              <button className="btn btn-ghost" onClick={loadGlobal}>
                <RefreshCw size={15} strokeWidth={2.2} /> ลองใหม่
              </button>
            </div>
          )}

          {!gError && gData === null && (
            <div className="dash-card text-center text-caption text-text-muted">กำลังโหลดอันดับ…</div>
          )}

          {!gError && gData !== null && (
            <>
              {gData.me ? (
                <MyRankCard rank={gData.me.rank} row={gData.me} totalPlayers={gData.totalPlayers} />
              ) : activeStudent ? (
                <div className="dash-card !p-3 text-center text-caption text-text-muted">
                  {period === 'month'
                    ? <>เดือนนี้คุณยังไม่มีอันดับ — เล่นสักเคส แล้วชื่อ <b>{activeStudent.name}</b> จะขึ้นบอร์ดทันที</>
                    : <>คุณยังไม่มีอันดับ — ผ่านเคสแรกให้ได้ แล้วชื่อ <b>{activeStudent.name}</b> จะขึ้นบอร์ดทันที</>}
                </div>
              ) : (
                <div className="dash-card !p-3 text-center text-caption text-text-muted">
                  เข้าคลาสหรือลีกออนไลน์แล้วลงชื่อในเกม — ชื่อคุณจะขึ้นบอร์ดนี้แข่งกับทั้งเว็บ
                </div>
              )}

              {gData.top.length === 0 ? (
                <div className="dash-card text-center text-caption text-text-muted">
                  ยังไม่มีผู้เล่นบนบอร์ด — เป็นคนแรกสิ!
                </div>
              ) : (
                <div className="space-y-2">
                  {gData.top.map((r) => (
                    <BoardRow
                      key={r.rank}
                      rank={r.rank}
                      r={r}
                      me={!!gData.me && r.rank === gData.me.rank}
                      sub={r.isOpenLeague ? '🌐 ลีกออนไลน์' : `🏫 ${r.className}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ================= คลาสของฉัน ================= */}
      {tab === 'class' && !classCode && (
        <div className="dash-card text-center space-y-3">
          <p className="text-caption text-text-muted">
            ยังไม่ได้เข้าร่วมคลาส — เข้าคลาสด้วยรหัสจากอาจารย์ หรือเข้าลีกออนไลน์จากหน้าเกม
            แล้วผล Code Blue Sim ของคุณจะขึ้นบอร์ดอัตโนมัติ
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/sim')}>
            🚨 ไปหน้าเกม — เข้าร่วมได้จากที่นั่น
          </button>
        </div>
      )}

      {tab === 'class' && classCode && (
        <>
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

          {!error && rows !== null && activeStudent && (
            myRow ? (
              <MyRankCard rank={myIndex + 1} row={myRow} totalPlayers={rows.length} />
            ) : (
              <div className="dash-card !p-3 text-center text-caption text-text-muted">
                {period === 'month'
                  ? <>เดือนนี้คุณยังไม่มีอันดับ — เล่นสักเคส แล้วชื่อ <b>{activeStudent.name}</b> จะขึ้นบอร์ดทันที</>
                  : <>คุณยังไม่มีอันดับ — ผ่านเคสแรกให้ได้ แล้วชื่อ <b>{activeStudent.name}</b> จะขึ้นบอร์ดทันที</>}
              </div>
            )
          )}

          {!error && rows !== null && rows.length === 0 && (
            <div className="dash-card text-center text-caption text-text-muted">
              ยังไม่มีใครในคลาสเล่น Code Blue Sim เลย — เป็นคนแรกสิ!
            </div>
          )}

          {!error && rows !== null && rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <BoardRow key={r.studentPk} rank={i + 1} r={r} me={isMe(r)} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="text-center">
        <button className="btn btn-primary" onClick={() => navigate('/sim')}>
          🚨 เก็บเหรียญเพิ่ม — เล่น Code Blue Sim
        </button>
      </div>

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
