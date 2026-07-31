// IV / IO Access & Drug Delivery certificate template config.
// PDF rendering uses jsPDF — mirrors bls-hcp/cert.js.

export const certConfig = {
  id: 'iv-io-skills-2025',
  title: 'IV / IO Access & Drug Delivery Certification',
  subtitle: 'การเปิดเส้นและให้ยาในภาวะวิกฤต',
  issuingBody: 'IV / IO Access & Drug Delivery per ILCOR 2025 principles',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [124, 58, 237],   // #7C3AED — violet
  validityMonths: 24,
  certIdPrefix: 'JIA-IV',
  theoryOnly: true,
  theoryStatement: 'ผ่านการอบรมภาคทฤษฎีหลักสูตรการเปิดเส้นและให้ยา IV/IO (ออนไลน์)',
  practicalRecommendation:
    'แนะนำให้เข้ารับการฝึกภาคปฏิบัติที่ศูนย์ฝึกใกล้บ้าน เพื่อฝึกเปิดเส้นและใส่ IO บนหุ่นจำลองภายใต้การดูแลของผู้สอน',
};
