// Airway Management certificate template config.
// PDF rendering uses jsPDF — mirrors bls-hcp/cert.js.

export const certConfig = {
  id: 'airway-skills-2025',
  title: 'Airway Management Certification',
  subtitle: 'การจัดการทางเดินหายใจ',
  issuingBody: 'Airway Management per ILCOR 2025 principles',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [5, 150, 105],   // #059669 — emerald
  validityMonths: 24,
  certIdPrefix: 'JIA-AW',
  // Online theory-only certification: earned by passing the knowledge gates
  // (pre-test, pre-course, post-test). Hands-on skills are completed
  // separately at a training center — same model as the ACLS theory cert.
  theoryOnly: true,
  theoryStatement: 'ผ่านการอบรมภาคทฤษฎีหลักสูตรการจัดการทางเดินหายใจ (ออนไลน์)',
  practicalRecommendation:
    'แนะนำให้เข้ารับการฝึกภาคปฏิบัติที่ศูนย์ฝึกใกล้บ้าน เพื่อฝึกใช้อุปกรณ์จริงภายใต้การดูแลของผู้สอน',
};
