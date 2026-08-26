import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import styles from '../info.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'Privacy Policy',
  description:
    'DocsWala processes files in your browser. This page explains what is and is not collected.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'Privacy', url: `${siteConfig.url}/privacy` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Last updated: August 2026.</p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Files you process in the tools</h2>
            <p className={styles.text}>
              Interactive DocsWala tools run in your web browser. Photos, PDFs, and other files you
              add in the tool interface are processed on your device. DocsWala does not store those
              files on a DocsWala server as part of using the public tools.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Accounts and personal profiles</h2>
            <p className={styles.text}>
              DocsWala does not require an account and does not ask you to create a user profile to
              use the tools.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Local storage</h2>
            <p className={styles.text}>
              Preferences such as colour theme may be saved in your browser&apos;s localStorage.
              That data stays on your device and is not synced to a DocsWala user database.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Analytics</h2>
            <p className={styles.text}>
              If Google Analytics is configured on the site, it may record page views and similar
              usage events. Analytics does not receive the contents of files you process in the
              tools.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Related pages</h2>
            <p className={styles.text}>
              See <Link href="/about">About DocsWala</Link> and the{' '}
              <Link href="/terms">Terms of Service</Link>. For how each tool works, see{' '}
              <Link href="/help">Help</Link>.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
