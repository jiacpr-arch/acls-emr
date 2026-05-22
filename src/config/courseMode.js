// Build-time course mode flag. Set VITE_COURSE_MODE=bls on the bls.morroo.com Vercel project.
// Defaults to 'acls' so the existing acls.morroo.com deploy keeps working unchanged.
const MODE = import.meta.env.VITE_COURSE_MODE === 'bls' ? 'bls' : 'acls';

export const COURSE_MODE = MODE;
export const IS_BLS = MODE === 'bls';
export const IS_ACLS = MODE === 'acls';

export const courseMeta = IS_BLS
  ? {
      id: 'bls-hcp',
      title: 'BLS for Healthcare Providers',
      titleTh: 'BLS สำหรับบุคลากรทางการแพทย์',
      shortName: 'BLS',
      standard: 'AHA-BLS-HCP-2020',
      themeColor: '#0EA5E9',
      passingScore: { lesson: 75, postTest: 84 },
      certTemplate: 'bls-hcp-aha-2020',
      certValidityMonths: 24,
      featuredVideo: {
        platform: 'youtube',
        videoId: 'g3_0kTW6Me8',
        title: 'BLS for Healthcare Providers — วิดีโอเต็มหลักสูตร',
        description: 'ดูวิดีโอนี้ก่อนเริ่มอ่านบทเรียน',
      },
    }
  : {
      id: 'als',
      title: 'ACLS Provider',
      titleTh: 'หลักสูตร ACLS',
      shortName: 'ACLS',
      standard: 'AHA-ACLS-2020',
      themeColor: '#DC2626',
      passingScore: { lesson: 70, postTest: 85 },
      certTemplate: 'acls-aha-2020',
      certValidityMonths: 24,
      featuredVideo: null,
    };
