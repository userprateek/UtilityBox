import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import styles from '../info.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'Terms of Service',
  description: 'Terms for using the free DocsWala in-browser tools.',
  path: '/terms',
});

export default function TermsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'Terms', url: `${siteConfig.url}/terms` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last updated: August 2026.</p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.text}>
              By accessing and using DocsWala, you agree to comply with and be bound by these Terms
              of Service.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Permitted Use</h2>
            <p className={styles.text}>
              You may use DocsWala for personal and commercial file and calculation tasks in
              accordance with applicable laws. Processing happens on your device; you keep
              ownership of your files.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Disclaimer of Warranties</h2>
            <p className={styles.text}>
              DocsWala is provided on an &quot;as is&quot; and &quot;as available&quot; basis
              without warranties of any kind. Always keep independent backups of important
              documents.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Related pages</h2>
            <p className={styles.text}>
              See <Link href="/about">About DocsWala</Link> and the{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
