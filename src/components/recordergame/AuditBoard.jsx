import { useState } from 'react';
import { ERROR_TYPES, ERROR_TYPE_META, getAuditErrorCount } from '../../data/activeRecorderLevels';
import { Check, X, AlertTriangle, Search } from 'lucide-react';

// ==========================================
// Recorder Hero — Mode B: ตรวจ Log หาข้อผิดพลาด
// แตะบรรทัด → เลือกประเภทข้อผิดพลาด (4 แบบ) หรือ "ไม่ผิด"
// gap marker ระหว่างบรรทัด = เหตุการณ์ที่อาจหายไป
// จบเมื่อเจอครบ หรือกล่าวหาผิดครบ maxWrongPicks → onFinish(result)
// ==========================================
const CHOICES = [
  ERROR_TYPES.WRONG_BUTTON,
  ERROR_TYPES.WRONG_DATA,
  ERROR_TYPES.MISSED,
  ERROR_TYPES.UI_LOST,
];

export default function AuditBoard({ level, onFinish }) {
  const totalErrors = getAuditErrorCount(level);
  const maxWrong = level.maxWrongPicks ?? 5;

  const [found, setFound] = useState({});       // key -> { type, correct }
  const [wrongPicks, setWrongPicks] = useState(0);
  const [sheet, setSheet] = useState(null);     // { kind:'log'|'missing', key, item }
  const [score, setScore] = useState(0);

  const foundCount = Object.values(found).filter(f => f.correct).length;
  const done = foundCount >= totalErrors || wrongPicks >= maxWrong;

  const openLog = (item) => {
    if (found[item.id] || done) return;
    setSheet({ kind: 'log', key: item.id, item });
  };
  const openMissing = (m, idx) => {
    const key = `miss_${idx}`;
    if (found[key] || done) return;
    setSheet({ kind: 'missing', key, item: m });
  };

  const judge = (chosenType) => {
    const { kind, key, item } = sheet;
    const truth = kind === 'missing' ? item.type : item.error?.type || null;
    const isError = !!truth;
    const correct = isError && chosenType === truth;

    if (correct) {
      setFound(f => ({ ...f, [key]: { type: truth, correct: true, explain: kind === 'missing' ? item.explain_th : item.error.explain_th } }));
      setScore(s => s + 100);
    } else {
      setWrongPicks(w => w + 1);
      setScore(s => Math.max(0, s - 40));
      // mark line so player sees they already tried it (as incorrect accusation)
      setFound(f => ({ ...f, [key]: { type: chosenType, correct: false, explain: isError ? 'ประเภทผิด — ลองดูใหม่' : 'บรรทัดนี้ถูกต้องแล้ว ไม่ใช่ข้อผิดพลาด' } }));
    }
    setSheet(null);
  };

  const finishNow = () => {
    // สร้าง results ตาม 4 ประเภทเพื่อสรุปหน้า result
    const results = [];
    level.log.filter(l => l.error).forEach(l => {
      const hit = found[l.id];
      results.push({
        errorType: l.error.type,
        found: !!(hit && hit.correct),
        text_th: l.text_th, explain_th: l.error.explain_th, time: l.time,
      });
    });
    (level.missing || []).forEach((m, idx) => {
      const hit = found[`miss_${idx}`];
      results.push({
        errorType: m.type, found: !!(hit && hit.correct),
        text_th: m.text_th, explain_th: m.explain_th, missing: true,
      });
    });
    const maxScore = totalErrors * 100;
    onFinish({ levelId: level.id, score, maxScore, foundCount, totalErrors, wrongPicks, results });
  };

  return (
    <div className="page-container space-y-3 pb-28">
      {/* Brief */}
      <div className="bg-bg-secondary border-2 border-text-primary p-3">
        <div className="text-xs font-black text-text-primary inline-flex items-center gap-1.5 mb-1">
          <Search size={14} strokeWidth={2.4} /> {level.title_th}
        </div>
        <div className="text-2xs text-text-secondary leading-relaxed">{level.brief_th}</div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-box border-2 border-text-primary">
          <div className="stat-value text-success">{foundCount}/{totalErrors}</div>
          <div className="stat-label">เจอแล้ว</div>
        </div>
        <div className="stat-box border-2 border-text-primary">
          <div className="stat-value text-danger">{wrongPicks}/{maxWrong}</div>
          <div className="stat-label">กล่าวหาผิด</div>
        </div>
        <div className="stat-box border-2 border-text-primary">
          <div className="stat-value text-info">{score}</div>
          <div className="stat-label">คะแนน</div>
        </div>
      </div>

      {/* Log lines + gap markers */}
      <div className="space-y-1.5">
        {level.log.map((l) => {
          const hit = found[l.id];
          const rowClass = hit
            ? (hit.correct ? '!border-success/60 bg-success/10' : '!border-danger/50 bg-danger/10')
            : 'hover:bg-bg-tertiary';
          const missingHere = (level.missing || [])
            .map((m, idx) => ({ m, idx }))
            .filter(({ m }) => m.betweenIds && m.betweenIds[0] === l.id);
          return (
            <div key={l.id}>
              <button onClick={() => openLog(l)} disabled={!!hit || done}
                className={`w-full dash-card !py-2 !px-3 flex items-center gap-2 text-left transition-colors ${rowClass}`}>
                <span className="font-mono text-2xs text-text-muted shrink-0 w-12">{l.time}</span>
                <span className="text-caption flex-1">{l.text_th}</span>
                {hit && (hit.correct
                  ? <Check size={15} strokeWidth={2.6} className="text-success shrink-0" />
                  : <X size={15} strokeWidth={2.6} className="text-danger shrink-0" />)}
              </button>
              {hit?.explain && (
                <div className={`text-2xs px-3 py-1 ${hit.correct ? 'text-success' : 'text-danger'}`}>
                  {ERROR_TYPE_META[hit.type]?.icon} {hit.explain}
                </div>
              )}
              {/* gap markers after this line */}
              {missingHere.map(({ idx }) => {
                const key = `miss_${idx}`;
                const mhit = found[key];
                return (
                  <button key={key} onClick={() => openMissing(level.missing[idx], idx)} disabled={!!mhit || done}
                    className={`w-full my-1 border-2 border-dashed py-1.5 px-3 text-left text-2xs transition-colors ${
                      mhit ? (mhit.correct ? 'border-success/60 bg-success/10 text-success' : 'border-danger/50 bg-danger/10 text-danger') : 'border-text-muted/40 text-text-muted hover:bg-bg-tertiary'
                    }`} style={{ borderRadius: 'var(--radius-md)' }}>
                    ⋯ ช่องว่างระหว่างเหตุการณ์ — มีอะไรหายไปไหม? (แตะเพื่อตรวจ)
                    {mhit?.explain && <div className="mt-1">{mhit.explain}</div>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Finish */}
      <button onClick={finishNow}
        className={`w-full btn btn-lg btn-full font-black border-2 ${done ? 'btn-success animate-pulse' : 'btn-ghost'}`}>
        {done ? 'ดูผลสรุป' : `ตรวจต่อ (เจอ ${foundCount}/${totalErrors}) — หรือกดจบเลย`}
      </button>

      {/* Bottom sheet: เลือกประเภทข้อผิดพลาด */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSheet(null)}>
          <div className="w-full max-w-md bg-bg-secondary p-4 space-y-2 animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ borderTopLeftRadius: 'var(--radius-3xl)', borderTopRightRadius: 'var(--radius-3xl)' }}>
            <div className="text-sm font-black text-text-primary inline-flex items-center gap-1.5">
              <AlertTriangle size={15} strokeWidth={2.4} /> บรรทัดนี้ผิดอะไร?
            </div>
            <div className="text-2xs text-text-muted mb-1">
              {sheet.kind === 'missing' ? sheet.item.text_th : `${sheet.item.time} · ${sheet.item.text_th}`}
            </div>
            {CHOICES.map(type => (
              <button key={type} onClick={() => judge(type)}
                className={`w-full btn-action btn-ghost py-2.5 text-sm text-left px-4 ${ERROR_TYPE_META[type].color}`}>
                {ERROR_TYPE_META[type].icon} {ERROR_TYPE_META[type].label_th}
              </button>
            ))}
            <button onClick={() => judge('__none__')}
              className="w-full btn-action btn-ghost py-2.5 text-sm text-text-muted">
              ✓ บรรทัดนี้ถูกต้อง (ไม่ผิด)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
