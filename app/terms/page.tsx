import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import styles from '../info.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Service | DocsWala',
  description: 'DocsWala Terms of Service',
};

export default function TermsPage() {
  return (
    <Container size="lg">
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last updated: August 2026.</p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.text}>
              By accessing and using DocsWala, you agree to comply with and be bound by these
              Terms of Service.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Permitted Use</h2>
            <p className={styles.text}>
              You may use DocsWala for personal and commercial file transformation tasks in
              accordance with applicable laws. Since processing happens on your local device, you
              retain 100% full ownership and intellectual property of your files.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Disclaimer of Warranties</h2>
            <p className={styles.text}>
              DocsWala is provided on an &quot;as is&quot; and &quot;as available&quot; basis
              without warranties of any kind. Always maintain independent backups of critical
              documents.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
