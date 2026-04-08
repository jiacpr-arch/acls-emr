import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateScore } from './scoring';

// PDF Export — matches JIA ACLS Recorder Form (2-page format)
export function exportCasePDF(caseData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const isTraining = caseData.mode === 'training';
  const events = caseData.events || [];
  const startTime = caseData.startTime ? new Date(caseData.startTime) : null;
  const endTime = caseData.endTime ? new Date(caseData.endTime) : null;
  const duration = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;
  const fmtSec = (s) => s > 0 ? `${Math.floor(s / 60)}m ${s % 60}s` : '-';
  const fmtElapsed = (s) => `${String(Math.floor((s||0) / 60)).padStart(2, '0')}:${String((s||0) % 60).padStart(2, '0')}`;
  const fmtClock = (ts) => ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '';
  const headerColor = isTraining ? [37, 99, 235] : [220, 38, 38];

  let y = 10;

  // =============== PAGE 1: Header + Patient + Event Timeline Table ===============

  // Title bar with JIA branding
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, pw, 14, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);
  doc.text('ACLS Record Report', pw / 2, 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('JIA Trainer Center — jia1669.com', pw / 2, 12, { align: 'center' });
  y = 18;

  // Patient row (matching JIA form header: ชื่อ | อายุ | ตำหนิ/ชุด | วันที่)
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const p = caseData.patient || {};

  // JIA form header row
  doc.autoTable({
    startY: y,
    body: [[
      p.name || '-',
      p.age ? `${p.age}y ${p.gender || ''}` : '-',
      p.hn || '-',
      p.location || '-',
      startTime ? startTime.toLocaleDateString('en-US') : '-',
    ]],
    head: [['Name', 'Age/Sex', 'HN', 'Location', 'Date']],
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100], fontSize: 7 },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 3;

  // Case info row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80);
  doc.text(`Case: ${caseData.id || '-'}  |  Mode: ${(caseData.mode || 'clinical').toUpperCase()}  |  Start: ${fmtClock(caseData.startTime)}  |  End: ${fmtClock(caseData.endTime)}  |  Duration: ${fmtSec(duration)}  |  Outcome: ${caseData.outcome || '-'}`, 14, y);
  doc.setTextColor(0);
  y += 5;

  // ---- Event Timeline Table (JIA form format) ----
  // Columns: Time | Rhythm | Defib/Sync/Pacing | Medication/Procedure | Dose/Route | EtCO2 | Note
  if (events.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Event Timeline', 14, y);
    y += 2;

    const timelineRows = [...events].reverse().map(ev => {
      const elapsed = fmtElapsed(ev.elapsed);
      const clock = fmtClock(ev.timestamp);
      let rhythm = '', defib = '', medication = '', doseRoute = '', etco2 = '', note = '';

      if (ev.category === 'rhythm') rhythm = ev.type?.replace('Rhythm: ', '').replace('Initial Rhythm: ', '') || '';
      else if (ev.category === 'shock') defib = ev.type || '';
      else if (ev.category === 'drug') { medication = ev.type?.replace('💉 ', '').replace('💊 ', '') || ''; }
      else if (ev.category === 'airway' || ev.category === 'access') medication = ev.type?.replace('🫁 ', '').replace('💉 ', '').replace('🦴 ', '') || '';
      else if (ev.category === 'etco2') { etco2 = ev.details?.value ? `${ev.details.value}` : ''; }
      else if (ev.category === 'cpr') note = ev.type || '';
      else note = ev.type || '';

      return [elapsed, clock, rhythm, defib, medication, doseRoute, etco2, note];
    });

    doc.autoTable({
      startY: y,
      head: [['Time', 'Clock', 'Rhythm', 'Defib/Sync', 'Med/Procedure', 'Dose', 'EtCO2', 'Note']],
      body: timelineRows,
      theme: 'grid',
      headStyles: { fillColor: headerColor, fontSize: 6.5, cellPadding: 1.5, halign: 'center' },
      styles: { fontSize: 6, cellPadding: 1.2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 18 },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
        5: { cellWidth: 20 },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 'auto' },
      },
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // =============== PAGE 2: Summary Sections (JIA form) ===============
  doc.addPage();
  y = 10;

  // Title bar page 2
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, pw, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);
  doc.text('ACLS Summary', pw / 2, 7, { align: 'center' });
  y = 15;

  // Helper: section header
  const sectionHeader = (title) => {
    if (y > 265) { doc.addPage(); y = 15; }
    doc.setFillColor(...headerColor);
    doc.rect(10, y - 3.5, pw - 20, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255);
    doc.text(title, 14, y);
    doc.setTextColor(0);
    y += 5;
  };

  // ---- Pre-Arrest Info ----
  sectionHeader('Pre-Arrest Information');
  const preArrest = [
    ['Location', p.location || '-'],
    ['Witnessed', p.witnessed ? 'Yes' : 'No'],
    ['Bystander CPR', p.bystanderCPR ? 'Yes' : 'No'],
    ['Initial Rhythm', p.initialRhythm || '-'],
    ['Chief Complaint', p.chiefComplaint || '-'],
    ['PMH', Array.isArray(p.pmh) ? p.pmh.join(', ') : (p.pmh || '-')],
    ['Medications', Array.isArray(p.medications) ? p.medications.join(', ') : (p.medications || '-')],
    ['Allergies', Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || '-')],
  ];
  doc.autoTable({
    startY: y, body: preArrest, theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
    styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 4;

  // ---- Cardiac Arrest Summary ----
  sectionHeader('Cardiac Arrest Summary');

  // Stats: CPR, Defib, Epi, Amio — first time, duration, count
  const epiEvts = events.filter(e => e.category === 'drug' && e.type?.includes('Epinephrine') && !e.type?.includes('Infusion')).sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));
  const shockEvts = events.filter(e => e.category === 'shock').sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));
  const amioEvts = events.filter(e => e.category === 'drug' && e.type?.includes('Amiodarone')).sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));
  const cprStart = events.filter(e => e.type?.includes('CPR Started')).sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));

  const summaryStats = [
    ['', 'First Time', 'Duration', 'Count'],
    ['CPR', cprStart[0] ? fmtElapsed(cprStart[0].elapsed) : '-', fmtSec(caseData.totalCPRTime || 0), `${caseData.cycleNumber || 0} cycles`],
    ['Defibrillation', shockEvts[0] ? fmtElapsed(shockEvts[0].elapsed) : '-', '-', `${shockEvts.length}`],
    ['Epinephrine', epiEvts[0] ? fmtElapsed(epiEvts[0].elapsed) : '-', '-', `${epiEvts.length}`],
    ['Amiodarone', amioEvts[0] ? fmtElapsed(amioEvts[0].elapsed) : '-', '-', `${amioEvts.length}`],
  ];

  doc.autoTable({
    startY: y, body: summaryStats.slice(1), head: [summaryStats[0]],
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100], fontSize: 7 },
    styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 2;

  // Key metrics row
  const metricsRow = [
    ['CCF', `${caseData.ccf || 0}%`],
    ['Total Pause Time', fmtSec(caseData.totalPauseTime || 0)],
    ['Shocks', `${caseData.shockCount || 0}`],
    ['Outcome', caseData.outcome || '-'],
  ];
  doc.autoTable({
    startY: y, body: metricsRow, theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
    styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 4;

  // ---- EtCO2 ----
  if (caseData.etco2Readings?.length > 0) {
    sectionHeader('EtCO2 Readings');
    const etcoRows = caseData.etco2Readings.map(r => [
      fmtElapsed(r.elapsed), `${r.value} mmHg`, r.value < 10 ? 'LOW' : r.value > 20 ? 'ROSC?' : '',
    ]);
    doc.autoTable({
      startY: y, head: [['Time', 'Value', 'Alert']], body: etcoRows,
      theme: 'grid', headStyles: { fillColor: [37, 99, 235], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ---- Drug Timing Analysis ----
  if (epiEvts.length >= 2) {
    sectionHeader('Drug Timing Analysis');
    const epiRows = epiEvts.map((e, i) => {
      const interval = i > 0 ? (e.elapsed || 0) - (epiEvts[i - 1].elapsed || 0) : '-';
      return [
        `Epi #${i + 1}`, fmtElapsed(e.elapsed),
        typeof interval === 'number' ? fmtSec(interval) : '-',
        typeof interval === 'number' ? (interval >= 180 && interval <= 300 ? 'OK' : 'OUT') : '',
      ];
    });
    doc.autoTable({
      startY: y, head: [['Dose', 'Time', 'Interval', 'Status']], body: epiRows,
      theme: 'grid', headStyles: { fillColor: [128, 90, 213], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ---- Team ----
  if (caseData.team) {
    const t = caseData.team;
    const teamRows = [];
    if (t.leader) teamRows.push(['Team Leader', t.leader]);
    if (t.airway) teamRows.push(['Airway', t.airway]);
    if (t.compressor?.length) teamRows.push(['Compressor(s)', t.compressor.join(', ')]);
    if (t.drugAdmin) teamRows.push(['Drug Admin', t.drugAdmin]);
    if (t.recorder) teamRows.push(['Recorder', t.recorder]);
    if (teamRows.length > 0) {
      sectionHeader('Team');
      doc.autoTable({
        startY: y, body: teamRows, theme: 'plain',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
        styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 4;
    }
  }

  // ---- Training Scorecard ----
  if (isTraining && events.length > 0) {
    sectionHeader('Training Performance Scorecard');
    const timerData = { ccf: caseData.ccf || 0, totalPauseTime: caseData.totalPauseTime || 0, elapsed: caseData.elapsed || 0 };
    const scores = calculateScore(events, timerData);
    const scoreRows = [];
    if (scores.timeToFirstShock) scoreRows.push(['Time to 1st Shock', scores.timeToFirstShock.label, scores.timeToFirstShock.target, scores.timeToFirstShock.rating.toUpperCase()]);
    if (scores.epiCompliance) scoreRows.push(['Epi Timing', scores.epiCompliance.label, scores.epiCompliance.target, scores.epiCompliance.rating.toUpperCase()]);
    if (scores.ccf) scoreRows.push(['CCF', scores.ccf.label, scores.ccf.target, scores.ccf.rating.toUpperCase()]);
    if (scores.handsOffTime) scoreRows.push(['Hands-off Time', scores.handsOffTime.label, scores.handsOffTime.target, scores.handsOffTime.rating.toUpperCase()]);
    scoreRows.push(['Overall Grade', scores.grade, '', '']);
    doc.autoTable({
      startY: y, head: [['Metric', 'Value', 'Target', 'Rating']], body: scoreRows,
      theme: 'grid', headStyles: { fillColor: [37, 99, 235], fontSize: 7 },
      styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // Recorder (ผู้จด) — from team data
  if (caseData.team?.recorder) {
    if (y > 265) { doc.addPage(); y = 15; }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`Recorder: ${caseData.team.recorder}`, 14, y);
    y += 6;
  }

  // =============== Footer + Watermark on ALL pages ===============
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (isTraining) {
      doc.setFontSize(45);
      doc.setTextColor(220, 230, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('TRAINING', pw / 2, ph / 2, { align: 'center', angle: 45 });
    }
    doc.setFontSize(6.5);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text(`ACLS EMR by JIA Trainer Center | Generated ${new Date().toLocaleString('en-US')} | Page ${i}/${pageCount}`, pw / 2, ph - 6, { align: 'center' });
  }

  const filename = `ACLS_${caseData.id || 'unknown'}_${(caseData.mode || 'clinical').toUpperCase()}.pdf`;
  doc.save(filename);
  return filename;
}
