import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, RefreshCw, Check, Undo2, X, Printer, FileSpreadsheet, Award } from 'lucide-react';
import {
  rpcGetCheckinBoard, rpcUndoCheckin, rpcSetExamResult,
} from '../../services/cohortSync';
import { useClassStore } from '../../stores/classStore';
import StudentReportSheet from '../checkin/StudentReportSheet';
import { computeCheckinStats, exportCheckinCSV } from '../../utils/exportCheckin';

const timeStr = (iso) => (iso ? new Date(iso).toLocaleTimeString('th-TH', {
  hour: '2-digit', minute: '2-digit',
}) : '');

// สรุปเช็คชื่อเข้าฐาน + ผลสอบปฏิบัติ รายคลาส — ตาราง นักเรียน × ฐาน
// self-contained เหมือน CodeBlueCohortSummary: ดึง board ผ่าน RPC ของตัวเอง
// ไม่แตะ state ของ InstructorCohort เลย แตะ cell เพื่อแก้ (undo / ผ่าน-ไม่ผ่าน)
export default function CheckinCohortSummary({ classCode }) {
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editCell, setEditCell] = useState(null); // { studentPk, stationId }
  const [busy, setBusy] = useState(false);
  // ใบสรุปผลรายคน (พิมพ์/บันทึก PDF) — เก็บ row ที่เลือกไว้ทั้งก้อน
  const [reportRow, setReportRow] = useState(null); // { student, checkins } | null
  const className = useClassStore(s => s.className);
  const courseMode = useClassStore(s => s.courseMode);

  useEffect(() => {
    if (!classCode) return undefined;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await rpcGetCheckinBoard();
      if (!alive) return;
      setBoard(error ? null : data);
      setLoading(false);
    };
    load();
    return () => { alive = false; };
  }, [classCode, reloadKey]);

  if (!classCode) return null;

  const stations = board?.stations || [];
  const rows = board?.rows || [];
  const stats = computeCheckinStats(board);
  const examStats = stats.stationStats.filter(s => s.kind === 'exam');
  const refresh = () => setReloadKey(k => k + 1);

  const runEdit = async (fn) => {
    setBusy(true);
    await fn();
    setBusy(false);
    setEditCell(null);
    refresh();
  };

  return (
    <div className="dash-card space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <ScanLine size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">เช็คชื่อเข้าฐาน (ภาคปฏิบัติ)</div>
          <div className="text-2xs text-text-muted">
            ใครเข้าฐานไหนแล้ว + ผลสอบปฏิบัติ — แตะช่องในตารางเพื่อแก้ไข
          </div>
        </div>
        <button onClick={refresh} className="btn btn-ghost btn-sm shrink-0">
          <RefreshCw size={13} strokeWidth={2.2} />
        </button>
        {rows.length > 0 && (
          <button
            onClick={() => exportCheckinCSV({ board, classCode })}
            className="btn btn-ghost btn-sm shrink-0"
            title="ดาวน์โหลด Excel (CSV) ทั้งคลาส">
            <FileSpreadsheet size={13} strokeWidth={2.2} /> Excel
          </button>
        )}
        <button onClick={() => navigate('/pre-course/checkin')}
          className="btn btn-primary btn-sm shrink-0">
          <ScanLine size={13} strokeWidth={2.2} /> สแกนเช็คชื่อ
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-muted text-caption py-4">กำลังโหลด…</div>
      ) : stations.length === 0 ? (
        <div className="text-center text-text-muted text-caption py-4">
          ยังไม่ได้สร้างฐาน — กด "สแกนเช็คชื่อ" เพื่อตั้งฐานและเริ่มเช็คชื่อ
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-caption">
            <thead className="bg-bg-tertiary text-text-secondary">
              <tr>
                <th className="px-2 py-1.5 text-left">ชื่อ</th>
                {stations.map(st => {
                  const present = rows.filter(r => r.checkins?.[st.id]).length;
                  return (
                    <th key={st.id} className="px-2 py-1.5 text-center whitespace-nowrap">
                      <div>{st.name}</div>
                      <div className="text-2xs font-normal text-text-muted">
                        {present}/{rows.length}
                        {st.kind === 'exam' && ' · สอบ'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={stations.length + 1}
                  className="px-2 py-4 text-center text-text-muted">ยังไม่มีนักเรียน</td></tr>
              ) : rows.map(({ student, checkins }) => (
                <tr key={student.id} className="border-t border-border">
                  <td className="px-2 py-1.5 text-text-primary whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setReportRow({ student, checkins })}
                        className="text-text-muted hover:text-info shrink-0"
                        title="ใบสรุปผลรายคน (พิมพ์/PDF)"
                        aria-label={`ใบสรุปผลของ ${student.name}`}>
                        <Printer size={13} strokeWidth={2.2} />
                      </button>
                      <span>
                        {student.name}
                        <span className="font-mono text-2xs text-text-muted"> {student.studentId}</span>
                      </span>
                    </span>
                  </td>
                  {stations.map(st => {
                    const c = checkins?.[st.id];
                    const isEditing = editCell
                      && editCell.studentPk === student.id && editCell.stationId === st.id;
                    return (
                      <td key={st.id} className="px-2 py-1.5 text-center relative">
                        <button
                          onClick={() => setEditCell(isEditing ? null
                            : { studentPk: student.id, stationId: st.id })}
                          className="w-full"
                        >
                          {!c ? (
                            <span className="text-text-muted">—</span>
                          ) : st.kind === 'exam' && c.examPassed != null ? (
                            <span className={`font-bold ${c.examPassed ? 'text-success' : 'text-danger'}`}>
                              {c.examPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                              {c.examScore != null && ` ${c.examScore}`}
                            </span>
                          ) : (
                            <span className="text-success inline-flex items-center gap-1 justify-center">
                              <Check size={12} strokeWidth={2.6} /> {timeStr(c.checkedInAt)}
                            </span>
                          )}
                        </button>
                        {isEditing && (
                          <div className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 bg-bg-secondary border border-border shadow-lg p-2 space-y-1.5 min-w-36"
                            style={{ borderRadius: 'var(--radius-md)' }}>
                            {st.kind === 'exam' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button disabled={busy}
                                  onClick={() => runEdit(() => rpcSetExamResult({
                                    studentPk: student.id, stationId: st.id, passed: true,
                                  }))}
                                  className="btn btn-sm bg-success text-white font-bold disabled:opacity-40">
                                  ผ่าน
                                </button>
                                <button disabled={busy}
                                  onClick={() => runEdit(() => rpcSetExamResult({
                                    studentPk: student.id, stationId: st.id, passed: false,
                                  }))}
                                  className="btn btn-sm bg-danger text-white font-bold disabled:opacity-40">
                                  ไม่ผ่าน
                                </button>
                              </div>
                            )}
                            {c && (
                              <button disabled={busy}
                                onClick={() => {
                                  if (!confirm(`ยกเลิกเช็คชื่อ ${student.name} ที่ ${st.name}?`)) return;
                                  runEdit(() => rpcUndoCheckin({
                                    studentPk: student.id, stationId: st.id,
                                  }));
                                }}
                                className="btn btn-ghost btn-sm btn-block text-danger disabled:opacity-40">
                                <Undo2 size={12} strokeWidth={2.2} /> ยกเลิกเช็คชื่อ
                              </button>
                            )}
                            <button onClick={() => setEditCell(null)}
                              className="btn btn-ghost btn-sm btn-block">
                              <X size={12} strokeWidth={2.2} /> ปิด
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* สถิติสอบ + การใช้เคส Megacode — คำนวณจาก board เดียวกัน ไม่ยิง RPC เพิ่ม */}
      {!loading && rows.length > 0 && examStats.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2">
          <div className="text-overline text-text-muted inline-flex items-center gap-1">
            <Award size={11} strokeWidth={2.4} /> สถิติสอบปฏิบัติ
          </div>
          {examStats.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-caption">
              <span className="flex-1 min-w-0 truncate text-text-secondary">{s.name}</span>
              <span className="text-success font-bold">ผ่าน {s.passed}</span>
              <span className="text-danger font-bold">ไม่ผ่าน {s.failed}</span>
              <span className="text-text-muted">ยังไม่สอบ {s.total - s.passed - s.failed}</span>
              {s.passRate != null && (
                <span className="text-2xs font-bold px-1.5 py-0.5 bg-bg-tertiary text-text-primary"
                  style={{ borderRadius: 'var(--radius-full)' }}>
                  {s.passRate}%
                </span>
              )}
            </div>
          ))}
          {stats.caseUsage.length > 0 && (
            <>
              <div className="text-2xs text-text-muted pt-1">
                เคส Megacode ที่ถูกใช้แล้ว (เหลือยังไม่ใช้ {stats.unusedCaseCount} เคส) —
                กด "สุ่มใหม่" เลี่ยงเคสที่ใช้บ่อยได้
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.caseUsage.map(cs => (
                  <span key={cs.id} title={cs.title}
                    className="text-2xs font-bold px-2 py-0.5 bg-warning/12 text-warning border border-warning/30"
                    style={{ borderRadius: 'var(--radius-full)' }}>
                    Case {cs.no} ×{cs.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <StudentReportSheet
        open={!!reportRow}
        student={reportRow?.student ?? null}
        stations={stations}
        checkins={reportRow?.checkins ?? {}}
        className={className}
        courseMode={courseMode}
        onClose={() => setReportRow(null)}
      />
    </div>
  );
}
