import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { STATION_CHECKLISTS } from '../../data/checklists/stationChecklists';
import { MEGACODE_CASES, MEGACODE_LEVEL_META, MEGACODE_CORE_ITEMS } from '../../data/checklists/megacodeCases';
import { CODE_BLUE_EXAM_CASES } from '../../data/checklists/codeBlueExamCases';
import { PRACTICE_CASES } from '../../data/checklists/practiceCases';
import { resolveChecklistForStation } from '../../data/checkinStations';
import { tallyChecklist, suggestPass } from '../../utils/checklistScoring';

// คู่มือคุมหุ่น + ข้อมูลของมันเป็นข้อความยาว และใช้เฉพาะตอนเปิดใบประเมิน —
// แยก chunk ไว้ ไม่ให้ bundle หลักโตจนเกินเพดาน precache ของ PWA
const ManikinSetupPanel = lazy(() => import('./ManikinSetupPanel'));
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

// ธนาคารข้อสอบต่อ checklistPool (จาก resolveChecklistForStation) —
// megacodeCases: 15 เคสจากใบสอบ docx (จุด A/B), codeBlueGame: เคสจากเกม
// Code Blue Sim ตัด ACS/Stroke (ฐานสอบสุ่มข้อสอบ)
const CASE_POOLS = {
  megacodeCases: MEGACODE_CASES,
  codeBlueGame: CODE_BLUE_EXAM_CASES,
  practiceCases: PRACTICE_CASES,
};
// lookup ข้ามทุก pool — เคสที่ล็อกไว้กับนักเรียน (exam_case_id) ต้องเปิดดูได้
// เสมอแม้ฐานจะเปลี่ยนไปใช้ pool อื่นภายหลัง
const ALL_POOL_CASES = [...MEGACODE_CASES, ...CODE_BLUE_EXAM_CASES, ...PRACTICE_CASES];
const findCaseById = (id) => (id ? ALL_POOL_CASES.find((c) => c.id === id) ?? null : null);

function pickRandomCase(cases, excludeId) {
  const pool = excludeId ? cases.filter((c) => c.id !== excludeId) : cases;
  const list = pool.length ? pool : cases;
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
//
// ฐานสอบแบบสุ่มข้อสอบ (poolAssign 'fixed'): เคสที่สุ่มได้ถูก "ล็อก" กับนักเรียน
// ผ่าน onAssignCase → server (กติกาเคสแรกชนะ) แล้วใช้เคสที่ server ยืนยันกลับมา
// เป็นตัวจริง — assignedCaseId คือเคสที่เคยล็อกไว้แล้ว (จาก checkin_student)
// ปุ่ม "สุ่มใหม่" ยังใช้ได้ (ส่ง force ไปทับเคสเดิม)
export default function ChecklistGrader({
  open, onClose, station, student = null, onSave, readOnly = false, saving = false,
  assignedCaseId = null, onAssignCase = null,
}) {
  const suggestion = station ? resolveChecklistForStation(station.name) : null;
  const poolCases = CASE_POOLS[suggestion?.checklistPool] || MEGACODE_CASES;
  const poolFixed = !!(suggestion?.checklistPool && suggestion?.poolAssign === 'fixed'
    && student && !readOnly && onAssignCase);

  const [checklistId, setChecklistId] = useState(null);
  const [caseData, setCaseData] = useState(null); // สำหรับ pool: เคสที่สุ่ม/ล็อกไว้
  const [checked, setChecked] = useState({}); // { [itemKey]: boolean }
  const [assignState, setAssignState] = useState(null); // null | 'saving' | 'saved' | 'error'
  // ตัวกรองระดับความยาก — โชว์เฉพาะ pool ที่เคสติดป้าย level (ธนาคาร 15 เคส
  // ของจุด A/B) 'all' = สุ่มจากทุกระดับ
  const [levelFilter, setLevelFilter] = useState('all');
  const hasLevels = poolCases.some((c) => c.level);
  const levelPool = hasLevels && levelFilter !== 'all'
    ? poolCases.filter((c) => c.level === levelFilter)
    : poolCases;

  // ล็อกเคสกับนักเรียนบน server แล้วยึดเคสที่ server คืนมาเป็นตัวจริง (อาจไม่ใช่
  // เคสที่เพิ่งสุ่ม ถ้าอาจารย์อีกเครื่องล็อกไปก่อนแล้ว)
  const persistAssign = async (caseId, force) => {
    setAssignState('saving');
    const finalId = await onAssignCase(caseId, { force });
    if (!finalId) {
      setAssignState('error');
      return;
    }
    if (finalId !== caseId) {
      const c = findCaseById(finalId);
      if (c) {
        setCaseData(c);
        setChecked({});
      }
    }
    setAssignState('saved');
  };

  useEffect(() => {
    if (!open) return;
    setAssignState(null);
    setLevelFilter('all');
    if (suggestion?.checklistPool) {
      const existing = poolFixed ? findCaseById(assignedCaseId) : null;
      if (existing) {
        // นักเรียนคนนี้ถูกล็อกเคสไว้แล้ว (สแกนซ้ำ/เปิดใบประเมินใหม่) — ใช้เคสเดิม
        // (หาแบบข้าม pool เผื่อเคสถูกล็อกไว้ก่อนฐานเปลี่ยนธนาคารข้อสอบ)
        setCaseData(existing);
        setAssignState('saved');
      } else {
        const c = pickRandomCase(poolCases);
        setCaseData(c);
        if (poolFixed) persistAssign(c.id, false);
      }
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
    // เคส Megacode = ข้อแกนกลาง (มาตรฐานเดียวกันทุกเคส no C1-C9) + ข้อเฉพาะเคส
    if (caseData) return [
      ...MEGACODE_CORE_ITEMS.map((it) => ({ ...it, section: 'core' })),
      ...caseData.items.map((it, i) => ({ ...it, no: i + 1, section: null })),
    ];
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
    const next = pickRandomCase(levelPool, caseData?.id);
    setCaseData(next);
    setChecked({});
    // ฐานสอบแบบล็อกเคส: สุ่มใหม่ = ทับเคสเดิมบน server ด้วย (force)
    if (poolFixed) persistAssign(next.id, true);
  };

  // เปลี่ยนระดับความยาก — ถ้าเคสปัจจุบันไม่อยู่ในระดับที่เลือก สุ่มเคสใหม่ใน
  // ระดับนั้นให้ทันที (อยู่แล้วก็คงเคสเดิม ไม่รีเซ็ตที่ติ๊กไว้)
  const selectLevel = (lv) => {
    setLevelFilter(lv);
    if (lv === 'all' || caseData?.level === lv) return;
    const pool = poolCases.filter((c) => c.level === lv);
    if (!pool.length) return;
    const next = pickRandomCase(pool, caseData?.id);
    setCaseData(next);
    setChecked({});
    if (poolFixed) persistAssign(next.id, true);
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
          {suggestion?.checklistOptions?.length > 1 ? (
            /* ฐานที่มีหลายบทให้เลือก (เช่น จุด B: Brady/Tachy) — ปุ่มใหญ่เลือกชัดๆ
               แทน dropdown ตัวเล็ก ตาม feedback หน้างาน */
            <div className="space-y-1.5">
              <div className="text-overline text-text-muted">เลือกบทที่ประเมิน</div>
              {suggestion.checklistOptions.map((id) => {
                const c = STATION_CHECKLISTS[id];
                const active = checklistId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setChecklistId(id); setChecked({}); }}
                    className={`cl-row ${active ? 'is-checked' : ''}`}
                  >
                    <span className="cl-box">{active && <Check size={17} strokeWidth={3.2} />}</span>
                    <span className="font-bold">{c?.title || id}</span>
                  </button>
                );
              })}
            </div>
          ) : !suggestion?.checklistPool && (
            <select
              value={checklistId ?? ''}
              onChange={(e) => { setChecklistId(e.target.value); setChecked({}); }}
              className="w-full text-caption"
            >
              {CHECKLIST_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          )}

          {/* ตัวเลือกระดับความยาก — เฉพาะ pool ที่เคสติดป้าย level (15 เคสจุด A/B)
              อาจารย์อยากได้โจทย์ง่ายๆ ก็แตะ "ง่าย" แล้วระบบสุ่มเฉพาะระดับนั้น */}
          {suggestion?.checklistPool && hasLevels && !readOnly && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-overline text-text-muted">ระดับโจทย์</span>
              <button type="button" onClick={() => selectLevel('all')}
                className={`cohort-chip ${levelFilter === 'all' ? 'is-active-info' : ''}`}>
                ทั้งหมด ({poolCases.length})
              </button>
              {Object.entries(MEGACODE_LEVEL_META)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([lv, meta]) => (
                  <button key={lv} type="button" onClick={() => selectLevel(lv)}
                    className={`cohort-chip ${levelFilter === lv ? 'is-active-info' : ''}`}>
                    {meta.label} ({poolCases.filter((c) => c.level === lv).length})
                  </button>
                ))}
            </div>
          )}

          {suggestion?.checklistPool && caseData && (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0 bg-bg-tertiary p-2.5" style={{ borderRadius: 'var(--radius-md)' }}>
                <div className="text-caption font-bold text-text-primary">
                  Case {caseData.no}: {caseData.title}
                </div>
                <div className="text-2xs text-text-muted">
                  Algorithm: {caseData.algorithm}
                  {caseData.level && MEGACODE_LEVEL_META[caseData.level] && (
                    <> · ระดับ{MEGACODE_LEVEL_META[caseData.level].label}</>
                  )}
                </div>
              </div>
              {!readOnly && (
                <button onClick={reroll} disabled={assignState === 'saving'}
                  className="btn btn-ghost btn-sm shrink-0 disabled:opacity-40">
                  <Shuffle size={13} strokeWidth={2.2} /> สุ่มใหม่
                </button>
              )}
            </div>
          )}

          {/* สถานะการล็อกเคสกับนักเรียน — เฉพาะฐานสอบแบบสุ่มข้อสอบ ให้อาจารย์
              มั่นใจว่าโจทย์ติดตัวนักเรียนแล้ว สแกนซ้ำก็ได้ข้อเดิม */}
          {poolFixed && assignState && (
            <div className={`text-2xs font-bold ${
              assignState === 'saved' ? 'text-success'
                : assignState === 'error' ? 'text-danger' : 'text-text-muted'
            }`}>
              {assignState === 'saving' && 'กำลังล็อกโจทย์กับนักเรียนคนนี้…'}
              {assignState === 'saved' && '🔒 ล็อกโจทย์นี้กับนักเรียนแล้ว — สแกนซ้ำ/เปิดใหม่ก็ได้โจทย์เดิม'}
              {assignState === 'error' && 'ล็อกโจทย์ไม่สำเร็จ — ตรวจอินเทอร์เน็ตแล้วกด "สุ่มใหม่" อีกครั้ง'}
            </div>
          )}

          {(template?.scenario || caseData?.scenario) && (
            <div className="text-2xs text-text-secondary italic">
              โจทย์: {template?.scenario || caseData?.scenario}
            </div>
          )}

          {/* คู่มือคุมหุ่น — ต้องอยู่เหนือเช็คลิสต์ อาจารย์ตั้งหุ่น/เตรียมจังหวะ
              ให้เสร็จก่อนเรียกนักเรียนเข้าฐาน แล้วค่อยเลื่อนลงไปติ๊กคะแนน */}
          <Suspense fallback={null}>
            <ManikinSetupPanel target={caseData ?? template} />
          </Suspense>

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
            <>
              {/* ข้อแกนกลาง — เหมือนกันทุกเคส ให้นักเรียนทุกคนถูกวัดมาตรฐานเดียวกัน */}
              <div className="space-y-1.5">
                <div className="text-overline text-text-muted">
                  ข้อประเมินแกนกลาง (ทุกเคส — มาตรฐานเดียวกัน)
                </div>
                {MEGACODE_CORE_ITEMS.map((it) => (
                  <ChecklistRow
                    key={it.no}
                    no={it.no}
                    text={it.text}
                    checkedOn={!!checked[it.no]}
                    disabled={readOnly}
                    onToggle={() => toggle(it.no)}
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="text-overline text-text-muted">เช็คลิสต์เฉพาะเคส</div>
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
            </>
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
