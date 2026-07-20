import { MEGACODE_CASES } from '../data/checklists/megacodeCases';

// สถิติสอบ + Export Excel (CSV) ของระบบเช็คชื่อเข้าฐาน — คำนวณจาก board ที่
// get_checkin_board คืนมา (มี checklistId ต่อ checkin อยู่แล้ว) ไม่ต้องยิง RPC เพิ่ม

// สถิติต่อฐาน (มาแล้วกี่คน / ฐานสอบผ่าน-ไม่ผ่าน-ยังไม่ตัดสินกี่คน) + จำนวนครั้ง
// ที่เคส Megacode แต่ละเคสถูกใช้สอบ (กันนักเรียนบอกโจทย์ต่อกัน — เคสไหนถูกใช้
// บ่อยอาจารย์จะได้เลี่ยงตอนกด "สุ่มใหม่")
export function computeCheckinStats(board) {
  const stations = board?.stations || [];
  const rows = board?.rows || [];
  const total = rows.length;

  const stationStats = stations.map((st) => {
    let attended = 0; let passed = 0; let failed = 0;
    for (const r of rows) {
      const c = r.checkins?.[st.id];
      if (!c) continue;
      attended += 1;
      if (c.examPassed === true) passed += 1;
      else if (c.examPassed === false) failed += 1;
    }
    return {
      id: st.id, name: st.name, kind: st.kind,
      attended, total, passed, failed,
      pending: attended - passed - failed,
      passRate: (passed + failed) > 0 ? Math.round((passed / (passed + failed)) * 100) : null,
    };
  });

  const caseCount = new Map();
  for (const r of rows) {
    for (const c of Object.values(r.checkins || {})) {
      if (c?.checklistId?.startsWith('case-')) {
        caseCount.set(c.checklistId, (caseCount.get(c.checklistId) || 0) + 1);
      }
    }
  }
  const caseUsage = MEGACODE_CASES
    .map((cs) => ({ id: cs.id, no: cs.no, title: cs.title, count: caseCount.get(cs.id) || 0 }))
    .filter((cs) => cs.count > 0)
    .sort((a, b) => b.count - a.count || a.no - b.no);

  return { stationStats, caseUsage, unusedCaseCount: MEGACODE_CASES.length - caseUsage.length };
}

const esc = (v) => {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const timeCell = (iso) => (iso
  ? new Date(iso).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  : '');

// Export ทั้งคลาสเป็น CSV (UTF-8 BOM — เปิดใน Excel ได้ภาษาไทยตรง) — 1 แถวต่อ
// นักเรียน, ต่อฐานมีคอลัมน์เวลาเช็คชื่อ และฐานสอบเพิ่มคอลัมน์ ผล/คะแนน
export function exportCheckinCSV({ board, classCode }) {
  const stations = board?.stations || [];
  const rows = board?.rows || [];

  const headers = ['ลำดับ', 'รหัสนักเรียน', 'ชื่อ-สกุล'];
  for (const st of stations) {
    headers.push(`${st.name} — เช็คชื่อ`);
    if (st.kind === 'exam') {
      headers.push(`${st.name} — ผล`, `${st.name} — คะแนน`);
    }
  }

  const lines = [headers.map(esc).join(',')];
  rows.forEach((r, i) => {
    const cells = [i + 1, esc(r.student.studentId || ''), esc(r.student.name || '')];
    for (const st of stations) {
      const c = r.checkins?.[st.id];
      cells.push(esc(timeCell(c?.checkedInAt)));
      if (st.kind === 'exam') {
        cells.push(c?.examPassed == null ? '' : (c.examPassed ? 'ผ่าน' : 'ไม่ผ่าน'));
        cells.push(c?.examScore ?? '');
      }
    }
    lines.push(cells.join(','));
  });

  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checkin_${classCode || 'class'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
