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
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(20);
  doc.text(certConfig.title, pw / 2, 26, { align: 'center' });
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(10);
  doc.text(certConfig.subtitle, pw / 2, 33, { align: 'center' });

  // Center logo (skipped gracefully if the asset is not present)
  const logo = await loadImage(certConfig.logoUrl || LOGO_URL);
  if (logo) {
    const boxW = 60, boxH = 26;
    let w = boxW, h = (logo.h / logo.w) * w;
    if (h > boxH) { h = boxH; w = (logo.w / logo.h) * h; }
    try {
      doc.addImage(logo.dataUrl, 'PNG', (pw - w) / 2, 37, w, h);
    } catch { /* ignore malformed image, certificate still renders */ }
  }

  // "This certifies that"
  doc.setTextColor(80);
  doc.setFontSize(11);
  doc.text('This is to certify that', pw / 2, 70, { align: 'center' });

  // Student name — large
  doc.setTextColor(20);
  doc.setFont(PDF_FONT, 'bold');
  doc.setFontSize(28);
  doc.text(S(cert.studentName) || '-', pw / 2, 86, { align: 'center' });

  // Underline
  doc.setDrawColor(...brand);
  doc.setLineWidth(0.6);
  const nameWidth = Math.min(180, pw - 60);
  doc.line((pw - nameWidth) / 2, 90, (pw + nameWidth) / 2, 90);

  // Body text
  doc.setFont(PDF_FONT, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60);
  const body1 = certConfig.theoryOnly
    ? `has successfully completed the online theoretical portion of the ${certConfig.subtitle} course`
    : `has successfully completed the ${certConfig.subtitle} course`;
  const body2 = `in accordance with the ${certConfig.issuingBody} curriculum.`;
  doc.text(body1, pw / 2, 102, { align: 'center' });
  doc.text(body2, pw / 2, 109, { align: 'center' });

  // Theory statement (Thai) — rendered with the embedded Sarabun font.
  if (certConfig.theoryOnly && certConfig.theoryStatement) {
    doc.setFont(PDF_FONT, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...brand);
    doc.text(S(certConfig.theoryStatement), pw / 2, 118, { align: 'center' });
    doc.setFont(PDF_FONT, 'normal');
  }

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

  const scoreParts = [];
  if (cert.preTestScore != null) scoreParts.push(`Pre-test ${cert.preTestScore}%`);
  if (cert.postTestScore != null) scoreParts.push(`Post-test ${cert.postTestScore}%`);
  if (cert.ekgPassed) scoreParts.push('EKG test passed');
  if (scoreParts.length) {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(scoreParts.join('     '), pw / 2, 138, { align: 'center' });
  }

  // Practical-training recommendation (Thai) for online theory certificates.
  if (certConfig.theoryOnly && certConfig.practicalRecommendation) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(S(certConfig.practicalRecommendation), pw / 2, 146, { align: 'center' });
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
