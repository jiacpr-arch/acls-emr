import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HEADER_COLOR = [37, 99, 235];

function fmtDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function brandedHeader(doc, title) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pw, 14, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);
  doc.text(title, pw / 2, 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('JIA Trainer Center — jia1669.com', pw / 2, 12, { align: 'center' });
  doc.setTextColor(0);
}

function pageFooter(doc) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `ACLS EMR Pre-course | Generated ${new Date().toLocaleString('en-US')} | Page ${i}/${pages}`,
      pw / 2, ph - 6, { align: 'center' }
    );
  }
}

/**
 * Export one student's quiz attempt as a PDF report.
 * Non-ASCII (Thai) fields are stripped to ASCII-safe placeholders since the built-in
 * jsPDF font does not support Thai. The PDF is meant as an instructor-facing receipt
 * with score and per-question results; the in-app view keeps full Thai text.
 */
export function exportStudentResultPDF({ student, attempt, lesson }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  brandedHeader(doc, 'Pre-course Quiz Report');
  let y = 20;

  const summary = [
    ['Student name', student?.name || '-'],
    ['Student ID', student?.studentId || '-'],
    ['Lesson', lesson?.title || attempt?.lessonId || '-'],
    ['Started', fmtDate(attempt?.startedAt)],
    ['Finished', fmtDate(attempt?.finishedAt)],
    ['Score', `${attempt?.score ?? 0}% (${attempt?.correctCount ?? 0}/${attempt?.totalQuestions ?? 0})`],
    ['Passing score', `${lesson?.passingScore ?? 70}%`],
    ['Result', attempt?.passed ? 'PASS' : 'FAIL'],
    ['Attempt #', String(attempt?.attemptNumber ?? 1)],
  ];

  autoTable(doc, {
    startY: y,
    body: summary,
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    styles: { fontSize: 9, cellPadding: 1.6 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 4;

  // Per-question table — use question index + chosen/correct id; long Thai text is
  // shown by index only so the PDF stays readable in the bundled font.
  const rows = (attempt?.answers || []).map((a, i) => {
    const q = (lesson?.quiz || []).find(qq => qq.id === a.questionId);
    const chosenText = q?.choices.find(c => c.id === a.chosenId)?.text || '-';
    const correctText = q?.choices.find(c => c.id === q.correctId)?.text || '-';
    return [
      String(i + 1),
      a.chosenId?.toUpperCase() || '-',
      q?.correctId?.toUpperCase() || '-',
      a.correct ? 'OK' : 'X',
      chosenText.length > 50 ? chosenText.slice(0, 47) + '...' : chosenText,
      correctText.length > 50 ? correctText.slice(0, 47) + '...' : correctText,
    ];
  });

  if (rows.length) {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Chosen', 'Correct', 'OK?', 'Chosen text', 'Correct text']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: HEADER_COLOR, fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 65 },
        5: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  pageFooter(doc);

  const safeName = (student?.studentId || student?.id || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fname = `precourse_${safeName}_${lesson?.id || 'lesson'}.pdf`;
  doc.save(fname);
  return fname;
}

/**
 * Export the whole cohort (all students on this device) for a lesson as a PDF table.
 */
export function exportCohortPDF({ rows, lesson }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  brandedHeader(doc, 'Pre-course Cohort Report');
  let y = 18;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lesson: ${lesson?.title || lesson?.id || '-'}`, 14, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Passing score: ${lesson?.passingScore ?? 70}%   |   Students: ${rows.length}`, 14, y);
  y += 4;

  const body = rows.map((r, i) => [
    String(i + 1),
    r.studentId || '-',
    r.name || '-',
    r.read ? 'YES' : 'NO',
    r.attemptCount ? String(r.attemptCount) : '0',
    r.bestScore != null ? `${r.bestScore}%` : '-',
    r.passed ? 'PASS' : (r.attemptCount ? 'FAIL' : '-'),
    fmtDate(r.lastAttemptAt),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Student ID', 'Name', 'Read', 'Attempts', 'Best', 'Result', 'Last attempt']],
    body,
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 45 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 'auto' },
    },
    margin: { left: 10, right: 10 },
  });

  pageFooter(doc);
  const fname = `precourse_cohort_${lesson?.id || 'lesson'}.pdf`;
  doc.save(fname);
  return fname;
}

/**
 * Export cohort to CSV. Uses UTF-8 BOM so Excel opens Thai correctly.
 */
export function exportCohortCSV({ rows, lesson }) {
  const headers = [
    'Student ID', 'Name', 'Lesson', 'Read', 'Attempts',
    'Best score (%)', 'Passing score (%)', 'Result', 'Last attempt',
  ];
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      esc(r.studentId),
      esc(r.name),
      esc(lesson?.title || lesson?.id || ''),
      r.read ? 'YES' : 'NO',
      r.attemptCount ?? 0,
      r.bestScore ?? '',
      lesson?.passingScore ?? 70,
      r.passed ? 'PASS' : (r.attemptCount ? 'FAIL' : ''),
      esc(r.lastAttemptAt || ''),
    ].join(','));
  }
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `precourse_cohort_${lesson?.id || 'lesson'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
