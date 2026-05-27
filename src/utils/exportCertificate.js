import jsPDF from 'jspdf';
import { registerPDFFonts, PDF_FONT } from '../assets/fonts/registerFonts.js';
import { sanitisePDFText as S } from './pdfText.js';

registerPDFFonts();

const LOGO_URL = '/images/logo-morroo.png';

// Loads an image from a URL and returns its dataURL + natural dimensions.
// Returns null if the file is missing or fails to load, so callers can skip
// the logo gracefully without breaking certificate generation.
async function loadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
    if (!dims || !dims.w || !dims.h) return null;
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

// Renders a landscape A4 certificate using the embedded Sarabun font so Thai
// student names (and any Thai config text) render correctly. The HTML view in
// Certification.jsx is the on-screen version; this PDF is the printable artifact.
export async function exportCertificatePDF({ cert, certConfig }) {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFont(PDF_FONT, 'normal');
  const pw = doc.internal.pageSize.getWidth();   // 297
  const ph = doc.internal.pageSize.getHeight();  // 210
  const brand = certConfig.brandColor || [37, 99, 235];
  const cx = pw / 2;

  // Outer border
  doc.setDrawColor(...brand);
  doc.setLineWidth(2);
  doc.rect(10, 10, pw - 20, ph - 20);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, pw - 28, ph - 28);

  const logo = await loadImage(certConfig.logoUrl || LOGO_URL);
  const drawLogo = (top, boxW, boxH) => {
    if (!logo) return;
    let w = boxW, h = (logo.h / logo.w) * w;
    if (h > boxH) { h = boxH; w = (logo.w / logo.h) * h; }
    try {
      doc.addImage(logo.dataUrl, 'PNG', (pw - w) / 2, top, w, h);
    } catch { /* ignore malformed image, certificate still renders */ }
  };

  // Header — two presentations. The theory-only (online) course uses a
  // band-less layout with the logo as the hero; other courses keep the
  // filled top band. `certifyY` is where the shared body begins.
  let certifyY;
  if (certConfig.theoryOnly) {
    drawLogo(18, 78, 40);
    doc.setTextColor(...brand);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(23);
    doc.text(certConfig.title, cx, 67, { align: 'center' });
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(certConfig.subtitle, cx, 74, { align: 'center' });
    if (certConfig.onlineTag) {
      doc.setFont(PDF_FONT, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...brand);
      doc.text(certConfig.onlineTag.toUpperCase(), cx, 82, { align: 'center' });
    }
    certifyY = 95;
  } else {
    doc.setFillColor(...brand);
    doc.rect(14, 14, pw - 28, 22, 'F');
    doc.setTextColor(255);
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(20);
    doc.text(certConfig.title, cx, 26, { align: 'center' });
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(10);
    doc.text(certConfig.subtitle, cx, 33, { align: 'center' });
    drawLogo(40, 64, 34);
    certifyY = 82;
  }

  // "This certifies that"
  doc.setFont(PDF_FONT, 'normal');
  doc.setTextColor(80);
  doc.setFontSize(11);
  doc.text('This is to certify that', cx, certifyY, { align: 'center' });

  // Student name — large
  const nameY = certifyY + 16;
  doc.setTextColor(20);
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(28);
  doc.text(S(cert.studentName) || '-', cx, nameY, { align: 'center' });

  // Underline
  doc.setDrawColor(...brand);
  doc.setLineWidth(0.6);
  const nameWidth = Math.min(180, pw - 60);
  doc.line((pw - nameWidth) / 2, nameY + 4, (pw + nameWidth) / 2, nameY + 4);

  // Body text
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60);
  const body1 = `has successfully completed the ${certConfig.subtitle} course`;
  const body2 = `in accordance with the ${certConfig.issuingBody} curriculum.`;
  doc.text(body1, cx, nameY + 16, { align: 'center' });
  doc.text(body2, cx, nameY + 23, { align: 'center' });

  // Stats row
  const issued = cert.completedAt ? new Date(cert.completedAt) : new Date();
  const validity = certConfig.validityMonths || 24;
  const expires = new Date(issued);
  expires.setMonth(expires.getMonth() + validity);
  const fmt = (d) => d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

  const datesY = nameY + 32;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Issued: ${fmt(issued)}`, pw * 0.30, datesY, { align: 'center' });
  doc.text(`Valid through: ${fmt(expires)}`, pw * 0.70, datesY, { align: 'center' });

  if (cert.postTestScore != null) {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Post-test score: ${cert.postTestScore}%`, cx, datesY + 8, { align: 'center' });
  }

  // Disclaimer for theory-only certificates
  if (certConfig.theoryOnly && Array.isArray(certConfig.disclaimer)) {
    doc.setFont(PDF_FONT, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...brand);
    let dy = datesY + 21;
    certConfig.disclaimer.forEach((line) => {
      doc.text(line, cx, dy, { align: 'center' });
      dy += 5.5;
    });
  }

  // Signature lines
  const sigY = certConfig.theoryOnly ? ph - 34 : ph - 50;
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
  doc.text(`Certificate ID: ${cert.certId}`, cx, ph - 22, { align: 'center' });
  doc.text(`${certConfig.centerName} - ${certConfig.centerUrl}`, cx, ph - 17, { align: 'center' });

  const safeName = (cert.studentName || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fname = `${certConfig.certIdPrefix.toLowerCase()}_${safeName}_${cert.certId}.pdf`;
  doc.save(fname);
  return fname;
}
