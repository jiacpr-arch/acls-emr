// ACLS certificate template config.

export const certConfig = {
  id: 'acls-ilcor-2025',
  title: 'ACLS Certification (Online · Theory)',
  subtitle: 'Advanced Cardiovascular Life Support',
  issuingBody: 'ACLS per ILCOR 2025',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [220, 38, 38],    // #DC2626 — red
  validityMonths: 24,
  certIdPrefix: 'JIA-ACLS',
  // Seal shown on the certificate (PDF + on-screen card). Kept separate from
  // the Morroo brand logo used elsewhere in the app.
  logoUrl: '/images/acls-badge.png',
  // Online theory-only certification: earned by passing the knowledge gates
  // (pre-test, pre-course, post-test, EKG test). Hands-on skills are completed
  // separately at a training center.
  theoryOnly: true,
  theoryStatement: 'ผ่านการอบรมภาคทฤษฎี ACLS (ออนไลน์)',
  practicalRecommendation:
    'แนะนำให้เข้ารับการฝึกภาคปฏิบัติที่ศูนย์ฝึกใกล้บ้าน เพื่อรับใบรับรองฉบับสมบูรณ์',
};
