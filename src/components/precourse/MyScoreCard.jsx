import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, BookOpen, ClipboardCheck, Gamepad2, Activity,
  Trophy, ChevronRight, ScanLine,
} from 'lucide-react';
import { getLessonProgress, getAttemptsForStudent } from '../../db/database';
import { preCourseLessons } from '../../data/activeLessons';
import { PRE_TEST_LESSON_ID } from '../../data/activePreTest';
import { POST_TEST_LESSON_ID } from '../../data/activePostTest';
import { EKG_TEST_PASSED_KEY } from '../../data/ekgQuiz';
import { IS_BLS, IS_SKILL_COURSE } from '../../config/courseMode';
import { useClassStore } from '../../stores/classStore';
import {
  rpcGetCodeBlueLeaderboard, rpcJoinClass, rpcGetMyPracticalStatus,
} from '../../services/cohortSync';
import { useAsyncData } from '../../hooks/useAsyncData';

// การ์ด "คะแนนของฉัน" — นักเรียนเห็นผลตัวเองครบในที่เดียวบนหน้า Pre-course:
// บทเรียน / Pre-Post-test (+จำนวนครั้ง) / EKG / เหรียญ+อันดับเกมในคลาส /
// ภาคปฏิบัติรายฐาน — เห็นเฉพาะของตัวเอง (คะแนนคนอื่นไม่โชว์ ยกเว้นอันดับเกม
// ซึ่งเป็น leaderboard เปิดอยู่แล้ว) ส่วน cloud ทั้งหมด best-effort:
// ออฟไลน์/ไม่มีคลาส = ซ่อนบรรทัดนั้นเฉยๆ ไม่บล็อกการ์ด
export default function MyScoreCard({ student }) {
  const classCode = useClassStore(s => s.classCode);
  const ekgDone = !IS_BLS && !IS_SKILL_COURSE && localStorage.getItem(EKG_TEST_PASSED_KEY) === 'true';

  const { data: localData } = useAsyncData(
    () => (student
      ? Promise.all([getLessonProgress(student.id), getAttemptsForStudent(student.id)])
      : [[], []]),
    [student?.id],
  );
  const progress = localData?.[0] ?? [];
  const attempts = localData?.[1] ?? [];

  // เกม: หาแถวตัวเองใน leaderboard (จับคู่ด้วยรหัสนักเรียน — pk ฝั่งเครื่อง
  // อาจไม่ตรง server) + อันดับ
  const [game, setGame] = useState(null); // { rank, total, row } | null
  // ภาคปฏิบัติ: เข้าแล้วกี่ฐาน / สอบผ่านกี่ฐาน
  const [practical, setPractical] = useState(null); // { attended, total, examPassed, examTotal } | null

  useEffect(() => {
    // ไม่มีคลาส/นักเรียน = ไม่ยิง RPC — ค่าเก่าถูกซ่อนด้วย guard ตอน render
    // (ไม่ reset state ตรงๆ ใน effect ตามกติกา react-hooks/set-state-in-effect)
    if (!classCode || !student?.id) return undefined;
    let alive = true;
    rpcGetCodeBlueLeaderboard().then(({ data, error }) => {
      if (!alive || error || !Array.isArray(data)) return;
      const i = data.findIndex(r => r.studentId === student.studentId);
      if (i >= 0) setGame({ rank: i + 1, total: data.length, row: data[i] });
      else setGame({ rank: null, total: data.length, row: null });
    });
    const loadPractical = async () => {
      let pk = student.id;
      const { data: joined } = await rpcJoinClass({
        code: classCode, studentUuid: student.id, studentId: student.studentId,
        name: student.name, phone: student.phone ?? null,
      });
      if (joined?.studentPk) pk = joined.studentPk;
      const { data, error } = await rpcGetMyPracticalStatus({ studentPk: pk });
      if (!alive || error || !Array.isArray(data?.stations) || !data.stations.length) return;
      const st = data.stations;
      const exams = st.filter(s => s.kind === 'exam');
      setPractical({
        attended: st.filter(s => !!s.checkedInAt).length,
        total: st.length,
        examPassed: exams.filter(s => s.examPassed === true).length,
        examTotal: exams.length,
      });
    };
    loadPractical();
    return () => { alive = false; };
  }, [classCode, student?.id, student?.studentId, student?.name, student?.phone]);

  if (!student) return null;

  const best = (lessonId) => {
    const list = attempts.filter(a => a.lessonId === lessonId);
    const top = list.reduce((b, a) => (a.score > (b?.score ?? -1) ? a : b), null);
    return { score: top?.score ?? null, count: list.length };
  };
  const pre = best(PRE_TEST_LESSON_ID);
  const post = best(POST_TEST_LESSON_ID);
  const lessonsPassed = preCourseLessons.filter(l => {
    const list = attempts.filter(a => a.lessonId === l.id);
    return list.some(a => a.passed);
  }).length;
  const lessonsRead = preCourseLessons.filter(l =>
    progress.some(p => p.lessonId === l.id)).length;

  const row = (Icon, label, valueEl, to) => {
    const inner = (
      <>
        <Icon size={15} strokeWidth={2.2} className="text-text-muted shrink-0" />
        <span className="flex-1 min-w-0 text-caption text-text-secondary">{label}</span>
        <span className="text-caption font-bold text-text-primary text-right">{valueEl}</span>
        {to && <ChevronRight size={14} strokeWidth={2.2} className="text-text-muted shrink-0" />}
      </>
    );
    return to ? (
      <Link key={label} to={to}
        className="flex items-center gap-2 px-1 py-1 rounded-md transition-colors hover:bg-bg-tertiary">
        {inner}
      </Link>
    ) : (
      <div key={label} className="flex items-center gap-2 px-1 py-1">{inner}</div>
    );
  };

  const fmtTest = (t) => (t.score != null
    ? <>{t.score}% <span className="font-normal text-2xs text-text-muted">(ทำ {t.count} ครั้ง)</span></>
    : <span className="font-normal text-text-muted">ยังไม่ได้ทำ</span>);

  return (
    <div className="dash-card space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BarChart3 size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">คะแนนของฉัน</div>
          <div className="text-2xs text-text-muted truncate">
            {student.name} · {student.studentId || '—'}
          </div>
        </div>
      </div>

      {row(BookOpen, 'บทเรียน',
        <>{lessonsPassed}/{preCourseLessons.length} <span className="font-normal text-2xs text-text-muted">(อ่านแล้ว {lessonsRead})</span></>)}
      {!IS_BLS && row(ClipboardCheck, 'Pre-test', fmtTest(pre))}
      {row(ClipboardCheck, 'Post-test', fmtTest(post))}
      {!IS_BLS && !IS_SKILL_COURSE && row(Activity, 'EKG test',
        ekgDone ? 'ผ่าน' : <span className="font-normal text-text-muted">ยังไม่ผ่าน</span>, '/als?tab=ekg')}
      {classCode && game && row(Gamepad2, 'เกม Code Blue Sim',
        game.row
          ? <>อันดับ {game.rank}/{game.total} <span className="font-normal text-2xs text-text-muted">· {game.row.points} แต้ม 🥇{game.row.gold} 🥈{game.row.silver} 🥉{game.row.bronze}</span></>
          : <span className="font-normal text-text-muted">ยังไม่ติดบอร์ด — ไปเล่นเลย</span>,
        '/sim-board')}
      {classCode && practical && row(ScanLine, 'ภาคปฏิบัติ',
        <>เข้าแล้ว {practical.attended}/{practical.total} ฐาน
          {practical.examTotal > 0 && (
            <span className="font-normal text-2xs text-text-muted"> · สอบผ่าน {practical.examPassed}/{practical.examTotal}</span>
          )}</>)}

      <Link to="/certification"
        className="btn btn-ghost btn-sm btn-block mt-1">
        <Trophy size={13} strokeWidth={2.2} /> ดูความคืบหน้าใบประกาศนียบัตร
      </Link>
    </div>
  );
}
