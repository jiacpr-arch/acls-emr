// Defibrillation & Electrical Therapy certificate template config.
// PDF rendering uses jsPDF — mirrors bls-hcp/cert.js.

export const certConfig = {
  id: 'defib-skills-2025',
  title: 'Defibrillation & Electrical Therapy Certification',
  subtitle: 'การช็อกไฟฟ้าหัวใจและการรักษาด้วยไฟฟ้า',
  issuingBody: 'Defibrillation & Electrical Therapy per ILCOR 2025 principles',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [217, 119, 6],   // #D97706 — amber
  validityMonths: 24,
  certIdPrefix: 'JIA-DF',
  theoryOnly: true,
  theoryStatement: 'ผ่านการอบรมภาคทฤษฎีหลักสูตรการช็อกไฟฟ้าหัวใจ (ออนไลน์)',
  practicalRecommendation:
    'แนะนำให้เข้ารับการฝึกภาคปฏิบัติที่ศูนย์ฝึกใกล้บ้าน เพื่อฝึกใช้เครื่อง defibrillator/manual defib จริงภายใต้การดูแลของผู้สอน',
};
