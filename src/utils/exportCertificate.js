import jsPDF from 'jspdf';

// Renders a landscape A4 certificate using the bundled Helvetica font (ASCII only).
// The HTML view (in Certification.jsx) keeps full Thai for screen display; this
// PDF is the printable/shareable artifact.
export function exportCertificatePDF({ cert, certConfig }) {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();   // 297
  const ph = doc.internal.pageSize.getHeight();  // 210
  const brand = certConfig.brandColor || [37, 99, 235];

  // Outer border
  doc.setDrawColor(...brand);
  doc.setLineWidth(2);
  doc.rect(10, 10, pw - 20, ph - 20);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, pw - 28, ph - 28);

  // Top band
  doc.setFillColor(...brand);
  doc.rect(14, 14, pw - 28, 22, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(certConfig.title, pw / 2, 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(certConfig.subtitle, pw / 2, 33, { align: 'center' });

  // "This certifies that"
  doc.setTextColor(80);
  doc.setFontSize(11);
  doc.text('This is to certify that', pw / 2, 60, { align: 'center' });

  // Student name — large
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(cert.studentName || '-', pw / 2, 78, { align: 'center' });

  // Underline
  doc.setDrawColor(...brand);
  doc.setLineWidth(0.6);
  const nameWidth = Math.min(180, pw - 60);
  doc.line((pw - nameWidth) / 2, 82, (pw + nameWidth) / 2, 82);

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60);
  const body1 = `has successfully completed the ${certConfig.subtitle} course`;
  const body2 = `in accordance with the ${certConfig.issuingBody} curriculum.`;
  doc.text(body1, pw / 2, 96, { align: 'center' });
  doc.text(body2, pw / 2, 103, { align: 'center' });

  // Stats row
  const issued = cert.completedAt ? new Date(cert.completedAt) : new Date();
  const validity = certConfig.validityMonths || 24;
  const expires = new Date(issued);
  expires.setMonth(expires.getMonth() + validity);
  const fmt = (d) => d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Issued: ${fmt(issued)}`, pw * 0.30, 130, { align: 'center' });
  doc.text(`Valid through: ${fmt(expires)}`, pw * 0.70, 130, { align: 'center' });

  if (cert.postTestScore != null) {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Post-test score: ${cert.postTestScore}%`, pw / 2, 138, { align: 'center' });
  }

  // Signature lines
  const sigY = ph - 50;
  doc.setDrawColor(120);
  doc.setLineWidth(0.3);
  doc.line(pw * 0.18, sigY, pw * 0.38, sigY);
  doc.line(pw * 0.62, sigY, pw * 0.82, sigY);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Instructor', pw * 0.28, sigY + 5, { align: 'center' });
  doc.text(certConfig.centerName, pw * 0.72, sigY + 5, { align: 'center' });

  // Cert ID + center
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Certificate ID: ${cert.certId}`, pw / 2, ph - 22, { align: 'center' });
  doc.text(`${certConfig.centerName} - ${certConfig.centerUrl}`, pw / 2, ph - 17, { align: 'center' });

  const safeName = (cert.studentName || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fname = `${certConfig.certIdPrefix.toLowerCase()}_${safeName}_${cert.certId}.pdf`;
  doc.save(fname);
  return fname;
}
