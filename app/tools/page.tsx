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
import { Bi } from '@/components/i18n/Bi';
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
            <h1 className={styles.pageTitle}>
              <Bi en="All DocsWala tools" hi="DocsWala के सभी टूल" />
            </h1>
            <p className={styles.pageSubtitle}>
              <Bi
                en={`${allTools.length} free tools that run in your browser. Search by name or filter by category. No account required.`}
                hi={`${allTools.length} मुफ़्त टूल आपके ब्राउज़र में चलते हैं। नाम से खोजें या श्रेणी चुनें। अकाउंट नहीं चाहिए।`}
              />
            </p>
          </div>

          <Suspense
            fallback={
              <LoadingState
                message={<Bi en="Loading utilities catalog..." hi="टूल की सूची लोड हो रही है..." />}
              />
            }
          >
            <ToolsDirectoryClient initialTools={allTools} />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
