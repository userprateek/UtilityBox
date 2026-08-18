import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import styles from '../info.module.scss';

export const metadata: Metadata = {
  title: 'About UtilityBox - Fast, Private, In-Browser Utilities',
  description:
    'Learn about UtilityBox, our architecture, and why we believe privacy-first browser tools are the future of file processing.',
};

export default function AboutPage() {
  return (
    <Container size="lg">
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>About UtilityBox</h1>
          <p className={styles.subtitle}>
            A modern, privacy-focused alternative to traditional cloud file conversion websites.
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>The Privacy Problem</h2>
            <p className={styles.text}>
              Every day, millions of people upload personal tax records, contracts, identity
              documents, and private photos to online conversion websites. Most of these services
              transfer your files to uncontrolled remote servers where data may be retained, logged,
              or exposed to security breaches.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>The UtilityBox Solution</h2>
            <p className={styles.text}>
              UtilityBox is built on modern Web APIs, WebAssembly (WASM), and Canvas pipelines.
              Instead of sending your data to our servers, we bring the processing engine directly
              into your browser. Your files are manipulated entirely on your local machine and never
              leave your device.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Core Principles</h2>
            <ul className={styles.list}>
              <li>
                <strong>Zero Cloud Uploads:</strong> Files stay in browser sandbox memory.
              </li>
              <li>
                <strong>Blazing Fast:</strong> No network bottleneck or upload waiting time.
              </li>
              <li>
                <strong>No Artificial Paywalls:</strong> Free from arbitrary file size barriers.
              </li>
              <li>
                <strong>Clean & Modern:</strong> No intrusive popups, deceptive download buttons, or
                spam.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
}
