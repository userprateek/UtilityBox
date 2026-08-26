import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import { getAllTools } from '@/config/tools/registry';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { ToolsDirectoryClient } from './ToolsDirectoryClient';
import { LoadingState } from '@/components/common/States/LoadingState';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/lib/seo/schema';
import styles from './page.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'All DocsWala tools',
  description:
    'Directory of free in-browser DocsWala tools for images, PDFs, QR codes, text, developer utilities, and calculators.',
  path: '/tools',
});

export default function ToolsPage() {
  const allTools = getAllTools();

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'All Tools', url: `${siteConfig.url}/tools` },
  ]);
  const itemListJsonLd = generateItemListJsonLd(
    allTools,
    'DocsWala tools',
    'Public in-browser tools on DocsWala.'
  );

  return (
    <>
      <JsonLd schema={breadcrumbsJsonLd} />
      <JsonLd schema={itemListJsonLd} />
      <div className={styles.pageContainer}>
        <Container size="lg">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>All DocsWala tools</h1>
            <p className={styles.pageSubtitle}>
              {allTools.length} free tools that run in your browser. Search by name or filter by
              category. No account required.
            </p>
          </div>

          <Suspense fallback={<LoadingState message="Loading utilities catalog..." />}>
            <ToolsDirectoryClient initialTools={allTools} />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
