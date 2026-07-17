import { Fragment, useEffect, useMemo, useState } from 'react';
import { Target, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { rpcGetCohortRecorderSummary } from '../../services/cohortSync';
import { getLevelById } from '../../data/recorderGameLevels';
import { getPackById, CASE_CATEGORY_META } from '../../data/recorderCases';

const MODE_LABEL = { hunt: 'รู้จักปุ่ม', live: 'บันทึกสด', audit: 'ตรวจ Log', endless: 'Endless' };

// levelId เป็น campaign level id, case-pack id, หรือ "endless:<category>" — หา title
// ที่อ่านง่ายให้แต่ละแบบ (ไม่มีตารางแยกเก็บ "รอบ" endless เอง ต่างจากด่าน/ชุดเคส)
function levelTitle(levelId) {
  if (levelId.startsWith('endless:')) {
    const cat = levelId.slice('endless:'.length);
    if (cat === 'all') return 'Endless Shuffle · ทุกหมวด';
    return `Endless Shuffle · ${CASE_CATEGORY_META[cat]?.label_th || cat}`;
  }
  return getLevelById(levelId)?.title_th || getPackById(levelId)?.title_th || levelId;
}

// สรุปผล Recorder Hero รายคลาส — pattern เดียวกับ CodeBlueCohortSummary.jsx
// (RPC แยก, ไม่แตะ state/logic ของ InstructorCohort.jsx เดิม) เกมฝึกเสริมไม่บังคับ
export default function RecorderCohortSummary({ classCode }) {
  const [summary, setSummary] = useState(null); // null = ยังไม่โหลด
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!classCode) return undefined;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await rpcGetCohortRecorderSummary();
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
        const bestStars = results.reduce((max, r) => Math.max(max, r.stars || 0), 0);
        const distinctLevels = new Set(results.map((r) => r.levelId));
        return {
          id: student.id,
          name: student.name,
          results,
          attempts: results.length,
          levelsPlayed: distinctLevels.size,
          bestStars,
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
        <div className="w-9 h-9 inline-flex items-center justify-center bg-purple/12 text-purple shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Target size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">Recorder Hero</div>
          <div className="text-2xs text-text-muted">ใครฝึกด่านไหนไปแล้วบ้าง — เกมฝึกเสริม (ไม่บังคับ)</div>
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
                <th className="px-2 py-1.5 text-center">ด่านที่ฝึก</th>
                <th className="px-2 py-1.5 text-center">ดาวสูงสุด</th>
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
                    <td className="px-2 py-1.5 text-center text-text-secondary">{r.levelsPlayed}</td>
                    <td className="px-2 py-1.5 text-center font-bold">
                      {r.bestStars > 0 ? `★${r.bestStars}` : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center text-text-secondary">
                      {r.lastAt ? new Date(r.lastAt).toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={() => setExpandedId((id) => (id === r.id ? null : r.id))}
                        className="text-text-muted"
                        aria-label="ดูรายละเอียดรายด่าน"
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
                              <span className="text-text-muted shrink-0">{MODE_LABEL[res.mode] || res.mode}</span>
                              <span className="text-text-primary flex-1 min-w-0 truncate">
                                {levelTitle(res.levelId)}
                              </span>
                              {res.stars != null && (
                                <span className="font-mono font-bold text-warning">★{res.stars}</span>
                              )}
                              <span className="font-mono font-bold text-text-secondary">
                                {res.score}{res.maxScore ? `/${res.maxScore}` : ''}
                              </span>
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
