import { useEffect, useState } from 'react';
import { Trophy, Gamepad2, TrendingUp, Crown, RefreshCw, Swords } from 'lucide-react';
import { rpcGetCodeBlueLeaderboard } from '../../services/cohortSync';
import { computeAwards } from '../../utils/awardRanking';
import { preCourseLessons } from '../../data/activeLessons';
import { PRE_TEST_LESSON_ID } from '../../data/assessment';
import { POST_TEST_LESSON_ID } from '../../data/activePostTest';

// สรุปรางวัลประจำคลาส 3 รางวัล (ตามโครงที่อาจารย์เลือก) — จัดอันดับอัตโนมัติ
// จากข้อมูลที่มีอยู่แล้ว: วิชาการ (Post-test + บันไดตัดเสมอ) / แชมป์เกม
// (leaderboard เหรียญ) / พัฒนาการ Pre→Post (เซอร์ไพรส์ ไม่ประกาศล่วงหน้า)
// กติกา 1 คน 1 รางวัล: คนที่ได้แล้วถูกข้าม อันดับถัดไปเลื่อนขึ้น (ติดป้ายบอก)
export default function AwardSummaryCard({ summary, classCode }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!classCode) return undefined;
    let alive = true;
    rpcGetCodeBlueLeaderboard().then(({ data, error }) => {
      if (alive) setLeaderboard(error ? [] : (data || []));
    });
    return () => { alive = false; };
  }, [classCode, reloadKey]);

  if (!classCode || !summary?.length) return null;

  const awards = computeAwards({
    summaryRows: summary,
    leaderboard,
    preTestId: PRE_TEST_LESSON_ID,
    postTestId: POST_TEST_LESSON_ID,
    quizLessonIds: preCourseLessons.map((l) => l.id),
  });

  const rankRow = (i, isWinner, promoted, nameEl, detailEl) => (
    <div key={i} className={`flex items-center gap-2 text-caption px-2 py-1.5 ${
      isWinner ? 'bg-success/10 border border-success/40' : ''
    }`} style={{ borderRadius: 'var(--radius-md)' }}>
      <span className={`w-5 shrink-0 text-center font-bold ${isWinner ? 'text-success' : 'text-text-muted'}`}>
        {isWinner ? <Crown size={14} strokeWidth={2.4} className="inline" /> : i + 1}
      </span>
      <span className="flex-1 min-w-0 truncate text-text-primary">
        {nameEl}
        {isWinner && promoted && (
          <span className="text-2xs text-warning font-bold"> · เลื่อนอันดับ (คนก่อนหน้าได้รางวัลอื่นแล้ว)</span>
        )}
      </span>
      <span className="shrink-0 text-text-secondary">{detailEl}</span>
    </div>
  );

  const section = (Icon, title, note, list, winnerPk, promoted, renderDetail, empty) => (
    <div className="space-y-1.5">
      <div className="text-overline text-text-muted inline-flex items-center gap-1">
        <Icon size={11} strokeWidth={2.4} /> {title}
        {note && <span className="font-normal normal-case">— {note}</span>}
      </div>
      {list.length === 0 ? (
        <div className="text-caption text-text-muted px-2">{empty}</div>
      ) : list.map((r, i) => rankRow(
        i,
        r.studentPk === winnerPk,
        promoted,
        <>{r.name} <span className="font-mono text-2xs text-text-muted">{r.studentId}</span></>,
        renderDetail(r),
      ))}
    </div>
  );

  return (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-warning/12 text-warning shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Trophy size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">สรุปรางวัลประจำคลาส</div>
          <div className="text-2xs text-text-muted">
            จัดอันดับอัตโนมัติ · กติกา 1 คน 1 รางวัล (วิชาการ → เกม → พัฒนาการ)
          </div>
        </div>
        <button onClick={() => setReloadKey(k => k + 1)} className="btn btn-ghost btn-sm shrink-0">
          <RefreshCw size={13} strokeWidth={2.2} />
        </button>
      </div>

      {awards.academic.needsPlayoff && (
        <div className="bg-warning/10 border border-warning/30 px-3 py-2 text-caption text-warning inline-flex items-center gap-2 w-full"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Swords size={14} strokeWidth={2.4} className="shrink-0" />
          วิชาการ: อันดับ 1-2 เสมอกันทุกบันไดตัดเสมอ — ดวลสดหน้าคลาสตามกติกา
        </div>
      )}

      {section(
        Trophy, '🏆 ยอดเยี่ยมวิชาการ',
        'Post-test สูงสุด (เสมอ: ครั้งน้อยกว่า → ควิซรายบท)',
        awards.academic.top, awards.academic.winner?.studentPk, awards.academic.promoted,
        (r) => <>
          <b className="text-text-primary">{r.postScore}%</b>
          <span className="text-2xs"> · ทำ {r.postAttempts ?? '—'} ครั้ง · ควิซ {r.quizAvg != null ? Math.round(r.quizAvg) : '—'}%</span>
        </>,
        'ยังไม่มีใครทำ Post-test',
      )}

      {section(
        Gamepad2, '🎮 แชมป์ Code Blue Sim',
        'แต้มเหรียญ (ทอง 3 / เงิน 2 / ทองแดง 1)',
        awards.game.top, awards.game.winner?.studentPk, awards.game.promoted,
        (r) => <>
          <b className="text-text-primary">{r.points} แต้ม</b>
          <span className="text-2xs"> · 🥇{r.gold} 🥈{r.silver} 🥉{r.bronze} · ผ่าน {r.cleared} เคส</span>
        </>,
        'ยังไม่มีใครเล่นเกม Code Blue Sim',
      )}

      {section(
        TrendingUp, '🚀 พัฒนาการยอดเยี่ยม',
        'Post − Pre เพิ่มมากสุด (เซอร์ไพรส์ — อย่าประกาศล่วงหน้า)',
        awards.improvement.top, awards.improvement.winner?.studentPk, awards.improvement.promoted,
        (r) => <>
          <b className="text-success">+{r.improvement}</b>
          <span className="text-2xs"> · Pre {r.preScore}% → Post {r.postScore}%</span>
        </>,
        'ยังไม่มีใครทำครบทั้ง Pre-test และ Post-test',
      )}
    </div>
  );
}
