import { useEffect, useMemo, useState } from 'react';
import { STATION_CHECKLISTS } from '../../data/checklists/stationChecklists';
import { MEGACODE_CASES } from '../../data/checklists/megacodeCases';
import { resolveChecklistForStation } from '../../data/checkinStations';
import { tallyChecklist, suggestPass } from '../../utils/checklistScoring';
import { X, Shuffle, Check, AlertTriangle, ListChecks, Eraser } from 'lucide-react';

// แถวเช็คลิสต์แบบการ์ดใหญ่เต็มบรรทัด — แตะตรงไหนก็ติ๊กได้ เปลี่ยนเป็นเขียวเมื่อติ๊ก
// สไตล์อยู่ที่ .cl-row ใน index.css (class เดี่ยว ไม่ใช่ Tailwind utility เพราะ
// rule `button { text-align:center }` แบบ unlayered ทับ utility ใน layer จนข้อความ
// ลอยกลางและขอบมองไม่เห็นใน dark mode — บั๊กจากรอบก่อน)
function ChecklistRow({ no, text, critical, checkedOn, disabled, onToggle }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`cl-row ${checkedOn ? 'is-checked' : ''}`}
    >
      <span className="cl-box">
        {checkedOn
          ? <Check size={17} strokeWidth={3.2} />
          : <span className="text-2xs font-bold text-text-muted">{no}</span>}
      </span>
      <span>
        {text}
        {critical && <span className="text-warning font-bold"> ★</span>}
      </span>
    </button>
  );
}

const CHECKLIST_OPTIONS = Object.values(STATION_CHECKLISTS).map((c) => ({ id: c.id, title: c.title }));

function pickRandomCase(excludeId) {
  const pool = excludeId ? MEGACODE_CASES.filter((c) => c.id !== excludeId) : MEGACODE_CASES;
  const list = pool.length ? pool : MEGACODE_CASES;
  return list[Math.floor(Math.random() * list.length)];
}

// เปิดจาก ScanResultCard (ผูกกับนักเรียน/ฐานที่กำลังสแกน — มีปุ่ม "บันทึกผล")
// หรือจาก StationManager (โหมดดูอ้างอิงอย่างเดียว readOnly — ไม่มีปุ่มบันทึก)
//
// สองรูปแบบเช็คลิสต์:
//  - STATION_CHECKLISTS: มี passRule (min/total/requireAllCritical) → auto-suggest
//    ผ่าน/ไม่ผ่าน แต่อาจารย์ยืนยัน/ปรับเองได้เสมอ
//  - MEGACODE_CASES (สุ่มจาก pool): ไม่มี passRule → โชว์ทัลลี่อ้างอิงเฉยๆ
//    ผ่าน/ไม่ผ่านเป็นดุลยพินิจอาจารย์ล้วนๆ
export default function ChecklistGrader({ open, onClose, station, student = null, onSave, readOnly = false, saving = false }) {
  const suggestion = station ? resolveChecklistForStation(station.name) : null;

  const [checklistId, setChecklistId] = useState(null);
  const [caseData, setCaseData] = useState(null); // สำหรับ pool: เคสที่สุ่มได้
  const [checked, setChecked] = useState({}); // { [itemKey]: boolean }

  useEffect(() => {
    if (!open) return;
    if (suggestion?.checklistPool) {
      const c = pickRandomCase();
      setCaseData(c);
      setChecklistId(null);
    } else if (suggestion?.checklistId) {
      setChecklistId(suggestion.checklistId);
      setCaseData(null);
    } else if (suggestion?.checklistOptions?.length) {
      setChecklistId(suggestion.checklistOptions[0]);
      setCaseData(null);
    } else {
      setChecklistId(CHECKLIST_OPTIONS[0]?.id ?? null);
      setCaseData(null);
    }
    setChecked({});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- สุ่มเคสใหม่ทุกครั้งที่เปิด ไม่ใช่ทุกครั้งที่ station เปลี่ยน prop reference
  }, [open, station?.id]);

  const template = checklistId ? STATION_CHECKLISTS[checklistId] : null;
  const flatItems = useMemo(() => {
    if (template) return template.sections.flatMap((s) => s.items.map((it) => ({ ...it, section: s.title })));
    if (caseData) return caseData.items.map((it, i) => ({ ...it, no: i + 1, section: null }));
    return [];
  }, [template, caseData]);

  const { total, checkedCount, criticalDone } = tallyChecklist(flatItems, checked);
  const suggestedPass = template ? suggestPass({ checkedCount, criticalDone }, template.passRule) : null;

  if (!open) return null;

  const toggle = (no) => setChecked((c) => ({ ...c, [no]: !c[no] }));

  const allChecked = total > 0 && checkedCount === total;
  const checkAll = () => setChecked(Object.fromEntries(flatItems.map((it) => [it.no, true])));
  const clearAll = () => setChecked({});

  const reroll = () => {
    setCaseData((prev) => pickRandomCase(prev?.id));
    setChecked({});
  };

  const handleSave = (passed) => {
    onSave?.({
      passed,
      score: checkedCount,
      note: template ? template.title : (caseData ? `Case ${caseData.no}: ${caseData.title}` : ''),
      checklistId: template ? template.id : (caseData ? caseData.id : null),
      checklistItems: flatItems.map((it) => ({ no: it.no, checked: !!checked[it.no] })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg max-h-[90vh] bg-bg-secondary animate-slide-up flex flex-col"
        style={{ borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', boxShadow: 'var(--shadow-pop)' }}>
        <div className="p-4 border-b border-border shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary">
                {readOnly ? 'ดูเช็คลิสต์' : 'เช็คลิสต์ให้คะแนน'}
              </div>
              {station && <div className="text-2xs text-text-muted truncate">{station.name}</div>}
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="ปิด">
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
          {/* แถบชื่อนักเรียนเด่นๆ — อาจารย์สแกนต่อเนื่องหลายคน ต้องเห็นชัดว่า
              กำลังประเมินใครอยู่ (ไม่มี student = โหมดดูอ้างอิงจากหน้าจัดการฐาน) */}
          {student && (
            <div className="bg-success/12 border border-success/40 px-3 py-2 flex items-center gap-2"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <Check size={15} strokeWidth={2.6} className="text-success shrink-0" />
              <div className="min-w-0">
                <span className="text-caption text-text-secondary">กำลังประเมิน: </span>
                <span className="text-body-strong text-text-primary">
                  {student.name}
                </span>
                <span className="font-mono text-caption text-text-secondary"> ({student.studentId})</span>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {!suggestion?.checklistPool && (
            <select
              value={checklistId ?? ''}
              onChange={(e) => { setChecklistId(e.target.value); setChecked({}); }}
              className="w-full text-caption"
            >
              {CHECKLIST_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          )}

          {suggestion?.checklistPool && caseData && (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0 bg-bg-tertiary p-2.5" style={{ borderRadius: 'var(--radius-md)' }}>
                <div className="text-caption font-bold text-text-primary">
                  Case {caseData.no}: {caseData.title}
                </div>
                <div className="text-2xs text-text-muted">Algorithm: {caseData.algorithm}</div>
              </div>
              {!readOnly && (
                <button onClick={reroll} className="btn btn-ghost btn-sm shrink-0">
                  <Shuffle size={13} strokeWidth={2.2} /> สุ่มใหม่
                </button>
              )}
            </div>
          )}

          {(template?.scenario || caseData?.scenario) && (
            <div className="text-2xs text-text-secondary italic">
              โจทย์: {template?.scenario || caseData?.scenario}
            </div>
          )}

          <div className="sticky top-0 bg-bg-secondary py-1 space-y-1.5">
            <div className="flex items-center justify-between text-caption">
              <span className="font-bold text-text-primary">ปฏิบัติได้ {checkedCount} / {total} ข้อ</span>
              {template && (
                <span className={`inline-flex items-center gap-1 font-bold ${criticalDone ? 'text-success' : 'text-warning'}`}>
                  {criticalDone
                    ? <><Check size={12} strokeWidth={2.6} /> ข้อวิกฤตครบ</>
                    : <><AlertTriangle size={12} strokeWidth={2.4} /> ข้อวิกฤตยังไม่ครบ</>}
                </span>
              )}
            </div>
            {!readOnly && total > 0 && (
              <button
                onClick={allChecked ? clearAll : checkAll}
                className="btn btn-ghost btn-sm btn-block">
                {allChecked
                  ? <><Eraser size={13} strokeWidth={2.2} /> ล้างทั้งหมด</>
                  : <><ListChecks size={13} strokeWidth={2.2} /> ติ๊กถูกทั้งหมด</>}
              </button>
            )}
          </div>

          {template ? (
            template.sections.map((sec) => (
              <div key={sec.title} className="space-y-1.5">
                <div className="text-overline text-text-muted">{sec.title}</div>
                {sec.items.map((it) => (
                  <ChecklistRow
                    key={it.no}
                    no={it.no}
                    text={it.text}
                    critical={it.critical}
                    checkedOn={!!checked[it.no]}
                    disabled={readOnly}
                    onToggle={() => toggle(it.no)}
                  />
                ))}
              </div>
            ))
          ) : caseData ? (
            <div className="space-y-1.5">
              {caseData.items.map((it, i) => (
                <ChecklistRow
                  key={i}
                  no={i + 1}
                  text={it.text}
                  checkedOn={!!checked[i + 1]}
                  disabled={readOnly}
                  onToggle={() => toggle(i + 1)}
                />
              ))}
            </div>
          ) : null}
        </div>

        {!readOnly && (
          <div className="p-4 border-t border-border shrink-0 space-y-2">
            {template && (
              <div className="text-2xs text-text-muted text-center">
                เกณฑ์ผ่าน ≥{template.passRule.min}/{template.passRule.total} ข้อ + ข้อวิกฤตครบ —
                {' '}ระบบแนะนำ: <b className={suggestedPass ? 'text-success' : 'text-danger'}>
                  {suggestedPass ? 'ผ่าน' : 'ไม่ผ่าน'}
                </b> (ยืนยัน/ปรับได้)
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={saving}
                onClick={() => handleSave(true)}
                className="btn bg-success text-white font-bold disabled:opacity-40">
                บันทึก: ผ่าน
              </button>
              <button
                disabled={saving}
                onClick={() => handleSave(false)}
                className="btn bg-danger text-white font-bold disabled:opacity-40">
                บันทึก: ไม่ผ่าน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
