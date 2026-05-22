// BLS-HCP certificate template config.
// PDF rendering uses jsPDF (built-in Helvetica) so all strings are ASCII-safe.

export const certConfig = {
  id: 'bls-hcp-aha-2020',
  title: 'BLS Provider Certification',
  subtitle: 'Basic Life Support for Healthcare Providers',
  issuingBody: 'AHA BLS-HCP 2020',
  centerName: 'JIA Trainer Center',
  centerUrl: 'jia1669.com',
  brandColor: [14, 165, 233],   // #0EA5E9 — sky blue
  validityMonths: 24,
  certIdPrefix: 'JIA-BLS',
};
