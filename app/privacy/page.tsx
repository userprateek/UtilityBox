import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import styles from '../info.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy | DocsWala',
  description: 'DocsWala Privacy Policy: We do not store, view, or transmit your files.',
};

export default function PrivacyPage() {
  return (
    <Container size="lg">
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Last updated: August 2026. Simple, transparent, and uncompromising privacy.
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. We Do Not Collect Your Files</h2>
            <p className={styles.text}>
              All file operations (compression, conversion, resizing, merging) are performed
              entirely client-side inside your web browser. Your files are processed in local memory
              and are never uploaded to or stored on any server.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Zero Personal Data Retention</h2>
            <p className={styles.text}>
              DocsWala does not require an account, does not ask for personal information, and does
              not build identifiable user profiles.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Local Storage</h2>
            <p className={styles.text}>
              Any user preferences (such as quality settings or UI themes) are saved strictly in
              your browser&apos;s localStorage and are never synced to any remote database.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
