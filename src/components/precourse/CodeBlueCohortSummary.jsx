import { Fragment, useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { rpcGetCohortCodeblueSummary } from '../../services/cohortSync';
import { loadPlayableScenarios, LEVEL_META } from '../../data/codeBlueScenarios';

const GRADE_RANK = { S: 4, A: 3, B: 2, C: 1 };
const bestGrade = (results) => {
  const won = results.filter((r) => r.won);
  if (!won.length) return null;
  return won.reduce((best, r) => (
    !best || GRADE_RANK[r.grade] > GRADE_RANK[best] ? r.grade : best
  ), null);
};

// สรุปผล Code Blue Simulator รายคลาส — ดึงข้อมูลของตัวเอง (RPC แยก, ข้อมูลคนละ
// รูปแบบจากตาราง pre-course: ต่อเคส ไม่ใช่ต่อบทเรียน) ไม่แตะ state/logic ของ
// InstructorCohort.jsx เดิมเลย เกมฝึกเสริม — ผลไม่ผูกกับใบประกาศหลักสูตร
export default function CodeBlueCohortSummary({ classCode }) {
  const [summary, setSummary] = useState(null); // null = ยังไม่โหลด
  const [titles, setTitles] = useState({});     // scenarioId -> title
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let alive = true;
    loadPlayableScenarios().then((list) => {
      if (!alive) return;
      const map = {};
      list.forEach((s) => { map[s.id] = s.title; });
      setTitles(map);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!classCode) return undefined;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await rpcGetCohortCodeblueSummary();
      if (!alive) return;
      setSummary(error ? [] : data);
      setLoading(false);
    };
    load();
    return () => { alive = false; };
  }, [classCode, reloadKey]);

  const rows = useMemo(() => {
    if (!summary) return [];
    return summary
      .map(({ student, results }) => {
        const distinctWon = new Set(results.filter((r) => r.won).map((r) => r.scenarioId));
        return {
          id: student.id,
          name: student.name,
          results,
          attempts: results.length,
          casesCleared: distinctWon.size,
          bestGrade: bestGrade(results),
          lastAt: results[0]?.finishedAt || null, // เรียง finishedAt desc มาจาก RPC แล้ว
        };
      })
      .filter((r) => r.attempts > 0)
      .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  }, [summary]);

  if (!classCode) return null;

  return (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-danger/12 text-danger shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Activity size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">Code Blue Simulator</div>
          <div className="text-2xs text-text-muted">ใครฝึกเคสไหนไปแล้วบ้าง — เกมฝึกเสริม ไม่ผูกกับใบประกาศ</div>
        </div>
        <button onClick={() => setReloadKey((k) => k + 1)} className="btn btn-ghost btn-sm shrink-0">
          <RefreshCw size={13} strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-muted text-caption py-4">กำลังโหลด…</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-text-muted text-caption py-4">ยังไม่มีนักเรียนเล่นเกมนี้</div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-caption">
            <thead className="bg-bg-tertiary text-text-secondary">
              <tr>
                <th className="px-2 py-1.5 text-left">ชื่อ</th>
                <th className="px-2 py-1.5 text-center">เล่น</th>
                <th className="px-2 py-1.5 text-center">ผ่าน (เคส)</th>
                <th className="px-2 py-1.5 text-center">เกรดดีที่สุด</th>
                <th className="px-2 py-1.5 text-center">เล่นล่าสุด</th>
                <th className="px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-t border-border">
                    <td className="px-2 py-1.5 text-text-primary">{r.name}</td>
                    <td className="px-2 py-1.5 text-center text-text-secondary">{r.attempts}</td>
                    <td className="px-2 py-1.5 text-center text-text-secondary">{r.casesCleared}</td>
                    <td className="px-2 py-1.5 text-center font-bold">
                      {r.bestGrade || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center text-text-secondary">
                      {r.lastAt ? new Date(r.lastAt).toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={() => setExpandedId((id) => (id === r.id ? null : r.id))}
                        className="text-text-muted"
                        aria-label="ดูรายละเอียดรายเคส"
                      >
                        {expandedId === r.id
                          ? <ChevronUp size={14} strokeWidth={2.2} />
                          : <ChevronDown size={14} strokeWidth={2.2} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr className="border-t border-border bg-bg-tertiary">
                      <td colSpan={6} className="px-2 py-2">
                        <div className="space-y-1">
                          {r.results.map((res, i) => (
                            <div key={i} className="flex items-center gap-2 text-2xs">
                              <span className={`font-bold ${res.won ? 'text-success' : 'text-danger'}`}>
                                {res.won ? 'ผ่าน' : 'ไม่ผ่าน'}
                              </span>
                              <span className="text-text-primary flex-1 min-w-0 truncate">
                                {titles[res.scenarioId] || res.scenarioId}
                              </span>
                              <span className="text-text-muted">{LEVEL_META[res.level]?.label || res.level}</span>
                              <span className="font-mono font-bold text-text-secondary">{res.grade}</span>
                              <span className="text-text-muted">
                                {res.finishedAt ? new Date(res.finishedAt).toLocaleDateString('th-TH') : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
