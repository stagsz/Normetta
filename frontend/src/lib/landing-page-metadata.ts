// landing-page-metadata.ts
// This file exports static metadata for the landing page.
// It is imported by page.tsx to keep the component clean.

export const landingPageMetadata = {
  title: {
    default: 'Normetta — ISO 9001 Quality Management & Audit Platform',
    template: '%s | Normetta',
  },
  description: 'Streamline ISO 9001:2015 compliance with Normetta. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
  keywords: [
    'ISO 9001',
    'quality management',
    'audit management',
    'QMS software',
    'self-assessment',
    'non-conformity tracking',
    'CAPA',
    'compliance platform',
    'SME quality management',
  ],
  authors: [{ name: 'Normetta' }],
  creator: 'Normetta',
  publisher: 'Normetta',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://normetta.com/',
    siteName: 'Normetta',
    title: 'Normetta — ISO 9001 Quality Management & Audit Platform',
    description: 'Streamline ISO 9001:2015 compliance with Normetta. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
    images: [
      {
        url: 'https://normetta.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Normetta — ISO 9001 Quality Management Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Normetta — ISO 9001 Quality Management & Audit Platform',
    description: 'Streamline ISO 9001:2015 compliance with Normetta. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
    images: ['https://normetta.com/og-image.png'],
    creator: '@normetta',
  },
  alternates: {
    canonical: 'https://normetta.com/',
  },
  other: {
    'theme-color': '#0f766e',
  },
};

export const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Normetta',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Cloud',
  offers: {
    '@type': 'Offer',
    name: 'Starter Plan',
    price: '49.00',
    priceCurrency: 'EUR',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: 49.00,
      priceCurrency: 'EUR',
      billingDuration: 'P1M',
    },
    availability: 'https://schema.org/InStock',
    url: 'https://normetta.com/register',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
  description: 'Streamline ISO 9001:2015 compliance with Normetta. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
  featureList: [
    'Self-Assessment Management',
    'Audit Planning & Execution',
    'Non-Conformity Tracking',
    'Corrective Actions (CAPA)',
    'Reporting & Analytics',
    'Role-Based Access Control',
  ],
  screenshot: 'https://normetta.com/screenshot.png',
  logo: 'https://normetta.com/logo.png',
  url: 'https://normetta.com/',
  publisher: {
    '@type': 'Organization',
    name: 'Normetta',
    url: 'https://normetta.com/',
    logo: {
      '@type': 'ImageObject',
      url: 'https://normetta.com/logo.png',
    },
  },
  potentialAction: {
    '@type': 'UseAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://normetta.com/register',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/IOSPlatform',
        'http://schema.org/AndroidPlatform',
      ],
    },
    name: 'Start Free Trial',
  },
};
