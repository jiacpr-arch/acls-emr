import { Printer, X, Check } from 'lucide-react';
import { STATION_CHECKLISTS } from '../../data/checklists/stationChecklists';
import { MEGACODE_CASES, MEGACODE_CORE_ITEMS } from '../../data/checklists/megacodeCases';
import { CODE_BLUE_EXAM_CASES } from '../../data/checklists/codeBlueExamCases';
import { PRACTICE_CASES } from '../../data/checklists/practiceCases';

// ใบสรุปผลการฝึกอบรมภาคปฏิบัติรายคน — รวมข้อมูลที่เก็บจากระบบเช็คชื่อ QR ทั้งหมด
// (เวลาเข้าฐาน ผลสอบ คะแนน เช็คลิสต์ที่ติ๊กรายข้อ) จัดเป็นแบบฟอร์มพร้อมพิมพ์/
// บันทึก PDF ผ่าน window.print() — สไตล์ในแผ่นใช้สีตายตัวขาว-ดำ (ไม่อิง theme
// token) เพื่อให้หน้าตาบนกระดาษเหมือนกันทุกเครื่องไม่ว่า dark/light mode
// กติกาการซ่อนส่วนอื่นของแอปตอนพิมพ์อยู่ที่ .print-overlay/.print-sheet/.print-hide
// ใน index.css

const dtStr = (iso) => (iso ? new Date(iso).toLocaleString('th-TH', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '');

// checklist_id ที่บันทึกไว้เป็นได้ 2 แบบ: id ของใบประเมินทักษะ/อัลกอริทึม หรือ
// id ของเคส Megacode (case-01..case-15)
// ค้นทุกธนาคารเคส (สอบ 15 เคส / เคสจากเกม / เคสฝึก P1-P10) — ใบสรุปต้องแสดง
// รายละเอียดได้ไม่ว่าผลนั้นมาจาก pool ไหน
const ALL_CASES = [...MEGACODE_CASES, ...CODE_BLUE_EXAM_CASES, ...PRACTICE_CASES];

function resolveChecklist(checklistId) {
  if (!checklistId) return null;
  const t = STATION_CHECKLISTS[checklistId];
  if (t) return { kind: 'station', data: t };
  const c = ALL_CASES.find((x) => x.id === checklistId);
  if (c) return { kind: 'case', data: c };
  return null;
}

const line = { borderBottom: '1px solid #bbb' };
const th = {
  border: '1px solid #999', padding: '4px 6px', fontSize: 12,
  background: '#f0f0f0', textAlign: 'left', fontWeight: 700,
};
const td = { border: '1px solid #999', padding: '4px 6px', fontSize: 12, verticalAlign: 'top' };

function ChecklistDetail({ station, checkin }) {
  const resolved = resolveChecklist(checkin.checklistId);
  if (!resolved || !Array.isArray(checkin.checklistItems)) return null;
  const saved = new Map(checkin.checklistItems.map((it) => [it.no, !!it.checked]));
  const checkedCount = checkin.checklistItems.filter((it) => it.checked).length;
  const total = checkin.checklistItems.length;

  const itemRow = (no, text, critical) => (
    <div key={no} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '1.5px 0', fontSize: 12 }}>
      <span style={{
        width: 15, height: 15, border: '1.5px solid #555', borderRadius: 3, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
        background: saved.get(no) ? '#e6f4ea' : '#fff',
      }}>
        {saved.get(no) && <Check size={11} strokeWidth={3.5} color="#1a7f37" />}
      </span>
      <span style={{ color: saved.get(no) ? '#111' : '#888' }}>
        {no}. {text}
        {critical && <b style={{ color: '#b45309' }}> ★</b>}
      </span>
    </div>
  );

  return (
    <div style={{ breakInside: 'avoid-page', marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 13, ...line, paddingBottom: 3 }}>
        {station?.name} — {resolved.kind === 'case'
          ? `Megacode Case ${resolved.data.no}: ${resolved.data.title}`
          : resolved.data.title}
      </div>
      {resolved.kind === 'case' && (
        <div style={{ fontSize: 11, color: '#555', margin: '3px 0' }}>
          Algorithm: {resolved.data.algorithm}
        </div>
      )}
      <div style={{ fontSize: 12, margin: '4px 0', fontWeight: 700 }}>
        ปฏิบัติได้ {checkedCount} / {total} ข้อ
        {resolved.kind === 'station' && resolved.data.passRule && (
          <span style={{ fontWeight: 400, color: '#555' }}>
            {' '}(เกณฑ์ผ่าน ≥ {resolved.data.passRule.min}/{resolved.data.passRule.total}
            {resolved.data.passRule.requireAllCritical && ' และข้อวิกฤต ★ ครบทุกข้อ'})
          </span>
        )}
        {resolved.kind === 'case' && (
          <span style={{ fontWeight: 400, color: '#555' }}> (ผ่าน/ไม่ผ่านตามดุลยพินิจอาจารย์ผู้คุมสอบ)</span>
        )}
      </div>
      {resolved.kind === 'station'
        ? resolved.data.sections.map((sec) => (
          <div key={sec.title} style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#333' }}>{sec.title}</div>
            {sec.items.map((it) => itemRow(it.no, it.text, it.critical))}
          </div>
        ))
        : (
          <>
            {/* ข้อแกนกลาง (C1-C9) — โชว์เมื่อผลที่บันทึกมีข้อชุดนี้ (ผลเก่าก่อน
                เพิ่มมาตรฐานกลางจะไม่มี — ข้ามไปเลย) */}
            {MEGACODE_CORE_ITEMS.some((it) => saved.has(it.no)) && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#333' }}>
                  ข้อประเมินแกนกลาง (ทุกเคส)
                </div>
                {MEGACODE_CORE_ITEMS.filter((it) => saved.has(it.no))
                  .map((it) => itemRow(it.no, it.text, false))}
              </div>
            )}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#333' }}>เช็คลิสต์เฉพาะเคส</div>
              {resolved.data.items.map((it, i) => itemRow(i + 1, it.text, false))}
            </div>
          </>
        )}
    </div>
  );
}

export default function StudentReportSheet({
  open, student, stations, checkins = {}, className, courseMode, onClose,
}) {
  if (!open || !student) return null;

  const courseLabel = courseMode === 'bls'
    ? 'หลักสูตรการช่วยชีวิตขั้นพื้นฐาน (BLS)'
    : 'หลักสูตรการช่วยชีวิตขั้นสูง (ACLS)';
  const withChecklist = stations.filter((st) => {
    const c = checkins[st.id];
    return c?.checklistId && Array.isArray(c?.checklistItems);
  });

  return (
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in p-3 sm:p-6">
      {/* แถบปุ่ม — ซ่อนตอนพิมพ์ */}
      <div className="print-hide sticky top-0 z-10 flex justify-center gap-2 mb-3">
        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={15} strokeWidth={2.2} /> พิมพ์ / บันทึก PDF
        </button>
        <button onClick={onClose} className="btn bg-bg-secondary text-text-primary border border-border">
          <X size={15} strokeWidth={2.2} /> ปิด
        </button>
      </div>

      {/* ตัวแผ่นฟอร์ม */}
      <div className="print-sheet mx-auto"
        style={{
          maxWidth: 760, background: '#fff', color: '#111',
          padding: '28px 32px', borderRadius: 8, fontFamily: 'inherit',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>ใบสรุปผลการฝึกอบรมภาคปฏิบัติ</div>
          <div style={{ fontSize: 13 }}>{courseLabel}</div>
          {className && <div style={{ fontSize: 12, color: '#555' }}>คลาส: {className}</div>}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 13, margin: '12px 0 10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            ชื่อ-สกุล: <b>{student.name}</b>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            รหัส: <b style={{ fontFamily: 'monospace' }}>{student.studentId || '—'}</b>
          </div>
          <div style={{ minWidth: 150, color: '#555' }}>
            พิมพ์เมื่อ: {dtStr(new Date().toISOString())}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ฐาน</th>
              <th style={{ ...th, width: 130 }}>เช็คชื่อ</th>
              <th style={{ ...th, width: 90 }}>ผลประเมิน</th>
              <th style={{ ...th, width: 60 }}>คะแนน</th>
              <th style={th}>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((st) => {
              const c = checkins[st.id];
              return (
                <tr key={st.id}>
                  <td style={td}>
                    {st.name}
                    {st.kind === 'exam' && !st.name.includes('สอบ')
                      && <span style={{ color: '#b45309' }}> (สอบ)</span>}
                  </td>
                  <td style={td}>{c ? dtStr(c.checkedInAt) : '— ไม่ได้เข้า —'}</td>
                  <td style={{ ...td, fontWeight: 700, color: c?.examPassed == null ? '#888' : (c.examPassed ? '#1a7f37' : '#b91c1c') }}>
                    {c?.examPassed == null ? '—' : (c.examPassed ? 'ผ่าน' : 'ไม่ผ่าน')}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>{c?.examScore ?? '—'}</td>
                  <td style={td}>{c?.note || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {withChecklist.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 18, ...line, paddingBottom: 3 }}>
              รายละเอียดเช็คลิสต์การประเมิน
            </div>
            {withChecklist.map((st) => (
              <ChecklistDetail key={st.id} station={st} checkin={checkins[st.id]} />
            ))}
          </>
        )}

        <div style={{
          display: 'flex', gap: 40, marginTop: 36, fontSize: 13,
          breakInside: 'avoid-page', justifyContent: 'flex-end',
        }}>
          <div style={{ textAlign: 'center', minWidth: 220 }}>
            <div style={{ ...line, height: 28 }} />
            <div style={{ marginTop: 4 }}>ลงชื่ออาจารย์ผู้ประเมิน</div>
            <div style={{ color: '#555', marginTop: 10 }}>วันที่ ........./........./.............</div>
          </div>
        </div>
      </div>
    </div>
  );
}
