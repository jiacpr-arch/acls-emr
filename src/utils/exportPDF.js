import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateScore } from './scoring';

export function exportCasePDF(caseData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const isTraining = caseData.mode === 'training';
  let y = 15;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ACLS Record Report', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Case ID: ${caseData.id}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  const modeColor = isTraining ? [37, 99, 235] : [220, 38, 38];
  doc.setTextColor(...modeColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Mode: ${caseData.mode?.toUpperCase() || 'CLINICAL'}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Case Summary
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Case Summary', 14, y);
  y += 6;

  const startTime = caseData.startTime ? new Date(caseData.startTime) : null;
  const endTime = caseData.endTime ? new Date(caseData.endTime) : null;
  const duration = startTime && endTime
    ? Math.floor((endTime - startTime) / 1000)
    : 0;
  const durationStr = duration > 0
    ? `${Math.floor(duration / 60)}m ${duration % 60}s`
    : 'Ongoing';

  const summaryData = [
    ['Start Time', startTime ? startTime.toLocaleString('th-TH') : '-'],
    ['End Time', endTime ? endTime.toLocaleString('th-TH') : '-'],
    ['Duration', durationStr],
    ['Outcome', caseData.outcome || '-'],
  ];

  // Patient info if available
  if (caseData.patient) {
    const p = caseData.patient;
    if (p.name) summaryData.push(['Patient Name', p.name]);
    if (p.hn) summaryData.push(['HN', p.hn]);
    if (p.age) summaryData.push(['Age', `${p.age}`]);
    if (p.weight) summaryData.push(['Weight', `${p.weight} kg`]);
    if (p.gender) summaryData.push(['Gender', p.gender]);
    if (p.initialRhythm) summaryData.push(['Initial Rhythm', p.initialRhythm]);
    if (p.location) summaryData.push(['Location', p.location]);
    summaryData.push(['Witnessed', p.witnessed ? 'Yes' : 'No']);
    summaryData.push(['Bystander CPR', p.bystanderCPR ? 'Yes' : 'No']);
  }

  doc.autoTable({
    startY: y,
    body: summaryData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // CPR Quality Metrics
  if (caseData.ccf !== undefined || caseData.shockCount !== undefined) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('CPR Quality Metrics', 14, y);
    y += 2;

    const fmtTime = (s) => s > 0 ? `${Math.floor(s / 60)}m ${s % 60}s` : '0s';
    const metricsData = [
      ['CCF', `${caseData.ccf || 0}%`],
      ['Total CPR Time', fmtTime(caseData.totalCPRTime || 0)],
      ['Total Pause Time', fmtTime(caseData.totalPauseTime || 0)],
      ['CPR Cycles', `${caseData.cycleNumber || 0}`],
      ['Shocks Delivered', `${caseData.shockCount || 0}`],
    ];

    doc.autoTable({
      startY: y,
      body: metricsData,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 'auto' },
      },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Event Timeline
  const events = caseData.events || [];
  if (events.length > 0) {
    if (y > 230) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Event Timeline', 14, y);
    y += 2;

    const eventRows = [...events].reverse().map(ev => {
      const mins = Math.floor((ev.elapsed || 0) / 60);
      const secs = (ev.elapsed || 0) % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const clockStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('th-TH') : '';
      return [timeStr, clockStr, ev.category || '', ev.type || ''];
    });

    doc.autoTable({
      startY: y,
      head: [['Elapsed', 'Clock', 'Category', 'Event']],
      body: eventRows,
      theme: 'striped',
      headStyles: { fillColor: isTraining ? [37, 99, 235] : [220, 38, 38], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Drug Timing Analysis
  const drugEvents = events.filter(e => e.category === 'drug');
  const epiEvents = drugEvents
    .filter(e => e.type?.includes('Epinephrine'))
    .sort((a, b) => (a.elapsed || 0) - (b.elapsed || 0));

  if (epiEvents.length >= 2) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Drug Timing Analysis', 14, y);
    y += 2;

    const epiRows = [];
    for (let i = 0; i < epiEvents.length; i++) {
      const t = epiEvents[i].elapsed || 0;
      const interval = i > 0 ? t - (epiEvents[i - 1].elapsed || 0) : '-';
      const intervalStr = typeof interval === 'number' ? `${Math.floor(interval / 60)}m ${interval % 60}s` : '-';
      const ok = typeof interval === 'number' ? (interval >= 180 && interval <= 300 ? 'OK' : 'OUT') : '';
      epiRows.push([
        `Epi #${i + 1}`,
        `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`,
        intervalStr,
        ok,
      ]);
    }

    doc.autoTable({
      startY: y,
      head: [['Dose', 'Time', 'Interval', 'Status']],
      body: epiRows,
      theme: 'striped',
      headStyles: { fillColor: [128, 90, 213], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // EtCO₂ Readings
  if (caseData.etco2Readings?.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('EtCO\u2082 Readings', 14, y);
    y += 2;

    const etcoRows = caseData.etco2Readings.map(r => {
      const t = r.elapsed || 0;
      const alert = r.value < 10 ? 'LOW' : r.value > 20 ? 'ROSC?' : '';
      return [
        `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`,
        `${r.value} mmHg`,
        r.context || '',
        alert,
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['Time', 'Value', 'Context', 'Alert']],
      body: etcoRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Team info if available
  if (caseData.team) {
    const t = caseData.team;
    const teamRows = [];
    if (t.leader) teamRows.push(['Team Leader', t.leader]);
    if (t.airway) teamRows.push(['Airway', t.airway]);
    if (t.compressor?.length) teamRows.push(['Compressor(s)', t.compressor.join(', ')]);
    if (t.drugAdmin) teamRows.push(['Drug Admin', t.drugAdmin]);
    if (t.recorder) teamRows.push(['Recorder', t.recorder]);

    if (teamRows.length > 0) {
      if (y > 250) { doc.addPage(); y = 15; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Team', 14, y);
      y += 2;

      doc.autoTable({
        startY: y,
        body: teamRows,
        theme: 'plain',
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
        },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // Training Scorecard
  if (isTraining && events.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Training Performance Scorecard', 14, y);
    y += 2;

    const timerData = {
      ccf: caseData.ccf || 0,
      totalPauseTime: caseData.totalPauseTime || 0,
      elapsed: caseData.elapsed || 0,
    };
    const scores = calculateScore(events, timerData);

    const scoreRows = [];
    if (scores.timeToFirstShock) scoreRows.push(['Time to 1st Shock', scores.timeToFirstShock.label, scores.timeToFirstShock.target, scores.timeToFirstShock.rating.toUpperCase()]);
    if (scores.epiCompliance) scoreRows.push(['Epi Timing', scores.epiCompliance.label, scores.epiCompliance.target, scores.epiCompliance.rating.toUpperCase()]);
    if (scores.ccf) scoreRows.push(['CCF', scores.ccf.label, scores.ccf.target, scores.ccf.rating.toUpperCase()]);
    if (scores.handsOffTime) scoreRows.push(['Hands-off Time', scores.handsOffTime.label, scores.handsOffTime.target, scores.handsOffTime.rating.toUpperCase()]);
    scoreRows.push(['Overall Grade', scores.grade, '', '']);

    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value', 'Target', 'Rating']],
      body: scoreRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Footer + Training watermark
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Training watermark
    if (isTraining) {
      doc.setFontSize(50);
      doc.setTextColor(200, 220, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('TRAINING', pageWidth / 2, 150, { align: 'center', angle: 45 });
    }

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `ACLS EMR — Generated ${new Date().toLocaleString('th-TH')} — Page ${i}/${pageCount}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Save
  const filename = `ACLS_Record_${caseData.id || 'unknown'}.pdf`;
  doc.save(filename);
  return filename;
}
