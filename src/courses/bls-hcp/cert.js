// BLS-HCP certificate template config.

export const certConfig = {
  id: 'bls-hcp-ilcor-2025',
  title: 'BLS Provider Certification',
  subtitle: 'Basic Life Support for Healthcare Providers',
  issuingBody: 'BLS per ILCOR 2025',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  logoUrl: '/images/logo-bls.png',
  brandColor: [14, 165, 233],   // #0EA5E9 — sky blue
  validityMonths: 24,
  certIdPrefix: 'JIA-BLS',
  // Online theory-only course: render the band-less layout and a disclaimer
  // directing students to in-person practical training for full certification.
  theoryOnly: true,
  onlineTag: 'Online Theory Course',
  disclaimer: [
    'This certificate recognises completion of the online theory component only.',
    'For full BLS certification, please attend in-person hands-on skills training at JIA Trainer Center.',
  ],
};
