export const siteConfig = {
  name: 'DocsWala',
  shortName: 'DocsWala',
  oneLiner:
    'DocsWala is a free, no-signup website of in-browser tools for compressing and cropping photos, merging and converting PDFs, generating shop QR codes, formatting text, running developer utilities, and calculating GST, EMI, SIP, and related figures.',
  description:
    'Free in-browser tools for photos, PDFs, QR codes, text, developer utilities, and GST/EMI/SIP calculators. No sign-up. Files stay on your device.',
  url: 'https://docswala.net',
  creator: 'DocsWala Team',
  links: {
    docs: '/about',
    help: '/help',
    privacy: '/privacy',
    terms: '/terms',
  },
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-7V2289REP4',
  privacyGuarantee: {
    title: '100% Free & No Sign-up Required',
    description:
      'All tools work instantly inside your browser. No account needed, no daily limits, no watermarks, and your personal documents never get uploaded to any server.',
  },
};
