import type { Metadata } from 'next';
import { landingPageMetadata, jsonLdStructuredData } from '@/lib/landing-page-metadata';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = landingPageMetadata as Metadata;

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
      />
      <LandingPage />
    </>
  );
}
