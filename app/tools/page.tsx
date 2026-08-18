import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import { getAllTools } from '@/config/tools/registry';
import { siteConfig } from '@/config/site';
import { ToolsDirectoryClient } from './ToolsDirectoryClient';
import { LoadingState } from '@/components/common/States/LoadingState';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: `All In-Browser File Utilities | ${siteConfig.name}`,
  description:
    'Browse our comprehensive catalog of 100% private, client-side tools for images, PDFs, converters, and developer utilities.',
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: `All In-Browser File Utilities | ${siteConfig.name}`,
    description:
      'Browse our comprehensive catalog of 100% private, client-side tools for images, PDFs, converters, and developer utilities.',
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

export default function ToolsPage() {
  const allTools = getAllTools();

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'All Tools', url: `${siteConfig.url}/tools` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbsJsonLd} />
      <div className={styles.pageContainer}>
        <Container size="lg">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>All Utilities</h1>
            <p className={styles.pageSubtitle}>
              Free, Fast, and privacy-friendly tools executing directly in your browser.
            </p>
          </div>

          {/* Client Interactive Directory */}
          <Suspense fallback={<LoadingState message="Loading utilities catalog..." />}>
            <ToolsDirectoryClient initialTools={allTools} />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
