// BLS-HCP certificate template config.
// PDF rendering uses jsPDF (built-in Helvetica) so all strings are ASCII-safe.

export const certConfig = {
  id: 'bls-hcp-ilcor-2025',
  title: 'BLS Provider Certification',
  subtitle: 'Basic Life Support for Healthcare Providers',
  issuingBody: 'BLS per ILCOR 2025',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [14, 165, 233],   // #0EA5E9 — sky blue
  validityMonths: 24,
  certIdPrefix: 'JIA-BLS',
  // ฉบับสมบูรณ์ — เมื่อระบบเช็คชื่อยืนยันว่าเข้าครบทุกฐาน + สอบปฏิบัติผ่าน
  // (ฟอนต์ Sarabun ฝังใน PDF แล้ว ข้อความไทย render ได้ — คอมเมนต์บนหัวไฟล์
  // เรื่อง ASCII เป็นของ pipeline เก่า)
  fullStatement: 'ผ่านการอบรมภาคทฤษฎี (ออนไลน์) และภาคปฏิบัติครบถ้วน',
};
