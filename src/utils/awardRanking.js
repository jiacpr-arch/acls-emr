// จัดอันดับ 3 รางวัลประจำคลาสจากข้อมูลที่ระบบเก็บอยู่แล้ว (ตามโครงที่อาจารย์
// เลือก): วิชาการ (Post-test) / แชมป์เกม Code Blue Sim / พัฒนาการ Pre→Post
// — เป็น pure function เพื่อทดสอบบันไดตัดเสมอได้ตรงๆ
//
// กติกาที่ประกาศกับนักเรียน:
// - วิชาการ: Post-test สูงสุด → เสมอ: จำนวนครั้งที่ทำน้อยกว่า → คะแนนควิซราย
//   บทเฉลี่ยสูงกว่า → (ยังเสมอ = ดวลสดหน้าคลาส — ระบบจะแสดงติดกันให้เห็น)
// - เกม: แต้มเหรียญมากสุด → เสมอ: ทอง → จำนวนเคสที่ผ่าน
// - พัฒนาการ: Post - Pre เพิ่มมากสุด → เสมอ: Post สูงกว่า → ทำน้อยครั้งกว่า
// - 1 คนรับได้ 1 รางวัล ตามลำดับความสำคัญ วิชาการ → เกม → พัฒนาการ:
//   คนที่ได้รางวัลไปแล้วถูกข้าม แล้วเลื่อนอันดับถัดไปขึ้นแทน (ติดธง promoted)

// summaryRows: [{ student:{id,studentId,name}, lessons:{[id]:{bestScore,attemptCount,passed,lastAttemptAt}} }]
export function buildAcademicRows(summaryRows, { preTestId, postTestId, quizLessonIds }) {
  return summaryRows
    .map(({ student, lessons }) => {
      const post = lessons?.[postTestId];
      const pre = lessons?.[preTestId];
      const quizScores = quizLessonIds
        .map((id) => lessons?.[id]?.bestScore)
        .filter((s) => s != null);
      const quizAvg = quizScores.length
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : null;
      return {
        studentPk: student.id,
        studentId: student.studentId,
        name: student.name,
        postScore: post?.bestScore ?? null,
        postAttempts: post?.attemptCount ?? null,
        preScore: pre?.bestScore ?? null,
        quizAvg,
      };
    });
}

const byAcademic = (a, b) =>
  (b.postScore - a.postScore)
  || ((a.postAttempts ?? Infinity) - (b.postAttempts ?? Infinity))
  || ((b.quizAvg ?? -1) - (a.quizAvg ?? -1));

const byImprovement = (a, b) =>
  (b.improvement - a.improvement)
  || (b.postScore - a.postScore)
  || ((a.postAttempts ?? Infinity) - (b.postAttempts ?? Infinity));

// leaderboard: [{ studentPk, studentId, name, points, gold, silver, bronze, cleared }]
const byGame = (a, b) =>
  (b.points - a.points) || (b.gold - a.gold) || (b.cleared - a.cleared);

// เสมอกันจริงตามบันไดทั้งหมดไหม — ไว้ติดป้าย "ดวลสด" ให้อาจารย์เห็น
const tiedAcademic = (a, b) => !!a && !!b && byAcademic(a, b) === 0;

export function computeAwards({ summaryRows, leaderboard, preTestId, postTestId, quizLessonIds }) {
  const academicAll = buildAcademicRows(summaryRows, { preTestId, postTestId, quizLessonIds })
    .filter((r) => r.postScore != null)
    .sort(byAcademic);

  const gameAll = [...(leaderboard || [])].sort(byGame);

  const improvementAll = buildAcademicRows(summaryRows, { preTestId, postTestId, quizLessonIds })
    .filter((r) => r.postScore != null && r.preScore != null)
    .map((r) => ({ ...r, improvement: r.postScore - r.preScore }))
    .sort(byImprovement);

  // 1 คน 1 รางวัล — ไล่ตามลำดับความสำคัญ ข้ามคนที่ได้แล้ว (ติดธง promoted ให้
  // คนที่เลื่อนขึ้นมา เพื่อให้อาจารย์อธิบายหน้างานได้)
  const awarded = new Set();
  const pickWinner = (list, keyOf) => {
    for (let i = 0; i < list.length; i++) {
      const key = keyOf(list[i]);
      if (!awarded.has(key)) {
        awarded.add(key);
        return { winner: list[i], promoted: i > 0, skipped: i };
      }
    }
    return { winner: null, promoted: false, skipped: 0 };
  };

  const academic = pickWinner(academicAll, (r) => r.studentPk);
  const game = pickWinner(gameAll, (r) => r.studentPk);
  const improvement = pickWinner(improvementAll, (r) => r.studentPk);

  return {
    academic: {
      ...academic,
      top: academicAll.slice(0, 3),
      // ผู้ชนะเสมอกับอันดับถัดไปแบบแยกไม่ออกตามบันได = ต้องดวลสด
      needsPlayoff: academicAll.length >= 2 && tiedAcademic(academicAll[0], academicAll[1]),
    },
    game: { ...game, top: gameAll.slice(0, 3) },
    improvement: { ...improvement, top: improvementAll.slice(0, 3) },
  };
}
